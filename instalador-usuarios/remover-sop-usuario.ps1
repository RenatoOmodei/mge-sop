param(
  [string]$AppName = "S&OP MGE"
)

$ErrorActionPreference = "Stop"

$desktopShortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) "$AppName.lnk"
$startMenuShortcut = Join-Path (Join-Path ([Environment]::GetFolderPath("Programs")) "MGE") "$AppName.lnk"
$installDir = Join-Path $env:LOCALAPPDATA "MGE\SOP"
$installedIcon = Join-Path $installDir "sop-mge-icon.ico"

foreach ($shortcut in @($desktopShortcut, $startMenuShortcut)) {
  if (Test-Path -LiteralPath $shortcut) {
    Remove-Item -LiteralPath $shortcut -Force
    Write-Host "Removido: $shortcut"
  }
}

if (Test-Path -LiteralPath $installedIcon) {
  Remove-Item -LiteralPath $installedIcon -Force
  Write-Host "Removido: $installedIcon"
}

if ((Test-Path -LiteralPath $installDir) -and -not (Get-ChildItem -LiteralPath $installDir -Force -ErrorAction SilentlyContinue)) {
  Remove-Item -LiteralPath $installDir -Force
}

Write-Host ""
Write-Host "Remocao concluida."
