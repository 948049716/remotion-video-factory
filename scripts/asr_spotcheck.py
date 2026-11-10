# -*- coding: utf-8 -*-
import json, sys
from faster_whisper import WhisperModel

SRC = "public/high-altitude/narration.mp3"
model = WhisperModel("small", device="cpu", compute_type="int8", download_root=None)
for a, b in [(134.0, 210.0)]:
    segs, info = model.transcribe(
        SRC, language="zh", beam_size=10, temperature=0.0,
        vad_filter=False, word_timestamps=True,
        initial_prompt="三、空气的自我消耗。大气层里的空气，随着高度增加，密度逐渐下降。当海拔升高到8800米左右，珠峰高度时，空气密度只剩三分之一。高空中的空气比较稀薄，单位体积内包含的空气分子更少了，分子之间的碰撞变少了，无法保持温度。",
        clip_timestamps=f"{a},{b}",
    )
    for s in segs:
        print(f"[{s.start + a:.2f} -> {s.end + a:.2f}] {s.text.strip()}")
