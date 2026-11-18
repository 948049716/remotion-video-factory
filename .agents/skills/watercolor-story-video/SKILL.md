---
name: watercolor-story-video
description: 将用户输入的故事转化为手绘水彩绘本风格的 Remotion 真动画视频。默认采用「Google Flow 首尾帧真动画协同模式（24fps）」：涵盖模型与协同偏好询问、角色视觉锚点与配音选角、3.5~8s 电影级分镜拆解（Beat Splitting）、TTS 配音与 ffprobe 实测时长对齐、匹配首尾关键帧生成、Google Flow 五段式英文提示词与可视化投喂工作台打包（支持 Google Drive 同步）、回传视频双层自动审片（verify_flow_clips.py 硬指标扫描 + 6宫格印相表 + Agent 多模态看片质检）以及 Remotion OffthreadVideo 多轨混音组装预览；同时保留纯本地 2D 骨骼/口型分层模式回退。
---

# 手绘水彩真动画故事视频工作流（Watercolor Story Animation Skill）

当用户提供一个故事（或故事大纲）并希望制作手绘水彩绘本风格的动画视频时，严格按照以下 **8 个阶段（Phase 0 ~ Phase 7）** 执行。

本工作流支持**双引擎模式**，默认优先采用 **「模式 A：Google Flow 首尾帧真动画协同模式（`flow-video`，24fps）」**，真正做出角色转头、伸手递物、眨眼说话与电影级连续运镜效果；当用户明确要求不生成视频切片时，可切换至 **「模式 B：2D 骨骼级联与真口型序列帧模式（`layered-2d`）」**。

---

## 核心约束（必须遵守）

1. **动画模式与协同方式确认**：
   - 默认推荐 **Google Flow 真动画协同模式（`flow-video`，`24fps`）**：由 Agent 全自动生成匹配的首尾关键帧原画、编写防抽卡五段式英文提示词并打包交互式投喂工作台（`flow-workbench.html` 及可选 Google Drive 同步），用户在 Google Flow 网页端生成视频后传回，由 Agent 执行**双层自动审片**并组装进 Remotion。
   - 若用户明确表示不使用 Google Flow / 外部视频生成，则使用 `layered-2d` 纯本地骨骼与语音口型包络分层模式。
2. **语音模型选择规则**：
   - 开始生成语音前，询问用户是否有自部署 TTS 服务（如 OpenAI 兼容 `/v1/audio/speech`、GPT-SoVITS、CosyVoice 等）；若无则默认使用 `scripts/tts_helper.py --mode edge-tts`。
3. **生图模型选择规则**：
   - 询问用户是否有外部生图 API Key；若无则默认使用 Agent 内置 `generate_image` 工具生成首尾关键帧，再用 `scripts/image_api_helper.py --convert-in` 转为 `1920×1080` WebP 落位到 `public/<story-slug>/images/`。
4. **预览优先、严禁主动渲染最终成片 MP4**：
   - **不要主动执行 `npx remotion render` 渲染输出整片 `.mp4` 文件**，除非用户在对话中明确要求导出 MP4。
   - 组装与门禁校验通过后，引导用户通过 Remotion Studio（`npm run dev`）实时预览效果。

---

## 完整工作流总览（Google Flow 真动画主力路径）

