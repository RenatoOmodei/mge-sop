$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$InstallerDir = Join-Path $Root 'instalador-usuarios'
$PublicDir = Join-Path $Root 'public'

Add-Type -AssemblyName System.Drawing

function New-RoundedRectanglePath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-IconBitmap {
  param(
    [int]$Size,
    [System.Drawing.Color]$Background,
    [System.Drawing.Color]$Background2,
    [System.Drawing.Color]$Accent,
    [System.Drawing.Color]$Accent2,
    [string]$Badge
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

  $scale = $Size / 256.0
  $backgroundPath = New-RoundedRectanglePath -X 0 -Y 0 -Width $Size -Height $Size -Radius (44 * $scale)
  $backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)),
    $Background,
    $Background2,
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
  )
  $graphics.FillPath($backgroundBrush, $backgroundPath)

  $borderPen = New-Object System.Drawing.Pen $Accent, (4 * $scale)
  $graphics.DrawPath($borderPen, $backgroundPath)

  $arcPenLight = New-Object System.Drawing.Pen $Accent, (12 * $scale)
  $arcPenLight.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $arcPenLight.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawArc($arcPenLight, 66 * $scale, 28 * $scale, 146 * $scale, 146 * $scale, 206, 260)

  $arcPenDark = New-Object System.Drawing.Pen $Accent2, (7 * $scale)
  $arcPenDark.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $arcPenDark.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawArc($arcPenDark, 82 * $scale, 40 * $scale, 118 * $scale, 118 * $scale, 32, 165)

  $titleFont = New-Object System.Drawing.Font 'Arial', (54 * $scale), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $badgeFont = New-Object System.Drawing.Font 'Arial', (25 * $scale), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $badgeBrush = New-Object System.Drawing.SolidBrush $Accent
  $badgeTextBrush = New-Object System.Drawing.SolidBrush $Background

  $centerFormat = New-Object System.Drawing.StringFormat
  $centerFormat.Alignment = [System.Drawing.StringAlignment]::Center
  $centerFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

  $graphics.DrawString('SYN', $titleFont, $whiteBrush, (New-Object System.Drawing.RectangleF(0, (90 * $scale), $Size, (60 * $scale))), $centerFormat)

  $pillPath = New-RoundedRectanglePath -X (68 * $scale) -Y (170 * $scale) -Width (120 * $scale) -Height (38 * $scale) -Radius (18 * $scale)
  $graphics.FillPath($badgeBrush, $pillPath)
  $graphics.DrawString($Badge, $badgeFont, $badgeTextBrush, (New-Object System.Drawing.RectangleF(0, (173 * $scale), $Size, (32 * $scale))), $centerFormat)

  $graphics.Dispose()
  $backgroundBrush.Dispose()
  $borderPen.Dispose()
  $arcPenLight.Dispose()
  $arcPenDark.Dispose()
  $titleFont.Dispose()
  $badgeFont.Dispose()
  $whiteBrush.Dispose()
  $badgeBrush.Dispose()
  $badgeTextBrush.Dispose()
  $centerFormat.Dispose()
  $pillPath.Dispose()
  $backgroundPath.Dispose()

  return $bitmap
}

function Save-Ico {
  param(
    [string]$Path,
    [System.Drawing.Bitmap[]]$Bitmaps
  )

  $pngPayloads = @()
  foreach ($bitmap in $Bitmaps) {
    $memory = New-Object System.IO.MemoryStream
    $bitmap.Save($memory, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngPayloads += ,$memory.ToArray()
    $memory.Dispose()
  }

  $file = [System.IO.File]::Create($Path)
  $writer = New-Object System.IO.BinaryWriter $file
  try {
    $writer.Write([UInt16]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]$Bitmaps.Length)

    $offset = 6 + (16 * $Bitmaps.Length)
    for ($i = 0; $i -lt $Bitmaps.Length; $i++) {
      $bitmap = $Bitmaps[$i]
      $payload = $pngPayloads[$i]
      $width = if ($bitmap.Width -ge 256) { 0 } else { $bitmap.Width }
      $height = if ($bitmap.Height -ge 256) { 0 } else { $bitmap.Height }
      $writer.Write([byte]$width)
      $writer.Write([byte]$height)
      $writer.Write([byte]0)
      $writer.Write([byte]0)
      $writer.Write([UInt16]1)
      $writer.Write([UInt16]32)
      $writer.Write([UInt32]$payload.Length)
      $writer.Write([UInt32]$offset)
      $offset += $payload.Length
    }

    foreach ($payload in $pngPayloads) {
      $writer.Write($payload)
    }
  } finally {
    $writer.Dispose()
    $file.Dispose()
  }
}

function New-EnvironmentIconSet {
  param(
    [string]$Name,
    [string]$Badge,
    [System.Drawing.Color]$Background,
    [System.Drawing.Color]$Background2,
    [System.Drawing.Color]$Accent,
    [System.Drawing.Color]$Accent2
  )

  $sizes = @(512, 256, 192, 128, 64, 48, 32, 16)
  $bitmaps = @()
  foreach ($size in $sizes) {
    $bitmaps += New-IconBitmap -Size $size -Background $Background -Background2 $Background2 -Accent $Accent -Accent2 $Accent2 -Badge $Badge
  }

  try {
    $bitmaps[1].Save((Join-Path $InstallerDir "synapse-$Name-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmaps[0].Save((Join-Path $PublicDir "pwa-icon-$Name-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmaps[2].Save((Join-Path $PublicDir "pwa-icon-$Name-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    Save-Ico -Path (Join-Path $InstallerDir "synapse-$Name-icon.ico") -Bitmaps $bitmaps
  } finally {
    foreach ($bitmap in $bitmaps) {
      $bitmap.Dispose()
    }
  }
}

New-Item -ItemType Directory -Path $InstallerDir -Force | Out-Null
New-Item -ItemType Directory -Path $PublicDir -Force | Out-Null

New-EnvironmentIconSet `
  -Name 'production' `
  -Badge 'PROD' `
  -Background ([System.Drawing.Color]::FromArgb(255, 23, 32, 51)) `
  -Background2 ([System.Drawing.Color]::FromArgb(255, 31, 48, 72)) `
  -Accent ([System.Drawing.Color]::FromArgb(255, 86, 182, 247)) `
  -Accent2 ([System.Drawing.Color]::FromArgb(255, 45, 212, 191))

New-EnvironmentIconSet `
  -Name 'homolog' `
  -Badge 'HML' `
  -Background ([System.Drawing.Color]::FromArgb(255, 127, 29, 29)) `
  -Background2 ([System.Drawing.Color]::FromArgb(255, 76, 5, 25)) `
  -Accent ([System.Drawing.Color]::FromArgb(255, 251, 113, 133)) `
  -Accent2 ([System.Drawing.Color]::FromArgb(255, 249, 115, 22))

Copy-Item -LiteralPath (Join-Path $PublicDir 'pwa-icon-production-512.png') -Destination (Join-Path $PublicDir 'pwa-icon-512.png') -Force
Copy-Item -LiteralPath (Join-Path $PublicDir 'pwa-icon-production-192.png') -Destination (Join-Path $PublicDir 'pwa-icon-192.png') -Force

Write-Host 'Icones de producao e homologacao gerados com sucesso.' -ForegroundColor Green
Write-Host $InstallerDir
Write-Host $PublicDir
