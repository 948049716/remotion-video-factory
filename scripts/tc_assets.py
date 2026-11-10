"""Step 1: cut the paper-cut sprite sheets into usable transparent parts."""
import json
import os
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ART = r"D:/下载/跳槽马AI视频-20261110T134214Z-1-001/跳槽马AI视频/03-剪纸素材"
SUPP_ART = r"D:/下载/跳槽马AI视频-20261110T134214Z-1-001/跳槽马AI视频/04-剪纸素材-补充"
OUT = os.path.join(ROOT, "public", "tiaocaoma")
PREV = os.path.join(os.path.dirname(__file__), "_preview")
FONT = r"C:/Windows/Fonts/msyh.ttc"
for p in (OUT, os.path.join(OUT, "bg"), os.path.join(OUT, "parts"),
          os.path.join(OUT, "mouths"), PREV):
    os.makedirs(p, exist_ok=True)

FULL = {
    "bg-stable-day.png": "01-背景/P0-01-BG-03-马棚白天.png",
    "bg-street.png": "01-背景/P1-01-BG-01-街市饭馆外景白天.png",
    "bg-inn.png": "01-背景/P1-02-BG-02-饭馆前堂.png",
    "bg-stable-dusk.png": "01-背景/P2-01-BG-04-马棚黄昏.png",
    "bg-stable-empty.png": "01-背景/P3-03-BG-05-马棚空景无马槽.png",
    "title.png": "05-特效与标题/P2-10-片头-跳槽马剪纸标题.png",
    "ending.png": "05-特效与标题/P3-04-片尾-人不如马.png",
}
SHEETS = {
    "char-scar": "02-角色/P0-02-CH-01-刀疤脸-剪纸拆件.png",
    "char-waiter": "02-角色/P0-03-CH-02-店小二-剪纸拆件.png",
    "char-horse-white": "02-角色/P0-04-CH-03-赛赤兔-剪纸拆件.png",
    "char-zhao": "02-角色/P1-03-CH-04-赵大人-剪纸拆件.png",
    "char-firstlord": "02-角色/P1-04-CH-05-一品大员-剪纸拆件.png",
    "char-horses3": "02-角色/P1-05-CH-09-群马三匹-剪纸.png",
    "char-crowd": "02-角色/P1-06-CH-10-众官员食客剪影.png",
    "char-boy": "02-角色/P2-02-CH-06-小童-剪纸拆件.png",
    "char-horse-red": "02-角色/P2-03-CH-07-枣红马-剪纸拆件.png",
    "char-horse-black": "02-角色/P2-04-CH-08-黑马-剪纸拆件.png",
    "expr-waiter-scar": "02-角色/P3-01-表情-店小二刀疤脸.png",
    "expr-zhao-lord": "02-角色/P3-02-表情-赵大人一品大员.png",
    "prop-manger": "03-道具/P0-05-PR-马槽.png",
    "prop-fodder": "03-道具/P0-06-PR-草料三种.png",
    "prop-post-rope": "03-道具/P2-05-PR-木桩缰绳粗绳.png",
    "prop-stick-sword-arm": "03-道具/P2-06-PR-小木棍长剑木假臂.png",
    "prop-wine-peanuts": "03-道具/P2-07-PR-酒壶酒杯花生米托盘.png",
    "prop-sign": "03-道具/P2-08-PR-饭馆招牌幌子.png",
    "fx-sunset": "05-特效与标题/P2-09-FX-夕阳云风尘土.png",
    "fx-tear": "05-特效与标题/P3-05-FX-纸撕转场.png",
}
MOUTHS = {
    "mouth-scar-waiter": ("04-口型/P0-07-口型-刀疤脸店小二.png", ("scar", "waiter")),
    "mouth-zhao-lord": ("04-口型/P1-07-口型-赵大人一品大员.png", ("zhao", "firstlord")),
}

