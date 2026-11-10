"""
Generates the bespoke 30-second score for NovaReel.

120 BPM, 15 bars, A-minor family. Every scene cut (2s / 6s / 10s / 14s /
18s / 22s / 26s) lands on an impact, and the final 28s lockup lands on a
resolving Am(add9) chord.

Pure standard library: wavetable synth, drums, risers and whooshes.
Output: public/nova-reel-score.wav (44.1 kHz / 16-bit / stereo)
"""

import math
import random
import struct
import wave

SR = 44100
DURATION = 30.0
TOTAL = int(SR * DURATION)
BPM = 120.0
BEAT = 60.0 / BPM          # 0.5 s
BAR = BEAT * 4.0           # 2.0 s
BEATS_TOTAL = int(DURATION / BEAT)
random.seed(20260226)

TWO_PI = 2.0 * math.pi


def midi_hz(m):
    return 440.0 * (2.0 ** ((m - 69.0) / 12.0))


# ---------------------------------------------------------------- wavetables
TABLE = 4096


def make_saw(harmonics):
    table = []
    for i in range(TABLE):
        p = TWO_PI * i / TABLE
        v = 0.0
        for k in range(1, harmonics + 1):
            v += math.sin(k * p) / k
        table.append(v * 0.55)
    return table


SAW24 = make_saw(24)
SAW10 = make_saw(10)


def make_sine():
    return [math.sin(TWO_PI * i / TABLE) for i in range(TABLE)]


SINE = make_sine()


def osc(table, phase):
    """Linear-interpolated wavetable lookup. phase in [0,1)."""
    x = (phase % 1.0) * TABLE
    i = int(x)
    f = x - i
    return table[i] * (1.0 - f) + table[(i + 1) % TABLE] * f


def lowpass_coef(cutoff):
    return 1.0 - math.exp(-TWO_PI * max(40.0, cutoff) / SR)


# ---------------------------------------------------------------- harmony
# 15 bars of 2 s. Am F C G rotation, resolving to Am(add9).
BARS = [
    (33, [45, 48, 52, 55, 59]),   # Am9
    (29, [41, 45, 48, 52, 55]),   # Fmaj9
    (36, [48, 52, 55, 59, 62]),   # Cmaj9
    (31, [43, 47, 50, 52, 57]),   # G6
    (33, [45, 48, 52, 55, 59]),   # Am9
    (29, [41, 45, 48, 52, 55]),   # Fmaj9
    (36, [48, 52, 55, 59, 62]),   # Cmaj9
    (31, [43, 47, 50, 52, 57]),   # G6
    (33, [45, 48, 52, 55, 59]),   # Am9
    (29, [41, 45, 48, 52, 55]),   # Fmaj9
    (36, [48, 52, 55, 59, 62]),   # Cmaj9
    (31, [43, 47, 50, 52, 57]),   # G6
    (33, [45, 48, 52, 55, 59]),   # Am9
    (29, [41, 45, 48, 52, 55]),   # Fmaj9
    (33, [45, 48, 52, 59, 64]),   # Am(add9), brighter voicing
]

L = [0.0] * TOTAL
R = [0.0] * TOTAL
ARP_L = [0.0] * TOTAL
ARP_R = [0.0] * TOTAL


def section_at(t):
    if t < 2.0:
        return "intro"
    if t < 6.0:
        return "A"
    if t < 10.0:
        return "B"
    if t < 14.0:
        return "C"
    if t < 18.0:
        return "break"
    if t < 22.0:
        return "montage"
    if t < 26.0:
        return "build"
    return "finale"


def duck(t, amount=0.6):
    """Sidechain shape keyed to the 120 BPM kick."""
    if section_at(t) in ("break",):
        amount *= 0.35
    if section_at(t) in ("intro", "finale"):
        amount *= 0.4
    return 1.0 - amount * math.exp(-((t % BEAT) * 9.5))


