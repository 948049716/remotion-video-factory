# 跳槽马 — 图片素材生成清单

这份清单可以直接交给生图 agent。共 **60 项**素材：**55 项需要生图**，**5 项由代码绘制**。

## 使用说明

1. 按每项的“输出文件”命名，保存到 `raw/`；文件名用连字符，不要用点号。如果生成器只能输出 JPG，用同名 `.jpg` 即可。
2. 每个 Prompt 已包含 `[PURPOSE]`、`SUBJECT`、`STYLE`、`PALETTE`、`NEGATIVE`，整段粘贴即可。
3. 人物、道具、特效必须放在纯色幕布上；背景板满幅生成，不需要幕布。
4. 如果生成器支持单独填负面提示词，使用本文末尾的 `Global Negative Prompt`；Prompt 内已内置一份。
5. 生成图右下角如有水印，不用处理，后期统一裁掉。

## 建议生成顺序

- **P1 先做**：26 项，覆盖主要背景、主角、瘸马与关键道具。
- **P2 再做**：19 项，补充群像、官员、次要道具与特效。
- **P3 最后**：10 项，补齐小道具与次要角色。
- 每批生成后先检查文件名、幕布、是否烤进主角，再进入下一批。

## 全局风格

- 风格：宣纸剪刻 · 层叠纸偶
- 材质：3–5 层纸片，每层 2–4px 错位阴影；1–3px 手撕毛边，不做完美矢量平滑边。
- 光照：左上方暖色主光 3200K；深棕柔和阴影，35–55% 不透明度。
- 色板：宣纸米黄 #E8DCC3、墨黑 #1C1A17、朱红 #B83A2E、靛青 #2E4A5A、赭石 #9A6B3F、哑金 #C9A227
- 禁止：写实皮肤、3D 渲染或塑料高光、动漫描边、渐变/喷枪、完美矢量平滑边、文字/字母/logo/水印、血腥、额外肢体或畸形手。

## 幕布规则

- **绿幕**：纯 `#00FF00`，均匀光照，无阴影，主体四周留至少 8% 空白。
- **洋红幕**：纯 `#FF00FF`，只用于草料这种本身含绿色的素材。
- **满幅**：直接生成 16:9 背景，不要幕布。
- **透明边缘**：撕纸、剑光、马王剪影等仍放在绿幕上，后期保留 alpha。

## 画幅对照

| 参数 | 像素 |
|---|---|
| landscape_16_9 | 2560×1440 |
| landscape_4_3 | 2240×1680 |
| square | 1920×1920 |
| 3840x1080 | 3840×1080 |

## 背景（13 项）

### 01. `bg.street.west` — 京城西街外景

- 输出文件：`bg-street-west.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：满幅背景，不抠图
- 优先级：P1
- 使用镜头：`rules-02`
- 备注：大全景定场：城西街口、饭馆门脸、轿马与行人，前中后三层纸片视差。 背景中的路人/官员只做远景剪影；前景必须留空，不要烤进主角、赵大人、一品大员或瘸马。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: wide establishing shot of a bustling old Beijing street in the late afternoon, a small restaurant with a tiled roof, red paper lanterns and a blank cloth banner, sedan chairs and paper-cut pedestrians in the background only, warm dusty light, layered paper set, clear empty foreground. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 02. `bg.restaurant.facade` — 饭馆门脸

- 输出文件：`bg-restaurant-facade.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：满幅背景，不抠图
- 优先级：P1
- 使用镜头：`rules-02`、`contest-05`
- 备注：正门视角：屋檐、窗棂、灯笼、幌子，供宾客人流与仪仗叠层。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: front view of a small traditional Beijing restaurant facade, tiled roof, red paper lanterns, wooden lattice windows, blank cloth banner, a few paper-cut customers entering, warm lantern light, layered paper set. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 03. `bg.restaurant.interior` — 饭馆内堂

