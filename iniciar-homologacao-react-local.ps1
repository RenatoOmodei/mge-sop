$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPort = 3010
$preferredFrontendPorts = @(5173, 5174, 5175, 5176, 5177)

function Test-PortOpen {
  param([int]$Port)

  $client = $null
  try {
    $client = [Net.Sockets.TcpClient]::new()
    $connect = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
    if (-not $connect.AsyncWaitHandle.WaitOne(350, $false)) {
      return $false
    }
    $client.EndConnect($connect)
    return $true
  } catch {
    return $false
  } finally {
    if ($client) {
      $client.Close()
    }
  }
}

function Find-FreePort {
  param([int[]]$Ports)

  foreach ($port in $Ports) {
    $listener = $null
    try {
      $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $port)
      $listener.Start()
      return $port
    } catch {
      continue
    } finally {
      if ($listener) {
        $listener.Stop()
      }
    }
  }

  return $Ports[0]
}

Set-Location -LiteralPath $root

Write-Host 'Iniciando homologacao React local do S&OP...' -ForegroundColor Cyan
Write-Host "Pasta: $root"

if (Test-PortOpen -Port $backendPort) {
  Write-Host "Backend ja esta respondendo em http://localhost:$backendPort" -ForegroundColor Yellow
} else {
  Write-Host "Abrindo backend local em http://localhost:$backendPort"
  $backendCommand = "set DB_PROVIDER=sqlite&& set DATABASE_URL=&& set POSTGRES_SSL=false&& set APP_ENV=homolog-local&& set NODE_ENV=development&& set PORT=$backendPort&& npm start"
  Start-Process -FilePath $env:ComSpec -ArgumentList '/k', $backendCommand -WorkingDirectory $root
}

$frontendPort = $null
$frontendAlreadyRunning = $false
foreach ($port in $preferredFrontendPorts) {
  if (Test-PortOpen -Port $port) {
    $frontendPort = $port
    $frontendAlreadyRunning = $true
    break
  }
}

if (-not $frontendPort) {
  $frontendPort = Find-FreePort -Ports $preferredFrontendPorts
}

if ($frontendAlreadyRunning) {
  Write-Host "Homologacao React ja esta respondendo em http://localhost:$frontendPort" -ForegroundColor Yellow
} else {
  Write-Host "Abrindo homologacao React em http://localhost:$frontendPort"
  $frontendCommand = "set REACT_PORT=$frontendPort&& set REACT_STRICT_PORT=true&& npm run react:dev"
  Start-Process -FilePath $env:ComSpec -ArgumentList '/k', $frontendCommand -WorkingDirectory $root
}

$url = "http://localhost:$frontendPort/"
Write-Host "Abrindo navegador em $url"
Start-Sleep -Seconds 4
Start-Process $url
