# -*- coding: utf-8 -*-
"""Generate a quiet, atmospheric score for '高处不胜寒的真相'.

Warm felt-piano arpeggios + cold ambient pads + mountain-wind texture,
with narration-aware ducking baked in. Outputs public/high-altitude/bgm.wav.
"""
import math
import wave

import numpy as np

SR = 44100
DUR = 392.0
N = int(SR * DUR)
rng = np.random.default_rng(20261110)

left = np.zeros(N, np.float32)
right = np.zeros(N, np.float32)


def add(sig, start_s, gain=1.0, pan=0.0, space_gain=0.0):
    i0 = int(start_s * SR)
    for delay, dgain in ((0.0, 1.0), (0.29, 0.9), (0.53, 0.6), (0.86, 0.38)):
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


def piano_note(freq, dur=3.4):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    env = np.minimum(1.0, t / 0.007) * np.exp(-t / 0.9)
    s = (
        np.sin(2 * np.pi * freq * t)
        + 0.34 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-t / 0.32)
        + 0.10 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t / 0.16)
        + 0.04 * np.sin(2 * np.pi * freq * 4.02 * t) * np.exp(-t / 0.08)
    )
    return (s * env).astype(np.float32)


def bell_note(freq, dur=5.5):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    env = np.minimum(1.0, t / 0.004) * np.exp(-t / 1.7)
    s = (
        np.sin(2 * np.pi * freq * t)
        + 0.25 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t / 0.5)
        + 0.12 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t / 0.22)
    )
    return (s * env).astype(np.float32)


# Chord cycle (8 s each): Fmaj9 - Am7 - Bbmaj7 - Cadd9 - Dm9 - Bbmaj7 - Fmaj7 - Csus4
CHORDS = [
    {"pad": [87.31, 130.81, 164.81, 220.0, 196.0], "arp": [349.23, 440.0, 523.25, 659.25], "root": 87.31},
    {"pad": [110.0, 164.81, 196.0, 261.63], "arp": [329.63, 440.0, 523.25, 659.25], "root": 110.0},
    {"pad": [116.54, 174.61, 220.0, 293.66], "arp": [349.23, 440.0, 587.33, 698.46], "root": 116.54},
    {"pad": [130.81, 196.0, 293.66, 329.63], "arp": [329.63, 392.0, 523.25, 587.33], "root": 130.81},
    {"pad": [146.83, 220.0, 261.63, 349.23], "arp": [349.23, 440.0, 523.25, 659.25], "root": 146.83},
    {"pad": [116.54, 174.61, 220.0, 293.66], "arp": [349.23, 440.0, 587.33, 698.46], "root": 116.54},
    {"pad": [87.31, 130.81, 220.0, 329.63], "arp": [349.23, 440.0, 523.25, 659.25], "root": 87.31},
    {"pad": [130.81, 174.61, 196.0, 261.63], "arp": [349.23, 392.0, 523.25, 659.25], "root": 130.81},
]
CYCLE = 8 * 8.0
BEAT = 60.0 / 66.0  # 66 BPM

n_chords = int(math.ceil(DUR / 8.0)) + 1