- 输出文件：`bg-restaurant-interior.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：满幅背景，不抠图
- 优先级：P1
- 使用镜头：`rules-03`、`exception-07`
- 备注：内堂中景：方桌、条凳、蒸汽、便服官员，供桌面特写与人物调度。 背景中的路人/官员只做远景剪影；前景必须留空，不要烤进主角、赵大人、一品大员或瘸马。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: interior of a small traditional Beijing restaurant, square wooden tables, paper-cut officials in plain clothes eating in the background only, steam rising from dishes, warm interior light, layered paper set, shallow depth, foreground tables empty. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 04. `bg.stable` — 后院马棚 · 白天

- 输出文件：`bg-stable.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：满幅背景，不抠图
- 优先级：P1
- 使用镜头：`rules-04`、`hunger-04`
- 备注：空马棚全景：木柱、草棚、长槽、草料，供规则建立与绝食戏使用。 背景板不要烤进马匹或人物；所有主角与马匹由纸偶层单独叠加，前景留空。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: empty backyard horse stable of a traditional Beijing restaurant, wooden posts, thatched roof, long empty wooden trough, hay bundles, afternoon sunlight, layered paper set, no horses, no animals, clear empty foreground. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 05. `bg.stable.night` — 马厩夜景

- 输出文件：`bg-stable-night.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：满幅背景，不抠图
- 优先级：P2
- 使用镜头：`hunger-06`
- 备注：同一马棚的夜景：靛青纸天、纸月、灯火，供瘦马纸偶叠加。 背景板不要烤进马匹或人物；所有主角与马匹由纸偶层单独叠加，前景留空。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: night view of an empty traditional horse stable, deep indigo paper sky, a paper moon, lantern glow, quiet and cold atmosphere, layered paper set, no horses, no animals, clear empty foreground. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 06. `bg.trough.panorama` — 长马槽全景

- 输出文件：`bg-trough-panorama.png`
- 生成方式：AI 生图
- 画幅：3840×1080（超宽长图）
- 幕布：满幅背景，不抠图
- 优先级：P1
- 使用镜头：`rules-08`、`exception-06`、`exception-08`、`contest-06`
- 备注：3.56:1 超宽长图，一条马槽从西贯到东；西端、东端、中段均为同一张图的裁切。 背景板不要烤进马匹或人物；所有主角与马匹由纸偶层单独叠加，前景留空。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: ultra-wide panoramic view of a long empty wooden horse trough divided into dozens of small compartments, wooden posts, hay, stable interior, continuous horizontal set design, layered paper, no horses, no animals, clear empty foreground. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, ultra-wide panoramic composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 07. `bg.hall` — 府邸厅堂

- 输出文件：`bg-hall.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：满幅背景，不抠图
- 优先级：P1
- 使用镜头：`hunger-09`、`truth-01`、`truth-09`
- 备注：公堂全景：黑木柱、红案、两列官员、灯火，供第五幕对质。 背景中的路人/官员只做远景剪影；前景必须留空，不要烤进主角、赵大人、一品大员或瘸马。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: grand traditional Chinese official hall, dark wooden pillars, red lacquer table, paper-cut officials standing in two rows in the background only, lantern light, solemn atmosphere, layered paper set, foreground empty. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 08. `bg.table` — 桌面木纹

- 输出文件：`bg-table.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：满幅背景，不抠图
- 优先级：P2
- 使用镜头：`contest-02`
- 备注：俯拍桌面底板，带磨损与杯痕，供花生米、酒壶、菜碟叠层。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: top-down close-up of a worn wooden restaurant table, visible paper texture, a few crumbs and cup rings, warm light, empty composition for props, layered paper. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 09. `bg.window.paper` — 窗纸光影

- 输出文件：`bg-window-paper.png`
- 生成方式：AI 生图
- 画幅：square（1920×1920）
- 幕布：纯绿幕 #00FF00（保留透明边缘）
- 优先级：P3
- 使用镜头：`rules-10`
- 备注：窗纸与木格 overlay，用于内堂官员会心一笑的隔窗镜头。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: close-up of a traditional Chinese lattice window with rice paper, warm backlight, visible paper fibers, soft shadows, layered paper overlay. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, square composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.   Place the subject on a flat chroma green #00FF00 background with even lighting, no shadows, and at least 8% empty margin. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 10. `bg.map.west-east` — 西东西贵示意图

- 输出文件：`bg-map-west-east.png`
- 生成方式：AI 生图 + 代码叠加
- 画幅：landscape_16_9（2560×1440）
- 幕布：满幅背景，不抠图
- 优先级：P2
- 使用镜头：`rules-06`
- 备注：鸟瞰纸片地图：饭馆、街道、东边金太阳；箭头与标注由代码叠加。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: top-down illustrated map of a small restaurant and a street running east-west, paper-cut rooftops, a golden paper sun rising in the east, blank paths, folk art map, layered paper. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227. Leave the path areas blank for code-drawn arrows. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 11. `bg.battlefield` — 皮影战场

- 输出文件：`bg-battlefield.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：满幅背景，不抠图
- 优先级：P2
- 使用镜头：`truth-07`
- 备注：白纸幕皮影战场：红黑两军剪影、箭影、烟尘，用于将军闪回。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: shadow-puppet battlefield on a white paper screen, silhouettes of ancient Chinese cavalry and infantry, red and black paper armies, dust and arrow silhouettes, dramatic backlight, no gore. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 12. `bg.palace.gate` — 宫门雨夜

