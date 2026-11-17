# 《老陈的修理铺与八音盒》制作手册（Production Manual）

> 本文件为《老陈的修理铺与八音盒》手绘水彩动画视频的**单一制作档案**：记录角色视觉锚点、配音选角表、色彩脚本、10 镜时间轴与实测音频秒数。

---

## 1. 基础项目配置

| 配置项 | 设定值 | 说明 |
| :--- | :--- | :--- |
| **Composition ID** | `OldChenMusicBox` | 注册于 `src/Root.tsx` |
| **资源子目录 (`STORY_SLUG`)** | `old-chen-music-box` | `public/old-chen-music-box/{images,audio}` |
| **画幅与帧率** | `1920 × 1080` (16:9), `30 fps` | 横屏绘本电影画幅 |
| **总时长** | **240.6 秒**（`7218 帧`） | 由 16 段实测配音 + 呼吸留白自动排算 |
| **语音模型方案** | 默认 `edge-tts`（沙箱自动音色塑形回退） | 按 `narrator` / `chen` / `girl` 区分音色、音高与语速 |
| **生图模型方案** | Agent 内置生图工具 + 手绘水彩合成管线 | 统一转存 `1920×1080` WebP (`q=85`) |

---

## 2. 角色视觉锚点表（Character Visual Bible）

| 角色 ID | 角色名 | 身份性格 | 固定外观描述块（生图锚点） | 负面排除项 | 字幕色标 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `narrator` | 旁白 | 温柔绘本讲述者 | （不出画） | — | `rgba(255, 248, 231, 0.45)` |
| `chen` | 老陈 | 六十多岁老街修理匠，面冷心热、手艺精湛 | 六十多岁中国老手艺人，两鬓斑白短发，鼻梁架圆框厚底老花镜，右耳后夹一支黄色木杆铅笔；穿深藏青色旧粗布工装围裙、内搭浅灰卷袖棉衬衣 | 禁止西装革履、禁止去掉老花镜、禁止年轻化 | `#F4B860` |
| `girl` | 女孩 | 十二三岁初中女生，珍视奶奶遗物 | 十二三岁中国小女孩，干净低马尾、柔和碎刘海，穿蓝白相间宽松中国学生运动校服外套 | 禁止换装连衣裙或西式制服、禁止成熟化 | `#8ECAE6` |

---

## 3. 配音选角表（Voice Casting）

| 角色 ID | 音色配置 | 语速 (`speed`) | 音调 (`pitch`) | 听感特征 |
| :--- | :--- | :---: | :---: | :--- |
| `narrator` | `zh-CN-XiaoxiaoNeural` | `0.94` | `+0Hz` | 温婉细腻、绘本叙事感 |
| `chen` | `zh-CN-YunjianNeural` | `0.90` | `-4Hz` | 低沉浑厚、沉稳慈祥长者声线 |
| `girl` | `zh-CN-XiaoyiNeural` | `0.95` | `+3Hz` | 清亮柔和、带少女期盼感 |

---

## 4. 分镜脚本与 `ffprobe` 实测时间轴

| 镜头 | 标题 | 景别与运镜 (`cue`) | 色调 (`tone`) | 氛围粒子 (`fx`) | 配音片段 (`atSec` / `durSec`) | 镜头总长 (`durSec`) |
| :---: | :--- | :--- | :---: | :---: | :--- | :---: |
| **01** | 老街修理铺 | 远景建立 · `push` | `night` | `mist` | `s01-narr` (`1.00s` / `11.952s`) | `14.1s` |
| **02** | 岁月老手艺 | 中景工作台 · `still` | `glow` | `none` | `s02-narr` (`0.90s` / `24.624s`) | `26.5s` |
| **03** | 雨天来客 | 中全景门口 · `push` | `night` | `mist` | `s03-narr` (`1.00s` / `14.040s`) | `16.0s` |
| **04** | 折翼的舞者 | 近景桌面特写 · `pulse` | `glow` | `none` | `s04-girl` (`0.80s` / `3.144s`)<br>`s04-narr` (`4.44s` / `20.232s`) | `25.7s` |
| **05** | 奶奶的旧物 | 中近景双人 · `still` | `glow` | `none` | `s05-narr` (`0.80s` / `5.496s`)<br>`s05-chen` (`6.85s` / `12.696s`)<br>`s05-narr-2` (`20.09s` / `3.744s`)<br>`s05-girl` (`24.39s` / `11.184s`) | `36.6s` |
| **06** | 铁盒与承诺 | 中近景工作台 · `push` | `glow` | `starlight` | `s06-narr` (`0.90s` / `14.472s`)<br>`s06-chen` (`15.92s` / `11.712s`) | `28.7s` |
| **07** | 雨后夕阳 | 中全景暖阳 · `pan-right` | `warm` | `leaves` | `s07-narr` (`1.00s` / `19.056s`) | `21.1s` |
| **08** | 银色勋章 | 微距特写 · `grow` | `warm` | `starlight` | `s08-narr` (`0.90s` / `25.320s`) | `27.4s` |
| **09** | 五块手工费 | 中近景柜台 · `still` | `warm` | `petals` | `s09-narr` (`0.80s` / `10.800s`)<br>`s09-chen` (`12.10s` / `4.272s`) | `17.4s` |
| **10** | 余音与新址 | 远景拉远 · `pull` | `warm` | `leaves` | `s10-narr` (`1.00s` / `24.264s`) | `27.1s` |

