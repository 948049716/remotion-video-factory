"""Fill the missing audio with edgeTTS (the same engine as the original VO).

Two deliverables
----------------
1. Ambience / crowd-reaction voice layers -> public/tiaocaoma/ambience/*.mp3
   plus a typed schedule (data/ambience.ts). These cover the "no environment
   sound" gap and add a human layer on top of the five foley events.
2. Word-level timestamps for all 54 original clips -> data/wordTimes.ts.
   edgeTTS WordBoundary metadata is fused with the measured waveform envelope
   so the character times land exactly inside the real voice activity.
   The original 54 MP3s are NOT replaced.

Pure sound effects (wood knocks, bell, sword) and the score cannot be produced
by a TTS engine; the existing synthesised WAV/MP3 stay in place.

Run: python scripts/tc_edge_audio.py
"""
from __future__ import annotations

import asyncio
import json
import os
import subprocess
import sys

import edge_tts

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BASE = r"D:/下载/跳槽马AI视频-20261110T134214Z-1-001/跳槽马AI视频/02-音频与时刻表"
TT = json.load(open(os.path.join(BASE, "音频时刻表.json"), encoding="utf-8"))
PUBLIC = os.path.join(ROOT, "public", "tiaocaoma")
DATA = os.path.join(ROOT, "src", "videos", "Tiaocaoma", "data")
AMB = os.path.join(PUBLIC, "ambience")
os.makedirs(AMB, exist_ok=True)
os.makedirs(DATA, exist_ok=True)
FPS = 60

NARRATOR = "zh-CN-YunjianNeural"
WAITER = "zh-CN-YunxiNeural"
GENERAL = "zh-CN-YunyangNeural"
INNER = "zh-CN-YunxiaNeural"

# ---------------------------------------------------------------- voice layers
CLIPS = [
    dict(file="street_hawk.mp3", text="豆瓣鱼、龙脆骨、驴打滚，刚出锅嘞，客官里边请！",
         voice=NARRATOR, rate="+12%"),
    dict(file="street_chatter.mp3", text="听说城西新开的那家馆子，天天满座。",
         voice=WAITER, rate="+8%"),
    dict(file="inn_welcome.mp3", text="两位客官里边请，楼上雅座！",
         voice=WAITER, rate="+15%"),
    dict(file="inn_chatter.mp3", text="这豆瓣鱼真够味儿，再来一壶好酒！",
         voice=GENERAL, rate="+5%"),
    dict(file="stable_groom.mp3", text="吁——都别抢，各吃各的！",
         voice=GENERAL, rate="+0%"),
    dict(file="stable_groom2.mp3", text="哎哎，吃草啊，别愣着！",
         voice=WAITER, rate="+12%"),
    dict(file="official_yes.mp3", text="是，大人。",
         voice=GENERAL, rate="+0%"),
    dict(file="crowd_gasp.mp3", text="啊！",
         voice=WAITER, rate="+0%"),
    dict(file="crowd_murmur.mp3", text="这……这是怎么回事？",
         voice=INNER, rate="+0%"),
    dict(file="horse_call.mp3", text="驾！",
         voice=GENERAL, rate="+0%"),
    dict(file="laugh_short.mp3", text="呵呵，有意思。",
         voice=INNER, rate="+10%"),
    dict(file="official_hush.mp3", text="肃静！",
         voice=GENERAL, rate="-5%"),
]

# frame, clip, volume, label
EVENTS = [
    (300, "street_hawk.mp3", 0.16, "街市 · 小贩吆喝"),
    (780, "street_chatter.mp3", 0.11, "街市 · 食客闲谈"),
    (1500, "inn_welcome.mp3", 0.13, "饭馆 · 跑堂迎客"),
    (4500, "stable_groom.mp3", 0.15, "马棚 · 马夫喝马"),
    (5645, "stable_groom2.mp3", 0.19, "敲槽事件 · 人声层"),
    (7400, "street_hawk.mp3", 0.11, "刀疤脸到场 · 街声"),
    (9119, "horse_call.mp3", 0.17, "铜铃马蹄 · 牵马声"),
    (12200, "official_yes.mp3", 0.13, "赵大人 · 随从应和"),
    (17000, "inn_chatter.mp3", 0.12, "前堂 · 食客谈笑"),
    (20500, "crowd_murmur.mp3", 0.14, "一品大员 · 众人低语"),
    (21782, "crowd_gasp.mp3", 0.22, "跪地事件 · 倒吸凉气"),
    (24000, "laugh_short.mp3", 0.11, "交涉 · 旁人轻笑"),
    (31220, "stable_groom2.mp3", 0.17, "急敲事件 · 人声层"),
    (34700, "official_hush.mp3", 0.15, "怒喝前 · 肃静"),
    (36962, "crowd_gasp.mp3", 0.28, "断臂事件 · 众人惊呼"),
    (39700, "crowd_murmur.mp3", 0.11, "马王回忆 · 低语"),
]

PUNCT = set("，。？！；：…、“”‘’《》〈〉—－·,.;:!?()（） \"'\n\t ")


def duration(path: str) -> float:
    p = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True,
    )
    try:
        return float(p.stdout.strip().split(",")[0])
    except ValueError:
        return 0.0