- 输出文件：`bg-palace-gate.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：满幅背景，不抠图
- 优先级：P1
- 使用镜头：`truth-08`
- 备注：朱红宫门在雨中合拢，石阶湿冷，供独臂将军被弃的闪回。 背景板不要烤进马匹或人物；所有主角与马匹由纸偶层单独叠加，前景留空。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: rainy night at a grand Chinese palace gate, vermilion doors closing, wet stone steps, paper rain lines, cold indigo palette, layered paper, empty gate, no people, clear empty foreground. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 13. `bg.dusk.road` — 黄昏后门外

- 输出文件：`bg-dusk-road.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：满幅背景，不抠图
- 优先级：P1
- 使用镜头：`truth-11`
- 备注：饭馆后门外的黄昏土路，长影、纸树、暖赭天空，供结尾一人一马。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: quiet road outside the back gate of a restaurant at dusk, long shadows, warm ochre sky, paper-cut trees and rooftops, empty composition for two silhouettes, layered paper. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

## 角色（18 项）

### 14. `char.er` — 店小二纸偶

- 输出文件：`char-er.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`rules-04`、`rules-09`、`rules-10`、`exception-02`、`exception-03`、`exception-04`、`exception-05`、`exception-06`、`exception-10`、`exception-11`、`contest-01`、`contest-03`、`contest-04`、`contest-07`、`contest-09`、`contest-10`、`hunger-03`、`hunger-05`、`hunger-08`、`truth-05`
- 备注：三视图 + 分件：瓜皮小帽、青色对襟短褂、灰布腰带、米白围裙、白毛巾、黑布鞋。 不要现代厨师服或咖啡店员造型；是明中期饭馆跑堂伙计。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character turnaround sheet of a thin foxy young Ming-dynasty restaurant waiter, pointed chin, small eyes, small skullcap, indigo cross-collar short jacket, gray cloth belt, cream apron, white towel over shoulder, black cloth shoes, flat paper puppet, front side and back views, neutral pose, jointed limbs, not a modern chef. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227. Arrange the views in a clean row on chroma green with even spacing. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 15. `char.scarface` — 刀疤脸纸偶

- 输出文件：`char-scarface.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`exception-04`、`exception-05`、`contest-02`、`contest-03`、`contest-10`、`hunger-09`、`truth-01`、`truth-02`、`truth-03`、`truth-04`、`truth-06`、`truth-09`、`truth-10`、`truth-11`
- 备注：三视图 + 分件：四十五岁老兵、黑脸胡茬、长刀疤、褪色靛青短袄、空右袖。 空右袖是关键剪影。AI 常把断臂补成残臂或绑带，保留生成结果即可，后期会在肩点裁掉并换成代码绘制的空袖。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character turnaround sheet of a weathered 45-year-old former general, dark tanned face, deep-set eyes, stubble, a long pale scar from cheekbone to jaw, broad shoulders, faded indigo cross-collar short jacket, old leather belt and boots, right sleeve empty and pinned at the shoulder, flat paper puppet, front side and back views, neutral pose, jointed limbs, not a young handsome swordsman. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227. The scar is a thin pale paper line, not a wound. No blood.  Place the subject on a flat chroma green #00FF00 background with even lighting, no shadows, and at least 8% empty margin. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 16. `char.scarface.riding` — 刀疤脸骑瘸马