---

## 5. 混合 2D 分层关节动画规划（Tier A / Tier B）

| 镜头 | 分层级别 | 独立图层与关节驱动（`zIndex` 由低到高） | 视觉效果说明 |
| :---: | :---: | :--- | :--- |
| **01** | Tier A | `bg.webp` + `chen-window.webp` (`breathe`, 窗内呼吸) → `sign.webp` (`sway`, `parallax: 1.08`) → `window-glow.webp` (`glow-pulse`) | 门脸木牌微晃前景视差与窗内暖光老陈剪影轻微呼吸 |
| **02** | Tier B | `bg.webp` → `pendulum-1/2.webp` (`swing`, 双钟摆摇摆) → `chen-body.webp` (`breathe`) → `chen-head.webp` (`nod`) → `chen-arm.webp` (`swing`, 持黄铜螺丝刀劳作) → `lamp-glow.webp` (`glow-pulse`) | 挂钟摆动 + 老陈俯身呼吸与手臂细致拧螺丝动作 |
| **03** | Tier B | `bg.webp` → `curtain.webp` (`sway`, `parallax: 1.02`) → `girl-body.webp` (`breathe`) → `girl-head.webp` (`nod`) → `sign.webp` (`sway`, `parallax: 1.07`) | 门外冷雨青灰街景、门帘与木牌视差摇曳与少女微喘动态 |
| **04** | Tier B | `bg.webp` → `curtain.webp` (`sway`) → `girl-body.webp` (`breathe`) → `girl-head.webp` (`talk`, `activeSpeaker: "girl"`) → `warm-glow.webp` (`glow-pulse`) | 女孩说出“爷爷，这个……能修吗？”时头部与语音同步微动 |
| **05** | Tier B | `bg.webp` → `pendulum-2.webp` (`swing`) → `chen-body.webp` (`breathe`) → `chen-head.webp` (`talk`, `activeSpeaker: "chen"`) → `chen-arm.webp` (`swing`) → `lamp-glow.webp` (`glow-pulse`) | 对话特写：老陈发言期间触发生动的说话点头律动，倾听时恢复待机呼吸 |
| **06** | Tier B | `bg.webp` → `chen-body.webp` (`breathe`) → `chen-arm.webp` (`swing`, 细致拧动动作) → `lamp-glow.webp` (`glow-pulse`) | 聚焦老陈双手、工作台工具与零件铁盒，伴随星尘承诺粒子 |
| **07** | Tier B | `bg.webp` → `curtain.webp` (`sway`) → `girl-body.webp` (`breathe`) → `girl-head.webp` (`nod`) → `sign.webp` (`sway`, `parallax: 1.06`) → `lamp-glow.webp` (`glow-pulse`) | 雨后夕阳金辉下女孩再次推门而入，门帘摇曳、落叶飘飞 |
| **08** | Tier B | `bg.webp` (`parallax: 0.92`, 暖金夕阳木柜台浅景深) → `music-box.webp` (`breathe`, `parallax: 1.05`) → `ballerina.webp` (`spin-y`, `parallax: 1.05`) → `box-glow.webp` (`glow-pulse`) | 陶瓷小芭蕾舞者优雅 360° 原地连续旋转（小腿银色焊痕随舞姿流转），伴随金色星尘微光 |
| **09** | Tier B | `bg.webp` → `curtain.webp` (`sway`) → `girl-body.webp` (`breathe`) → `girl-head.webp` (`nod`) → `sign.webp` (`sway`, `parallax: 1.05`) → `lamp-glow.webp` (`glow-pulse`) | 夕阳暖意中女孩眼里闪光交付五元手工费的微笑神情 |
| **10** | Tier A | `bg.webp` + `chen-window.webp` (`breathe`) → `sign.webp` (`sway`, `parallax: 1.08`) → `window-glow.webp` (`glow-pulse`) | 金色夕阳下木牌轻摆视差与暖窗灯光渐融，为老街修理铺收束余韵 |

