# -*- coding: utf-8 -*-
# LEGACY: aligns 文稿.txt order to the audio. The recorded narration re-orders
# and repeats content, so this produces a wrong timeline. Use
# scripts/build_altitude_timeline2.py (explicit ASR ranges per scene) instead.
"""Align the verbatim script to ASR word timestamps and emit timeline.ts.

Strategy:
1. Flatten ASR words into a char stream with per-char [start,end] times.
2. Strip punctuation from the script; every script char keeps a link back
   to its segment.
3. difflib.SequenceMatcher aligns script chars to ASR chars despite ASR
   errors; unmatched script chars get interpolated times.
4. Emit src/videos/HighAltitude/timeline.ts with per-segment and per-char
   absolute times at 60fps.
"""
import json
import os
import sys
import unicodedata

ASR_PATH = "scripts/out/narration-asr.json"
ESTIMATE = "--estimate" in sys.argv
NARRATION_SECONDS = 382.92
OUT_PATH = "src/videos/HighAltitude/timeline.ts"
OUTRO_SECONDS = 6.5
FPS = 60

# ---------------------------------------------------------------- segments
# (scene, headline, text) — text must be a contiguous substring of the
# narration script, in order. Chapter headings are included as spoken.
SEGMENTS = [
    ("hook", "夏天去爬山", "夏天去爬山，山脚下还穿着短袖汗流浃背，"),
    ("hook-peak", "山顶却冻得瑟瑟发抖", "到了山顶却冻得瑟瑟发抖，甚至还得租一件军大衣。"),
    ("question", "离太阳越近，为什么越冷？", "很多人都会冒出一个疑问：明明爬得越高、离太阳越近，为什么温度反而越来越低？"),
    ("intuition", "靠近火炉会变暖", "直觉告诉我们，靠近火炉会变暖；"),
    ("lapse-rate", "每升高1000米，下降约6℃", "但在大气层里，海拔每升高1000米，气温平均会下降约6℃。"),
    ("three-lies", "被三个日常直觉骗了", "这并不是因为太阳“失灵”了，而是因为我们被三个日常直觉骗了。"),
    ("chapter-1", "一、距离的错觉", "一、 距离的错觉：150米外往前迈了“半毫米”"),
    ("cosmic-scale", "对宇宙尺度最大的误解", "觉得“爬上高山就离太阳更近”，其实是对宇宙尺度最大的误解。"),
    ("numbers", "1.5亿公里 vs 8.8公里", "日地平均距离大约是 1.5亿公里，而地球上最高的珠穆朗玛峰，海拔也不过 8.8公里 左右。"),
    ("bonfire-setup", "8.8公里算什么概念？", "8.8公里放在1.5亿公里面前是什么概念？"),
    ("bonfire-step", "篝火150米，往前挪1厘米", "这就好比你站在距离一堆篝火 150米 远的地方，然后为了取暖，极其微弱地往前挪动了 不到1厘米。"),
    ("negligible", "连十万分之一都不到", "这点微不足道的距离变化，带来的太阳辐射增强连十万分之一都不到，完全可以忽略不计。"),
    ("same-sun", "烘烤强度几乎没有区别", "所以，无论你是在海平面还是在珠峰顶，太阳对你的“烘烤强度”在距离上几乎没有区别。"),
    ("chapter-2", "二、暖气片在你脚下", "二、 真正的“暖气片”不在天上，而在你脚下"),
    ("source", "热源不是太阳，是地面", "既然距离不是问题，那为什么高空会冷？因为把空气烤暖的直接热源，根本不是太阳，而是地面。"),
    ("picky", "大气是个“挑食”的家伙", "这听起来很反直觉，但大气层其实是个非常“挑食”的家伙："),
    ("shortwave", "短波辐射，直接穿过空气", "太阳光直接穿过了空气： 太阳发出的热量主要是短波辐射（比如可见光）。"),
    ("armor-piercing", "像穿甲弹一样长驱直入", "干净的大气对短波辐射几乎是透明的，阳光像穿甲弹一样长驱直入，空气根本抓不住它，只能眼睁睁看着它照向大地。"),
    ("ground-heat", "地面才是真正的加热器", "地面才是真正的“加热器”： 大地（土壤、岩石、海洋）吸收了充足的阳光后温度升高，"),
    ("longwave", "长波辐射，红外线", "随后开始向外散发热量。这时候散发出来的是长波辐射（红外线）。"),
    ("catch", "温室气体一抓一个准", "空气靠地面“喂饱”： 大气中的水汽、二氧化碳等温室气体，对太阳的短波辐射无动于衷，却对地面发出的长波辐射极度敏感，一抓一个准。"),
    ("chain", "太阳晒热地面", "所以，我们所处的对流层大气，并不是被头顶的太阳直接晒热的，而是先由太阳晒热地面，"),
    ("blanket", "地面像电热毯，从下往上烤", "再由地面像一块巨大的“电热毯”或“暖气片”一样，从下往上把空气烤热的。"),
    ("climb-away", "离热源越远，自然就越冷", "当你往高处爬时，虽然离太阳近了微不足道的一点点，但你却实打实地远离了脚下这块真正的“大暖气片”。离热源越远，自然就越冷。"),
    ("chapter-3", "三、空气的自我消耗", "三、 空气的“自我消耗”：绝热膨胀与漏风的棉被"),
    ("rise-expand", "上升、膨胀、压力变小", "地面附近的空气被烤热后会往上升。但是，海拔越高，空气越稀薄，周围的大气压力就越小。当一团热空气上升到高空时，外面的压力变小了，它就会像解开束缚一样向外膨胀。"),
    ("adiabatic", "绝热膨胀降温", "在物理学中，气体膨胀需要对外做功，既然没有外界给它补充能量，它就只能消耗自己的内能，导致温度急剧下降——这叫“绝热膨胀降温”。"),
    ("experiment-warm", "张嘴哈气，是暖的", "你可以立刻做一个小实验来感受它：张大嘴巴往手心“哈气”，吹出来的气是暖的；"),
    ("experiment-cold", "噘嘴吹气，是凉的", "噘起嘴巴留一个小孔往手心“吹气”，吹出来的气立刻变成凉的了。"),
    ("experiment-37", "同样37℃，为何一暖一凉", "明明都是肺里37℃的气体，噘嘴吹气时，气流从窄口喷出后瞬间膨胀，消耗了热量，温度就降了下来。上升到高空的空气，每天都在经历这种降温。"),
    ("duvet", "低海拔：厚厚的羽绒被", "低海拔地区空气稠密，水汽、尘埃和二氧化碳多，就像盖了一层厚厚的羽绒被，地面散发的热量很容易被锁住。"),
    ("gauze", "高海拔：羽绒被变薄纱巾", "而到了高海拔地区，空气稀薄、干燥，水汽极少，相当于羽绒被变成了薄纱巾，热量一散出去就逃逸到了太空中，根本留不住温度。"),
]

