param(
  [string]$DailyAt = "18:00",
  [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackupScript = Join-Path $Root "backup-render-postgresql.ps1"
$EnvFile = Join-Path $Root "data\render-backup.env"
$TaskName = "MGE-SOP-Backup-Render"

if (!(Test-Path -LiteralPath $BackupScript)) {
  throw "Script de backup nao encontrado: $BackupScript"
}

if (!(Test-Path -LiteralPath $EnvFile)) {
  Write-Host "Conexao do Render ainda nao foi salva."
  & powershell -NoProfile -ExecutionPolicy Bypass -File $BackupScript -SaveConnection -RetentionDays $RetentionDays
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao salvar a conexao inicial do backup."
  }
}

$At = [DateTime]::ParseExact($DailyAt, "HH:mm", $null)
$ActionArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$BackupScript`" -RetentionDays $RetentionDays"
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $ActionArgs -WorkingDirectory $Root
$Trigger = New-ScheduledTaskTrigger -Daily -At $At
$Settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2)

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $Action `
  -Trigger $Trigger `
  -Settings $Settings `
  -Description "Backup diario local do PostgreSQL Render do S&OP MGE" `
  -Force | Out-Null

Write-Host "Tarefa instalada: $TaskName"
Write-Host "Horario diario: $DailyAt"
Write-Host "Retencao local: $RetentionDays dias"
Write-Host "Backups em: $(Join-Path $Root 'data\render-backups')"
