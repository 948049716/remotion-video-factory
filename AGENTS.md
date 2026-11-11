# AGENTS.md — AI Agent Instructions for Remotion Video Factory

Welcome! This repository is a **Multi-Video Remotion Monorepo ("Video Factory")**. Multiple AI agents and developers collaborate in this repository to build independent, broadcast-grade programmatic videos.

---

## 1. Directory Isolation & Architecture Rules

When asked to create a new video (e.g., `ProductLaunch`, `TiktokAd`, `AnnualReport`):

1. **Create an Isolated Directory**:
   Place all components, scenes, and styles for your video inside:
   ```text
   src/videos/<YourVideoName>/
   ```
   **Never** overwrite or delete other videos inside `src/videos/`.

2. **Reuse Shared Motion Assets (`src/shared/`)**:
   - [`src/shared/motion-presets.ts`](src/shared/motion-presets.ts): Standard spring physics (`SPRING_CONFIGS`), cubic-bezier curves (`EASING_CURVES`), and curated color palettes (`PALETTES`).
   - [`src/shared/GlobalOverlay.tsx`](src/shared/GlobalOverlay.tsx): Configurable SMPTE timecode HUD and progress rail.
   - **No gold-standard reference video currently exists** — `src/videos/` is empty (cleared in commit `a822fa0`). Until a reference production is rebuilt, take motion craft cues from [`src/shared/motion-presets.ts`](src/shared/motion-presets.ts) (spring/easing/palette) and [`src/shared/GlobalOverlay.tsx`](src/shared/GlobalOverlay.tsx) (HUD), and follow the Remotion best practices in §2.

3. **Register Your Composition in [`src/Root.tsx`](src/Root.tsx)**:
   Add your new `<Composition>` inside `<Folder name="Productions">` in `src/Root.tsx`. Keep all existing `<Composition>` entries intact.

