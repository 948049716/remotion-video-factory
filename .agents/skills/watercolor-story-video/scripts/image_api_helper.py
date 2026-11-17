#!/usr/bin/env python3
"""
image_api_helper.py — 手绘水彩故事视频 Skill 图像生成与 WebP 优化落位工具

支持两种工作流：
  1. Agent 自带生图模式（默认，当用户无外部 API Key 时）：
     Agent 调用内置 `generate_image` 工具生成原始图后，使用本脚本 `--convert-in` 将图片
     统一转换为高画质 WebP（默认 quality 85）并落位到 `public/<story-slug>/images/shot-XX.webp`。
  2. 用户自备 API Key 模式（当用户提供生图 API Key 时）：
     使用 `--provider openai`（兼容 OpenAI / SiliconFlow / 火山方舟 / OneAPI 等 `/v1/images/generations`）
     或 `--provider gemini` 调用外部生图模型，并自动转存为 WebP。

用法示例：
  # A) 将 Agent 内置 generate_image 生成的图片转换落位到 public/
  python3 image_api_helper.py --convert-in /path/to/artifact_shot_01.png \
      --out public/fox-story/images/shot-01.webp

  # B) 使用用户提供的 OpenAI 兼容生图 API Key 生成并落位
  python3 image_api_helper.py --provider openai \
      --api-key "$IMAGE_API_KEY" \
      --base-url "https://api.openai.com/v1" \
      --model "dall-e-3" \
      --size "1792x1024" \
      --prompt "柔和绘本手绘水彩质感..." \
      --out public/fox-story/images/shot-01.webp
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

HTTP_TIMEOUT = 120.0


def log(msg: str) -> None:
    print(f"[image_helper] {msg}", file=sys.stderr)


def convert_to_webp(
    src_path: Path,
    out_path: Path,
    quality: int = 85,
    width: int | None = None,
    height: int | None = None,
) -> None:
    """使用 ffmpeg 将输入图像转为高画质 WebP（若已是合格 webp 且无需缩放则直接复制）。"""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        shutil.copy2(src_path, out_path)
        return

    cmd = [ffmpeg, "-y", "-v", "error", "-i", str(src_path)]
    if width and height:
        cmd += [
            "-vf",
            f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}",
        ]
    if out_path.suffix.lower() == ".webp":
        cmd += ["-c:v", "libwebp", "-quality", str(quality)]
    cmd.append(str(out_path))

    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg 转换 WebP 失败 ({src_path} -> {out_path}): {proc.stderr.strip()}")


def generate_via_openai_compatible(
    prompt: str,
    api_key: str,
    base_url: str = "https://api.openai.com/v1",
    model: str = "dall-e-3",
    size: str = "1792x1024",
) -> bytes:
    """调用 OpenAI 兼容的 /v1/images/generations 接口返回图片二进制。"""
    clean_base = base_url.rstrip("/")
    if clean_base.endswith("/images/generations"):
        url = clean_base
    elif clean_base.endswith("/v1"):
        url = f"{clean_base}/images/generations"
    else:
        url = f"{clean_base}/v1/images/generations"

    payload = {
        "model": model,
        "prompt": prompt,
        "n": 1,
        "size": size,
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:600]
        raise RuntimeError(f"生图 API 请求失败 HTTP {e.code} ({url}): {detail}") from e

    items = body.get("data") or []
    if not items:
        raise RuntimeError(f"生图 API 未返回 data 字段: {str(body)[:400]}")

    first = items[0]
    if first.get("b64_json"):
        return base64.b64decode(first["b64_json"])
    if first.get("url"):
        img_url = first["url"]
        with urllib.request.urlopen(img_url, timeout=HTTP_TIMEOUT) as img_resp:
            return img_resp.read()
    raise RuntimeError(f"无法识别的生图响应格式: {str(first)[:400]}")


def generate_via_gemini(
    prompt: str,
    api_key: str,
    model: str = "imagen-3.0-generate-002",
    aspect_ratio: str = "16:9",
) -> bytes:
    """调用 Google Gemini / Imagen API 生成图片二进制。"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:predict?key={api_key}"
    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": aspect_ratio,
        },
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:600]
        raise RuntimeError(f"Gemini Imagen 请求失败 HTTP {e.code}: {detail}") from e

    preds = body.get("predictions") or []
    if not preds or not preds[0].get("bytesBase64Encoded"):
        raise RuntimeError(f"Gemini Imagen 未返回有效图像: {str(body)[:400]}")
    return base64.b64decode(preds[0]["bytesBase64Encoded"])


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="手绘水彩故事视频 Skill 图像生成与 WebP 优化落位工具"
    )
    parser.add_argument(
        "--convert-in",
        help="将已生成的本地图片（如 Agent generate_image 产物）转换并落位到 --out",
    )
    parser.add_argument(
        "--provider",
        choices=["openai", "gemini"],
        default="openai",
        help="外部生图 API 类型：openai（兼容接口）或 gemini",
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("IMAGE_API_KEY"),
        help="外部生图 API Key",
    )
    parser.add_argument(
        "--base-url",
        default=os.environ.get("IMAGE_BASE_URL", "https://api.openai.com/v1"),
        help="OpenAI 兼容接口的 Base URL",
    )
    parser.add_argument(
        "--model",
        default=os.environ.get("IMAGE_MODEL", "dall-e-3"),
        help="生图模型名称",
    )
    parser.add_argument("--size", default="1792x1024", help="OpenAI 兼容接口图像尺寸")
    parser.add_argument("--aspect-ratio", default="16:9", help="Gemini 接口画面比例")
    parser.add_argument("--prompt", help="生图提示词")
    parser.add_argument("--prompt-file", help="从文本文件读取生图提示词")
    parser.add_argument("--out", required=True, help="输出文件路径（建议 public/<story>/images/shot-XX.webp）")
    parser.add_argument("--quality", type=int, default=85, help="WebP 质量（1~100，默认 85）")
    parser.add_argument("--width", type=int, help="可选：统一输出宽度（如 1920）")
    parser.add_argument("--height", type=int, help="可选：统一输出高度（如 1080）")
    args = parser.parse_args(argv)

    out_path = Path(args.out)

    if args.convert_in:
        src = Path(args.convert_in)
        if not src.exists():
            raise SystemExit(f"找不到输入图片: {src}")
        convert_to_webp(src, out_path, quality=args.quality, width=args.width, height=args.height)
        log(f"已转换落位: {out_path} ({out_path.stat().st_size} bytes)")
        print(json.dumps({"status": "ok", "out": str(out_path), "size": out_path.stat().st_size}))
        return 0

    prompt = args.prompt
    if args.prompt_file:
        prompt = Path(args.prompt_file).read_text(encoding="utf-8").strip()
    if not prompt:
        raise SystemExit("外部 API 生图必须提供 --prompt 或 --prompt-file（若转换已有图片请用 --convert-in）")
    if not args.api_key:
        raise SystemExit("外部 API 生图必须提供 --api-key 或环境变量 IMAGE_API_KEY")

    log(f"正在调用外部生图接口 ({args.provider} / {args.model})...")
    if args.provider == "gemini":
        raw_bytes = generate_via_gemini(
            prompt=prompt,
            api_key=args.api_key,
            model=args.model,
            aspect_ratio=args.aspect_ratio,
        )
    else:
        raw_bytes = generate_via_openai_compatible(
            prompt=prompt,
            api_key=args.api_key,
            base_url=args.base_url,
            model=args.model,
            size=args.size,
        )

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp.write(raw_bytes)
        tmp_path = Path(tmp.name)

    try:
        convert_to_webp(tmp_path, out_path, quality=args.quality, width=args.width, height=args.height)
    finally:
        tmp_path.unlink(missing_ok=True)

    log(f"生成并转换完成: {out_path} ({out_path.stat().st_size} bytes)")
    print(json.dumps({"status": "ok", "out": str(out_path), "size": out_path.stat().st_size}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
