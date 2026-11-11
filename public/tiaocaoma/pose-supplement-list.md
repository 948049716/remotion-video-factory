# 《跳槽马》姿态素材补件清单

用于补齐 Pass 2 姿态库。所有文件输出到 `asset-qa/pose-raw/`，PNG 格式，纯绿幕 `#00FF00`，无阴影、无地面、无文字、无水印。

- P0：1 张，必须有独立跪姿时补
- P1：4 张，公堂蓝袍将军姿态
- P2：2 张，加分项
- 已有可替代：`pose-er-tremble.png` 已经是标准双膝跪地，可暂时替代 `pose-er-kneel.png`
- 已生成的 4 张铠甲将军姿态请保留，用于战场闪回，不要覆盖

---

## 通用要求

1. 必须使用对应角色的现有单视图作为参考图，保持脸、年龄、体型、服装、颜色、纸纹完全一致。
2. 每个姿态单独一张图，不要拼成多格姿态表。
3. 角色完整、居中，脚/身体不被裁切，同一角色所有姿态保持同一比例。
4. 纯绿幕 `#00FF00`，不要地面阴影、渐变背景、文字、水印。
5. 刀疤脸、独臂将军：右袖必须为空并固定在肩，**绝对不能出现右手/右臂**。
6. 公堂将军必须是**靛青旧袍**，不是铠甲，不要头盔。

### 普通负面提示词

```text
different costume, different face, extra limbs, extra fingers, text, watermark, logo, gradient background, realistic photo, 3D render, glossy plastic, cropped feet, multiple characters, pose sheet grid, floor shadow
```

### 独臂角色负面提示词

```text
different costume, different face, two arms, right arm, right hand, extra limb, extra fingers, prosthesis, text, watermark, logo, gradient background, realistic photo, 3D render, glossy plastic, cropped feet, multiple characters, pose sheet grid, floor shadow
```

### 公堂将军额外负面词

```text
armor, helmet, war armor, red armor, shoulder armor, breastplate
```

---

## P0 必补（1 张）

### 1. `pose-er-kneel.png`

- 参考图：`public/tiaocaoma/assets/char-er-v1.png`
- 画幅：`landscape_4_3 (2240×1680)`
- 原因：当前版本是双腿分开的蹲姿，不是跪姿。

```text
Use the attached reference image as the exact character design. Keep the same face, age, body proportions, costume (dark blue jacket, cream apron, white towel, black cap, black cloth shoes), colors, paper texture, torn-paper edges, and layered construction-paper style. Full-body paper-cut puppet, single character only, centered, full body visible, character height about 65% of the canvas, pure green background (#00FF00), no shadow, no floor, no text, no watermark, matte paper with visible fiber texture.

Character: 二十出头的店小二，瘦猴相，尖下巴、小眼睛，瓜皮小帽，青色对襟短褂，灰布腰带，米白围裙，肩上搭白毛巾，黑布鞋。

Pose: kneeling on both knees, shins flat on the ground, feet behind the body, buttocks resting on heels, torso upright, head lowered, hands on thighs, front view. The knees must be clearly on the ground, not a squat.
```

负面词：

```text
squatting, crouching, standing, legs apart, feet flat on the ground, different costume, different face, extra limbs, extra fingers, text, watermark, logo, gradient background, realistic photo, 3D render, glossy plastic, cropped feet, multiple characters, pose sheet grid, floor shadow
```

---

## P1 建议（4 张，公堂蓝袍将军）

### 2. `pose-general-court-kneel-front.png`

- 参考图：`public/tiaocaoma/assets/char-general-one-arm-v1.png`
- 画幅：`landscape_4_3 (2240×1680)`
- 原因：现有 4 张将军姿态是铠甲版，公堂需要蓝袍版。

```text
Use the attached reference image as the exact character design. Keep the same face, age, body proportions, indigo old robe, colors, paper texture, torn-paper edges, and layered construction-paper style. This is the COURT version: indigo old robe, NOT armor, NO helmet. Full-body paper-cut puppet, single character only, centered, full body visible, character height about 60% of the canvas, pure green background (#00FF00), no shadow, no floor, no text, no watermark, matte paper with visible fiber texture.

Character: 刀疤脸的公堂形象，独臂将军，四十五岁以上，靛青旧袍，右袖为空并固定在肩，绝对没有右手/右臂，只有左手。

Pose: kneeling on both knees facing forward, left hand on knee, empty right sleeve hanging, head lowered, front view.
```

### 3. `pose-general-court-kneel-side.png`

- 参考图：`public/tiaocaoma/assets/char-general-one-arm-v1.png`
- 画幅：`landscape_4_3 (2240×1680)`

```text
Use the attached reference image as the exact character design. Keep the same face, age, body proportions, indigo old robe, colors, paper texture, torn-paper edges, and layered construction-paper style. This is the COURT version: indigo old robe, NOT armor, NO helmet. Full-body paper-cut puppet, single character only, centered, full body visible, character height about 60% of the canvas, pure green background (#00FF00), no shadow, no floor, no text, no watermark, matte paper with visible fiber texture.

Character: 刀疤脸的公堂形象，独臂将军，四十五岁以上，靛青旧袍，右袖为空并固定在肩，绝对没有右手/右臂，只有左手。

Pose: kneeling in side view facing right, left hand on knee, empty right sleeve hanging, head lowered.
```

