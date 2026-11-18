#!/usr/bin/env python3
"""
flow_pack_helper.py — Google Flow 投喂包构建器、五段式提示词守卫、可视化工作台与云盘同步工具

核心职责：
  1. --init:
     从 docs/<story-slug>/tts-manifest.json 初始化 docs/<story-slug>/flow-manifest.json，
     自动根据每镜实测配音时长推荐 Google Flow 生成秒数 (4s / 6s / 8s)，并标记超长需拆分镜头 (> 8.2s)。
  2. --validate:
     校验每镜 Google Flow 提示词是否符合 Veo 3.1 / Omni Flash 五段式最佳实践：
       - 明确机位/运镜指令 (Camera cue)
       - 2D 手绘水彩锁风词 (Style lock)
       - 禁烧录字幕与音频防污染尾缀 (No subtitles / Audio guard)
       - 生成时长是否足以覆盖中文 TTS 配音
  3. --build-pack:
     一键产出完整的 Google Flow 投喂包：
       - 整理首帧/尾帧/参考主体图至 assets/<StoryName>/flow-pack/frames/
       - 创建视频回传收件箱 assets/<StoryName>/flow-inbox/ 与合规 assets/<StoryName>/README.md
       - 输出 Markdown 清单 docs/<story-slug>/flow-prompts.md
       - 输出带缩略图预览、参数标签、一键复制按钮与进度勾选的交互式工作台 assets/<StoryName>/flow-pack/flow-workbench.html
  4. --gdrive-push / --gdrive-pull:
     通过已连接的 gdrive CLI 将投喂包推送到指定 Google Drive 文件夹，或将用户生成的 .mp4 批量拉回 flow-inbox/。
"""

from __future__ import annotations

import argparse
import base64
import html
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

DEFAULT_STYLE_LOCK = (
    "Hand-painted 2D watercolor storybook animation, cold-pressed paper grain, "
    "consistent ink-and-colored-pencil linework, subtle 2D cel motion, warm artisanal palette."
)

DEFAULT_AUDIO_GUARD_AMBIENT = (
    "No dialogue, no speech, no background music, no subtitles, no on-screen text."
)

DEFAULT_AUDIO_GUARD_SPEECH = (
    "No background music, no subtitles, no on-screen text, no watermark."
)

CAMERA_KEYWORDS = (
    "shot",
    "camera",
    "static",
    "push",
    "pull",
    "pan",
    "tilt",
    "close-up",
    "closeup",
    "wide",
    "medium",
    "aerial",
    "tracking",
    "dolly",
    "locked-off",
)

STYLE_KEYWORDS = (
    "watercolor",
    "storybook",
    "hand-painted",
    "hand-drawn",
    "2d",
    "illustration",
    "cel",
    "ink",
)

CJK_RE = re.compile(r"[\u4e00-\u9fff]")


def log(msg: str) -> None:
    print(f"[flow_pack] {msg}", file=sys.stderr)


def pascal_from_slug(slug: str) -> str:
    return "".join(part.capitalize() for part in re.split(r"[^a-zA-Z0-9]+", slug) if part) or "StoryVideo"


def recommend_flow_seconds(dur_sec: float) -> int:
    """Google Flow 标准时长档位为 4 / 6 / 8 秒。"""
    if dur_sec <= 3.8:
        return 4
    if dur_sec <= 5.8:
        return 6
    return 8


