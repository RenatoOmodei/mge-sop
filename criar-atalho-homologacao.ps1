$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktop = [Environment]::GetFolderPath('DesktopDirectory')
$shortcutPath = Join-Path $desktop 'S&OP Homologacao React.lnk'
$targetPath = Join-Path $root 'iniciar-homologacao-react-local.cmd'
$iconPath = Join-Path $root 'instalador-usuarios\sop-mge-icon.ico'

if (-not (Test-Path -LiteralPath $targetPath)) {
  throw "Nao foi encontrado o iniciador: $targetPath"
}

if (-not (Test-Path -LiteralPath $iconPath)) {
  $iconPath = Join-Path $root 'ERP-Pedidos-Vendas.exe'
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = $root
$shortcut.Description = 'Abre a homologacao React local do S&OP'
$shortcut.WindowStyle = 7
if (Test-Path -LiteralPath $iconPath) {
  $shortcut.IconLocation = $iconPath
}
$shortcut.Save()

Write-Host "Atalho criado com sucesso:" -ForegroundColor Green
Write-Host $shortcutPath