for k in range(n_chords):
    chord = CHORDS[k % len(CHORDS)]
    start = k * 8.0

    # ---- Ambient pad: 3 detuned sines per tone, slow swell ----
    pad_dur = 9.4
    n = int(pad_dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    env = np.minimum(1.0, t / 1.9) * np.minimum(1.0, np.maximum(0.0, (pad_dur - t) / 2.7))
    env = np.sin(np.clip(env, 0, 1) * np.pi / 2) ** 2
    for fi, f in enumerate(chord["pad"]):
        drift = 1.0 + 0.0007 * math.sin(2 * math.pi * (0.05 + fi * 0.013) * t[0] + k)
        voice = (
            np.sin(2 * np.pi * f * drift * t + fi)
            + 0.6 * np.sin(2 * np.pi * f * 1.0019 * t + fi * 1.7)
            + 0.6 * np.sin(2 * np.pi * f * 0.9981 * t + fi * 2.9)
        )
        add((voice * env).astype(np.float32), start - 0.7, gain=0.028, pan=(-0.25 if fi % 2 else 0.25))

    # ---- Sub drone ----
    n = int(10.0 * SR)
    t = np.arange(n, dtype=np.float64) / SR
    sub_env = np.minimum(1.0, t / 2.2) * np.minimum(1.0, np.maximum(0.0, (10.0 - t) / 3.0))
    sub = np.sin(2 * np.pi * chord["root"] * 0.5 * t) * sub_env
    add((sub).astype(np.float32), start - 0.7, gain=0.05)

    # ---- Felt-piano arpeggio ----
    pattern = [0, 1, 2, 3, 2, 1, 2, 3]
    for j in range(8):
        note_i = pattern[j]
        if rng.random() < 0.12 and j not in (0, 4):
            continue
        f = chord["arp"][note_i]
        t0 = start + j * BEAT + float(rng.uniform(-0.018, 0.018))
        amp = 0.15 * float(rng.uniform(0.72, 1.05)) * (1.0 if j % 4 == 0 else 0.85)
        add(piano_note(f), t0, gain=amp, pan=float(rng.uniform(-0.35, 0.35)), space_gain=0.22)

    # ---- Sparse wide bell shimmer ----
    if k % 2 == 0:
        f = chord["arp"][2] * 2.0
        add(bell_note(f), start + 4.55, gain=0.055, pan=0.45 if k % 4 == 0 else -0.45, space_gain=0.3)

    # ---- Distant sustained motif every 4th chord ----
    if k % 4 == 1:
        f = chord["arp"][3] * 2.0
        n = int(6.0 * SR)
        t = np.arange(n, dtype=np.float64) / SR
        env = np.minimum(1.0, t / 1.6) * np.minimum(1.0, np.maximum(0.0, (6.0 - t) / 2.4))
        vib = np.sin(2 * np.pi * f * t + 0.22 * np.sin(2 * np.pi * 4.6 * t))
        add((vib * env).astype(np.float32), start + 0.9, gain=0.032, pan=0.2, space_gain=0.35)


# ---- Mountain wind: filtered noise layers ----
def box_smooth(x, n):
    c = np.cumsum(x, dtype=np.float64)
    y = np.empty_like(x, dtype=np.float64)
    y[n:] = (c[n:] - c[:-n]) / n
    ramp = np.arange(1, n + 1, dtype=np.float64)
    y[:n] = c[:n] / ramp
    return y


t_all = np.arange(N, dtype=np.float64) / SR
lfo_rumble = 0.55 + 0.45 * np.sin(2 * np.pi * t_all / 23.0 + 1.2)
lfo_breeze = 0.5 + 0.5 * np.sin(2 * np.pi * t_all / 13.7 + 4.0)

for ch, out in ((0, left), (1, right)):
    noise = rng.standard_normal(N)
    rumble = box_smooth(box_smooth(noise, 420), 420).astype(np.float32)
    breeze = box_smooth(noise, 16).astype(np.float32)
    out += rumble * (lfo_rumble * 0.16).astype(np.float32)
    out += breeze * (lfo_breeze * 0.008).astype(np.float32)


# ---- Narration-aware ducking ----
def read_wav_mono(path):
    with wave.open(path, "rb") as wf:
        sr = wf.getframerate()
        raw = wf.readframes(wf.getnframes())
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    return sr, data


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
duck = 1.0 - 0.62 * env  # floor ~0.38 while speaking
duck_t = np.arange(n_frames) * 0.05
duck_full = np.interp(t_all, duck_t[:n_frames], duck).astype(np.float32)
print(f"ducking: env p92={thr:.4f}, duty={(env > 0.2).mean() * 100:.1f}% frames")

left *= duck_full
right *= duck_full

# ---- Fades & master ----
fade_in = np.clip(t_all / 6.0, 0, 1) ** 1.5
fade_out = np.clip((DUR - t_all) / 11.0, 0, 1) ** 1.3
fade = (fade_in * fade_out).astype(np.float32)
left *= fade
right *= fade

peak = max(float(np.max(np.abs(left))), float(np.max(np.abs(right))), 1e-6)
gain = 0.5 / peak
left = np.tanh(left * gain * 1.1) * 0.9
right = np.tanh(right * gain * 1.1) * 0.9

out_path = r"scripts/out/altitude-score.wav"
with wave.open(out_path, "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    interleaved = np.empty(N * 2, dtype=np.int16)
    interleaved[0::2] = np.clip(left * 32767, -32768, 32767).astype(np.int16)
    interleaved[1::2] = np.clip(right * 32767, -32768, 32767).astype(np.int16)
    wf.writeframes(interleaved.tobytes())

print(f"saved {out_path} ({DUR}s, peak before norm {peak:.3f})")