- 输出文件：`char-scarface-riding.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`exception-01`、`contest-01`
- 备注：预组合侧视姿态，供登场与重复蒙太奇直接使用。 空右袖是关键剪影。AI 常把断臂补成残臂或绑带，保留生成结果即可，后期会在肩点裁掉并换成代码绘制的空袖。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: side view paper-cut puppet of a weathered 45-year-old scar-faced former general with a dark tanned face, long pale scar and stubble, faded indigo cross-collar short jacket, right sleeve empty and pinned, riding an old bony white horse with visible ribs, sparse mane, a lame right front leg and a small brass bell, the horse tilting mid-step, layered paper silhouette, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 17. `char.zhao` — 赵大人纸偶

- 输出文件：`char-zhao.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`exception-07`、`exception-08`、`exception-09`、`exception-10`、`exception-11`、`hunger-08`、`hunger-09`、`truth-01`、`truth-03`、`truth-06`、`truth-09`
- 备注：三视图 + 分件：暗红官袍、乌纱帽、短须、玉带、圆腹。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character turnaround sheet of a stout 50-year-old Ming-dynasty second-rank official, round face, double chin, short beard, dark red round-collar robe, black winged hat, jade belt, flat paper puppet, front side and back views, jointed limbs. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.   Place the subject on a flat chroma green #00FF00 background with even lighting, no shadows, and at least 8% empty margin. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 18. `char.yipin` — 一品大员纸偶

- 输出文件：`char-yipin.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`contest-05`、`contest-06`、`contest-08`、`contest-09`
- 备注：三视图 + 分件：紫黑金边官袍、高顶官帽、细长八字胡。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character turnaround sheet of a tall cold 60-year-old Ming-dynasty first-rank official, high cheekbones, thin mustache, purple-black gold-trimmed round-collar robe, tall winged hat, jade belt, flat paper puppet, front side and back views, jointed limbs. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.   Place the subject on a flat chroma green #00FF00 background with even lighting, no shadows, and at least 8% empty margin. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 19. `char.official.guest` — 便服官员

- 输出文件：`char-official-guest.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`rules-03`、`rules-10`、`hunger-07`、`hunger-08`、`truth-01`、`truth-02`、`truth-05`
- 备注：两位便服官员纸偶，靛青与赭石两色，供内堂与质问戏复用。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character sheet of two middle-aged Ming-dynasty officials in plain round-collar robes, muted indigo and ochre, slightly paunchy and relaxed, flat paper puppets, front and three-quarter views, jointed limbs. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.   Place the subject on a flat chroma green #00FF00 background with even lighting, no shadows, and at least 8% empty margin. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 20. `char.attendant` — 随从

- 输出文件：`char-attendant.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P3
- 使用镜头：`exception-07`、`contest-05`、`contest-08`
- 备注：灰短袍随从，负责递外袍、牵马、站班。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character sheet of a Ming-dynasty Chinese servant attendant in a short gray robe, carrying a bundle, flat paper puppet, front and side views. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.   Place the subject on a flat chroma green #00FF00 background with even lighting, no shadows, and at least 8% empty margin. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 21. `char.guard` — 差役

- 输出文件：`char-guard.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P3
- 使用镜头：`hunger-09`
- 备注：深色公门差役，持木杖，用于押送刀疤脸。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character sheet of a Ming-dynasty Chinese court guard in a dark uniform with a wooden staff, flat paper puppet, front and side views. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.   Place the subject on a flat chroma green #00FF00 background with even lighting, no shadows, and at least 8% empty margin. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 22. `char.child` — 小童

- 输出文件：`char-child.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P3
- 使用镜头：`hunger-01`
- 备注：短袍小童，搬凳盯马，增加绝食戏的生活感。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character sheet of a small Ming-dynasty Chinese servant boy in a plain short robe, flat paper puppet, front and side views. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.   Place the subject on a flat chroma green #00FF00 background with even lighting, no shadows, and at least 8% empty margin. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 23. `char.crowd` — 街市宾客剪影组

- 输出文件：`char-crowd.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`rules-02`
- 备注：文人、商人、仆役、轿夫等剪影组，供街景与内堂背景人流。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: set of Ming-dynasty Chinese street crowd silhouettes, scholars, merchants, servants and sedan chair bearers, flat paper cutouts in muted indigo and ochre, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 24. `char.horse.lame` — 赛赤兔纸偶

