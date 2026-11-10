"""Step 2: copy voices, measure real waveforms, synthesise missing SFX + score."""
import json
import os
import subprocess
import sys
import wave

import numpy as np
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BASE = r"D:/下载/跳槽马AI视频-20261110T134214Z-1-001/跳槽马AI视频/02-音频与时刻表"
SRC = os.path.join(BASE, "audio")
TT = json.load(open(os.path.join(BASE, "音频时刻表.json"), encoding="utf-8"))
OUT = os.path.join(ROOT, "public", "tiaocaoma")
DATA = os.path.join(ROOT, "src", "videos", "Tiaocaoma", "data")
FPS = 60
SR = 22050
os.makedirs(DATA, exist_ok=True)
os.makedirs(os.path.join(OUT, "audio"), exist_ok=True)
os.makedirs(os.path.join(OUT, "sfx"), exist_ok=True)


def decode(path, rate=16000):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "1",
                        "-ar", str(rate), "-f", "f32le", "-"], capture_output=True)
    return np.frombuffer(p.stdout, dtype="<f4")


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes(np.asarray(x * 32767, dtype="<i2").tobytes())


def synth_sfx():
    rng = np.random.default_rng(7)
    dur = lambda s: np.arange(int(s * SR)) / SR

    def knock(t, amp=0.55, length=0.14):
        n = int(length * SR)
        e = np.exp(-np.linspace(0, 9, n))
        return amp * (np.sin(2 * np.pi * 210 * t[:n]) * 0.6 +
                      np.sin(2 * np.pi * 390 * t[:n]) * 0.2 +
                      rng.normal(0, 0.35, n)) * e

    def place(x, t0, sig):
        i = int(t0 * SR)
        x[i:i + len(sig)] += sig

    x = np.zeros(int(1.3 * SR))
    for t0 in (0.0, 0.32, 0.63):
        place(x, t0, knock(dur(1.3 - t0)))
    write_wav(os.path.join(OUT, "sfx", "knock.wav"), x)

    x = np.zeros(int(2.1 * SR))
    for t0, a in ((0.0, 0.5), (0.42, 0.36), (0.88, 0.46), (1.32, 0.3)):
        n = int(0.16 * SR); t = np.arange(n) / SR
        thud = a * (np.sin(2 * np.pi * 95 * t) * 0.8 + rng.normal(0, 0.3, n)) * np.exp(-t * 26)
        place(x, t0, thud)
        n2 = int(0.7 * SR); t2 = np.arange(n2) / SR
        bell = 0.13 * (np.sin(2 * np.pi * 1180 * t2) + 0.6 * np.sin(2 * np.pi * 1780 * t2) +
                       0.3 * np.sin(2 * np.pi * 2630 * t2)) * np.exp(-t2 * 5.5)
        place(x, t0 + 0.02, bell)
    write_wav(os.path.join(OUT, "sfx", "hoof_bell.wav"), x)

    x = np.zeros(int(0.9 * SR)); t = dur(0.9)
    n = int(0.35 * SR)
    x[:n] += 0.8 * (np.sin(2 * np.pi * 72 * t[:n]) + rng.normal(0, 0.4, n)) * np.exp(-t[:n] * 14)
    write_wav(os.path.join(OUT, "sfx", "knee.wav"), x)

    x = np.zeros(int(1.5 * SR))
    for i in range(7):
        place(x, i * 0.17, knock(dur(1.5 - i * 0.17), 0.4, 0.1))
    write_wav(os.path.join(OUT, "sfx", "knock_fast.wav"), x)

    x = np.zeros(int(2.2 * SR)); t = dur(2.2)
    n = int(0.9 * SR)
    metal = (np.sin(2 * np.pi * 1560 * t[:n]) + 0.5 * np.sin(2 * np.pi * 2340 * t[:n]) +
             0.3 * np.sin(2 * np.pi * 3510 * t[:n]) + rng.normal(0, 0.2, n)) * np.exp(-t[:n] * 4.2)
    x[:n] += 0.22 * metal
    n = int(0.22 * SR); i0 = int(0.52 * SR)
    crack = rng.normal(0, 1, n) * np.exp(-np.linspace(0, 12, n))
    x[i0:i0 + n] += 0.65 * crack
    n = int(0.4 * SR); i0 = int(0.98 * SR); tt = np.arange(n) / SR
    x[i0:i0 + n] += 0.5 * (np.sin(2 * np.pi * 88 * tt) + rng.normal(0, 0.25, n)) * np.exp(-tt * 12)
    write_wav(os.path.join(OUT, "sfx", "sword.wav"), x)
    print("sfx: 5 files")