ASCII_PUNCT = set(" \t\n\r，。、；：？！“”‘’（）()《》〈〉—…·「」『』,.;:?!\"'")
HARD_PUNCT = set("，。、；：？！“”‘’（）()《》〈〉—…·「」『』,.;:?!\"' \t\n\r")


def is_cjk_or_alnum(ch: str) -> bool:
    if ch in HARD_PUNCT:
        return False
    cat = unicodedata.category(ch)
    return cat[0] in ("L", "N") or cat == "Po" and ch not in HARD_PUNCT


def norm(ch: str) -> str:
    """Normalize for matching (lowercase latin, keep digits)."""
    return ch.lower()


def main():
    if ESTIMATE or not os.path.exists(ASR_PATH):
        # Provisional uniform timing by char count (layout development only).
        all_chars = sum(len(t) for _, _, t in SEGMENTS)
        start, end = 0.4, NARRATION_SECONDS - 0.3
        per = (end - start) / all_chars
        asr = {"duration": NARRATION_SECONDS, "segments": []}
        words = []
        cursor = start
        for _scene, _headline, text in SEGMENTS:
            for ch in text:
                if is_cjk_or_alnum(ch):
                    words.append({"start": cursor, "end": cursor + per, "word": ch})
                    cursor += per
                else:
                    cursor += per * 0.35
        asr["segments"].append({"start": start, "end": cursor, "text": "", "words": words})
        print("(estimate mode: uniform per-char timing)")
    else:
        with open(ASR_PATH, "r", encoding="utf-8") as f:
            asr = json.load(f)
        print(f"Loaded ASR: {len(asr['segments'])} segments")

    # ---- 1. ASR char stream ----
    asr_chars = []
    asr_times = []
    for seg in asr["segments"]:
        for w in seg["words"]:
            text = w["word"].strip()
            chars = [c for c in text if is_cjk_or_alnum(c)]
            if not chars:
                continue
            step = (w["end"] - w["start"]) / len(chars)
            for i, c in enumerate(chars):
                if i > 0 and norm(c) == norm(chars[i - 1]) and len(chars) > 1:
                    # whisper sometimes emits repeated tokens for one char
                    pass
                asr_chars.append(norm(c))
                asr_times.append([w["start"] + step * i, w["start"] + step * (i + 1)])
    asr_str = "".join(asr_chars)
    print(f"ASR chars: {len(asr_str)}")

    # ---- 2. Script char stream ----
    script_chars = []
    links = []  # (seg_index, char_index_in_text)
    for si, (_scene, _headline, text) in enumerate(SEGMENTS):
        for ci, ch in enumerate(text):
            if is_cjk_or_alnum(ch):
                script_chars.append(norm(ch))
                links.append((si, ci))
    script_str = "".join(script_chars)
    print(f"Script chars: {len(script_str)}")

    # ---- 3. Align ----
    import difflib

    sm = difflib.SequenceMatcher(None, script_str, asr_str, autojunk=False)
    char_time = [None] * len(script_str)
    for block in sm.get_matching_blocks():
        for k in range(block.size):
            char_time[block.a + k] = asr_times[block.b + k]

    # Fill unmatched runs by linear interpolation between known neighbors.
    known = [i for i, t in enumerate(char_time) if t is not None]
    if not known:
        raise SystemExit("Alignment failed: no matched chars")
    print(f"Matched {len(known)}/{len(script_str)} chars ({(len(known)/len(script_str))*100:.1f}%)")
    for i in range(len(char_time)):
        if char_time[i] is None:
            prev_i = next((j for j in reversed(known) if j < i), None)
            next_i = next((j for j in known if j > i), None)
            if prev_i is None and next_i is None:
                char_time[i] = [0.0, 0.0]
            elif prev_i is None:
                t = char_time[next_i][0]
                char_time[i] = [t, t]
            elif next_i is None:
                t = char_time[prev_i][1]
                char_time[i] = [t, t]
            else:
                a = char_time[prev_i][1]
                b = char_time[next_i][0]
                f = (i - prev_i) / (next_i - prev_i)
                t = a + (b - a) * f
                char_time[i] = [t, t]

    # ---- 4. Segment times ----
    seg_char_times = [[] for _ in SEGMENTS]
    for i, (si, ci) in enumerate(links):
        seg_char_times[si].append((ci, char_time[i][0], char_time[i][1]))

    seg_meta = []
    last_end = 0.0
    for si, (scene, headline, text) in enumerate(SEGMENTS):
        times = seg_char_times[si]
        start = min(t for _, t, _ in times)
        end = max(e for _, _, e in times)
        start = max(start, last_end)
        seg_meta.append({"scene": scene, "headline": headline, "text": text, "start": start, "end": end})
        last_end = end

    # Extend each segment to the next one's start (minus 1 frame), clamp minor overlaps.
    for si in range(len(seg_meta) - 1):
        nxt = seg_meta[si + 1]["start"]
        if seg_meta[si]["end"] > nxt:
            seg_meta[si]["end"] = max(seg_meta[si]["start"] + 0.3, nxt)
        seg_meta[si]["end"] = nxt
    seg_meta[-1]["end"] = max(seg_meta[-1]["end"], asr["duration"])

    # Per-char times for captions (absolute).
    char_abs = [[] for _ in SEGMENTS]
    for si, (scene, headline, text) in enumerate(SEGMENTS):
        arr = []
        times = sorted(seg_char_times[si], key=lambda x: x[0])
        for ci, s, e in times:
            arr.append((ci, s, e))
        char_abs[si] = arr

    total_seconds = asr["duration"] + OUTRO_SECONDS

    # ---- 5. Emit TS ----
    def esc(s: str) -> str:
        return s.replace("\\", "\\\\").replace('"', '\\"')

    lines = []
    lines.append("/**")
    lines.append(" * HighAltitude — audio-synced timeline (generated by scripts/build_altitude_timeline.py).")
    lines.append(f" * Narration: public/high-altitude/narration.mp3, {asr['duration']:.2f}s, ASR-aligned per char.")
    lines.append(f" * Total incl. {OUTRO_SECONDS}s outro: {total_seconds:.2f}s.")
    lines.append(" * Never edit text by hand — regenerate from 文稿.txt if the audio changes.")
    lines.append(" */")
    lines.append("")
    lines.append(f"export const FPS = {FPS};")
    lines.append(f"export const NARRATION_SECONDS = {asr['duration']:.3f};")
    lines.append(f"export const BGM_SECONDS = {total_seconds:.3f};")
    lines.append(f"export const DURATION_FRAMES = {int(round(total_seconds * FPS))};")
    lines.append("")
    lines.append("export interface Segment {")
    lines.append("  index: number;")
    lines.append("  scene: string;")
    lines.append("  headline: string;")
    lines.append("  text: string;")
    lines.append("  startSec: number;")
    lines.append("  endSec: number;")
    lines.append("  /** Absolute start time of every char of `text` (seconds). */")
    lines.append("  charTimes: number[];")
    lines.append("}")
    lines.append("")
    lines.append("const SEGMENT_DATA: Segment[] = [")
    for si, m in enumerate(seg_meta):
        # charTimes aligned to every char in text; punctuation interpolated
        times_by_char = {}
        for ci, s, e in sorted(seg_char_times[si], key=lambda x: x[0]):
            times_by_char[ci] = s
        arr = []
        last_t = m["start"]
        for ci in range(len(m["text"])):
            if ci in times_by_char:
                last_t = times_by_char[ci]
            arr.append(round(last_t, 3))
        char_json = ", ".join(f"{v:.2f}" for v in arr)
        lines.append("  {")
        lines.append(f"    index: {si + 1},")
        lines.append(f'    scene: "{esc(m["scene"])}",')
        lines.append(f'    headline: "{esc(m["headline"])}",')
        lines.append(f'    text: "{esc(m["text"])}",')
        lines.append(f"    startSec: {m['start']:.3f},")
        lines.append(f"    endSec: {m['end']:.3f},")
        lines.append(f"    charTimes: [{char_json}],")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    lines.append("export const SEGMENTS = SEGMENT_DATA;")
    lines.append("")
    lines.append("export const startFrame = (seg: Segment): number => Math.round(seg.startSec * FPS);")
    lines.append("export const endFrame = (seg: Segment): number => Math.round(seg.endSec * FPS);")
    lines.append("export const segmentFrames = (seg: Segment): number => endFrame(seg) - startFrame(seg);")
    lines.append("")
    lines.append("export const OUTRO_START_SEC = NARRATION_SECONDS;")
    lines.append("")
    lines.append("export const segmentAtFrame = (frame: number): Segment | null => {")
    lines.append("  for (const seg of SEGMENTS) {")
    lines.append("    if (frame >= startFrame(seg) && frame < endFrame(seg)) return seg;")
    lines.append("  }")
    lines.append("  return null;")
    lines.append("};")
    lines.append("")

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Saved {OUT_PATH}")

    # diagnostics
    print("\nSegment timings:")
    for m in seg_meta:
        print(f"  {m['start']:7.2f} -> {m['end']:7.2f}  ({m['end']-m['start']:5.2f}s)  {m['headline']}")


if __name__ == "__main__":
    main()
