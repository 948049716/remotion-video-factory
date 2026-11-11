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
   - Reference [`src/videos/Showreel/`](src/videos/Showreel/) as the gold-standard reference for 60 FPS motion craft (Squash & Stretch, SVG Gooey Metaballs, Swiss Bento Grids, Isometric 3D Voxels, and Vertex Morphing).

3. **Register Your Composition in [`src/Root.tsx`](src/Root.tsx)**:
   Add your new `<Composition>` inside `<Folder name="Productions">` in `src/Root.tsx`. Keep all existing `<Composition>` entries intact.

4. **Static Assets (`public/`)**:
   Place audio/font/image assets in `public/` and reference them with `staticFile("filename.ext")`.
   If custom procedural audio/SFX is needed, see [`scripts/generate_music.py`](scripts/generate_music.py).

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
     python3 scripts/generate_tts.py --text "旁白文本" --voice zh-CN-XiaoxiaoNeural --out public/voiceover.mp3

     # 强制指定端点（远程电脑 / 排障时使用）
     python3 scripts/generate_tts.py --text "旁白文本" --out public/voiceover.mp3 --endpoint public
     python3 scripts/generate_tts.py --text "旁白文本" --out public/voiceover.mp3 --endpoint lan

     # 查看可用音色
     python3 scripts/generate_tts.py --list-voices --lang zh
     ```
     也可通过环境变量覆盖：`EDGE_TTS_BASE_URL`（完整 Base URL，最高优先级）、`EDGE_TTS_ENDPOINT=lan|public|auto`。
   - **接口**：`POST {BaseURL}/audio/speech`，JSON 体 `{ "model": "tts-1", "input": "...", "voice": "zh-CN-XiaoxiaoNeural", "response_format": "mp3", "speed": 1.0 }`，返回音频二进制。另有 `GET {BaseURL}/audio/voices?lang=zh`（音色列表）、`GET {BaseURL}/models`。
   - **产物落位**：生成的音频写入 `public/`，在组件中用 `staticFile("voiceover.mp3")` 引用；需要对齐画面时用 `ffprobe` 读取时长。
   - **不要提交**：生成的 mp3/wav 已由 `.gitignore` 忽略，请勿强行加入版本库。
   - **已知问题**：公网端点当前不可达，见 [`TODO.md`](TODO.md) `TODO-001`；与 NAS 同局域网的机器不受影响。

---

## 2. Remotion Motion Design Best Practices

- **Frame-Driven Animations Only**: Drive all animations using `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, and `spring()`. **Never** use CSS `transition` or CSS `@keyframes` animations, as they do not render deterministically in headless Chromium.
- **Always Clamp Interpolations**: Pass `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }` to `interpolate()` calls unless unbounded extrapolation is intentional.
- **Perceptual Scale**: When animating large camera zooms, pass `output: "perceptual-scale"` to `interpolate()`.
- **Verification**: Always run `npx tsc --noEmit` to verify zero TypeScript errors, and test-render a still frame with:
  ```bash
  npx remotion still <CompositionId> out/preview.png --frame=60
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

