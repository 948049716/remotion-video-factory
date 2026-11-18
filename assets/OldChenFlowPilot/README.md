# OldChenFlowPilot 素材清单

| 资产路径 | 类型 | 来源 | 规格 | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| `public/old-chen-flow-pilot/images/layers/s01/*.webp` | 透明图层 (8张) | 水彩原画色度抠像与前景拆分 | 1920×1080 RGBA/RGB WebP (<250KB) | 镜头 01 干净空镜、4 帧行走序列、门帘摆动、吊灯暖光与前景柜台 |
| `public/old-chen-flow-pilot/images/layers/s02/*.webp` | 透明图层 (12张) | 原画无溢色蒙版提取与表情重绘 | 1920×1080 RGBA/RGB WebP (<250KB) | 镜头 02 空镜、双钟摆、八音盒、躯干、闭/半张/大张口型与开闭眼眨眼层 |
| `public/old-chen-flow-pilot/images/layers/s03/*.webp` | 透明图层 (11张) | 原画无溢色蒙版提取与表情重绘 | 1920×1080 RGBA/RGB WebP (<250KB) | 镜头 03 空镜、钟摆、台灯光晕、老陈躯干、右臂扶镜关节、三态口型与眨眼层 |
| `public/old-chen-flow-pilot/images/shot-*.webp` | 关键帧图片 (6张) | Agent 生图 (`generate_image`) | 1920×1080 WebP | 分镜首尾基准原画（兼作可选 Flow 模式关键帧） |
| `public/old-chen-flow-pilot/audio/*.mp3` | 音频 (3条) | `tts_helper.py` 语音合成 | MP3 + 24fps 能量包络 | 旁白与角色中文对白配音（驱动 `visemes` 逐帧对口型） |