def compose_five_part_prompt(shot: dict[str, Any]) -> str:
    """将结构化五段字段拼接为可直接粘贴进 Google Flow 的英文提示词。"""
    existing = str(shot.get("motionPrompt") or "").strip()
    if existing:
        return existing

    camera = str(shot.get("camera") or "Static medium shot.").strip()
    action = str(
        shot.get("action")
        or "The character performs one gentle, natural continuous motion matching the scene."
    ).strip()
    micro = str(
        shot.get("microPhysics")
        or "Subtle ambient motion in the background, warm soft lighting gently breathing."
    ).strip()
    style = str(shot.get("styleLock") or DEFAULT_STYLE_LOCK).strip()
    ambient = str(shot.get("ambientSfx") or "").strip()
    keep_audio = str(shot.get("keepAudio") or "none").lower()
    has_dialogue = bool(shot.get("hasDialogue", False))

    guard = str(
        shot.get("audioGuard")
        or (DEFAULT_AUDIO_GUARD_SPEECH if has_dialogue else DEFAULT_AUDIO_GUARD_AMBIENT)
    ).strip()

    body = " ".join(p for p in (camera, action, micro, style) if p)
    tail = f"{ambient} {guard}".strip() if (ambient or keep_audio == "ambient") else guard
    return f"{body}\n{tail}".strip()


def validate_flow_manifest(
    data: dict[str, Any],
    repo_root: Path,
    check_frames: bool = False,
) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    shots: list[dict[str, Any]] = data.get("shots") or []

    if not shots:
        errors.append("flow-manifest.json 中没有任何 shots 定义")

    for raw_shot in shots:
        sid = str(raw_shot.get("id", "")).zfill(2)
        mode = str(raw_shot.get("flowMode") or "frames").lower()
        target_dur = float(raw_shot.get("targetDurSec") or 0.0)
        flow_dur = int(raw_shot.get("flowDurationSec") or recommend_flow_seconds(target_dur))
        prompt = compose_five_part_prompt(raw_shot)

        if mode not in ("frames", "ingredients", "text"):
            errors.append(f"[Shot {sid}] 非法 flowMode='{mode}'（仅支持 frames / ingredients / text）")

        if flow_dur not in (4, 6, 8):
            warnings.append(f"[Shot {sid}] flowDurationSec={flow_dur}s 非标准档位（建议 4 / 6 / 8）")

        if target_dur > 8.2:
            rec_splits = max(2, math.ceil(target_dur / 6.0))
            errors.append(
                f"[Shot {sid}] 镜头目标时长 {target_dur:.2f}s 超过 Google Flow 单条 8s 上限！"
                f"请先按语义停顿拆分为 {rec_splits} 个 4~6s 的短镜头（如 {sid}a, {sid}b）再生成视频。"
            )
        elif target_dur > 0 and flow_dur < target_dur * 0.84:
            errors.append(
                f"[Shot {sid}] Flow 生成档位 ({flow_dur}s) 短于镜头所需时长 ({target_dur:.2f}s) 的 84%，会导致末尾画面不足"
            )

        if not prompt or len(prompt) < 25:
            errors.append(f"[Shot {sid}] motionPrompt 为空或过短")
            continue

        if CJK_RE.search(prompt):
            warnings.append(f"[Shot {sid}] motionPrompt 中包含中文字符；Google Flow / Veo 建议使用纯英文提示词")

        p_low = prompt.lower()
        if not any(k in p_low for k in CAMERA_KEYWORDS):
            warnings.append(
                f"[Shot {sid}] 提示词未明确指定机位/运镜（如 'Static medium shot' / 'Slow push in'），模型可能随机乱晃镜头"
            )
        if not any(k in p_low for k in STYLE_KEYWORDS):
            warnings.append(
                f"[Shot {sid}] 提示词缺少 2D 水彩锁风词（如 'Hand-painted 2D watercolor storybook animation'），易漂移为 3D 写实风"
            )
        if "no subtitle" not in p_low and "no on-screen text" not in p_low:
            warnings.append(
                f"[Shot {sid}] 提示词缺少禁烧录字幕指令（'No subtitles, no on-screen text'），Flow 可能在画面底部生成乱码英文字幕"
            )

        if check_frames:
            start_frame = raw_shot.get("startFrame")
            end_frame = raw_shot.get("endFrame")
            ingredients = raw_shot.get("ingredients") or []
            if mode == "frames" and not start_frame:
                errors.append(f"[Shot {sid}] frames 模式必须配置 startFrame 路径")
            for label, rel in (("startFrame", start_frame), ("endFrame", end_frame)):
                if rel:
                    fpath = repo_root / str(rel)
                    if not fpath.is_file():
                        errors.append(f"[Shot {sid}] 找不到 {label} 图片文件: {rel}")
            for ing in ingredients:
                ipath = repo_root / str(ing)
                if not ipath.is_file():
                    errors.append(f"[Shot {sid}] 找不到 ingredient 参考图: {ing}")

    return {
        "shotCount": len(shots),
        "errors": errors,
        "warnings": warnings,
        "passed": len(errors) == 0,
    }