- 输出文件：`char-horse-lame.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`exception-01`、`exception-04`、`exception-05`、`exception-06`、`exception-08`、`exception-09`、`exception-10`、`contest-01`、`contest-04`、`contest-06`、`contest-10`、`hunger-01`、`hunger-02`、`hunger-04`、`hunger-08`、`truth-10`、`truth-11`
- 备注：老瘦白马三视图 + 分件：可见肋骨、稀疏鬃毛、瘸右前腿、旧鞍、铜铃。 老、瘦、瘸要一眼看出：肋骨可见、鬃毛稀疏、右前腿跛。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character turnaround sheet of an old bony white horse with visible ribs, sparse mane, a lame right front leg and a small brass bell on a worn strap, flat paper puppet with jointed legs, side front and three-quarter views, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 25. `char.horse.crowd` — 众马纸偶

- 输出文件：`char-horse-crowd.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`rules-04`、`rules-08`、`rules-09`、`rules-10`、`hunger-04`、`hunger-05`、`truth-10`
- 备注：棕、黑、枣红三匹普通马，供马槽群像与低头畏惧。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: set of three well-fed Ming-dynasty stable horses in brown, black and bay, flat paper puppets, side views, jointed legs, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 26. `char.horse.thin` — 消瘦马

- 输出文件：`char-horse-thin.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`hunger-06`、`hunger-07`
- 备注：肋骨外露、垂头的瘦马，供夜景与官员质问。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: side view of an emaciated Chinese horse, visible ribs, drooping head, flat paper puppet, muted colors, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 27. `char.horse.war` — 战马

- 输出文件：`char-horse-war.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`truth-07`
- 备注：红鞍黑甲的战马，供皮影闪回中的将军坐骑。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: side view of a magnificent ancient Chinese warhorse with a red saddle and dark armor, flat paper puppet, dynamic galloping pose, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 28. `char.horse.war.wounded` — 受伤战马

- 输出文件：`char-horse-war-wounded.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`truth-08`
- 备注：倒在泥中的战马，前腿夹地钩刀，无血，供宫门闪回。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: side view of a wounded ancient Chinese warhorse lying in mud, a hooked blade caught in its front leg, no blood, flat paper puppet, muted colors, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 29. `char.horse.zhao` — 赵大人的马

- 输出文件：`char-horse-zhao.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P3
- 使用镜头：`exception-11`
- 备注：体面棕马与精细鞍具，供赵大人牵马离场。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: side view of a well-groomed brown official's horse with a fine saddle, flat paper puppet, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 30. `char.general.young` — 年轻将军

- 输出文件：`char-general-young.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`truth-07`
- 备注：红黑铠甲、披风、长枪，只用于皮影闪回。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character sheet of a young Ming-dynasty general in red and black worn armor, tied hair, flowing cape and spear, flat paper puppet, front and side views, isolated on chroma green, heroic but not overly handsome. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 31. `char.general.one-arm` — 独臂将军

- 输出文件：`char-general-one-arm.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`truth-08`
- 备注：多年后的将军，空袖、旧甲、跪姿，供宫门雨夜。 空右袖是关键剪影。AI 常把断臂补成残臂或绑带，保留生成结果即可，后期会在肩点裁掉并换成代码绘制的空袖。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: character sheet of a weathered 45-year-old one-armed Ming-dynasty general, gaunt face, empty right sleeve, worn armor and torn cape, kneeling pose, flat paper puppet, front and side views, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

## 道具（17 项）

### 32. `prop.trough` — 长马槽结构

- 输出文件：`prop-trough.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`rules-08`、`rules-09`
- 备注：木槽侧视与俯视，含隔板与槽沿，供代码拼装成几十格长槽。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: long wooden horse trough divided into small compartments, side and top views, flat paper prop, warm ochre wood, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 33. `prop.trough.map` — 马槽俯视示意

- 输出文件：`prop-trough-map.png`
- 生成方式：AI 生图 + 代码叠加
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00（保留透明边缘）
- 优先级：P2
- 使用镜头：`rules-05`
- 备注：干净俯视线稿，编号、箭头、品级字由代码叠加。 木牌、幌子、标注全部留空，文字与数字由代码叠加。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: top-down diagram of a long horse trough with empty compartments, flat paper cutout, clean shapes, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227. Leave all labels and numbers blank for code typography. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 34. `prop.rank.plaques` — 官阶木牌

- 输出文件：`prop-rank-plaques.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`rules-05`、`rules-06`、`rules-07`
- 备注：大小两种空白木牌，文字与品级数字由代码写上去。 木牌、幌子、标注全部留空，文字与数字由代码叠加。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: set of blank wooden rank plaques and small trough labels, different sizes, flat paper props, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227. All plaques must be blank, no carved characters. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 35. `prop.hay` — 草料三档

