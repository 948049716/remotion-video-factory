# 《跳槽马》姿态表生成清单

用于 Pass 2 剪纸帧动画：每个角色生成多个姿态，按 on-twos 切换。

- 总姿态：35 个
- P1 必做：19 个
- P2 加分：16 个
- 输出目录：`asset-qa/pose-raw/`
- 输出格式：PNG，纯绿幕 `#00FF00`，无阴影、无文字、无水印

## 通用规则

1. **必须使用对应角色的现有单视图作为参考图**，保持脸、年龄、体型、服装、颜色、纸纹完全一致。
2. 每个姿态单独一张图，不要拼成多格姿态表；如果是多格，请按姿态度单独输出。
3. 角色高度约占画布 70%，居中，脚/身体完整，不要裁切。
4. 刀疤脸、独臂将军、骑乘图：右袖必须为空并固定在肩，**绝对不能出现右手/右臂**。
5. 所有图都放在纯绿幕上，不要地面阴影、不要渐变背景。
6. 先生成 P1，再生成 P2；同一角色使用同一参考图和同一 seed/风格参数。

## 通用提示词前缀

```text
Use the attached reference image as the exact character design. Keep the same face, age, body proportions, costume, colors, paper texture, torn-paper edges, and layered construction-paper style. Full-body paper-cut puppet, single character only (or rider+horse for the riding asset), centered, feet/body visible, character height about 70% of the canvas, pure green background (#00FF00), no shadow, no floor, no text, no watermark, matte paper with visible fiber texture. Do not change the character design.
```

## 负面提示词

普通角色：

```text
different costume, different face, extra limbs, extra fingers, text, watermark, logo, gradient background, realistic photo, 3D render, glossy plastic, cropped feet, multiple characters, pose sheet grid, floor shadow
```

独臂角色（刀疤脸 / 独臂将军 / 骑乘）：

```text
different costume, different face, two arms, right arm, right hand, extra limb, extra fingers, prosthesis, text, watermark, logo, gradient background, realistic photo, 3D render, glossy plastic, cropped feet, multiple characters, pose sheet grid, floor shadow
```

## 店小二 `er`

- 参考图：`public/tiaocaoma/assets/char-er-v1.png`
- 画幅：landscape_4_3 (2240×1680)
- 角色描述：二十出头的跑堂伙计，瘦猴相，尖下巴、小眼睛，瓜皮小帽，青色对襟短褂，灰布腰带，米白围裙，肩上搭白毛巾，黑布鞋；双袖完整。

| 姿态 | 输出文件 | 优先级 | 姿态提示词 |
|---|---|---|---|
| 站姿 | `asset-qa/pose-raw/pose-er-idle.png` | P1 | standing naturally, both arms relaxed at sides, neutral expression, front view |
| 说话 | `asset-qa/pose-raw/pose-er-speak.png` | P1 | standing, one hand raised slightly in a small gesture, head slightly turned, speaking expression, front view |
| 拱手 | `asset-qa/pose-raw/pose-er-bow.png` | P1 | standing, hands clasped in front, upper body bowed forward about 20 degrees, respectful, front view |
| 下跪 | `asset-qa/pose-raw/pose-er-kneel.png` | P1 | kneeling on both knees, hands on thighs, head lowered, submissive, front view |
| 指点 | `asset-qa/pose-raw/pose-er-point.png` | P2 | standing, one arm extended forward with index finger pointing, other arm at side, front view |
| 发抖 | `asset-qa/pose-raw/pose-er-tremble.png` | P2 | kneeling, shoulders raised, hands trembling in front, fearful expression, front view |

## 刀疤脸 `scarface`

- 参考图：`public/tiaocaoma/assets/char-scarface-v1.png`
- 画幅：landscape_4_3 (2240×1680)
- 角色描述：四十五岁上下的独臂老兵，宽肩黑脸、胡茬、深眼窝，刀疤从颧骨拉到下颌，褪色靛青交领短袄，旧皮护腕，旧皮靴；右袖为空并固定在肩，绝对没有右手/右臂，只有左手。