# ---- 04-剪纸素材-补充 -------------------------------------------------------
SUPP_FULL = {
    "bg-battle-day.png": "补01-BG-沙场回忆白天.png",
    "bg-battle-dusk.png": "补02-BG-沙场回忆黄昏.png",
    "bg-stable-night.png": "补14-BG-夜景马厩.png",
    "bg-manor-night.png": "补15-BG-官员府邸内院夜.png",
}
# Connected-component splitting (loosely laid-out cut-out parts).
SUPP_AUTO = {
    "supp-general": "补03-CH-青年常胜将军-剪纸拆件.png",
    "supp-rebels": "补04-CH-叛军士兵敌将-剪纸.png",
    "supp-horseking": "补05-CH-马王威风版赛赤兔-剪纸拆件.png",
    "supp-poison": "补06-PR-毒箭地钩刀军帐.png",
    "supp-slash": "补09-CH-赵大人拔剑挥砍三帧剑光.png",
    "supp-swordglow": "补09b-PR-剑光淡蓝.png",
    "supp-arm": "补10-PR-木假臂断裂掉落木屑.png",
    "supp-account": "补16-PR-数花生米手部算盘.png",
    "supp-boy": "补17-CH-小童瞪眼紧张.png",
    "supp-officials": "补18-CH-众官员正面群像.png",
    "supp-bell": "补19-PR-铜铃缰绳解扣木桩特写.png",
    "supp-menu": "补20-PR-招牌菜菜单.png",
    "supp-carriage": "补21-PR-官轿马车品级牌.png",
    "supp-calendar": "补22-PR-日历夜草袋量斗.png",
}
# Grid splitting for pose frames / head sheets: key -> (file, cols, rows).
SUPP_GRID = {
    "supp-ride": ("补07-CH-刀疤脸骑马三帧.png", 3, 1),
    "supp-kneel": ("补08-CH-店小二跪地磕头三帧.png", 3, 1),
    "supp-horseheads": ("补11-CH-群马头位低头抬头.png", 3, 2),
    "supp-chew": ("补12-CH-马咀嚼三帧.png", 3, 1),
    "supp-thinhorses": ("补13-CH-消瘦马匹.png", 3, 1),
    "supp-profile-a": ("补23-CH-侧面半侧面闭眼头-刀疤脸店小二赛赤兔.png", 3, 2),
    "supp-profile-b": ("补24-CH-侧面半侧面闭眼头-赵大人一品小童.png", 3, 2),
    "supp-emo": ("补25-CH-指定情绪表情头.png", 3, 1),
}


