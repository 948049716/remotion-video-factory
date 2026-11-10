"""Preview the 16 extracted visemes for visual QA."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIR = os.path.join(ROOT, "public", "tiaocaoma", "mouths")
PREV = os.path.join(os.path.dirname(__file__), "_preview")
os.makedirs(PREV, exist_ok=True)
files = sorted(f for f in os.listdir(DIR) if f.endswith(".png"))
sheet = Image.new("RGB", (4 * 320, 4 * 300), (48, 42, 36))
d = ImageDraw.Draw(sheet)
font = ImageFont.truetype(r"C:/Windows/Fonts/msyh.ttc", 18)
for i, name in enumerate(files):
    im = Image.open(os.path.join(DIR, name)).convert("RGBA")
    im.thumbnail((290, 250))
    x, y = (i % 4) * 320 + 15, (i // 4) * 300 + 8
    sheet.paste(im, (x, y), im)
    d.text((x, y + 255), name, fill=(245, 228, 196), font=font)
sheet.save(os.path.join(PREV, "mouths.png"))
print(files)
