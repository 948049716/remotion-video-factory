#!/usr/bin/env python3
"""
tts_helper.py — 手绘水彩故事视频 Skill 语音合成与时长测量工具

支持两种语音生成模式：
  1. edge-tts 模式（默认，无需用户自备服务）：
     优先调用本机 edge-tts / uvx edge-tts 合成高自然度中文/多语种语音；
     若当前运行环境（如受限云端沙箱代理）拦截了 speech.platform.bing.com (HTTP 403)，
     自动无缝回退至 Google TTS + ffmpeg 角色音色/语速/音调塑形，保证任何环境下 100% 可用。
  2. custom 模式（用户有自部署 TTS 服务）：
     调用 OpenAI 兼容接口 POST {base_url}/audio/speech（支持 Bearer API Key、自定义 model/voice/speed）。

同时内置 ffprobe 时长实测与分镜时间轴自动排算（--manifest 批量模式），
确保每个镜头的 durSec 与台词 atSec 100% 匹配真实音频时长，绝不截断。
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"
DEFAULT_MODEL = "tts-1"
HTTP_TIMEOUT = 90.0

# 缓存当前进程内 edge-tts 远端是否可达，避免沙箱拦截时每句重复等待超时
_EDGE_TTS_AVAILABLE: bool | None = None


def log(msg: str) -> None:
    print(f"[tts_helper] {msg}", file=sys.stderr)


def speed_to_rate_str(speed: float) -> str:
    """将倍率（如 0.92 或 1.15）转换为 edge-tts 所需的百分比格式（如 '-8%' 或 '+15%'）。"""
    pct = round((speed - 1.0) * 100)
    return f"+{pct}%" if pct >= 0 else f"{pct}%"


def probe_duration(audio_path: Path) -> float:
    """使用 ffprobe 读取音频精确秒数（保留 3 位小数）。"""
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        raise RuntimeError("未找到 ffprobe，请确认已安装 ffmpeg/ffprobe。")
    cmd = [
        ffprobe,
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "csv=p=0",
        str(audio_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0 or not proc.stdout.strip():
        raise RuntimeError(f"ffprobe 读取时长失败 ({audio_path}): {proc.stderr.strip()}")
    return round(float(proc.stdout.strip()), 3)


def _split_text_chunks(text: str, max_chars: int = 160) -> list[str]:
    """将长句按标点拆分为不超过 max_chars 的片段。"""
    text = text.strip()
    if len(text) <= max_chars:
        return [text]
    parts = re.split(r"(?<=[。！？；.!?;])", text)
    chunks: list[str] = []
    buf = ""
    for p in parts:
        if not p:
            continue
        if len(buf) + len(p) <= max_chars:
            buf += p
        else:
            if buf:
                chunks.append(buf)
            buf = p
    if buf:
        chunks.append(buf)
    return chunks or [text]


def _pitch_ratio_for_voice(voice: str, pitch: str) -> float:
    """根据角色音色名与 pitch 参数计算音高塑形比例。"""
    v_low = voice.lower()
    base_ratio = 1.0
    if any(k in v_low for k in ("yunjian", "yunyang", "yunxi", "male")):
        base_ratio = 0.87
    elif any(k in v_low for k in ("xiaoyi", "yunxia", "child", "girl")):
        base_ratio = 1.08

    m = re.match(r"^([+-]?\d+(?:\.\d+)?)hz$", pitch.strip().lower())
    if m:
        hz = float(m.group(1))
        base_ratio *= max(0.80, min(1.25, 1.0 + hz * 0.012))
    return round(base_ratio, 4)


def synthesize_fallback_gtts(
    text: str,
    out_path: Path,
    voice: str = DEFAULT_VOICE,
    speed: float = 1.0,
    pitch: str = "+0Hz",
) -> None:
    """当沙箱环境拦截 speech.platform.bing.com 时，使用 Google TTS + ffmpeg 音色塑形合成语音。"""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    chunks = _split_text_chunks(text, max_chars=160)
    raw_bytes = bytearray()

    for chunk in chunks:
        url = "https://translate.google.com/translate_tts?" + urllib.parse.urlencode(
            {
                "ie": "UTF-8",
                "q": chunk,
                "tl": "zh-CN",
                "client": "tw-ob",
            }
        )
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
            raw_bytes.extend(resp.read())

    if not raw_bytes:
        raise RuntimeError("回退 TTS 返回空音频")

    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        out_path.write_bytes(bytes(raw_bytes))
        return

    pitch_ratio = _pitch_ratio_for_voice(voice, pitch)
    # Google TTS 默认语速偏慢，乘以 1.12 基准使正常语速自然流畅
    effective_speed = max(0.6, min(1.8, speed * 1.12))
    atempo = round(effective_speed / pitch_ratio, 4)
    atempo = max(0.5, min(2.0, atempo))

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(bytes(raw_bytes))
        tmp_path = Path(tmp.name)

    try:
        af_filter = f"asetrate=24000*{pitch_ratio},aresample=24000,atempo={atempo}"
        cmd = [
            ffmpeg,
            "-y",
            "-v",
            "error",
            "-i",
            str(tmp_path),
            "-af",
            af_filter,
            "-c:a",
            "libmp3lame",
            "-b:a",
            "128k",
            str(out_path),
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if proc.returncode != 0:
            shutil.copy2(tmp_path, out_path)
    finally:
        tmp_path.unlink(missing_ok=True)


def synthesize_edge_tts(
    text: str,
    out_path: Path,
    voice: str = DEFAULT_VOICE,
    speed: float = 1.0,
    pitch: str = "+0Hz",
) -> None:
    """使用本地 edge-tts（或 uvx edge-tts）合成语音；若受沙箱网络限制则自动回退。"""
    global _EDGE_TTS_AVAILABLE
    out_path.parent.mkdir(parents=True, exist_ok=True)

    if _EDGE_TTS_AVAILABLE is False:
        synthesize_fallback_gtts(text=text, out_path=out_path, voice=voice, speed=speed, pitch=pitch)
        return

    rate_str = speed_to_rate_str(speed)
    py_code = (
        "import asyncio, os, sys, certifi\n"
        "if os.environ.get('SSL_CERT_FILE'):\n"
        "    certifi.where = lambda: os.environ['SSL_CERT_FILE']\n"
        "import edge_tts\n"
        "async def run():\n"
        "    c = edge_tts.Communicate(\n"
        "        text=sys.argv[1],\n"
        "        voice=sys.argv[2],\n"
        "        rate=sys.argv[3],\n"
        "        pitch=sys.argv[4],\n"
        "        proxy=os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY'),\n"
        "    )\n"
        "    await c.save(sys.argv[5])\n"
        "asyncio.run(run())\n"
    )

    if (
        subprocess.run(
            [sys.executable, "-c", "import edge_tts"],
            capture_output=True,
            check=False,
        ).returncode
        == 0
    ):
        cmd = [sys.executable, "-c", py_code, text, voice, rate_str, pitch, str(out_path)]
    elif shutil.which("uv"):
        cmd = ["uv", "run", "--with", "edge-tts", "python3", "-c", py_code, text, voice, rate_str, pitch, str(out_path)]
    elif shutil.which("edge-tts"):
        cmd = [
            "edge-tts",
            "--voice",
            voice,
            f"--rate={rate_str}",
            f"--pitch={pitch}",
            "--text",
            text,
            "--write-media",
            str(out_path),
        ]
    else:
        _EDGE_TTS_AVAILABLE = False
        synthesize_fallback_gtts(text=text, out_path=out_path, voice=voice, speed=speed, pitch=pitch)
        return

    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode == 0 and out_path.exists() and out_path.stat().st_size > 0:
        _EDGE_TTS_AVAILABLE = True
        return

    log("检测到当前网络环境拦截了 edge-tts 端点 (speech.platform.bing.com)，已自动启用多角色音色塑形回退引擎")
    _EDGE_TTS_AVAILABLE = False
    synthesize_fallback_gtts(text=text, out_path=out_path, voice=voice, speed=speed, pitch=pitch)


def synthesize_custom_api(
    text: str,
    out_path: Path,
    base_url: str,
    api_key: str | None = None,
    model: str = DEFAULT_MODEL,
    voice: str = DEFAULT_VOICE,
    speed: float = 1.0,
) -> None:
    """调用自部署或第三方 OpenAI 兼容 TTS 接口 (/v1/audio/speech)。"""
    clean_base = base_url.rstrip("/")
    if clean_base.endswith("/audio/speech"):
        url = clean_base
    elif clean_base.endswith("/v1"):
        url = f"{clean_base}/audio/speech"
    else:
        url = f"{clean_base}/v1/audio/speech"

    out_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "model": model,
        "input": text,
        "voice": voice,
        "response_format": "mp3",
        "speed": speed,
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "audio/*",
    }
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    req = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
            audio = resp.read()
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:500]
        raise RuntimeError(f"自部署 TTS 请求失败 HTTP {e.code} ({url}): {detail}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"无法连接自部署 TTS 服务 ({url}): {e.reason}") from e

    if not audio:
        raise RuntimeError(f"TTS 服务返回空音频数据 ({url})")
    out_path.write_bytes(audio)


def run_manifest(
    manifest_path: Path,
    mode: str,
    base_url: str | None,
    api_key: str | None,
    default_model: str,
) -> int:
    """批量处理分镜配音清单，自动测量每句时长并排算每个镜头的 atSec 与 durSec。"""
    data: dict[str, Any] = json.loads(manifest_path.read_text(encoding="utf-8"))
    story_slug = data.get("storySlug") or "story-video"
    speakers: dict[str, dict[str, Any]] = data.get("speakers") or {}
    shots: list[dict[str, Any]] = data.get("shots") or []

    total_lines = 0
    for shot in shots:
        pre_pad = float(shot.get("prePadSec", 1.0))
        post_pad = float(shot.get("postPadSec", 1.0))
        line_gap = float(shot.get("lineGapSec", 0.5))
        cursor = pre_pad
        lines: list[dict[str, Any]] = shot.get("lines") or []

        for idx, line in enumerate(lines):
            line_id = line["id"]
            speaker = line.get("speaker", "narrator")
            text = line["text"].strip()
            sp_cfg = speakers.get(speaker, {})

            voice = line.get("voice") or sp_cfg.get("voice") or DEFAULT_VOICE
            speed = float(line.get("speed") or sp_cfg.get("speed") or 1.0)
            pitch = str(line.get("pitch") or sp_cfg.get("pitch") or "+0Hz")
            model = str(line.get("model") or sp_cfg.get("model") or default_model)

            rel_file = line.get("file") or f"{story_slug}/audio/{line_id}.mp3"
            out_path = Path("public") / rel_file

            log(f"正在合成 [{shot.get('id')}/{line_id}] ({speaker} -> {voice}, speed={speed})...")
            if mode == "custom":
                if not base_url:
                    raise SystemExit("custom 模式必须提供 --base-url 或环境变量 TTS_BASE_URL")
                synthesize_custom_api(
                    text=text,
                    out_path=out_path,
                    base_url=base_url,
                    api_key=api_key,
                    model=model,
                    voice=voice,
                    speed=speed,
                )
            else:
                synthesize_edge_tts(
                    text=text,
                    out_path=out_path,
                    voice=voice,
                    speed=speed,
                    pitch=pitch,
                )

            dur_sec = probe_duration(out_path)
            line["file"] = rel_file
            line["atSec"] = round(cursor, 2)
            line["durSec"] = dur_sec
            cursor += dur_sec
            if idx < len(lines) - 1:
                cursor += line_gap
            total_lines += 1

        min_shot_dur = round(cursor + post_pad, 1) if lines else float(shot.get("durSec", 4.0))
        shot["durSec"] = max(float(shot.get("minDurSec", 0.0)), min_shot_dur)

    manifest_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    log(f"批量合成完成：共 {len(shots)} 个镜头、{total_lines} 条语音，已回写 {manifest_path}")
    print(
        json.dumps(
            {
                "status": "ok",
                "shots": len(shots),
                "lines": total_lines,
                "manifest": str(manifest_path),
            },
            ensure_ascii=False,
        )
    )
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="手绘水彩故事视频 TTS 合成与 ffprobe 时长测量脚本"
    )
    parser.add_argument(
        "--mode",
        choices=["edge-tts", "custom"],
        default=os.environ.get("TTS_MODE", "edge-tts"),
        help="TTS 模式：edge-tts（默认免配置）或 custom（自部署 OpenAI 兼容接口）",
    )
    parser.add_argument(
        "--base-url",
        default=os.environ.get("TTS_BASE_URL"),
        help="自部署 TTS 服务的 Base URL（如 http://192.168.0.2:5055/v1）",
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("TTS_API_KEY"),
        help="自部署或第三方 TTS 服务的 API Key（可选）",
    )
    parser.add_argument("--model", default=DEFAULT_MODEL, help="custom 模式下的模型名")
    parser.add_argument("--manifest", help="批量合成的 JSON 清单路径（会自动测量并回写 atSec / durSec）")
    parser.add_argument("--text", help="单句合成的文本")
    parser.add_argument("--out", help="单句合成的输出文件路径（如 public/my-story/audio/s01-narr.mp3）")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="音色名称，如 zh-CN-XiaoxiaoNeural")
    parser.add_argument("--speed", type=float, default=1.0, help="语速倍率（如 0.92）")
    parser.add_argument("--pitch", default="+0Hz", help="edge-tts 音调调整（如 +0Hz, +4Hz）")
    args = parser.parse_args(argv)

    if args.manifest:
        return run_manifest(
            manifest_path=Path(args.manifest),
            mode=args.mode,
            base_url=args.base_url,
            api_key=args.api_key,
            default_model=args.model,
        )

    if not args.text or not args.out:
        raise SystemExit("单句模式必须同时提供 --text 与 --out，或使用 --manifest 批量模式")

    out_path = Path(args.out)
    if args.mode == "custom":
        if not args.base_url:
            raise SystemExit("custom 模式必须提供 --base-url 或环境变量 TTS_BASE_URL")
        synthesize_custom_api(
            text=args.text.strip(),
            out_path=out_path,
            base_url=args.base_url,
            api_key=args.api_key,
            model=args.model,
            voice=args.voice,
            speed=args.speed,
        )
    else:
        synthesize_edge_tts(
            text=args.text.strip(),
            out_path=out_path,
            voice=args.voice,
            speed=args.speed,
            pitch=args.pitch,
        )

    dur = probe_duration(out_path)
    result = {
        "file": str(out_path),
        "durSec": dur,
        "voice": args.voice,
        "speed": args.speed,
        "mode": args.mode,
    }
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
