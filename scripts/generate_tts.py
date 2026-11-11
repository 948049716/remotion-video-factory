#!/usr/bin/env python3
"""
generate_tts.py — 项目统一 TTS 语音合成入口（零依赖，仅用标准库）

本仓库的硬性约束：凡是需要语音/旁白/配音等 TTS 音频，一律使用 NAS 上部署的
edge-tts 服务，禁止使用其他在线 TTS、本地模型或第三方 SDK。

服务地址（OpenAI 兼容接口）:
  - 局域网（默认优先，推荐）: http://192.168.0.2:5055/v1
  - 公网 / 远程           : https://tts.miong.dpdns.org:9481/v1

本脚本会自动选择可用端点：先探测局域网，不可达（例如项目被拉到不在同一局域网的
电脑上）则自动回退到公网。

用法示例:
  # 最简单：合成一句中文旁白到某支视频的音频目录
  python3 scripts/generate_tts.py --text "欢迎来到视频工坊" --out public/my-video/audio/voiceover.mp3

  # 指定音色与语速，并读取文本文件
  python3 scripts/generate_tts.py --text-file script.txt \
      --voice zh-CN-YunxiNeural --speed 1.1 --out public/my-video/audio/narration.mp3

  # 强制走公网端点 / 强制走局域网端点
  python3 scripts/generate_tts.py --text "远程合成" --out public/my-video/audio/a.mp3 --endpoint public
  python3 scripts/generate_tts.py --text "本机合成" --out public/my-video/audio/a.mp3 --endpoint lan

  # 查看可用音色（可按语言过滤）
  python3 scripts/generate_tts.py --list-voices --lang zh

在 Remotion 中引用生成的音频:
  import { Audio, staticFile } from "remotion";
  <Audio src={staticFile("my-video/audio/voiceover.mp3")} />

生成后可读取音频时长用于对齐画面（需要 ffprobe / ffmpeg）:
  ffprobe -v error -show_entries format=duration -of csv=p=0 public/my-video/audio/voiceover.mp3
"""

from __future__ import annotations

import argparse
import json
import os
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

LAN_BASE_URL = "http://192.168.0.2:5055/v1"
PUBLIC_BASE_URL = "https://tts.miong.dpdns.org:9481/v1"

LAN_PROBE_HOST = ("192.168.0.2", 5055)
LAN_PROBE_TIMEOUT = 1.5  # 秒；探测失败即认为不在同一局域网
HTTP_TIMEOUT = 60.0

DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"
DEFAULT_MODEL = "tts-1"
DEFAULT_FORMAT = "mp3"

ENV_BASE_URL = "EDGE_TTS_BASE_URL"
ENV_ENDPOINT = "EDGE_TTS_ENDPOINT"  # lan | public | auto


def log(msg: str) -> None:
    print(f"[tts] {msg}", file=sys.stderr)


def lan_reachable() -> bool:
    """用 TCP 探测判断本机是否与 NAS 处于同一局域网。"""
    try:
        with socket.create_connection(LAN_PROBE_HOST, timeout=LAN_PROBE_TIMEOUT):
            return True
    except OSError:
        return False


def resolve_base_url(endpoint: str | None) -> str:
    """
    解析最终使用的 Base URL，优先级：
      1. --base-url / EDGE_TTS_BASE_URL（显式指定，最高优先级）
      2. --endpoint / EDGE_TTS_ENDPOINT = lan / public
      3. auto：局域网可达用局域网，否则回退公网
    """
    explicit = os.environ.get(ENV_BASE_URL, "").strip()
    if explicit:
        return explicit.rstrip("/")

    choice = (endpoint or os.environ.get(ENV_ENDPOINT) or "auto").strip().lower()

    if choice == "lan":
        return LAN_BASE_URL
    if choice == "public":
        return PUBLIC_BASE_URL
    if choice != "auto":
        raise SystemExit(f"未知的 endpoint 取值: {choice!r}（可选 lan / public / auto）")

    if lan_reachable():
        return LAN_BASE_URL
    log("局域网 192.168.0.2:5055 不可达，自动回退到公网端点")
    return PUBLIC_BASE_URL