```text
[用户给出故事]
      │
      ▼
Phase 0: 前置配置询问 & Remotion 工程环境检查
      │  ├─ 确认动画模式（默认 Google Flow 真动画 24fps vs 纯本地 2D 分层）与文件交接方式（本地工作台/上传 vs Google Drive）
      │  ├─ 询问 TTS 方案（自部署接口 vs 默认 edge-tts）与生图方案（API Key vs 默认内置 generate_image）
      │  └─ 检查 Remotion 项目与内置真动画引擎 (src/engine/)
      ▼
Phase 1: 故事解析、角色视觉锚点表 (Character Bible) & 配音选角表 (Voice Casting)
      │  ├─ 固定每个角色的外观描述块与负面排除项（跨镜头零变脸）
      │  └─ 设定全片色彩情绪演进（Color Script）与角色差异化音色/语速/色标
      ▼
Phase 2: 电影级短镜头分镜拆解 (Beat Splitting: 每镜 3.5s ~ 8.0s)          ★真动画核心
      │  ├─ 将长句旁白与多轮对白拆分为 3.5s~8.0s 的单一动作短镜头（正反打/特写/建立镜头交替）
      │  └─ 规划每镜首帧姿态 (Start Pose)、可选匹配尾帧姿态 (End Pose) 与原生环境音策略 (keepAudio)
      ▼
Phase 3: 台词拆分、TTS 语音合成（含语音包络）& ffprobe 实测时长排算
      │  ├─ 生成 docs/<story-slug>/tts-manifest.json 并运行 scripts/tts_helper.py --with-envelope
      │  └─ 校验所有 Google Flow 目标镜头总长均 <= 8.0s（超长镜头立即二次拆镜）
      ▼
Phase 4: 首尾关键帧生成、Animatic 预组装 & Google Flow 投喂包构建         ★真动画核心
      │  ├─ 生成角色基准图与每镜首帧 shot-XX-start.webp（姿态转换镜同步生成同机位尾帧 shot-XX-end.webp）
      │  ├─ 用 src/engine/StoryTimelinePlayer 先行挂载 Animatic（此时已可预览全片配音与首尾帧节奏）
      │  └─ 运行 scripts/flow_pack_helper.py --build-pack 产出五段式英文 Prompt、flow-workbench.html（及可选推送到 Google Drive）
      ▼
Phase 5: 用户 Google Flow 生成回传 & 双层自动审片门禁 (2-Stage Video QA)   ★真动画核心
      │  ├─ 第一关（硬检入库）：运行 scripts/verify_flow_clips.py --ingest 校验画幅/时长覆盖/首尾帧相关度/跳切峰值，
      │  │   自动生成 6 宫格印相表并将合格切片转码为 24fps H.264 (<8MB) 落位 public/<slug>/video/shot-XX.mp4
      │  └─ 第二关（多模态看片）：Agent 调用 view_file 直接观看 .mp4 与 6 宫格印相表，核查五官/手部/水彩画风/环境音；
      │      对不合格单镜直接输出修复版英文 Prompt 供用户单独补生，直至全片达标
      ▼
Phase 6: Remotion 24fps 真动画多轨合成与完整性门禁
      │  ├─ 基于 src/engine/StoryTimelinePlayer 自动热替换为 <OffthreadVideo> 真视频切片，挂载转场、BGM 闪避与 SFX
      │  └─ 运行 scripts/verify_story_assets.py --require-video 与 npm run check 校验零缺失、零超标
      ▼
Phase 7: 代码规范检查与 Remotion Studio 预览交付（不主动渲染整片 MP4）
         ├─ 运行 npm run lint (eslint src && tsc) 确保零编译与规范错误
         └─ 归档 docs/<story-slug>/production.md 并引导用户在 Remotion Studio 预览成片
```

---

## 阶段详细执行指南

### Phase 0：前置配置询问与工程检查

1. 使用 `ask_question`（或简洁提问）一次性确认：
   - **动画制作模式**：`(Recommended) Google Flow 真动画协同模式（24fps）` 还是 `纯本地 2D 分层关节模式`？
   - **Google Flow 素材交接方式**（选 Flow 模式时）：通过**本地工作台 + 聊天窗口直接上传视频**，还是通过已连接的 **Google Drive 文件夹自动同步**？
   - **语音（TTS）与生图模型**：默认 `edge-tts` + Agent 内置 `generate_image`，或使用用户自备接口。
   - **画幅比例**：默认横屏 `16:9`（`1920×1080`，Flow 模式 `24fps` / 纯 2D 模式 `30fps`），可选 `9:16`。
2. 确定故事标识符：`StoryName`（PascalCase）与 `story-slug`（kebab-case）。

---

### Phase 1：角色视觉锚点表与配音选角表

阅读 `references/prompt-templates.md` 第 1~2 节，建立 `docs/<story-slug>/production.md`：
1. **角色视觉锚点设定表（Character Visual Bible）**：锁定每个角色不可变的发型、五官、服装、标志配件及核心道具比例锚点。
2. **全片手绘水彩色彩脚本（Color Script）**与**角色差异化配音选角表（Voice Casting）**。

---

### Phase 2：电影级短镜头分镜拆解（Beat Splitting）

阅读 `references/google-flow-workflow.md` 第 1~2 节：
1. **严控单镜时长（Flow 模式下每镜 `3.5s ~ 8.0s`）**：
   - 将故事拆解为节奏明快的短镜头序列，保证**每条视频切片只执行一个干净连贯的动作**（如：推门而入 → 走近柜台放下木盒 → 抬头开口询问 → 匠人停下螺丝刀抬头回应）。
   - 相邻镜头交替景别（远景/全景/中景/近景/微距特写）。
2. **标定首尾帧与音频保留策略**：
   - 单纯微动或说话镜头：使用单首帧 `shot-XX-start.webp`；
   - 包含明显肢体姿态起止变化的镜头：同时规划同机位匹配的 `shot-XX-start.webp` 与 `shot-XX-end.webp`；
   - 有角色对白的镜头设 `keepAudio: "none"`（后续剥离 Flow 自带假外语，贴中文 TTS）；无对白动作/空镜设 `keepAudio: "ambient"`（保留纯净雨声、钟表声等原生拟音）。

---

### Phase 3：TTS 语音合成与 `ffprobe` 实测时间轴排算

1. 按「镜头 + 说话人」编写 `docs/<story-slug>/tts-manifest.json`（Flow 短镜头建议 `prePadSec: 0.5~0.7`、`postPadSec: 0.6~0.8`）。
2. 运行 `scripts/tts_helper.py` 批量合成、提取语音能量包络并回填实测秒数：
   ```bash
   python3 .agents/skills/watercolor-story-video/scripts/tts_helper.py \
     --mode edge-tts --with-envelope --envelope-fps 24 \
     --manifest docs/<story-slug>/tts-manifest.json
   ```
