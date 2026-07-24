param(
  [string]$ProductionUrl = $env:SOP_PRODUCTION_URL,
  [string]$HomologationProjectPath
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($ProductionUrl)) {
  $ProductionUrl = 'https://symphonious-quokka-707211.netlify.app'
}

$scriptDir = if ($PSScriptRoot) {
  $PSScriptRoot
} else {
  Split-Path -Parent $MyInvocation.MyCommand.Path
}

$root = (Resolve-Path -LiteralPath (Join-Path $scriptDir '..')).Path

if ([string]::IsNullOrWhiteSpace($HomologationProjectPath)) {
  $HomologationProjectPath = $root
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$packagesRoot = Join-Path $root 'pacotes'
$packageName = "Synapse-Instaladores-$stamp"
$packageDir = Join-Path $packagesRoot $packageName
$prodDir = Join-Path $packageDir 'Producao-Netlify'
$homologDir = Join-Path $packageDir 'Homologacao-Local'

New-Item -ItemType Directory -Path $prodDir -Force | Out-Null
New-Item -ItemType Directory -Path $homologDir -Force | Out-Null

$iconCandidates = @(
  (Join-Path $root 'instalador-usuarios\sop-mge-icon.ico'),
  (Join-Path $root 'ERP-Pedidos-Vendas.exe')
)

$iconSource = $iconCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if ($iconSource) {
  Copy-Item -LiteralPath $iconSource -Destination (Join-Path $prodDir 'synapse-icon.ico') -Force
  Copy-Item -LiteralPath $iconSource -Destination (Join-Path $homologDir 'synapse-icon.ico') -Force
}

$productionInstaller = @'
$ErrorActionPreference = 'Stop'

$appName = 'Synapse'
$productionUrl = '__PRODUCTION_URL__'
$sourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$installDir = Join-Path $env:ProgramData 'Synapse\Producao'
$iconSource = Join-Path $sourceDir 'synapse-icon.ico'
$iconTarget = Join-Path $installDir 'synapse-icon.ico'

New-Item -ItemType Directory -Path $installDir -Force | Out-Null

if (Test-Path -LiteralPath $iconSource) {
  Copy-Item -LiteralPath $iconSource -Destination $iconTarget -Force
}

function New-SynapseShortcut {
  param(
    [string]$ShortcutPath,
    [string]$Description
  )

  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($ShortcutPath)
  $shortcut.TargetPath = Join-Path $env:WINDIR 'explorer.exe'
  $shortcut.Arguments = $productionUrl
  $shortcut.WorkingDirectory = $installDir
  $shortcut.Description = $Description
  $shortcut.WindowStyle = 1
  if (Test-Path -LiteralPath $iconTarget) {
    $shortcut.IconLocation = "$iconTarget,0"
  }
  $shortcut.Save()
}

$desktop = [Environment]::GetFolderPath('DesktopDirectory')
$startMenu = Join-Path ([Environment]::GetFolderPath('Programs')) 'Synapse'
New-Item -ItemType Directory -Path $startMenu -Force | Out-Null

New-SynapseShortcut -ShortcutPath (Join-Path $desktop 'Synapse.lnk') -Description 'Abrir Synapse em producao'
New-SynapseShortcut -ShortcutPath (Join-Path $startMenu 'Synapse.lnk') -Description 'Abrir Synapse em producao'

Write-Host 'Instalacao concluida.' -ForegroundColor Green
Write-Host "Atalho criado na Area de Trabalho e no Menu Iniciar."
Write-Host "URL: $productionUrl"
'@.Replace('__PRODUCTION_URL__', $ProductionUrl)

$productionRemover = @'
$ErrorActionPreference = 'Stop'

$desktop = [Environment]::GetFolderPath('DesktopDirectory')
$startMenuShortcut = Join-Path ([Environment]::GetFolderPath('Programs')) 'Synapse\Synapse.lnk'
$desktopShortcut = Join-Path $desktop 'Synapse.lnk'

foreach ($path in @($desktopShortcut, $startMenuShortcut)) {
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Force
  }
}

Write-Host 'Atalhos de producao removidos.' -ForegroundColor Green
'@

$productionCmd = @'
@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar-synapse-producao.ps1"
pause
'@

$productionRemoveCmd = @'
@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0remover-synapse-producao.ps1"
pause
'@

$homologInstaller = @'
$ErrorActionPreference = 'Stop'

$defaultProjectPath = '__HOMOLOGATION_PATH__'
$sourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$installDir = Join-Path $env:ProgramData 'Synapse\Homologacao'
$iconSource = Join-Path $sourceDir 'synapse-icon.ico'
$iconTarget = Join-Path $installDir 'synapse-icon.ico'
$projectPath = $defaultProjectPath

if (-not (Test-Path -LiteralPath (Join-Path $projectPath 'iniciar-homologacao-react-local.cmd'))) {
  Write-Host 'Nao encontrei o iniciador da homologacao no caminho padrao:' -ForegroundColor Yellow
  Write-Host $projectPath
  $projectPath = Read-Host 'Informe o caminho da pasta local do Synapse'
}

$launcher = Join-Path $projectPath 'iniciar-homologacao-react-local.cmd'
if (-not (Test-Path -LiteralPath $launcher)) {
  throw "Nao foi encontrado o arquivo iniciar-homologacao-react-local.cmd em: $projectPath"
}

