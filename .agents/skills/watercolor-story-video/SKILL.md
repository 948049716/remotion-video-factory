---
name: watercolor-story-video
description: 将用户输入的故事转化为手绘水彩绘本风格的 Remotion 混合 2D 分层动画视频。涵盖模型配置询问（自部署TTS或默认edge-tts、自备生图API Key或默认Agent内置生图）、角色视觉锚点与配音选角、故事分镜与分层级别规划（视差环境层+角色/道具关节可动层）、角色台词与旁白拆分合成、ffprobe实测时长驱动时间轴、手绘水彩素材与透明部件图层生成、素材与音频完整性校验、Remotion 2D分层关节动效（呼吸/摆臂/语音同步说话微动/旋转/视差）组装与项目预览引导（默认不渲染MP4）。
---

# 手绘水彩故事视频工作流（Watercolor Story Video Skill）

当用户提供一个故事（或故事大纲）并希望制作手绘水彩绘本风格的动画视频时，严格按照以下 **8 个阶段（Phase 0 ~ Phase 7）** 执行。本工作流采用 **「混合 2D 分层关节动画（Hybrid 2D Layered Animation）」**：既有手绘水彩 100% 稳定的绘本笔触，又能让角色呼吸、手臂劳作、随台词说话点头、环境门帘摇曳与关键道具真正动起来。

---

## 核心约束（必须遵守）

1. **语音模型选择规则**：
   - 开始生成语音前，**必须先询问用户是否有自己部署的语音模型/TTS 服务**（例如 OpenAI 兼容的 `/v1/audio/speech` 接口、NAS 部署的 TTS、GPT-SoVITS、CosyVoice 等）。
   - 如果用户提供自部署服务地址（及可选 API Key / 模型名），使用 `--mode custom --base-url <URL>` 调用。
   - **如果用户没有自部署语音模型，默认使用 `edge-tts`**（通过本 Skill 自带的 `scripts/tts_helper.py --mode edge-tts` 自动调用）。
2. **生图模型选择规则**：
   - 开始生成图片前，**必须先询问用户是否有外部生图模型的 API Key**（如 OpenAI、Gemini Imagen、SiliconFlow、火山方舟等）。
   - 如果用户提供 API Key（及可选 Base URL / 模型名），使用 `scripts/image_api_helper.py` 调用外部接口生图。
   - **如果用户没有 API Key，默认使用 Agent 自带的 `generate_image` 工具**生成素材，再用 `scripts/image_api_helper.py --convert-in` 转为高画质 `.webp` 落位到 `public/<story-slug>/images/`。
3. **预览优先、严禁主动渲染 MP4**：
   - **不要主动执行 `npx remotion render` 渲染输出 `.mp4` 视频文件**，除非用户在对话中明确要求导出 MP4。
   - 动画与素材全部就位并通过校验后，引导用户在项目中通过 Remotion Studio（`npm run dev`）直接预览与微调效果。

---

## 完整工作流总览

```text
[用户给出故事]
      │
      ▼
Phase 0: 前置配置询问 & Remotion 工程环境检查
      │  ├─ 询问 TTS 方案（自部署接口 vs 默认 edge-tts）
      │  ├─ 询问生图方案（自备 API Key vs 默认 Agent 内置 generate_image）
      │  └─ 检查/初始化 Remotion 项目基础结构 (package.json, src/Root.tsx)
      ▼
Phase 1: 故事解析、角色视觉锚点表 (Character Bible) & 配音选角表 (Voice Casting)
      │  ├─ 固定每个角色的外观锚点描述块与负面排除项（防止跨镜头变脸/变装）
      │  ├─ 设定全片色彩情绪演进（Color Script）与核心道具比例锚点
      │  └─ 为旁白 (narrator) 与各角色分配差异化音色、语速、字幕色标
      ▼
Phase 2: 故事分镜设计 (Storyboard)、镜头语言 & 2D 分层级别规划 (Tier A / Tier B)  ★核心升级
      │  ├─ 拆解 6~15 个镜头，交替景别，标注运镜 cue、色调 tone、氛围粒子 fx
      │  └─ 按“会不会动”标定每镜分层：Tier A 视差摇曳层 / Tier B 角色与道具关节层
      ▼
Phase 3: 台词与旁白拆分、TTS 语音合成 & ffprobe 实测时长排算时间轴
      │  ├─ 按「镜头 + 说话人」拆分为独立音频片段 (s01-narr.mp3, s04-girl.mp3...)
      │  ├─ 生成 docs/<story-slug>/tts-manifest.json 并运行 scripts/tts_helper.py
      │  └─ 用 ffprobe 实测音频秒数自动计算 atSec 与镜头总时长 durSec
      ▼
Phase 4: 手绘水彩分镜素材生成 & 2D 透明图层分离 / 干净背景板修补                 ★核心升级
      │  ├─ 生成全部分镜原画 (shot-01.webp ~ shot-NN.webp) 与风格基准图 (ref-style.webp)
      │  └─ 使用 scripts/layer_helper.py 拆出透明可动部件 (RGBA .webp/.png) 与修补干净背景 (bg.webp)
      ▼
Phase 5: 素材、分层图层与音频完整性门禁检查 (Completeness Gate)
      │  └─ 运行 scripts/verify_story_assets.py 核对分镜底图、分层图层、音频与防截断边界
      ▼
Phase 6: 使用 Remotion 制作混合 2D 分层水彩动画
      │  ├─ 在 src/videos/<StoryName>/shots.ts 配置时间轴与每镜 layers 关节锚点/动作驱动
      │  ├─ 生成 src/videos/<StoryName>/StoryVideo.tsx（视差、关节摆动、语音同步说话微动、旋转、水彩纸纹）
      │  └─ 在 src/Root.tsx 注册 Composition 并归档 docs/<story-slug>/production.md
      ▼
Phase 7: 类型检查与项目预览交付（不主动渲染 MP4）
         ├─ 运行 npx tsc --noEmit 确保零编译错误
         └─ 启动或告知用户通过 npm run dev 在 Remotion Studio 预览效果
```