def http_get_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_post_speech(base_url: str, payload: dict) -> tuple[bytes, str]:
    url = f"{base_url}/audio/speech"
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "Accept": "audio/*"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
        ctype = resp.headers.get("Content-Type", "")
        return resp.read(), ctype


def read_text(args: argparse.Namespace) -> str:
    if args.text_file:
        return Path(args.text_file).read_text(encoding="utf-8").strip()
    if args.text:
        return args.text.strip()
    # 支持从 stdin 读取，便于管道用法
    if not sys.stdin.isatty():
        return sys.stdin.read().strip()
    raise SystemExit("必须提供 --text、--text-file，或通过 stdin 传入文本")


def cmd_list_voices(base_url: str, lang: str | None) -> int:
    url = f"{base_url}/audio/voices"
    if lang:
        url += "?" + urllib.parse.urlencode({"lang": lang})
    data = http_get_json(url)
    # 兼容三种返回形态：纯数组、{data:[...]}（OpenAI 风格）、{voices:[...]}
    voices = data
    if isinstance(data, dict):
        voices = data.get("data") or data.get("voices") or []
    if not isinstance(voices, list):
        raise SystemExit(f"无法解析音色列表: {str(data)[:300]}")
    for v in voices:
        if isinstance(v, str):
            print(v)
        else:
            name = v.get("id") or v.get("ShortName") or v.get("name") or ""
            print(f"{name}\t{v.get('locale') or v.get('Locale', '')}\t{v.get('gender') or v.get('Gender', '')}")
    log(f"共 {len(voices)} 个音色（{base_url}）")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="使用 NAS 部署的 edge-tts 服务合成语音（OpenAI 兼容接口）。",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--text", help="要合成的文本")
    parser.add_argument("--text-file", help="从 UTF-8 文本文件读取要合成的内容")
    parser.add_argument("--out", help="输出文件路径，例如 public/my-video/audio/voiceover.mp3")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="音色 ID")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="模型 ID（tts-1 / tts-1-hd）")
    parser.add_argument("--format", dest="fmt", default=DEFAULT_FORMAT, help="音频格式：mp3 / wav 等")
    parser.add_argument("--speed", type=float, default=1.0, help="语速倍率，0.5 ~ 2.0")
    parser.add_argument(
        "--endpoint",
        choices=["auto", "lan", "public"],
        default=None,
        help="端点选择：auto 先试局域网再回退公网",
    )
    parser.add_argument("--base-url", default=None, help=f"直接指定 Base URL（覆盖以上选项，也可用 ${ENV_BASE_URL}）")
    parser.add_argument("--list-voices", action="store_true", help="列出可用音色后退出")
    parser.add_argument("--lang", help="配合 --list-voices 按语言过滤，例如 zh / zh-CN / en")
    args = parser.parse_args(argv)

    if args.base_url:
        os.environ[ENV_BASE_URL] = args.base_url
    base_url = resolve_base_url(args.endpoint)
    log(f"使用端点: {base_url}")

    if args.list_voices:
        return cmd_list_voices(base_url, args.lang)

    text = read_text(args)
    if not text:
        raise SystemExit("文本为空，无法合成")

    out_path = Path(args.out or f"public/_shared/audio/tts-{args.voice}.{args.fmt}")
    if out_path.suffix == "":
        out_path = out_path.with_suffix(f".{args.fmt}")
    out_path.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "model": args.model,
        "input": text,
        "voice": args.voice,
        "response_format": args.fmt,
        "speed": args.speed,
    }

    log(f"合成 {len(text)} 字 → {out_path}")
    try:
        audio, ctype = http_post_speech(base_url, payload)
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:500]
        raise SystemExit(f"TTS 请求失败 HTTP {e.code}: {detail}")
    except urllib.error.URLError as e:
        raise SystemExit(
            f"无法连接 TTS 服务 {base_url}: {e.reason}\n"
            "请确认：局域网机器检查 192.168.0.2:5055 是否可访问；"
            "远程机器改用 --endpoint public 或 --base-url https://tts.miong.dpdns.org:9481/v1"
        )

    if not audio:
        raise SystemExit("服务返回空音频数据")

    out_path.write_bytes(audio)
    log(f"完成：{out_path}（{len(audio)} 字节，{ctype or 'unknown'}）")
    print(out_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
