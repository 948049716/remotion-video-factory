"""
《跳槽马》分幕配乐与音效生成器。
纯标准库，无第三方依赖。输出 22.05kHz / 16-bit / mono WAV。

配乐不是通用循环，而是按 audio-direction.ts 的五幕 cue 表生成：
- 第一幕 规矩：市井、琵琶拨弦、木鱼、轻鼓，带一点讽刺。
- 第二幕 破例：低音持续、旧铜铃、刀疤脸四音下行。
- 第三幕 较劲：堂鼓、大锣、赵大人两步动机、一品大员单音压场。
- 第四幕 绝食：极稀疏、高音弱弦、铃铛、纸风，留大量空白。
- 第五幕 真相：马王金色琶音 -> 公堂冷调 -> 低音收尾。

运行：python scripts/generate_tiaocao_bgm.py
"""

import math
import os
import random
import struct
import wave
from array import array

SR = 22050
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, "public", "tiaocaoma", "audio", "music")
SFX_DIR = os.path.join(ROOT, "public", "tiaocaoma", "audio", "sfx")

NOTE_BASE = {
    "C": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 10,
    "Bb": 10,
    "B": 11,
}


def freq(note):
    name = note[:-1]
    octave = int(note[-1])
    midi = 12 * (octave + 1) + NOTE_BASE[name]
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))


