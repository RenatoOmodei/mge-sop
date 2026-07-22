param(
  [string]$AppUrl = "https://symphonious-quokka-707211.netlify.app",
  [string]$AppName = "S&OP MGE"
)

$ErrorActionPreference = "Stop"

function Find-Browser {
  $candidates = @(
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
  )

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) {
      return $candidate
    }
  }

  return "$env:SystemRoot\System32\rundll32.exe"
}

function New-AppShortcut {
  param(
    [string]$ShortcutPath,
    [string]$TargetPath,
    [string]$Arguments,
    [string]$WorkingDirectory,
    [string]$Description
  )

  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($ShortcutPath)
  $shortcut.TargetPath = $TargetPath
  $shortcut.Arguments = $Arguments
  $shortcut.WorkingDirectory = $WorkingDirectory
  $shortcut.Description = $Description
  $shortcut.Save()
}

$browser = Find-Browser
$usesRundll = [IO.Path]::GetFileName($browser).Equals("rundll32.exe", [StringComparison]::OrdinalIgnoreCase)
$arguments = if ($usesRundll) {
  "url.dll,FileProtocolHandler `"$AppUrl`""
} else {
  "--app=`"$AppUrl`""
}

$desktop = [Environment]::GetFolderPath("Desktop")
$startMenu = Join-Path ([Environment]::GetFolderPath("Programs")) "MGE"
$shortcutName = "$AppName.lnk"

New-Item -ItemType Directory -Path $startMenu -Force | Out-Null

New-AppShortcut `
  -ShortcutPath (Join-Path $desktop $shortcutName) `
  -TargetPath $browser `
  -Arguments $arguments `
  -WorkingDirectory (Split-Path -Parent $browser) `
  -Description "Abrir o sistema S&OP MGE"

New-AppShortcut `
  -ShortcutPath (Join-Path $startMenu $shortcutName) `
  -TargetPath $browser `
  -Arguments $arguments `
  -WorkingDirectory (Split-Path -Parent $browser) `
  -Description "Abrir o sistema S&OP MGE"

Write-Host ""
Write-Host "Instalacao concluida."
Write-Host "Atalho criado na Area de Trabalho e no Menu Iniciar."
Write-Host "URL: $AppUrl"
