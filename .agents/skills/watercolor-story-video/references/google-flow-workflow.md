# Google Flow 真动画协同生产与双层审片指南

本文档定义在 `watercolor-story-video` 工作流中，如何结合 **Google Flow（底层模型 Veo 3.1 / Gemini Omni Flash）** 与 **Remotion 24fps 真动画合成引擎 (`src/engine/`)** 产出电影级手绘水彩动画。

---

## 1. 核心理念：如何把 Google Flow 的“抽卡率”压到最低？

1. **短镜头单动作拆解（Beat Splitting · 每镜 `3.5s ~ 8.0s`）**
   - Google Flow 单次生成的最佳黄金长度为 **`4s / 6s / 8s`**，且每条视频**只能承载一个清晰的连续动作**。
   - 严禁像静态 PPT 那样让一个镜头硬撑 20～35 秒。遇到长段旁白或多轮对话时，必须在分镜阶段按句群停顿拆分为多个短镜头（例如：`全景建立 5s -> 人物手部特写 4s -> 抬头对话正打 6s -> 对方倾听反打 5s`）。
2. **首尾双帧锁死（Matched Start & End Frames）**
   - 在 Flow 中优先使用 **`Video -> Frames`** 模式（而非纯文本 `Text to Video`）：
     - **微动/说话镜头**：挂载高一致性的 `shot-XX-start.webp`（单首帧驱动）；
     - **姿态转换镜头**（如“停下螺丝刀抬头”、“伸手递出八音盒”）：先生成 `shot-XX-start.webp`，再**以 `start` 图作为参考底图生成同机位、同背景、同光照的匹配尾帧 `shot-XX-end.webp`**，同时挂载到 Flow 的 `+ Add start frame` 与 `+ Add end frame`。起点与终点锁死后，模型只负责中间物理过渡，几乎不会崩脸或乱切场景。
3. **帧率原生对齐（`24fps`）**
   - Google Flow 输出视频原生为 **`24fps`**。Remotion Composition 统一设为 `DEFAULT_FLOW_FPS = 24`，彻底消除 `24 -> 30fps` 重复帧微顿。

---

## 2. Google Flow 五段式英文提示词公式（Prompt Formula）

当已经挂载了首帧（或首尾帧）时，**切忌在英文 Prompt 中重新长篇抄写画面里已有的静态背景摆设**（否则会干扰运动注意力甚至引发重绘）。应严格遵循 **“只描述运动与变化”** 原则，按以下 **5 段顺序**编写英文 `motionPrompt`：

```text
[1. Camera 明确机位与运镜] + [2. Single Action 单一连贯角色动作] + [3. Micro-Physics 环境物理微动] + [4. Style Lock 2D手绘水彩动画锁风词]
[5. Audio & Text Guard 原生音效控制与禁烧录字幕指令]
```

### 2.1 标准示例 A：动作与反应镜头（无角色说话，保留纯净环境拟音）
- **配置**：`keepAudio: "ambient"`，`flowMode: "frames"`，`flowDurationSec: 6`
```text
Static medium shot. The elderly repairman pauses turning the brass screwdriver, slowly raises his head toward the doorway on the right, and blinks gently with a calm, attentive expression. Behind him on the wooden wall, two brass clock pendulums swing steadily in rhythm, warm desk lamp glow breathing softly. Hand-painted 2D watercolor storybook animation, cold-pressed paper grain, consistent ink-and-colored-pencil linework, subtle 2D cel motion.
Ambient noise: quiet antique clock ticking, gentle rain pattering outside. SFX: soft metallic click as the screwdriver stops. No dialogue, no speech, no background music, no subtitles, no on-screen text.
```

### 2.2 标准示例 B：角色开口对白镜头（让嘴型自然匹配中文 TTS 时长，回传后静音原轨）
- **配置**：`keepAudio: "none"`，`hasDialogue: true`，`flowMode: "frames"`，`flowDurationSec: 4`
```text
Locked-off medium close-up shot. Holding the wrapped wooden box against her chest, the young schoolgirl looks up hopefully and speaks gently for 3 seconds with natural lip movement and a slight earnest nod, then closes her mouth softly while waiting for an answer. Light rain mist drifts outside the doorway behind her, soft cloth curtain swaying slightly. Hand-painted 2D watercolor storybook animation, cold-pressed paper grain, consistent ink-and-colored-pencil linework, subtle 2D cel motion.
No background music, no subtitles, no on-screen text, no watermark.
```

---

## 3. Google Flow 网页端省积分防坑清单（随投喂包提示用户）

1. **先切模式再点生成**：打开 Flow 项目时输入框默认选中的是生图模型（如 `Nano Banana`），务必先点击左下角模型栏切换为 **`Video -> Frames`**（多角色复杂新构图可用 `Video -> Ingredients`）。
2. **输出条数设为 `1`（`Outputs: 1`）**：Flow 若开启每次生成 2～4 条会成倍消耗每日积分；首尾帧锁死后单条成功率很高，保持 `Outputs: 1` 最省额度。
3. **时长精确选档**：对照 `flow-workbench.html` 卡片上的标记选择 `4s / 6s / 8s`（只要大于等于镜头配音秒数的 `85%` 即可，微小差值由 Remotion 自动无感微调速率对齐）。

---

## 4. `docs/<story-slug>/flow-manifest.json` 字段规范

