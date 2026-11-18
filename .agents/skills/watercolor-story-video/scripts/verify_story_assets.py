#!/usr/bin/env python3
"""
verify_story_assets.py — 手绘水彩故事视频 素材（含分层图层）与音频完整性门禁检查脚本

在进入 Remotion 动画组装及交付预览前执行，确保：
  1. 所有分镜底图（shot-01.webp ~ shot-NN.webp）或分层图层（layers/...）均已生成且文件非空；
  2. 若提供了 layers 清单（或镜头配置了 layers），核对背景层与所有可动部件透明图层均存在；
  3. 所有角色台词与旁白音频（sXX-*.mp3）均已生成且文件非空；
  4. 实测音频时长（ffprobe）与时间轴配置一致，镜头内无台词重叠、无尾音被截断；
  5. public/<story-slug>/ 下所有资源命名符合规范（无中文、无空格、带子目录前缀）。

用法示例：
  python3 verify_story_assets.py --story-slug old-chen-music-box \
      --manifest docs/old-chen-music-box/tts-manifest.json --expected-shots 10
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

SAFE_SEGMENT = re.compile(r"^[a-z0-9_][a-z0-9._-]*$")
IMAGE_EXTS = (".webp", ".png", ".jpg", ".jpeg")


def probe_duration(path: Path) -> float | None:
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        return None
    cmd = [
        ffprobe,
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "csv=p=0",
        str(path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0 or not proc.stdout.strip():
        return None
    try:
        return round(float(proc.stdout.strip()), 3)
    except ValueError:
        return None


def find_shot_image(images_dir: Path, shot_id: str) -> Path | None:
    for suffix_tag in ("", "-start"):
        for ext in IMAGE_EXTS:
            candidate = images_dir / f"shot-{shot_id}{suffix_tag}{ext}"
            if candidate.exists() and candidate.stat().st_size > 0:
                return candidate
    return None


def find_shot_video(video_dir: Path, shot_id: str) -> Path | None:
    for ext in (".mp4", ".webm"):
        candidate = video_dir / f"shot-{shot_id}{ext}"
        if candidate.exists() and candidate.stat().st_size > 0:
            return candidate
    return None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="检查手绘水彩故事视频的 Flow 动态视频切片、首尾关键帧、分层透明图层、角色配音与时间轴是否齐全合规"
    )
    parser.add_argument("--story-slug", required=True, help="public/ 下的故事子目录名（kebab-case）")
    parser.add_argument("--manifest", help="可选：tts-manifest.json 路径，用于逐镜核对台词与时长")
    parser.add_argument("--flow-manifest", help="可选：flow-manifest.json 路径，用于核对 Google Flow 视频落盘状态")
    parser.add_argument("--require-video", action="store_true", help="真动画成片门禁：要求每镜均具备合规的 shot-XX.mp4 视频切片")
    parser.add_argument("--layers-manifest", help="可选：分层素材清单 JSON（检查所有分层文件）")
    parser.add_argument("--expected-shots", type=int, help="可选：期望的分镜总数（如 10）")
    parser.add_argument("--public-dir", default="public", help="public 根目录路径（默认 public）")
    args = parser.parse_args(argv)

    public_root = Path(args.public_dir)
    story_dir = public_root / args.story_slug
    images_dir = story_dir / "images"
    video_dir = story_dir / "video"
    audio_dir = story_dir / "audio"

    errors: list[str] = []
    warnings: list[str] = []
    checked_shots = 0
    checked_videos = 0
    checked_layers = 0
    checked_lines = 0

    flow_clips_by_id: dict[str, dict[str, Any]] = {}
    if args.flow_manifest:
        fm_path = Path(args.flow_manifest)
        if not fm_path.exists():
            errors.append(f"找不到 flow-manifest 文件: {fm_path}")
        else:
            fm_data = json.loads(fm_path.read_text(encoding="utf-8"))
            for fshot in fm_data.get("shots") or []:
                fsid = str(fshot.get("id", "")).zfill(2)
                flow_clips_by_id[fsid] = fshot

    if not story_dir.exists():
        errors.append(f"找不到故事资源目录: {story_dir}")

    # 1. 检查命名规范
    if story_dir.exists():
        for p in story_dir.rglob("*"):
            if p.is_file():
                rel = p.relative_to(public_root).as_posix()
                bad = [seg for seg in rel.split("/") if seg and not SAFE_SEGMENT.match(seg)]
                if bad:
                    errors.append(f"路径包含不合规字符（仅允许小写字母/数字/-/_/.）: public/{rel}")

    # 2. 若提供了 manifest，按 manifest 逐镜核对视频切片、图片、分层图层、音频与时间轴边界
    if args.manifest:
        manifest_path = Path(args.manifest)
        if not manifest_path.exists():
            errors.append(f"找不到 manifest 文件: {manifest_path}")
        else:
            data: dict[str, Any] = json.loads(manifest_path.read_text(encoding="utf-8"))
            shots: list[dict[str, Any]] = data.get("shots") or []
            if not shots:
                errors.append(f"manifest 中没有任何镜头定义: {manifest_path}")

            for shot in shots:
                shot_id = str(shot.get("id", "")).zfill(2)
                checked_shots += 1
                shot_dur = float(shot.get("durSec") or 0.0)
                layers = shot.get("layers") or []
                img = find_shot_image(images_dir, shot_id)
                vid = find_shot_video(video_dir, shot_id)

                if vid:
                    checked_videos += 1
                    vid_mb = vid.stat().st_size / (1024.0 * 1024.0)
                    if vid_mb > 8.0:
                        errors.append(
                            f"[镜头 {shot_id}] 视频切片超过 8MB 运行时门禁 ({vid_mb:.2f} MB): {vid}"
                        )
                    v_dur = probe_duration(vid)
                    f_meta = flow_clips_by_id.get(shot_id, {}).get("ingestedClip") or {}
                    pb_rate = float(f_meta.get("playbackRate") or 1.0)
                    effective_v_dur = (v_dur / pb_rate) if (v_dur and pb_rate > 0) else v_dur
                    if effective_v_dur is not None and shot_dur > 0 and effective_v_dur + 0.12 < shot_dur * 0.84:
                        errors.append(
                            f"[镜头 {shot_id}] 视频有效时长 ({effective_v_dur:.2f}s) 不足以支撑镜头时长 ({shot_dur:.2f}s)"
                        )
                elif args.require_video and not layers:
                    errors.append(
                        f"[镜头 {shot_id}] 缺少 Google Flow 真动画视频切片: {video_dir}/shot-{shot_id}.mp4"
                    )

                if layers:
                    for layer in layers:
                        checked_layers += 1
                        l_src = layer.get("src", "")
                        l_path = public_root / l_src
                        if not l_src or not l_path.exists() or l_path.stat().st_size == 0:
                            errors.append(
                                f"[镜头 {shot_id} / 图层 {layer.get('id', '?')}] 缺少分层文件或为空: {l_path}"
                            )
                        else:
                            size_kb = l_path.stat().st_size / 1024.0
                            if size_kb > 3072:
                                errors.append(
                                    f"[镜头 {shot_id} / 图层 {layer.get('id', '?')}] 图层超过 3MB 上限 ({size_kb:.1f} KB): {l_path}"
                                )
                elif not img and not vid:
                    errors.append(
                        f"[镜头 {shot_id}] 既无视频切片也无首帧底图: {images_dir}/shot-{shot_id}-start.webp"
                    )

                if img:
                    size_kb = img.stat().st_size / 1024.0
                    if size_kb > 2048:
                        errors.append(f"[镜头 {shot_id}] 分镜图超过 2MB 硬上限 ({size_kb:.1f} KB): {img}")
                    elif size_kb > 500 and img.suffix.lower() != ".webp":
                        warnings.append(f"[镜头 {shot_id}] 分镜图超过 500KB 且非 WebP ({size_kb:.1f} KB): {img}")
                lines: list[dict[str, Any]] = shot.get("lines") or []
                prev_end = 0.0

                for line in lines:
                    checked_lines += 1
                    line_id = line.get("id", "unknown")
                    rel_file = line.get("file") or f"{args.story_slug}/audio/{line_id}.mp3"
                    audio_path = public_root / rel_file
                    if not audio_path.exists() or audio_path.stat().st_size == 0:
                        errors.append(f"[镜头 {shot_id} / {line_id}] 缺少配音文件或文件为空: {audio_path}")
                        continue

                    actual_dur = probe_duration(audio_path)
                    cfg_dur = float(line.get("durSec") or 0.0)
                    at_sec = float(line.get("atSec") or 0.0)

                    if actual_dur is not None:
                        if cfg_dur <= 0 or abs(actual_dur - cfg_dur) > 0.2:
                            errors.append(
                                f"[镜头 {shot_id} / {line_id}] 配置时长 ({cfg_dur:.3f}s) 与实测时长 ({actual_dur:.3f}s) 偏差过大"
                            )
                        end_sec = at_sec + actual_dur
                    else:
                        end_sec = at_sec + cfg_dur

                    if at_sec < prev_end - 0.05:
                        errors.append(
                            f"[镜头 {shot_id} / {line_id}] 台词起点 ({at_sec:.2f}s) 与上一句结束时间 ({prev_end:.2f}s) 重叠"
                        )
                    prev_end = end_sec

                if shot_dur > 0 and prev_end > shot_dur + 0.05:
                    errors.append(
                        f"[镜头 {shot_id}] 台词结束时间 ({prev_end:.2f}s) 超出镜头总时长 ({shot_dur:.2f}s)，会导致尾音被截断"
                    )

    # 3. 若提供了独立的 layers-manifest，检查其中的分层文件
    if args.layers_manifest:
        lm_path = Path(args.layers_manifest)
        if not lm_path.exists():
            errors.append(f"找不到 layers-manifest 文件: {lm_path}")
        else:
            lm = json.loads(lm_path.read_text(encoding="utf-8"))
            for shot_id, layer_list in (lm.get("shots") or {}).items():
                for layer in layer_list:
                    checked_layers += 1
                    l_src = layer.get("src", "")
                    l_path = public_root / l_src
                    if not l_src or not l_path.exists() or l_path.stat().st_size == 0:
                        errors.append(
                            f"[分层清单 {shot_id} / {layer.get('id', '?')}] 缺少文件或为空: {l_path}"
                        )

    # 4. 若指定了 expected-shots，检查底图或视频切片是否齐全
    if args.expected_shots:
        for i in range(1, args.expected_shots + 1):
            shot_id = f"{i:02d}"
            if not args.manifest:
                checked_shots += 1
            has_img = find_shot_image(images_dir, shot_id) is not None
            has_vid = find_shot_video(video_dir, shot_id) is not None
            if args.require_video and not has_vid:
                errors.append(f"[镜头 {shot_id}] 缺少真动画视频切片: {video_dir}/shot-{shot_id}.mp4")
            elif not has_img and not has_vid:
                errors.append(f"[镜头 {shot_id}] 缺少分镜底图或视频切片: {images_dir}/shot-{shot_id}.webp")

    if not args.manifest and audio_dir.exists():
        mp3_files = sorted(audio_dir.rglob("*.mp3"))
        checked_lines = len(mp3_files)
        if checked_lines == 0:
            errors.append(f"音频目录为空，未找到任何 .mp3 配音文件: {audio_dir}")
        for mp3 in mp3_files:
            if mp3.stat().st_size == 0:
                errors.append(f"配音文件为空 (0 bytes): {mp3}")

    report = {
        "storySlug": args.story_slug,
        "checkedShots": checked_shots,
        "checkedVideoClips": checked_videos,
        "checkedLayers": checked_layers,
        "checkedAudioLines": checked_lines,
        "errors": errors,
        "warnings": warnings,
        "passed": len(errors) == 0,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if len(errors) == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
