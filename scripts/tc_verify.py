"""Full static integrity audit for the 跳槽马 composition.

Checks: voice durations, waveform/word timing coverage, every referenced
static asset on disk, ambience/SFX schedules, and frame continuity.
Run: python scripts/tc_verify.py
"""
import json
import os
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BASE = r"D:/下载/跳槽马AI视频-20261110T134214Z-1-001/跳槽马AI视频/02-音频与时刻表"
TT = json.load(open(os.path.join(BASE, "音频时刻表.json"), encoding="utf-8"))
SRC = os.path.join(ROOT, "src", "videos", "Tiaocaoma")
PUB = os.path.join(ROOT, "public", "tiaocaoma")
problems = []


def duration(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
    ).decode().strip().split(",")[0]
    return float(out)


def ts_value(path):
    """Parse the first JSON literal assigned in a generated TS data module."""
    s = open(path, encoding="utf-8").read()
    positions = [i for i in (s.find("= {"), s.find("= [")) if i >= 0]
    if not positions:
        raise ValueError(f"no generated literal in {path}")
    return json.loads(s[min(positions) + 2:].strip().rstrip(";"))


# 1. Voice files: presence + duration agreement.
for t in TT["tracks"]:
    p = os.path.join(PUB, "audio", f"{t['id']:02d}.mp3")
    if not os.path.exists(p):
        problems.append(f"missing voice {t['id']:02d}.mp3")
        continue
    d = duration(p)
    if abs(d - t["durationSec"]) > 0.25:
        problems.append(f"voice #{t['id']:02d} duration {d:.3f}s vs timetable {t['durationSec']:.3f}s")

# 2. Per-frame data coverage.
voice = ts_value(os.path.join(SRC, "data", "voice.ts"))
words = ts_value(os.path.join(SRC, "data", "wordTimes.ts"))
for t in TT["tracks"]:
    k = str(t["id"])
    n = t["endFrame"] - t["startFrame"]
    v = voice.get(k)
    if not v:
        problems.append(f"VOICE missing #{k}")
    else:
        for field in ("energy", "lip"):
            if len(v[field]) != n:
                problems.append(f"VOICE #{k}.{field} {len(v[field])} frames vs {n}")
    w = words.get(k)
    if not w:
        problems.append(f"WORD_TIMES missing #{k}")
    elif len(w) != len(t["text"]):
        problems.append(f"WORD_TIMES #{k} {len(w)} chars vs {len(t['text'])}")

# 3. Every referenced cut-out / background / sfx asset exists.
text = ""
for folder, _, files in os.walk(SRC):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            text += open(os.path.join(folder, f), encoding="utf-8").read()

parts = set(re.findall(r'"((?:char|prop|fx|expr|supp)-[A-Za-z0-9-]+)"', text))
for name in sorted(parts):
    if not os.path.exists(os.path.join(PUB, "parts", f"{name}.png")):
        problems.append(f"missing part {name}.png")

bgs = set(re.findall(r'"((?:bg-[a-z-]+|title|ending))"', text))
for name in sorted(bgs):
    if not os.path.exists(os.path.join(PUB, "bg", f"{name}.png")):
        problems.append(f"missing bg {name}.png")

# 4. Schedules.
amb = ts_value(os.path.join(SRC, "data", "ambience.ts"))
for e in amb:
    if not os.path.exists(os.path.join(PUB, "ambience", e["file"])):
        problems.append(f"missing ambience {e['file']}")
    if e["frame"] + e["frames"] > TT["meta"]["totalFrames"]:
        problems.append(f"ambience overruns film: {e['file']} @ {e['frame']}")

tl = open(os.path.join(SRC, "data", "timeline.ts"), encoding="utf-8").read()
m = re.search(r"export const SFX_EVENTS: SfxEvent\[\] = (\[.*?\]);", tl, re.S)
if m:
    for e in json.loads(m.group(1)):
        if not os.path.exists(os.path.join(PUB, "sfx", e["file"])):
            problems.append(f"missing sfx {e['file']}")

# 5. Frame continuity: clips must be ordered, non-overlapping, inside the film.
prev = -1
for t in TT["tracks"]:
    if t["startFrame"] < prev:
        problems.append(f"overlapping track #{t['id']:02d} @ {t['startFrame']}")
    prev = t["endFrame"]
if prev > TT["meta"]["totalFrames"]:
    problems.append(f"last track {prev} exceeds DURATION_FRAMES {TT['meta']['totalFrames']}")

# 6. parts.ts / manifest consistency.
manifest = json.load(open(os.path.join(PUB, "parts", "manifest.json"), encoding="utf-8"))
parts_ts = ts_value(os.path.join(SRC, "data", "parts.ts"))
for k in manifest:
    if k not in parts_ts:
        problems.append(f"parts.ts missing {k}")

print(f"checked: {len(TT['tracks'])} voices, {len(voice)} waveform tracks, "
      f"{len(words)} word-timing tracks, {len(parts)} part refs, {len(bgs)} backgrounds")
if problems:
    print(f"PROBLEMS ({len(problems)}):")
    for p in problems[:40]:
        print("  -", p)
    sys.exit(1)
print("ALL CHECKS PASSED")
