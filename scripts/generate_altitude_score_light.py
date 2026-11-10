# -*- coding: utf-8 -*-
"""Light instrumental bed for 「高处不胜寒」.

Bright ukulele strums, a soft bass, sparse marimba phrases and a quiet shaker.
No vocals. Narration ducking is baked in from public/high-altitude/narration.mp3.

Full render replaces public/high-altitude/bgm.mp3.
A short preview (seconds < 60) only writes scripts/out/altitude-light-preview.wav.

    python scripts/generate_altitude_score_light.py        # full, ~392s
    python scripts/generate_altitude_score_light.py 24     # preview
"""
import math
import shutil
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 44100
BPM = 104.0
BEAT = 60.0 / BPM
BAR = BEAT * 4.0
FULL_DUR = 392.0

# I–vi–IV–V, voiced high and close so the bed stays light.
CHORDS = [
    {"name": "C", "tones": (196.00, 261.63, 329.63, 392.00), "bass": 130.81, "fifth": 196.00},
    {"name": "Am", "tones": (220.00, 261.63, 329.63, 440.00), "bass": 110.00, "fifth": 164.81},
    {"name": "F", "tones": (220.00, 261.63, 349.23, 440.00), "bass": 174.61, "fifth": 130.81},
    {"name": "G", "tones": (246.94, 293.66, 392.00, 493.88), "bass": 196.00, "fifth": 146.83},
]
# C D E G A, starting at C5. Phrases are 4 bars (16 quarters) over C–Am–F–G.
SCALE = (523.25, 587.33, 659.25, 783.99, 880.00)
PHRASES = [
    [0, 2, 3, 2, 4, 2, 0, None, 0, 4, 2, 0, 3, 1, 2, None],
    [2, 3, 2, 0, 0, 2, 4, 2, 4, 2, 0, None, 3, 2, 1, 3],
    [0, None, 2, 3, 4, 0, 2, None, 0, 2, 4, 0, 1, 3, 2, None],
    [3, 2, 0, 2, 4, 2, None, 0, 2, 0, 4, 2, 3, 1, 3, 2],
    [0, 2, 0, 3, 2, 4, 2, 0, None, 0, 4, 2, 3, 2, 1, None],
    [2, 0, 2, 3, 4, None, 2, 0, 0, 4, 0, 2, 1, 3, 1, 2],
]
# eighth index, velocity, upstroke. A small down-up bounce, not a wall of strums.
STRUMS = [
    (0, 1.00, False),
    (2, 0.72, False),
    (3, 0.46, True),
    (4, 0.94, False),
    (6, 0.56, False),
    (7, 0.40, True),
]
STRUMS_BREATH = [(0, 0.78, False), (4, 0.55, False)]
STRING_W = (0.92, 1.00, 0.90, 0.62)

G_STRUM = 0.18
G_BASS = 0.14
G_MALLET = 0.18
G_SHAKER = 0.055
G_TICK = 0.02
G_PAD = 0.034

rng = np.random.default_rng(20261110)
_cache = {}
left = None
right = None
N = 0


def place(sig, start_s, gain, pan):
    if gain <= 1e-5 or len(sig) == 0:
        return
    i0 = int(round(start_s * SR))
    if i0 >= N:
        return
    if i0 < 0:
        sig = sig[-i0:]
        i0 = 0
        if len(sig) == 0:
            return
    n = len(sig)
    if i0 + n > N:
        n = N - i0
        sig = sig[:n]
    angle = (max(-1.0, min(1.0, pan)) + 1.0) * (math.pi * 0.25)
    left[i0 : i0 + n] += sig[:n] * np.float32(gain * math.cos(angle))
    right[i0 : i0 + n] += sig[:n] * np.float32(gain * math.sin(angle))


def synth_karplus(freq, dur, half_time, brightness, attack=0.004):
    period = max(2, int(round(SR / freq)))
    f0 = SR / period
    n = int(dur * SR)
    tper = np.arange(period, dtype=np.float64) / SR
    cur = (1.0 - brightness) * np.sin(2 * np.pi * f0 * tper) + brightness * rng.uniform(-1.0, 1.0, period)
    cur -= np.mean(cur)
    decay = float(0.18 ** (1.0 / max(1.0, half_time * f0)))
    out = np.empty(n, dtype=np.float64)
    pos = 0
    while pos < n:
        take = min(period, n - pos)
        out[pos : pos + take] = cur[:take]
        avg = np.empty_like(cur)
        avg[0] = 0.5 * (cur[0] + cur[-1])
        avg[1:] = 0.5 * (cur[1:] + cur[:-1])
        cur = decay * avg
        pos += take
    t = np.arange(n, dtype=np.float64) / SR
    body = np.sin(2 * np.pi * f0 * t) * np.exp(-t / max(half_time, 0.05))
    out = out * 0.72 + body * 0.28
    att = min(n, int(attack * SR))
    out[:att] *= np.linspace(0.0, 1.0, att)
    rel = min(n, int(0.04 * SR))
    out[-rel:] *= np.linspace(1.0, 0.0, rel)
    out /= np.max(np.abs(out)) + 1e-9
    return out.astype(np.float32)