class Mix:
    def __init__(self, duration):
        self.n = int(duration * SR)
        self.buf = array("f", [0.0]) * self.n

    def add_tone(
        self,
        start_sec,
        note,
        duration,
        amp=0.08,
        kind="pluck",
        attack=0.005,
        decay=3.0,
        release=0.08,
    ):
        start = int(start_sec * SR)
        n = int(duration * SR)
        f = freq(note) if isinstance(note, str) else note
        for i in range(n):
            idx = start + i
            if idx < 0 or idx >= self.n:
                continue
            t = i / SR
            if kind == "sine":
                v = math.sin(2 * math.pi * f * t)
            elif kind == "low":
                v = math.sin(2 * math.pi * f * t) + 0.35 * math.sin(
                    2 * math.pi * f * 0.5 * t
                )
            else:
                v = (
                    math.sin(2 * math.pi * f * t)
                    + 0.5 * math.sin(2 * math.pi * f * 2 * t)
                    + 0.25 * math.sin(2 * math.pi * f * 3 * t)
                )
            env = min(1.0, t / attack) if attack > 0 else 1.0
            env *= math.exp(-t * decay)
            if release > 0:
                env *= min(1.0, (n - i) / (release * SR))
            self.buf[idx] += v * env * amp

    def add_drone(self, duration, root_note, fifth_note, amp=0.04):
        n = int(duration * SR)
        root = freq(root_note)
        fifth = freq(fifth_note)
        for i in range(n):
            t = i / SR
            lfo = 0.65 + 0.35 * math.sin(2 * math.pi * 0.055 * t)
            v = math.sin(2 * math.pi * root * t)
            v += 0.55 * math.sin(2 * math.pi * fifth * t)
            v += 0.18 * math.sin(2 * math.pi * root * 0.5 * t)
            self.buf[i] += v * lfo * amp

    def add_noise(
        self,
        start_sec,
        duration,
        amp=0.04,
        cutoff=0.2,
        attack=0.01,
        release=0.15,
    ):
        start = int(start_sec * SR)
        n = int(duration * SR)
        prev = 0.0
        for i in range(n):
            idx = start + i
            if idx < 0 or idx >= self.n:
                continue
            white = random.uniform(-1.0, 1.0)
            prev += cutoff * (white - prev)
            env = min(1.0, (i / SR) / attack) if attack > 0 else 1.0
            env *= min(1.0, (n - i) / (release * SR)) if release > 0 else 1.0
            self.buf[idx] += prev * env * amp

    def add_paper(self, start_sec, amp=0.045, duration=0.5):
        self.add_noise(start_sec, duration, amp=amp, cutoff=0.65, attack=0.005, release=0.2)
        for _ in range(4):
            offset = start_sec + random.uniform(0.02, max(0.03, duration - 0.08))
            self.add_noise(offset, random.uniform(0.02, 0.07), amp=amp * 0.8, cutoff=0.9, attack=0.001, release=0.02)

    def add_wood(self, start_sec, amp=0.08):
        start = int(start_sec * SR)
        n = int(0.14 * SR)
        for i in range(n):
            idx = start + i
            if idx < 0 or idx >= self.n:
                continue
            t = i / SR
            v = math.sin(2 * math.pi * 1180 * t) * math.exp(-t * 42)
            v += 0.45 * math.sin(2 * math.pi * 1780 * t) * math.exp(-t * 65)
            self.buf[idx] += v * amp

    def add_drum(self, start_sec, amp=0.12):
        start = int(start_sec * SR)
        n = int(0.38 * SR)
        for i in range(n):
            idx = start + i
            if idx < 0 or idx >= self.n:
                continue
            t = i / SR
            f = 42 + 78 * math.exp(-t * 16)
            v = math.sin(2 * math.pi * f * t) * math.exp(-t * 12)
            v += random.uniform(-1, 1) * 0.12 * math.exp(-t * 55)
            self.buf[idx] += v * amp

    def add_bell(self, start_sec, note="A4", amp=0.07, duration=2.4):
        start = int(start_sec * SR)
        base = freq(note) if isinstance(note, str) else note
        partials = [(1.0, 1.0, 1.4), (2.0, 0.55, 2.2), (3.0, 0.35, 3.0), (4.2, 0.22, 4.0), (5.4, 0.12, 5.0)]
        n = int(duration * SR)
        for i in range(n):
            idx = start + i
            if idx < 0 or idx >= self.n:
                continue
            t = i / SR
            v = 0.0
            for ratio, gain, decay in partials:
                v += gain * math.sin(2 * math.pi * base * ratio * t) * math.exp(-t * decay)
            self.buf[idx] += v * amp

    def add_gong(self, start_sec, amp=0.11, duration=4.0):
        start = int(start_sec * SR)
        base = freq("D2")
        partials = [(1.0, 1.0, 0.7), (2.76, 0.55, 1.0), (5.4, 0.35, 1.4), (8.9, 0.2, 1.9)]
        n = int(duration * SR)
        for i in range(n):
            idx = start + i
            if idx < 0 or idx >= self.n:
                continue
            t = i / SR
            v = 0.0
            for ratio, gain, decay in partials:
                v += gain * math.sin(2 * math.pi * base * ratio * t) * math.exp(-t * decay)
            self.buf[idx] += v * amp

    def add_metal(self, start_sec, amp=0.05):
        start = int(start_sec * SR)
        n = int(0.45 * SR)
        for i in range(n):
            idx = start + i
            if idx < 0 or idx >= self.n:
                continue
            t = i / SR
            v = math.sin(2 * math.pi * 2350 * t)
            v += 0.55 * math.sin(2 * math.pi * 3720 * t)
            v += 0.3 * math.sin(2 * math.pi * 5100 * t)
            self.buf[idx] += v * math.exp(-t * 11) * amp

    def normalize(self, peak=0.35):
        current = max((abs(v) for v in self.buf), default=0.0)
        if current <= 0:
            return
        scale = peak / current
        for i in range(self.n):
            self.buf[i] *= scale

    def fade(self, seconds=1.0):
        n = min(int(seconds * SR), self.n // 2)
        for i in range(n):
            gain = i / n
            self.buf[i] *= gain
            self.buf[self.n - 1 - i] *= gain

    def write(self, path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        ints = array(
            "h",
            (
                int(max(-1.0, min(1.0, value)) * 32767)
                for value in self.buf
            ),
        )
        with wave.open(path, "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(SR)
            wav.writeframes(ints.tobytes())
        print(f"Wrote {path} ({self.n / SR:.1f}s)")


def compose_act1():
    duration = 115.0
    bpm = 96.0
    beat = 60.0 / bpm
    bar = 4 * beat
    mix = Mix(duration)
    mix.add_drone(duration, "D2", "A2", amp=0.035)

    bars = int(duration / bar)
    for b in range(bars):
        t = b * bar
        # 木鱼：二、四拍，轻
        mix.add_wood(t + beat, amp=0.055)
        mix.add_wood(t + 3 * beat, amp=0.045)
        # 低鼓：每两小节一次
        if b % 2 == 0:
            mix.add_drum(t, amp=0.07)
        # 店小二三音动机：每两小节一次
        if b % 2 == 0:
            base = t + beat * 0.5
            mix.add_tone(base, "D4", 0.35, amp=0.07, kind="pluck", decay=5.0)
            mix.add_tone(base + 0.22, "F4", 0.35, amp=0.065, kind="pluck", decay=5.0)
            mix.add_tone(base + 0.44, "A4", 0.55, amp=0.06, kind="pluck", decay=4.0)
        # 等级下行五声：每四小节一次
        if b % 4 == 2:
            base = t + beat * 0.2
            for index, note in enumerate(["D4", "C4", "Bb3", "A3"]):
                mix.add_tone(base + index * 0.32, note, 0.45, amp=0.055, kind="pluck", decay=4.5)
        # 纸声
        if b % 3 == 1:
            mix.add_paper(t + beat * 1.5, amp=0.03, duration=0.4)

    mix.fade(1.2)
    mix.normalize(0.34)
    mix.write(os.path.join(MUSIC_DIR, "act1-rules.wav"))


def compose_act2():
    duration = 110.0
    bpm = 72.0
    beat = 60.0 / bpm
    bar = 4 * beat
    mix = Mix(duration)
    mix.add_drone(duration, "D2", "A2", amp=0.04)

    bars = int(duration / bar)
    for b in range(bars):
        t = b * bar
        # 极稀疏木鱼
        if b % 4 == 0:
            mix.add_wood(t, amp=0.04)
        # 刀疤脸四音下行：每四小节
        if b % 4 == 1:
            base = t + beat
            for index, note in enumerate(["D3", "C3", "Bb2", "A2"]):
                mix.add_tone(base + index * 0.55, note, 0.8, amp=0.06, kind="pluck", decay=2.6)
        # 旧铜铃
        if b % 4 == 2:
            mix.add_bell(t + beat * 2, "A4", amp=0.045, duration=2.0)
        # 纸风
        if b % 2 == 0:
            mix.add_noise(t, duration=bar, amp=0.018, cutoff=0.04, attack=0.4, release=0.6)

    mix.fade(1.5)
    mix.normalize(0.32)
    mix.write(os.path.join(MUSIC_DIR, "act2-exception.wav"))


def compose_act3():
    duration = 105.0
    bpm = 108.0
    beat = 60.0 / bpm
    bar = 4 * beat
    mix = Mix(duration)
    mix.add_drone(duration, "D2", "A2", amp=0.045)

    bars = int(duration / bar)
    for b in range(bars):
        t = b * bar
        # 堂鼓：一、三拍
        mix.add_drum(t, amp=0.1)
        mix.add_drum(t + 2 * beat, amp=0.085)
        # 赵大人两步动机
        if b % 2 == 0:
            mix.add_tone(t + beat * 0.5, "F3", 0.3, amp=0.065, kind="pluck", decay=5.0)
            mix.add_tone(t + beat * 1.1, "D3", 0.45, amp=0.06, kind="pluck", decay=4.5)
        # 一品大员单音大锣
        if b % 8 == 3:
            mix.add_gong(t + beat * 2, amp=0.09)
        # 紧绷高音
        if b % 4 == 1:
            mix.add_tone(t + beat * 3, "A4", 0.6, amp=0.025, kind="sine", decay=2.0)
        # 金属杯盏
        if b % 3 == 2:
            mix.add_metal(t + beat * 2.5, amp=0.035)

    mix.fade(1.2)
    mix.normalize(0.36)
    mix.write(os.path.join(MUSIC_DIR, "act3-contest.wav"))


def compose_act4():
    duration = 95.0
    bpm = 48.0
    beat = 60.0 / bpm
    bar = 4 * beat
    mix = Mix(duration)
    mix.add_drone(duration, "D2", "A2", amp=0.028)

    bars = int(duration / bar)
    for b in range(bars):
        t = b * bar
        # 极稀疏铃铛
        if b % 4 == 1:
            mix.add_bell(t + beat, "A4", amp=0.035, duration=2.8)
        # 高音弱弦
        if b % 4 == 2:
            mix.add_tone(t + beat * 2, "E5", 0.9, amp=0.018, kind="sine", decay=1.2)
            mix.add_tone(t + beat * 2.4, "C5", 0.9, amp=0.014, kind="sine", decay=1.2)
        # 纸风
        mix.add_noise(t, duration=bar, amp=0.012, cutoff=0.03, attack=0.8, release=1.0)

    mix.fade(2.0)
    mix.normalize(0.28)
    mix.write(os.path.join(MUSIC_DIR, "act4-hunger.wav"))


def compose_act5():
    duration = 115.0
    bpm = 60.0
    beat = 60.0 / bpm
    bar = 4 * beat
    mix = Mix(duration)
    mix.add_drone(duration, "D2", "A2", amp=0.03)

    bars = int(duration / bar)
    memory_end = bars * 0.42
    court_start = bars * 0.52
    ending_start = bars * 0.82

    for b in range(bars):
        t = b * bar
        if b < memory_end:
            # 马王金色回忆：D 大调上行琶音
            if b % 2 == 0:
                base = t + beat * 0.4
                for index, note in enumerate(["D4", "F#4", "A4", "D5"]):
                    mix.add_tone(base + index * 0.26, note, 0.7, amp=0.065, kind="pluck", decay=3.5)
            if b % 4 == 2:
                mix.add_bell(t + beat * 2, "D5", amp=0.04, duration=2.2)
        elif b < ending_start:
            # 公堂冷调：回到 D 小调
            if b % 2 == 0:
                mix.add_tone(t + beat * 0.5, "F3", 0.3, amp=0.05, kind="pluck", decay=5.0)
                mix.add_tone(t + beat * 1.1, "D3", 0.45, amp=0.045, kind="pluck", decay=4.5)
            if b % 4 == 1:
                mix.add_drum(t, amp=0.06)
            if b % 8 == 3:
                mix.add_gong(t + beat * 2, amp=0.07)
        else:
            # 结尾：只留低音与纸风
            mix.add_noise(t, duration=bar, amp=0.012, cutoff=0.03, attack=1.0, release=1.0)

    mix.fade(2.5)
    mix.normalize(0.33)
    mix.write(os.path.join(MUSIC_DIR, "act5-truth.wav"))


def write_sfx(name, builder, peak=0.8):
    mix = builder()
    mix.normalize(peak)
    mix.write(os.path.join(SFX_DIR, name + ".wav"))


def sfx_paper():
    mix = Mix(0.9)
    mix.add_paper(0.02, amp=0.5, duration=0.7)
    return mix


def sfx_abacus():
    mix = Mix(0.8)
    for i in range(7):
        mix.add_wood(0.02 + i * 0.08, amp=0.35)
    return mix


def sfx_sword():
    mix = Mix(0.9)
    mix.add_noise(0.0, 0.5, amp=0.35, cutoff=0.9, attack=0.002, release=0.2)
    mix.add_metal(0.04, amp=0.25)
    mix.add_tone(0.0, 1800, 0.5, amp=0.08, kind="sine", decay=6.0)
    return mix


def sfx_bell():
    mix = Mix(2.8)
    mix.add_bell(0.02, "A4", amp=0.55, duration=2.6)
    return mix


def sfx_horse():
    mix = Mix(2.2)
    # 四拍马蹄
    for i in range(4):
        mix.add_drum(0.05 + i * 0.28, amp=0.35)
    # 鼻息
    mix.add_noise(1.25, 0.55, amp=0.18, cutoff=0.35, attack=0.08, release=0.3)
    mix.add_noise(1.3, 0.4, amp=0.12, cutoff=0.55, attack=0.05, release=0.25)
    return mix


def sfx_gong():
    mix = Mix(4.0)
    mix.add_gong(0.02, amp=0.55, duration=3.8)
    return mix


def sfx_door():
    mix = Mix(1.6)
    mix.add_drum(0.02, amp=0.25)
    mix.add_noise(0.02, 0.6, amp=0.18, cutoff=0.12, attack=0.02, release=0.3)
    mix.add_tone(0.05, 120, 0.8, amp=0.08, kind="low", decay=2.5)
    return mix


def sfx_stamp():
    mix = Mix(0.6)
    mix.add_wood(0.02, amp=0.4)
    mix.add_drum(0.01, amp=0.18)
    return mix


def sfx_weather():
    mix = Mix(8.0)
    mix.add_noise(0.0, 8.0, amp=0.22, cutoff=0.035, attack=1.2, release=1.2)
    mix.add_noise(0.0, 8.0, amp=0.08, cutoff=0.08, attack=0.8, release=1.0)
    return mix


def sfx_wood():
    mix = Mix(0.5)
    mix.add_wood(0.02, amp=0.45)
    return mix


def sfx_metal():
    mix = Mix(0.7)
    mix.add_metal(0.02, amp=0.4)
    return mix


def sfx_cloth():
    mix = Mix(0.8)
    mix.add_noise(0.02, 0.6, amp=0.28, cutoff=0.25, attack=0.04, release=0.25)
    return mix


def sfx_body():
    mix = Mix(0.7)
    mix.add_drum(0.01, amp=0.4)
    mix.add_noise(0.01, 0.25, amp=0.15, cutoff=0.1, attack=0.005, release=0.1)
    return mix


def sfx_crowd():
    mix = Mix(8.0)
    # 多层低通噪声模拟远处人声，避免出现清晰语义
    for i in range(6):
        mix.add_noise(
            0.0,
            8.0,
            amp=0.05,
            cutoff=0.02 + i * 0.008,
            attack=1.0,
            release=1.0,
        )
    for _ in range(18):
        start = random.uniform(0.0, 7.5)
        mix.add_noise(start, random.uniform(0.15, 0.45), amp=0.025, cutoff=0.12, attack=0.03, release=0.15)
    return mix


def main():
    random.seed(20261111)
    os.makedirs(MUSIC_DIR, exist_ok=True)
    os.makedirs(SFX_DIR, exist_ok=True)

    print("Generating act scores...")
    compose_act1()
    compose_act2()
    compose_act3()
    compose_act4()
    compose_act5()

    print("Generating SFX...")
    write_sfx("paper", sfx_paper, 0.75)
    write_sfx("abacus", sfx_abacus, 0.7)
    write_sfx("sword", sfx_sword, 0.75)
    write_sfx("bell", sfx_bell, 0.8)
    write_sfx("horse", sfx_horse, 0.8)
    write_sfx("gong", sfx_gong, 0.8)
    write_sfx("door", sfx_door, 0.75)
    write_sfx("stamp", sfx_stamp, 0.8)
    write_sfx("weather", sfx_weather, 0.45)
    write_sfx("wood", sfx_wood, 0.8)
    write_sfx("metal", sfx_metal, 0.7)
    write_sfx("cloth", sfx_cloth, 0.55)
    write_sfx("body", sfx_body, 0.8)
    write_sfx("crowd", sfx_crowd, 0.35)

    print("Done.")


if __name__ == "__main__":
    main()
