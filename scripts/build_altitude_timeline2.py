# -*- coding: utf-8 -*-
"""Align display text to ASR word timestamps and emit timeline.ts.

The recorded narration does not follow 文稿.txt exactly: it contains extra
recap passages and re-ordered sentences. So each scene is mapped to explicit
ASR segment / word ranges, and alignment is run *locally* per scene. That way
an ASR error in one sentence can never shift the timing of the rest.

Each scene spec: (scene, headline, display_text, asr_slices)
asr_slices entries: (segment_index, word_from, word_to)
  - word_from may be an int or a string marker (first word starting with it)
  - word_to may be an int, a string marker, or None (end of segment)
"""
import json
import difflib
import unicodedata

ASR_PATH = "scripts/out/narration-asr.json"
OUT_PATH = "src/videos/HighAltitude/timeline.ts"
OUTRO_SECONDS = 6.5
FPS = 60

# ---------------------------------------------------------------- scenes
# Audio order, 40 scenes. Display text is cleaned from 文稿.txt for scripted
# parts, and hand-cleaned from ASR for the extra recap passages.
SCENES = [
    ("hook", "夏天去爬山", "夏天去爬山，山脚下还穿着短袖汗流浃背，", [(0, 0, None)]),
    ("hook-peak", "山顶却冻得瑟瑟发抖", "到了山顶却冻得瑟瑟发抖，甚至还得租一件军大衣。", [(1, 0, None)]),
    ("question", "离太阳越近，为什么越冷？", "很多人都会冒出一个疑问：明明爬得越高、离太阳越近，为什么温度反而越来越低？", [(2, 0, None)]),
    ("intuition", "靠近火炉会变暖", "直觉告诉我们，靠近火炉会变暖；", [(3, 0, None)]),
    ("lapse-rate", "每升高1000米，下降约6℃", "但在大气层里，海拔每升高1000米，气温平均会下降约6℃。", [(4, 0, None)]),
    ("three-lies", "被三个日常直觉骗了", "这并不是因为太阳“失灵”了，而是因为我们被三个日常直觉骗了。", [(5, 0, None)]),
    ("chapter-1", "一、距离的错觉", "一、距离的错觉：150米外往前迈了“半毫米”", [(6, 0, None)]),
    ("cosmic-scale", "对宇宙尺度最大的误解", "觉得“爬上高山就离太阳更近”，其实是对宇宙尺度最大的误解。", [(7, 0, None)]),
    ("numbers", "1.5亿公里 vs 8.8公里", "日地平均距离大约是 1.5亿公里，而地球上最高的珠穆朗玛峰，海拔也不过 8.8公里 左右。", [(8, 0, None)]),
    ("bonfire-setup", "8.8公里算什么概念？", "8.8公里放在1.5亿公里面前是什么概念？", [(9, 0, None)]),
    ("bonfire-step", "篝火150米，往前挪1厘米", "这就好比你站在距离一堆篝火 150米 远的地方，然后为了取暖，极其微弱地往前挪动了 不到1厘米。", [(10, 0, None)]),
    ("negligible", "连十万分之一都不到", "这点微不足道的距离变化，带来的太阳辐射增强连十万分之一都不到，完全可以忽略不计。", [(11, 0, None)]),
    ("same-sun", "烘烤强度几乎没有区别", "所以，无论你是在海平面还是在珠峰顶，太阳对你的“烘烤强度”在距离上几乎没有区别。", [(12, 0, None)]),
    ("chapter-2", "二、暖气片在你脚下", "二、真正的“暖气片”不在天上，而在你脚下", [(13, 0, "既")]),
    ("source", "热源不是太阳，是地面", "既然距离不是问题，那为什么高空会冷？因为把空气烤暖的直接热源，根本不是太阳，而是地面。", [(13, "既", None), (14, 0, None)]),
    ("picky", "大气是个“挑食”的家伙", "这听起来很反直觉，但大气层其实是个非常“挑食”的家伙：", [(15, 0, None)]),
    ("shortwave", "短波辐射，直接穿过空气", "太阳光直接穿过了空气： 太阳发出的热量主要是短波辐射（比如可见光）。", [(16, 0, None)]),
    ("armor-piercing", "像穿甲弹一样长驱直入", "干净的大气对短波辐射几乎是透明的，阳光像穿甲弹一样长驱直入，空气根本抓不住它，只能眼睁睁看着它照向大地。", [(17, 0, None), (18, 0, None)]),
    ("ground-heat", "地面才是真正的加热器", "地面才是真正的“加热器”： 大地（土壤、岩石、海洋）吸收了充足的阳光后温度升高，", [(19, 0, None)]),
    ("longwave", "长波辐射，红外线", "随后开始向外散发热量。这时候散发出来的是长波辐射（红外线）。", [(20, 0, None)]),
    ("catch", "温室气体一抓一个准", "空气靠地面“喂饱”：大气对长波辐射特别敏感，尤其是二氧化碳、水蒸气等大量温室气体。大气把这些红外线辐射攥在手中，不准它逃窜。", [(21, 0, None), (22, 0, None), (23, 0, None)]),
    ("falloff", "离热源越远，分到的热量越少", "因此，高空的空气受到地面影响的程度较低。升得越高，离热源越远，分到的热量越少，也就冷了。", [(24, 0, None), (25, 0, None)]),
    ("chapter-3a", "三、空气的自我消耗", "三、空气的“自我消耗”", [(26, 0, None)]),
    ("thin-air", "越往高处，空气密度越低", "大气层里的空气，随着高度增加，密度逐渐下降。当海拔升高到8800米左右的珠峰高度时，空气密度只剩三分之一。", [(27, 0, None), (28, 0, None), (29, 0, None)]),
    ("molecule-collide", "分子越少，热量越难留住", "高空中的空气比较稀薄，单位体积内的空气分子更少。它们无法聚在一起产生足够多的碰撞来保持温度；相比之下，稠密的空气能稳定保存热量。", [(30, 0, None), (31, 0, None), (32, 0, None), (33, 0, None)]),
    ("recap", "回到山脚与山顶", "所以，夏天去爬山，山脚下可以穿短袖汗流浃背，到山顶却冻得瑟瑟发抖。", [(34, 0, None)]),
    ("summary", "三条线索汇成一句话", "明明爬得越高、离太阳越近，但因为距离上微不足道；更因为空气本身的低热传导和结构特性。所以，只要你不直接贴到太阳发热的表面——真正供暖的源泉，并不在空中。", [(35, 0, None), (36, 0, None), (37, 0, None)]),
    ("catch-recap", "温室气体，一抓一个准", "大气中的水汽、二氧化碳等温室气体，对太阳的短波辐射无动于衷，却对地面发出的长波辐射极度敏感，一抓一个准。", [(38, 0, None), (39, 0, None)]),
    ("chain", "太阳晒热地面", "所以，我们所处的对流层大气，并不是被头顶的太阳直接晒热的，", [(40, 0, None)]),
    ("blanket", "地面像电热毯，从下往上烤", "而是先由太阳晒热地面，再由地面像一块巨大的“电热毯”或“暖气片”一样，从下往上把空气烤热的。", [(41, 0, None), (42, 0, None)]),
    ("climb-away", "离热源越远，自然就越冷", "当你往高处爬时，虽然离太阳近了微不足道的一点点，但你却实打实地远离了脚下这块真正的“大暖气片”。离热源越远，自然就越冷。", [(43, 0, None), (44, 0, None), (45, 0, None)]),
    ("chapter-3b", "三、绝热膨胀与漏风的棉被", "三、空气的“自我消耗”：绝热膨胀与漏风的棉被", [(46, 0, None)]),
    ("processes", "两个降温过程", "除了远离地面这块暖气片，高空的空气自身还在经历两个迅速降温的过程：膨胀降温，像喷雾罐一样变冷。", [(47, 0, None), (48, 0, None)]),
    ("rise-expand", "上升、膨胀、压力变小", "地面附近的空气被烤热后会往上升。但是，海拔越高，空气越稀薄，周围的大气压力就越小。当一团热空气上升到高空时，外面的压力变小了，它就会像解开束缚一样向外膨胀。", [(49, 0, None), (50, 0, None), (51, 0, None), (52, 0, None)]),
    ("adiabatic", "绝热膨胀降温", "在物理学中，气体膨胀需要对外做功，既然没有外界给它补充能量，它就只能消耗自己的内能，导致温度急剧下降——这叫“绝热膨胀降温”。", [(53, 0, None), (54, 0, None), (55, 0, None)]),
    ("experiment-warm", "张嘴哈气，是暖的", "你可以立刻做一个小实验来感受它：张大嘴巴往手心“哈气”，吹出来的气是暖的；", [(56, 0, None), (57, 0, None)]),
    ("experiment-cold", "噘嘴吹气，是凉的", "噘起嘴巴留一个小孔往手心“吹气”，吹出来的气立刻变成凉的了。", [(58, 0, None), (59, 0, None)]),
    ("experiment-37", "同样37℃，为何一暖一凉", "明明都是肺里37℃的气体，噘嘴吹气时，气流从窄口喷出后瞬间膨胀，消耗了热量，温度就降了下来。上升到高空的空气，每天都在经历这种降温。", [(60, 0, None), (61, 0, None), (62, 0, None)]),
    ("duvet", "低海拔：厚厚的羽绒被", "低海拔地区空气稠密，水汽、尘埃和二氧化碳多，就像盖了一层厚厚的羽绒被，地面散发的热量很容易被锁住。", [(63, 0, None), (64, 0, None), (65, 0, None)]),
    ("gauze", "高海拔：羽绒被变薄纱巾", "而到了高海拔地区，空气稀薄、干燥，水汽极少，相当于羽绒被变成了薄纱巾，热量一散出去就逃逸到了太空中，根本留不住温度。", [(66, 0, None), (67, 0, None), (68, 0, None)]),
]

