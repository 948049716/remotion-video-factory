#!/usr/bin/env python3
"""
check-assets.py — 静态资产规范校验（零依赖，Python 3.8+）

校验 AGENTS.md §1.6「静态资产三层分离」是否被遵守：

  1. public/ 命名：只用小写英文、数字、`-`、`_`、`.`，禁止中文/空格/大写
  2. public/ 体积：单文件 ≤ 10 MB
  3. staticFile() 引用完整性：src 中引用的文件必须存在于 public/
  4. 孤儿资产：public/ 中存在但代码从未引用的文件
  5. 素材清单：assets/<VideoName>/ 必须有 README.md
  6. 素材未入库：assets/ 下除 README.md 与 _template/ 外不得被 git 跟踪

用法：
    python3 scripts/check-assets.py                # 全量校验，有错误退出码 1
    python3 scripts/check-assets.py --quiet        # 只输出错误
    python3 scripts/check-assets.py --max-mb 20    # 放宽单文件体积上限

退出码：0 = 全部通过；1 = 存在错误（错误可阻断 CI）。
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"
ASSETS_DIR = ROOT / "assets"
SRC_DIR = ROOT / "src"

# 单段路径允许的字符：小写字母、数字、- _ .（允许以 _ 开头，如 _shared/）
SAFE_SEGMENT = re.compile(r"^[a-z0-9_][a-z0-9._-]*$")
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


def rel(p: Path) -> str:
    try:
        return str(p.relative_to(ROOT))
    except ValueError:
        return str(p)


def check_public_names(quiet: bool) -> None:
    """public/ 下的路径必须是安全的 ASCII 小写命名。"""
    log("→ 校验 public/ 命名规范", quiet)
    if not PUBLIC_DIR.is_dir():
        warn("public/ 不存在，跳过命名校验")
        return
    for path in sorted(PUBLIC_DIR.rglob("*")):
        if not path.is_file():
            continue
        rel_posix = path.relative_to(PUBLIC_DIR).as_posix()
        bad = [seg for seg in rel_posix.split("/") if not SAFE_SEGMENT.match(seg)]
        if bad:
            err(
                f"命名不合规：public/{rel_posix}（违规片段：{', '.join(bad)}）\n"
                "   规则：每段只用小写英文、数字、'-'、'_'、'.'，禁止中文/空格/大写字母"
            )


def check_public_sizes(max_mb: float, quiet: bool) -> None:
    """public/ 单文件体积上限。"""
    log(f"→ 校验 public/ 体积上限（{max_mb:g} MB）", quiet)
    if not PUBLIC_DIR.is_dir():
        return
    limit = int(max_mb * 1024 * 1024)
    for path in sorted(PUBLIC_DIR.rglob("*")):
        if not path.is_file():
            continue
        size = path.stat().st_size
        if size > limit:
            err(
                f"体积超标：public/{path.relative_to(PUBLIC_DIR).as_posix()} "
                f"= {size / 1024 / 1024:.1f} MB > {max_mb:g} MB\n"
                "   处理：切成片段、降码率或改放到 assets/ 作为素材保留"
            )


def collect_static_refs() -> set[str]:
    """扫描 src/ 下所有 staticFile() 字面量引用。"""
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
    """引用的文件必须存在，且路径不得以 / 开头或含 .. 。"""
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
        target = PUBLIC_DIR / ref
        if not target.is_file():
            err(
                f"引用缺失：staticFile(\"{ref}\") → public/{ref} 不存在\n"
                "   处理：把加工后的文件放到该路径，或修正引用"
            )
    return refs


def check_orphans(refs: set[str], quiet: bool) -> None:
    """public/ 中未被任何代码引用的文件（仅告警，因为可能被动态拼接引用）。"""
    log("→ 检查孤儿资产（public/ 中存在但未被 staticFile 引用）", quiet)
    if not PUBLIC_DIR.is_dir():
        return
    for path in sorted(PUBLIC_DIR.rglob("*")):
        if not path.is_file():
            continue
        rel_posix = path.relative_to(PUBLIC_DIR).as_posix()
        if rel_posix not in refs:
            warn(
                f"孤儿资产：public/{rel_posix} 未被任何 staticFile() 引用\n"
                "   若为动态拼接路径可忽略；否则删除或补上引用"
            )


def check_asset_manifests(quiet: bool) -> None:
    """assets/<VideoName>/ 必须有 README.md 素材清单。"""
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


def check_assets_not_tracked(quiet: bool) -> None:
    """assets/ 下除 README.md 与 _template/ 外不得被 git 跟踪。"""
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
        # 允许：assets/README.md、assets/_template/**
        if len(parts) >= 2 and parts[1] == "_template":
            continue
        if tracked in {"assets/README.md"}:
            continue
        err(
            f"素材被误入库：{tracked}\n"
            "   规则：assets/ 只提交 README.md 与 _template/；"
            "原始素材不入 git。执行：git rm --cached \"{0}\"".format(tracked)
        )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="校验 public/ 与 assets/ 是否遵守静态资产规范（AGENTS.md §1.6）。",
    )
    parser.add_argument("--max-mb", type=float, default=10.0, help="public/ 单文件体积上限（MB）")
    parser.add_argument("--quiet", action="store_true", help="只输出错误与告警")
    args = parser.parse_args(argv)

    print("静态资产规范校验")
    print(f"仓库根：{ROOT}")
    print("-" * 60)

    check_public_names(args.quiet)
    check_public_sizes(args.max_mb, args.quiet)
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