| 姿态 | 输出文件 | 优先级 | 姿态提示词 |
|---|---|---|---|
| 站姿 | `asset-qa/pose-raw/pose-scarface-idle.png` | P1 | standing naturally, left arm at side, empty right sleeve hanging still, neutral expression, front view |
| 说话 | `asset-qa/pose-raw/pose-scarface-speak.png` | P1 | standing, left hand raised slightly in a gesture, empty right sleeve hanging, speaking expression, front view |
| 空袖摆动 | `asset-qa/pose-raw/pose-scarface-sleeve.png` | P1 | standing, empty right sleeve swaying outward, left arm at side, body slightly turned, front view |
| 下跪 | `asset-qa/pose-raw/pose-scarface-kneel.png` | P1 | kneeling on both knees, left hand on thigh, empty right sleeve hanging, head lowered, front view |
| 拱手 | `asset-qa/pose-raw/pose-scarface-bow.png` | P2 | standing, left hand clasped in front, upper body bowed forward, empty right sleeve hanging, front view |
| 独臂指认 | `asset-qa/pose-raw/pose-scarface-point.png` | P2 | standing, left arm extended with index finger pointing, empty right sleeve hanging, front view |

## 赵大人 `zhao`

- 参考图：`public/tiaocaoma/assets/char-zhao-v1.png`
- 画幅：landscape_4_3 (2240×1680)
- 角色描述：五十岁上下的圆脸官员，双下巴、短须、圆腹，暗红圆领官袍，乌纱帽，玉带；双袖完整。

| 姿态 | 输出文件 | 优先级 | 姿态提示词 |
|---|---|---|---|
| 站姿 | `asset-qa/pose-raw/pose-zhao-idle.png` | P1 | standing, arms at sides, official posture, neutral expression, front view |
| 问话 | `asset-qa/pose-raw/pose-zhao-speak.png` | P1 | standing, one hand raised in an official gesture, speaking with authority, front view |
| 拱手 | `asset-qa/pose-raw/pose-zhao-bow.png` | P2 | standing, hands clasped, upper body bowed slightly, respectful, front view |
| 发难 | `asset-qa/pose-raw/pose-zhao-point.png` | P2 | standing, one arm extended, index finger pointing, authoritative and angry, front view |
| 甩袖 | `asset-qa/pose-raw/pose-zhao-sleeve.png` | P2 | standing, one wide sleeve flicked outward, body slightly turned, front view |

## 一品大员 `yipin`

- 参考图：`public/tiaocaoma/assets/char-yipin-v1.png`
- 画幅：landscape_4_3 (2240×1680)
- 角色描述：六十岁上下的高瘦一品大员，颧骨高、细长八字胡、冷脸，紫黑金边圆领官袍，高顶乌纱帽；双袖完整。

| 姿态 | 输出文件 | 优先级 | 姿态提示词 |
|---|---|---|---|
| 站姿 | `asset-qa/pose-raw/pose-yipin-idle.png` | P1 | standing, hands behind back, chin raised, cold and composed, front view |
| 开口 | `asset-qa/pose-raw/pose-yipin-speak.png` | P1 | standing, one hand raised slightly, cold speaking expression, front view |
| 冷眼 | `asset-qa/pose-raw/pose-yipin-cold.png` | P1 | standing, hands behind back, chin raised, cold contemptuous stare, front view |
| 俯指 | `asset-qa/pose-raw/pose-yipin-point.png` | P2 | standing, one arm extended downward, pointing at someone, contemptuous, front view |
| 转身离去 | `asset-qa/pose-raw/pose-yipin-turn.png` | P2 | turning away, side/back view, one sleeve swinging, walking away |

## 独臂将军 `general`

- 参考图：`public/tiaocaoma/assets/char-general-one-arm-v1.png`
- 画幅：landscape_4_3 (2240×1680)
- 角色描述：刀疤脸的公堂形象，独臂将军，靛青旧袍，右袖为空并固定在肩，绝对没有右手/右臂，只有左手；以跪姿为主。

