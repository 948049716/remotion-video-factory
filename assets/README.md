# assets/ — 素材库（Source Materials）

> **本目录存放「做视频用的素材」，不是「成品运行时需要的文件」。**
> 这里的文件**永远不会**被 `staticFile()` 读取，也不参与 `remotion render`。
> 代码要用的文件必须经过加工后放到 `public/`，见 [`AGENTS.md`](../AGENTS.md) §1.6。

---

## 1. 三层分离模型

| 层 | 路径 | 内容 | 是否入 git | 是否参与渲染 |
| --- | --- | --- | --- | --- |
| ① 素材库 | `assets/` | 原始拍摄、录屏、原始音乐、设计稿、参考图、授权文件 | **否**（只提交 `README.md` 清单） | 否 |
| ② 运行时资产 | `public/` | 已裁剪/转码/优化、代码可直接读取的文件 | 是 | 是 |
| ③ 渲染成品 | `output/` | `npx remotion render` 输出的 mp4 | 否 | — |

判断口诀：**"这个文件是给我（人或 Agent）挑选用，还是给代码 `staticFile()` 用？"**
前者进 `assets/`，后者进 `public/`。

---

## 2. 目录结构

```text
assets/
├── README.md                    # 本文件（入库）
├── _inbox/                      # 临时投料区：用户/设计把文件丢这里，归档后清空
└── <VideoName>/                 # 与 src/videos/<VideoName>/ 同名
    ├── README.md                # ★ 素材清单（入库，必填）
    ├── video/                   # 拍摄原片、录屏、动效参考
    ├── audio/                   # 原始音乐、录音、音效素材
    ├── images/                  # 照片、设计稿、参考图、Logo 源文件
    ├── fonts/                   # 字体源文件与授权文本
    └── docs/                    # 授权协议、需求文档、分镜脚本
```

- `<VideoName>` 与代码目录 `src/videos/<VideoName>/` **必须同名**，方便交叉定位。
- `_inbox/` 是过渡区，**归档到 `<VideoName>/` 后必须清空**，不得长期堆积。
- `_template/` 是空骨架模板，新建视频素材目录时复制它。

---

## 3. 素材清单 `README.md`（必填）

每个 `<VideoName>/README.md` 必须登记下表，缺字段视为未归档：

| 文件 | 类型 | 来源 | 授权 | 时长/尺寸 | 体积 | 用途 | 加工去向 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `video/interview-raw.mov` | 视频 | 客户提供 2026-11-10 | 已授权商用 | 12m30s / 3840×2160 | 2.1 GB | 访谈正片素材 | `public/product-launch/video/interview-a.mp4` |

- **加工去向**：明确写出这个素材最终变成了 `public/` 下的哪个文件；不用的写「未使用 + 原因」。
- 模板见 [`_template/README.md`](_template/README.md)。

---

## 4. 素材 → 运行时资产的加工规范

素材**不允许**被 `staticFile()` 直接引用。进 `public/` 前必须按下表处理：

| 类型 | 目标格式 | 参考命令 |
| --- | --- | --- |
| 视频 | `.mp4` / H.264 / `yuv420p` / 30 或 60 fps | `ffmpeg -i in.mov -c:v libx264 -pix_fmt yuv420p -crf 20 -an out.mp4` |
| 音频 | `.mp3` / 192 kbps / 44.1 kHz | `ffmpeg -i in.wav -c:a libmp3lame -b:a 192k out.mp3` |
| 图片 | `.webp` 优先，其次 `.jpg` | `ffmpeg -i in.png -q:v 85 out.webp` |
| 字体 | `.woff2` | `fonttools` 或在线转换，附授权文件 |

其他硬性约束：

1. **单文件 ≤ 10 MB**（超出会被 `npm run check:assets` 报错）。视频按镜头切成片段，不要整段塞进去。
2. **文件名只用小写英文、数字、`-`、`_`**，禁止中文、空格、大写字母。
3. **TTS 音频**必须由 `scripts/generate_tts.py` 生成，直接输出到 `public/<video-name>/audio/`（见 AGENTS.md §1.5）。
4. **程序化音乐/SFX** 用 `scripts/generate_music.py` 生成，同样输出到 `public/`。

---

## 5. 备份与同步

- 本目录内容**不入 git**，仅 `README.md` 与 `_template/` 入库。
- 原始素材请保留在 NAS 共享目录，仓库通过 GitHub 同步给多个 Agent 时**不带素材**。
- 换机器 / 新 Agent 接手时：先看 `assets/<VideoName>/README.md` 了解素材清单，再向项目所有者索取原始文件。
