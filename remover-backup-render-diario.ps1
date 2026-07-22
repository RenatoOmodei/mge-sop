$ErrorActionPreference = "Stop"

$TaskName = "MGE-SOP-Backup-Render"

$Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if (!$Task) {
  Write-Host "Tarefa nao encontrada: $TaskName"
  exit 0
}

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
Write-Host "Tarefa removida: $TaskName"