# ---------------------------------------------------------------- instruments
def add_pad(start, dur, notes, cutoff, level, detune_cents=8.0):
    n = int(dur * SR)
    s0 = int(start * SR)
    voices = []
    pan = [0.72, 1.0, 0.72]
    for n_i, note in enumerate(notes):
        f = midi_hz(note)
        for v_i, cents in enumerate((-detune_cents, 0.0, detune_cents)):
            d = 2.0 ** (cents / 1200.0)
            voices.append({
                "phase": random.random(),
                "inc": f * d / SR,
                "gain": (0.30 if v_i == 1 else 0.18) * pan[v_i],
                "pan": (v_i - 1) * 0.55 + (0.12 if n_i % 2 else -0.12),
                "table": SAW24 if f < 400 else SAW10,
            })
    lp_l = 0.0
    lp_r = 0.0
    c = lowpass_coef(cutoff)
    for i in range(n):
        t = i / SR
        atk = min(1.0, t / 0.22)
        rel = min(1.0, max(0.0, (dur - t) / 0.25))
        env = atk * rel
        lfo = 0.85 + 0.15 * math.sin(TWO_PI * 0.23 * t + 1.1)
        sl = 0.0
        sr = 0.0
        for v in voices:
            s = osc(v["table"], v["phase"])
            v["phase"] += v["inc"]
            p = v["pan"]
            sl += s * v["gain"] * (1.0 - max(0.0, p))
            sr += s * v["gain"] * (1.0 + min(0.0, p))
        idx = s0 + i
        if idx >= TOTAL:
            break
        duck_v = duck((s0 + i) / SR)
        lp_l += c * (sl - lp_l)
        lp_r += c * (sr - lp_r)
        L[idx] += lp_l * env * level * duck_v * lfo
        R[idx] += lp_r * env * level * duck_v * lfo


def add_kick(start, level=0.9):
    n = int(0.42 * SR)
    s0 = int(start * SR)
    phase = 0.0
    lp = 0.0
    c = lowpass_coef(3200)
    for i in range(n):
        idx = s0 + i
        if idx >= TOTAL:
            return
        t = i / SR
        f = 46.0 + 132.0 * math.exp(-t * 30.0)
        phase += TWO_PI * f / SR
        body = math.sin(phase) * math.exp(-t * 6.8)
        click = (random.random() * 2.0 - 1.0) * math.exp(-t * 220.0) * 0.5
        lp += c * (click - lp)
        v = (body + lp * 0.6) * level
        L[idx] += v
        R[idx] += v


def add_clap(start, level=0.5):
    n = int(0.22 * SR)
    s0 = int(start * SR)
    bursts = [(0.0, 1.0), (0.012, 0.75), (0.025, 0.55)]
    prev = 0.0
    for i in range(n):
        idx = s0 + i
        if idx >= TOTAL:
            return
        t = i / SR
        env = 0.0
        for offset, g in bursts:
            if t >= offset:
                env += g * math.exp(-(t - offset) * 45.0)
        x = random.random() * 2.0 - 1.0
        hp = x - prev
        prev = x
        v = hp * env * 0.28 * level
        L[idx] += v * 0.9
        R[idx] += v * 1.1


def add_hat(start, level=0.16, open_hat=False):
    n = int((0.16 if open_hat else 0.05) * SR)
    s0 = int(start * SR)
    prev = 0.0
    prev2 = 0.0
    for i in range(n):
        idx = s0 + i
        if idx >= TOTAL:
            return
        t = i / SR
        x = random.random() * 2.0 - 1.0
        hp = x - 1.6 * prev + 0.7 * prev2
        prev2 = prev
        prev = x
        env = math.exp(-t * (34.0 if open_hat else 110.0))
        v = hp * env * level
        L[idx] += v * 0.95
        R[idx] += v * 1.05


def add_snare(start, level=0.5):
    n = int(0.19 * SR)
    s0 = int(start * SR)
    phase = 0.0
    prev = 0.0
    for i in range(n):
        idx = s0 + i
        if idx >= TOTAL:
            return
        t = i / SR
        x = random.random() * 2.0 - 1.0
        hp = x - prev
        prev = x
        phase += TWO_PI * 186.0 / SR
        body = math.sin(phase) * math.exp(-t * 24.0) * 0.35
        v = (hp * 0.5 + body) * math.exp(-t * 17.0) * level
        L[idx] += v
        R[idx] += v


def add_bass(start, dur, note, level=0.5, cutoff=420.0):
    n = int(dur * SR)
    s0 = int(start * SR)
    f = midi_hz(note)
    phase = 0.0
    phase2 = 0.0
    lp = 0.0
    c = lowpass_coef(cutoff)
    for i in range(n):
        idx = s0 + i
        if idx >= TOTAL:
            return
        t = i / SR
        env = min(1.0, t / 0.008) * math.exp(-t * 2.0)
        rel = min(1.0, max(0.0, (dur - t) / 0.04))
        phase += f / SR
        phase2 += 2.0 * f / SR
        raw = osc(SAW10, phase) * 0.6 + osc(SINE, phase2) * 0.55
        lp += c * (raw - lp)
        v = lp * env * rel * level * duck((s0 + i) / SR, 0.7)
        L[idx] += v
        R[idx] += v


