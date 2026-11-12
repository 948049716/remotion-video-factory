# 小狐狸找到发光种子 — 交接与继续制作

> 换电脑后从这里开始。**30 秒版本**：视觉风格、台本、12 张分镜图都已到位，动态分镜可播；下一步是审片并决定是否进入分层素材。
>
> 分工约定：本文件只记**制作进度与操作方式**；工程缺陷与环境问题一律记在 [`TODO.md`](../../TODO.md)，创作内容详见 [`production.md`](production.md)，生图提示词见 [`prompts.md`](prompts.md)。

---

## 1. 当前状态（2026-11-12）

| 阶段 | 状态 |
| --- | --- |
| ① 立项（观众/时长/画幅） | ✅ 已确认 |
| ② 剧本与 12 镜头台本 | ✅ 已确认 |
| ③ 视觉风格 | ✅ 已确认（第 2 版测试图） |
| ③ 声音（旁白/狐狸音色） | ⏸ **待用户确认试音** |
| ④ 分镜图 | ✅ 12 张已入库并接入 |
| ④ 动态分镜（animatic） | ✅ 可播放，真实画面 + 临时配音，109.9 秒 |
| ⑤ 分层素材 | ⬜ 未开始（需先定稿分镜图） |
| ⑥ 分层动画 | ⬜ 未开始 |
| ⑦ 音乐/音效/字幕精修 | ⬜ 未开始（字幕已按句显示） |
| ⑧ 导出 | ⬜ 未开始 |

**下一步就两件事**：审片（确认 12 张是否可用、节奏是否要调）、定音色。

---

## 2. 文件地图

| 路径 | 作用 |
| --- | --- |
| `docs/fox-starlight-seed/README.md` | 本文件：交接与操作说明 |
| `docs/fox-starlight-seed/production.md` | 制作手册：参数、台本时间轴、分镜提示词、分层需求 |
| `docs/fox-starlight-seed/prompts.md` | 12 条可直接复制的生图提示词 |
| `src/videos/FoxStarlightSeed/shots.ts` | **镜头与音频时间轴，唯一数据源**；调节奏改这里 |
| `src/videos/FoxStarlightSeed/Animatic.tsx` | 动态分镜组件：有分镜图用图，没图用占位 |
| `src/Root.tsx` | 注册 `FoxStarlightSeed-Animatic` |
| `public/fox-starlight-seed/audio/temp/` | 14 段临时配音（按镜头拆分） |
| `public/fox-starlight-seed/images/` | 分镜图落位目录 + `ref-style.webp` 风格参考 |
| `assets/FoxStarlightSeed/` | 素材库（不入 git，只有 README 入库） |
| `assets/FoxStarlightSeed/images/ref-style-v2.png` | 原始风格参考图（3.4 MB，仅本机） |

---

## 3. 在另一台电脑跑起来

```bash
npm i
npx remotion studio src/index.ts --port 3011
```

打开 `http://localhost:3011`，左侧 `Productions → FoxStarlightSeed-Animatic`。

只取一帧核对：

```bash
npx remotion still src/index.ts FoxStarlightSeed-Animatic out/check.png --frame=60
```

整段预览：

```bash
npx remotion render src/index.ts FoxStarlightSeed-Animatic out/animatic-preview.mp4 --codec=h264 --crf=28
```

`out/` 与 `output/` 都在 `.gitignore` 里，产物不会进仓库，需要时重渲即可。

---

## 4. 已确认的创作参数

- 全年龄治愈、横屏 1920×1080、30fps、约 110 秒、分层角色动画
- 画风：柔和绘本水彩＋清晰轮廓；深蓝绿秋夜；唯一暖光源是种子/星光树
- 主角：橘红毛、奶油白胸口、深棕脚尖、白尾尖、大耳朵、小黑鼻
- 旁白＋狐狸三句台词；夜莺不拟人化
- 台词净时长 80.88 秒，加留白后 109.9 秒（12 镜头明细见 production.md §8）

