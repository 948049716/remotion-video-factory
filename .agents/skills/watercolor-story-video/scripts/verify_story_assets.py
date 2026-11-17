#!/usr/bin/env python3
"""
verify_story_assets.py — 手绘水彩故事视频 素材与音频完整性门禁检查脚本

在进入 Remotion 动画组装及交付预览前执行，确保：
  1. 所有分镜画面（shot-01.webp ~ shot-NN.webp）均已生成且文件非空、尺寸有效；
  2. 所有角色台词与旁白音频（sXX-*.mp3）均已生成且文件非空；
  3. 实测音频时长（ffprobe）与时间轴配置一致，镜头内无台词重叠、无尾音被截断；
  4. public/<story-slug>/ 下所有资源命名符合规范（无中文、无空格、带子目录前缀）。

用法示例：
  python3 verify_story_assets.py --story-slug fox-starlight-seed --manifest docs/fox-starlight-seed/tts-manifest.json
  python3 verify_story_assets.py --story-slug fox-starlight-seed --expected-shots 12
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
    for ext in IMAGE_EXTS:
        candidate = images_dir / f"shot-{shot_id}{ext}"
        if candidate.exists() and candidate.stat().st_size > 0:
            return candidate
    return None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="检查手绘水彩故事视频的分镜图片、角色配音与时间轴是否齐全合规"
    )
    parser.add_argument("--story-slug", required=True, help="public/ 下的故事子目录名（kebab-case）")
    parser.add_argument("--manifest", help="可选：tts-manifest.json 路径，用于逐镜核对台词与时长")
    parser.add_argument("--expected-shots", type=int, help="可选：期望的分镜总数（如 12）")
    parser.add_argument("--public-dir", default="public", help="public 根目录路径（默认 public）")
    args = parser.parse_args(argv)

    public_root = Path(args.public_dir)
    story_dir = public_root / args.story_slug
    images_dir = story_dir / "images"
    audio_dir = story_dir / "audio"

    errors: list[str] = []
    warnings: list[str] = []
    checked_shots = 0
    checked_lines = 0

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

    # 2. 若提供了 manifest，按 manifest 逐镜核对图片、音频、时长与时间轴边界
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
                img = find_shot_image(images_dir, shot_id)
                if not img:
                    errors.append(f"[镜头 {shot_id}] 缺少分镜图: {images_dir}/shot-{shot_id}.webp")
                else:
                    size_kb = img.stat().st_size / 1024.0
                    if size_kb > 2048:
                        errors.append(f"[镜头 {shot_id}] 分镜图超过 2MB 硬上限 ({size_kb:.1f} KB): {img}")
                    elif size_kb > 500 and img.suffix.lower() != ".webp":
                        warnings.append(f"[镜头 {shot_id}] 分镜图超过 500KB 且非 WebP ({size_kb:.1f} KB): {img}")

                shot_dur = float(shot.get("durSec") or 0.0)
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

    # 3. 若指定了 expected-shots（或未提供 manifest），按序号检查分镜图与音频目录
    if args.expected_shots:
        for i in range(1, args.expected_shots + 1):
            shot_id = f"{i:02d}"
            if not args.manifest:
                checked_shots += 1
            if not find_shot_image(images_dir, shot_id):
                errors.append(f"[镜头 {shot_id}] 缺少分镜图: {images_dir}/shot-{shot_id}.webp")

    if not args.manifest and audio_dir.exists():
        mp3_files = sorted(audio_dir.rglob("*.mp3"))
        checked_lines = len(mp3_files)
        if checked_lines == 0:
            errors.append(f"音频目录为空，未找到任何 .mp3 配音文件: {audio_dir}")
        for mp3 in mp3_files:
            if mp3.stat().st_size == 0:
                errors.append(f"配音文件为空 (0 bytes): {mp3}")

    # 输出汇总报告
    report = {
        "storySlug": args.story_slug,
        "checkedShots": checked_shots,
        "checkedAudioLines": checked_lines,
        "errors": errors,
        "warnings": warnings,
        "passed": len(errors) == 0,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if len(errors) == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
