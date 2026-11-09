import wave
import struct
import math
import random

SAMPLE_RATE = 44100
DURATION = 30.0
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)
BPM = 120.0
BEAT = 60.0 / BPM        # 0.5s
BAR = BEAT * 4.0         # 2.0s

random.seed(2026)

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
    dur = int(0.65 * SAMPLE_RATE)
    phase = 0.0
    for i in range(min(dur, TOTAL_SAMPLES - s_idx)):
        if s_idx + i < 0:
            continue
        t = i / SAMPLE_RATE
        # Deep sub drop from 190Hz to 34Hz
        freq = 34.0 + 156.0 * math.exp(-t * 28.0)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        sub = math.sin(phase) * math.exp(-t * 6.5) * 0.85
        # Crisp transient click & metallic noise burst
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 45.0) * 0.45
        # High metallic overtone
        metal = (math.sin(2.0 * math.pi * 880.0 * t) + math.sin(2.0 * math.pi * 1318.5 * t)) * math.exp(-t * 22.0) * 0.18
        val = (sub + noise + metal) * intensity
        left[s_idx + i] += val
        right[s_idx + i] += val

def add_whoosh(left, right, center_s, dur_s=0.45, intensity=0.5):
    s_idx = int((center_s - dur_s * 0.7) * SAMPLE_RATE)
    n_samples = int(dur_s * SAMPLE_RATE)
    lp_l, lp_r = 0.0, 0.0
    for i in range(min(n_samples, TOTAL_SAMPLES - s_idx)):
        idx = s_idx + i
        if idx < 0 or idx >= TOTAL_SAMPLES:
            continue
        p = i / n_samples
        # Bell curve envelope peaking at 0.7
        env = math.sin(p * math.pi) ** 2.2
        alpha = 0.03 + 0.35 * env
        raw_l = (random.random() * 2.0 - 1.0)
        raw_r = (random.random() * 2.0 - 1.0)
        lp_l = lp_l + alpha * (raw_l - lp_l)
        lp_r = lp_r + alpha * (raw_r - lp_r)
        # Stereo sweep from left to right
        pan_l = (1.0 - p * 0.6)
        pan_r = (0.4 + p * 0.6)
        left[idx] += lp_l * env * intensity * pan_l
        right[idx] += lp_r * env * intensity * pan_r

def supersaw_chord(freqs, t, detune=0.006):
    val_l, val_r = 0.0, 0.0
    for f in freqs:
        # 3 detuned saws per note
        s0 = 2.0 * ((t * f) % 1.0) - 1.0
        s1 = 2.0 * ((t * f * (1.0 + detune)) % 1.0) - 1.0
        s2 = 2.0 * ((t * f * (1.0 - detune)) % 1.0) - 1.0
        sub_sine = math.sin(2.0 * math.pi * (f * 0.5) * t) * 0.4
        val_l += (s0 * 0.4 + s1 * 0.45 + s2 * 0.15 + sub_sine) / len(freqs)
        val_r += (s0 * 0.4 + s1 * 0.15 + s2 * 0.45 + sub_sine) / len(freqs)
    return val_l, val_r

