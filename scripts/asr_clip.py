# -*- coding: utf-8 -*-
from faster_whisper import WhisperModel
model = WhisperModel("small", device="cpu", compute_type="int8")
segs, info = model.transcribe(
    "scripts/out/clip-163-210.wav", language="zh", beam_size=5,
    temperature=0.0, vad_filter=False, word_timestamps=False,
    initial_prompt="三、空气的自我消耗。大气层里的空气；随着高度增加，空气的密度逐渐下降。当海拔升高到8800米左右，珠峰高度时，空气密度只剩三分之一。高空中的空气比较稀薄，单位体积内包含的空气分子更少了。",
)
for s in segs:
    print(f"[{s.start + 163:.2f} -> {s.end + 163:.2f}] {s.text.strip()}", flush=True)
