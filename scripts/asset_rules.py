#!/usr/bin/env python3
"""
asset_rules.py — 静态资产规范的单一真源（阈值 / 类型 / 命名 / 落位规则）

被 `check-assets.py`（校验门禁）与 `compress-assets.py`（压缩落位）共同导入，
避免两处硬编码阈值漂移。规范文本见 `AGENTS.md` §1.4 与 `assets/README.md`。

本模块只放常量与纯函数，不做 I/O 副作用。
"""

from __future__ import annotations

import re
from pathlib import Path

# --------------------------------------------------------------------------- #
# 体积阈值（字节）：超过即视为「运行时资产过大」，必须压缩
# --------------------------------------------------------------------------- #
THRESHOLDS = {
    "image": 500 * 1024,        # 500 KB
    "audio": 2 * 1024 * 1024,   # 2 MB
    "video": 8 * 1024 * 1024,   # 8 MB
}

# 绝对值上限：任何单文件都不得超过（防止阈值被 --max-mb 之类参数放水）
HARD_CEILING = {
    "image": 2 * 1024 * 1024,   # 2 MB
    "audio": 8 * 1024 * 1024,   # 8 MB
    "video": 32 * 1024 * 1024,  # 32 MB
}

# --------------------------------------------------------------------------- #
# 扩展名分类
# --------------------------------------------------------------------------- #
IMAGE_EXT = {
    ".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff",
    ".gif", ".webp", ".avif", ".heic", ".heif", ".psd",
}
AUDIO_EXT = {
    ".wav", ".flac", ".aiff", ".aif", ".m4a", ".aac",
    ".ogg", ".opus", ".mp3", ".wma",
}
VIDEO_EXT = {
    ".mov", ".mp4", ".mkv", ".avi", ".webm", ".m4v",
    ".wmv", ".flv", ".mpg", ".mpeg", ".ts",
}

# 已达标、无需再压的运行时格式
RUNTIME_OK = {".webp", ".mp3", ".mp4"}

# 压缩后的目标扩展名
TARGET_EXT = {"image": ".webp", "audio": ".mp3", "video": ".mp4"}

# 类型 → public/<video-name>/ 下的子目录
SUBDIR = {"image": "images", "audio": "audio", "video": "video", "font": "fonts"}

# 允许出现在 public/<video-name>/ 下的子目录名
ALLOWED_SUBDIRS = {"audio", "images", "fonts", "video"}

# 共享资产目录名（不带视频前缀）
SHARED_DIR = "_shared"

# --------------------------------------------------------------------------- #
# 命名规则
# --------------------------------------------------------------------------- #
# 单段路径：小写字母/数字开头，可含 - _ .；允许 _shared 这类下划线开头目录
SAFE_SEGMENT = re.compile(r"^[a-z0-9_][a-z0-9._-]*$")


def kind_of(path: Path) -> str | None:
    """按扩展名判定 media 类型；未知返回 None。"""
    ext = path.suffix.lower()
    if ext in IMAGE_EXT:
        return "image"
    if ext in AUDIO_EXT:
        return "audio"
    if ext in VIDEO_EXT:
        return "video"
    return None


def kebab(name: str) -> str:
    """ProductLaunch -> product-launch；my_video -> my-video。"""
    s = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "-", name)
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return s or "untitled"


def human(n: float) -> str:
    """人类可读体积。"""
    if n < 1024:
        return f"{int(n)} B"
    for unit in ("KB", "MB", "GB"):
        n /= 1024.0
        if n < 1024 or unit == "GB":
            return f"{n:.1f} {unit}"
    return f"{n:.1f} GB"


def bad_segments(rel_posix: str) -> list[str]:
    """返回 public/ 相对路径中命名不合规的片段。"""
    return [seg for seg in rel_posix.split("/") if seg and not SAFE_SEGMENT.match(seg)]


def is_flat(rel_parts: tuple[str, ...]) -> bool:
    """public/ 根下的散落文件（未放进任何子目录）。"""
    return len(rel_parts) == 1


def over_threshold(kind: str, size: int) -> bool:
    return kind in THRESHOLDS and size > THRESHOLDS[kind]