- 输出文件：`prop-hay.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯洋红幕 #FF00FF
- 优先级：P1
- 使用镜头：`rules-04`、`rules-07`、`exception-06`、`exception-08`、`hunger-02`
- 备注：三堆草料并排：嫩草拌细粮、普通青草、发黄枯草。 必须用洋红幕。草料本身含绿色，绿幕会把绿色草料一起抠掉。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: three separate piles of horse feed: fresh green grass mixed with grain, plain green grass, dry yellow hay, flat paper props, isolated on chroma magenta. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 36. `prop.stick` — 敲槽木棍

- 输出文件：`prop-stick.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P3
- 使用镜头：`rules-09`、`hunger-05`
- 备注：店小二敲槽用的细木棍，带使用磨损。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: simple worn wooden stick for tapping a trough, flat paper prop, side view, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 37. `prop.post` — 木桩双态

- 输出文件：`prop-post.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`contest-04`、`contest-07`、`hunger-01`
- 备注：完好与磨损两态：后者带绳痕与缺口，供解扣揭示。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: wooden hitching post in two states, intact and worn with rope marks and a chipped surface, flat paper prop, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 38. `prop.reins` — 缰绳双态

- 输出文件：`prop-reins.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`exception-04`、`contest-04`、`contest-07`
- 备注：完好与磨损两态：后者带毛边和死扣，供“用嘴解扣”特写。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: leather horse reins in two states, intact and frayed with a tight knot, flat paper prop, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 39. `prop.rope.thick` — 粗绳

- 输出文件：`prop-rope-thick.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`hunger-01`、`hunger-02`
- 备注：加绑用的粗麻绳，可盘绕、绷紧、打死扣。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: thick hemp rope coil, flat paper prop, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 40. `prop.bell` — 马铃

- 输出文件：`prop-bell.png`
- 生成方式：AI 生图
- 画幅：square（1920×1920）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`exception-01`
- 备注：铜铃与皮绳，铃铛是瘸马出场与结尾的声音符号。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: small brass horse bell on a leather strap, flat paper prop, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, square composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 41. `prop.facade.decor` — 灯笼幌子门帘

- 输出文件：`prop-facade-decor.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`rules-02`、`exception-03`
- 备注：红灯笼、空白布幌、花纹门帘，幌子文字由代码叠加。 木牌、幌子、标注全部留空，文字与数字由代码叠加。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: set of restaurant facade decorations: red paper lantern, blank cloth banner and patterned door curtain, flat paper props, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227. The banner must be blank, no text. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 42. `prop.table.set` — 桌上一套

- 输出文件：`prop-table-set.png`
- 生成方式：AI 生图
- 画幅：square（1920×1920）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`rules-03`、`contest-02`、`contest-10`、`truth-01`
- 备注：俯视一套：豆瓣鱼、龙脆骨、驴打滚、花生米、酒壶酒盅、方桌。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: set of restaurant table props: plate of braised fish, plate of crispy bone, plate of rolled pastries, dish of peanuts, wine pot and cup, worn square table, flat paper props, top-down view, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, square composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 43. `prop.cloth` — 抹布

- 输出文件：`prop-cloth.png`
- 生成方式：AI 生图
- 画幅：square（1920×1920）
- 幕布：纯绿幕 #00FF00
- 优先级：P3
- 使用镜头：`contest-03`
- 备注：揉皱的抹布，供店小二擦桌发泄。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: crumpled cleaning cloth, flat paper prop, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, square composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 44. `prop.sword` — 长剑