HARD_PUNCT = set("，。、；：？！“”‘’（）()《》〈〉—…·「」『』,.;:?!\"' \t\n\r　")


def is_cjk_or_alnum(ch: str) -> bool:
    if ch in HARD_PUNCT:
        return False
    cat = unicodedata.category(ch)
    return cat[0] in ("L", "N")


def norm(ch: str) -> str:
    return ch.lower()


def resolve_words(asr, slices):
    out = []
    for seg_i, w_from, w_to in slices:
        ws = asr["segments"][seg_i]["words"]
        if isinstance(w_from, str):
            w_from = next(i for i, w in enumerate(ws) if w["word"].strip().startswith(w_from))
        if isinstance(w_to, str):
            w_to = next(i for i, w in enumerate(ws) if i >= w_from and w["word"].strip().startswith(w_to))
        if w_to is None:
            w_to = len(ws)
        out.extend(ws[w_from:w_to])
    return out


def word_stream(words):
    chars, times = [], []
    for w in words:
        cs = [c for c in w["word"] if is_cjk_or_alnum(c)]
        if not cs:
            continue
        step = (w["end"] - w["start"]) / len(cs)
        for i, c in enumerate(cs):
            chars.append(norm(c))
            times.append([w["start"] + step * i, w["start"] + step * (i + 1)])
    return chars, times