def key_white(im: Image.Image) -> Image.Image:
    """Kill only the white studio background connected to the frame edges."""
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w, _ = rgb.shape
    corners = np.concatenate([rgb[:10, :10].reshape(-1, 3), rgb[:10, -10:].reshape(-1, 3),
                              rgb[-10:, :10].reshape(-1, 3), rgb[-10:, -10:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    diff = np.max(np.abs(rgb - bg), axis=2)
    k = 4
    hh, ww = h // k, w // k
    cand = ((diff[:hh * k, :ww * k] < 15)
            .reshape(hh, k, ww, k).mean(axis=(1, 3)) > 0.72)
    seen = np.zeros((hh, ww), bool)
    q = deque()
    for x in range(ww):
        for y in (0, hh - 1):
            if cand[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    for y in range(hh):
        for x in (0, ww - 1):
            if cand[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < hh and 0 <= nx < ww and cand[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    bgcoarse = np.zeros((h, w), bool)
    bgcoarse[:hh * k, :ww * k] = np.repeat(np.repeat(seen, k, 0), k, 1)
    hard = np.where(bgcoarse & (diff < 14), 0, 255).astype(np.uint8)
    soft = np.asarray(Image.fromarray(hard, "L").filter(ImageFilter.GaussianBlur(0.8)), dtype=np.float32)
    soft[~bgcoarse] = 255.0
    a = (soft / 255.0)[..., None]
    fg = (rgb - (1.0 - a) * bg[None, None, :]) / np.maximum(a, 0.08)
    rgba = np.dstack([np.clip(fg, 0, 255), soft]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def parts(rgba: Image.Image, min_area=1600):
    a = np.asarray(rgba.getchannel("A"))
    h, w = a.shape
    k = 4
    hh, ww = h // k, w // k
    solid = a[:hh * k, :ww * k].reshape(hh, k, ww, k).max(axis=(1, 3)) >= 110
    seen = np.zeros((hh, ww), bool)
    boxes = []
    for sy in range(hh):
        for sx in range(ww):
            if not solid[sy, sx] or seen[sy, sx]:
                continue
            q = deque([(sy, sx)]); seen[sy, sx] = True
            x0 = x1 = sx; y0 = y1 = sy; n = 0
            while q:
                y, x = q.popleft(); n += 1
                x0, x1, y0, y1 = min(x0, x), max(x1, x), min(y0, y), max(y1, y)
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < hh and 0 <= nx < ww and solid[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; q.append((ny, nx))
            if n * k * k < min_area:
                continue
            bx0, by0 = max(0, x0 * k - 6), max(0, y0 * k - 6)
            bx1, by1 = min(w, (x1 + 1) * k + 6), min(h, (y1 + 1) * k + 6)
            ys, xs = np.where(a[by0:by1, bx0:bx1] >= 110)
            if not len(xs):
                continue
            boxes.append((bx0 + int(xs.min()), by0 + int(ys.min()),
                          bx0 + int(xs.max()) + 1, by0 + int(ys.max()) + 1))
    boxes.sort(key=lambda b: (b[1], b[0]))
    return boxes


def biggest_box(a, minv=110):
    """BBox of the largest opaque region inside a mouth cell."""
    k = 4
    hh, ww = a.shape[0] // k, a.shape[1] // k
    if hh == 0 or ww == 0:
        return None
    solid = a[:hh * k, :ww * k].reshape(hh, k, ww, k).max(axis=(1, 3)) >= minv
    seen = np.zeros((hh, ww), bool)
    best, best_n = None, 0
    for sy in range(hh):
        for sx in range(ww):
            if not solid[sy, sx] or seen[sy, sx]:
                continue
            q = deque([(sy, sx)]); seen[sy, sx] = True
            x0 = x1 = sx; y0 = y1 = sy; n = 0
            while q:
                y, x = q.popleft(); n += 1
                x0, x1, y0, y1 = min(x0, x), max(x1, x), min(y0, y), max(y1, y)
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < hh and 0 <= nx < ww and solid[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; q.append((ny, nx))
            if n > best_n:
                best_n = n
                best = (x0 * k, y0 * k, (x1 + 1) * k, (y1 + 1) * k)
    return best


def crop_save(rgba, box, dest, pad=8):
    x0, y0, x1, y1 = box
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(rgba.width, x1 + pad), min(rgba.height, y1 + pad)
    im = rgba.crop((x0, y0, x1, y1))
    im.save(dest)
    return {"x": x0, "y": y0, "w": im.width, "h": im.height,
            "cx": round((x0 + im.width / 2) / rgba.width, 4),
            "cy": round((y0 + im.height / 2) / rgba.height, 4)}


def grid_cells(rgba, cols, rows):
    """Tight-crop one animation frame / head per grid cell."""
    W, H = rgba.size
    a = np.asarray(rgba.getchannel("A"))
    out = []
    for r in range(rows):
        for c in range(cols):
            x0, x1 = int(c * W / cols), int((c + 1) * W / cols)
            y0, y1 = int(r * H / rows), int((r + 1) * H / rows)
            sub = a[y0:y1, x0:x1]
            ys, xs = np.where(sub >= 110)
            if not len(xs):
                out.append(None)
                continue
            bx0, by0 = int(xs.min()), int(ys.min())
            bx1, by1 = int(xs.max()) + 1, int(ys.max()) + 1
            clean = np.zeros_like(sub)
            clean[by0:by1, bx0:bx1] = sub[by0:by1, bx0:bx1]
            cell = rgba.crop((x0, y0, x1, y1))
            cell.putalpha(Image.fromarray(clean, "L"))
            out.append((cell, (bx0, by0, bx1, by1)))
    return out


def numbered_sheet(key, files):
    cols, tw, th = 5, 300, 250
    rows = max(1, (len(files) + cols - 1) // cols)
    sheet = Image.new("RGB", (cols * tw, rows * th), (48, 42, 36))
    d = ImageDraw.Draw(sheet)
    font = ImageFont.truetype(FONT, 20)
    for i, name in enumerate(files):
        im = Image.open(os.path.join(OUT, "parts", name)).convert("RGBA")
        im.thumbnail((tw - 24, th - 48))
        x = (i % cols) * tw + (tw - im.width) // 2
        y = (i // cols) * th + 6
        sheet.paste(im, (x, y), im)
        d.text(((i % cols) * tw + 12, (i // cols) * th + th - 38), f"[{i}]  {name}",
               fill=(245, 228, 196), font=font)
    sheet.save(os.path.join(PREV, key + ".png"))


def main():
    for name, rel in FULL.items():
        Image.open(os.path.join(ART, rel)).convert("RGB").save(os.path.join(OUT, "bg", name))
    manifest = {}
    for key, rel in SHEETS.items():
        rgba = key_white(Image.open(os.path.join(ART, rel)))
        boxes = parts(rgba)
        names = []
        for i, box in enumerate(boxes):
            name = f"{key}-{i:02d}.png"
            manifest[name] = crop_save(rgba, box, os.path.join(OUT, "parts", name))
            names.append(name)
        numbered_sheet(key, names)
        print(f"{key}: {len(names)} parts")

    # ---- supplementary plates ----
    for name, rel in SUPP_FULL.items():
        Image.open(os.path.join(SUPP_ART, rel)).convert("RGB").save(
            os.path.join(OUT, "bg", name))
    print(f"supp full-bleed: {len(SUPP_FULL)} backgrounds")

    for key, rel in SUPP_AUTO.items():
        rgba = key_white(Image.open(os.path.join(SUPP_ART, rel)))
        boxes = parts(rgba)
        names = []
        for i, box in enumerate(boxes):
            name = f"{key}-{i:02d}.png"
            manifest[name] = crop_save(rgba, box, os.path.join(OUT, "parts", name))
            names.append(name)
        numbered_sheet(key, names)
        print(f"{key}: {len(names)} parts")

    for key, (rel, cols, rows) in SUPP_GRID.items():
        rgba = key_white(Image.open(os.path.join(SUPP_ART, rel)))
        cells = grid_cells(rgba, cols, rows)
        names = []
        for i, item in enumerate(cells):
            if item is None:
                continue
            cell, box = item
            name = f"{key}-{i:02d}.png"
            manifest[name] = crop_save(cell, box, os.path.join(OUT, "parts", name))
            names.append(name)
        numbered_sheet(key, names)
        print(f"{key}: {len(names)} cells ({cols}x{rows})")

    # Mouth sheets: 4 visemes x 2 characters, evenly spaced 4x2 grid.
    for key, (rel, roles) in MOUTHS.items():
        rgba = key_white(Image.open(os.path.join(ART, rel)))
        W, H = rgba.size
        a = np.asarray(rgba.getchannel("A"))
        for row, role in enumerate(roles):
            for col in range(4):
                x0 = max(0, int(col * W / 4) - 14)
                x1 = min(W, int((col + 1) * W / 4) + 14)
                y0 = max(0, int(row * H / 2) - 14)
                y1 = min(H, int((row + 1) * H / 2) + 14)
                sub = a[y0:y1, x0:x1]
                bb = biggest_box(sub)
                if bb is None:
                    raise RuntimeError(f"empty mouth cell {key} {row} {col}")
                clean = np.zeros_like(sub)
                bx0, by0, bx1, by1 = bb
                clean[by0:by1, bx0:bx1] = sub[by0:by1, bx0:bx1]
                cell = rgba.crop((x0, y0, x1, y1))
                cell.putalpha(Image.fromarray(clean, "L"))
                ys, xs = np.where(clean >= 110)
                box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
                crop_save(cell, box, os.path.join(OUT, "mouths", f"{role}-{col}.png"), pad=4)
        print(f"{key}: 8 visemes -> {roles}")
    with open(os.path.join(OUT, "parts", "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    print("DONE")


if __name__ == "__main__":
    main()