- 输出文件：`prop-sword.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`truth-03`
- 备注：银白纸剑身、深色剑鞘，供公堂断臂。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: ancient Chinese straight sword, silver paper blade and dark scabbard, flat paper prop, side view, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 45. `prop.arm.wood` — 木假肢

- 输出文件：`prop-arm-wood.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P1
- 使用镜头：`truth-04`、`truth-05`
- 备注：带榫头与木纹的右臂假肢，无血，供全片最大反转。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: wooden prosthetic right arm with a mortise joint and visible wood grain, no blood, flat paper prop, side view, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 46. `prop.weapons` — 长枪与地钩刀

- 输出文件：`prop-weapons.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`truth-07`、`truth-08`
- 备注：将军的长枪与伤马的地钩刀，两件一组。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: ancient Chinese spear and a hooked blade weapon, flat paper props, side views, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 47. `prop.umbrella` — 仪仗伞盖

- 输出文件：`prop-umbrella.png`
- 生成方式：AI 生图
- 画幅：square（1920×1920）
- 幕布：纯绿幕 #00FF00
- 优先级：P3
- 使用镜头：`contest-05`
- 备注：一品大员仪仗的暗红金边伞盖。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: traditional Chinese official ceremonial umbrella canopy, dark red and muted gold, flat paper prop, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, square composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 48. `prop.saddle` — 马鞍

- 输出文件：`prop-saddle.png`
- 生成方式：AI 生图
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P3
- 使用镜头：`hunger-07`
- 备注：磨损皮鞍，供官员摸马、鞍具松动的细节。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: worn leather horse saddle, flat paper prop, side view, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

## 特效（10 项）

### 49. `fx.torn-open` — 撕纸开场

- 输出文件：`fx-torn-open.png`
- 生成方式：AI 生图 + 代码叠加
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00（保留透明边缘）
- 优先级：P1
- 使用镜头：`rules-01`
- 备注：宣纸从中间撕开的边缘，纸屑与纤维由代码加粒子。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: torn rice paper opening effect, ragged fibers, blank center, flat paper overlay, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 50. `fx.arrow` — 纸片箭头

- 输出文件：无（代码绘制）
- 生成方式：代码绘制
- 画幅：—（代码绘制）
- 幕布：不需要生图（代码绘制）
- 优先级：P3
- 使用镜头：`rules-05`
- 备注：朱红与金色纸箭头、方向标记，纯 SVG。 纯 SVG/CSS 绘制，不需要生图。

生成方式：不需要生图，由代码绘制。

### 51. `fx.gold-sun` — 金纸太阳

- 输出文件：`fx-gold-sun.png`
- 生成方式：AI 生图
- 画幅：square（1920×1920）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`rules-06`
- 备注：带毛边的金纸圆片，供“东边为贵”的鸟瞰图。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: round muted gold paper sun with torn edges, subtle paper texture, flat overlay, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, square composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 52. `fx.thought` — 纸片气泡

- 输出文件：无（代码绘制）
- 生成方式：代码绘制
- 画幅：—（代码绘制）
- 幕布：不需要生图（代码绘制）
- 优先级：P3
- 使用镜头：`exception-02`
- 备注：思考气泡与视线小纸片，纯 SVG。 纯 SVG/CSS 绘制，不需要生图。

生成方式：不需要生图，由代码绘制。

### 53. `fx.day-flip` — 日影翻页

- 输出文件：`fx-day-flip.png`
- 生成方式：AI 生图 + 代码叠加
- 画幅：landscape_4_3（2240×1680）
- 幕布：纯绿幕 #00FF00
- 优先级：P3
- 使用镜头：`contest-01`
- 备注：一叠日历纸翻页，AI 纸材质 + 代码翻页。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: stack of blank paper calendar pages with a simple sun motif, flipping sequence, flat paper prop, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 4:3 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227. No numbers or text on the pages. NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 54. `fx.speech-bubble` — 台词气泡

- 输出文件：无（代码绘制）
- 生成方式：代码绘制
- 画幅：—（代码绘制）
- 幕布：不需要生图（代码绘制）
- 优先级：P3
- 使用镜头：`hunger-03`
- 备注：空白纸片对话气泡，文字由代码排版。 纯 SVG/CSS 绘制，不需要生图。

生成方式：不需要生图，由代码绘制。

### 55. `fx.slash` — 剑光影子

- 输出文件：`fx-slash.png`
- 生成方式：AI 生图 + 代码叠加
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00（保留透明边缘）
- 优先级：P1
- 使用镜头：`truth-03`
- 备注：一道白纸剑光与纸墙上的断影，不表现伤口，供第五幕断臂。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: dramatic sword-slash light effect made of a single white paper strip, shadow on a paper wall, no blood, flat overlay, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 56. `fx.horse-king.gold` — 马王金剪影

- 输出文件：`fx-horse-king-gold.png`
- 生成方式：AI 生图
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00（保留透明边缘）
- 优先级：P1
- 使用镜头：`truth-10`
- 备注：半透明金色马王剪影，供结尾回忆浮现。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: translucent golden paper silhouette of a magnificent galloping warhorse, ornate mane, glowing torn edges, flat overlay, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 57. `fx.paper-close` — 合纸转场

- 输出文件：`fx-paper-close.png`
- 生成方式：AI 生图 + 代码叠加
- 画幅：landscape_16_9（2560×1440）
- 幕布：纯绿幕 #00FF00（保留透明边缘）
- 优先级：P2
- 使用镜头：`truth-11`
- 备注：两张宣纸从左右合拢，纸边由代码控制。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: two large sheets of rice paper closing from left and right, torn edges, blank center, flat overlay, isolated on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

### 58. `fx.atmosphere` — 夜景与纹理氛围

- 输出文件：`fx-atmosphere.png`
- 生成方式：AI 生图
- 画幅：square（1920×1920）
- 幕布：纯绿幕 #00FF00
- 优先级：P2
- 使用镜头：`hunger-06`、`truth-04`、`truth-06`、`truth-07`
- 备注：木纹、烧纸边、油灯光、纸月四件一组，供夜景与闪回叠加。

Prompt：

```text
[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: atmosphere texture sheet with four separate elements: warm wood grain, burnt paper edge, oil lamp glow and a paper moon, flat paper textures on chroma green. STYLE: Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, square composition, blank surfaces with no text. PALETTE: rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227.  NEGATIVE: photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands.
```

## 标题（2 项）

### 59. `title.tiaocaoma` — 片头标题

- 输出文件：无（代码绘制）
- 生成方式：代码绘制
- 画幅：—（代码绘制）
- 幕布：不需要生图（代码绘制）
- 优先级：P1
- 使用镜头：`rules-01`
- 备注：朱红剪纸“跳槽马”三字与副标题，纯 SVG，纸张纹理用 CSS 叠加。 纯 SVG/CSS 绘制，不需要生图。

生成方式：不需要生图，由代码绘制。

### 60. `title.credits` — 片尾出处

- 输出文件：无（代码绘制）
- 生成方式：代码绘制
- 画幅：—（代码绘制）
- 幕布：不需要生图（代码绘制）
- 优先级：P3
- 使用镜头：`truth-11`
- 备注：片尾小字：原作、出处、改编说明，纯 SVG 排版。 纯 SVG/CSS 绘制，不需要生图。

生成方式：不需要生图，由代码绘制。

## Global Negative Prompt

```text
photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands
```

## Global Style Prefix

```text
Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text
```

> 手动使用全局前缀时，把 `cinematic 16:9 composition` 替换为对应画幅：4:3、square 或 ultra-wide panoramic。
## 交付检查

- [ ] 55 张生图是否按文件名保存到 `raw/`？
- [ ] 人物/道具是否在纯色幕布上，主体完整、无裁切？
- [ ] 背景板是否没有烤进主角、马匹、官员？
- [ ] 所有木牌、幌子、匾额是否留空？
- [ ] 草料是否使用洋红幕？
- [ ] 是否没有文字、logo、水印（生成水印除外）？

## 自动验收

交付前先跑一遍自动检查，只有返回码 0 的批次才算通过；缺文件名、尺寸不符、幕布不纯、主体贴边会被直接判 FAIL。

```powershell
powershell -ExecutionPolicy Bypass -File check-assets.ps1 -Root raw -ListPath asset-list.json -Sheets
```

Linux / macOS：先 `python3 -m pip install pillow`，再运行

```bash
python3 check-assets.py --root raw --list asset-list.json --priority 1 --sheets
```

只查某几项或某一优先级：追加 `-Only bg-street-west,char-er` 或 `-Priority 1`；加 `-Sheets` 会同时输出接触表，供一次性目检风格与内容。