async def synth(clip: dict, sem: asyncio.Semaphore) -> tuple[str, float]:
    dest = os.path.join(AMB, clip["file"])
    async with sem:
        for attempt in range(3):
            try:
                c = edge_tts.Communicate(clip["text"], clip["voice"], rate=clip["rate"])
                await asyncio.wait_for(c.save(dest), timeout=50)
                d = duration(dest)
                if d > 0.2:
                    return clip["file"], d
            except Exception as exc:  # the online service occasionally drops a connection
                if attempt == 2:
                    print("  FAIL", clip["file"], type(exc).__name__)
                await asyncio.sleep(1.5 * (attempt + 1))
    return clip["file"], 0.0


# ------------------------------------------------------------ word timestamps
def read_energy() -> dict[str, str]:
    src = open(os.path.join(DATA, "voice.ts"), encoding="utf-8").read()
    data = json.loads(src[src.index("= {") + 2:].strip().rstrip(";"))
    return {k: v["energy"] for k, v in data.items()}


def fuse(text: str, bounds: list[tuple[float, float, str]], energy: str) -> list[int]:
    """Map TTS word boundaries into the real clip's voiced range (frames)."""
    chars = list(text)
    e = [int(c, 16) for c in energy]
    active = [i for i, v in enumerate(e) if v >= 2]
    v0 = active[0] if active else 0
    v1 = active[-1] if active else len(e) - 1
    if v1 <= v0:
        v1 = v0 + 1
    w0 = min(o for o, _, _ in bounds)
    w1 = max(o + d for o, d, _ in bounds)
    span = max(0.001, w1 - w0)
    to_frame = lambda t: v0 + (t - w0) / span * (v1 - v0)  # noqa: E731

    flat: list[float] = []
    for o, d, wtext in bounds:
        cs = [c for c in wtext if c not in PUNCT]
        if not cs:
            continue
        for j in range(len(cs)):
            flat.append(to_frame(o + d * (j + 0.5) / len(cs)))
    speakable = sum(1 for c in chars if c not in PUNCT)
    if not flat:
        return [0] * len(chars)
    if len(flat) != speakable:
        # Proportional resampling when the service merges/splits words differently.
        flat = [flat[min(len(flat) - 1, round(i * (len(flat) - 1) / max(1, speakable - 1)))]
                for i in range(speakable)]

    out: list[int] = []
    k = 0
    last = v0
    for c in chars:
        if c in PUNCT:
            out.append(last)
            continue
        last = int(round(flat[min(k, len(flat) - 1)]))
        k += 1
        out.append(last)
    return out


async def word_times(track: dict, energy: str, sem: asyncio.Semaphore):
    async with sem:
        for attempt in range(3):
            try:
                c = edge_tts.Communicate(track["text"], track["voice"],
                                         boundary="WordBoundary")
                bounds: list[tuple[float, float, str]] = []
                async with asyncio.timeout(90):
                    async for chunk in c.stream():
                        if chunk["type"] == "WordBoundary":
                            bounds.append((chunk["offset"] / 1e7,
                                           chunk["duration"] / 1e7,
                                           chunk["text"]))
                if not bounds:
                    raise RuntimeError("no WordBoundary metadata")
                frames = fuse(track["text"], bounds, energy)
                return track["id"], frames
            except Exception as exc:
                if attempt == 2:
                    print(f"  FAIL wordTimes #{track['id']:02d}", type(exc).__name__)
                await asyncio.sleep(1.2 * (attempt + 1))
    return track["id"], None


async def main():
    sem = asyncio.Semaphore(5)

    print("[1/2] synthesising ambience voice layers …")
    results = await asyncio.gather(*(synth(c, sem) for c in CLIPS))
    lengths = dict(results)
    events = []
    for frame, file, volume, label in EVENTS:
        d = lengths.get(file, 0.0)
        if d <= 0:
            continue
        events.append({"frame": frame, "file": file, "volume": volume,
                       "frames": max(1, round(d * FPS)), "label": label})
    with open(os.path.join(DATA, "ambience.ts"), "w", encoding="utf-8") as f:
        f.write("// AUTO-GENERATED by scripts/tc_edge_audio.py (edgeTTS voice layers).\n")
        f.write("export interface AmbienceEvent { frame: number; file: string; volume: number; frames: number; label: string; }\n\n")
        f.write("export const AMBIENCE_EVENTS: AmbienceEvent[] = ")
        f.write(json.dumps(events, ensure_ascii=False, indent=2))
        f.write(";\n")
    print(f"  {len(lengths) - sum(1 for v in lengths.values() if v <= 0)}/{len(CLIPS)} clips, "
          f"{len(events)} scheduled events")

    print("[2/2] harvesting WordBoundary timestamps for the 54 original clips …")
    energy = read_energy()
    wt = await asyncio.gather(*(word_times(t, energy[str(t["id"])], sem) for t in TT["tracks"]))
    ok = {str(i): v for i, v in wt if v is not None}
    with open(os.path.join(DATA, "wordTimes.ts"), "w", encoding="utf-8") as f:
        f.write("// AUTO-GENERATED by scripts/tc_edge_audio.py.\n")
        f.write("// Per-character frame (relative to clip start) from edgeTTS WordBoundary,\n")
        f.write("// fused with the measured waveform envelope of the real MP3.\n")
        f.write("export const WORD_TIMES: Record<number, number[]> = ")
        f.write(json.dumps(ok, ensure_ascii=False, separators=(",", ":")))
        f.write(";\n")
    print(f"  {len(ok)}/54 clips have word-level timing")
    print("DONE")


if __name__ == "__main__":
    asyncio.run(main())
