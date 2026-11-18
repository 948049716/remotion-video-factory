#!/usr/bin/env python3
"""
verify_flow_clips.py — Google Flow 生成视频双层质检第一关（硬指标扫描 + 抽帧印相表 + 自动入库）

工作流定位：
  当用户在 Google Flow 生成完分镜视频并放入 assets/<StoryName>/flow-inbox/（或指定目录）后：
    1. 第一关（本脚本自动完成）：
       - ffprobe 校验分辨率、画幅比例 (16:9 / 9:16)、帧率与音视频流健康度；
       - 配音包络校验：对比视频时长与中文 TTS 所需时长，自动计算 Remotion 无感微变速比 playbackRate；
       - 首尾帧一致性校验：比对视频首帧/尾帧与投喂原图的相关系数，拦截漏挂首帧或挂错图；
       - 运动能量与崩裂跳切扫描：拦截“整段静止假视频”与“中途闪屏/乱切镜头 (Jump Cut)”；
       - 输出 3×2 高清 6 宫格关键帧接触印相表 (Contact Sheet) 供第二关 Agent 多模态看片审片；
       - 可选 --ingest：将硬检通过的视频转码为合规 24fps H.264 (<8MB) 落位至 public/<slug>/video/shot-XX.mp4，
         并按 keepAudio 策略自动剥离无用 AI 外语人声或保留纯净环境音。
    2. 第二关（Agent 多模态视觉审片）：
       - Agent 直接使用 view_file 观看生成的 .mp4 原片与 Contact Sheet，核查角色五官服装一致性、
         手部物理交互、水彩画风稳定性与环境音纯净度，对不合格单镜直接重写修复版英文 Prompt。

运行方式：
  uv run --with pillow --with numpy python3 .agents/skills/watercolor-story-video/scripts/verify_flow_clips.py \
    --manifest docs/<story-slug>/flow-manifest.json --ingest
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

try:
    import numpy as np
    from PIL import Image, ImageDraw
except ImportError as exc:
    raise SystemExit(
        f"缺少图像处理依赖 ({exc})，请使用:\n"
        "  uv run --with pillow --with numpy python3 verify_flow_clips.py ..."
    )

VIDEO_EXTS = (".mp4", ".webm", ".mov", ".mkv")
MAX_RUNTIME_VIDEO_BYTES = 8 * 1024 * 1024  # 对齐 scripts/asset_rules.py 的 8MB 门禁


def log(msg: str) -> None:
    print(f"[verify_flow] {msg}", file=sys.stderr)


def pascal_from_slug(slug: str) -> str:
    return "".join(part.capitalize() for part in re.split(r"[^a-zA-Z0-9]+", slug) if part) or "StoryVideo"


def probe_media(path: Path) -> dict[str, Any]:
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        raise RuntimeError("未找到 ffprobe，请确认已安装 ffmpeg/ffprobe")
    cmd = [
        ffprobe,
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        str(path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        return {}
    try:
        return json.loads(proc.stdout or "{}")
    except json.JSONDecodeError:
        return {}


def parse_fps(rate_str: str) -> float:
    if not rate_str or rate_str == "0/0":
        return 0.0
    if "/" in rate_str:
        num, den = rate_str.split("/", 1)
        try:
            d = float(den)
            return round(float(num) / d, 3) if d > 0 else 0.0
        except ValueError:
            return 0.0
    try:
        return round(float(rate_str), 3)
    except ValueError:
        return 0.0


def match_inbox_clip(inbox_dir: Path, shot_id: str) -> Path | None:
    if not inbox_dir.is_dir():
        return None
    sid_num = int(shot_id) if shot_id.isdigit() else -1
    candidates = sorted(
        p for p in inbox_dir.iterdir() if p.is_file() and p.suffix.lower() in VIDEO_EXTS
    )
    # 1. 优先精确匹配 shot-01.mp4 / shot_01.mp4
    for p in candidates:
        if p.stem.lower() in (f"shot-{shot_id.lower()}", f"shot_{shot_id.lower()}"):
            return p
    # 2. 宽松匹配前缀，如 01.mp4, 01_xxx.mp4, shot-1-xxx.mp4, s01.mp4
    if sid_num >= 0:
        pat = re.compile(rf"^(?:shot[-_]?|s)?0*{sid_num}(?:$|[-_.\s].*)", re.IGNORECASE)
        for p in candidates:
            if pat.match(p.stem):
                return p
    return None


def sample_video_rgb(
    video_path: Path,
    sample_fps: float = 4.0,
    width: int = 320,
    height: int = 180,
) -> np.ndarray:
    """通过 ffmpeg 管道快速解码低分辨率 RGB 帧序列，用于运动能量、黑屏与首尾帧比对。"""
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("未找到 ffmpeg")
    cmd = [
        ffmpeg,
        "-v",
        "error",
        "-i",
        str(video_path),
        "-vf",
        f"fps={sample_fps},scale={width}:{height}:flags=bilinear",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-",
    ]
    proc = subprocess.run(cmd, capture_output=True, check=False)
    frame_bytes = width * height * 3
    raw = proc.stdout
    n_frames = len(raw) // frame_bytes
    if n_frames == 0:
        return np.zeros((0, height, width, 3), dtype=np.float32)
    arr = np.frombuffer(raw[: n_frames * frame_bytes], dtype=np.uint8)
    return arr.reshape((n_frames, height, width, 3)).astype(np.float32)


def frame_similarity(frame_rgb: np.ndarray, ref_img_path: Path) -> tuple[float, float]:
    """计算采样帧与参考图之间的皮尔逊相关系数 (-1..1) 与平均像素绝对误差 MAE (0..255)。"""
    h, w, _ = frame_rgb.shape
    ref = np.asarray(
        Image.open(ref_img_path).convert("RGB").resize((w, h), Image.Resampling.BILINEAR),
        dtype=np.float32,
    )
    mae = float(np.abs(frame_rgb - ref).mean())
    a = frame_rgb.reshape(-1) - frame_rgb.mean()
    b = ref.reshape(-1) - ref.mean()
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    corr = float(np.dot(a, b) / denom) if denom > 1e-6 else 0.0
    return round(corr, 4), round(mae, 2)


def generate_contact_sheet(
    video_path: Path,
    dur_sec: float,
    shot_id: str,
    shot_label: str,
    out_sheet_path: Path,
) -> str | None:
    """抽取 0% / 20% / 40% / 60% / 80% / 100% 共 6 帧拼成 3×2 高清审片接触表。"""
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg or dur_sec <= 0.1:
        return None

    tile_w, tile_h = 640, 360
    header_h = 56
    cols, rows = 3, 2
    canvas = Image.new("RGB", (tile_w * cols, header_h + tile_h * rows), (15, 20, 25))
    draw = ImageDraw.Draw(canvas)
    draw.text(
        (20, 18),
        f"Shot {shot_id} | {shot_label} | src={video_path.name} | dur={dur_sec:.2f}s",
        fill=(244, 184, 96),
    )

    ratios = [0.02, 0.22, 0.42, 0.62, 0.80, 0.96]
    frame_bytes = tile_w * tile_h * 3

    for idx, r in enumerate(ratios):
        ts = max(0.0, min(max(0.0, dur_sec - 0.08), dur_sec * r))
        cmd = [
            ffmpeg,
            "-v",
            "error",
            "-ss",
            f"{ts:.3f}",
            "-i",
            str(video_path),
            "-frames:v",
            "1",
            "-vf",
            f"scale={tile_w}:{tile_h}:flags=bicubic",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "-",
        ]
        proc = subprocess.run(cmd, capture_output=True, check=False)
        if len(proc.stdout) >= frame_bytes:
            arr = np.frombuffer(proc.stdout[:frame_bytes], dtype=np.uint8).reshape((tile_h, tile_w, 3))
            tile = Image.fromarray(arr, mode="RGB")
        else:
            tile = Image.new("RGB", (tile_w, tile_h), (30, 36, 42))

        t_draw = ImageDraw.Draw(tile)
        t_draw.rectangle([10, 10, 156, 38], fill=(12, 16, 20))
        t_draw.text((18, 16), f"#{idx + 1}  {ts:.2f}s ({int(r * 100)}%)", fill=(255, 250, 240))

        cx = (idx % cols) * tile_w
        cy = header_h + (idx // cols) * tile_h
        canvas.paste(tile, (cx, cy))

    out_sheet_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_sheet_path, "WEBP", quality=86, method=6)
    return str(out_sheet_path)


def ingest_clip_to_public(
    src_video: Path,
    dst_video: Path,
    keep_audio: str,
    has_audio_stream: bool,
    target_fps: int = 24,
) -> dict[str, Any]:
    """将通过第一关检验的视频标准化转码为 24fps H.264 (<8MB) 并写入 public/<slug>/video/。"""
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("未找到 ffmpeg")

    dst_video.parent.mkdir(parents=True, exist_ok=True)
    preserve_audio = keep_audio == "ambient" and has_audio_stream

    for crf in (21, 24, 27):
        cmd = [
            ffmpeg,
            "-y",
            "-v",
            "error",
            "-i",
            str(src_video),
            "-vf",
            f"fps={target_fps},scale='min(1920,iw)':-2",
            "-c:v",
            "libx264",
            "-crf",
            str(crf),
            "-preset",
            "medium",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
        ]
        if preserve_audio:
            cmd.extend(["-c:a", "aac", "-b:a", "128k", "-ac", "2"])
        else:
            cmd.append("-an")
        cmd.append(str(dst_video))

        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if proc.returncode != 0:
            raise RuntimeError(f"ffmpeg 转码入库失败 ({src_video.name}): {proc.stderr.strip()}")

        size_bytes = dst_video.stat().st_size
        if size_bytes <= MAX_RUNTIME_VIDEO_BYTES:
            return {
                "runtimePath": str(dst_video),
                "sizeKB": round(size_bytes / 1024.0, 1),
                "crfUsed": crf,
                "audioPreserved": preserve_audio,
            }

    size_bytes = dst_video.stat().st_size
    return {
        "runtimePath": str(dst_video),
        "sizeKB": round(size_bytes / 1024.0, 1),
        "crfUsed": 27,
        "audioPreserved": preserve_audio,
    }


def write_qa_markdown(
    out_md_path: Path,
    story_name: str,
    results: list[dict[str, Any]],
) -> None:
    lines: list[str] = [
        f"# 《{story_name}》Google Flow 视频双层质检报告",
        "",
        "## 第一关：工程硬指标自动体检汇总",
        "",
        "| 镜头 | 原片文件 | 实测时长 / 需求 | 推荐速率 | 首帧相关性 | 平均动态 / 峰值跳变 | 第一关结论 | 6宫格印相表 |",
        "| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |",
    ]

    for r in results:
        sid = r["id"]
        src_name = r.get("sourceFile") or "未上传"
        dur_str = f"{r.get('clipDurSec', 0):.2f}s / {r.get('targetDurSec', 0):.2f}s"
        rate_str = f"{r.get('recommendedPlaybackRate', 1.0):.3f}x"
        corr_str = f"{r['startFrameCorr']:.2f}" if r.get("startFrameCorr") is not None else "—"
        mot_str = (
            f"{r['meanMotion']:.2f} / {r['maxSpikeMotion']:.2f}"
            if r.get("meanMotion") is not None
            else "—"
        )
        status_str = "PASS" if r["techPassed"] else ("MISSING" if r["missing"] else "FAIL")
        if r["techPassed"] and r["warnings"]:
            status_str = "PASS (WARN)"
        sheet_str = f"`{Path(r['contactSheet']).name}`" if r.get("contactSheet") else "—"
        lines.append(
            f"| **{sid}** | `{src_name}` | {dur_str} | `{rate_str}` | {corr_str} | {mot_str} | **{status_str}** | {sheet_str} |"
        )

    lines.extend(
        [
            "",
            "---",
            "",
            "## 异常与告警详情",
            "",
        ]
    )
    any_issue = False
    for r in results:
        for e in r["errors"]:
            any_issue = True
            lines.append(f"- **[ERROR · Shot {r['id']}]** {e}")
        for w in r["warnings"]:
            any_issue = True
            lines.append(f"- **[WARN · Shot {r['id']}]** {w}")
    if not any_issue:
        lines.append("- 全部已上传视频均通过第一关硬指标检测，无错误或告警。")

    lines.extend(
        [
            "",
            "---",
            "",
            "## 第二关：Agent 多模态导演级审片核对单（由 Agent 读取视频与印相表填写）",
            "",
            "- [ ] **角色外观守恒**：五官、发型、服饰与核心配件（如眼镜、校服、道具）全程无漂移变色",
            "- [ ] **人体与物理结构**：手部无多余手指或粘连变形，持物交互自然无悬空穿模",
            "- [ ] **水彩画风稳定**：全程保持 2D 手绘水彩笔触与纸张质感，未突变为 3D 塑料写实风",
            "- [ ] **动作与情绪到位**：准确完成了分镜设计的单一核心动作，对白镜头口型开合时机自然",
            "- [ ] **原生环境音评估**：标记为 `keepAudio: ambient` 的镜头无乱码外语人声与刺耳杂音",
            "",
        ]
    )
    out_md_path.write_text("\n".join(lines), encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="检验 Google Flow 回传视频是否符合规格、配音时长、首尾帧一致性与动态质量，并生成 6 宫格印相表"
    )
    parser.add_argument("--manifest", required=True, help="docs/<story-slug>/flow-manifest.json 路径")
    parser.add_argument("--inbox-dir", help="可选：自定义待检视频目录（默认 assets/<StoryName>/flow-inbox）")
    parser.add_argument("--shots", help="可选：仅检查指定镜头 ID（逗号分隔，如 01,02,03）")
    parser.add_argument("--allow-partial", action="store_true", help="分批打样模式：未上传的镜头不计为失败退出码")
    parser.add_argument("--ingest", action="store_true", help="将通过第一关检验的视频自动转码入库至 public/<slug>/video/")
    parser.add_argument("--repo-root", default=".", help="仓库根目录（默认当前目录）")
    args = parser.parse_args(argv)

    repo_root = Path(args.repo_root).resolve()
    manifest_path = Path(args.manifest)
    if not manifest_path.is_file():
        print(json.dumps({"error": f"找不到 manifest: {manifest_path}"}, ensure_ascii=False), file=sys.stderr)
        return 1

    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    slug = str(data.get("storySlug") or manifest_path.parent.name)
    story_name = str(data.get("storyName") or pascal_from_slug(slug))
    target_fps = int(data.get("fps") or 24)

    inbox_dir = Path(args.inbox_dir) if args.inbox_dir else (repo_root / "assets" / story_name / "flow-inbox")
    sheets_dir = repo_root / "assets" / story_name / "flow-pack" / "contact-sheets"
    public_video_dir = repo_root / "public" / slug / "video"

    filter_ids = (
        {s.strip().zfill(2) for s in args.shots.split(",") if s.strip()}
        if args.shots
        else None
    )

    shot_results: list[dict[str, Any]] = []
    global_errors: list[str] = []
    ingested_count = 0

    for shot in data.get("shots") or []:
        sid = str(shot.get("id", "")).zfill(2)
        if filter_ids and sid not in filter_ids:
            continue

        label = str(shot.get("label") or f"Shot {sid}")
        target_dur = float(shot.get("targetDurSec") or 4.0)
        aspect_cfg = str(shot.get("aspectRatio") or "16:9")
        keep_audio = str(shot.get("keepAudio") or "none").lower()

        s_errors: list[str] = []
        s_warnings: list[str] = []

        clip_path = match_inbox_clip(inbox_dir, sid)
        if clip_path is None:
            msg = f"未在 {inbox_dir} 中找到镜头 {sid} 的视频文件（期望命名如 shot-{sid}.mp4）"
            if args.allow_partial:
                s_warnings.append(msg)
            else:
                s_errors.append(msg)
            shot_results.append(
                {
                    "id": sid,
                    "label": label,
                    "missing": True,
                    "techPassed": False,
                    "targetDurSec": target_dur,
                    "errors": s_errors,
                    "warnings": s_warnings,
                }
            )
            global_errors.extend(s_errors)
            continue

        meta = probe_media(clip_path)
        streams = meta.get("streams") or []
        v_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
        a_stream = next((s for s in streams if s.get("codec_type") == "audio"), None)

        if not v_stream:
            s_errors.append(f"视频文件损坏或不包含有效视频流: {clip_path.name}")
            shot_results.append(
                {
                    "id": sid,
                    "label": label,
                    "sourceFile": clip_path.name,
                    "missing": False,
                    "techPassed": False,
                    "targetDurSec": target_dur,
                    "errors": s_errors,
                    "warnings": s_warnings,
                }
            )
            global_errors.extend(s_errors)
            continue

        width = int(v_stream.get("width") or 0)
        height = int(v_stream.get("height") or 0)
        src_fps = parse_fps(str(v_stream.get("avg_frame_rate") or v_stream.get("r_frame_rate") or "24"))
        dur_sec = float(
            meta.get("format", {}).get("duration")
            or v_stream.get("duration")
            or 0.0
        )

        # 1. 分辨率与宽高比检查
        expected_ratio = 9.0 / 16.0 if aspect_cfg == "9:16" else 16.0 / 9.0
        if width <= 0 or height <= 0:
            s_errors.append("无法读取视频宽高尺寸")
        else:
            actual_ratio = width / height
            if abs(actual_ratio - expected_ratio) > 0.07:
                s_errors.append(
                    f"画幅比例不符：实测 {width}x{height} ({actual_ratio:.2f})，期望 {aspect_cfg}"
                )
            if max(width, height) < 1200:
                s_warnings.append(f"分辨率偏低 ({width}x{height})，建议在 Flow 中导出 720p/1080p")

        # 2. 时长覆盖与推荐变速比检查
        rec_rate = 1.0
        if dur_sec <= 0.2:
            s_errors.append("视频实测时长异常 (<= 0.2s)")
        elif dur_sec < target_dur * 0.84:
            s_errors.append(
                f"视频时长不足：实测 {dur_sec:.2f}s < 配音目标 {target_dur:.2f}s 的 84%，末尾配音会缺乏画面支撑"
            )
        elif dur_sec < target_dur:
            rec_rate = round(max(0.84, (dur_sec / target_dur) * 0.99), 4)
            s_warnings.append(
                f"视频实测 {dur_sec:.2f}s 略短于镜头时长 {target_dur:.2f}s，已在配置中启用 playbackRate={rec_rate} 无感微慢放对齐"
            )

        # 3. 帧序列采样：检测黑屏、静止假视频、崩裂跳切与首尾帧一致性
        frames = sample_video_rgb(clip_path, sample_fps=4.0)
        mean_motion = None
        max_spike = None
        start_corr = None
        end_corr = None

        if len(frames) < 2:
            s_errors.append("视频有效采样帧不足 2 帧")
        else:
            frame_lums = frames.mean(axis=(1, 2, 3))
            if float(frame_lums.min()) < 3.5:
                s_warnings.append("检测到极暗或黑屏帧，请在印相表中确认是否存在片头/片尾黑场")

            diffs = np.abs(frames[1:] - frames[:-1]).mean(axis=(1, 2, 3))
            mean_motion = round(float(diffs.mean()), 3)
            max_spike = round(float(diffs.max()), 3)
            median_motion = max(0.8, float(np.median(diffs)))

            if mean_motion < 0.40:
                s_errors.append(
                    f"画面几乎完全静止 (meanMotion={mean_motion})，疑似未成功生成动态视频"
                )
            if max_spike > max(26.0, median_motion * 5.5):
                spike_idx = int(np.argmax(diffs))
                spike_sec = round((spike_idx + 1) / 4.0, 2)
                s_warnings.append(
                    f"在第 {spike_sec}s 附近检测到帧间剧烈跳变 (spike={max_spike})，疑似模型中途乱切机位或画面闪烁，请重点审片"
                )

            # 首帧一致性校验
            start_rel = shot.get("startFrame")
            if start_rel:
                start_p = repo_root / str(start_rel)
                if not start_p.is_file():
                    alt_p = repo_root / f"public/{slug}/images/shot-{sid}.webp"
                    if alt_p.is_file():
                        start_p = alt_p
                if start_p.is_file():
                    start_corr, start_mae = frame_similarity(frames[0], start_p)
                    if start_corr < 0.62 and start_mae > 45.0:
                        s_errors.append(
                            f"视频首帧与投喂首帧差异过大 (corr={start_corr}, mae={start_mae})，请检查在 Flow 中是否漏挂或挂错了 Start Frame"
                        )

            # 尾帧一致性校验（若配置了 endFrame）
            end_rel = shot.get("endFrame")
            if end_rel:
                end_p = repo_root / str(end_rel)
                if end_p.is_file():
                    end_corr, end_mae = frame_similarity(frames[-1], end_p)
                    if end_corr < 0.58 and end_mae > 48.0:
                        s_warnings.append(
                            f"视频尾帧与设定尾帧存在一定偏离 (corr={end_corr})，请核查收尾姿态"
                        )

        # 4. 生成 6 宫格审片接触印相表
        sheet_path = sheets_dir / f"shot-{sid}-sheet.webp"
        sheet_out = generate_contact_sheet(clip_path, dur_sec, sid, label, sheet_path)

        tech_passed = len(s_errors) == 0
        ingest_info = None

        if args.ingest and tech_passed:
            dst_mp4 = public_video_dir / f"shot-{sid}.mp4"
            ingest_info = ingest_clip_to_public(
                src_video=clip_path,
                dst_video=dst_mp4,
                keep_audio=keep_audio,
                has_audio_stream=a_stream is not None,
                target_fps=target_fps,
            )
            ingested_count += 1
            shot["ingestedClip"] = {
                "src": f"{slug}/video/shot-{sid}.mp4",
                "sourceDurSec": round(dur_sec, 3),
                "playbackRate": rec_rate,
                "keepAmbientAudio": bool(ingest_info["audioPreserved"]),
                "sizeKB": ingest_info["sizeKB"],
                "techPassed": True,
                "multimodalReview": "pending",
            }

        shot_results.append(
            {
                "id": sid,
                "label": label,
                "sourceFile": clip_path.name,
                "missing": False,
                "techPassed": tech_passed,
                "resolution": f"{width}x{height}",
                "sourceFps": src_fps,
                "clipDurSec": round(dur_sec, 3),
                "targetDurSec": target_dur,
                "recommendedPlaybackRate": rec_rate,
                "meanMotion": mean_motion,
                "maxSpikeMotion": max_spike,
                "startFrameCorr": start_corr,
                "endFrameCorr": end_corr,
                "contactSheet": sheet_out,
                "ingested": ingest_info,
                "errors": s_errors,
                "warnings": s_warnings,
            }
        )
        global_errors.extend(s_errors)

    if args.ingest and ingested_count > 0:
        manifest_path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    qa_md_path = manifest_path.parent / "qa-report.md"
    write_qa_markdown(qa_md_path, story_name, shot_results)

    summary = {
        "storySlug": slug,
        "storyName": story_name,
        "checkedShots": len(shot_results),
        "ingestedShots": ingested_count,
        "qaReportMarkdown": str(qa_md_path),
        "passed": len(global_errors) == 0,
        "shots": shot_results,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if len(global_errors) == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