def synth_score(total):
    n = int(total * SR)
    t = np.arange(n, dtype=np.float32) / SR
    rng = np.random.default_rng(11)
    # warm paper drone
    drone = (np.sin(2 * np.pi * 73.42 * t) * 0.5 + np.sin(2 * np.pi * 110.0 * t) * 0.3 +
             np.sin(2 * np.pi * 146.83 * t) * 0.12) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.035 * t))
    # pentatonic guzheng-like plucks
    scale = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33]
    plucks = np.zeros(n, dtype=np.float32)
    step = 2.35
    for i, t0 in enumerate(np.arange(1.0, total - 1.0, step)):
        f = scale[(i * 3 + (i // 5)) % len(scale)]
        ln = min(int(2.0 * SR), n - int(t0 * SR))
        tt = np.arange(ln) / SR
        env = np.exp(-tt * 3.1) * (1 - np.exp(-tt * 180))
        s = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) +
             0.14 * np.sin(2 * np.pi * 3 * f * tt)) * env
        plucks[int(t0 * SR):int(t0 * SR) + ln] += 0.16 * s
    # paper / wind texture
    noise = rng.normal(0, 1, n).astype(np.float32)
    cs = np.cumsum(np.concatenate([[0.0], noise]), dtype=np.float64)
    k = 180
    moving = ((cs[k:] - cs[:-k]) / k).astype(np.float32)
    wind = np.zeros(n, dtype=np.float32)
    wind[:len(moving)] = moving
    wind *= (0.14 + 0.09 * np.sin(2 * np.pi * 0.07 * t)).astype(np.float32)
    # act markers: soft wooden drum
    marks = np.zeros(n, dtype=np.float32)
    for sec in (263.16, 397.63, 456.90, 577.66, 696.12):
        i0 = int(sec * SR); ln = int(0.8 * SR); tt = np.arange(ln) / SR
        marks[i0:i0 + ln] += 0.18 * (np.sin(2 * np.pi * 105 * tt) +
                                     np.sin(2 * np.pi * 158 * tt) * 0.4) * np.exp(-tt * 7)
    mix = 0.5 * drone + plucks + 0.08 * wind + marks
    fade = np.minimum(1, np.minimum(t / 3.0, (total - t) / 4.0))
    mix *= np.clip(fade, 0, 1)
    raw = np.asarray(np.clip(mix, -1, 1), dtype="<f4").tobytes()
    dest = os.path.join(OUT, "score.mp3")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR),
                    "-ac", "1", "-i", "-", "-codec:a", "libmp3lame", "-b:a", "96k", dest],
                   input=raw, check=True)
    print("score:", os.path.getsize(dest) // 1024, "KB")


def main():
    voices = {}
    for tr in TT["tracks"]:
        i = tr["id"]
        src = os.path.join(SRC, tr["file"])
        name = f"{i:02d}.mp3"
        dest = os.path.join(OUT, "audio", name)
        if not os.path.exists(dest):
            with open(src, "rb") as a, open(dest, "wb") as b:
                b.write(a.read())
        x = decode(dest, 16000)
        nframes = tr["endFrame"] - tr["startFrame"]
        win = 16000 // FPS
        rms = np.zeros(nframes, dtype=np.float32)
        for f in range(nframes):
            s = f * win
            seg = x[s:s + win]
            rms[f] = np.sqrt(np.mean(seg * seg)) if len(seg) else 0.0
        smooth = np.convolve(rms, np.ones(3) / 3, "same")
        ref = max(float(np.percentile(smooth[smooth > 0], 90)), 1e-5)
        e = np.clip(smooth / ref, 0, 1.35)
        q = np.clip(np.round(e / 1.35 * 15), 0, 15).astype(int)
        lip = np.zeros(nframes, dtype=int)
        lip[e >= 0.14] = 1
        lip[e >= 0.38] = 2
        lip[e >= 0.68] = 3
        # hold each viseme at least 2 frames; kill 1-frame flicker
        for f in range(1, nframes - 1):
            if lip[f] != lip[f - 1] and lip[f - 1] == lip[f + 1]:
                lip[f] = lip[f - 1]
        voices[str(i)] = {"energy": "".join("0123456789abcdef"[v] for v in q),
                          "lip": "".join(str(v) for v in lip)}
    with open(os.path.join(DATA, "voice.ts"), "w", encoding="utf-8") as f:
        f.write("// AUTO-GENERATED by scripts/tc_audio.py. Real 60fps waveform energy.\n")
        f.write("// energy: hex 0-f per frame; lip: viseme 0-3 per frame.\n")
        f.write("export const VOICE: Record<number, {energy: string; lip: string}> = ")
        f.write(json.dumps(voices, ensure_ascii=False, separators=(",", ":")))
        f.write(";\n")
    print("voice.ts:", sum(len(v["energy"]) for v in voices.values()), "frames measured")
    synth_sfx()
    synth_score(TT["meta"]["totalSeconds"] + 2.0)
    print("DONE")


if __name__ == "__main__":
    main()
