# assets/ — 素材库（Source Materials）

> **本目录存放「做视频用的素材」，不是「成品运行时需要的文件」。**
> 这里的文件**永远不会**被 `staticFile()` 读取，也不参与 `remotion render`。
> 代码要用的文件必须**压缩加工**后放到 `public/`，见 [`AGENTS.md`](../AGENTS.md) §1.4。

---

## 1. 三层分离模型

| 层 | 路径 | 内容 | 是否入 git | 是否参与渲染 |
| --- | --- | --- | --- | --- |
| ① 素材库 | `assets/` | 原始拍摄、录屏、原始音乐、设计稿、参考图、授权文件 | **否**（只提交 `README.md` 清单） | 否 |
| ② 运行时资产 | `public/` | 已压缩/转码/优化、代码可直接读取的文件 | 是 | 是 |
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

## 4. 强制压缩规范（进 `public/` 前必做）

素材**不允许**被 `staticFile()` 直接引用，也**不允许未压缩就进 `public/`**。除非用户明确要求保留原始质量，一律按下表压缩：

| 类型 | 触发阈值 | 目标格式与参数 | 绝对上限 | 降幅实测 |
| --- | --- | --- | --- | --- |
| 图片 | > **500 KB** | WebP `-quality 82 -compression_level 6` | 2 MB | 2000×2000 PNG 384 KB → 111 KB（**-71%**，SSIM 0.9983） |
| 音频 | > **2 MB** | MP3 `-b:a 192k -ar 44100` | 8 MB | 48 kHz 立体声 WAV 8.2 MB → 705 KB（**-92%**） |
| 视频 | > **8 MB** | H.264 `-crf 20 -preset slow -pix_fmt yuv420p`，≤1920 宽、≤30 fps | 32 MB | 4K 3s 19.7 MB → 1.3 MB（**-93%**，SSIM 0.9968 含缩放） |

**质量依据**（SSIM 对比，1.0 为无损）：

- WebP q82 → SSIM **0.9983**；q75 → 0.9971（体积仅省 19%，质量掉更多）→ 选 q82。
- H.264 CRF 20 → 同分辨率 SSIM **0.9977**；CRF 18 → 0.9985（体积多 15%）→ 选 CRF 20。
- 视频若同时触发降分辨率（4K→1080p），SSIM 降至 0.9968，仍肉眼无感；需保画质用 `--max-width 0`。

肉眼无法分辨这两档与原件的差异，但体积缩小 70–93%。

### 一键压缩

```bash
# 压缩并自动落位到 public/<kebab(VideoName)>/<type>/
python3 scripts/compress-assets.py --in assets/ProductLaunch/images/hero.png --video ProductLaunch

# 整个素材目录批量处理
python3 scripts/compress-assets.py --in assets/ProductLaunch --video ProductLaunch

# 忽略阈值强制压缩
python3 scripts/compress-assets.py --in assets/ProductLaunch --video ProductLaunch --force

# 只体检 public/（不改文件）
npm run assets:scan
```

参数说明见 `python3 scripts/compress-assets.py --help`。

### 压缩后的格式对照

| 源格式 | 目标格式 | 说明 |
| --- | --- | --- |
| `.png` `.jpg` `.psd` `.tif` `.heic` | `.webp` | 自动保留 alpha 通道；`.psd` 取合成后的可见层 |
| `.wav` `.flac` `.aiff` `.m4a` | `.mp3` | 语音/音乐统一 192 kbps |
| `.mov` `.mkv` `.avi` `.webm` | `.mp4` | H.264 + AAC，`+faststart` 便于流式播放 |
| 字体 `.ttf` `.otf` | `.woff2` | 需 `fonttools`，附授权文件 |

### 低于阈值怎么办

直接复制进 `public/`，**保留原扩展名**（例如 384 KB 的 PNG 仍是 `.png`）。不要为了"统一格式"而改名，否则会出现「内容是 PNG、名字是 .webp」的撒谎文件。

### 不要用在线压缩服务

TinyPNG/Tinify 免费额度 500 张/月（超量 $0.009/张）、Squoosh 已停更无 CLI、Cloudinary 需注册且素材上传第三方。**本地 `ffmpeg` 零成本、零配额、不泄露素材、可脚本化**，本仓库环境已内置。

---

## 5. 其他硬性约束

1. **文件名只用小写英文、数字、`-`、`_`、`.`**，禁止中文、空格、大写字母。
2. **运行时资产禁止平铺**：`public/` 根目录不得直接放文件，必须进 `<video-name>/<type>/`。
3. **TTS 音频**必须由 `scripts/generate_tts.py` 生成，直接输出到 `public/<video-name>/audio/`（见 AGENTS.md §1.5）。
4. **程序化音乐/SFX** 用 `scripts/generate_music.py` 生成，同样输出到 `public/<video-name>/audio/`。
5. **提交前自检**：`npm run check:assets`（有 ERROR 不得提交）。

---

## 6. 备份与同步

- 本目录内容**不入 git**，仅 `README.md`、`_template/`、`_inbox/.gitkeep` 入库。
- 原始素材请保留在 NAS 共享目录，仓库通过 GitHub 同步给多个 Agent 时**不带素材**。
- 换机器 / 新 Agent 接手时：先看 `assets/<VideoName>/README.md` 了解素材清单，再向项目所有者索取原始文件。
- **素材只保留一份**（NAS 原始件）；`public/` 里的压缩版可由 `compress-assets.py` 随时重建，不必额外备份。