---

## 5. 接下来怎么做

### 5.1 分镜图已入库，转为审片

12 张已落在 `public/fox-starlight-seed/images/shot-01…12.webp`（WebP q82，单张 90～246 KB，合计 2.1 MB），组件自动匹配，已出 `animatic-v2` 预览。

审片重点与建议见 [`production.md`](production.md) §8「审片记录」：

- **建议重做**：`shot-04` 材质偏光滑，像抛光石/贝壳，写实度高于其他镜头
- **可接受但需记录**：`shot-06` 抬爪前肢偏细、略有手形；`shot-09` 两只前爪透视偏夸张
- **连续性**：狐狸在 01／11 幼态程度略有差异；星光树在 10 比 11／12 偏大

若重做某张，替换同名文件即可，无需改代码。素材原图放 `assets/FoxStarlightSeed/images/`，压缩后覆盖 `public/fox-starlight-seed/images/shot-XX.webp`。

### 5.2 定音色

试听 `public/fox-starlight-seed/audio/audition-*.mp3`，给出结论：

- 通过 → 锁定声音档案，`shots.ts` 无需改动
- 换音色 → 重新生成同名 14 个 `temp/*.mp3`，再把 `shots.ts` 里的 `durSec` 更新为新实测值
- 调语速 → 同上

读时长：

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 public/fox-starlight-seed/audio/temp/s01-narr.mp3
```

### 5.3 往下走

- 审片通过（或返修完 04／06／09）→ 定稿时间轴
- 时间轴定稿 → 按 `production.md` §4 出分层素材（角色部件、背景分层、光效层）
- 分层素材 → 做正式动画，先做镜头 03 或 12 这类代表性镜头验证可动性
- 最后：音乐、音效、混音、字幕精修、导出

---

## 6. 已知坑（换电脑最可能踩）

### 6.1 TTS 端点已改为明文 HTTP

公网 `https://tts.miong.dpdns.org:9481` 现在握手失败（`SSL: WRONG_VERSION_NUMBER`），该端口只提供 HTTP。当前可用写法：

```bash
python scripts/generate_tts.py --text "文本" --voice zh-CN-XiaoxiaoNeural \
  --out public/fox-starlight-seed/audio/temp/x.mp3 \
  --base-url http://tts.miong.dpdns.org:9481/v1
```

详见 [`TODO.md`](../../TODO.md) `TODO-009`（待你决定恢复 TLS 还是改脚本默认值）。

### 6.2 Windows 下 `compress-assets.py` 会失败

两个独立原因：中文路径导致 ffmpeg 输出失败；项目自带 ffmpeg 缺少 webp 输出格式。临时做法是用内置 Pillow 转 WebP：

```bash
python -c "from PIL import Image; im=Image.open('in.png').convert('RGB'); im.save('out.webp','WEBP',quality=82,method=6)"
```

已登记 [`TODO.md`](../../TODO.md) `TODO-010`。

### 6.3 系统 Python 3.8 的 TLS 问题

本机 `python` 指向 3.8 时会报 `FileNotFoundError`（SSL 上下文）。用 3.11+ 或在 DSH 环境里用内置 Python；脚本本身零依赖。

### 6.4 `curl.exe` 不能用来判断端点可用性

Windows Schannel 对该端点握手会被重置，见 `TODO-008`。用 Python 或脚本入口判断。

### 6.5 资产校验的孤儿告警

`staticFile()` 路径由 `shots.ts` 动态拼接，`npm run check:assets` 会对 14 个音频报「孤儿资产」告警。**这是预期告警**，退出码仍为 0，不要删文件。

---

## 7. 提交前自检

```bash
npm run check        # check:assets + tsc --noEmit
```

应当退出码 0（允许孤儿资产告警）。素材图片留在 `assets/` 不入库，只有 `assets/FoxStarlightSeed/README.md` 会进 git；运行时资产在 `public/` 且已放行入库。
