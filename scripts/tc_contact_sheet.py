"""Build the final portfolio contact sheet from the latest audit stills."""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AUDIT = os.path.join(ROOT, "out", "tc-audit")
OUT = os.path.join(ROOT, "out")
FONT = r"C:/Windows/Fonts/msyh.ttc"

# (audit frame prefix, caption)
SHOTS = [
    ("00-first", "01  片头 · 剪纸标题卡"),
    ("01-mid", "02  开场街市 · 菜单/马车/招牌菜"),
    ("02-mid", "03  壹 · 官阶马槽信息图"),
    ("04-mid", "04  壹 · 店小二训话（波形口型）"),
    ("06-mid", "05  贰 · 刀疤脸骑马三帧"),
    ("12-mid", "06  贰 · 赵大人质问（波形口型）"),
    ("18-mid", "07  贰 · 咀嚼特写 + 铜铃"),
    ("21-mid", "08  叁 · 数花生米/算盘/账本"),
    ("24-mid", "09  叁 · 扑通跪地三帧"),
    ("33-mid", "10  肆 · 「赛赤兔」连环画"),
    ("42-mid", "11  伍 · 夜草蒙太奇"),
    ("46-mid", "12  陆 · 拔剑断臂 · 喀嚓"),
    ("49-mid", "13  陆 · 沙场回忆 · 常胜将军"),
    ("52-mid", "14  陆 · 沙场 · 马王"),
    ("53-mid", "15  陆 · 人马相望"),
    ("54-mid", "16  片尾 · 人不如马"),
]


def resolve(prefix: str) -> str:
    hits = sorted(f for f in os.listdir(AUDIT)
                 if f.startswith(prefix + "-") and f.endswith(".png"))
    if not hits:
        raise FileNotFoundError(f"no audit still for {prefix}")
    return os.path.join(AUDIT, hits[0])


COLS, TW, TH, LABEL, HEADER = 4, 480, 270, 30, 100
rows = (len(SHOTS) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * TW, HEADER + rows * (TH + LABEL)), (32, 25, 19))
d = ImageDraw.Draw(sheet)
title_font = ImageFont.truetype(FONT, 40)
sub_font = ImageFont.truetype(FONT, 19)
label_font = ImageFont.truetype(FONT, 16)

d.text((32, 14), "跳槽马 · 剪纸定格动画", fill=(244, 226, 192), font=title_font)
d.text((34, 64), "1920×1080 / 60fps / 11′45″ / 54 段配音 · 逐帧波形口型 · 全镜头审计通过",
       fill=(186, 160, 128), font=sub_font)
d.line((32, HEADER - 6, COLS * TW - 32, HEADER - 6), fill=(178, 43, 36), width=3)

for i, (prefix, caption) in enumerate(SHOTS):
    im = Image.open(resolve(prefix)).convert("RGB").resize((TW, TH), Image.LANCZOS)
    x, y = (i % COLS) * TW, HEADER + (i // COLS) * (TH + LABEL)
    sheet.paste(im, (x, y))
    d.rectangle((x, y + TH, x + TW, y + TH + LABEL), fill=(42, 33, 26))
    d.text((x + 10, y + TH + 6), caption, fill=(240, 222, 190), font=label_font)

dest = os.path.join(OUT, "跳槽马-作品集预览.png")
sheet.save(dest)
print(dest, sheet.size)