---

## 阶段详细执行指南

### Phase 0：前置配置询问与工程环境检查

1. **一次性询问配置偏好**：
   使用 `ask_question` 工具（或简洁提问）向用户确认：
   - **语音模型（TTS）**：是否有自己部署的 TTS 服务（若有，请提供接口 URL / 音色配置）？若无则使用默认 `edge-tts`。
   - **生图模型（Image Gen）**：是否有生图模型 API Key（若有，请提供 API Key / 接口类型）？若无则使用默认 Agent 内置 `generate_image`。
   - **画幅比例**（若用户未指定）：默认横屏 `16:9`（`1920×1080`，`30fps`），可选竖屏 `9:16`（`1080×1920`）。
2. **检查 Remotion 项目基建**：
   - 检查当前工作区是否存在 `package.json`、`src/Root.tsx`、`src/index.ts`。
   - 若当前目录为空仓库或尚未初始化 Remotion，请先阅读本 Skill 的 `references/remotion-watercolor-patterns.md` 第 2 节，创建最小可用的 Remotion 工程文件并执行 `npm install`。
   - 为当前故事确定两个标识符：
     - `StoryName`（PascalCase，如 `OldChenMusicBox`）
     - `story-slug`（kebab-case，如 `old-chen-music-box`）

---

### Phase 1：故事解析、角色视觉锚点表与配音选角表

阅读 `references/prompt-templates.md` 第 1~2 节，完成以下三项设定并写入 `docs/<story-slug>/production.md`：

1. **角色视觉锚点设定表（Character Visual Bible）**：锁定每个角色不可变的外观描述块、明确禁止项以及核心道具尺寸/材质锚点。
2. **全片手绘水彩风格与色彩脚本（Color Script）**：统一冷压水彩纸肌理、透明叠色水痕、铅笔/彩铅勾线，并规划剧情色彩演进阶段。
3. **旁白与角色配音选角表（Voice Casting）**：为 `narrator` 与各对话角色分配专属音色、语速（`speed`）、音调（`pitch`）及字幕色标 `accent`。

---

### Phase 2：故事分镜设计与 2D 分层级别规划

将故事拆解为 **6 ~ 15 个分镜（Shot `01` ~ `NN`）**，遵循 `references/prompt-templates.md` 第 4~5 节：

1. **景别交替与镜头参数**：交替使用远/全/中/近/特写，标注 `cue`（运镜）、`tone`（色调）与 `fx`（程序化水彩粒子）。
2. **标定分层级别（Tier A / Tier B）**：
   - **Tier A（视差与环境动态）**：远景/过场镜头，拆分干净背景 + 1～2 个环境摆动物（如屋檐木牌、布门帘、前景草叶），驱动视差与风动摇曳（`sway`）。
   - **Tier B（角色/道具关节动效）**：核心交互、对话或特写镜头，按“会不会动”拆分：
     - 干净背景板 `bg.webp`
     - 角色躯干 `body.webp`（RGBA 透明通道，呼吸 `breathe`）
     - 独立头部 `head.webp`（绑定 `activeSpeaker` 驱动语音同步说话微动 `talk` / `nod`）
     - 可动肢体或道具 `arm.webp` / `pendulum.webp` / `dancer.webp`（围绕 `origin: [x%, y%]` 关节锚点摆动 `swing` 或优雅旋转 `spin-y`）。
3. **底部字幕安全区预留**：画面底部 12%~15% 区域保持柔和简洁，不放置人脸或关键道具。

---

### Phase 3：拆分各角色台词、TTS 语音合成与实测时长对齐

> **关键原则**：必须**先生成语音并用 `ffprobe` 测量真实秒数**，再由真实语音时长决定每个镜头的总时长 `durSec` 和台词起始点 `atSec`。

