"""Assemble the rendered QC stills into one portfolio contact sheet."""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "out")
FONT = r"C:/Windows/Fonts/msyh.ttc"

SHOTS = [
    ("tc-000060.png", "01  片头 · 剪纸标题卡"),
    ("tc-002000.png", "02  壹 · 官阶马槽信息图"),
    ("tc-003000.png", "03  壹 · 三种草料入槽"),
    ("tc-005700.png", "04  壹 · 店小二训话（波形口型）"),
    ("tc-009000.png", "05  贰 · 刀疤脸与赛赤兔登场"),
    ("tc-011900.png", "06  贰 · 赵大人质问（波形口型）"),
    ("tc-036000.png", "07  陆 · 拔剑断臂 · 喀嚓"),
    ("tc-040000.png", "08  陆 · 马王回忆 · 意象剪影"),
    ("tc-042200.png", "09  片尾 · 人不如马"),
]

TW, TH, LABEL, HEADER, COLS = 640, 360, 40, 104, 3
rows = (len(SHOTS) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * TW, HEADER + rows * (TH + LABEL)), (32, 25, 19))
d = ImageDraw.Draw(sheet)
title_font = ImageFont.truetype(FONT, 42)
sub_font = ImageFont.truetype(FONT, 20)
label_font = ImageFont.truetype(FONT, 19)

d.text((34, 18), "跳槽马 · 剪纸定格动画", fill=(244, 226, 192), font=title_font)
d.text((36, 70), "1920×1080  /  60fps  /  11′45″  /  54 段配音 · 逐帧波形口型同步",
       fill=(186, 160, 128), font=sub_font)
d.line((34, HEADER - 8, COLS * TW - 34, HEADER - 8), fill=(178, 43, 36), width=3)

for i, (name, label) in enumerate(SHOTS):
    path = os.path.join(OUT, name)
    if not os.path.exists(path):
        continue
    im = Image.open(path).convert("RGB").resize((TW, TH), Image.LANCZOS)
    x = (i % COLS) * TW
    y = HEADER + (i // COLS) * (TH + LABEL)
    sheet.paste(im, (x, y))
    d.rectangle((x, y + TH, x + TW, y + TH + LABEL), fill=(42, 33, 26))
    d.text((x + 16, y + TH + 8), label, fill=(240, 222, 190), font=label_font)

dest = os.path.join(OUT, "跳槽马-作品集预览.png")
sheet.save(dest)
print(dest, sheet.size)
