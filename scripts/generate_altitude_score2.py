# -*- coding: utf-8 -*-
"""Generate a quiet, noise-free ambient score for '高处不胜寒的真相'.

Warm felt-piano motif over soft string pads and a low cello line.
No noise layers and no saturation, so there is no hiss or crackle.
Narration-aware ducking is baked in. Outputs scripts/out/altitude-score.wav.
"""
import math
import wave

import numpy as np

SR = 44100
DUR = 392.0
N = int(SR * DUR)
rng = np.random.default_rng(20261111)

left = np.zeros(N, np.float32)
right = np.zeros(N, np.float32)


def add(sig, start_s, gain=1.0, pan=0.0, space_gain=0.0):
    i0 = int(start_s * SR)
    for delay, dgain in ((0.0, 1.0), (0.31, 0.85), (0.57, 0.55), (0.93, 0.34)):
        g = gain if delay == 0.0 else gain * dgain * space_gain
        if g <= 0.0001:
            continue
        raw_j0 = i0 + int(delay * SR)
        seg_off = max(0, -raw_j0)
        j0 = max(0, raw_j0)
        i1 = min(N, raw_j0 + len(sig))
        if i1 <= j0:
            continue
        seg = sig[seg_off: seg_off + (i1 - j0)].astype(np.float32)
        left[j0:i1] += seg * (g * (1.0 - max(0.0, pan)))
        right[j0:i1] += seg * (g * (1.0 + min(0.0, pan)))


def felt_note(freq, dur=3.8):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    env = np.minimum(1.0, t / 0.008) * np.exp(-t / 1.15)
    s = (
        np.sin(2 * np.pi * freq * t)
        + 0.16 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-t / 0.5)
        + 0.03 * np.sin(2 * np.pi * freq * 3.0 * t) * np.exp(-t / 0.26)
    )
    return (s * env).astype(np.float32)


def bell_note(freq, dur=6.0):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    env = np.minimum(1.0, t / 0.005) * np.exp(-t / 2.0)
    s = (
        np.sin(2 * np.pi * freq * t)
        + 0.16 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t / 0.6)
        + 0.05 * np.sin(2 * np.pi * freq * 3.02 * t) * np.exp(-t / 0.3)
    )
    return (s * env).astype(np.float32)


# 8-bar loop, 8 s per chord: Fmaj9 - Dm9 - Bbmaj7 - Cadd9 - Am7 - Dm9 - Bbmaj7 - Csus4
CHORDS = [
    {"pad": [87.31, 130.81, 164.81, 196.0, 220.0], "arp": [349.23, 440.0, 523.25, 659.25], "root": 87.31},
    {"pad": [73.42, 110.0, 174.61, 220.0, 261.63], "arp": [293.66, 349.23, 440.0, 523.25], "root": 73.42},
    {"pad": [116.54, 174.61, 220.0, 293.66], "arp": [349.23, 440.0, 587.33, 698.46], "root": 116.54},
    {"pad": [130.81, 196.0, 293.66, 329.63], "arp": [329.63, 392.0, 523.25, 587.33], "root": 130.81},
    {"pad": [110.0, 164.81, 196.0, 261.63], "arp": [329.63, 440.0, 523.25, 659.25], "root": 110.0},
    {"pad": [73.42, 110.0, 174.61, 220.0, 261.63], "arp": [293.66, 349.23, 440.0, 523.25], "root": 73.42},
    {"pad": [116.54, 174.61, 220.0, 293.66], "arp": [349.23, 440.0, 587.33, 698.46], "root": 116.54},
    {"pad": [130.81, 174.61, 196.0, 261.63], "arp": [349.23, 392.0, 523.25, 659.25], "root": 130.81},
]
BEAT = 1.0  # 60 BPM

n_chords = int(math.ceil(DUR / 8.0)) + 1

