<#
.SYNOPSIS
  图片素材交付验收闸门（跳槽马项目）。
.DESCRIPTION
  按素材清单核对文件名、像素、幕布纯度、主体边距、重复图与抠图边残，
  输出逐项 PASS / WARN / FAIL 与 JSON 报告；返回码 0 表示整批通过。
.PARAMETER Stage
  raw = 生图原图；cutout = 抠图后的透明 PNG。
.PARAMETER Root
  待检查图片所在目录。默认 ./raw。
.PARAMETER ListPath
  素材清单 JSON。默认 ./asset-list.json。
.PARAMETER OutDir
  报告与接触表输出目录。默认 ./out。
.PARAMETER Only
  只查指定 id 或文件名（逗号分隔），例如 bg-street-west,char-er。
.PARAMETER Priority
  只查指定优先级（1/2/3）；0 表示全部。
.PARAMETER Sheets
  额外输出接触表，每 20 张一张，供批量目检。
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File check-assets.ps1 -Root raw -Priority 1 -Sheets
#>
param(
  [ValidateSet("raw", "cutout")]
  [string]$Stage = "raw",
  [string]$Root,
  [string]$ListPath,
  [string]$OutDir,
  [string[]]$Only,
  [int]$Priority = 0,
  [switch]$Sheets,
  [int]$Tolerance = 90,
  [int]$BandPct = 6
)

$ErrorActionPreference = "Stop"

