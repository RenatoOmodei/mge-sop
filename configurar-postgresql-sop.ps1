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

if (!(Test-Path -LiteralPath $PsqlPath)) {
  throw "psql.exe nao encontrado em: $PsqlPath"
}

if (!(Test-Path -LiteralPath $CreatedbPath)) {
  throw "createdb.exe nao encontrado em: $CreatedbPath"
}

if (!(Test-Path -LiteralPath $SchemaFile)) {
  throw "Schema PostgreSQL nao encontrado em: $SchemaFile"
}

$AdminPassword = Convert-SecureStringToPlainText (Read-Host "Senha do usuario PostgreSQL '$AdminUser'" -AsSecureString)
$AppPassword = Convert-SecureStringToPlainText (Read-Host "Senha nova para o usuario '$AppUser'" -AsSecureString)

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

  $env:PGPASSWORD = $AppPassword
  & $PsqlPath -h $HostName -p $Port -U $AppUser -d $DatabaseName -v ON_ERROR_STOP=1 -f $SchemaFile
  if ($LASTEXITCODE -ne 0) { throw "Falha ao aplicar schema PostgreSQL." }

  Write-Host ""
  Write-Host "PostgreSQL configurado para o S&OP."
  Write-Host "DATABASE_URL=postgres://${AppUser}:SENHA_INFORMADA@$HostName`:$Port/$DatabaseName"
  Write-Host ""
  Write-Host "Depois de importar os dados, configurar esta DATABASE_URL no servico do S&OP."
} finally {
  Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