New-Item -ItemType Directory -Path $installDir -Force | Out-Null

if (Test-Path -LiteralPath $iconSource) {
  Copy-Item -LiteralPath $iconSource -Destination $iconTarget -Force
}

function New-SynapseShortcut {
  param(
    [string]$ShortcutPath,
    [string]$Description
  )

  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($ShortcutPath)
  $shortcut.TargetPath = $launcher
  $shortcut.WorkingDirectory = $projectPath
  $shortcut.Description = $Description
  $shortcut.WindowStyle = 7
  if (Test-Path -LiteralPath $iconTarget) {
    $shortcut.IconLocation = "$iconTarget,0"
  }
  $shortcut.Save()
}

$desktop = [Environment]::GetFolderPath('DesktopDirectory')
$startMenu = Join-Path ([Environment]::GetFolderPath('Programs')) 'Synapse'
New-Item -ItemType Directory -Path $startMenu -Force | Out-Null

New-SynapseShortcut -ShortcutPath (Join-Path $desktop 'Synapse Homologacao.lnk') -Description 'Abrir homologacao local do Synapse'
New-SynapseShortcut -ShortcutPath (Join-Path $startMenu 'Synapse Homologacao.lnk') -Description 'Abrir homologacao local do Synapse'

Write-Host 'Instalacao concluida.' -ForegroundColor Green
Write-Host "Atalho de homologacao criado na Area de Trabalho e no Menu Iniciar."
Write-Host "Pasta local: $projectPath"
'@.Replace('__HOMOLOGATION_PATH__', $HomologationProjectPath.Replace("'", "''"))

$homologRemover = @'
$ErrorActionPreference = 'Stop'

$desktop = [Environment]::GetFolderPath('DesktopDirectory')
$startMenuShortcut = Join-Path ([Environment]::GetFolderPath('Programs')) 'Synapse\Synapse Homologacao.lnk'
$desktopShortcut = Join-Path $desktop 'Synapse Homologacao.lnk'

foreach ($path in @($desktopShortcut, $startMenuShortcut)) {
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Force
  }
}

Write-Host 'Atalhos de homologacao removidos.' -ForegroundColor Green
'@

$homologCmd = @'
@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar-synapse-homologacao.ps1"
pause
'@

$homologRemoveCmd = @'
@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0remover-synapse-homologacao.ps1"
pause
'@

$readme = @"
# Synapse - Instaladores

Pacote gerado em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Producao

Instalador: `Producao-Netlify\Instalar Synapse Producao.cmd`

Este instalador cria atalhos para a versao oficial publicada no Netlify:
$ProductionUrl

Use este instalador para os usuarios finais depois que o deploy do GitHub, Render e Netlify estiver concluido.

## Homologacao local

Instalador: `Homologacao-Local\Instalar Synapse Homologacao.cmd`

Este instalador cria atalhos para abrir a homologacao local na maquina de desenvolvimento.

Caminho configurado:
$HomologationProjectPath

## Observacao

Os atalhos nao copiam o sistema nem o banco de dados para a maquina do usuario. Eles apenas abrem o Synapse. Os dados continuam sendo salvos no backend/banco configurado para cada ambiente.
"@

Set-Content -LiteralPath (Join-Path $prodDir 'instalar-synapse-producao.ps1') -Value $productionInstaller -Encoding UTF8
Set-Content -LiteralPath (Join-Path $prodDir 'remover-synapse-producao.ps1') -Value $productionRemover -Encoding UTF8
Set-Content -LiteralPath (Join-Path $prodDir 'Instalar Synapse Producao.cmd') -Value $productionCmd -Encoding ASCII
Set-Content -LiteralPath (Join-Path $prodDir 'Remover Synapse Producao.cmd') -Value $productionRemoveCmd -Encoding ASCII
Set-Content -LiteralPath (Join-Path $prodDir 'LINK-PRODUCAO-NETLIFY.txt') -Value $ProductionUrl -Encoding UTF8

Set-Content -LiteralPath (Join-Path $homologDir 'instalar-synapse-homologacao.ps1') -Value $homologInstaller -Encoding UTF8
Set-Content -LiteralPath (Join-Path $homologDir 'remover-synapse-homologacao.ps1') -Value $homologRemover -Encoding UTF8
Set-Content -LiteralPath (Join-Path $homologDir 'Instalar Synapse Homologacao.cmd') -Value $homologCmd -Encoding ASCII
Set-Content -LiteralPath (Join-Path $homologDir 'Remover Synapse Homologacao.cmd') -Value $homologRemoveCmd -Encoding ASCII
Set-Content -LiteralPath (Join-Path $homologDir 'CAMINHO-HOMOLOGACAO-LOCAL.txt') -Value $HomologationProjectPath -Encoding UTF8

Set-Content -LiteralPath (Join-Path $packageDir 'LEIA-ME-INSTALADORES.md') -Value $readme -Encoding UTF8

$zipPath = Join-Path $packagesRoot "$packageName.zip"
if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($packageDir, $zipPath)

Write-Host 'Pacote de instaladores gerado com sucesso.' -ForegroundColor Green
Write-Host $zipPath
