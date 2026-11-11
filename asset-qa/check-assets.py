#!/usr/bin/env python3
"""图片素材交付验收闸门（Linux / macOS / Windows 通用）。

依赖：Python 3.8+、Pillow（pip install pillow）。
检查项与 check-assets.ps1 一致：文件名、像素、幕布纯度、主体边距、重复图、抠图边残。
返回码 0 表示整批通过，1 表示存在 FAIL，2 表示没有选中素材或输入缺失。
"""

import argparse
import hashlib
import json
import math
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps, ImageStat
except ImportError:
    print("Missing dependency: Pillow. Install it with: python3 -m pip install pillow", file=sys.stderr)
    sys.exit(2)

SCRIPT_DIR = Path(__file__).resolve().parent
EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp")


def gt_diff(channel, other, threshold):
    """channel - other > threshold 的二值掩膜。"""
    return ImageChops.subtract(channel, other).point(lambda v: 255 if v > threshold else 0)


def count_white(mask):
    return mask.histogram()[255]


def build_rect_mask(size, rects):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    for box in rects:
        draw.rectangle(box, fill=255)
    return mask


def inspect_image(path, key_mode, tolerance=90, band_pct=6):
    """返回与 PowerShell 版一致的指标字典。"""
    with Image.open(path) as src:
        has_alpha = src.mode in ("RGBA", "LA") or (src.mode == "P" and "transparency" in src.info)
        im = src.convert("RGBA")

    w, h = im.size
    r, g, b, a = im.split()

    green_dom = ImageChops.multiply(gt_diff(g, r, 40), gt_diff(g, b, 40))
    magenta_dom = ImageChops.multiply(gt_diff(r, g, 40), gt_diff(b, g, 40))

    use_green = key_mode in ("green", "green-alpha")
    use_magenta = key_mode == "magenta"

    if use_green:
        bg_mask = green_dom
        key = (0, 255, 0)
    elif use_magenta:
        bg_mask = magenta_dom
        key = (255, 0, 255)
    else:
        bg_mask = Image.new("L", (w, h), 0)
        key = None

    total = w * h
    bg_count = count_white(bg_mask)

    # 四角 6x6 均值与幕布判断
    corner_boxes = [
        (0, 0, min(6, w), min(6, h)),
        (max(0, w - 6), 0, w, min(6, h)),
        (0, max(0, h - 6), min(6, w), h),
        (max(0, w - 6), max(0, h - 6), w, h),
    ]
    sums = [0.0, 0.0, 0.0]
    samples = 0
    for box in corner_boxes:
        region = im.crop(box)
        px = samples = samples + region.size[0] * region.size[1]
        stat = ImageStat.Stat(region)
        sums[0] += stat.sum[0]
        sums[1] += stat.sum[1]
        sums[2] += stat.sum[2]
    avg_r, avg_g, avg_b = (sums[0] / px, sums[1] / px, sums[2] / px)

    corner_dist = -1.0
    corner_dominant = False
    if key is not None:
        corner_dist = math.sqrt((avg_r - key[0]) ** 2 + (avg_g - key[1]) ** 2 + (avg_b - key[2]) ** 2)
        if use_green:
            corner_dominant = avg_g > avg_r + 30 and avg_g > avg_b + 30
        else:
            corner_dominant = avg_r > avg_g + 30 and avg_b > avg_g + 30

    band_w = max(1, round(w * band_pct / 100.0))
    band_h = max(1, round(h * band_pct / 100.0))
    border = max(1, round(min(w, h) * 0.02))

    band_mask = build_rect_mask(
        (w, h),
        [
            (0, 0, w - 1, band_h - 1),
            (0, h - band_h, w - 1, h - 1),
            (0, 0, band_w - 1, h - 1),
            (w - band_w, 0, w - 1, h - 1),
        ],
    )
    band_total = count_white(band_mask)
    band_bg = count_white(ImageChops.multiply(bg_mask, band_mask))

    semi = a.point(lambda v: 255 if 0 < v < 250 else 0)
    semi_count = count_white(semi)
    fringe = count_white(ImageChops.multiply(semi, bg_mask))
    opaque = count_white(a.point(lambda v: 255 if v >= 250 else 0))

    border_mask = build_rect_mask(
        (w, h),
        [
            (0, 0, w - 1, border - 1),
            (0, h - border, w - 1, h - 1),
            (0, 0, border - 1, h - 1),
            (w - border, 0, w - 1, h - 1),
        ],
    )
    border_total = count_white(border_mask)
    border_green = count_white(ImageChops.multiply(border_mask, green_dom))
    border_magenta = count_white(ImageChops.multiply(border_mask, magenta_dom))

    bbox = ImageOps.invert(bg_mask).getbbox()
    if bbox:
        min_x, min_y, max_x, max_y = bbox
        margins = {
            "marginLeft": round(100.0 * min_x / w, 2),
            "marginTop": round(100.0 * min_y / h, 2),
            "marginRight": round(100.0 * (w - 1 - (max_x - 1)) / w, 2),
            "marginBottom": round(100.0 * (h - 1 - (max_y - 1)) / h, 2),
        }
    else:
        margins = {"marginLeft": -1, "marginTop": -1, "marginRight": -1, "marginBottom": -1}

    return {
        "width": w,
        "height": h,
        "hasAlpha": 1 if has_alpha else 0,
        "cornerDist": round(corner_dist, 1),
        "cornerDominant": 1 if corner_dominant else 0,
        "bgRatio": round(bg_count / total, 3),
        "bandBgRatio": round(band_bg / band_total, 3) if band_total else -1,
        "semiRatio": round(semi_count / total, 3),
        "fringeRatio": round(fringe / semi_count, 3) if semi_count else 0,
        "opaqueRatio": round(opaque / total, 3),
        "borderGreenRatio": round(border_green / border_total, 3) if border_total else 0,
        "borderMagentaRatio": round(border_magenta / border_total, 3) if border_total else 0,
        **margins,
    }


