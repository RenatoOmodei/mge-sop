$ErrorActionPreference = 'Stop'

$appDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeExe = Join-Path $appDir 'runtime\node.exe'
$taskName = 'MGE-SOP-Servidor'

if (-not (Test-Path -LiteralPath $nodeExe)) {
  $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  if (-not $nodeCommand) {
    throw 'Node.js nao encontrado. Instale o Node.js 22 LTS ou mantenha runtime\node.exe na pasta do sistema.'
  }
  $nodeExe = $nodeCommand.Source
}

$major = & $nodeExe -e "process.stdout.write(process.versions.node.split('.')[0])"
if ([int]$major -lt 22) {
  throw 'Esta aplicacao requer Node.js 22 ou superior.'
}

$action = New-ScheduledTaskAction -Execute $nodeExe -Argument 'src\server.js' -WorkingDirectory $appDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit (New-TimeSpan -Seconds 0)

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Principal $principal `
  -Settings $settings `
  -Description 'Servidor local do S&OP MGE' `
  -Force | Out-Null

Start-ScheduledTask -TaskName $taskName

Write-Host 'Servico de inicializacao instalado: MGE-SOP-Servidor'
Write-Host 'O servidor sera iniciado automaticamente junto com o Windows.'