可先通过 `flow_pack_helper.py --init --tts-manifest docs/<slug>/tts-manifest.json` 自动生成骨架，再补全每镜的精细英文动作提示词：

```json
{
  "storySlug": "old-chen-demo",
  "storyName": "OldChenDemo",
  "fps": 24,
  "recommendedModel": "Veo 3.1 / Gemini Omni Flash (Video > Frames, Outputs = 1)",
  "shots": [
    {
      "id": "01",
      "label": "雨夜修理铺",
      "flowMode": "frames",
      "aspectRatio": "16:9",
      "outputs": 1,
      "targetDurSec": 5.4,
      "flowDurationSec": 6,
      "needsBeatSplit": false,
      "hasDialogue": false,
      "keepAudio": "ambient",
      "startFrame": "public/old-chen-demo/images/shot-01-start.webp",
      "endFrame": null,
      "ingredients": [],
      "dialoguePreview": "老陈的修理铺开在老街尽头。",
      "motionPrompt": "Slow gentle push-in wide shot. Raindrops patter lightly..."
    }
  ]
}
```

构建投喂包命令：
```bash
python3 .agents/skills/watercolor-story-video/scripts/flow_pack_helper.py \
  --build-pack --manifest docs/<story-slug>/flow-manifest.json
```
产出物：
- `docs/<story-slug>/flow-prompts.md`：Markdown 版提示词档案；
- `assets/<StoryName>/flow-pack/frames/`：整理好的首尾帧图；
- `assets/<StoryName>/flow-pack/flow-workbench.html`：带图片预览、参数徽章与**一键复制 Prompt** 的可视化工作台；
- `assets/<StoryName>/flow-inbox/`：供用户放入下载好的 `.mp4` 原片（若用户使用 Google Drive 同步，可加 `--gdrive-push --folder-id <ID>` 与 `--gdrive-pull --folder-id <ID>`）。

---

## 5. 视频回传后的「双层审片与返工闭环」

当用户把 Google Flow 生成的视频放入 `assets/<StoryName>/flow-inbox/`（或上传到聊天窗口 / Google Drive）后，必须按顺序执行以下两道质检：

### 第一关：运行 `verify_flow_clips.py` 硬指标扫描与自动入库
```bash
uv run --with pillow --with numpy python3 .agents/skills/watercolor-story-video/scripts/verify_flow_clips.py \
  --manifest docs/<story-slug>/flow-manifest.json --ingest
```
脚本自动完成：
1. 校验分辨率、`16:9` 比例、帧率、音视频流完整性；
2. 校验视频时长是否足以覆盖 TTS 台词，自动计算 `playbackRate`（`0.84 ~ 1.0`）；
3. 比对视频首帧/尾帧与投喂图的皮尔逊相关系数（拦截漏挂首帧或挂错镜头）；
4. 扫描运动能量曲线（拦截整段静止假视频与中途乱切机位 `spike`）；
5. 在 `assets/<StoryName>/flow-pack/contact-sheets/shot-XX-sheet.webp` 生成 `3×2` 高清 6 宫格印相表；
6. 将硬检通过的切片转码为 `24fps`、`H.264 (<8MB)` 写入 `public/<story-slug>/video/shot-XX.mp4`（`keepAudio: "none"` 的镜头自动剥离假外语音轨），并输出 `docs/<story-slug>/qa-report.md`。

### 第二关：Agent 多模态导演级审片（必做！）
脚本通过后，Agent **必须调用 `view_file` 直接查看 `.mp4` 视频与对应的 `shot-XX-sheet.webp` 6 宫格印相表**，逐镜确认：
1. **五官与服饰一致性**：人物是否在中途变脸、丢眼镜或换衣服？
2. **手部与道具物理结构**：手指有无粘连多指？工具/盒子有无悬空穿模？
3. **水彩画风守恒**：是否全程维持手绘水彩纸面质感（未突变为写实 3D 塑料感）？
4. **动作与口型匹配**：核心动作是否自然完成？说话镜头的嘴部张合区间是否与中文台词时段吻合？
5. **环境音干净度**：若保留了 `keepAudio: "ambient"`，原片环境声中是否混入了胡言乱语或背景音乐？（若有杂音，只需在 `shots.ts` 中将 `keepAmbientAudio` 改为 `false` 即可无损救回画面！）

### 常见瑕疵的修复版 Prompt 改写策略（返工单镜时使用）

| 审片发现的问题 | 修复动作与 Prompt 改写处方 |
| :--- | :--- |
| **中途乱切机位 / 镜头乱晃** | 句首改为强锁定词：`Locked-off static tripod shot, single continuous unbroken take, no camera cuts.` |
| **人物转头或大幅动作后变脸** | 为该镜补生一张同机位匹配尾帧 `shot-XX-end.webp`，改用 **首尾双帧夹逼** 替代单首帧自由发散 |
| **手部拿取细小零件时手指畸变** | 缩短手指复杂捻动描写，改为整手稳定持握姿态（如 `holds the wooden box steadily with both hands`），或将该动作拆为中景 + 道具特写两镜 |
| **动起来后水彩线条消失、变 3D 渲染感** | 强化锁风词：`2D traditional hand-painted watercolor cel animation on textured paper, visible pencil outlines throughout, flat 2D storybook shading, not 3D CGI.` |
| **画面底部出现乱码字幕** | 删除提示词中任何暗示字幕/文字的词汇，末尾固定保留 `No subtitles, no captions, no text anywhere in frame.` |