def find_asset_file(root, output):
    base = Path(output).stem
    for ext in EXTENSIONS:
        candidate = root / (base + ext)
        if candidate.is_file():
            return candidate
    return None


def file_hash(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def make_contact_sheet(files, output, columns=5, thumb_w=440):
    cell_w = thumb_w + 24
    cell_h = round(thumb_w * 0.75) + 52
    rows = math.ceil(len(files) / columns)
    sheet = Image.new("RGB", (cell_w * columns, cell_h * rows), (232, 220, 195))

    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 12)
    except OSError:
        font = ImageFont.load_default()

    draw = ImageDraw.Draw(sheet)
    box_w, box_h = thumb_w, round(thumb_w * 0.75)
    tile = 16
    for index, path in enumerate(files):
        col, row = index % columns, index // columns
        x, y = col * cell_w + 12, row * cell_h + 12

        for yy in range(0, box_h, tile):
            for xx in range(0, box_w, tile):
                color = (232, 220, 195) if (xx // tile + yy // tile) % 2 == 0 else (218, 204, 176)
                draw.rectangle(
                    [x + xx, y + yy, x + min(xx + tile, box_w) - 1, y + min(yy + tile, box_h) - 1],
                    fill=color,
                )
        draw.rectangle([x, y, x + box_w - 1, y + box_h - 1], outline=(201, 185, 154))

        try:
            with Image.open(path) as source:
                thumb = source.convert("RGBA")
                thumb.thumbnail((box_w, box_h), Image.Resampling.LANCZOS)
                width, height = thumb.size
                sheet.paste(thumb, (x + (box_w - width) // 2, y + (box_h - height) // 2), thumb)
        except Exception:
            pass

        draw.text((x + 2, y + box_h + 6), Path(path).name, fill=(28, 26, 23), font=font)

    sheet.save(output)


def parse_args():
    parser = argparse.ArgumentParser(description="Asset acceptance gate (cross-platform).")
    parser.add_argument("--stage", choices=["raw", "cutout"], default="raw")
    parser.add_argument("--root", default=str(SCRIPT_DIR / "raw"))
    parser.add_argument("--list", dest="list_path", default=str(SCRIPT_DIR / "asset-list.json"))
    parser.add_argument("--out", dest="out_dir", default=str(SCRIPT_DIR / "out"))
    parser.add_argument("--only", default="", help="comma separated ids or filenames")
    parser.add_argument("--priority", type=int, default=0)
    parser.add_argument("--sheets", action="store_true")
    parser.add_argument("--tolerance", type=int, default=90)
    parser.add_argument("--band-pct", type=int, default=6)
    return parser.parse_args()


def main():
    args = parse_args()
    root = Path(args.root)
    list_path = Path(args.list_path)
    out_dir = Path(args.out_dir)

    if not list_path.is_file():
        print(f"Asset list not found: {list_path}", file=sys.stderr)
        return 2
    if not root.is_dir():
        print(f"Asset root not found: {root}", file=sys.stderr)
        return 2

    with open(list_path, "r", encoding="utf-8-sig") as handle:
        data = json.load(handle)

    only = {item.strip() for item in args.only.split(",") if item.strip()}
    targets = [a for a in data["assets"] if a.get("source") != "code" and a.get("output")]
    if only:
        targets = [a for a in targets if a["id"] in only or Path(a["output"]).stem in only]
    if args.priority:
        targets = [a for a in targets if int(a["priority"]) == args.priority]

    if not targets:
        print("No assets selected.")
        return 2

    hashes = {}
    for asset in targets:
        path = find_asset_file(root, asset["output"])
        if path:
            hashes.setdefault(file_hash(path), []).append(asset["id"])

    results = []
    found = []
    for asset in targets:
        failures, warnings = [], []
        path = find_asset_file(root, asset["output"])
        metrics = None

        if path is None:
            failures.append(f"missing file: {asset['output']}")
        else:
            found.append(path)
            others = [item for item in hashes.get(file_hash(path), []) if item != asset["id"]]
            if others:
                failures.append("duplicate image, also used by " + ", ".join(others))

            mode = asset.get("backgroundCode", "none")
            if mode in ("code-only", "full-bleed"):
                mode = "none"

            metrics = inspect_image(path, mode, args.tolerance, args.band_pct)
            width, height = metrics["width"], metrics["height"]

            if args.stage == "raw":
                expected_w, expected_h = (int(v) for v in asset["pixels"].split("x"))
                if abs(width - expected_w) > 1 or abs(height - expected_h) > 1:
                    failures.append(f"size {width}x{height}, expected {expected_w}x{expected_h}")

                if mode == "none":
                    if metrics["borderGreenRatio"] > 0.5 or metrics["borderMagentaRatio"] > 0.5:
                        warnings.append("solid chroma border detected, background may have been generated on a screen")
                else:
                    if metrics["cornerDominant"] < 1:
                        failures.append(
                            f"corner is not {asset['backgroundCode']} chroma key (rgb dist {metrics['cornerDist']:.0f})"
                        )
                    if metrics["bgRatio"] < 0.35:
                        failures.append(
                            f"chroma coverage too low ({metrics['bgRatio'] * 100:.1f}%), subject may fill frame or screen is dirty"
                        )
                    if metrics["bandBgRatio"] < 0.95:
                        failures.append(
                            f"subject or shadow enters the {args.band_pct}% margin (edge band purity {metrics['bandBgRatio'] * 100:.1f}%)"
                        )
            else:
                if metrics["hasAlpha"] < 1:
                    failures.append("cutout must be transparent PNG")
                if metrics["opaqueRatio"] < 0.02:
                    failures.append(f"cutout looks empty (opaque {metrics['opaqueRatio'] * 100:.1f}%)")
                if metrics["fringeRatio"] > 0.06:
                    failures.append(f"chroma fringe on alpha edge ({metrics['fringeRatio'] * 100:.1f}%)")
                elif metrics["fringeRatio"] > 0.02:
                    warnings.append(f"some chroma fringe on alpha edge ({metrics['fringeRatio'] * 100:.1f}%)")

        status = "FAIL" if failures else ("WARN" if warnings else "PASS")
        detail = "; ".join(failures or warnings) or "ok"
        size = f"{metrics['width']}x{metrics['height']}" if metrics else "-"
        print(f"[{status}] {asset['index']:>2}. {asset['id']:<24} {size:<11} {detail}")

        results.append(
            {
                "id": asset["id"],
                "index": asset["index"],
                "priority": asset["priority"],
                "expected": asset["output"],
                "file": str(path) if path else None,
                "stage": args.stage,
                "background": asset.get("backgroundCode"),
                "status": status,
                "failures": failures,
                "warnings": warnings,
                "metrics": metrics,
            }
        )

    passed = sum(1 for item in results if item["status"] == "PASS")
    warned = sum(1 for item in results if item["status"] == "WARN")
    failed = sum(1 for item in results if item["status"] == "FAIL")
    print()
    print(f"Checked {len(results)} assets: PASS {passed}, WARN {warned}, FAIL {failed}")

    out_dir.mkdir(parents=True, exist_ok=True)
    report_path = out_dir / f"asset-check-{args.stage}.json"
    report_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Report: {report_path}")

    if args.sheets and found:
        for index in range(0, len(found), 20):
            sheet_path = out_dir / f"contact-{args.stage}-{index // 20 + 1:02d}.png"
            make_contact_sheet(found[index : index + 20], sheet_path)
            print(f"Contact sheet: {sheet_path}")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
