import wave
import struct
import math
import random
import os

SAMPLE_RATE = 44100
DURATION = 30.0
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)
BPM = 120.0
BEAT = 60.0 / BPM        # 0.5s
BAR = BEAT * 4.0         # 2.0s

random.seed(42)

def clamp(val, low=-1.0, high=1.0):
    return max(low, min(high, val))

def add_sine_sweep(left, right, start_s, dur_s, f_start, f_end, amp_start, amp_end, pan=0.0):
    s_idx = int(start_s * SAMPLE_RATE)
    n_samples = int(dur_s * SAMPLE_RATE)
    phase = 0.0
    for i in range(min(n_samples, TOTAL_SAMPLES - s_idx)):
        if s_idx + i < 0:
            continue
        p = i / n_samples
        freq = f_start * math.pow(f_end / max(1.0, f_start), p)
        amp = amp_start + (amp_end - amp_start) * p
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        val = math.sin(phase) * amp
        left[s_idx + i] += val * (1.0 - max(0.0, pan))
        right[s_idx + i] += val * (1.0 + min(0.0, pan))

def add_impact_hit(left, right, time_s, intensity=1.0):
    s_idx = int(time_s * SAMPLE_RATE)
    dur = int(0.7 * SAMPLE_RATE)
    phase = 0.0
    for i in range(min(dur, TOTAL_SAMPLES - s_idx)):
        if s_idx + i < 0:
            continue
        t = i / SAMPLE_RATE
        # Deep 808 sub drop from 180Hz down to 32Hz
        freq = 32.0 + 148.0 * math.exp(-t * 22.0)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        sub = math.sin(phase) * math.exp(-t * 5.5) * 0.9
        # Transient click
        click = (random.random() * 2.0 - 1.0) * math.exp(-t * 60.0) * 0.6
        # Metallic high resonance ring
        ring = (math.sin(2.0 * math.pi * 960.0 * t) + math.sin(2.0 * math.pi * 1440.0 * t)) * math.exp(-t * 26.0) * 0.25
        val = (sub + click + ring) * intensity
        left[s_idx + i] += val
        right[s_idx + i] += val

def add_whoosh(left, right, center_s, dur_s=0.45, intensity=0.5):
    s_idx = int((center_s - dur_s * 0.65) * SAMPLE_RATE)
    n_samples = int(dur_s * SAMPLE_RATE)
    lp_l, lp_r = 0.0, 0.0
    for i in range(min(n_samples, TOTAL_SAMPLES - s_idx)):
        idx = s_idx + i
        if idx < 0 or idx >= TOTAL_SAMPLES:
            continue
        p = i / n_samples
        env = math.sin(p * math.pi) ** 2.0
        alpha = 0.04 + 0.4 * env
        raw_l = (random.random() * 2.0 - 1.0)
        raw_r = (random.random() * 2.0 - 1.0)
        lp_l = lp_l + alpha * (raw_l - lp_l)
        lp_r = lp_r + alpha * (raw_r - lp_r)
        pan_l = (1.0 - p * 0.65)
        pan_r = (0.35 + p * 0.65)
        left[idx] += lp_l * env * intensity * pan_l
        right[idx] += lp_r * env * intensity * pan_r