def add_arp(start, note, level=0.16, pan=0.0, decay=16.0):
    dur = 0.22
    s0 = int(start * SR)
    n = min(int(dur * SR), TOTAL - s0)
    f = midi_hz(note)
    phase = 0.0
    lp = 0.0
    c0 = lowpass_coef(4200)
    c1 = lowpass_coef(700)
    for i in range(n):
        idx = s0 + i
        if idx < 0:
            continue
        if idx >= TOTAL:
            return
        t = i / SR
        phase += f / SR
        x = osc(SAW10, phase)
        c = c1 + (c0 - c1) * math.exp(-t * 22.0)
        lp += c * (x - lp)
        env = math.exp(-t * decay) * min(1.0, t / 0.004)
        v = lp * env * level * duck(idx / SR, 0.35)
        ARP_L[idx] += v * (1.0 - max(0.0, pan))
        ARP_R[idx] += v * (1.0 + min(0.0, pan))


def add_bell(start, note, level=0.2, pan=0.0):
    dur = 1.1
    s0 = int(start * SR)
    n = min(int(dur * SR), TOTAL - s0)
    f = midi_hz(note)
    partials = [(1.0, 1.0, 2.2), (2.01, 0.45, 3.4), (3.87, 0.22, 5.2), (5.43, 0.1, 7.5)]
    for i in range(n):
        idx = s0 + i
        t = i / SR
        v = 0.0
        for ratio, amp, decay in partials:
            v += math.sin(TWO_PI * f * ratio * t) * amp * math.exp(-t * decay)
        v *= level
        L[idx] += v * (1.0 - max(0.0, pan))
        R[idx] += v * (1.0 + min(0.0, pan))


def add_impact(start, level=0.7):
    n = int(1.4 * SR)
    s0 = int(start * SR)
    phase = 0.0
    prev = 0.0
    lp = 0.0
    c = lowpass_coef(900)
    for i in range(n):
        idx = s0 + i
        if idx < 0 or idx >= TOTAL:
            continue
        t = i / SR
        f = 32.0 + 150.0 * math.exp(-t * 22.0)
        phase += TWO_PI * f / SR
        sub = math.sin(phase) * math.exp(-t * 4.4)
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 40.0)
        hp = noise - prev
        prev = noise
        lp += c * (hp - lp)
        crash = lp * math.exp(-t * 2.4) * 0.5
        v = (sub * 1.1 + crash) * level
        L[idx] += v * 0.96
        R[idx] += v * 1.04


def add_whoosh(center, dur=0.55, level=0.4, direction=1.0):
    start = center - dur * 0.75
    s0 = int(start * SR)
    n = int(dur * SR)
    lp = 0.0
    prev = 0.0
    for i in range(n):
        idx = s0 + i
        if idx < 0 or idx >= TOTAL:
            continue
        p = i / n
        env = math.sin(math.pi * p) ** 2.0
        cutoff = 400.0 + 7000.0 * (p ** 2.2) if direction >= 0 else 7000.0 - 6600.0 * p
        c = lowpass_coef(cutoff)
        x = random.random() * 2.0 - 1.0
        lp += c * (x - lp)
        v = lp * env * level
        pan = (p - 0.5) * 1.2 * direction
        L[idx] += v * (1.0 - max(0.0, pan))
        R[idx] += v * (1.0 + min(0.0, pan))


def add_riser(start, dur, level=0.28):
    s0 = int(start * SR)
    n = int(dur * SR)
    lp = 0.0
    phase = 0.0
    for i in range(n):
        idx = s0 + i
        if idx >= TOTAL:
            return
        p = i / n
        c = lowpass_coef(300.0 + 12000.0 * p ** 2)
        x = random.random() * 2.0 - 1.0
        lp += c * (x - lp)
        f = 180.0 * (2.0 ** (p * 3.2))
        phase += TWO_PI * f / SR
        env = p ** 2.2
        v = (lp * 0.7 + math.sin(phase) * 0.16) * env * level
        L[idx] += v * 0.9
        R[idx] += v * 1.1


