# 🎬 Remotion Video Factory (AI 视频中央工坊)

这是一个基于 **Remotion v4 + React 19 + TypeScript** 构建的**多视频中央工坊（Multi-Video Monorepo）**。

通过将本仓库托管在 GitHub，您可以随时让不同的 AI Agent 拉取本项目，在各自独立的子目录（`src/videos/<VideoName>/`）中开发全新的视频作品，并共享底层的物理弹簧预设、3D 空间组件、音效合成器与渲染环境。

---

## 📂 仓库目录结构

```text
remotion-video/
├── AGENTS.md                         # AI Agent 专属开发规范（Agent 进入仓库会自动读取）
├── TODO.md                           # ★ 项目唯一待办清单（含待办规范与验收标准）
├── public/                           # 静态公共资产池（音频、字体、图标）
│   └── showreel-music.mp3            # 120 BPM 定制电音 + 画面同步 SFX 音轨
├── scripts/
│   ├── generate_music.py             # 纯 Python 零依赖电子音乐与 SFX 音效合成器
│   └── generate_tts.py               # ★ 统一 TTS 入口（调用 NAS 上的 edge-tts 服务）
├── src/
│   ├── shared/                       # 跨视频复用的公共动效库
│   │   ├── motion-presets.ts         # 大师级弹簧物理参数、Bezier 曲线与精选调色板
│   │   └── GlobalOverlay.tsx         # 通用自适应 SMPTE 时间码与节拍器 HUD
│   │
│   ├── videos/                       # ★ 所有视频项目按目录隔离存放于此
│   │   ├── Showreel/                 # [标杆作品] 60 FPS 动态设计总监个人作品集 (30s)
│   │   │   ├── Showreel.tsx
│   │   │   └── scenes/               # 6 大无缝转场视觉篇章
│   │   └── HelloWorld/               # [入门模版] 基础示例组件
│   │
│   ├── Root.tsx                      # 中央视频注册表（所有 Composition 统一在此登记）
│   └── index.ts
└── package.json
```

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动可视化交互工作台 (Remotion Studio)
```bash
npm run dev
```
浏览器打开 `http://localhost:3000`，在左侧边栏的 **`Productions`** 文件夹下即可点击预览不同的视频作品。

### 3. 渲染导出高清 MP4 视频
```bash
# 导出 Showreel 作品集
npx remotion render Showreel out/showreel.mp4

# 导出其他指定 ID 的视频
npx remotion render <CompositionId> out/<filename>.mp4
```

---

## 🗣️ 语音合成（TTS）统一规范

本项目所有需要人声 / 旁白 / 配音的音频，**一律使用 NAS 上部署的 edge-tts 服务**（OpenAI 兼容接口），不引入其他 TTS 方案。

| 场景 | Base URL | Swagger 文档 |
| --- | --- | --- |
| 局域网内电脑（推荐） | `http://192.168.0.2:5055/v1` | `http://192.168.0.2:5055/docs` |
| 公网 / 远程电脑 | `https://tts.miong.dpdns.org:9481/v1` | `https://tts.miong.dpdns.org:9481/docs` |

```bash
# 自动探测：同局域网走内网，否则回退公网
python3 scripts/generate_tts.py --text "欢迎来到 Remotion 视频工坊" --out public/voiceover.mp3

# 指定音色 / 语速 / 端点
python3 scripts/generate_tts.py --text "旁白" --voice zh-CN-YunxiNeural --speed 1.1 \
    --out public/narration.mp3 --endpoint lan     # 或 --endpoint public

# 查看音色
python3 scripts/generate_tts.py --list-voices --lang zh
```

接口：`POST {BaseURL}/audio/speech`，请求体 `{"model":"tts-1","input":"...","voice":"zh-CN-XiaoxiaoNeural","response_format":"mp3","speed":1.0}`，返回音频二进制；音频写入 `public/` 后以 `staticFile("voiceover.mp3")` 引用。

> ⚠️ 已知问题：公网端点当前不可达（内网端点正常），详见 [`TODO.md`](TODO.md) 中的 `TODO-001`。

---

## 📋 项目待办规范

所有待办**统一登记在 [`TODO.md`](TODO.md)**，它是唯一可信来源，不允许另建平行待办文件。规范要点（完整版见 [`AGENTS.md`](AGENTS.md) 第 3 节）：

- **编号**：`TODO-001` 起全局递增，永不复用。
- **状态**：`[ ]` 待办 / `[~]` 进行中 / `[!]` 阻塞（须写阻塞原因与解除条件）/ `[x]` 已完成。
- **必填字段**：登记日期、影响范围、现象、复现步骤、根因分析、期望结果、**验收标准**、临时绕过方案、相关文件。
- **验收标准必须可命令判定**，它是标记完成与否的唯一依据。
- **完成后归档不删除**，保留编号以便追溯；涉及待办的 commit 正文引用编号。

---

## 🤖 如何让不同的 AI Agent 在此仓库做新视频？

当您开启一个新的 Agent 任务时，只需向它发送类似如下的 Prompt：

> **Prompt 模板**：
> “请拉取本仓库，参考 `AGENTS.md` 和 `src/videos/Showreel/` 的动效标准，在 `src/videos/ProductLaunch/` 目录下帮我制作一个 15 秒（60fps）的产品发布宣传视频，并在 `src/Root.tsx` 的 `Productions` 文件夹下注册为 `ProductLaunch`。”