def add_glitch_stutter(left, right, time_s, dur_s=0.25, rate=32):
    s_idx = int(time_s * SAMPLE_RATE)
    n_samples = int(dur_s * SAMPLE_RATE)
    step = int(SAMPLE_RATE / rate)
    for i in range(min(n_samples, TOTAL_SAMPLES - s_idx)):
        cycle_i = (i % step) / step
        t = i / SAMPLE_RATE
        freq = 440.0 + 880.0 * (i // step)
        val = math.sin(2.0 * math.pi * freq * t) * (1.0 - cycle_i) * 0.22
        noise = (random.random() * 2.0 - 1.0) * 0.15 * math.exp(-cycle_i * 4.0)
        idx = s_idx + i
        if 0 <= idx < TOTAL_SAMPLES:
            left[idx] += (val + noise)
            right[idx] += (val - noise)

def generate_apex_score():
    print("Synthesizing ApexReel 30s High-Octane Soundscape...")
    left = [0.0] * TOTAL_SAMPLES
    right = [0.0] * TOTAL_SAMPLES

    # 1. VISUAL KEYFRAME TRANSITION SOUND EFFECTS
    # Act 1 (0.0s - 4.0s)
    add_impact_hit(left, right, 0.05, intensity=1.2)   # Singularity hit
    add_whoosh(left, right, 1.95, dur_s=0.4, intensity=0.6)
    add_impact_hit(left, right, 2.00, intensity=0.9)   # Sub-drop
    add_whoosh(left, right, 3.90, dur_s=0.5, intensity=0.85)

    # Act 2 (4.0s)
    add_impact_hit(left, right, 4.00, intensity=1.25)  # Spatial UI Slam
    add_glitch_stutter(left, right, 6.5, dur_s=0.22, rate=28)
    add_whoosh(left, right, 8.90, dur_s=0.5, intensity=0.8)

    # Act 3 (9.0s)
    add_impact_hit(left, right, 9.00, intensity=1.15)  # Parametric Morph
    add_whoosh(left, right, 11.5, dur_s=0.35, intensity=0.5)
    add_whoosh(left, right, 13.90, dur_s=0.5, intensity=0.85)

    # Act 4 (14.0s)
    add_impact_hit(left, right, 14.00, intensity=1.3)  # Swiss Typo Blast
    add_glitch_stutter(left, right, 16.5, dur_s=0.25, rate=32)
    add_whoosh(left, right, 18.90, dur_s=0.45, intensity=0.85)

    # Act 5 Commercial Showcase (19.0, 20.5, 22.0, 23.5)
    cuts = [19.0, 20.5, 22.0, 23.5]
    for c in cuts:
        add_whoosh(left, right, c - 0.08, dur_s=0.3, intensity=0.7)
        add_impact_hit(left, right, c, intensity=1.1)

    # Act 6 Bezier / Algorithmic (25.0s)
    add_impact_hit(left, right, 25.0, intensity=1.15)
    add_sine_sweep(left, right, 26.2, 1.7, 120.0, 2400.0, 0.05, 0.45)
    add_whoosh(left, right, 27.9, dur_s=0.6, intensity=1.0)

    # Act 7 Finale Résumé (28.0s)
    add_impact_hit(left, right, 28.0, intensity=1.4)   # Master drop
    add_sine_sweep(left, right, 28.0, 1.8, 80.0, 24.0, 0.6, 0.0)

    # 2. DRUM & BASS SECTION (BPM = 120)
    # Kicks from 4.0s to 26.2s
    t = 4.0
    while t < 26.2:
        # standard 4 on the floor
        add_impact_hit(left, right, t, intensity=0.65)
        # syncopations on 8th bar
        bar_idx = int((t - 4.0) / BAR)
        beat_in_bar = int(((t - 4.0) % BAR) / BEAT)
        if beat_in_bar == 3 and random.random() > 0.4:
            add_impact_hit(left, right, t + BEAT * 0.5, intensity=0.55)
        t += BEAT

    # Snares / Claps on beats 2 and 4 (starting from 4.0s)
    t = 4.0 + BEAT
    while t < 26.2:
        s_idx = int(t * SAMPLE_RATE)
        s_len = int(0.18 * SAMPLE_RATE)
        for n in range(min(s_len, TOTAL_SAMPLES - s_idx)):
            ct = n / SAMPLE_RATE
            snare_tone = math.sin(2.0 * math.pi * 195.0 * ct) * math.exp(-ct * 22.0) * 0.35
            snare_noise = (random.random() * 2.0 - 1.0) * math.exp(-ct * 19.0) * 0.45
            val = (snare_tone + snare_noise) * 0.85
            left[s_idx + n] += val
            right[s_idx + n] += val
        t += BEAT * 2.0

    # Snare roll build-up from 26.2s to 27.95s
    r_t = 26.2
    while r_t < 27.92:
        prog = (r_t - 26.2) / 1.75
        step = 0.125 if prog < 0.6 else 0.0625
        s_idx = int(r_t * SAMPLE_RATE)
        s_len = int(0.08 * SAMPLE_RATE)
        gain = 0.25 + 0.65 * prog
        for n in range(min(s_len, TOTAL_SAMPLES - s_idx)):
            ct = n / SAMPLE_RATE
            noise = (random.random() * 2.0 - 1.0) * math.exp(-ct * 30.0) * gain
            left[s_idx + n] += noise
            right[s_idx + n] += noise
        r_t += step

    # Hi-hats: 16th-note rhythmic drive (4.0s - 26.0s)
    h_t = 4.0
    while h_t < 26.0:
        s_idx = int(h_t * SAMPLE_RATE)
        s_len = int(0.045 * SAMPLE_RATE)
        is_accent = int((h_t * 100)) % int(BEAT * 100) == 0
        gain = 0.18 if is_accent else 0.09
        for n in range(min(s_len, TOTAL_SAMPLES - s_idx)):
            ct = n / SAMPLE_RATE
            hat = (random.random() * 2.0 - 1.0) * math.exp(-ct * 70.0) * gain
            left[s_idx + n] += hat * 0.9
            right[s_idx + n] += hat * 1.1
        h_t += BEAT * 0.25

    # 3. SYNTHESIS BASSLINE & ARP RIFFS
    # Bass notes sequence: F# -> D -> A -> E (Cyberpunk progression)
    bass_freqs = [46.25, 36.71, 55.00, 41.20]  # F#1, D1, A1, E1
    for i in range(TOTAL_SAMPLES):
        curr_t = i / SAMPLE_RATE
        if curr_t < 4.0 or curr_t >= 26.2:
            continue
        bar_num = int((curr_t - 4.0) / BAR)
        root_f = bass_freqs[bar_num % len(bass_freqs)]
        
        # 16th note acid squelch filter
        phase_beat = (curr_t % (BEAT * 0.5)) / (BEAT * 0.5)
        cutoff = 1.0 + 3.0 * (1.0 - phase_beat) ** 2.5
        
        # Saw wave
        saw = 2.0 * ((curr_t * root_f) % 1.0) - 1.0
        sub = math.sin(2.0 * math.pi * (root_f * 0.5) * curr_t) * 0.5
        acid = math.sin(2.0 * math.pi * root_f * cutoff * curr_t) * 0.3
        
        b_val = (saw * 0.35 + sub + acid) * 0.28
        left[i] += b_val
        right[i] += b_val

    # Arpeggio Melody in Act 3 and Act 5
    arp_notes = [220.0, 261.63, 329.63, 440.0, 523.25, 659.25]
    for i in range(TOTAL_SAMPLES):
        curr_t = i / SAMPLE_RATE
        if (9.0 <= curr_t < 14.0) or (19.0 <= curr_t < 25.0):
            arp_idx = int(curr_t / (BEAT * 0.25)) % len(arp_notes)
            freq = arp_notes[arp_idx]
            sub_t = curr_t % (BEAT * 0.25)
            env = math.exp(-sub_t * 18.0)
            tone = (math.sin(2.0 * math.pi * freq * curr_t) + 0.3 * math.sin(4.0 * math.pi * freq * curr_t)) * env * 0.16
            left[i] += tone * 0.8
            right[i] += tone * 1.2

    # Normalization and soft limiter
    max_peak = 0.001
    for i in range(TOTAL_SAMPLES):
        max_peak = max(max_peak, abs(left[i]), abs(right[i]))
    
    print(f"Max audio peak: {max_peak:.2f}, normalizing...")
    norm_factor = 0.94 / max_peak

    out_path = os.path.join("public", "apex-score.wav")
    with wave.open(out_path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        
        for i in range(TOTAL_SAMPLES):
            # Soft-clip saturator
            l_val = math.tanh(left[i] * norm_factor)
            r_val = math.tanh(right[i] * norm_factor)
            
            l_int = int(clamp(l_val) * 32767.0)
            r_int = int(clamp(r_val) * 32767.0)
            wf.writeframes(struct.pack("<hh", l_int, r_int))

    print(f"Audio synthesized successfully -> {out_path}")

if __name__ == "__main__":
    generate_apex_score()
