---
name: watercolor-story-video
description: 将用户输入的故事转化为手绘水彩绘本风格的 Remotion 动画视频。涵盖模型配置询问（自部署TTS或默认edge-tts、自备生图API Key或默认Agent内置生图）、角色视觉锚点与配音选角、故事分镜与镜头语言设计、角色台词与旁白拆分合成、ffprobe实测时长驱动时间轴、手绘水彩风格一致性生图、素材与音频完整性校验、Remotion多层水彩动画组装与项目预览引导（默认不渲染MP4）。
---

# 手绘水彩故事视频工作流（Watercolor Story Video Skill）

当用户提供一个故事（或故事大纲）并希望制作手绘水彩绘本风格的动画视频时，严格按照以下 **8 个阶段（Phase 0 ~ Phase 7）** 执行。

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
Phase 1: 故事解析、角色视觉锚点表 (Character Bible) & 配音选角表 (Voice Casting)  ★补充关键环节
      │  ├─ 固定每个角色的外观锚点描述块与负面排除项（防止跨镜头变脸/变装）
      │  ├─ 设定全片色彩情绪演进（Color Script）与核心道具比例锚点
      │  └─ 为旁白 (narrator) 与各角色分配差异化音色、语速、字幕色标
      ▼
Phase 2: 故事分镜设计 (Storyboard) & 镜头语言规划                                ★补充关键环节
      │  └─ 拆解 6~15 个镜头，交替景别（远/全/中/近/特写），标注运镜 cue、色调 tone、氛围粒子 fx
      ▼
Phase 3: 台词与旁白拆分、TTS 语音合成 & ffprobe 实测时长排算时间轴               ★补充工程闭环
      │  ├─ 按「镜头 + 说话人」拆分为独立音频片段 (s01-narr.mp3, s03-fox.mp3...)
      │  ├─ 生成 docs/<story-slug>/tts-manifest.json 并运行 scripts/tts_helper.py
      │  └─ 用 ffprobe 实测音频秒数自动计算 atSec 与镜头总时长 durSec（预留前后呼吸留白）
      ▼
Phase 4: 手绘水彩分镜素材生成 & 跨镜头画风/角色一致性控制                        ★补充视觉闭环
      │  ├─ 先生成第 1 张核心风格与主角基准图 (ref-style.webp)
      │  ├─ 按「通用水彩块 A + 字幕留白块 B + 单镜构图块 C」生成全部分镜图 (shot-01.webp ~ shot-NN.webp)
      │  └─ 若用 Agent 内置 generate_image，传入 ref-style 作为参考图保持角色与水彩笔触一致
      ▼
Phase 5: 素材、音频与时间轴完整性门禁检查 (Completeness Gate)
      │  └─ 运行 scripts/verify_story_assets.py 核对分镜图、配音文件、ffprobe 时长与防截断边界
      ▼
Phase 6: 使用 Remotion 制作手绘水彩动画
      │  ├─ 生成单一数据源 src/videos/<StoryName>/shots.ts
      │  ├─ 生成多层水彩组件 src/videos/<StoryName>/StoryVideo.tsx（含水彩纸纹、柔边暗角、氛围粒子、运镜、角色字幕）
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
     - `StoryName`（PascalCase，用于组件目录与 Composition ID，如 `FoxStarlightSeed`）
     - `story-slug`（kebab-case，用于 `public/<story-slug>/` 与 `docs/<story-slug>/` 目录，如 `fox-starlight-seed`）

---

### Phase 1：故事解析、角色视觉锚点表与配音选角表（补充环节）

在动手写分镜或生图前，先阅读 `references/prompt-templates.md` 第 1~2 节，完成以下三项设定并写入 `docs/<story-slug>/production.md`：

1. **角色视觉锚点设定表（Character Visual Bible）**：
   - 提取故事中所有出场角色，固定每个角色的**不可变外观描述块**（物种/年龄感、毛色/发色/肤色、标志性服饰或“不穿衣服/不戴配饰”、体型比例）以及**明确禁止项**（如动物角色禁止画成人类手掌、禁止多条尾巴、禁止随意换装）。
   - 提取贯穿全片的**核心道具锚点**（明确其相对于角色身体的尺寸比例与光源特征）。
2. **全片手绘水彩风格与色彩脚本（Color Script）**：
   - 定义全片统一的**手绘水彩美学基调**：冷压水彩纸纹理（cold-pressed paper texture）、透明水彩水痕晕染（wet-on-wet pigment bloom）、温暖铅笔/彩铅轻柔勾线、角色轮廓清晰而远景松弛留白。
   - 规划随剧情发展的 2~4 个色彩阶段（对应 `night` / `glow` / `warm` / `meadow`）。
3. **旁白与角色配音选角表（Voice Casting）**：
   - 为 `narrator`（旁白）及每个对话角色分配专属音色（如旁白用 `zh-CN-XiaoxiaoNeural` `speed: 0.92`，主角用 `zh-CN-YunxiaNeural` `speed: 0.96` 等）及字幕左侧专属色标 `accent`。

---