def generate_masterpiece_audio():
    print("Synthesizing Custom 30s Showreel Soundtrack + Synced SFX...")
    left = [0.0] * TOTAL_SAMPLES
    right = [0.0] * TOTAL_SAMPLES

    # ==========================================================
    # 1. SYNCED SOUND EFFECTS (SFX) FOR VISUAL TRANSITIONS
    # ==========================================================
    # Act I: Ball squash impact at 0.4s, Metaball burst at 1.5s, Text slam at 3.0s, Iris wipe at 4.35s
    add_impact_hit(left, right, 0.40, intensity=1.1)
    add_whoosh(left, right, 1.50, dur_s=0.4, intensity=0.55)
    add_impact_hit(left, right, 1.50, intensity=0.8)
    add_impact_hit(left, right, 3.00, intensity=1.0)
    add_whoosh(left, right, 4.45, dur_s=0.5, intensity=0.75)
    add_impact_hit(left, right, 4.50, intensity=1.15)  # Act II Swiss Brutalism entry

    # Act III: Isometric 3D entry at 9.0s
    add_whoosh(left, right, 8.95, dur_s=0.45, intensity=0.7)
    add_impact_hit(left, right, 9.00, intensity=1.1)

    # Act IV: Chromatic Liquid entry at 14.0s
    add_whoosh(left, right, 13.95, dur_s=0.55, intensity=0.8)
    add_impact_hit(left, right, 14.00, intensity=1.2)

    # Act V: 4 Rapid-Fire Showcase Cuts at 19.0s, 20.5s, 22.0s, 23.5s
    for cut_t in [19.0, 20.5, 22.0, 23.5]:
        add_whoosh(left, right, cut_t - 0.05, dur_s=0.35, intensity=0.65)
        add_impact_hit(left, right, cut_t, intensity=1.05)

    # Act VI: Crescendo Riser (24.8s -> 26.2s) & Final Résumé Drop at 26.2s
    add_sine_sweep(left, right, 24.8, 1.4, 140.0, 1800.0, 0.05, 0.38)
    add_whoosh(left, right, 26.15, dur_s=0.5, intensity=0.9)
    add_impact_hit(left, right, 26.20, intensity=1.35)

    # ==========================================================
    # 2. RHYTHM SECTION (KICKS, SNARES, HI-HATS, ROLLS)
    # ==========================================================
    # Punchy Four-on-the-floor & Syncopated Kicks from 4.5s to 24.8s, and 26.2s
    kick_times = []
    t_cursor = 4.5
    while t_cursor < 24.8:
        kick_times.append(t_cursor)
        # Add syncopated double kick before bar endings
        if int((t_cursor - 4.5) / BEAT) % 8 == 7:
            kick_times.append(t_cursor + BEAT * 0.5)
        t_cursor += BEAT

    for kt in kick_times:
        add_impact_hit(left, right, kt, intensity=0.68)

    # Crisp Claps / Snares on off-beats
    snare_cursor = 4.5 + BEAT
    while snare_cursor < 24.8:
        s_idx = int(snare_cursor * SAMPLE_RATE)
        s_len = int(0.18 * SAMPLE_RATE)
        for n in range(min(s_len, TOTAL_SAMPLES - s_idx)):
            ct = n / SAMPLE_RATE
            body = math.sin(2.0 * math.pi * 210.0 * ct) * math.exp(-ct * 24.0) * 0.32
            snap = (random.random() * 2.0 - 1.0) * math.exp(-ct * 18.0) * 0.42
            left[s_idx + n] += (body + snap) * 0.95
            right[s_idx + n] += (body + snap) * 1.05
        snare_cursor += BEAT * 2.0

    # Snare Build-up Roll (24.8s to 26.15s)
    roll_t = 24.8
    step = 0.125
    while roll_t < 26.12:
        if roll_t > 25.5:
            step = 0.0625  # 32nd note fast roll
        s_idx = int(roll_t * SAMPLE_RATE)
        s_len = int(0.08 * SAMPLE_RATE)
        gain = 0.2 + 0.5 * ((roll_t - 24.8) / 1.35)
        for n in range(min(s_len, TOTAL_SAMPLES - s_idx)):
            ct = n / SAMPLE_RATE
            snap = (random.random() * 2.0 - 1.0) * math.exp(-ct * 35.0) * gain
            left[s_idx + n] += snap
            right[s_idx + n] += snap
        roll_t += step

    # Precision Hi-Hats (16th notes)
    hat_step = BEAT / 4.0
    for i in range(int(4.5 / hat_step), int(24.8 / hat_step)):
        ht = i * hat_step
        s_idx = int(ht * SAMPLE_RATE)
        h_len = int(0.038 * SAMPLE_RATE)
        is_open = (i % 4 == 2)
        if is_open:
            h_len = int(0.11 * SAMPLE_RATE)
        decay = 35.0 if is_open else 110.0
        amp = 0.20 if is_open else (0.14 if i % 2 == 0 else 0.08)
        pan = 0.25 if (i % 2 == 0) else -0.25
        for n in range(min(h_len, TOTAL_SAMPLES - s_idx)):
            ct = n / SAMPLE_RATE
            noise = (random.random() * 2.0 - 1.0) * math.exp(-ct * decay) * amp
            left[s_idx + n] += noise * (1.0 + pan)
            right[s_idx + n] += noise * (1.0 - pan)

    # ==========================================================
    # 3. HARMONIC SUPERSAW CHORDS & PLUCK ARPEGGIOS (WITH SIDECHAIN)
    # ==========================================================
    # Progression in C Minor / Eb Major (Heroic, Modern, Emotional):
    # Chords: Cm9 -> AbMaj7 -> EbMaj7 -> Bb6
    chords = [
        [130.81, 196.00, 233.08, 293.66, 311.13],  # Cm9 (C3, G3, Bb3, D4, Eb4)
        [103.83, 155.56, 196.00, 261.63, 311.13],  # AbMaj7 (Ab2, Eb3, G3, C4, Eb4)
        [155.56, 233.08, 293.66, 349.23, 392.00],  # EbMaj9 (Eb3, Bb3, D4, F4, G4)
        [116.54, 174.61, 220.00, 293.66, 349.23],  # Bbadd9 (Bb2, F3, A3, D4, F4)
    ]
    arp_notes = [261.63, 311.13, 392.00, 466.16, 587.33, 622.25, 783.99, 587.33]

    # Sample-by-sample synth & bass generation with sidechain ducking
    for i in range(TOTAL_SAMPLES):
        t = i / SAMPLE_RATE
        chord_idx = int(t / 2.25) % len(chords)
        curr_chord = chords[chord_idx]

        # Sidechain pumping envelope (ducks every 0.5s beat when drums play)
        if 4.5 <= t < 24.8:
            beat_phase = ((t - 4.5) % BEAT) / BEAT
            sidechain = 0.25 + 0.75 * (1.0 - math.exp(-beat_phase * 5.5))
        else:
            sidechain = 1.0

        # Act I (0 - 4.5s): Crystalline Futuristic Pluck + Deep Drone
        if t < 4.5:
            drone = math.sin(2.0 * math.pi * 65.41 * t) * 0.25 * min(1.0, t / 0.8)
            arp_step = int(t / 0.125)
            arp_local = (t % 0.125)
            arp_f = arp_notes[arp_step % len(arp_notes)]
            pluck = math.sin(2.0 * math.pi * arp_f * t + math.sin(2.0 * math.pi * arp_f * 2.0 * t) * math.exp(-arp_local * 25.0))
            pluck *= math.exp(-arp_local * 18.0) * 0.22
            left[i] += drone + pluck * 0.8
            right[i] += drone + pluck * 1.2

        # Act II & III (4.5s - 14.0s): Driving Synth Bass + Crisp FM Arpeggio
        elif t < 14.0:
            bass_f = curr_chord[0] * 0.5
            # Sawtooth + Sub bass
            sub = math.sin(2.0 * math.pi * bass_f * t) * 0.42
            saw_bass = (2.0 * ((t * bass_f * 2.0) % 1.0) - 1.0) * 0.18
            # Arpeggio 16th notes
            arp_step = int(t / 0.125)
            arp_local = (t % 0.125)
            arp_f = arp_notes[(arp_step + chord_idx * 2) % len(arp_notes)]
            fm_mod = math.sin(2.0 * math.pi * arp_f * 3.0 * t) * math.exp(-arp_local * 30.0) * 1.5
            arp_val = math.sin(2.0 * math.pi * arp_f * t + fm_mod) * math.exp(-arp_local * 16.0) * 0.20
            pan = math.sin(t * 6.0) * 0.4
            left[i] += (sub + saw_bass) * sidechain + arp_val * (1.0 - pan)
            right[i] += (sub + saw_bass) * sidechain + arp_val * (1.0 + pan)

        # Act IV & V (14.0s - 24.8s): Lush Future Bass Supersaw Chords + Heavy Sub
        elif t < 24.8:
            sl, sr = supersaw_chord(curr_chord, t, detune=0.007)
            # LFO flutter on chords during Act IV
            flutter = 0.7 + 0.3 * math.sin(2.0 * math.pi * 8.0 * t) if t < 19.0 else 1.0
            bass_f = curr_chord[0] * 0.5
            sub = math.sin(2.0 * math.pi * bass_f * t) * 0.45
            left[i] += (sl * 0.34 * flutter + sub) * sidechain
            right[i] += (sr * 0.34 * flutter + sub) * sidechain

        # Act VI Finale Drop (26.2s - 30.0s): Grand Glorious Cm9 Resolution Chord + Shimmer
        elif t >= 26.2:
            tail_t = t - 26.2
            fade = max(0.0, 1.0 - (tail_t / 3.7) ** 1.6)
            final_chord = [130.81, 196.00, 261.63, 311.13, 392.00, 587.33]
            sl, sr = supersaw_chord(final_chord, t, detune=0.008)
            sub = math.sin(2.0 * math.pi * 65.41 * t) * 0.48 * fade
            left[i] += (sl * 0.36 + sub) * fade
            right[i] += (sr * 0.36 + sub) * fade

    # ==========================================================
    # 4. MASTERING (SOFT CLIPPING & NORMALIZATION)
    # ==========================================================
    peak = max(max(abs(x) for x in left), max(abs(x) for x in right), 0.001)
    gain = 0.94 / peak
    print(f"Mastering Audio: Peak={peak:.3f}, Gain={gain:.3f}")

    wav_path = "C:/Users/GF/.gemini/antigravity/scratch/remotion-video/public/showreel-music.wav"
    with wave.open(wav_path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        buf = bytearray()
        for i in range(TOTAL_SAMPLES):
            l = math.tanh(left[i] * gain * 1.15)
            r = math.tanh(right[i] * gain * 1.15)
            sl = max(-32768, min(32767, int(l * 32767.0)))
            sr = max(-32768, min(32767, int(r * 32767.0)))
            buf.extend(struct.pack("<hh", sl, sr))
        wf.writeframes(buf)
    print("Saved WAV successfully.")

if __name__ == "__main__":
    generate_masterpiece_audio()