4. **静态资产三层分离 + 强制压缩（`assets/` / `public/` / `output/`）—— 必须遵守**:

   Remotion 的 `staticFile()` **只能读 `public/`**，因此「素材」与「运行时资产」必须物理分离，不可混放。

   | 层 | 路径 | 内容 | 入 git | 参与渲染 |
   | --- | --- | --- | --- | --- |
   | ① 素材库 | `assets/` | 原始拍摄、录屏、原始音乐、设计稿、参考图、字体源文件、授权文本 | **否**（只提交各 `<VideoName>/README.md` 清单） | 否 |
   | ② 运行时资产 | `public/` | 已压缩/转码/优化、代码可直接读取的文件 | 是 | 是 |
   | ③ 渲染成品 | `output/` | `npx remotion render` 产出的 mp4 | 否 | — |

   **判断口诀**：这个文件是给「人或 Agent 挑选用」→ `assets/`；是给「代码 `staticFile()` 用」→ `public/`。

   #### 4.1 强制压缩门禁（默认必须执行）

   **除用户明确要求保留原始质量外，任何素材在进入 `public/` 之前都必须压缩。** 目的：运行时资产直接进 git 并参与渲染，未压缩的大文件会拖垮仓库体积、拉长渲染时间、增加内存占用。

   | 类型 | 触发压缩阈值 | 目标格式与参数 | 绝对上限（硬门禁） |
   | --- | --- | --- | --- |
   | 图片 | > **500 KB** | WebP `-quality 82`、`-compression_level 6` | 2 MB |
   | 音频 | > **2 MB** | MP3 `-b:a 192k -ar 44100` | 8 MB |
   | 视频 | > **8 MB** | H.264 `-crf 20 -preset slow -pix_fmt yuv420p`，≤1920 宽、≤30 fps | 32 MB |

   - **阈值来源单一**：`scripts/asset_rules.py`（`THRESHOLDS` / `HARD_CEILING`），校验脚本与压缩脚本共用，禁止在别处另写一套数字。
   - **低于阈值**：直接复制进 `public/`，保留原扩展名（不强行改名，避免内容与扩展名不符）。
   - **高于阈值**：必须压缩。压缩后仍超阈值 → 降参数（图片 `--quality 70` / 音频 `--bitrate 128k` / 视频 `--crf 23`）或缩短时长、降低分辨率。
   - **压缩后不得大于原文件**：脚本会自动检测，无收益时删除输出并报错，此时保留原格式或换更小源文件。

   **实测压缩效果**（`ffmpeg 8.1.1`，用于判断参数是否够用）：

   | 素材 | 压缩前 | 压缩后 | 降幅 | 质量指标（SSIM，1.0 为无损） |
   | --- | --- | --- | --- | --- |
   | 4K/30fps 视频 3s → 1080p | 19.7 MB | 1.3 MB | **-93.3%** | **0.9968**（含缩放+CRF20） |
   | 720p 视频（同分辨率，仅 CRF） | — | — | -67% | **0.9977** @ CRF20 / 0.9985 @ CRF18 |
   | 48kHz 立体声 WAV 30s | 8.2 MB | 705 KB | **-91.6%** | 192 kbps MP3 |
   | 2000×2000 PNG | 384 KB | 111 KB | **-71.0%** | **0.9983** @ q82 / 0.9971 @ q75 |

   > 参数选择依据：WebP q82 的 SSIM 0.9983 明显高于 q75 的 0.9971，体积仅多 19%，肉眼不可辨；H.264 CRF20 的 SSIM 0.9977 与 CRF18（0.9985）差距极小但体积省 15%。这两档是「明显变小 + 质量不塌」的平衡点。
   > 注意：视频若同时触发降分辨率（4K→1080p），SSIM 会略降到 0.9968，仍属肉眼无感；如对画质有硬要求，用 `--max-width 0` 关闭缩放。

   #### 4.2 统一压缩入口

   ```bash
   # 单文件 / 整目录：自动按类型压缩并落位到 public/<kebab(video)>/<type>/
   python3 scripts/compress-assets.py --in assets/ProductLaunch/images/hero.png --video ProductLaunch
   python3 scripts/compress-assets.py --in assets/ProductLaunch --video ProductLaunch

   # 指定输出路径
   python3 scripts/compress-assets.py --in raw.mov --out public/product-launch/video/intro.mp4

   # 强制压缩（忽略阈值，用于「必须瘦身」的场景）
   python3 scripts/compress-assets.py --in a.png --video Foo --force

   # 体检 public/：平铺文件 + 超标文件（只读不改）
   npm run assets:scan
   ```

   常用参数：`--quality`（WebP 质量，默认 82）、`--bitrate`（MP3 码率，默认 192k）、`--crf`（视频 CRF，默认 20）、`--max-fps`（默认 30）、`--max-width`（默认 1920）、`--dry-run`（只打印计划）。

   > **为什么用本地 ffmpeg 而不是在线压缩服务**：TinyPNG/Tinify 免费额度 500 张/月（超量 $0.009/张）、Squoosh 已停更且无 CLI、Cloudinary 免费额度需注册且素材要上传第三方。本地 `ffmpeg` 零成本、零配额、不泄露素材、可脚本化，且本仓库环境已内置（`ffmpeg 8.1.1` 含 libwebp/libx264/libmp3lame）。**禁止把未公开素材上传到第三方压缩服务。**

   #### 4.3 运行时资产目录规范（禁止平铺）

   `public/` 根目录**不得直接放任何文件**，必须按「视频 → 类型」两级分目录：

   ```text
   public/
   ├── _shared/                 # 跨视频共用资产
   │   └── audio/ images/ fonts/ video/
   └── <video-name>/            # 每支视频一个子目录，kebab-case
       └── audio/ images/ fonts/ video/     # 只允许这 4 个类型目录
   ```

   - **视频子目录名**：由 `src/videos/<VideoName>` 的 PascalCase 转 kebab-case 得到（`ProductLaunch` → `public/product-launch/`），转换由 `compress-assets.py --video ProductLaunch` 自动完成。
   - **`<video-name>/` 下只允许** `audio/` `images/` `fonts/` `video/` 四个子目录；多一层分类（如 `images/icons/`）允许，但第一层必须是类型名。
   - **`staticFile()` 路径必须带子目录前缀**：`staticFile("product-launch/audio/bgm.mp3")`；跨视频共用写 `staticFile("_shared/audio/showreel-music.mp3")`。写成 `staticFile("bgm.mp3")` 会被校验判为 ERROR。
   - **删除视频时同步删除** `public/<video-name>/`，避免孤儿资产堆积。

   #### 4.4 素材库布局

   见 [`assets/README.md`](assets/README.md)：

   ```text
   assets/
   ├── _inbox/                 # 临时投料区，归档后必须清空
   └── <VideoName>/            # 与 src/videos/<VideoName>/ 同名（PascalCase）
       ├── README.md           # ★ 素材清单（必填、入库）
       └── video/ audio/ images/ fonts/ docs/
   ```

   每个 `assets/<VideoName>/README.md` 必须登记：文件、类型、来源、授权、时长/尺寸、体积、用途、**加工去向**（对应 `public/` 下的实际路径）。

   #### 4.5 命名规范

   `public/` 路径每段只用**小写英文、数字、`-`、`_`、`.`**；禁止中文、空格、大写字母。

   #### 4.6 机器校验（提交前必须通过）

   ```bash
   npm run check:assets        # = python3 scripts/check-assets.py
   npm run check               # = check:assets + tsc --noEmit
   npm run assets:scan         # 体检 public/：平铺文件 + 超标文件
   ```

   校验项：命名规范、禁止平铺、子目录白名单、**压缩门禁（超阈值未压缩即 ERROR）**、绝对上限、`staticFile()` 引用缺失/无前缀、孤儿资产（告警）、素材清单缺失、素材误入库。**有 ERROR 不得提交。**

   #### 4.7 程序化音乐 / SFX

   见 [`scripts/generate_music.py`](scripts/generate_music.py)，产物同样输出到 `public/<video-name>/audio/`，并受上述压缩门禁约束。

