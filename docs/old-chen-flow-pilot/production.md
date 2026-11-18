# 《老陈与八音盒 · Google Flow 真动画三镜头打样》(OldChenFlowPilot)

## 1. 打样目标与架构说明

本作品是 `remotion-video-factory` 升级 **Google Flow (`Veo 3.1` / `Omni Flash` 首尾帧模式) + 双层自动审片 + Remotion `24fps` 真动画引擎** 后的首个完整三镜头打样工程（Composition ID：`OldChenFlowPilot`，资源目录：`public/old-chen-flow-pilot/`）。

- **帧率与画幅**：`1920x1080` (`16:9`)，`24fps`（1:1 对齐 Google Flow 原生输出帧率，总时长 `20.7s` / `497 frames`）。
- **无感双态预览 (`mode: "auto"`)**：
  - **真视频回传前**：Remotion Studio 自动渲染 **首尾关键帧动态故事板（Animatic Leica Reel）**，已完整对齐真实中文 TTS 角色配音、24fps 语音振幅包络与角色专属色标字幕；
  - **真视频回传并质检入库后**：无需修改任何 TypeScript 代码，落盘 `public/old-chen-flow-pilot/video/shot-01~03.mp4` 即自动切换为 `<OffthreadVideo>` 真动画播放（Shot 01 自动开启雨声/布帘原生环境音与人声闪避 Ducking）。

## 2. 180 度轴线与角色视觉锚点

- **小女孩（镜头 01、02）**：12 岁中国女生，黑色马尾与轻薄刘海，蓝白拼色运动校服外套；镜头 01 从左侧雨巷跨过门槛向右走至柜台前，镜头 02 位于画面左侧**面朝右**将打开的胡桃木芭蕾小人八音盒轻放在柜台上并抬头询问。
- **老陈（镜头 03 反打）**：60 多岁钟表收音机老匠人，两鬓斑白，圆框金属眼镜，耳后别黄色木铅笔，浅灰卷袖衬衣配深藏青围裙，身旁绿罩银行台灯与墙面机械挂钟；严格遵循 **180 度正反打轴线**，位于画面右侧**面朝左**放下螺丝刀、抬头扶镜温和应允，与镜头 02 小女孩视线精准衔接。

## 3. 分镜与实测配音时间轴 (`24fps`)

| 镜头 | 标题 | 目标时长 | Flow 建议档位 | 配音角色与台词 | `atSec` | 实测 `durSec` | 原生音频策略 |
| :---: | :--- | :---: | :---: | :--- | :---: | :---: | :---: |
| `01` | 推门进店 | `7.2s` (`173f`) | `8s` (`Frames`) | **旁白**：雨天傍晚，女孩掀开门帘，抱紧木盒走进店里。 | `0.5s` | `6.120s` | `ambient`（保留雨声/脚步，旁白期自动闪避） |
| `02` | 递出八音盒 | `6.5s` (`156f`) | `8s` (`Frames`) | **女孩**：爷爷，这个旧八音盒，还能修好吗？ | `1.1s` | `4.488s` | `none`（静音，使用中文 TTS） |
| `03` | 老陈应允 | `7.0s` (`168f`) | `8s` (`Frames`) | **老陈**：别着急，拿过来，我给你仔细瞧瞧。 | `1.2s` | `4.872s` | `none`（静音，使用中文 TTS） |

## 4. Google Flow 投喂与回传审片命令

```bash
# 1. 校验并打包首尾关键帧与可视化投喂工作台
npm run flow:validate -- --manifest docs/old-chen-flow-pilot/flow-manifest.json --check-frames
npm run flow:pack -- --manifest docs/old-chen-flow-pilot/flow-manifest.json

# 2. 将 Google Flow 生成的 3 段视频重命名为 shot-01.mp4 / shot-02.mp4 / shot-03.mp4
#    放入 assets/OldChenFlowPilot/flow-inbox/ 后执行双层审片与 24fps 入库：
npm run flow:verify -- --manifest docs/old-chen-flow-pilot/flow-manifest.json --ingest

# 3. 启动 Remotion Studio 预览
npm run dev
```