### Phase 2：故事分镜设计与镜头语言规划

将故事拆解为 **6 ~ 15 个分镜（Shot `01` ~ `NN`）**，遵循以下分镜准则：

1. **景别交替（Shot Scale Variety）**：
   - 相邻镜头必须有景别变化（远景环境建立 → 中景角色动作 → 微距特写关键物 → 近景情绪反应 → 全景收束），避免全片单调同景别。
2. **镜头动态属性标注**：
   - 为每个镜头指定：
     - `cue`（运镜）：`push`（缓推）/ `pull`（缓拉）/ `pan-right` / `pan-left` / `grow`（生长上移）/ `pulse`（呼吸微动）/ `still`（凝视）
     - `tone`（色调）：`night` / `glow` / `warm` / `meadow`
     - `fx`（程序化水彩氛围粒子）：`leaves`（落叶）/ `starlight`（星光微粒）/ `petals`（花瓣）/ `mist`（流雾）/ `ripples`（涟漪）/ `none`
3. **底部字幕安全区预留**：
   - 每个镜头的构图说明必须要求**底部 12%~15% 区域保持柔和简洁**，不放置关键面部或道具，专门留给绘本字幕。

---

### Phase 3：拆分各角色台词、TTS 语音合成与实测时长对齐（补充工程闭环）

> **关键原则**：必须**先生成语音并用 `ffprobe` 测量真实秒数**，再由真实语音时长决定每个镜头的总时长 `durSec` 和台词起始点 `atSec`，绝不能靠估算拍脑袋写死帧数！

1. **按「镜头 + 说话人」颗粒度拆分台词**：
   - 每个镜头内的旁白和每个角色的台词拆分为独立音频条目，命名格式为 `s<镜头号>-<角色缩写>.mp3`（如 `s01-narr.mp3`、`s03-fox.mp3`、`s07-narr.mp3`、`s07-fox.mp3`）。
   - 若同一镜头内同一角色分两段有明显动作间隔的台词，命名为 `s07-fox-1.mp3`、`s07-fox-2.mp3`。
2. **编写 `docs/<story-slug>/tts-manifest.json`**：
   - 按如下结构写入配音清单（留白建议：`prePadSec: 1.0`、`lineGapSec: 0.5`、`postPadSec: 1.0`）：
     ```json
     {
       "storySlug": "fox-starlight-seed",
       "speakers": {
         "narrator": { "voice": "zh-CN-XiaoxiaoNeural", "speed": 0.92, "pitch": "+0Hz" },
         "fox": { "voice": "zh-CN-YunxiaNeural", "speed": 0.96, "pitch": "+2Hz" }
       },
       "shots": [
         {
           "id": "01",
           "label": "秋夜森林",
           "prePadSec": 1.0,
           "postPadSec": 1.0,
           "lineGapSec": 0.5,
           "lines": [
             {
               "id": "s01-narr",
               "speaker": "narrator",
               "text": "秋夜，微风穿过森林。小狐狸阿狸还在落叶里寻找野山栗。"
             }
           ]
         }
       ]
     }
     ```
3. **执行 `scripts/tts_helper.py` 批量合成并自动回填实测时长**：
   - 若使用默认 `edge-tts`：
     ```bash
     python3 <path/to/skill>/scripts/tts_helper.py \
       --mode edge-tts \
       --manifest docs/<story-slug>/tts-manifest.json
     ```
   - 若用户提供了自部署 TTS 服务：
     ```bash
     python3 <path/to/skill>/scripts/tts_helper.py \
       --mode custom \
       --base-url "<USER_TTS_BASE_URL>" \
       --api-key "<OPTIONAL_KEY>" \
       --manifest docs/<story-slug>/tts-manifest.json
     ```
   - 脚本会自动将音频输出至 `public/<story-slug>/audio/`，调用 `ffprobe` 测量每段真实 `durSec`，并把计算好的 `atSec` 与镜头总时长 `shot.durSec` 回写到 `tts-manifest.json`。

---

### Phase 4：生成手绘水彩风格分镜素材与一致性控制（补充视觉闭环）

参考 `references/prompt-templates.md` 第 3 节的提示词拼接公式，先将完整提示词归档至 `docs/<story-slug>/prompts.md`，再执行生图：

1. **三段式提示词拼接（缺一不可）**：
   - **通用块 A（水彩画风 + 光色 + 角色固定外观锚点）**：确保每个有角色出场的镜头都包含完全相同的角色特征描述与负面限制。
   - **通用块 B（画幅与无文字安全区）**：强制 `16:9`（或用户指定的 `9:16`），严禁出现任何文字、水印、边框、多格漫画框；底部 12% 留空作字幕区。
   - **镜头专属块 C（单镜动作 + 景别构图 + 情绪）**。