5. **语音合成（TTS）强制约束 —— 必须遵守**:
   凡是需要人声/旁白/配音/朗读等 **TTS 音频**，在没有被明确指定其他方案时，**一律使用 NAS 上部署的 edge-tts 服务**（OpenAI 兼容接口）。禁止改用其他在线 TTS 服务、浏览器 Web Speech API、本地 `edge-tts` pip 包或其他第三方 SDK。

   | 场景 | Base URL | Swagger 文档 |
   | --- | --- | --- |
   | 局域网（推荐，默认优先） | `http://192.168.0.2:5055/v1` | `http://192.168.0.2:5055/docs` |
   | 公网 / 远程 | `https://tts.miong.dpdns.org:9481/v1` | `https://tts.miong.dpdns.org:9481/docs` |

   - **端点选择规则**：与 NAS 同局域网（NAS 上运行的 Agent 即属此类）走局域网地址；项目被拉取到**不在同一局域网**的电脑时走公网地址。**不要凭猜测**——先探测局域网是否可达，不可达再回退公网。
   - **统一入口**：使用 [`scripts/generate_tts.py`](scripts/generate_tts.py)（零依赖，自动探测端点），不要手写一次性 curl 脚本。
     ```bash
     # 默认 auto：先试局域网，不可达自动回退公网
     python3 scripts/generate_tts.py --text "旁白文本" --voice zh-CN-XiaoxiaoNeural --out public/<video-name>/audio/voiceover.mp3

     # 强制指定端点（远程电脑 / 排障时使用）
     python3 scripts/generate_tts.py --text "旁白文本" --out public/<video-name>/audio/voiceover.mp3 --endpoint public
     python3 scripts/generate_tts.py --text "旁白文本" --out public/<video-name>/audio/voiceover.mp3 --endpoint lan

     # 查看可用音色
     python3 scripts/generate_tts.py --list-voices --lang zh
     ```
     也可通过环境变量覆盖：`EDGE_TTS_BASE_URL`（完整 Base URL，最高优先级）、`EDGE_TTS_ENDPOINT=lan|public|auto`。
   - **接口**：`POST {BaseURL}/audio/speech`，JSON 体 `{ "model": "tts-1", "input": "...", "voice": "zh-CN-XiaoxiaoNeural", "response_format": "mp3", "speed": 1.0 }`，返回音频二进制。另有 `GET {BaseURL}/audio/voices?lang=zh`（音色列表）、`GET {BaseURL}/models`。
   - **产物落位**：生成的音频写入 `public/<video-name>/audio/`（跨视频共用则 `public/_shared/audio/`），在组件中用 `staticFile("<video-name>/audio/voiceover.mp3")` 引用；需要对齐画面时用 `ffprobe` 读取时长。
   - **产物必须提交**：TTS 产物是运行时资产，位于 `public/<video-name>/audio/`，**必须随仓库同步**（`.gitignore` 已显式放行 `public/**/*.mp3`）。未压缩的 `.wav` 不提交，统一用 `.mp3`。
   - **已知问题**：公网端点当前不可达，见 [`TODO.md`](TODO.md) `TODO-001`；与 NAS 同局域网的机器不受影响。