def add_tick(start, freq=2100.0, level=0.12):
    s0 = int(start * SR)
    n = int(0.035 * SR)
    for i in range(n):
        idx = s0 + i
        if idx >= TOTAL:
            return
        t = i / SR
        v = math.sin(TWO_PI * freq * t) * math.exp(-t * 160.0) * level
        L[idx] += v
        R[idx] += v


def add_shimmer(start, notes, level=0.12):
    for n_i, note in enumerate(notes):
        for k in range(6):
            add_bell(start + k * 0.1875 + n_i * 0.031, note + 12 * (k % 2), level * (1.0 - k * 0.13), (k - 2.5) / 3.0)


# ---------------------------------------------------------------- arrangement
# Intro pad + ticking clock + build into the first cut.
add_pad(0.0, 2.35, BARS[0][1], 900.0, 0.55)
for i in range(8):
    add_tick(0.05 + i * 0.25, 1600.0 + i * 90, 0.05 + i * 0.008)
add_riser(1.05, 0.95, 0.22)
add_whoosh(2.0, 0.55, 0.3)
add_impact(2.0, 0.55)

# Pads for every bar (slightly overlapping releases).
for bar in range(1, 15):
    t0 = bar * BAR
    if t0 < 26.0:
        cutoff = {"A": 1300, "B": 1700, "C": 2100, "break": 850,
                  "montage": 2400, "build": 1600}[section_at(t0)]
        add_pad(t0, 2.3, BARS[bar][1], cutoff, 0.42 if section_at(t0) != "break" else 0.5)
# Finale chords: F for 2 s, then the resolving Am(add9) at 28.0.
add_pad(26.0, 2.15, BARS[13][1], 2600.0, 0.55)
add_pad(28.0, 2.0, BARS[14][1], 3000.0, 0.62)
add_impact(26.0, 0.95)
add_shimmer(28.0, [69, 72, 76, 79, 81], 0.1)

# Drums, bass, arp.
for beat in range(BEATS_TOTAL + 1):
    t = beat * BEAT
    if t >= DURATION:
        break
    sec = section_at(t)
    bar = int(t / BAR)
    beat_in_bar = beat % 4
    chord = BARS[min(bar, 14)]

    if sec in ("A", "B", "C", "montage", "build"):
        add_kick(t, 0.92 if beat_in_bar == 0 else 0.84)
    elif sec == "break":
        if beat_in_bar in (0, 2):
            add_kick(t, 0.7)
    elif sec == "finale":
        if t in (26.0, 27.0, 27.5, 29.0):
            add_kick(t, 0.75)

    if sec in ("A", "B", "C", "montage", "build") and beat_in_bar in (1, 3):
        add_clap(t, 0.52 if sec != "build" else 0.6)

    # Hats
    if sec in ("A", "B", "C", "montage", "build"):
        for k in range(2 if sec == "A" else 4):
            ht = t + k * BEAT / (2 if sec == "A" else 4)
            add_hat(ht, 0.10 + 0.05 * (1 if k % 2 == 0 else 0) + (0.02 if sec == "build" else 0))
            if sec in ("C", "montage") and k == 2:
                add_hat(ht, 0.09, open_hat=True)
    elif sec == "break":
        add_hat(t, 0.07)
        add_hat(t + BEAT / 2, 0.1, open_hat=True)
    elif sec == "finale":
        add_hat(t, 0.06)
        add_hat(t + BEAT / 2, 0.09, open_hat=True)

    # Bass
    if sec in ("A", "B"):
        add_bass(t, 0.24, chord[0], 0.52, 380)
        add_bass(t + BEAT / 2, 0.22, chord[0], 0.42, 340)
    elif sec in ("C", "montage"):
        for k in range(4):
            note = chord[0] + (12 if (k == 3 and sec == "montage") else 0)
            add_bass(t + k * BEAT / 4, 0.115, note, 0.4 if k else 0.52, 520)
    elif sec == "build":
        for k in range(4):
            note = chord[0] + (12 if k % 2 else 0)
            add_bass(t + k * BEAT / 4, 0.11, note, 0.4, 620)
    elif sec == "break":
        if beat_in_bar == 0:
            add_bass(t, 1.85, chord[0], 0.42, 260)
    elif sec == "finale":
        if t in (26.0, 28.0):
            add_bass(t, 1.8, chord[0], 0.5, 300)

    # Arp / bells
    if sec in ("B", "C", "montage"):
        pattern = [0, 2, 4, 1, 3, 2, 4, 3]
        for k in range(4):
            idx = (beat * 4 + k) % len(pattern)
            note = chord[1][pattern[idx]] + (12 if (k + beat) % 3 == 0 else 0)
            pan = [(-0.5), 0.4, (-0.2), 0.55][k]
            add_arp(t + k * BEAT / 4, note, 0.12 if sec != "montage" else 0.15, pan)
    elif sec == "break":
        if beat_in_bar in (0, 2):
            add_bell(t, chord[1][2] + 12, 0.16, -0.25 if beat_in_bar == 0 else 0.3)
        if beat_in_bar == 3:
            add_bell(t, chord[1][4] + 12, 0.12, 0.5)
    elif sec == "build":
        for k in range(4):
            note = chord[1][(k + beat) % len(chord[1])] + 12 + (12 if beat >= 48 else 0)
            add_arp(t + k * BEAT / 4, note, 0.1 + (t - 22.0) * 0.012, (k - 1.5) / 2.0)
    elif sec == "finale" and t >= 28.0:
        for k in range(2):
            add_arp(t + k * BEAT / 2, chord[1][(k + 2) % len(chord[1])] + 24, 0.07, (k - 0.5))
    elif sec == "intro":
        pass