2. **先出基准风格锚点图，再出全部分镜**：
   - 先生成最具代表性的第 1 张主角分镜图（或 `ref-style` 风格基准图）。
   - **分支 A：默认使用 Agent 自带 `generate_image` 工具（用户无 API Key）**
     - 调用 `generate_image`（设置 `AspectRatio: "16:9"` 或 `"9:16"`）。
     - 生成后续包含同一主角的分镜时，将已生成的基准图路径传入 `generate_image` 的 `ImagePaths` 参数作为视觉参考，以严格锁住主角长相与手绘水彩笔触！
     - 每生成完一张图，立即用 `scripts/image_api_helper.py` 转换并落位到 `public/<story-slug>/images/shot-XX.webp`：
       ```bash
       python3 <path/to/skill>/scripts/image_api_helper.py \
         --convert-in "<artifact_image_path>" \
         --out "public/<story-slug>/images/shot-01.webp" \
         --width 1920 --height 1080 --quality 85
       ```
   - **分支 B：使用用户提供的生图 API Key**
     - 调用 `scripts/image_api_helper.py` 生成并自动转为 `.webp`：
       ```bash
       python3 <path/to/skill>/scripts/image_api_helper.py \
         --provider openai \
         --api-key "$IMAGE_API_KEY" \
         --base-url "$IMAGE_BASE_URL" \
         --model "$IMAGE_MODEL" \
         --prompt "<完整三段式水彩提示词>" \
         --out "public/<story-slug>/images/shot-01.webp" \
         --width 1920 --height 1080
       ```

---

### Phase 5：检查素材与音频是否齐全（完整性门禁）

在编写或完成 Remotion 动画组件前后，**必须运行 `scripts/verify_story_assets.py` 进行自动化门禁检查**：

```bash
python3 <path/to/skill>/scripts/verify_story_assets.py \
  --story-slug "<story-slug>" \
  --manifest "docs/<story-slug>/tts-manifest.json" \
  --expected-shots <N>
```

**检查项清单**：
1. `public/<story-slug>/images/shot-01.webp` ~ `shot-NN.webp` 是否全部存在、非空且单图体积合规；
2. `public/<story-slug>/audio/` 下所有角色台词与旁白 `.mp3` 是否全部存在且非空；
3. `ffprobe` 实测时长与配置时长是否一致，镜头内部是否存在台词重叠或尾音超出 `shot.durSec` 被截断的情况；
4. 所有静态资源路径是否符合纯小写英文/数字/`-`/`_` 命名规范。

> 若门禁脚本返回任何 `errors`，**必须先补齐缺失的图片/音频或修正镜头时长**，再次运行直至 `"passed": true`。

---

### Phase 6：使用 Remotion 制作手绘水彩动画

参考 `references/remotion-watercolor-patterns.md` 第 3~4 节的代码模板：

1. **生成单一数据源 `src/videos/<StoryName>/shots.ts`**：
   - 将 `tts-manifest.json` 中经过实测校验的镜头数据、角色色标配置（`SPEAKERS`）、运镜指令（`cue`）、色调（`tone`）与水彩氛围粒子（`fx`）写入 `shots.ts`。
   - 由 `TIMELINE` 自动通过 `reduce` 累加计算每个镜头的 `fromFrame` 与 `durationInFrames`。
2. **生成多层手绘水彩动画组件 `src/videos/<StoryName>/StoryVideo.tsx`**：
   - **帧驱动运镜层**：基于 `useCurrentFrame()` 与 `interpolate(..., { extrapolateLeft: "clamp", extrapolateRight: "clamp" })` 实现平滑推拉摇移与镜头切换叠化（Cross-fade）。
   - **程序化水彩氛围层（`WatercolorFxLayer`）**：根据每镜的 `fx` 叠加随帧飘落的秋叶/花瓣、呼吸闪烁的星光微粒、扩散涟漪或流动薄雾，让水彩画面充满生命力而非静态幻灯片。
   - **水彩纸纹与柔边暗角层（`WatercolorPaperOverlay`）**：叠加 SVG 冷压水彩纸肌理与绘本画框柔化暗角。
   - **绘本角色字幕与音频轨道**：按时间轴挂载 `<Audio src={staticFile(line.file)} />` 与带角色色标的底部字幕。
3. **注册到 `src/Root.tsx`**：
   - 在 `src/Root.tsx` 中引入组件并注册 `<Composition id="<StoryName>" ... />`（保留项目内已有的其他视频 Composition，不要误删）。

---

### Phase 7：类型校验与引导用户在项目中预览（严禁主动渲染 MP4）

1. **执行 TypeScript 与资源校验**：
   ```bash
   npx tsc --noEmit
   ```
   确保没有任何 TypeScript 编译报错（如项目配置了 `npm run check:assets` 也可一并执行）。
2. **严禁主动渲染 MP4**：
   - **不要运行 `npx remotion render ... out/*.mp4`**，除非用户明确提出了导出 MP4 视频的要求。
3. **向用户交付并引导预览**：
   - 输出简洁清晰的完成报告：包含故事分镜表、角色与音色映射表、实测总时长、素材校验结果，以及核心文件链接（`shots.ts`、`StoryVideo.tsx`、`production.md`）。
   - 告知用户在项目根目录运行 `npm run dev` 打开 Remotion Studio 即可实时预览完整水彩动画效果，并说明如需调整单镜时长或台词只需修改 `shots.ts`。