### 4. `pose-general-court-speak.png`

- 参考图：`public/tiaocaoma/assets/char-general-one-arm-v1.png`
- 画幅：`landscape_4_3 (2240×1680)`

```text
Use the attached reference image as the exact character design. Keep the same face, age, body proportions, indigo old robe, colors, paper texture, torn-paper edges, and layered construction-paper style. This is the COURT version: indigo old robe, NOT armor, NO helmet. Full-body paper-cut puppet, single character only, centered, full body visible, character height about 60% of the canvas, pure green background (#00FF00), no shadow, no floor, no text, no watermark, matte paper with visible fiber texture.

Character: 刀疤脸的公堂形象，独臂将军，四十五岁以上，靛青旧袍，右袖为空并固定在肩，绝对没有右手/右臂，只有左手。

Pose: kneeling on both knees, head raised, speaking, left hand raised slightly, empty right sleeve hanging, front view.
```

### 5. `pose-general-court-bow.png`

- 参考图：`public/tiaocaoma/assets/char-general-one-arm-v1.png`
- 画幅：`landscape_4_3 (2240×1680)`

```text
Use the attached reference image as the exact character design. Keep the same face, age, body proportions, indigo old robe, colors, paper texture, torn-paper edges, and layered construction-paper style. This is the COURT version: indigo old robe, NOT armor, NO helmet. Full-body paper-cut puppet, single character only, centered, full body visible, character height about 60% of the canvas, pure green background (#00FF00), no shadow, no floor, no text, no watermark, matte paper with visible fiber texture.

Character: 刀疤脸的公堂形象，独臂将军，四十五岁以上，靛青旧袍，右袖为空并固定在肩，绝对没有右手/右臂，只有左手。

Pose: kneeling, bowing forward with head to the ground, left hand on the floor, empty right sleeve hanging, side view facing right.
```

P1 统一负面词：

```text
armor, helmet, war armor, red armor, shoulder armor, breastplate, different costume, different face, two arms, right arm, right hand, extra limb, extra fingers, prosthesis, text, watermark, logo, gradient background, realistic photo, 3D render, glossy plastic, cropped feet, multiple characters, pose sheet grid, floor shadow
```

---

## P2 可选（2 张）

### 6. `pose-er-kowtow.png`

- 参考图：`public/tiaocaoma/assets/char-er-v1.png`
- 画幅：`landscape_4_3 (2240×1680)`
- 用途：店小二磕头，头低到地，配合“磕头如鸡啄米”。

```text
Use the attached reference image as the exact character design. Keep the same face, age, body proportions, costume (dark blue jacket, cream apron, white towel, black cap, black cloth shoes), colors, paper texture, torn-paper edges, and layered construction-paper style. Full-body paper-cut puppet, single character only, centered, full body visible, character height about 55% of the canvas, pure green background (#00FF00), no shadow, no floor, no text, no watermark, matte paper with visible fiber texture.

Character: 二十出头的店小二，瘦猴相，尖下巴、小眼睛，瓜皮小帽，青色对襟短褂，灰布腰带，米白围裙，肩上搭白毛巾，黑布鞋。

Pose: kneeling on both knees, forehead touching the ground, hands flat on the ground in front, back curved, front/side view. The knees and forehead must be on the ground.
```

负面词：

```text
squatting, standing, head up, hands on thighs, different costume, different face, extra limbs, extra fingers, text, watermark, logo, gradient background, realistic photo, 3D render, glossy plastic, cropped feet, multiple characters, pose sheet grid, floor shadow
```

### 7. `pose-horse-refuse.png`

- 参考图：`public/tiaocaoma/assets/char-horse-lame-v1.png`
- 画幅：`landscape_4_3 (2240×1680)`
- 用途：瘸马绝食，头明显转开、闭嘴、身体紧绷。

```text
Use the attached reference image as the exact horse design. Keep the same white bony body, visible ribs, sparse mane, old saddle, brass bell, bandaged right front leg, paper texture, torn-paper edges, and layered construction-paper style. Single horse only, side view facing right, full body, four legs visible, pure green background (#00FF00), no shadow, no floor, no text, no watermark, matte paper with visible fiber texture.

Pose: head turned sharply away from the trough and food, mouth closed, ears pinned back, body tense, refusing to eat.
```

负面词：

```text
standing straight, head forward, eating, mouth open, relaxed, calm, different horse, extra legs, extra limbs, text, watermark, logo, gradient background, realistic photo, 3D render, glossy plastic, cropped feet, multiple characters, pose sheet grid, floor shadow
```

---

## 交付

1. 输出到 `asset-qa/pose-raw/`，文件名严格使用上面的名称。
2. PNG，纯绿幕 `#00FF00`，无阴影、无文字、无水印。
3. 先生成 P0，再 P1，P2 可选。
4. 生成完告诉我，我继续抠图、建立姿态映射并接入 Remotion。