# Transition risers and whooshes into cuts.
for cut in (6.0, 10.0, 14.0, 18.0, 22.0, 26.0):
    add_whoosh(cut, 0.55, 0.32, 1.0 if cut not in (14.0,) else -1.0)
add_riser(5.1, 0.9, 0.16)
add_riser(9.0, 0.98, 0.2)
add_riser(13.0, 0.9, 0.15)
add_riser(17.0, 0.98, 0.22)
add_riser(21.2, 0.8, 0.14)
add_riser(23.4, 2.55, 0.3)
add_impact(6.0, 0.5)
add_impact(10.0, 0.68)
add_impact(14.0, 0.52)
add_impact(18.0, 0.7)
add_impact(22.0, 0.66)

# Snare roll + fills into the finale.
for i in range(32):
    t = 24.0 + i * 0.0625
    if t >= 26.0:
        break
    add_snare(t, 0.12 + i * 0.012)

# Poster montage: a click + whoosh on every 0.5 s cut (frames 18.0-22.0).
for i in range(8):
    t = 18.0 + i * 0.5
    if i > 0:
        add_whoosh(t, 0.24, 0.14, 1.0 if i % 2 else -1.0)
        add_tick(t, 1500.0 + i * 120.0, 0.06)

# Fill at 13.5 and 21.5.
for i in range(8):
    add_snare(13.5 + i * 0.0625, 0.18 + i * 0.015)
for i in range(8):
    add_snare(21.5 + i * 0.0625, 0.2 + i * 0.02)

# ---------------------------------------------------------------- arp delay
DELAY = int(0.375 * SR)   # dotted eighth
for i in range(TOTAL):
    src_l = ARP_L[i]
    src_r = ARP_R[i]
    if i >= DELAY:
        L[i] += ARP_L[i - DELAY] * 0.42 + ARP_R[i - 2 * DELAY] * 0.16
        R[i] += ARP_R[i - DELAY] * 0.42 + ARP_L[i - 2 * DELAY] * 0.16
    L[i] += src_l
    R[i] += src_r

# ---------------------------------------------------------------- master
peak = 0.001
for i in range(TOTAL):
    if abs(L[i]) > peak:
        peak = abs(L[i])
    if abs(R[i]) > peak:
        peak = abs(R[i])
gain = 0.92 / peak
print("peak", round(peak, 3), "gain", round(gain, 3))

out_path = "public/nova-reel-score.wav"
with wave.open(out_path, "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    buf = bytearray()
    for i in range(TOTAL):
        t = i / SR
        fade = 1.0
        if t < 0.04:
            fade = t / 0.04
        if t > 29.2:
            fade = max(0.0, (30.0 - t) / 0.8) ** 1.5
        l = math.tanh(L[i] * gain * 1.12) * fade
        r = math.tanh(R[i] * gain * 1.12) * fade
        buf.extend(struct.pack("<hh", int(max(-1.0, min(1.0, l)) * 32767), int(max(-1.0, min(1.0, r)) * 32767)))
    wf.writeframes(buf)

print("wrote", out_path)