| 姿态 | 输出文件 | 优先级 | 姿态提示词 |
|---|---|---|---|
| 跪姿正面 | `asset-qa/pose-raw/pose-general-kneel-front.png` | P1 | kneeling on both knees facing forward, left hand on knee, empty right sleeve, head lowered, front view |
| 跪姿抬头说话 | `asset-qa/pose-raw/pose-general-speak.png` | P1 | kneeling, head raised, speaking, left hand raised slightly, empty right sleeve, front view |
| 跪姿侧面 | `asset-qa/pose-raw/pose-general-kneel-side.png` | P2 | kneeling in side view facing right, left hand on knee, empty right sleeve, head lowered |
| 跪拜 | `asset-qa/pose-raw/pose-general-bow.png` | P2 | kneeling, bowing forward with head to the ground, left hand on the floor, empty right sleeve, side view facing right |

## 年轻将军 `young-general`

- 参考图：`public/tiaocaoma/assets/char-general-young-v1.png`
- 画幅：landscape_4_3 (2240×1680)
- 角色描述：年轻将领，双袖完整，铠甲，长枪，英气；这是刀疤脸的年轻闪回形象，面部轮廓要能看出同一人。

| 姿态 | 输出文件 | 优先级 | 姿态提示词 |
|---|---|---|---|
| 持枪站立 | `asset-qa/pose-raw/pose-young-general-idle.png` | P2 | standing, holding a spear upright, both arms complete, armor, front view |
| 冲锋 | `asset-qa/pose-raw/pose-young-general-charge.png` | P2 | charging forward, spear lowered, cape flying, both arms complete, dynamic side view facing right |
| 中箭负伤 | `asset-qa/pose-raw/pose-young-general-wounded.png` | P2 | kneeling/sitting wounded, holding arm, spear on the ground, both arms complete, side view |

## 瘸马赛赤兔 `horse`

- 参考图：`public/tiaocaoma/assets/char-horse-lame-v1.png`
- 画幅：landscape_4_3 (2240×1680)
- 角色描述：十岁以上的老马赛赤兔，瘦骨嶙峋、肋骨可见、鬃毛稀疏，右前腿瘸并缠着旧布，旧鞍，脖子挂铜铃；侧视，朝右。

| 姿态 | 输出文件 | 优先级 | 姿态提示词 |
|---|---|---|---|
| 站立 | `asset-qa/pose-raw/pose-horse-idle.png` | P1 | side view facing right, standing, four legs visible, ribs visible, brass bell, bandaged right front leg |
| 瘸行 | `asset-qa/pose-raw/pose-horse-limp.png` | P1 | side view facing right, mid-step, right front leg lifted, body tilted, limp gait, ribs visible, brass bell |
| 拒食 | `asset-qa/pose-raw/pose-horse-refuse.png` | P2 | side view facing right, head turned away from food, mouth closed, body tense, ribs visible, brass bell |

## 刀疤脸骑瘸马 `riding`

- 参考图：`public/tiaocaoma/assets/char-scarface-riding.png`
- 画幅：landscape_16_9 (2560×1440)
- 角色描述：刀疤脸侧身骑在瘸马上，整体朝右；左手拉缰绳，右袖为空并固定在肩，绝对没有右手；瘸马瘦骨嶙峋，右前腿瘸，脖子挂铜铃。人与马在同一张剪纸里。

| 姿态 | 输出文件 | 优先级 | 姿态提示词 |
|---|---|---|---|
| 骑乘站立 | `asset-qa/pose-raw/pose-riding-idle.png` | P1 | side view facing right, rider seated upright, left hand on reins, empty right sleeve, horse standing, ribs visible, brass bell |
| 骑乘瘸行 | `asset-qa/pose-raw/pose-riding-limp.png` | P1 | side view facing right, horse mid-step with right front leg lifted, rider bobbing, empty right sleeve, brass bell |
| 勒马停下 | `asset-qa/pose-raw/pose-riding-stop.png` | P2 | side view facing right, horse stopped with head down, rider upright, left hand on reins, empty right sleeve, brass bell |

## 交付后我会做什么

1. 批量抠绿幕、去水印、裁切到透明 PNG。
2. 按角色建立 `pose-<角色>-<姿态>` 映射。
3. 在 Remotion 里按 on-twos 切换姿态，替换现在的整图浮动。
4. 用 3–5 秒测试片段检查动作连贯性，再逐镜铺开。