def highpass(sig, cutoff):
    """One-pole highpass, then re-normalize. Used to keep the bass from thumping."""
    dt = 1.0 / SR
    alpha = (1.0 / (2.0 * math.pi * cutoff)) / (1.0 / (2.0 * math.pi * cutoff) + dt)
    x = sig.astype(np.float64)
    y = np.empty_like(x)
    prev_y = 0.0
    prev_x = 0.0
    for i, sample in enumerate(x):
        prev_y = alpha * (prev_y + sample - prev_x)
        prev_x = sample
        y[i] = prev_y
    y /= np.max(np.abs(y)) + 1e-9
    return y.astype(np.float32)


def synth_mallet(freq, dur=0.42):
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    att = np.minimum(1.0, t / 0.002)
    s = (
        np.sin(2 * np.pi * freq * t) * np.exp(-5.2 * t)
        + 0.36 * np.sin(2 * np.pi * freq * 4.003 * t) * np.exp(-14.0 * t)
        + 0.12 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-9.0 * t)
    )
    s *= att
    rel = min(n, int(0.02 * SR))
    s[-rel:] *= np.linspace(1.0, 0.0, rel)
    s /= np.max(np.abs(s)) + 1e-9
    return s.astype(np.float32)


def synth_shaker():
    n = int(0.11 * SR)
    noise = rng.standard_normal(n)
    hp = np.empty(n, dtype=np.float64)
    hp[0] = 0.0
    hp[1:] = noise[1:] - noise[:-1]
    hp = np.convolve(hp, np.ones(5) / 5.0, mode="same")
    t = np.arange(n) / SR
    env = np.minimum(1.0, t / 0.004) * np.exp(-t * 32.0)
    s = hp * env
    s /= np.max(np.abs(s)) + 1e-9
    return s.astype(np.float32)


def synth_tick():
    n = int(0.04 * SR)
    t = np.arange(n, dtype=np.float64) / SR
    s = np.sin(2 * np.pi * 1680.0 * t) * np.exp(-t * 85.0)
    s += 0.3 * np.sin(2 * np.pi * 2360.0 * t) * np.exp(-t * 130.0)
    s /= np.max(np.abs(s)) + 1e-9
    return s.astype(np.float32)


def voice(freq, kind):
    key = (kind, round(float(freq), 2))
    if key not in _cache:
        if kind == "strum":
            _cache[key] = synth_karplus(freq, 0.85, 0.48, 0.38, attack=0.005)
        elif kind == "bass":
            _cache[key] = highpass(synth_karplus(freq, 0.6, 0.36, 0.10, attack=0.008), 90.0)
        elif kind == "mallet":
            _cache[key] = synth_mallet(freq)
        else:
            raise KeyError(kind)
    return _cache[key]


def bed_gain(bar):
    if bar < 2:
        return 0.68
    if bar < 4:
        return 0.82
    group = (bar - 4) // 8
    return 1.0 if group % 2 else 0.90


def add_pad(tones, start, gain):
    dur = BAR + 0.55
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float64) / SR
    env = np.minimum(1.0, t / 0.40) * np.minimum(1.0, np.maximum(0.0, (dur - t) / 0.50))
    env = env.astype(np.float32)
    for i, f in enumerate(tones[:3]):
        s = np.sin(2 * np.pi * f * t + i).astype(np.float32)
        s += np.float32(0.35) * np.sin(2 * np.pi * f * 1.003 * t).astype(np.float32)
        place(s * env * np.float32(0.22), start - 0.18, gain, -0.28 if i % 2 == 0 else 0.28)


