#!/usr/bin/env python3
"""
check-assets.py — 静态资产规范校验（零依赖，Python 3.8+）

校验 AGENTS.md §1.4「静态资产三层分离 + 运行时资源分目录 + 压缩门禁」是否被遵守：

  1. 命名规范：public/ 每段只用小写英文、数字、`-`、`_`、`.`，禁止中文/空格/大写
  2. 禁止平铺：public/ 根下不得直接放文件，必须进 <video-name>/<type>/ 或 _shared/<type>/
  3. 子目录白名单：public/<video-name>/ 下只允许 audio/ images/ fonts/ video/
  4. 压缩门禁：超过类型阈值（图 500 KB / 音 2 MB / 视 8 MB）的文件必须是已压缩格式
  5. 绝对上限：任何单文件不得超过硬上限（图 2 MB / 音 8 MB / 视 32 MB）
  6. staticFile() 引用完整性：src 中引用的文件必须存在于 public/
  7. 孤儿资产：public/ 中存在但代码从未引用的文件（仅告警）
  8. 素材清单：assets/<VideoName>/ 必须有 README.md
  9. 素材未入库：assets/ 下除 README.md 与 _template/ 外不得被 git 跟踪

阈值与类型规则统一来自 `scripts/asset_rules.py`（与 compress-assets.py 共用）。

用法：
    python3 scripts/check-assets.py                # 全量校验，有错误退出码 1
    python3 scripts/check-assets.py --quiet        # 只输出错误与告警
    python3 scripts/check-assets.py --max-mb 20    # 临时放宽阈值（排障用，不建议提交前使用）

退出码：0 = 全部通过；1 = 存在错误（错误可阻断 CI）。
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import asset_rules as R  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"
ASSETS_DIR = ROOT / "assets"
SRC_DIR = ROOT / "src"

STATIC_FILE_CALL = re.compile(r"staticFile\(\s*[`'\"]([^`'\"]+)[`'\"]\s*\)")

errors: list[str] = []
warnings: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


def log(msg: str, quiet: bool = False) -> None:
    if not quiet:
        print(msg)


def public_files():
    """遍历 public/ 下所有文件，产出 (Path, 相对 posix 路径, 路径片段元组)。"""
    if not PUBLIC_DIR.is_dir():
        return
    for path in sorted(PUBLIC_DIR.rglob("*")):
        if not path.is_file() or path.name.startswith("."):
            continue
        rel = path.relative_to(PUBLIC_DIR)
        yield path, rel.as_posix(), rel.parts


# --------------------------------------------------------------------------- #
# 1. 命名
# --------------------------------------------------------------------------- #
def check_public_names(quiet: bool) -> None:
    log("→ 校验 public/ 命名规范", quiet)
    if not PUBLIC_DIR.is_dir():
        warn("public/ 不存在，跳过命名校验")
        return
    for _path, rel_posix, _parts in public_files():
        bad = R.bad_segments(rel_posix)
        if bad:
            err(
                f"命名不合规：public/{rel_posix}（违规片段：{', '.join(bad)}）\n"
                "   规则：每段只用小写英文、数字、'-'、'_'、'.'，禁止中文/空格/大写字母"
            )


# --------------------------------------------------------------------------- #
# 2. 禁止平铺 + 3. 子目录白名单
# --------------------------------------------------------------------------- #
def check_layout(quiet: bool) -> None:
    log("→ 校验运行时资产分目录（禁止平铺）", quiet)
    if not PUBLIC_DIR.is_dir():
        return
    for _path, rel_posix, parts in public_files():
        if R.is_flat(parts):
            err(
                f"平铺文件：public/{rel_posix}\n"
                "   规则：public/ 根目录不得直接放文件，必须放进 "
                "public/<video-name>/<type>/ 或 public/_shared/<type>/\n"
                "   处理：python3 scripts/compress-assets.py "
                f"--in public/{rel_posix} --video <VideoName> --force"
            )
            continue
        group = parts[0]
        if len(parts) >= 3:
            subdir = parts[1]
            if subdir not in R.ALLOWED_SUBDIRS:
                err(
                    f"子目录不合规：public/{rel_posix}\n"
                    f"   {group}/ 下只允许 {' / '.join(sorted(R.ALLOWED_SUBDIRS))}，"
                    f"实际是 {subdir}/"
                )
        elif len(parts) == 2 and group != R.SHARED_DIR:
            warn(
                f"建议分类型：public/{rel_posix} 直接放在 {group}/ 下\n"
                f"   建议移到 {group}/{'images' if R.kind_of(Path(rel_posix)) == 'image' else 'audio'}/ 等子目录"
            )


# --------------------------------------------------------------------------- #
# 4. 压缩门禁 + 5. 绝对上限
# --------------------------------------------------------------------------- #
def check_compression(max_mb_override: float | None, quiet: bool) -> None:
    label = (
        f"全类型 {max_mb_override:g} MB（--max-mb 覆盖）"
        if max_mb_override is not None
        else "图 500 KB / 音 2 MB / 视 8 MB"
    )
    log(f"→ 校验压缩门禁（阈值：{label}）", quiet)
    if not PUBLIC_DIR.is_dir():
        return

    for path, rel_posix, _parts in public_files():
        kind = R.kind_of(path)
        if kind is None:
            continue
        size = path.stat().st_size
        ext = path.suffix.lower()
        threshold = (
            int(max_mb_override * 1024 * 1024)
            if max_mb_override is not None
            else R.THRESHOLDS[kind]
        )
        ceiling = R.HARD_CEILING[kind]

        if size > ceiling:
            err(
                f"超出绝对上限：public/{rel_posix} = {R.human(size)} > {R.human(ceiling)}（{kind}）\n"
                "   处理：切成片段、缩短时长或降码率后重新压缩"
            )
            continue

        if size <= threshold:
            if ext not in R.RUNTIME_OK:
                warn(
                    f"未压缩但未超标：public/{rel_posix} = {R.human(size)}（{ext}）\n"
                    f"   可选优化：python3 scripts/compress-assets.py --in public/{rel_posix} "
                    f"--out public/{Path(rel_posix).parent.as_posix()}/{path.stem}{R.TARGET_EXT[kind]} --force"
                )
            continue

        if ext in R.RUNTIME_OK:
            err(
                f"已压缩但仍超标：public/{rel_posix} = {R.human(size)} > {R.human(threshold)}（{kind}）\n"
                "   处理：降低质量参数（图片 --quality 70 / 音频 --bitrate 128k / "
                "视频 --crf 23）或缩短时长、降低分辨率后重跑 compress-assets.py"
            )
        else:
            err(
                f"超阈值未压缩：public/{rel_posix} = {R.human(size)} > {R.human(threshold)}（{kind}，格式 {ext}）\n"
                f"   规则：超过阈值的素材必须先压缩为 {R.TARGET_EXT[kind]} 才能进入 public/\n"
                f"   处理：python3 scripts/compress-assets.py --in <素材> --video <VideoName> --force"
            )


# --------------------------------------------------------------------------- #
# 6. staticFile() 引用
# --------------------------------------------------------------------------- #
def collect_static_refs() -> set[str]:
    refs: set[str] = set()
    if not SRC_DIR.is_dir():
        return refs
    for path in SRC_DIR.rglob("*"):
        if path.suffix not in {".ts", ".tsx", ".js", ".jsx"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        for match in STATIC_FILE_CALL.finditer(text):
            refs.add(match.group(1).strip())
    return refs


def check_static_refs(quiet: bool) -> set[str]:
    log("→ 校验 staticFile() 引用完整性", quiet)
    refs = collect_static_refs()
    if not refs:
        log("  （src/ 中未发现 staticFile() 引用）", quiet)
    for ref in sorted(refs):
        if ref.startswith("/"):
            err(f"引用路径不得以 '/' 开头：staticFile(\"{ref}\")")
            continue
        if ".." in Path(ref).parts:
            err(f"引用路径不得越出 public/：staticFile(\"{ref}\")")
            continue
        if len(Path(ref).parts) < 2:
            err(
                f"引用未带子目录前缀：staticFile(\"{ref}\")\n"
                "   规则：必须写成 staticFile(\"<video-name>/<type>/<file>\") 或 "
                "staticFile(\"_shared/<type>/<file>\")"
            )
            continue
        if not (PUBLIC_DIR / ref).is_file():
            err(
                f"引用缺失：staticFile(\"{ref}\") → public/{ref} 不存在\n"
                "   处理：把加工后的文件放到该路径，或修正引用"
            )
    return refs


# --------------------------------------------------------------------------- #
# 7. 孤儿资产
# --------------------------------------------------------------------------- #
def check_orphans(refs: set[str], quiet: bool) -> None:
    log("→ 检查孤儿资产（public/ 中存在但未被 staticFile 引用）", quiet)
    for _path, rel_posix, _parts in public_files():
        if rel_posix not in refs:
            warn(
                f"孤儿资产：public/{rel_posix} 未被任何 staticFile() 引用\n"
                "   若为动态拼接路径可忽略；否则删除或补上引用"
            )


# --------------------------------------------------------------------------- #
# 8. 素材清单
# --------------------------------------------------------------------------- #
def check_asset_manifests(quiet: bool) -> None:
    log("→ 校验 assets/ 素材清单", quiet)
    if not ASSETS_DIR.is_dir():
        warn("assets/ 不存在，跳过素材清单校验")
        return
    for child in sorted(ASSETS_DIR.iterdir()):
        if not child.is_dir() or child.name.startswith("_"):
            continue
        if not (child / "README.md").is_file():
            err(
                f"缺少素材清单：assets/{child.name}/README.md\n"
                "   处理：复制 assets/_template/README.md 并填写素材来源与授权"
            )


# --------------------------------------------------------------------------- #
# 9. 素材未入库
# --------------------------------------------------------------------------- #
def check_assets_not_tracked(quiet: bool) -> None:
    log("→ 校验 assets/ 未入库", quiet)
    if not ASSETS_DIR.is_dir():
        return
    try:
        out = subprocess.run(
            ["git", "-c", f"safe.directory={ROOT}", "ls-files", "--", "assets"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=30,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        warn(f"无法执行 git（跳过入库校验）：{exc}")
        return
    if out.returncode != 0:
        warn(f"git ls-files 失败（跳过入库校验）：{out.stderr.strip()[:200]}")
        return
    for line in out.stdout.splitlines():
        tracked = line.strip()
        if not tracked:
            continue
        parts = Path(tracked).parts
        # 允许：assets/README.md、assets/_template/**、assets/_inbox/.gitkeep
        if len(parts) >= 2 and parts[1] == "_template":
            continue
        if tracked in {"assets/README.md", "assets/_inbox/.gitkeep"}:
            continue
        err(
            f"素材被误入库：{tracked}\n"
            "   规则：assets/ 只提交 README.md 与 _template/；原始素材不入 git。"
            f"执行：git rm --cached \"{tracked}\""
        )


# --------------------------------------------------------------------------- #
def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="校验 public/ 与 assets/ 是否遵守静态资产规范（AGENTS.md §1.4）。",
    )
    parser.add_argument(
        "--max-mb",
        type=float,
        default=None,
        help="临时用同一阈值覆盖所有类型（排障用，不改变规范）",
    )
    parser.add_argument("--quiet", action="store_true", help="只输出错误与告警")
    args = parser.parse_args(argv)

    print("静态资产规范校验")
    print(f"仓库根：{ROOT}")
    print("-" * 60)

    check_public_names(args.quiet)
    check_layout(args.quiet)
    check_compression(args.max_mb, args.quiet)
    refs = check_static_refs(args.quiet)
    check_orphans(refs, args.quiet)
    check_asset_manifests(args.quiet)
    check_assets_not_tracked(args.quiet)

    print("-" * 60)
    for w in warnings:
        print(f"[WARN] {w}")
    for e in errors:
        print(f"[ERROR] {e}")
    if errors:
        print(f"\n✗ 校验失败：{len(errors)} 个错误，{len(warnings)} 个告警")
        return 1
    print(f"\n✓ 校验通过（{len(warnings)} 个告警）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
