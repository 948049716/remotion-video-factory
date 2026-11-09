# 🎬 Remotion Video Factory (AI 视频中央工坊)

这是一个基于 **Remotion v4 + React 19 + TypeScript** 构建的**多视频中央工坊（Multi-Video Monorepo）**。

通过将本仓库托管在 GitHub，您可以随时让不同的 AI Agent 拉取本项目，在各自独立的子目录（`src/videos/<VideoName>/`）中开发全新的视频作品，并共享底层的物理弹簧预设、3D 空间组件、音效合成器与渲染环境。

---

## 📂 仓库目录结构

```text
remotion-video/
├── AGENTS.md                         # AI Agent 专属开发规范（Agent 进入仓库会自动读取）
├── public/                           # 静态公共资产池（音频、字体、图标）
│   └── showreel-music.mp3            # 120 BPM 定制电音 + 画面同步 SFX 音轨
├── scripts/
│   └── generate_music.py             # 纯 Python 零依赖电子音乐与 SFX 音效合成器
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

## 🤖 如何让不同的 AI Agent 在此仓库做新视频？

当您开启一个新的 Agent 任务时，只需向它发送类似如下的 Prompt：

> **Prompt 模板**：
> “请拉取本仓库，参考 `AGENTS.md` 和 `src/videos/Showreel/` 的动效标准，在 `src/videos/ProductLaunch/` 目录下帮我制作一个 15 秒（60fps）的产品发布宣传视频，并在 `src/Root.tsx` 的 `Productions` 文件夹下注册为 `ProductLaunch`。”
