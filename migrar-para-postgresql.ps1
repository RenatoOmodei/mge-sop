param(
  [string]$HostName = "127.0.0.1",
  [int]$Port = 5432,
  [string]$AdminUser = "postgres",
  [string]$DatabaseName = "mge_sop",
  [string]$AppUser = "mge_sop_app",
  [string]$PsqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe",
  [string]$CreatedbPath = "C:\Program Files\PostgreSQL\15\bin\createdb.exe"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$SchemaFile = Join-Path $Root "postgresql\schema.sql"
$ExportFile = Join-Path $Root "data\postgres-export\mge-sop-data.sql"
$EnvFile = Join-Path $Root "data\postgresql.env"
$NodeExe = Join-Path $Root "runtime\node.exe"
$SqliteFile = Join-Path $Root "data\erp.sqlite"
$BackupDir = Join-Path $Root "data\backups"

function Convert-SecureStringToPlainText {
  param([securestring]$SecureValue)
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Quote-SqlLiteral {
  param([string]$Value)
  return "'" + $Value.Replace("'", "''") + "'"
}

function Escape-DatabaseUrlPart {
  param([string]$Value)
  return [System.Uri]::EscapeDataString($Value)
}

if (!(Test-Path -LiteralPath $PsqlPath)) {
  throw "psql.exe nao encontrado em: $PsqlPath"
}
if (!(Test-Path -LiteralPath $CreatedbPath)) {
  throw "createdb.exe nao encontrado em: $CreatedbPath"
}
if (!(Test-Path -LiteralPath $SchemaFile)) {
  throw "Schema PostgreSQL nao encontrado em: $SchemaFile"
}
if (!(Test-Path -LiteralPath $NodeExe)) {
  $NodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  if (!$NodeCommand) {
    throw "Node.js nao encontrado."
  }
  $NodeExe = $NodeCommand.Source
}

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
if (Test-Path -LiteralPath $SqliteFile) {
  $Stamp = Get-Date -Format "yyyy-MM-ddTHH-mm-ss"
  Copy-Item -LiteralPath $SqliteFile -Destination (Join-Path $BackupDir "pre-postgresql-$Stamp.sqlite") -Force
}

$AdminPassword = Convert-SecureStringToPlainText (Read-Host "Senha do usuario PostgreSQL '$AdminUser'" -AsSecureString)
$AppPassword = Convert-SecureStringToPlainText (Read-Host "Senha do usuario '$AppUser' que sera usado pelo S&OP" -AsSecureString)

try {
  $env:PGPASSWORD = $AdminPassword

  $QuotedAppPassword = Quote-SqlLiteral $AppPassword
  $RoleSql = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$AppUser') THEN
    CREATE ROLE $AppUser LOGIN PASSWORD $QuotedAppPassword;
  ELSE
    ALTER ROLE $AppUser WITH LOGIN PASSWORD $QuotedAppPassword;
  END IF;
END
`$`$;
"@

  & $PsqlPath -h $HostName -p $Port -U $AdminUser -d postgres -v ON_ERROR_STOP=1 -c $RoleSql
  if ($LASTEXITCODE -ne 0) { throw "Falha ao criar/atualizar usuario $AppUser." }

  $DbExists = & $PsqlPath -h $HostName -p $Port -U $AdminUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DatabaseName';"
  if ($LASTEXITCODE -ne 0) { throw "Falha ao verificar banco $DatabaseName." }
  if ([string]::IsNullOrWhiteSpace($DbExists)) {
    & $CreatedbPath -h $HostName -p $Port -U $AdminUser -O $AppUser $DatabaseName
    if ($LASTEXITCODE -ne 0) { throw "Falha ao criar banco $DatabaseName." }
  }

  & $PsqlPath -h $HostName -p $Port -U $AdminUser -d $DatabaseName -v ON_ERROR_STOP=1 -c "GRANT ALL PRIVILEGES ON DATABASE $DatabaseName TO $AppUser;"
  if ($LASTEXITCODE -ne 0) { throw "Falha ao liberar privilegios no banco $DatabaseName." }

  $env:PGPASSWORD = $AppPassword
  & $PsqlPath -h $HostName -p $Port -U $AppUser -d $DatabaseName -v ON_ERROR_STOP=1 -f $SchemaFile
  if ($LASTEXITCODE -ne 0) { throw "Falha ao aplicar schema PostgreSQL." }

  & $NodeExe (Join-Path $Root "scripts\export-sqlite-to-postgres.js")
  if ($LASTEXITCODE -ne 0) { throw "Falha ao exportar SQLite." }
  if (!(Test-Path -LiteralPath $ExportFile)) { throw "Arquivo exportado nao encontrado: $ExportFile" }

  & $PsqlPath -h $HostName -p $Port -U $AppUser -d $DatabaseName -v ON_ERROR_STOP=1 -f $ExportFile
  if ($LASTEXITCODE -ne 0) { throw "Falha ao importar dados no PostgreSQL." }

  $DatabaseUrlUser = Escape-DatabaseUrlPart $AppUser
  $DatabaseUrlPassword = Escape-DatabaseUrlPart $AppPassword
  $DatabaseUrlName = Escape-DatabaseUrlPart $DatabaseName
  $DatabaseUrl = "postgres://${DatabaseUrlUser}:${DatabaseUrlPassword}@$HostName`:$Port/$DatabaseUrlName"
  New-Item -ItemType Directory -Path (Split-Path -Parent $EnvFile) -Force | Out-Null
  Set-Content -LiteralPath $EnvFile -Encoding ASCII -Value @(
    "DB_PROVIDER=postgres",
    "DATABASE_URL=$DatabaseUrl"
  )

  Write-Host ""
  Write-Host "Migracao concluida."
  Write-Host "Arquivo de conexao criado em: $EnvFile"
  Write-Host "Para iniciar usando PostgreSQL, execute: iniciar-servidor-postgresql.cmd"
  Write-Host ""
} finally {
  Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