---

## 2. Remotion Motion Design Best Practices

- **Frame-Driven Animations Only**: Drive all animations using `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, and `spring()`. **Never** use CSS `transition` or CSS `@keyframes` animations, as they do not render deterministically in headless Chromium.
- **Always Clamp Interpolations**: Pass `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }` to `interpolate()` calls unless unbounded extrapolation is intentional.
- **Perceptual Scale**: When animating large camera zooms, pass `output: "perceptual-scale"` to `interpolate()`.
- **Verification**: Always run `npx tsc --noEmit` to verify zero TypeScript errors, and test-render a still frame with:
  ```bash
  npx remotion still <CompositionId> output/preview.png --frame=60
  ```

---

## 3. 项目待办文件规范（TODO.md）—— 必须遵守

项目待办**只允许**维护在仓库根目录的 [`TODO.md`](TODO.md)，它是唯一可信来源（Single Source of Truth）。

**强制规则**：

1. **唯一入口**：不得新建 `TODO-*.md`、`docs/todo/`、`NOTES.md` 等平行待办文件；也不得把待办只写在聊天回复、代码注释、commit message 里。发现即迁移合并进 `TODO.md`。
2. **必须登记的情形**：
   - 已发现但本次不修的问题 / 已知缺陷；
   - 需人工确认、需外部权限或需运维操作的事项（如端口映射、证书、DNS）；
   - 暂用绕过方案顶替的正式修复项；
   - 未完成的验证项（如"公网连通性待复测"）。
3. **编号**：`TODO-<三位序号>`，全局递增，**永不复用**；作废项保留编号并注明原因。
4. **状态标记**：`[ ]` 待办 / `[~]` 进行中 / `[!]` 阻塞 / `[x]` 已完成。`[!]` 必须写明**阻塞原因**与**解除条件**。
5. **必填字段**（缺一不可）：登记日期、影响范围、现象、复现步骤、根因分析（未确认则写"待确认 + 假设"）、期望结果、**验收标准**、临时绕过方案、相关文件。
   - **验收标准必须是可被命令或脚本判定的条件**，禁止"体验更好""尽量优化"等模糊表述。它是该项能否标记 `[x]` 的唯一依据。
6. **完成即归档**：完成后补填完成日期与结论，移入"已完成 / 已关闭"区，**不得删除**，以便追溯。
7. **同步义务**：修复某项后必须同时更新 `TODO.md` 状态与文末「变更记录」；若修复方式影响 `AGENTS.md` / `README.md` 中的约定，需一并更新。
8. **提交纪律**：涉及待办变更的 commit 需在正文引用编号，例如 `fix(tts): 放通公网 9481 端口 (TODO-001)`。