def init_from_tts_manifest(
    tts_manifest_path: Path,
    out_flow_manifest_path: Path,
    story_name: str | None = None,
) -> dict[str, Any]:
    tts_data = json.loads(tts_manifest_path.read_text(encoding="utf-8"))
    slug = str(tts_data.get("storySlug") or tts_manifest_path.parent.name)
    s_name = story_name or pascal_from_slug(slug)

    flow_shots: list[dict[str, Any]] = []
    long_shots: list[str] = []

    for shot in tts_data.get("shots") or []:
        sid = str(shot.get("id", "")).zfill(2)
        dur_sec = float(shot.get("durSec") or 5.0)
        lines = shot.get("lines") or []
        speakers = [str(ln.get("speaker") or "narrator") for ln in lines]
        has_dialogue = any(sp != "narrator" for sp in speakers)
        flow_sec = recommend_flow_seconds(dur_sec)
        needs_split = dur_sec > 8.2
        if needs_split:
            long_shots.append(f"{sid} ({dur_sec:.1f}s)")

        cue_hint = "Slow gentle push-in" if shot.get("cue") == "push" else "Static medium shot"
        action_hint = (
            "The speaking character talks warmly with natural lip movement and gentle head nods, blinking naturally."
            if has_dialogue
            else "Subtle natural character breathing, gentle eye blink, and smooth continuous gesture."
        )

        entry: dict[str, Any] = {
            "id": sid,
            "label": str(shot.get("label") or f"Shot {sid}"),
            "flowMode": "frames",
            "aspectRatio": "16:9",
            "outputs": 1,
            "targetDurSec": round(dur_sec, 2),
            "flowDurationSec": flow_sec,
            "needsBeatSplit": needs_split,
            "hasDialogue": has_dialogue,
            "keepAudio": "none" if has_dialogue else "ambient",
            "startFrame": f"public/{slug}/images/shot-{sid}-start.webp",
            "endFrame": None,
            "ingredients": [],
            "dialoguePreview": " / ".join(str(ln.get("text") or "") for ln in lines),
            "camera": f"{cue_hint}.",
            "action": action_hint,
            "microPhysics": "Soft ambient movement in background elements, warm watercolor light gently breathing.",
            "styleLock": DEFAULT_STYLE_LOCK,
            "ambientSfx": "" if has_dialogue else "Ambient noise: soft natural room tone matching the scene.",
            "audioGuard": DEFAULT_AUDIO_GUARD_SPEECH if has_dialogue else DEFAULT_AUDIO_GUARD_AMBIENT,
        }
        entry["motionPrompt"] = compose_five_part_prompt(entry)
        flow_shots.append(entry)

    flow_doc = {
        "storySlug": slug,
        "storyName": s_name,
        "fps": 24,
        "recommendedModel": "Veo 3.1 / Gemini Omni Flash (Video > Frames, Outputs = 1)",
        "shots": flow_shots,
    }

    out_flow_manifest_path.parent.mkdir(parents=True, exist_ok=True)
    out_flow_manifest_path.write_text(
        json.dumps(flow_doc, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return {
        "flowManifest": str(out_flow_manifest_path),
        "storySlug": slug,
        "storyName": s_name,
        "shotCount": len(flow_shots),
        "shotsNeedingBeatSplit": long_shots,
    }


def _encode_thumb_data_uri(img_path: Path) -> str | None:
    if not img_path.is_file():
        return None
    try:
        raw = img_path.read_bytes()
        if len(raw) > 2 * 1024 * 1024:
            return None
        ext = img_path.suffix.lower().lstrip(".")
        mime = "image/webp" if ext == "webp" else f"image/{'jpeg' if ext == 'jpg' else ext}"
        b64 = base64.b64encode(raw).decode("ascii")
        return f"data:{mime};base64,{b64}"
    except OSError:
        return None


def ensure_assets_readme(assets_story_dir: Path, story_name: str, slug: str) -> None:
    readme = assets_story_dir / "README.md"
    if readme.is_file():
        return
    assets_story_dir.mkdir(parents=True, exist_ok=True)
    content = (
        f"# {story_name} 素材清单\n\n"
        "| 资产路径 | 类型 | 来源 | 规格 | 用途 |\n"
        "| :--- | :--- | :--- | :--- | :--- |\n"
        f"| `public/{slug}/images/shot-*.webp` | 图片 | Agent 生图 (`generate_image`) | 1920×1080 WebP | Google Flow 首尾关键帧与 Animatic 预览底图 |\n"
        f"| `public/{slug}/video/shot-*.mp4` | 视频 | Google Flow (`Veo 3.1` / `Omni Flash`) | 1080p 24fps H.264 MP4 (<8MB) | 经双层审片通过的真动画分镜切片 |\n"
        f"| `public/{slug}/audio/*.mp3` | 音频 | `tts_helper.py` 语音合成 | MP3 128kbps | 旁白与角色对白配音 |\n"
    )
    readme.write_text(content, encoding="utf-8")


def build_flow_pack(
    flow_manifest_path: Path,
    repo_root: Path,
) -> dict[str, Any]:
    data = json.loads(flow_manifest_path.read_text(encoding="utf-8"))
    slug = str(data.get("storySlug") or flow_manifest_path.parent.name)
    story_name = str(data.get("storyName") or pascal_from_slug(slug))

    assets_story_dir = repo_root / "assets" / story_name
    pack_dir = assets_story_dir / "flow-pack"
    frames_dir = pack_dir / "frames"
    inbox_dir = assets_story_dir / "flow-inbox"
    frames_dir.mkdir(parents=True, exist_ok=True)
    inbox_dir.mkdir(parents=True, exist_ok=True)
    ensure_assets_readme(assets_story_dir, story_name, slug)

    md_lines: list[str] = [
        f"# 《{story_name}》Google Flow 视频生成投喂手册",
        "",
        "> **操作防坑提示（省积分必读）**：",
        "> 1. 打开 [Google Flow](https://flow.google.com/) 新建项目后，输入框默认是图片模型，请先点击模型名切换为 **`Video -> Frames`**（或 `Ingredients`）。",
        "> 2. 将生成条数 **`Outputs` 设为 `1`**，画幅设为 **`16:9`**，时长按每镜标注选择 `4s / 6s / 8s`。",
        f"> 3. 生成满意下载后，将视频命名为 `shot-01.mp4`、`shot-02.mp4` ... 放入 `assets/{story_name}/flow-inbox/`（或上传至 Google Drive / 聊天窗口由 Agent 自动拉取质检）。",
        "",
        "---",
        "",
    ]

    cards_html: list[str] = []
    copied_frames = 0

    for shot in data.get("shots") or []:
        sid = str(shot.get("id", "")).zfill(2)
        label = str(shot.get("label") or f"Shot {sid}")
        mode = str(shot.get("flowMode") or "frames")
        aspect = str(shot.get("aspectRatio") or "16:9")
        flow_sec = int(shot.get("flowDurationSec") or 6)
        target_dur = float(shot.get("targetDurSec") or flow_sec)
        prompt = compose_five_part_prompt(shot)
        shot["motionPrompt"] = prompt
        dialogue = str(shot.get("dialoguePreview") or "（纯画面动作 / 无台词）")

        start_rel = shot.get("startFrame")
        end_rel = shot.get("endFrame")
        start_uri = None
        end_uri = None
        start_pack_name = "（未挂载首帧）"
        end_pack_name = "（无尾帧 / 单首帧驱动）"

        if start_rel:
            src_p = repo_root / str(start_rel)
            if not src_p.is_file():
                # 兼容回退查找 shot-XX.webp
                alt_p = repo_root / f"public/{slug}/images/shot-{sid}.webp"
                if alt_p.is_file():
                    src_p = alt_p
            if src_p.is_file():
                dst_name = f"shot-{sid}-start{src_p.suffix.lower()}"
                shutil.copy2(src_p, frames_dir / dst_name)
                copied_frames += 1
                start_pack_name = dst_name
                start_uri = _encode_thumb_data_uri(src_p)

        if end_rel:
            end_p = repo_root / str(end_rel)
            if end_p.is_file():
                dst_name = f"shot-{sid}-end{end_p.suffix.lower()}"
                shutil.copy2(end_p, frames_dir / dst_name)
                copied_frames += 1
                end_pack_name = dst_name
                end_uri = _encode_thumb_data_uri(end_p)

        md_lines.extend(
            [
                f"## Shot {sid} · {label}",
                "",
                f"- **Flow 模式**：`Video > {mode.capitalize()}` | **画幅**：`{aspect}` | **时长档位**：`{flow_sec}s`（配音需求 `{target_dur:.2f}s`） | **Outputs**：`1`",
                f"- **首帧文件 (`+ Add start frame`)**：`{start_pack_name}`",
                f"- **尾帧文件 (`+ Add end frame`)**：`{end_pack_name}`",
                f"- **对应中文台词参考**：{dialogue}",
                f"- **下载保存文件名**：`shot-{sid}.mp4`",
                "",
                "```text",
                prompt,
                "```",
                "",
            ]
        )

        start_img_tag = (
            f'<img src="{start_uri}" alt="Start {sid}" />'
            if start_uri
            else f'<div class="placeholder">待生成首帧<br/>{html.escape(str(start_rel or ""))}</div>'
        )
        end_img_tag = (
            f'<img src="{end_uri}" alt="End {sid}" />'
            if end_uri
            else '<div class="placeholder muted">可选尾帧（未设置）</div>'
        )

        cards_html.append(
            f"""
            <section class="card" id="card-{sid}">
              <div class="card-header">
                <label class="check-wrap">
                  <input type="checkbox" data-shot="{sid}" onchange="toggleDone('{sid}', this.checked)" />
                  <span class="shot-title">Shot {sid} · {html.escape(label)}</span>
                </label>
                <div class="badges">
                  <span class="badge mode">Video &gt; {html.escape(mode.capitalize())}</span>
                  <span class="badge dur">{flow_sec}s (需 {target_dur:.1f}s)</span>
                  <span class="badge">{html.escape(aspect)}</span>
                  <span class="badge warn">Outputs: 1</span>
                  <span class="badge file">保存为: shot-{sid}.mp4</span>
                </div>
              </div>
              <div class="card-body">
                <div class="frames-col">
                  <div class="frame-box">
                    <div class="frame-caption">Start Frame: <code>{html.escape(start_pack_name)}</code></div>
                    {start_img_tag}
                  </div>
                  <div class="frame-box">
                    <div class="frame-caption">End Frame: <code>{html.escape(end_pack_name)}</code></div>
                    {end_img_tag}
                  </div>
                </div>
                <div class="prompt-col">
                  <div class="dialogue-ref"><strong>中文配音参考：</strong>{html.escape(dialogue)}</div>
                  <pre id="prompt-{sid}">{html.escape(prompt)}</pre>
                  <button class="copy-btn" onclick="copyPrompt('{sid}', this)">复制 Google Flow 英文 Prompt</button>
                </div>
              </div>
            </section>
            """
        )

    prompts_md_path = flow_manifest_path.parent / "flow-prompts.md"
    prompts_md_path.write_text("\n".join(md_lines), encoding="utf-8")

    # 同步回写补全后的 motionPrompt
    flow_manifest_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    workbench_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>{html.escape(story_name)} · Google Flow 投喂工作台</title>
  <style>
    :root {{
      --bg: #0f1419;
      --panel: #182028;
      --border: #2a3744;
      --accent: #f4b860;
      --blue: #7cc6fe;
      --ok: #52b788;
      --text: #eef3f7;
      --muted: #94a3b8;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      padding: 28px 36px 64px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
    }}
    header {{
      max-width: 1360px;
      margin: 0 auto 24px;
      padding: 20px 24px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-left: 5px solid var(--accent);
      border-radius: 12px;
    }}
    h1 {{ margin: 0 0 8px; font-size: 22px; }}
    .tips {{ margin: 0; color: var(--muted); font-size: 14px; line-height: 1.6; }}
    .card {{
      max-width: 1360px;
      margin: 0 auto 20px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px 22px;
      transition: opacity 0.2s ease, border-color 0.2s ease;
    }}
    .card.done {{ opacity: 0.58; border-color: var(--ok); }}
    .card-header {{
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 14px;
    }}
    .check-wrap {{ display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 700; font-size: 17px; }}
    .check-wrap input {{ width: 18px; height: 18px; accent-color: var(--ok); cursor: pointer; }}
    .badges {{ display: flex; flex-wrap: wrap; gap: 8px; }}
    .badge {{
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      background: #22303c;
      color: var(--text);
    }}
    .badge.mode {{ background: rgba(124, 198, 254, 0.16); color: var(--blue); }}
    .badge.dur {{ background: rgba(82, 183, 136, 0.18); color: #74c69d; }}
    .badge.warn {{ background: rgba(244, 184, 96, 0.18); color: var(--accent); }}
    .badge.file {{ font-family: monospace; }}
    .card-body {{ display: grid; grid-template-columns: 440px 1fr; gap: 20px; }}
    @media (max-width: 980px) {{ .card-body {{ grid-template-columns: 1fr; }} }}
    .frames-col {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }}
    .frame-box {{ background: #10161c; border: 1px solid var(--border); border-radius: 8px; padding: 8px; }}
    .frame-caption {{ font-size: 11px; color: var(--muted); margin-bottom: 6px; word-break: break-all; }}
    .frame-box img {{ width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 5px; display: block; }}
    .placeholder {{
      width: 100%;
      aspect-ratio: 16 / 9;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 12px;
      color: var(--accent);
      background: #141c24;
      border-radius: 5px;
      padding: 8px;
    }}
    .placeholder.muted {{ color: #526071; }}
    .dialogue-ref {{ font-size: 13px; color: var(--muted); margin-bottom: 10px; line-height: 1.5; }}
    pre {{
      margin: 0 0 12px;
      padding: 12px 14px;
      background: #0c1116;
      border: 1px solid var(--border);
      border-radius: 8px;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 13px;
      line-height: 1.55;
      color: #e2e8f0;
    }}
    .copy-btn {{
      padding: 9px 18px;
      border: none;
      border-radius: 8px;
      background: var(--accent);
      color: #16191d;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }}
    .copy-btn.copied {{ background: var(--ok); color: #fff; }}
  </style>
</head>
<body>
  <header>
    <h1>{html.escape(story_name)} · Google Flow 视频生成投喂工作台</h1>
    <p class="tips">
      1. 在 Google Flow 顶部模型栏切换为 <strong>Video &gt; Frames</strong>，将 <strong>Outputs 设为 1</strong>（避免多倍扣积分）。<br/>
      2. 从 <code>assets/{html.escape(story_name)}/flow-pack/frames/</code> 拖入对应 Start / End 帧，点击右侧按钮复制英文 Prompt 生成。<br/>
      3. 下载生成的 MP4 保存至 <code>assets/{html.escape(story_name)}/flow-inbox/shot-XX.mp4</code>（或放入 Google Drive 交由 Agent 自动拉取审片）。
    </p>
  </header>
  {"".join(cards_html)}
  <script>
    const STORAGE_KEY = "flow_done_{html.escape(slug)}";
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{{}}");
    Object.keys(saved).forEach((sid) => {{
      if (saved[sid]) {{
        const cb = document.querySelector(`input[data-shot="${{sid}}"]`);
        if (cb) cb.checked = true;
        const card = document.getElementById(`card-${{sid}}`);
        if (card) card.classList.add("done");
      }}
    }});
    function toggleDone(sid, checked) {{
      saved[sid] = checked;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      const card = document.getElementById(`card-${{sid}}`);
      if (card) card.classList.toggle("done", checked);
    }}
    function copyPrompt(sid, btn) {{
      const text = document.getElementById(`prompt-${{sid}}`).innerText;
      navigator.clipboard.writeText(text).then(() => {{
        const old = btn.innerText;
        btn.innerText = "已复制 Prompt ✓";
        btn.classList.add("copied");
        setTimeout(() => {{
          btn.innerText = old;
          btn.classList.remove("copied");
        }}, 1600);
      }});
    }}
  </script>
</body>
</html>
"""
    workbench_path = pack_dir / "flow-workbench.html"
    workbench_path.write_text(workbench_html, encoding="utf-8")

    validation = validate_flow_manifest(data, repo_root=repo_root, check_frames=False)
    return {
        "storySlug": slug,
        "storyName": story_name,
        "promptsMarkdown": str(prompts_md_path),
        "workbenchHtml": str(workbench_path),
        "framesDir": str(frames_dir),
        "inboxDir": str(inbox_dir),
        "copiedFrameFiles": copied_frames,
        "validation": validation,
    }


def gdrive_push_pack(pack_dir: Path, prompts_md: Path, parent_folder_id: str) -> dict[str, Any]:
    gdrive = shutil.which("gdrive")
    if not gdrive:
        raise RuntimeError("未找到 gdrive CLI")

    uploaded: list[str] = []
    targets: list[Path] = []
    if prompts_md.is_file():
        targets.append(prompts_md)
    wb = pack_dir / "flow-workbench.html"
    if wb.is_file():
        targets.append(wb)
    frames_dir = pack_dir / "frames"
    if frames_dir.is_dir():
        targets.extend(sorted(p for p in frames_dir.iterdir() if p.is_file()))

    for fpath in targets:
        cmd = [gdrive, "mutate", "upload", str(fpath), "--parent", parent_folder_id]
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if proc.returncode != 0:
            raise RuntimeError(f"上传失败 ({fpath.name}): {proc.stderr.strip()}")
        uploaded.append(fpath.name)
    return {"uploadedCount": len(uploaded), "files": uploaded, "parentFolderId": parent_folder_id}


def gdrive_pull_inbox(folder_id: str, inbox_dir: Path) -> dict[str, Any]:
    gdrive = shutil.which("gdrive")
    if not gdrive:
        raise RuntimeError("未找到 gdrive CLI")

    inbox_dir.mkdir(parents=True, exist_ok=True)
    cmd = [gdrive, "readonly", "ls", folder_id, "--max", "100", "--json"]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(f"读取 Google Drive 目录失败: {proc.stderr.strip()}")

    payload = json.loads(proc.stdout or "[]")
    items = payload.get("files", payload) if isinstance(payload, dict) else payload
    downloaded: list[str] = []

    for item in items:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "")
        fid = str(item.get("id") or "")
        if not fid or not name.lower().endswith((".mp4", ".webm", ".mov")):
            continue
        out_file = inbox_dir / name
        dl = subprocess.run(
            [gdrive, "readonly", "download", fid, "--out", str(out_file)],
            capture_output=True,
            text=True,
            check=False,
        )
        if dl.returncode != 0:
            raise RuntimeError(f"下载失败 ({name}): {dl.stderr.strip()}")
        downloaded.append(name)

    return {"downloadedCount": len(downloaded), "files": downloaded, "inboxDir": str(inbox_dir)}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Google Flow 首尾帧投喂包构建、五段式提示词校验与云盘同步工具"
    )
    parser.add_argument("--init", action="store_true", help="从 tts-manifest.json 初始化 flow-manifest.json")
    parser.add_argument("--tts-manifest", help="输入 tts-manifest.json 路径（用于 --init）")
    parser.add_argument("--manifest", help="flow-manifest.json 路径")
    parser.add_argument("--story-name", help="可选：PascalCase 故事名，如 OldChenMusicBox")
    parser.add_argument("--validate", action="store_true", help="仅校验 flow-manifest.json 提示词与时长规范")
    parser.add_argument("--check-frames", action="store_true", help="校验时同时检查首尾帧图片文件是否已落盘")
    parser.add_argument("--build-pack", action="store_true", help="生成 Google Flow 投喂文件夹、Markdown 与 HTML 工作台")
    parser.add_argument("--gdrive-push", action="store_true", help="将构建好的投喂包上传至指定 Google Drive 目录")
    parser.add_argument("--gdrive-pull", action="store_true", help="从指定 Google Drive 目录拉取生成的视频至 flow-inbox")
    parser.add_argument("--folder-id", help="Google Drive 文件夹 ID（配合 --gdrive-push / --gdrive-pull）")
    parser.add_argument("--repo-root", default=".", help="仓库根目录（默认当前目录）")
    args = parser.parse_args(argv)

    repo_root = Path(args.repo_root).resolve()

    if args.init:
        if not args.tts_manifest:
            parser.error("--init 需要同时提供 --tts-manifest")
        tts_p = Path(args.tts_manifest)
        out_p = Path(args.manifest) if args.manifest else (tts_p.parent / "flow-manifest.json")
        res = init_from_tts_manifest(tts_p, out_p, story_name=args.story_name)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.gdrive_pull:
        if not args.folder_id or not args.manifest:
            parser.error("--gdrive-pull 需要提供 --folder-id 与 --manifest")
        data = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
        story_name = str(data.get("storyName") or pascal_from_slug(str(data.get("storySlug") or "story")))
        inbox_dir = repo_root / "assets" / story_name / "flow-inbox"
        res = gdrive_pull_inbox(args.folder_id, inbox_dir)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if not args.manifest:
        parser.error("请提供 --manifest docs/<story-slug>/flow-manifest.json")

    manifest_path = Path(args.manifest)
    if not manifest_path.is_file():
        print(json.dumps({"error": f"找不到文件: {manifest_path}"}, ensure_ascii=False), file=sys.stderr)
        return 1

    if args.validate:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        res = validate_flow_manifest(data, repo_root=repo_root, check_frames=args.check_frames)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0 if res["passed"] else 1

    if args.build_pack:
        res = build_flow_pack(manifest_path, repo_root=repo_root)
        if args.gdrive_push:
            if not args.folder_id:
                parser.error("--gdrive-push 需要提供 --folder-id")
            push_res = gdrive_push_pack(
                Path(res["framesDir"]).parent,
                Path(res["promptsMarkdown"]),
                args.folder_id,
            )
            res["gdrivePush"] = push_res
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0 if res["validation"]["passed"] else 1

    if args.gdrive_push:
        if not args.folder_id:
            parser.error("--gdrive-push 需要提供 --folder-id")
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        story_name = str(data.get("storyName") or pascal_from_slug(str(data.get("storySlug") or "story")))
        pack_dir = repo_root / "assets" / story_name / "flow-pack"
        prompts_md = manifest_path.parent / "flow-prompts.md"
        res = gdrive_push_pack(pack_dir, prompts_md, args.folder_id)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    parser.error("请指定操作参数：--init / --validate / --build-pack / --gdrive-push / --gdrive-pull")
    return 1


if __name__ == "__main__":
    sys.exit(main())