1. **按「镜头 + 说话人」颗粒度拆分台词**，编写 `docs/<story-slug>/tts-manifest.json`。
2. **执行 `scripts/tts_helper.py` 批量合成并自动回填实测时长**：
   - 默认 `edge-tts`：`python3 <path/to/skill>/scripts/tts_helper.py --mode edge-tts --manifest docs/<story-slug>/tts-manifest.json`
   - 自部署 TTS：`python3 <path/to/skill>/scripts/tts_helper.py --mode custom --base-url "<USER_TTS_BASE_URL>" --manifest docs/<story-slug>/tts-manifest.json`

---

### Phase 4：生成手绘水彩素材与 2D 透明图层拆分

1. **生成分镜原画**：
   - 将完整三段式提示词归档至 `docs/<story-slug>/prompts.md`。
   - 先出基准风格参考图（`ref-style.webp`），再依次生成各镜原画并转为 `1920×1080` WebP 存入 `public/<story-slug>/images/shot-XX.webp`（使用默认 Agent `generate_image` 时传入参考图锁住画风，再用 `scripts/image_api_helper.py --convert-in` 落位；使用用户 API Key 时直接调 `scripts/image_api_helper.py`）。
2. **拆出 2D 可动透明图层与干净背景板（Tier A & Tier B 关键步骤）**：
   - **格式提示**：`layer_helper.py` 会根据输出文件名后缀自动保存带完整 8-bit Alpha 通道的 RGBA `.webp`（推荐，体积可控制在 `< 500 KB` 以满足静态资产压缩门禁）或 `.png`。
   - **方式 A（从原画精确分离 + 背景修补）**：编写分层多边形配置 JSON，调用 `scripts/layer_helper.py` 一键切出同画布对齐的透明可动部件（`head.webp` / `arm.webp` / `pendulum.webp` / `curtain.webp` 等），并自动修补被遮挡的背景区域输出 `bg.webp`：
     ```bash
     uv run --with pillow --with numpy python3 <path/to/skill>/scripts/layer_helper.py \
       --split-src public/<story-slug>/images/shot-02.webp \
       --spec docs/<story-slug>/layer-spec-02.json
     ```
   - **方式 B（白底独立生成部件抠图）**：若某道具/角色需要大角度独立运动（如 360° 旋转的芭蕾舞者），可单独生成纯白纸底水彩图后抠除背景：
     ```bash
     uv run --with pillow --with numpy python3 <path/to/skill>/scripts/layer_helper.py \
       --extract-white-bg raw_prop.png \
       --out public/<story-slug>/images/layers/prop.webp
     ```

---

### Phase 5：检查素材、分层图层与音频是否齐全（完整性门禁）

运行 `scripts/verify_story_assets.py` 进行自动化门禁检查：

```bash
python3 <path/to/skill>/scripts/verify_story_assets.py \
  --story-slug "<story-slug>" \
  --manifest "docs/<story-slug>/tts-manifest.json" \
  --expected-shots <N>
```

确保所有底图、`layers` 中的透明图层、配音 `.mp3` 文件、实测时长偏差与防截断边界全部通过（`"passed": true`）。

---

### Phase 6：使用 Remotion 制作混合 2D 分层水彩动画

参考 `references/remotion-watercolor-patterns.md` 第 3~4 节的代码模板：

1. **生成单一数据源 `src/videos/<StoryName>/shots.ts`**：
   - 包含 `TIMELINE` 时间轴与每个镜头的 `layers` 数组（定义 `zIndex`、`parallax`、关节旋转锚点 `origin: [x%, y%]`、`motion` 运动模式与说话人联动 `activeSpeaker`）。
2. **生成多层关节动画组件 `src/videos/<StoryName>/StoryVideo.tsx`**：
   - 内置 `LayeredShotStage` 与 `computeLayerStyle`：让背景/人物/部件产生**视差景深**、**呼吸起伏**、**手臂/钟摆关节摆动**、**随台词音频同步触发的说话点头微动**、**门帘/木牌风动**、**道具自转**与**柔光呼吸**，同时叠加水彩纸纹理、氛围粒子与绘本字幕。
3. **注册到 `src/Root.tsx`**，并归档 `docs/<story-slug>/production.md`。

---

### Phase 7：类型校验与引导用户在项目中预览（严禁主动渲染 MP4）

1. 执行 `npx tsc --noEmit` 验证零 TypeScript 错误。
2. **严禁主动运行 `npx remotion render ... out/*.mp4`**，除非用户明确要求导出 MP4。
3. 交付制作汇总报告，引导用户在项目根目录运行 `npm run dev` 打开 Remotion Studio 实时预览分层水彩动画效果；若处于无公网隧道的远端环境且用户希望查看效果，可按需提供关键帧 `remotion still` 截图确认。
