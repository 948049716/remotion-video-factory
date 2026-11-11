$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Raw = Join-Path $Root "asset-qa\pose-raw"
$Out = Join-Path $Root "public\tiaocaoma\poses"
$Temp = Join-Path $Root "asset-qa\pose-temp"

New-Item -ItemType Directory -Force -Path $Out, $Temp | Out-Null
Add-Type -Path (Join-Path $PSScriptRoot "tiaocao_image_tools.cs") -ReferencedAssemblies System.Drawing
Add-Type -AssemblyName System.Drawing

# Pose images share the same canvas layout: subject centered, feet at 85% height.
# Keep that canvas so switching poses never changes scale or ground line.
function Place-OnCanvas {
  param([string]$InputFile, [string]$OutputFile)

  $leaf = Split-Path -Leaf $InputFile
  $keyed = Join-Path $Temp ($leaf -replace '\.png$', '-keyed.png')

  [TiaocaoImageTools]::ChromaKeyAuto(
    $InputFile, $keyed,
    60, 1, 0, 0, 0, 20, 2, $true
  )

  $src = [System.Drawing.Bitmap]::FromFile($keyed)
  $raw = [System.Drawing.Image]::FromFile($InputFile)

  try {
    $w = $raw.Width
    $h = $raw.Height
    $canvas = New-Object System.Drawing.Bitmap(
      $w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)

    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      $x = [int](($w - $src.Width) / 2)
      $bottomY = [int][Math]::Round($h * 0.85)
      $y = $bottomY - $src.Height

      $graphics.DrawImage($src, $x, $y, $src.Width, $src.Height)
      $canvas.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $graphics.Dispose()
      $canvas.Dispose()
    }
  }
  finally {
    $src.Dispose()
    $raw.Dispose()
  }
}

$poses = Get-ChildItem $Raw -Filter "pose-*.png"
foreach ($pose in $poses) {
  $dest = Join-Path $Out $pose.Name
  Place-OnCanvas -InputFile $pose.FullName -OutputFile $dest
  Write-Output ("POSE " + $pose.Name)
}

Write-Output ""
Write-Output ("Done. Output files: " + (Get-ChildItem $Out -Filter *.png).Count)
