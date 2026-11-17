#!/usr/bin/env python3
"""
layer_helper.py — 手绘水彩故事视频 Skill 2D 分层素材提取与背景修补工具

用于在制作「混合 2D 分层动画」时处理角色/道具透明图层（支持带 Alpha 通道的 RGBA WebP 与 PNG，推荐大面积图层优先输出 RGBA `.webp` 以控制单文件 < 500 KB）：
  1. --extract-white-bg:
     将纯白/浅色纸底上生成的独立水彩角色或零件图，转换为带平滑抗锯齿 Alpha 透明通道的 RGBA WebP/PNG
     （保留水彩铅笔勾线与柔和晕染边缘，去除白色纸底）。
  2. --split-src + --spec:
     根据 JSON 定义的多边形/矩形区域，从一张完整水彩原画中分离出独立可动透明图层，
     并采用「多尺度 Push-Pull + 9点各向同性调和拉普拉斯扩散 + 水彩纸纹合成」算法修补被遮挡的背景区域，输出干净背景。
  3. --verify-layer:
     检查指定图层文件（WebP/PNG）是否具备有效透明通道、尺寸及非空像素比例。
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter
except ImportError as exc:
    raise SystemExit(
        f"缺少图像处理依赖 ({exc})，请使用:\n"
        "  uv run --with pillow --with numpy python3 layer_helper.py ..."
    )


def log(msg: str) -> None:
    print(f"[layer_helper] {msg}", file=sys.stderr)


def extract_white_background(
    src_path: Path,
    out_path: Path,
    white_threshold: int = 238,
    softness: int = 22,
) -> dict:
    """
    从纯白/浅纸底水彩画中提取带透明通道的前景角色/部件图层。
    采用“外围连通区域洪水填充 + 边缘柔化”策略，避免误伤人物内部的白色高光或白衬衫。
    """
    img = Image.open(src_path).convert("RGBA")
    arr = np.asarray(img, dtype=np.float32)
    h, w, _ = arr.shape

    rgb = arr[..., :3]
    lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    chroma = rgb.max(axis=-1) - rgb.min(axis=-1)
    is_paper = (lum >= white_threshold) & (chroma <= 24)

    visited = np.zeros((h, w), dtype=bool)
    queue: list[tuple[int, int]] = []

    for x in range(w):
        if is_paper[0, x]:
            visited[0, x] = True
            queue.append((0, x))
        if is_paper[h - 1, x] and not visited[h - 1, x]:
            visited[h - 1, x] = True
            queue.append((h - 1, x))
    for y in range(h):
        if is_paper[y, 0] and not visited[y, 0]:
            visited[y, 0] = True
            queue.append((y, 0))
        if is_paper[y, w - 1] and not visited[y, w - 1]:
            visited[y, w - 1] = True
            queue.append((y, w - 1))

    idx = 0
    while idx < len(queue):
        cy, cx = queue[idx]
        idx += 1
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_paper[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))

    alpha = np.where(visited, 0.0, 255.0).astype(np.uint8)
    alpha_img = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(radius=1.0))

    soft_alpha = np.asarray(alpha_img, dtype=np.float32)
    if softness > 0:
        edge_zone = (soft_alpha > 0) & (soft_alpha < 250) & (lum > white_threshold - softness)
        fade = np.clip((white_threshold - lum) / max(1, softness), 0.0, 1.0) * 255.0
        soft_alpha = np.where(edge_zone, np.minimum(soft_alpha, fade), soft_alpha)

    arr[..., 3] = np.clip(soft_alpha, 0, 255)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_img = Image.fromarray(arr.astype(np.uint8), mode="RGBA")
    if out_path.suffix.lower() == ".webp":
        out_img.save(out_path, "WEBP", quality=92, method=6, exact=True)
    else:
        out_img.save(out_path, "PNG")
    fg_ratio = float((arr[..., 3] > 20).mean())
    return {"out": str(out_path), "width": w, "height": h, "foregroundRatio": round(fg_ratio, 4)}


def _blur3x3_float(arr: np.ndarray) -> np.ndarray:
    """Separable [1, 2, 1] / 4 binomial blur for float32 HxW or HxWxC arrays."""
    p = np.pad(arr, ((1, 1), (1, 1)) + (() if arr.ndim == 2 else ((0, 0),)), mode="edge")
    horiz = 0.25 * p[:, :-2] + 0.5 * p[:, 1:-1] + 0.25 * p[:, 2:]
    return 0.25 * horiz[:-2] + 0.5 * horiz[1:-1] + 0.25 * horiz[2:]


def _laplace_9pt(arr: np.ndarray) -> np.ndarray:
    """Isotropic Mehrstellen 9-point harmonic average: zero directional bias / zero streaks."""
    p = np.pad(arr, ((1, 1), (1, 1)) + (() if arr.ndim == 2 else ((0, 0),)), mode="edge")
    cardinal = p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]
    diag = p[:-2, :-2] + p[:-2, 2:] + p[2:, :-2] + p[2:, 2:]
    return (4.0 * cardinal + diag) / 20.0


def inpaint_masked_region(img: Image.Image, mask: Image.Image, dilate_size: int = 9) -> Image.Image:
    """
    多尺度 Push-Pull 归一化高斯金字塔 + 9点各向同性调和拉普拉斯扩散（Harmonic Laplace）+ 水彩纸纹还原。
    彻底消除传统剥洋葱算法的放射状斜条纹（Starburst）与色块撕裂，使遮挡修补区呈现柔和自然的水彩过渡。
    """
    base_rgba = img.convert("RGBA")
    w, h = base_rgba.size
    mask_bin = Image.fromarray(
        np.where(np.asarray(mask.convert("L"), dtype=np.uint8) > 20, 255, 0).astype(np.uint8),
        mode="L",
    )
    dilated = mask_bin.filter(ImageFilter.MaxFilter(size=max(3, dilate_size))) if dilate_size >= 3 else mask_bin
    dilated_arr = np.asarray(dilated, dtype=np.uint8) > 128

    if not dilated_arr.any():
        return base_rgba

    # 在 1/2 工作分辨率上构建多尺度金字塔（兼顾精度与速度）
    sw, sh = max(32, w // 2), max(32, h // 2)
    base_small = np.asarray(
        base_rgba.convert("RGB").resize((sw, sh), Image.Resampling.BILINEAR),
        dtype=np.float32,
    )
    hole_small = (
        np.asarray(
            Image.fromarray((dilated_arr * 255).astype(np.uint8), mode="L").resize(
                (sw, sh), Image.Resampling.NEAREST
            ),
            dtype=np.uint8,
        )
        > 128
    )

    # 1. Push 阶段：构建归一化加权高斯金字塔至最粗糙层
    pyr_known: list[np.ndarray] = []
    pyr_rgb: list[np.ndarray] = []
    cur_hole = hole_small.copy()
    cur_known = (~cur_hole).astype(np.float32)
    cur_num = base_small * cur_known[..., None]

    while True:
        pyr_known.append(cur_hole)
        den_safe = np.maximum(cur_known, 1e-6)
        pyr_rgb.append(cur_num / den_safe[..., None])

        ch, cw = cur_hole.shape
        if cw <= 24 or ch <= 16:
            break

        # 平滑降采样 (2x)
        num_blur = _blur3x3_float(cur_num)
        den_blur = _blur3x3_float(cur_known)
        nh, nw = max(8, ch // 2), max(12, cw // 2)
        cur_num = np.stack(
            [
                np.asarray(
                    Image.fromarray(num_blur[..., c], mode="F").resize((nw, nh), Image.Resampling.BILINEAR),
                    dtype=np.float32,
                )
                for c in range(3)
            ],
            axis=-1,
        )
        cur_known = np.asarray(
            Image.fromarray(den_blur, mode="F").resize((nw, nh), Image.Resampling.BILINEAR),
            dtype=np.float32,
        )
        cur_hole = cur_known < 0.35

    # 最粗糙层全局补全（高斯加权推到无穷域）
    u = pyr_rgb[-1].copy()
    coarse_known = ~pyr_known[-1]
    if pyr_known[-1].any() and coarse_known.any():
        mean_col = u[coarse_known].mean(axis=0)
        u = np.where((pyr_known[-1] & ~coarse_known)[..., None], mean_col, u)
        for _ in range(30):
            avg = _laplace_9pt(u)
            u = np.where(pyr_known[-1][..., None], avg, u)

    # 2. Pull + 各向同性调和拉普拉斯弛豫：逐层上采样并在洞内求解 ∇²u = 0
    for lvl in range(len(pyr_known) - 2, -1, -1):
        th, tw = pyr_known[lvl].shape
        u = np.stack(
            [
                np.asarray(
                    Image.fromarray(u[..., c], mode="F").resize((tw, th), Image.Resampling.BILINEAR),
                    dtype=np.float32,
                )
                for c in range(3)
            ],
            axis=-1,
        )
        hole_lvl = pyr_known[lvl]
        known_val = pyr_rgb[lvl]
        # 高分率层适量迭代（粗层 28 次消除低频块，细层 14~22 次平滑高精边界）
        iters = 28 if max(tw, th) <= 260 else (20 if max(tw, th) <= 520 else 16)
        mask3 = hole_lvl[..., None]
        u = np.where(mask3, u, known_val)
        for _ in range(iters):
            avg = _laplace_9pt(u)
            u = np.where(mask3, avg, known_val)

    # 3. 恢复原尺寸并叠加温和的水彩冷压纸纹颗粒
    filled_img = Image.fromarray(np.clip(u, 0, 255).astype(np.uint8), mode="RGB").resize(
        (w, h), Image.Resampling.BICUBIC
    )
    filled_soft = filled_img.filter(ImageFilter.GaussianBlur(radius=1.8))

    rng = np.random.default_rng(77)
    grain_raw = rng.normal(0.0, 4.2, (h, w)).astype(np.float32)
    grain_soft = _blur3x3_float(grain_raw)[..., None]
    filled_arr = np.clip(np.asarray(filled_soft, dtype=np.float32) + grain_soft, 0, 255)

    base_rgb = np.asarray(base_rgba.convert("RGB"), dtype=np.float32)
    soft_mask = (
        np.asarray(dilated.filter(ImageFilter.GaussianBlur(radius=3.2)), dtype=np.float32) / 255.0
    )[..., None]

    blended_rgb = base_rgb * (1.0 - soft_mask) + filled_arr * soft_mask
    out_rgba = np.dstack(
        [np.clip(blended_rgb, 0, 255).astype(np.uint8), np.full((h, w), 255, dtype=np.uint8)]
    )
    return Image.fromarray(out_rgba, mode="RGBA")


def split_layers_from_spec(src_path: Path, spec_path: Path) -> dict:
    """
    根据 JSON 拆分清单从原画中切出多个透明可动部件图层，并生成修补后的干净背景图。
    """
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    src = Image.open(src_path).convert("RGBA")
    w, h = src.size
    out_dir = Path(spec["outDir"])
    out_dir.mkdir(parents=True, exist_ok=True)

    combined_inpaint_mask = Image.new("L", (w, h), 0)
    results = []

    for part in spec.get("parts", []):
        part_mask = Image.new("L", (w, h), 0)
        draw = ImageDraw.Draw(part_mask)
        for poly in part.get("polygons", []):
            pts = [tuple(map(int, p)) for p in poly]
            draw.polygon(pts, fill=255)
        for rect in part.get("rects", []):
            draw.rectangle(tuple(map(int, rect)), fill=255)
        for ell in part.get("ellipses", []):
            draw.ellipse(tuple(map(int, ell)), fill=255)

        feather = int(part.get("feather", 3))
        if feather > 0:
            part_mask = part_mask.filter(ImageFilter.GaussianBlur(radius=feather))

        if part.get("inpaintFromBg", True):
            combined_inpaint_mask = Image.fromarray(
                np.maximum(np.asarray(combined_inpaint_mask), np.asarray(part_mask)),
                mode="L",
            )

        src_arr = np.asarray(src, dtype=np.uint8)
        src_alpha = src_arr[..., 3].astype(np.float32)
        mask_arr = np.asarray(part_mask, dtype=np.float32)
        final_alpha = np.clip((src_alpha * mask_arr) / 255.0, 0, 255).astype(np.uint8)

        # 保留纯正未预乘(Straight Alpha)原画色彩，避免半透明羽化边缘混入黑色 (0,0,0) 形成黑边光晕；
        # 并在边缘外延 5px 保留原色供 WebP 压缩及双线性缩放采样，其余完全透明区归零以保持高压缩率。
        keep_rgb_mask = np.asarray(part_mask.filter(ImageFilter.MaxFilter(size=11)), dtype=np.uint8) > 0
        part_arr = np.zeros_like(src_arr)
        part_arr[keep_rgb_mask, :3] = src_arr[keep_rgb_mask, :3]
        part_arr[..., 3] = final_alpha
        part_img = Image.fromarray(part_arr, mode="RGBA")

        out_file = out_dir / part["out"]
        if out_file.suffix.lower() == ".webp":
            part_img.save(out_file, "WEBP", quality=92, method=6, exact=True)
        else:
            part_img.save(out_file, "PNG")
        results.append({"id": part["id"], "out": str(out_file)})

    clean_bg_name = spec.get("cleanBgOut")
    bg_out_path = None
    if clean_bg_name:
        dilate_size = int(spec.get("dilateSize", 9))
        bg_img = inpaint_masked_region(src, combined_inpaint_mask, dilate_size=dilate_size)
        bg_out_path = out_dir / clean_bg_name
        if bg_out_path.suffix.lower() == ".webp":
            bg_img.convert("RGB").save(bg_out_path, "WEBP", quality=85, method=6)
        else:
            bg_img.save(bg_out_path)

    return {
        "source": str(src_path),
        "cleanBg": str(bg_out_path) if bg_out_path else None,
        "parts": results,
    }


def verify_layer(path: Path) -> dict:
    img = Image.open(path)
    w, h = img.size
    has_alpha = "A" in img.getbands()
    opaque_ratio = 1.0
    if has_alpha:
        alpha = np.asarray(img.convert("RGBA"))[..., 3]
        opaque_ratio = float((alpha > 15).mean())
    return {
        "file": str(path),
        "width": w,
        "height": h,
        "mode": img.mode,
        "hasAlpha": has_alpha,
        "opaqueRatio": round(opaque_ratio, 4),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="手绘水彩 2D 分层透明图层提取与背景修补工具"
    )
    parser.add_argument("--extract-white-bg", help="输入白底水彩图路径，抠出带透明通道的 RGBA WebP/PNG")
    parser.add_argument("--out", help="输出路径（配合 --extract-white-bg）")
    parser.add_argument("--threshold", type=int, default=238, help="白底判定阈值 (0~255)")
    parser.add_argument("--split-src", help="输入完整分镜原画路径（配合 --spec 拆出分层与修补背景）")
    parser.add_argument("--spec", help="分层多边形/遮罩配置 JSON 路径")
    parser.add_argument("--verify-layer", help="检查单个图层文件的 Alpha 通道与尺寸")
    args = parser.parse_args(argv)

    if args.extract_white_bg:
        if not args.out:
            raise SystemExit("--extract-white-bg 必须同时指定 --out")
        res = extract_white_background(
            Path(args.extract_white_bg),
            Path(args.out),
            white_threshold=args.threshold,
        )
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.split_src:
        if not args.spec:
            raise SystemExit("--split-src 必须同时指定 --spec")
        res = split_layers_from_spec(Path(args.split_src), Path(args.spec))
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.verify_layer:
        res = verify_layer(Path(args.verify_layer))
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