3. **8 秒红线复核**：若实测后发现某镜 `durSec > 8.0s`，立即将该镜按句号/停顿拆成两个相邻镜头，绝不让单个 Flow 视频硬撑超过 8 秒。

---

### Phase 4：生成匹配首尾关键帧 & 构建 Google Flow 投喂包

1. **生成水彩首尾关键帧**：
   - 先生成风格与主角基准图 `ref-style.webp`；
   - 依次生成每镜首帧并转为 `public/<story-slug>/images/shot-XX-start.webp`；
   - 对需要尾帧锁定的镜头，**必须将 `shot-XX-start.webp` 作为参考底图传入 `generate_image`**，仅修改人物动作终点姿态，生成同机位、同背景、同光照的 `shot-XX-end.webp`。
2. **生成 Google Flow 投喂工作台（`flow-video` 模式）**：
   - 初始化清单：`python3 .agents/skills/watercolor-story-video/scripts/flow_pack_helper.py --init --tts-manifest docs/<story-slug>/tts-manifest.json --story-name <StoryName>`
   - 按照 `references/google-flow-workflow.md` 第 2 节五段式公式完善 `docs/<story-slug>/flow-manifest.json` 中每镜的英文 `motionPrompt`。
   - 校验并一键打包：
     ```bash
     python3 .agents/skills/watercolor-story-video/scripts/flow_pack_helper.py \
       --build-pack --manifest docs/<story-slug>/flow-manifest.json
     ```
   - 若用户指定了 Google Drive 同步文件夹，附加 `--gdrive-push --folder-id <FOLDER_ID>` 上传投喂包；同时可在对话中附上工作台说明，请用户在 Google Flow（`Video > Frames`，`Outputs: 1`）中生成视频并回传。
   - *(若采用 `layered-2d` 模式，则按 `scripts/layer_helper.py` 拆分透明图层与干净背景板)*。

---

### Phase 5：Google Flow 视频回传与双层自动审片（2-Stage QA Gate）

当用户将生成的视频放入 `assets/<StoryName>/flow-inbox/`、上传至聊天窗口（`/home/antigravity/upload/`）或放入 Google Drive（先运行 `flow_pack_helper.py --gdrive-pull` 拉回）后：

1. **第一关：脚本硬指标检测、印相表生成与自动转码入库**：
   ```bash
   uv run --with pillow --with numpy python3 .agents/skills/watercolor-story-video/scripts/verify_flow_clips.py \
     --manifest docs/<story-slug>/flow-manifest.json --ingest
   ```
   核查分辨率、时长覆盖率、首尾帧相似度、防静止与防跳切峰值，将合格原片标准化转码为 `24fps`、`H.264 (<8MB)` 存入 `public/<story-slug>/video/shot-XX.mp4`。
2. **第二关：Agent 多模态导演级看片审片（严禁跳过！）**：
   - 对每个通过第一关的镜头，Agent **必须调用 `view_file` 查看入库后的 `.mp4` 视频以及 `assets/<StoryName>/flow-pack/contact-sheets/shot-XX-sheet.webp` 6 宫格印相表**。
   - 对照 `references/google-flow-workflow.md` 第 5 节检查五官/服饰守恒、手部物理结构、水彩画风稳定性、口型动作时机与原生环境音干净度。
   - 向用户反馈《分镜视频质检结果表》：若存在穿模或变脸单镜，当场按照修复处方给出改写后的英文 Prompt（或补齐尾帧图），请用户仅重跑对应单镜，直到全部通过。

---

### Phase 6：Remotion 真动画组装与工程完整性门禁

参考 `references/remotion-watercolor-patterns.md` 第 1.5 节：
1. 使用仓库内置 `src/engine/`（`StoryTimelinePlayer` + `buildStoryTimeline`）编写精简声明式的 `src/videos/<StoryName>/shots.ts` 与 `StoryVideo.tsx`（`FPS = 24`，配置每镜 `clip` 的 `sourceDurSec`、`playbackRate`、`keepAmbientAudio`、转场与可选 `soundscape` BGM/SFX），并在 `src/Root.tsx` 注册 Composition。
2. 运行故事资产与仓库静态资产双重门禁校验：
   ```bash
   python3 .agents/skills/watercolor-story-video/scripts/verify_story_assets.py \
     --story-slug "<story-slug>" \
     --manifest "docs/<story-slug>/tts-manifest.json" \
     --flow-manifest "docs/<story-slug>/flow-manifest.json" \
     --require-video
   npm run check
   ```

---

### Phase 7：代码规范校验与 Remotion Studio 预览交付

1. 运行 `npm run lint`（`eslint src && tsc`）确保零 ESLint 与 TypeScript 错误。
2. **严禁主动执行 `npx remotion render` 导出整片 `.mp4`**（除非用户明确要求）。
3. 更新归档 `docs/<story-slug>/production.md` 与 `assets/<StoryName>/README.md`，告知用户通过 `npm run dev` 在 Remotion Studio 预览完整 24fps 真动画效果。
