param(
  [string]$DatabaseUrl = "",
  [string]$BackupDir = "",
  [int]$RetentionDays = 30,
  [switch]$SaveConnection
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Root "data\render-backup.env"
$DefaultBackupDir = Join-Path $Root "data\render-backups"
$NodeExe = Join-Path $Root "runtime\node.exe"
$BackupScript = Join-Path $Root "scripts\backup-render-postgres.js"

function Read-EnvFile {
  param([string]$File)
  $values = @{}
  if (!(Test-Path -LiteralPath $File)) {
    return $values
  }

  foreach ($line in Get-Content -LiteralPath $File) {
    $trimmed = $line.Trim()
    if (!$trimmed -or $trimmed.StartsWith("#")) {
      continue
    }

    $parts = $trimmed.Split("=", 2)
    if ($parts.Count -eq 2) {
      $values[$parts[0].Trim()] = $parts[1]
    }
  }
  return $values
}

function Write-EnvFile {
  param(
    [string]$File,
    [string]$Url
  )

  New-Item -ItemType Directory -Path (Split-Path -Parent $File) -Force | Out-Null
  Set-Content -LiteralPath $File -Encoding ASCII -Value @(
    "# S&OP Render backup connection. Nao enviar este arquivo para GitHub.",
    "DATABASE_URL=$Url",
    "POSTGRES_SSL=true"
  )
}

if (!(Test-Path -LiteralPath $BackupScript)) {
  throw "Script de backup nao encontrado: $BackupScript"
}

if (!(Test-Path -LiteralPath $NodeExe)) {
  $NodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  if (!$NodeCommand) {
    throw "Node.js nao encontrado."
  }
  $NodeExe = $NodeCommand.Source
}

$EnvValues = Read-EnvFile -File $EnvFile
if (!$DatabaseUrl) {
  $DatabaseUrl = $env:DATABASE_URL
}
if (!$DatabaseUrl) {
  $DatabaseUrl = $env:POSTGRES_DATABASE_URL
}
if (!$DatabaseUrl -and $EnvValues.ContainsKey("DATABASE_URL")) {
  $DatabaseUrl = $EnvValues["DATABASE_URL"]
}
if (!$DatabaseUrl) {
  $DatabaseUrl = Read-Host "Cole a External Database URL do Render"
  $SaveConnection = $true
}

if (!$BackupDir) {
  $BackupDir = $DefaultBackupDir
}

if ($SaveConnection) {
  Write-EnvFile -File $EnvFile -Url $DatabaseUrl
  Write-Host "Conexao salva em: $EnvFile"
}

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

$env:DATABASE_URL = $DatabaseUrl
$env:POSTGRES_SSL = "true"
$env:RENDER_BACKUP_DIR = $BackupDir

& $NodeExe $BackupScript
if ($LASTEXITCODE -ne 0) {
  throw "Falha ao gerar backup do PostgreSQL Render."
}

if ($RetentionDays -gt 0) {
  $Limit = (Get-Date).AddDays(-$RetentionDays)
  Get-ChildItem -LiteralPath $BackupDir -Filter "render-postgres-backup-*.sql" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $Limit } |
    Remove-Item -Force
}

Write-Host ""
Write-Host "Backups locais em: $BackupDir"
