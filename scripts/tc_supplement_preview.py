"""Inspect the 25 supplementary paper-cut plates and build numbered contact sheets."""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = r"D:/下载/跳槽马AI视频-20261110T134214Z-1-001/跳槽马AI视频/04-剪纸素材-补充"
PREV = os.path.join(ROOT, "scripts", "_preview")
os.makedirs(PREV, exist_ok=True)
FONT = r"C:/Windows/Fonts/msyh.ttc"

files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(".png"))
print("count", len(files))
for i, f in enumerate(files):
    im = Image.open(os.path.join(SRC, f))
    corner = im.convert("RGBA").getpixel((0, 0))
    print(f"{i:02d} {f} | {im.size} | {im.mode} | corner={corner}")

font = ImageFont.truetype(FONT, 17)
per_sheet = 9
cols, tw, th = 3, 480, 330
for s in range((len(files) + per_sheet - 1) // per_sheet):
    chunk = files[s * per_sheet:(s + 1) * per_sheet]
    sheet = Image.new("RGB", (cols * tw, ((len(chunk) + cols - 1) // cols) * th), (40, 34, 28))
    d = ImageDraw.Draw(sheet)
    for j, f in enumerate(chunk):
        idx = s * per_sheet + j
        im = Image.open(os.path.join(SRC, f)).convert("RGBA")
        base = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(base, im).convert("RGB")
        im.thumbnail((tw - 16, th - 52))
        x, y = (j % cols) * tw + 8, (j // cols) * th + 6
        sheet.paste(im, (x, y))
        d.text(((j % cols) * tw + 10, (j // cols) * th + th - 42),
               f"[{idx:02d}] {f}", fill=(244, 226, 192), font=font)
    dest = os.path.join(PREV, f"supp-{s + 1}.png")
    sheet.save(dest)
    print("sheet", dest)
