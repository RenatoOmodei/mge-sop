$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$OutputDir = Join-Path $Root "instalador-usuarios"
$PngPath = Join-Path $OutputDir "sop-mge-icon.png"
$IcoPath = Join-Path $OutputDir "sop-mge-icon.ico"

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
  param([int]$Size)

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

  $scale = $Size / 256.0
  $background = New-RoundedRectanglePath -X 0 -Y 0 -Width $Size -Height $Size -Radius (44 * $scale)
  $backgroundBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 23, 32, 51))
  $graphics.FillPath($backgroundBrush, $background)

  $borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 61, 180, 213)), (4 * $scale)
  $graphics.DrawPath($borderPen, $background)

  $arcPenLight = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(230, 78, 205, 255)), (12 * $scale)
  $arcPenLight.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $arcPenLight.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawArc($arcPenLight, 66 * $scale, 28 * $scale, 146 * $scale, 146 * $scale, 206, 260)

  $arcPenDark = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(190, 30, 128, 170)), (7 * $scale)
  $arcPenDark.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $arcPenDark.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawArc($arcPenDark, 82 * $scale, 40 * $scale, 118 * $scale, 118 * $scale, 32, 165)

  $mgeFont = New-Object System.Drawing.Font "Arial", (56 * $scale), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $sopFont = New-Object System.Drawing.Font "Arial", (28 * $scale), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 45, 212, 191))
  $navyBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 23, 32, 51))

  $centerFormat = New-Object System.Drawing.StringFormat
  $centerFormat.Alignment = [System.Drawing.StringAlignment]::Center
  $centerFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

  $graphics.DrawString("MGE", $mgeFont, $whiteBrush, (New-Object System.Drawing.RectangleF(0, (92 * $scale), $Size, (58 * $scale))), $centerFormat)

  $pillPath = New-RoundedRectanglePath -X (72 * $scale) -Y (170 * $scale) -Width (112 * $scale) -Height (38 * $scale) -Radius (18 * $scale)
  $graphics.FillPath($accentBrush, $pillPath)
  $graphics.DrawString("S&OP", $sopFont, $navyBrush, (New-Object System.Drawing.RectangleF(0, (172 * $scale), $Size, (34 * $scale))), $centerFormat)

  $graphics.Dispose()
  $backgroundBrush.Dispose()
  $borderPen.Dispose()
  $arcPenLight.Dispose()
  $arcPenDark.Dispose()
  $mgeFont.Dispose()
  $sopFont.Dispose()
  $whiteBrush.Dispose()
  $accentBrush.Dispose()
  $navyBrush.Dispose()
  $centerFormat.Dispose()
  $pillPath.Dispose()
  $background.Dispose()

  return $bitmap
}

function Save-Png {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path
  )
  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
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
      $width = if ($bitmap.Width -ge 256) { 0 } else { [byte]$bitmap.Width }
      $height = if ($bitmap.Height -ge 256) { 0 } else { [byte]$bitmap.Height }

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

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$sizes = @(256, 128, 64, 48, 32, 16)
$bitmaps = @()
foreach ($size in $sizes) {
  $bitmaps += New-IconBitmap -Size $size
}

try {
  Save-Png -Bitmap $bitmaps[0] -Path $PngPath
  Save-Ico -Path $IcoPath -Bitmaps $bitmaps
  Write-Host "Icone PNG criado em: $PngPath"
  Write-Host "Icone ICO criado em: $IcoPath"
} finally {
  foreach ($bitmap in $bitmaps) {
    $bitmap.Dispose()
  }
}
