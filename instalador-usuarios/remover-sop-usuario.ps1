param(
  [string]$AppName = "S&OP MGE"
)

$ErrorActionPreference = "Stop"

$desktopShortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) "$AppName.lnk"
$startMenuShortcut = Join-Path (Join-Path ([Environment]::GetFolderPath("Programs")) "MGE") "$AppName.lnk"

foreach ($shortcut in @($desktopShortcut, $startMenuShortcut)) {
  if (Test-Path -LiteralPath $shortcut) {
    Remove-Item -LiteralPath $shortcut -Force
    Write-Host "Removido: $shortcut"
  }
}

Write-Host ""
Write-Host "Remocao concluida."