if ($Only) {
  $Only = @($Only | ForEach-Object { $_ -split "," } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}

if (-not $Root) { $Root = Join-Path $PSScriptRoot "raw" }
if (-not $ListPath) { $ListPath = Join-Path $PSScriptRoot "asset-list.json" }
if (-not $OutDir) { $OutDir = Join-Path $PSScriptRoot "out" }

if (-not (Test-Path -LiteralPath $ListPath)) {
  Write-Host "Asset list not found: $ListPath" -ForegroundColor Red
  Write-Host "Copy asset-list.json next to this script, or pass -ListPath." -ForegroundColor Yellow
  exit 2
}
if (-not (Test-Path -LiteralPath $Root)) {
  Write-Host "Asset root not found: $Root" -ForegroundColor Red
  Write-Host "Pass -Root <folder with generated images>." -ForegroundColor Yellow
  exit 2
}

$list = Get-Content -LiteralPath $ListPath -Raw -Encoding UTF8 | ConvertFrom-Json

if (-not ([System.Management.Automation.PSTypeName]"AssetImageTools").Type) {
  Add-Type -AssemblyName System.Drawing
  Add-Type -Path (Join-Path $PSScriptRoot "image-tools.cs") -ReferencedAssemblies System.Drawing
}

function ConvertTo-Metrics([string]$text) {
  $metrics = @{}
  foreach ($pair in ($text -split ";")) {
    $kv = $pair -split "=", 2
    if ($kv.Count -eq 2) { $metrics[$kv[0]] = [double]$kv[1] }
  }
  return $metrics
}

function Find-AssetFile([string]$dir, [string]$output) {
  $base = [IO.Path]::GetFileNameWithoutExtension($output)
  foreach ($ext in @(".png", ".jpg", ".jpeg", ".webp")) {
    $p = Join-Path $dir ($base + $ext)
    if (Test-Path -LiteralPath $p) { return Get-Item -LiteralPath $p }
  }
  return $null
}

function Format-Num([double]$n, [int]$digits = 2) {
  return $n.ToString("F$digits", [Globalization.CultureInfo]::InvariantCulture)
}

$targets = @($list.assets | Where-Object { $_.source -ne "code" -and $_.output })
if ($Only) {
  $targets = @($targets | Where-Object {
      $base = [IO.Path]::GetFileNameWithoutExtension($_.output)
      ($Only -contains $_.id) -or ($Only -contains $base)
    })
}
if ($Priority -gt 0) {
  $targets = @($targets | Where-Object { [int]$_.priority -eq $Priority })
}

if ($targets.Count -eq 0) {
  Write-Host "No assets selected." -ForegroundColor Yellow
  exit 2
}

$results = New-Object System.Collections.Generic.List[object]
$foundFiles = New-Object System.Collections.Generic.List[string]

$hashIds = @{}
foreach ($asset in $targets) {
  $f = Find-AssetFile -dir $Root -output $asset.output
  if ($f) {
    $h = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
    if (-not $hashIds.ContainsKey($h)) { $hashIds[$h] = @() }
    $hashIds[$h] += $asset.id
  }
}

foreach ($asset in $targets) {
  $fails = New-Object System.Collections.Generic.List[string]
  $warns = New-Object System.Collections.Generic.List[string]
  $file = Find-AssetFile -dir $Root -output $asset.output
  $metrics = $null

  if (-not $file) {
    $fails.Add("missing file: $($asset.output)")
  } else {
    $foundFiles.Add($file.FullName)
    $fileHash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    $others = @($hashIds[$fileHash] | Where-Object { $_ -ne $asset.id })
    if ($others.Count -gt 0) {
      $fails.Add("duplicate image, also used by $($others -join ', ')")
    }

    $mode = $asset.backgroundCode
    if ($mode -eq "code-only") { $mode = "none" }
    if ($mode -eq "full-bleed") { $mode = "none" }

    $metrics = ConvertTo-Metrics ([AssetImageTools]::Inspect($file.FullName, $mode, $Tolerance, $BandPct))
    $w = [int]$metrics["width"]
    $h = [int]$metrics["height"]

    if ($Stage -eq "raw") {
      $expected = $asset.pixels -split "x"
      $ew = [int]$expected[0]
      $eh = [int]$expected[1]
      if ([Math]::Abs($w - $ew) -gt 1 -or [Math]::Abs($h - $eh) -gt 1) {
        $fails.Add("size ${w}x${h}, expected ${ew}x${eh}")
      }

      if ($mode -eq "none") {
        if ($metrics["borderGreenRatio"] -gt 0.5 -or $metrics["borderMagentaRatio"] -gt 0.5) {
          $warns.Add("solid chroma border detected, background may have been generated on a screen")
        }
      } else {
        if ($metrics["cornerDominant"] -lt 1) {
          $fails.Add("corner is not $($asset.backgroundCode) chroma key (rgb dist $(Format-Num $metrics['cornerDist'] 0))")
        }
        if ($metrics["bgRatio"] -lt 0.35) {
          $fails.Add("chroma coverage too low ($(Format-Num ($metrics['bgRatio'] * 100) 1)%), subject may fill frame or screen is dirty")
        }
        if ($metrics["bandBgRatio"] -lt 0.95) {
          $fails.Add("subject or shadow enters the ${BandPct}% margin (edge band purity $(Format-Num ($metrics['bandBgRatio'] * 100) 1)%)")
        }
      }
    } else {
      if ($metrics["hasAlpha"] -lt 1) {
        $fails.Add("cutout must be transparent PNG")
      }
      if ($metrics["opaqueRatio"] -lt 0.02) {
        $fails.Add("cutout looks empty (opaque $(Format-Num ($metrics['opaqueRatio'] * 100) 1)%)")
      }
      if ($metrics["fringeRatio"] -gt 0.06) {
        $fails.Add("chroma fringe on alpha edge ($(Format-Num ($metrics['fringeRatio'] * 100) 1)%)")
      } elseif ($metrics["fringeRatio"] -gt 0.02) {
        $warns.Add("some chroma fringe on alpha edge ($(Format-Num ($metrics['fringeRatio'] * 100) 1)%)")
      }
    }
  }

  $status = if ($fails.Count -gt 0) { "FAIL" } elseif ($warns.Count -gt 0) { "WARN" } else { "PASS" }
  $result = [pscustomobject]@{
    id         = $asset.id
    index      = $asset.index
    priority   = $asset.priority
    expected   = $asset.output
    file       = if ($file) { $file.FullName } else { $null }
    stage      = $Stage
    background = $asset.backgroundCode
    status     = $status
    failures   = @($fails)
    warnings   = @($warns)
    metrics    = $metrics
  }
  $results.Add($result)

  $color = switch ($status) { "PASS" { "Green" } "WARN" { "Yellow" } default { "Red" } }
  $detail = if ($fails.Count -gt 0) { $fails -join "; " } elseif ($warns.Count -gt 0) { $warns -join "; " } else { "ok" }
  $size = if ($metrics) { "$([int]$metrics['width'])x$([int]$metrics['height'])" } else { "-" }
  Write-Host ("[{0}] {1,2}. {2,-24} {3,-11} {4}" -f $status, $asset.index, $asset.id, $size, $detail) -ForegroundColor $color
}

$pass = @($results | Where-Object { $_.status -eq "PASS" }).Count
$warn = @($results | Where-Object { $_.status -eq "WARN" }).Count
$fail = @($results | Where-Object { $_.status -eq "FAIL" }).Count

Write-Host ""
Write-Host ("Checked $($results.Count) assets: PASS $pass, WARN $warn, FAIL $fail") -ForegroundColor Cyan

$resolvedOut = [IO.Path]::GetFullPath($OutDir)
if (-not (Test-Path -LiteralPath $resolvedOut)) {
  New-Item -ItemType Directory -Path $resolvedOut -Force | Out-Null
}
$reportPath = Join-Path $resolvedOut ("asset-check-{0}.json" -f $Stage)
$results | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $reportPath -Encoding UTF8
Write-Host "Report: $reportPath" -ForegroundColor Cyan

if ($Sheets -and $foundFiles.Count -gt 0) {
  $chunkSize = 20
  $sheetIndex = 0
  for ($i = 0; $i -lt $foundFiles.Count; $i += $chunkSize) {
    $sheetIndex++
    $chunk = $foundFiles[$i..([Math]::Min($i + $chunkSize - 1, $foundFiles.Count - 1))]
    $sheetPath = Join-Path $resolvedOut ("contact-{0}-{1:00}.png" -f $Stage, $sheetIndex)
    [AssetImageTools]::MakeContactSheet(($chunk -join "|"), $sheetPath, 5, 440, "#E8DCC3")
    Write-Host "Contact sheet: $sheetPath" -ForegroundColor Cyan
  }
}

if ($fail -gt 0) { exit 1 }
exit 0
