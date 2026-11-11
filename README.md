# 🎬 Remotion Video Factory (AI 视频中央工坊)

这是一个基于 **Remotion v4 + React 19 + TypeScript** 构建的**多视频中央工坊（Multi-Video Monorepo）**。

通过将本仓库托管在 GitHub，您可以随时让不同的 AI Agent 拉取本项目，在各自独立的子目录（`src/videos/<VideoName>/`）中开发全新的视频作品，并共享底层的物理弹簧预设、3D 空间组件、音效合成器与渲染环境。

---

## 📂 仓库目录结构

```text
remotion-video-factory/
├── AGENTS.md                         # AI Agent 专属开发规范（Agent 进入仓库会自动读取）
├── TODO.md                           # ★ 项目唯一待办清单（含待办规范与验收标准）
├── assets/                           # ① 素材库：原始素材，不入 git，不参与渲染
│   ├── README.md                     #    素材库使用规范（三层分离、加工要求）
│   ├── _inbox/                       #    临时投料区，归档后清空
│   ├── _template/                    #    素材清单模板（复制到 <VideoName>/）
│   └── <VideoName>/                  #    与 src/videos/<VideoName>/ 同名
│       ├── README.md                 #    ★ 素材清单（必填、入库）
│       └── video/ audio/ images/ fonts/ docs/
├── public/                           # ② 运行时资产：代码可 staticFile() 读取，入 git
│   ├── _shared/audio/                #    跨视频共用（如 showreel-music.mp3）
│   └── <video-name>/                 #    每支视频一个子目录
│       └── audio/ images/ fonts/ video/
├── output/                           # ③ 渲染成品（已 gitignore）
├── scripts/
│   ├── check-assets.py               # ★ 静态资产规范校验（命名/体积/引用/清单）
│   ├── generate_music.py             # 纯 Python 零依赖电子音乐与 SFX 音效合成器
│   └── generate_tts.py               # ★ 统一 TTS 入口（调用 NAS 上的 edge-tts 服务）
├── src/
│   ├── shared/                       # 跨视频复用的公共动效库
│   │   ├── motion-presets.ts         # 大师级弹簧物理参数、Bezier 曲线与精选调色板
│   │   └── GlobalOverlay.tsx         # 通用自适应 SMPTE 时间码与节拍器 HUD
│   ├── videos/                       # ★ 所有视频项目按目录隔离存放于此（当前为空）
│   ├── Root.tsx                      # 中央视频注册表（所有 Composition 统一在此登记）
│   └── index.ts
└── package.json
```

> **当前仓库暂无任何已注册作品**：`src/videos/` 与 `src/Root.tsx` 的 `Productions` / `Templates` 文件夹均为空。新建视频的步骤见文末「如何让不同的 AI Agent 在此仓库做新视频」。

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
浏览器打开 `http://localhost:3000`。当前仓库**尚无已注册作品**，左侧边栏的 `Productions` / `Templates` 文件夹为空；新建并注册 Composition 后即可在此预览。

### 3. 渲染导出高清 MP4 视频
```bash
# 导出指定 Composition（需先在 src/Root.tsx 注册）
npx remotion render <CompositionId> output/<filename>.mp4
```

---

## 🗂️ 静态资产规范（三层分离）

Remotion 的 `staticFile()` **只能读 `public/`**，所以「素材」和「成品运行时用的文件」必须物理分开，否则仓库会被原始大文件撑爆、代码也会误引用未加工素材。

| 层 | 路径 | 放什么 | 入 git | 参与渲染 |
| --- | --- | --- | --- | --- |
| ① 素材库 | `assets/` | 原始拍摄、录屏、原始音乐、设计稿、参考图、字体源文件、授权文本 | **否**（只提交各 `<VideoName>/README.md` 清单） | 否 |
| ② 运行时资产 | `public/` | 已裁剪 / 转码 / 优化、代码可直接读取的文件 | 是 | 是 |
| ③ 渲染成品 | `output/` | `npx remotion render` 产出的 mp4 | 否 | — |

**判断口诀**：给「人或 Agent 挑选用」→ `assets/`；给「代码 `staticFile()` 用」→ `public/`。

```text
assets/<VideoName>/           # 与 src/videos/<VideoName>/ 同名
├── README.md                 # ★ 素材清单：来源 / 授权 / 尺寸 / 用途 / 加工去向
└── video/ audio/ images/ fonts/ docs/

public/<video-name>/          # kebab-case，代码里带子目录前缀引用
└── audio/ images/ fonts/ video/
public/_shared/               # 跨视频共用
```

```tsx
// ✅ 正确
<Audio src={staticFile("product-launch/audio/voiceover.mp3")} />
<Img src={staticFile("_shared/images/logo.webp")} />
```

**硬性约束**

1. 素材**不得**被 `staticFile()` 直接引用，进 `public/` 前必须加工：视频 → H.264/`yuv420p`/`.mp4`；音频 → `.mp3` 192 kbps；图片 → `.webp`（或 `.jpg`）；字体 → `.woff2`。
2. `public/` 单文件 ≤ **10 MB**，超出必须切片段或降码率。
3. `public/` 文件名只用小写英文、数字、`-`、`_`、`.`，禁止中文 / 空格 / 大写。
4. 每个 `assets/<VideoName>/README.md` 必须登记素材清单，模板见 `assets/_template/README.md`。

**提交前自检**

```bash
npm run check:assets     # 命名 / 体积 / staticFile 引用缺失 / 孤儿资产 / 清单缺失 / 素材误入库
npm run check            # check:assets + tsc --noEmit
```

详细规范见 [`assets/README.md`](assets/README.md) 与 [`AGENTS.md`](AGENTS.md) §1.4。

---

## 🗣️ 语音合成（TTS）统一规范

本项目所有需要人声 / 旁白 / 配音的音频，**一律使用 NAS 上部署的 edge-tts 服务**（OpenAI 兼容接口），不引入其他 TTS 方案。

| 场景 | Base URL | Swagger 文档 |
| --- | --- | --- |
| 局域网内电脑（推荐） | `http://192.168.0.2:5055/v1` | `http://192.168.0.2:5055/docs` |
| 公网 / 远程电脑 | `https://tts.miong.dpdns.org:9481/v1` | `https://tts.miong.dpdns.org:9481/docs` |

```bash
# 自动探测：同局域网走内网，否则回退公网
python3 scripts/generate_tts.py --text "欢迎来到 Remotion 视频工坊" \
    --out public/<video-name>/audio/voiceover.mp3

# 指定音色 / 语速 / 端点
python3 scripts/generate_tts.py --text "旁白" --voice zh-CN-YunxiNeural --speed 1.1 \
    --out public/<video-name>/audio/narration.mp3 --endpoint lan   # 或 --endpoint public

# 查看音色
python3 scripts/generate_tts.py --list-voices --lang zh
```

接口：`POST {BaseURL}/audio/speech`，请求体 `{"model":"tts-1","input":"...","voice":"zh-CN-XiaoxiaoNeural","response_format":"mp3","speed":1.0}`，返回音频二进制；音频写入 `public/<video-name>/audio/` 后以 `staticFile("<video-name>/audio/voiceover.mp3")` 引用。

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
> “请拉取本仓库，参考 `AGENTS.md`（含 §1.4 静态资产规范）与 `src/shared/motion-presets.ts` 的动效标准，在 `src/videos/ProductLaunch/` 目录下帮我制作一个 15 秒（60fps）的产品发布宣传视频，并在 `src/Root.tsx` 的 `Productions` 文件夹下注册为 `ProductLaunch`。”
