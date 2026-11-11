#!/usr/bin/env python3
"""
compress-assets.py — 素材压缩与运行时资产落位（零依赖，仅需 ffmpeg/ffprobe）

把 assets/ 里的原始素材压缩后放进 public/<video-name>/<type>/，
满足 AGENTS.md §1.4「素材 → 运行时资产」的加工要求。

默认预设（质量优先，肉眼几乎无差别）：

  图片  → WebP   quality 82（有 alpha 自动保留）
  音频  → MP3    192 kbps / 44.1 kHz 立体声
  视频  → H.264  CRF 20 / preset slow / yuv420p / 30fps 上限

超过以下阈值才压缩（低于阈值视为已达标，直接复制）：

  图片 > 500 KB      音频 > 2 MB      视频 > 8 MB

用法：

  # 单文件：自动按类型落位到 public/<kebab(video)>/<type>/
  python3 scripts/compress-assets.py --in assets/ProductLaunch/images/hero.png --video ProductLaunch

  # 整目录批量
  python3 scripts/compress-assets.py --in assets/ProductLaunch --video ProductLaunch

  # 指定输出路径
  python3 scripts/compress-assets.py --in raw.mov --out public/product-launch/video/intro.mp4

  # 强制压缩（忽略阈值）
  python3 scripts/compress-assets.py --in a.png --video Foo --force

  # 只体检，不改文件
  python3 scripts/compress-assets.py --scan

  # 体检并列出每个超标文件的建议命令
  python3 scripts/compress-assets.py --scan --suggest

退出码：0 = 成功 / 体检通过；1 = 失败或体检发现问题。
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import asset_rules as R  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"
ASSETS_DIR = ROOT / "assets"

THRESHOLDS = R.THRESHOLDS
RUNTIME_OK = R.RUNTIME_OK
kind_of = R.kind_of
kebab = R.kebab
human = R.human


# --------------------------------------------------------------------------- #
# 工具
# --------------------------------------------------------------------------- #
def err(msg: str) -> None:
    print(f"[ERROR] {msg}", file=sys.stderr)


def warn(msg: str) -> None:
    print(f"[WARN] {msg}")


def info(msg: str) -> None:
    print(msg)


def require(binary: str) -> str:
    path = shutil.which(binary)
    if not path:
        raise SystemExit(
            f"缺少依赖：{binary}\n"
            "  安装方式（Debian/Ubuntu）：apt-get install -y ffmpeg\n"
            "  或使用项目已有的 NAS 环境（本仓库默认已带 ffmpeg/ffprobe）"
        )
    return path


def run(cmd: list[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            f"命令失败（退出码 {proc.returncode}）：\n  {' '.join(cmd)}\n"
            f"  stderr: {proc.stderr.strip()[-1200:]}"
        )


def probe(path: Path) -> dict:
    """ffprobe 元数据（失败返回空 dict）。"""
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        return {}
    cmd = [
        ffprobe, "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", str(path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        return {}
    try:
        return json.loads(proc.stdout or "{}")
    except json.JSONDecodeError:
        return {}


def media_summary(path: Path) -> str:
    """给日志用的简短媒体信息：时长 / 尺寸 / 码率。"""
    meta = probe(path)
    if not meta:
        return ""
    fmt = meta.get("format", {})
    parts: list[str] = []
    dur = fmt.get("duration")
    if dur:
        try:
            parts.append(f"{float(dur):.1f}s")
        except ValueError:
            pass
    for st in meta.get("streams", []):
        if st.get("codec_type") == "video" and st.get("width"):
            parts.append(f"{st['width']}x{st['height']}")
            break
    br = fmt.get("bit_rate")
    if br:
        try:
            parts.append(f"{int(br) / 1000:.0f} kbps")
        except ValueError:
            pass
    return " / ".join(parts)


# --------------------------------------------------------------------------- #
# 压缩实现
# --------------------------------------------------------------------------- #
def compress_image(src: Path, dst: Path, quality: int) -> None:
    """任意图片 → WebP。"""
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        require("ffmpeg"), "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(src),
        "-c:v", "libwebp",
        "-quality", str(quality),
        "-compression_level", "6",
        "-preset", "picture",
        "-map_metadata", "-1",
        str(dst),
    ]
    run(cmd)


def compress_audio(src: Path, dst: Path, bitrate: str, sample_rate: int) -> None:
    """任意音频 → MP3。"""
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        require("ffmpeg"), "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(src),
        "-vn",
        "-c:a", "libmp3lame",
        "-b:a", bitrate,
        "-ar", str(sample_rate),
        "-map_metadata", "-1",
        str(dst),
    ]
    run(cmd)


def compress_video(src: Path, dst: Path, crf: int, preset: str, max_fps: int, max_width: int) -> None:
    """任意视频 → H.264 / yuv420p / faststart，可选限帧率与限宽。"""
    dst.parent.mkdir(parents=True, exist_ok=True)
    vf = [f"fps=fps='min({max_fps},source_fps)'"]
    meta = probe(src)
    for st in meta.get("streams", []):
        if st.get("codec_type") == "video" and st.get("width"):
            if max_width and st["width"] > max_width:
                vf.append(f"scale='min({max_width},iw)':-2")
            break
    cmd = [
        require("ffmpeg"), "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(src),
        "-vf", ",".join(vf),
        "-c:v", "libx264",
        "-crf", str(crf),
        "-preset", preset,
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-c:a", "aac",
        "-b:a", "160k",
        "-ac", "2",
        "-map_metadata", "-1",
        str(dst),
    ]
    run(cmd)


def default_dst(
    src: Path, video: str | None, kind: str, out: Path | None, *, keep_ext: bool = False
) -> Path:
    """运行时资产落位路径。

    keep_ext=True 用于「未超阈值、直接复制」的场景：保留源扩展名，避免出现
    内容是 PNG 却命名成 .webp 的撒谎文件。压缩路径一律改用规范扩展名。
    """
    if out is not None:
        return out
    if not video:
        raise SystemExit("必须提供 --video 或 --out 之一，以确定运行时资产落位路径")
    group = kebab(video)
    subdir = R.SUBDIR[kind]
    ext = src.suffix.lower() if keep_ext else R.TARGET_EXT[kind]
    return PUBLIC_DIR / group / subdir / (src.stem + ext)


def process_one(
    src: Path,
    *,
    video: str | None,
    out: Path | None,
    kind_override: str | None,
    quality: int,
    bitrate: str,
    sample_rate: int,
    crf: int,
    preset: str,
    max_fps: int,
    max_width: int,
    force: bool,
    dry_run: bool,
) -> tuple[bool, int, int]:
    """返回 (是否成功, 压缩前字节, 压缩后字节)。"""
    kind = kind_override or kind_of(src)
    if kind is None:
        warn(f"跳过（未知类型）：{src}")
        return False, 0, 0

    before = src.stat().st_size
    threshold = THRESHOLDS[kind]

    if before <= threshold and not force:
        dst = default_dst(src, video, kind, out, keep_ext=True)
        why = "已是运行时格式" if src.suffix.lower() in RUNTIME_OK else "未超阈值"
        info(f"  · {src.name}：{human(before)} ≤ 阈值 {human(threshold)}（{why}），直接复制，保留 {src.suffix}")
        if not dry_run:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
        info(f"    → {dst.relative_to(ROOT) if dst.is_relative_to(ROOT) else dst}")
        return True, before, before

    dst = default_dst(src, video, kind, out)
    detail = media_summary(src)
    info(f"  · {src.name}：{human(before)}{' / ' + detail if detail else ''} → 压缩中…")

    if dry_run:
        info(f"    [dry-run] 将输出 {dst.relative_to(ROOT) if dst.is_relative_to(ROOT) else dst}")
        return True, before, 0

    try:
        if kind == "image":
            compress_image(src, dst, quality)
        elif kind == "audio":
            compress_audio(src, dst, bitrate, sample_rate)
        else:
            compress_video(src, dst, crf, preset, max_fps, max_width)
    except (RuntimeError, SystemExit) as exc:
        err(f"压缩失败：{src}\n  {exc}")
        return False, before, 0

    after = dst.stat().st_size if dst.is_file() else 0
    if after == 0:
        err(f"输出为空：{dst}")
        return False, before, 0

    if after >= before:
        warn(
            f"压缩无收益（{human(before)} → {human(after)}），保留原文件：{src.name}\n"
            "   已删除输出。可降低 --quality / 提高 --crf 后重试。"
        )
        dst.unlink(missing_ok=True)
        return False, before, after

    ratio = (1 - after / before) * 100
    new_detail = media_summary(dst)
    info(
        f"    ✓ {human(before)} → {human(after)}（-{ratio:.1f}%）"
        f"{'  [' + new_detail + ']' if new_detail else ''}\n"
        f"    → {dst.relative_to(ROOT) if dst.is_relative_to(ROOT) else dst}"
    )
    if ratio < 5:
        warn(f"压缩率仅 {ratio:.1f}%，收益很小；考虑换更小的源图/更短片段")
    return True, before, after


# --------------------------------------------------------------------------- #
# 体检模式
# --------------------------------------------------------------------------- #
def scan(quiet: bool, suggest: bool) -> int:
    """扫描 public/ 是否存在平铺文件与超标文件。"""
    if not PUBLIC_DIR.is_dir():
        info("public/ 不存在，无需体检")
        return 0

    problems: list[str] = []
    total_before = 0
    total_after = 0

    info("public/ 运行时资产体检")
    info("-" * 62)

    for path in sorted(PUBLIC_DIR.rglob("*")):
        if not path.is_file() or path.name.startswith("."):
            continue
        rel = path.relative_to(PUBLIC_DIR)
        parts = rel.parts
        size = path.stat().st_size
        kind = kind_of(path)

        if len(parts) == 1:
            problems.append(f"平铺文件：public/{rel.as_posix()}（必须放进 <video-name>/<type>/ 子目录）")
            continue

        if kind is None:
            continue

        limit = THRESHOLDS[kind]
        if size > limit:
            problems.append(
                f"超标 {kind}：public/{rel.as_posix()} = {human(size)} > {human(limit)}"
            )
            if suggest:
                # 不能原地覆盖（ffmpeg 输入输出同路径会失败），先输出到 .min.* 再替换
                tmp = path.with_name(f"{path.stem}.min{R.TARGET_EXT[kind]}")
                tmp_rel = tmp.relative_to(ROOT).as_posix()
                lower = {"image": "--quality 70", "audio": "--bitrate 128k", "video": "--crf 23"}[kind]
                problems.append(
                    f"    建议：python3 scripts/compress-assets.py "
                    f"--in public/{rel.as_posix()} --out {tmp_rel} {lower} --force "
                    f"&& mv {tmp_rel} public/{rel.as_posix()}"
                )

    if problems:
        for p in problems:
            print(f"[ERROR] {p}")
        info("-" * 62)
        info(f"✗ 体检失败：{len(problems)} 个问题")
        return 1

    info("✓ 体检通过：无平铺文件，无超标文件")
    return 0


# --------------------------------------------------------------------------- #
# 入口
# --------------------------------------------------------------------------- #
def collect_inputs(raw: str) -> list[Path]:
    p = Path(raw)
    if not p.is_absolute():
        p = (ROOT / p).resolve()
    if p.is_dir():
        files = [f for f in sorted(p.rglob("*")) if f.is_file() and kind_of(f)]
        return files
    if not p.is_file():
        raise SystemExit(f"输入不存在：{p}")
    return [p]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="素材压缩与运行时资产落位（图片→WebP，音频→MP3，视频→H.264）。",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--in", dest="inputs", action="append", default=[], help="输入文件或目录（可重复）")
    parser.add_argument("--video", help="视频名（如 ProductLaunch），决定落位到 public/<kebab>/")
    parser.add_argument("--out", help="显式输出路径（单文件时使用）")
    parser.add_argument("--kind", choices=["image", "audio", "video"], help="强制按某类型处理")
    parser.add_argument("--quality", type=int, default=82, help="WebP 质量 0-100")
    parser.add_argument("--bitrate", default="192k", help="MP3 码率")
    parser.add_argument("--sample-rate", type=int, default=44100, help="MP3 采样率")
    parser.add_argument("--crf", type=int, default=20, help="H.264 CRF（越小越好越大文件）")
    parser.add_argument("--preset", default="slow", help="x264 preset")
    parser.add_argument("--max-fps", type=int, default=30, help="视频帧率上限")
    parser.add_argument("--max-width", type=int, default=1920, help="视频宽度上限（0 = 不缩放）")
    parser.add_argument("--force", action="store_true", help="忽略阈值，强制压缩")
    parser.add_argument("--dry-run", action="store_true", help="只打印计划，不写文件")
    parser.add_argument("--scan", action="store_true", help="体检 public/（平铺文件 + 超标文件）")
    parser.add_argument("--suggest", action="store_true", help="体检时给出修复命令")
    args = parser.parse_args(argv)

    if args.scan:
        return scan(quiet=False, suggest=args.suggest)

    if not args.inputs:
        parser.error("请用 --in 指定输入，或用 --scan 体检")

    require("ffmpeg")
    require("ffprobe")

    files: list[Path] = []
    for raw in args.inputs:
        files.extend(collect_inputs(raw))

    if not files:
        raise SystemExit("没有找到可处理的媒体文件")

    if args.out and len(files) > 1:
        parser.error("--out 只能配合单个输入文件使用")

    info(f"共 {len(files)} 个文件待处理（阈值：图片 {human(THRESHOLDS['image'])} / "
         f"音频 {human(THRESHOLDS['audio'])} / 视频 {human(THRESHOLDS['video'])}）")
    info("-" * 62)

    ok_count = failed = 0
    sum_before = sum_after = 0
    for f in files:
        ok, before, after = process_one(
            f,
            video=args.video,
            out=(Path(args.out) if args.out else None),
            kind_override=args.kind,
            quality=args.quality,
            bitrate=args.bitrate,
            sample_rate=args.sample_rate,
            crf=args.crf,
            preset=args.preset,
            max_fps=args.max_fps,
            max_width=args.max_width,
            force=args.force,
            dry_run=args.dry_run,
        )
        if ok:
            ok_count += 1
            sum_before += before
            sum_after += after
        else:
            failed += 1

    info("-" * 62)
    if sum_before:
        saved = sum_before - sum_after
        pct = saved / sum_before * 100 if sum_before else 0
        info(f"合计：{human(sum_before)} → {human(sum_after)}，节省 {human(saved)}（-{pct:.1f}%）")
    info(f"完成：成功 {ok_count}，失败/跳过 {failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
