# OldChenMusicBox 素材清单

| 资产路径 | 类型 | 来源 | 规格 | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| `public/old-chen-music-box/images/ref-style.webp` | 图片 | Agent 生图 (`gemini-3.1-flash-image`) | 1920×1080 WebP q85 | 手绘水彩画风与老陈角色基准图 |
| `public/old-chen-music-box/images/shot-01.webp` ~ `shot-10.webp` | 图片 | Agent 生图 + 手绘水彩分镜合成管线 | 1920×1080 WebP q85 | 镜头 01～10 水彩分镜画面（含回退底图） |
| `public/old-chen-music-box/images/layers/shot-01` ~ `shot-10/*.webp` | 2D 分层图层 | `layer_helper.py` 调和修补与 RGBA 透明分离 | 1920×1080 RGB/RGBA WebP | 混合 2D 分层动画背景板与角色/道具可动部件 |
| `public/old-chen-music-box/audio/s01-narr.mp3` ~ `s10-narr.mp3` | 音频 | `tts_helper.py` 语音合成 | MP3 128kbps | 旁白、老陈、女孩共 16 段配音 |
