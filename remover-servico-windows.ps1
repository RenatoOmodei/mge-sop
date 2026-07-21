$ErrorActionPreference = 'Stop'

$taskName = 'MGE-SOP-Servidor'

Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false

Write-Host 'Servico de inicializacao removido: MGE-SOP-Servidor'