def render(dur):
    global left, right, N
    N = int(SR * dur)
    left = np.zeros(N, dtype=np.float32)
    right = np.zeros(N, dtype=np.float32)
    shakers = [synth_shaker() for _ in range(5)]
    tick = synth_tick()
    n_bars = int(math.ceil(dur / BAR))
    print(f"rendering {dur:.1f}s, {n_bars} bars @ {BPM:.0f} bpm", flush=True)

    for bar in range(n_bars):
        if bar % 40 == 0:
            print(f"  bar {bar}/{n_bars}", flush=True)
        chord = CHORDS[bar % len(CHORDS)]
        gain = bed_gain(bar)
        breath = bar > 0 and bar % 8 == 0
        pattern = STRUMS_BREATH if breath else STRUMS
        strum_shift = float(rng.uniform(-0.008, 0.008))

        for eighth, vel, up in pattern:
            order = list(reversed(chord["tones"])) if up else list(chord["tones"])
            stagger = 0.008 if up else 0.013
            t0 = bar * BAR + eighth * (BEAT * 0.5) + strum_shift
            pan = 0.16 if up else -0.14
            for si, freq in enumerate(order):
                v = vel * STRING_W[si] * float(rng.uniform(0.94, 1.04))
                place(voice(freq, "strum"), t0 + si * stagger, G_STRUM * gain * v, pan)

        place(
            voice(chord["bass"], "bass"),
            bar * BAR + float(rng.uniform(-0.006, 0.006)),
            G_BASS * gain * float(rng.uniform(0.94, 1.02)),
            0.0,
        )
        if not breath:
            place(
                voice(chord["fifth"], "bass"),
                bar * BAR + 2 * BEAT + float(rng.uniform(-0.006, 0.006)),
                G_BASS * gain * 0.72,
                0.0,
            )

        if bar >= 1:
            shaker_scale = 0.4 if breath else 1.0
            for eighth in range(8):
                # Offbeats a little louder: that's the light bounce.
                vel = 0.55 if eighth % 2 == 0 else 0.9
                place(
                    shakers[(bar + eighth) % len(shakers)],
                    bar * BAR + eighth * (BEAT * 0.5),
                    G_SHAKER * gain * shaker_scale * vel,
                    0.42 if eighth % 2 == 0 else -0.42,
                )

        if bar >= 2 and not breath:
            for eighth in (2, 6):
                place(tick, bar * BAR + eighth * (BEAT * 0.5), G_TICK * gain, 0.1)

        if bar >= 4 and (bar - 4) % 8 < 4:
            rel = bar - 4
            phrase = PHRASES[(rel // 8) % len(PHRASES)]
            local = rel % 8
            for beat in range(4):
                degree = phrase[local * 4 + beat]
                if degree is None:
                    continue
                accent = 1.0 if beat == 0 else 0.78
                accent *= float(rng.uniform(0.95, 1.03))
                t0 = bar * BAR + beat * BEAT + 0.018 + float(rng.uniform(-0.005, 0.005))
                sig = voice(SCALE[degree], "mallet")
                g = G_MALLET * gain * accent
                place(sig, t0, g, 0.22)
                place(sig, t0 + 0.085, g * 0.12, 0.05)

        add_pad(chord["tones"], bar * BAR, G_PAD * gain * (0.65 if breath else 1.0))


def read_wav_mono(path):
    with wave.open(str(path), "rb") as wf:
        channels = wf.getnchannels()
        if wf.getsampwidth() != 2:
            raise RuntimeError(f"expected 16-bit wav, got {wf.getsampwidth() * 8}-bit")
        sr = wf.getframerate()
        data = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32)
    data /= 32768.0
    if channels == 2:
        data = data.reshape(-1, 2).mean(axis=1)
    return sr, data


def narration_duck(dur):
    """Lower the bed while the voice is present. Release fully after it ends."""
    out_dir = ROOT / "scripts" / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    narr_wav = out_dir / "narr-mono.wav"
    narr_mp3 = ROOT / "public" / "high-altitude" / "narration.mp3"
    if not narr_wav.exists():
        print("decoding narration for ducking...", flush=True)
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(narr_mp3), "-ac", "1", "-ar", str(SR), str(narr_wav)],
            check=True,
            capture_output=True,
        )
    narr_sr, narr = read_wav_mono(narr_wav)
    hop = int(0.05 * narr_sr)
    win = int(0.08 * narr_sr)
    n_frames = max(1, (len(narr) - win) // hop)
    env = np.empty(n_frames, dtype=np.float64)
    for i in range(n_frames):
        seg = narr[i * hop : i * hop + win]
        env[i] = math.sqrt(float(np.mean(seg * seg)))
    # Smooth the envelope a little before the threshold.
    kernel = 7
    c = np.cumsum(env)
    smooth = np.empty_like(env)
    for i in range(n_frames):
        a = max(0, i - kernel)
        smooth[i] = (c[i] - (c[a - 1] if a else 0.0)) / (i - a + 1)
    thr = float(np.percentile(smooth, 90)) + 1e-9
    smooth = np.clip(smooth / thr, 0.0, 1.0)
    # Floor near 0.46 while speaking, so the groove stays faintly present.
    duck = 1.0 - 0.54 * smooth
    acc = 1.0
    shaped = np.empty_like(duck)
    for i, value in enumerate(duck):
        coeff = 0.62 if value < acc else 0.16
        acc += coeff * (value - acc)
        shaped[i] = acc
    t_all = np.arange(N, dtype=np.float64) / SR
    duck_t = np.arange(n_frames) * (hop / narr_sr)
    curve = np.interp(t_all, duck_t, shaped).astype(np.float32)
    narr_dur = len(narr) / narr_sr
    release = np.clip((t_all - narr_dur) / 0.40, 0.0, 1.0).astype(np.float32)
    after = t_all > narr_dur
    curve[after] = curve[after] * (1.0 - release[after]) + release[after]
    speaking = float((smooth > 0.25).mean() * 100.0)
    print(f"ducking: threshold={thr:.4f}, voice-active frames={speaking:.0f}%", flush=True)
    return curve


def finish(dur, preview):
    # Tame the pluck spikes so the ringing tone, not the click, sets the loudness.
    raw_peak = max(float(np.max(np.abs(left))), float(np.max(np.abs(right))), 1e-6)
    drive = np.float32(2.4 / raw_peak)
    left[:] = np.tanh(left * drive).astype(np.float32)
    right[:] = np.tanh(right * drive).astype(np.float32)

    t_all = np.arange(N, dtype=np.float64) / SR
    curve = narration_duck(dur)
    fade = np.ones(N, dtype=np.float32)
    fi = min(N, int(0.7 * SR))
    fade[:fi] = np.linspace(0.0, 1.0, fi, dtype=np.float32) ** np.float32(1.3)
    tail = 0.35 if preview else 5.5
    fade_from = min(N, int(max(0.0, dur - tail) * SR))
    if fade_from < N:
        fade[fade_from:] *= np.linspace(1.0, 0.0, N - fade_from, dtype=np.float32)
    left[:] *= curve * fade
    right[:] *= curve * fade

    peak = max(float(np.max(np.abs(left))), float(np.max(np.abs(right))), 1e-6)
    left[:] *= np.float32(0.40 / peak)
    right[:] *= np.float32(0.40 / peak)
    rms = float(np.sqrt(np.mean(0.5 * (left.astype(np.float64) ** 2 + right.astype(np.float64) ** 2))))
    rms_db = 20.0 * math.log10(rms + 1e-9)
    peak_db = 20.0 * math.log10(0.40)
    print(f"master peak {peak_db:.1f} dBFS, rms {rms_db:.1f} dBFS", flush=True)

    out_dir = ROOT / "scripts" / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    wav_path = out_dir / ("altitude-light-preview.wav" if preview else "altitude-light.wav")
    pcm = np.empty(N * 2, dtype=np.int16)
    pcm[0::2] = np.clip(np.round(left * 32767.0), -32768, 32767).astype(np.int16)
    pcm[1::2] = np.clip(np.round(right * 32767.0), -32768, 32767).astype(np.int16)
    with wave.open(str(wav_path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())
    print(f"wrote {wav_path}", flush=True)

    if preview:
        return

    mp3_tmp = out_dir / "bgm-light.mp3"
    public_mp3 = ROOT / "public" / "high-altitude" / "bgm.mp3"
    backup = ROOT / "out" / "bgm-ambient-backup.mp3"
    backup.parent.mkdir(parents=True, exist_ok=True)
    if public_mp3.exists() and not backup.exists():
        shutil.copy2(public_mp3, backup)
        print(f"backed up previous bed to {backup}", flush=True)
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(wav_path),
            "-af", "highpass=f=70,lowpass=f=7400",
            "-c:a", "libmp3lame", "-b:a", "192k",
            str(mp3_tmp),
        ],
        check=True,
        capture_output=True,
    )
    shutil.copy2(mp3_tmp, public_mp3)
    wav_path.unlink(missing_ok=True)
    mp3_tmp.unlink(missing_ok=True)
    narr_wav = out_dir / "narr-mono.wav"
    narr_wav.unlink(missing_ok=True)
    print(f"replaced {public_mp3}", flush=True)


def main():
    preview_s = float(sys.argv[1]) if len(sys.argv) > 1 else None
    preview = preview_s is not None and preview_s < 60.0
    dur = preview_s if preview else FULL_DUR
    render(dur)
    finish(dur, preview)


if __name__ == "__main__":
    main()
