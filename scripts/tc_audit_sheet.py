"""Build numbered contact sheets from the batch-rendered audit stills."""
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AUDIT = os.path.join(ROOT, "out", "tc-audit")
OUT = os.path.join(ROOT, "out")
FONT = r"C:/Windows/Fonts/msyh.ttc"

files = [f for f in os.listdir(AUDIT) if f.endswith(".png")]
files.sort(key=lambda f: int(re.search(r"-(\d+)\.png$", f).group(1)))
print("stills", len(files))

COLS, PER, TW, TH, LABEL = 4, 16, 480, 270, 30
font = ImageFont.truetype(FONT, 16)
for s in range((len(files) + PER - 1) // PER):
    chunk = files[s * PER:(s + 1) * PER]
    rows = (len(chunk) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * TW, rows * (TH + LABEL)), (32, 25, 19))
    d = ImageDraw.Draw(sheet)
    for i, name in enumerate(chunk):
        im = Image.open(os.path.join(AUDIT, name)).convert("RGB").resize((TW, TH), Image.LANCZOS)
        x, y = (i % COLS) * TW, (i // COLS) * (TH + LABEL)
        sheet.paste(im, (x, y))
        d.rectangle((x, y + TH, x + TW, y + TH + LABEL), fill=(42, 33, 26))
        d.text((x + 8, y + TH + 6), name.replace(".png", ""), fill=(240, 222, 190), font=font)
    dest = os.path.join(OUT, f"tc-audit-sheet-{s + 1}.png")
    sheet.save(dest)
    print(dest, sheet.size)