def align_text(text, asr_chars, asr_times, scene_start, scene_end):
    script = [norm(c) for c in text if is_cjk_or_alnum(c)]
    sm = difflib.SequenceMatcher(None, "".join(script), "".join(asr_chars), autojunk=False)
    times = [None] * len(script)
    for block in sm.get_matching_blocks():
        for k in range(block.size):
            times[block.a + k] = asr_times[block.b + k][0]
    known = [i for i, t in enumerate(times) if t is not None]
    if not known:
        # fall back to uniform spread
        step = (scene_end - scene_start) / max(1, len(script))
        return [scene_start + step * i for i in range(len(script))], 0
    for i in range(len(times)):
        if times[i] is not None:
            continue
        prev = next((j for j in reversed(known) if j < i), None)
        nxt = next((j for j in known if j > i), None)
        if prev is None and nxt is None:
            times[i] = scene_start
        elif prev is None:
            times[i] = times[nxt]
        elif nxt is None:
            times[i] = times[prev]
        else:
            a, b = times[prev], times[nxt]
            f = (i - prev) / (nxt - prev)
            times[i] = a + (b - a) * f
    return times, len(known)


def main():
    with open(ASR_PATH, "r", encoding="utf-8") as f:
        asr = json.load(f)
    narration = float(asr.get("duration", 382.92))
    print(f"Loaded ASR: {len(asr['segments'])} segments, {narration:.2f}s")

    scene_words = [resolve_words(asr, sc[3]) for sc in SCENES]
    starts = []
    for si, words in enumerate(scene_words):
        if not words:
            raise SystemExit(f"Scene {SCENES[si][0]} matched no ASR words")
        starts.append(float(words[0]["start"]))
    for si in range(1, len(starts)):
        if starts[si] < starts[si - 1] - 1e-6:
            raise SystemExit(f"Scene order broken at {SCENES[si][0]}")

    total_matched = 0
    total_chars = 0
    meta = []
    for si, (scene, headline, text, _slices) in enumerate(SCENES):
        start = starts[si]
        end = starts[si + 1] if si + 1 < len(starts) else narration
        asr_chars, asr_times = word_stream(scene_words[si])
        filtered = [c for c in text if is_cjk_or_alnum(c)]
        char_ts, matched = align_text(text, asr_chars, asr_times, start, end)
        total_matched += matched
        total_chars += len(filtered)
        # per-character times for karaoke captions (punctuation inherits prev)
        char_times = []
        last = start
        ci = 0
        for ch in text:
            if is_cjk_or_alnum(ch):
                t = char_ts[ci]
                last = t
                char_times.append(round(t, 2))
                ci += 1
            else:
                char_times.append(round(last, 2))
        meta.append({
            "scene": scene,
            "headline": headline,
            "text": text,
            "start": round(start, 3),
            "end": round(end, 3),
            "charTimes": char_times,
        })
        ratio = matched / max(1, len(filtered)) * 100
        print(f"  {si+1:02d} {start:7.2f} -> {end:7.2f} ({end-start:5.2f}s) match {ratio:5.1f}%  {headline}")

    print(f"Overall char match: {total_matched}/{total_chars} ({total_matched/max(1,total_chars)*100:.1f}%)")
    total_seconds = narration + OUTRO_SECONDS

    def esc(s):
        return s.replace("\\", "\\\\").replace('"', '\\"')

    lines = []
    lines.append("/**")
    lines.append(" * HighAltitude — audio-synced timeline (generated by scripts/build_altitude_timeline2.py).")
    lines.append(f" * Narration: public/high-altitude/narration.mp3, {narration:.2f}s, ASR-aligned per char.")
    lines.append(f" * Total incl. {OUTRO_SECONDS}s outro: {total_seconds:.2f}s.")
    lines.append(" * Scene order follows the recorded audio, not 文稿.txt (audio has extra recaps).")
    lines.append(" */")
    lines.append("")
    lines.append(f"export const FPS = {FPS};")
    lines.append(f"export const NARRATION_SECONDS = {narration:.3f};")
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
    for si, m in enumerate(meta):
        char_json = ", ".join(f"{v:.2f}" for v in m["charTimes"])
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

    with open(OUT_PATH, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines))
    print(f"Saved {OUT_PATH}")


if __name__ == "__main__":
    main()
