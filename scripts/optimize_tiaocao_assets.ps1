$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Assets = Join-Path $Root "public\tiaocaoma\assets"
$Temp = Join-Path $Root "asset-qa\optimized-temp"
$Ffmpeg = Join-Path $Root "node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"

if (-not (Test-Path $Ffmpeg)) {
  throw "ffmpeg not found: $Ffmpeg"
}

New-Item -ItemType Directory -Force -Path $Temp | Out-Null

# Old pilot files / unused views
$oldFiles = @(
  "char-er.png", "char-scarface.png", "char-horse-lame.png",
  "char-er-v3.png", "char-scarface-v3.png",
  "char-horse-lame-v2.png", "char-horse-lame-v3.png",
  "turnaround-sheet.png", "contact-sheet.png"
)
foreach ($name in $oldFiles) {
  $path = Join-Path $Assets $name
  if (Test-Path $path) {
    Remove-Item $path -Force
    Write-Output "REMOVE $name"
  }
}

# Move styleframes out of public
$styleSrc = Join-Path $Assets "styleframes"
$styleDst = Join-Path $Root "asset-qa\styleframes"
if (Test-Path $styleSrc) {
  New-Item -ItemType Directory -Force -Path $styleDst | Out-Null
  Move-Item (Join-Path $styleSrc "*") $styleDst -Force
  Remove-Item $styleSrc -Force
  Write-Output "MOVE   styleframes -> asset-qa/styleframes"
}

function Get-MaxEdge([string]$name) {
  if ($name -eq "bg-window-paper.png") { return 1400 }
  if ($name -eq "bg-trough-panorama.png") { return 3840 }
  if ($name -like "bg-*") { return 2240 }
  if (
    $name -eq "char-crowd.png" -or
    $name -eq "char-horse-crowd.png" -or
    $name -eq "char-scarface-riding.png"
  ) { return 1800 }
  if ($name -like "char-*") { return 1400 }
  if ($name -eq "prop-table-set.png") { return 1200 }
  if ($name -like "prop-*") { return 1000 }
  if ($name -eq "fx-torn-open.png" -or $name -eq "fx-paper-close.png") {
    return 1920
  }
  if ($name -like "fx-*") { return 1400 }
  return 1400
}

$files = Get-ChildItem $Assets -File -Filter *.png | Sort-Object Name
$before = ($files | Measure-Object Length -Sum).Sum

foreach ($file in $files) {
  $max = Get-MaxEdge $file.Name
  $pixFmt = if ($file.Name -like "bg-*" -and $file.Name -ne "bg-window-paper.png") {
    "rgb24"
  } else {
    "rgba"
  }
  $vf = "scale=w='if(gt(iw,ih),min(iw,$max),-2)':h='if(gt(iw,ih),-2,min(ih,$max))'"
  $tmp = Join-Path $Temp $file.Name

  $ErrorActionPreference = "Continue"
  & $Ffmpeg -y -i $file.FullName -vf $vf -pix_fmt $pixFmt -compression_level 9 $tmp 2>&1 | Out-Null
  $ffmpegExit = $LASTEXITCODE
  $ErrorActionPreference = "Stop"

  if ($ffmpegExit -ne 0 -or -not (Test-Path $tmp)) {
    Write-Output "SKIP   $($file.Name) (ffmpeg failed)"
    continue
  }

  $oldSize = $file.Length
  $newSize = (Get-Item $tmp).Length
  if ($newSize -lt $oldSize) {
    Move-Item $tmp $file.FullName -Force
    Write-Output ("OPT    {0}  {1:N0}KB -> {2:N0}KB" -f $file.Name, ($oldSize/1KB), ($newSize/1KB))
  } else {
    Remove-Item $tmp -Force
    Write-Output ("KEEP   {0}  {1:N0}KB" -f $file.Name, ($oldSize/1KB))
  }
}

$after = (Get-ChildItem $Assets -File -Filter *.png | Measure-Object Length -Sum).Sum
Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue

Write-Output ""
Write-Output ("Assets: {0:N1} MB -> {1:N1} MB" -f ($before/1MB), ($after/1MB))
$publicSum = (Get-ChildItem (Join-Path $Root "public") -Recurse -File | Measure-Object Length -Sum).Sum
Write-Output ("Public: {0:N1} MB" -f ($publicSum/1MB))
