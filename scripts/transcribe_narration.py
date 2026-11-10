# -*- coding: utf-8 -*-
"""Transcribe narration with faster-whisper (word timestamps) for audio sync."""
import json
import os
import sys

from faster_whisper import WhisperModel

AUDIO = sys.argv[1] if len(sys.argv) > 1 else r"C:/Users/GF/Downloads/高处不胜寒的真相/口播音频.wav"
OUT = sys.argv[2] if len(sys.argv) > 2 else "scripts/out/narration-asr.json"
MODEL_SIZE = os.environ.get("WHISPER_MODEL", "small")

os.makedirs(os.path.dirname(OUT), exist_ok=True)

model = WhisperModel(
    MODEL_SIZE,
    device="cpu",
    compute_type="int8",
    download_root=os.path.expanduser("~/.cache/faster-whisper"),
    cpu_threads=max(2, (os.cpu_count() or 4)),
)

segments, info = model.transcribe(
    AUDIO,
    language="zh",
    beam_size=5,
    vad_filter=True,
    vad_parameters={"min_silence_duration_ms": 300},
    word_timestamps=True,
    initial_prompt="以下是普通话科学科普节目的口播：夏天去爬山，山脚下还穿着短袖汗流浃背，到了山顶却冻得瑟瑟发抖。为什么海拔越高气温越低？",
)

out = {
    "model": MODEL_SIZE,
    "duration": info.duration,
    "segments": [],
}
for seg in segments:
    words = [
        {"start": round(w.start, 3), "end": round(w.end, 3), "word": w.word}
        for w in (seg.words or [])
    ]
    out["segments"].append(
        {
            "start": round(seg.start, 3),
            "end": round(seg.end, 3),
            "text": seg.text,
            "words": words,
        }
    )
    print(f"[{seg.start:7.2f} -> {seg.end:7.2f}] {seg.text}")

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

print(f"\nSaved {len(out['segments'])} segments -> {OUT}")
