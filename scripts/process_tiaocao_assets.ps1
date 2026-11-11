$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Raw = Join-Path $Root "asset-qa\raw"
$Out = Join-Path $Root "public\tiaocaoma\assets"
$Temp = Join-Path $Root "asset-qa\processed-temp"

New-Item -ItemType Directory -Force -Path $Out, $Temp | Out-Null
Add-Type -Path (Join-Path $PSScriptRoot "tiaocao_image_tools.cs") -ReferencedAssemblies System.Drawing

$backgrounds = @(
  "bg-battlefield.png", "bg-dusk-road.png", "bg-hall.png",
  "bg-map-west-east.png", "bg-palace-gate.png",
  "bg-restaurant-facade.png", "bg-restaurant-interior.png",
  "bg-stable-night.png", "bg-stable.png", "bg-street-west.png",
  "bg-table.png", "bg-trough-panorama.png"
)

foreach ($file in $backgrounds) {
  Copy-Item (Join-Path $Raw $file) (Join-Path $Out $file) -Force
  Write-Output "BG   $file"
}

$sheets = @(
  "char-attendant.png", "char-child.png", "char-er.png",
  "char-general-one-arm.png", "char-general-young.png", "char-guard.png",
  "char-horse-lame.png", "char-horse-thin.png", "char-horse-war.png",
  "char-horse-war-wounded.png", "char-horse-zhao.png",
  "char-official-guest.png", "char-scarface.png", "char-yipin.png",
  "char-zhao.png"
)

foreach ($file in $sheets) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($file)
  $keyed = Join-Path $Temp ($base + "-keyed.png")
  [TiaocaoImageTools]::ChromaKeyAuto(
    (Join-Path $Raw $file), $keyed,
    60, 1, 8, 0, 0, 20, 2, $true
  )
  [TiaocaoImageTools]::SliceByGaps(
    $keyed, (Join-Path $Out $base), 16, 8, 4
  )
  Write-Output "CUT  $file"
}

$singles = @(
  "char-scarface-riding.png", "char-crowd.png", "char-horse-crowd.png",
  "bg-window-paper.png",
  "prop-arm-wood.png", "prop-bell.png", "prop-cloth.png",
  "prop-facade-decor.png", "prop-hay.png", "prop-post.png",
  "prop-rank-plaques.png", "prop-reins.png", "prop-rope-thick.png",
  "prop-saddle.png", "prop-stick.png", "prop-sword.png",
  "prop-table-set.png", "prop-trough.png", "prop-trough-map.png",
  "prop-umbrella.png", "prop-weapons.png",
  "fx-atmosphere.png", "fx-day-flip.png", "fx-gold-sun.png",
  "fx-horse-king-gold.png", "fx-paper-close.png", "fx-slash.png",
  "fx-torn-open.png"
)

foreach ($file in $singles) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($file)
  $keyed = Join-Path $Temp ($base + "-keyed.png")
  $greenDominance = if ($file -eq "prop-hay.png") { 0 } else { 20 }
  [TiaocaoImageTools]::ChromaKeyAuto(
    (Join-Path $Raw $file), $keyed,
    60, 1, 8, 0, 0, $greenDominance, 2, $true
  )
  [TiaocaoImageTools]::TrimAlpha($keyed, (Join-Path $Out $file), 8, 0, 0)
  Write-Output "CUT  $file"
}

Write-Output ""
Write-Output ("Done. Output files: " + (Get-ChildItem $Out -Filter *.png).Count)