for k in range(n_chords):
    chord = CHORDS[k % len(CHORDS)]
    start = k * 8.0

    # ---- Warm string pad: detuned sine trio per tone, slow swell ----
    pad_dur = 9.6
    n = int(pad_dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    env = np.minimum(1.0, t / 2.0) * np.minimum(1.0, np.maximum(0.0, (pad_dur - t) / 2.8))
    env = np.sin(np.clip(env, 0, 1) * np.pi / 2) ** 2
    for fi, f in enumerate(chord["pad"]):
        voice = (
            np.sin(2 * np.pi * f * t + fi * 1.1)
            + 0.5 * np.sin(2 * np.pi * f * 1.0013 * t + fi * 1.7 + 0.8)
            + 0.5 * np.sin(2 * np.pi * f * 0.9987 * t + fi * 2.3 + 1.9)
            + 0.05 * np.sin(2 * np.pi * f * 2.0 * t + fi * 0.6)
        )
        add((voice * env).astype(np.float32), start - 0.8, gain=0.026, pan=(-0.28 if fi % 2 else 0.28))

    # ---- Low cello line: root with gentle vibrato ----
    n = int(9.0 * SR)
    t = np.arange(n, dtype=np.float64) / SR
    cello_env = np.minimum(1.0, t / 1.6) * np.minimum(1.0, np.maximum(0.0, (9.0 - t) / 2.4))
    vib = np.sin(2 * np.pi * chord["root"] * 0.5 * t + 0.22 * np.sin(2 * np.pi * 4.2 * t))
    cello = vib * (1.0 + 0.22 * np.sin(2 * np.pi * chord["root"] * t))
    add((cello * cello_env).astype(np.float32), start - 0.5, gain=0.040)

    # ---- Felt-piano motif ----
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    for j in range(8):
        if rng.random() < 0.16 and j not in (0, 4):
            continue
        f = chord["arp"][pattern[j]]
        t0 = start + j * BEAT + float(rng.uniform(-0.02, 0.02))
        amp = 0.13 * float(rng.uniform(0.7, 1.0)) * (1.0 if j % 4 == 0 else 0.85)
        add(felt_note(f), t0, gain=amp, pan=float(rng.uniform(-0.3, 0.3)), space_gain=0.2)

    # ---- Sparse bell shimmer ----
    if k % 2 == 0:
        f = chord["arp"][2] * 2.0
        add(bell_note(f), start + 4.6, gain=0.038, pan=0.4 if k % 4 == 0 else -0.4, space_gain=0.3)

    # ---- Distant air tone: pure sine shimmer, quietly tonal ----
    if k % 4 == 2:
        n = int(7.0 * SR)
        t = np.arange(n, dtype=np.float64) / SR
        env = np.minimum(1.0, t / 2.2) * np.minimum(1.0, np.maximum(0.0, (7.0 - t) / 2.4))
        tone = np.sin(2 * np.pi * chord["root"] * 6.0 * t + 0.4 * np.sin(2 * np.pi * 0.13 * t))
        add((tone * env).astype(np.float32), start + 0.8, gain=0.009, pan=-0.2, space_gain=0.4)


# ---- Narration-aware ducking ----
def read_wav_mono(path):
    with wave.open(path, "rb") as wf:
        sr = wf.getframerate()
        raw = wf.readframes(wf.getnframes())
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    return sr, data


def box_smooth(x, n):
    c = np.cumsum(x, dtype=np.float64)
    y = np.empty_like(x, dtype=np.float64)
    y[n:] = (c[n:] - c[:-n]) / n
    ramp = np.arange(1, n + 1, dtype=np.float64)
    y[:n] = c[:n] / ramp
    return y


narr_sr, narr = read_wav_mono(r"C:/Users/GF/Downloads/高处不胜寒的真相/口播音频.wav")
win = int(0.1 * narr_sr)
hop = int(0.05 * narr_sr)
n_frames = max(1, (len(narr) - win) // hop)
env = np.zeros(n_frames, dtype=np.float64)
for i in range(n_frames):
    seg = narr[i * hop: i * hop + win]
    env[i] = math.sqrt(float(np.mean(seg * seg)))
env = box_smooth(env, 9)
thr = np.percentile(env, 92) + 1e-9
env = np.clip(env / thr, 0.0, 1.0)
duck = 1.0 - 0.6 * env  # floor ~0.4 while speaking
t_all = np.arange(N, dtype=np.float64) / SR
duck_t = np.arange(n_frames) * 0.05
duck_full = np.interp(t_all, duck_t[:n_frames], duck).astype(np.float32)
print(f"ducking: env p92={thr:.4f}, duty={(env > 0.2).mean() * 100:.1f}% frames")

left *= duck_full
right *= duck_full

# ---- Fades & master (no saturation) ----
fade_in = np.clip(t_all / 6.0, 0, 1) ** 1.5
fade_out = np.clip((DUR - t_all) / 11.0, 0, 1) ** 1.3
fade = (fade_in * fade_out).astype(np.float32)
left *= fade
right *= fade

peak = max(float(np.max(np.abs(left))), float(np.max(np.abs(right))), 1e-6)
gain = 0.45 / peak
left *= gain
right *= gain
rms = float(np.sqrt(np.mean((left ** 2 + right ** 2) * 0.5)))
print(f"peak before norm {peak:.3f}, rms after {20 * math.log10(rms + 1e-9):.1f} dBFS")

out_path = r"scripts/out/altitude-score.wav"
with wave.open(out_path, "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    interleaved = np.empty(N * 2, dtype=np.int16)
    interleaved[0::2] = np.clip(left * 32767, -32768, 32767).astype(np.int16)
    interleaved[1::2] = np.clip(right * 32767, -32768, 32767).astype(np.int16)
    wf.writeframes(interleaved.tobytes())

print(f"saved {out_path} ({DUR}s)")
