const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_MD = path.join(ROOT, "public", "tiaocaoma", "pose-generation-list.md");
const OUT_JSON = path.join(ROOT, "public", "tiaocaoma", "pose-generation-list.json");

const commonPrefix =
  "Use the attached reference image as the exact character design. Keep the same face, age, body proportions, costume, colors, paper texture, torn-paper edges, and layered construction-paper style. Full-body paper-cut puppet, single character only (or rider+horse for the riding asset), centered, feet/body visible, character height about 70% of the canvas, pure green background (#00FF00), no shadow, no floor, no text, no watermark, matte paper with visible fiber texture. Do not change the character design.";

const negativeDefault =
  "different costume, different face, extra limbs, extra fingers, text, watermark, logo, gradient background, realistic photo, 3D render, glossy plastic, cropped feet, multiple characters, pose sheet grid, floor shadow";

const negativeOneArm =
  "different costume, different face, two arms, right arm, right hand, extra limb, extra fingers, prosthesis, text, watermark, logo, gradient background, realistic photo, 3D render, glossy plastic, cropped feet, multiple characters, pose sheet grid, floor shadow";

const characters = [
  {
    id: "er",
    name: "店小二",
    reference: "public/tiaocaoma/assets/char-er-v1.png",
    canvas: "landscape_4_3 (2240×1680)",
    oneArm: false,
    desc:
      "二十出头的跑堂伙计，瘦猴相，尖下巴、小眼睛，瓜皮小帽，青色对襟短褂，灰布腰带，米白围裙，肩上搭白毛巾，黑布鞋；双袖完整。",
    poses: [
      { key: "idle", label: "站姿", priority: "P1", prompt: "standing naturally, both arms relaxed at sides, neutral expression, front view" },
      { key: "speak", label: "说话", priority: "P1", prompt: "standing, one hand raised slightly in a small gesture, head slightly turned, speaking expression, front view" },
      { key: "bow", label: "拱手", priority: "P1", prompt: "standing, hands clasped in front, upper body bowed forward about 20 degrees, respectful, front view" },
      { key: "kneel", label: "下跪", priority: "P1", prompt: "kneeling on both knees, hands on thighs, head lowered, submissive, front view" },
      { key: "point", label: "指点", priority: "P2", prompt: "standing, one arm extended forward with index finger pointing, other arm at side, front view" },
      { key: "tremble", label: "发抖", priority: "P2", prompt: "kneeling, shoulders raised, hands trembling in front, fearful expression, front view" },
    ],
  },
  {
    id: "scarface",
    name: "刀疤脸",
    reference: "public/tiaocaoma/assets/char-scarface-v1.png",
    canvas: "landscape_4_3 (2240×1680)",
    oneArm: true,
    desc:
      "四十五岁上下的独臂老兵，宽肩黑脸、胡茬、深眼窝，刀疤从颧骨拉到下颌，褪色靛青交领短袄，旧皮护腕，旧皮靴；右袖为空并固定在肩，绝对没有右手/右臂，只有左手。",
    poses: [
      { key: "idle", label: "站姿", priority: "P1", prompt: "standing naturally, left arm at side, empty right sleeve hanging still, neutral expression, front view" },
      { key: "speak", label: "说话", priority: "P1", prompt: "standing, left hand raised slightly in a gesture, empty right sleeve hanging, speaking expression, front view" },
      { key: "sleeve", label: "空袖摆动", priority: "P1", prompt: "standing, empty right sleeve swaying outward, left arm at side, body slightly turned, front view" },
      { key: "kneel", label: "下跪", priority: "P1", prompt: "kneeling on both knees, left hand on thigh, empty right sleeve hanging, head lowered, front view" },
      { key: "bow", label: "拱手", priority: "P2", prompt: "standing, left hand clasped in front, upper body bowed forward, empty right sleeve hanging, front view" },
      { key: "point", label: "独臂指认", priority: "P2", prompt: "standing, left arm extended with index finger pointing, empty right sleeve hanging, front view" },
    ],
  },
  {
    id: "zhao",
    name: "赵大人",
    reference: "public/tiaocaoma/assets/char-zhao-v1.png",
    canvas: "landscape_4_3 (2240×1680)",
    oneArm: false,
    desc:
      "五十岁上下的圆脸官员，双下巴、短须、圆腹，暗红圆领官袍，乌纱帽，玉带；双袖完整。",
    poses: [
      { key: "idle", label: "站姿", priority: "P1", prompt: "standing, arms at sides, official posture, neutral expression, front view" },
      { key: "speak", label: "问话", priority: "P1", prompt: "standing, one hand raised in an official gesture, speaking with authority, front view" },
      { key: "bow", label: "拱手", priority: "P2", prompt: "standing, hands clasped, upper body bowed slightly, respectful, front view" },
      { key: "point", label: "发难", priority: "P2", prompt: "standing, one arm extended, index finger pointing, authoritative and angry, front view" },
      { key: "sleeve", label: "甩袖", priority: "P2", prompt: "standing, one wide sleeve flicked outward, body slightly turned, front view" },
    ],
  },
  {
    id: "yipin",
    name: "一品大员",
    reference: "public/tiaocaoma/assets/char-yipin-v1.png",
    canvas: "landscape_4_3 (2240×1680)",
    oneArm: false,
    desc:
      "六十岁上下的高瘦一品大员，颧骨高、细长八字胡、冷脸，紫黑金边圆领官袍，高顶乌纱帽；双袖完整。",
    poses: [
      { key: "idle", label: "站姿", priority: "P1", prompt: "standing, hands behind back, chin raised, cold and composed, front view" },
      { key: "speak", label: "开口", priority: "P1", prompt: "standing, one hand raised slightly, cold speaking expression, front view" },
      { key: "cold", label: "冷眼", priority: "P1", prompt: "standing, hands behind back, chin raised, cold contemptuous stare, front view" },
      { key: "point", label: "俯指", priority: "P2", prompt: "standing, one arm extended downward, pointing at someone, contemptuous, front view" },
      { key: "turn", label: "转身离去", priority: "P2", prompt: "turning away, side/back view, one sleeve swinging, walking away" },
    ],
  },
  {
    id: "general",
    name: "独臂将军",
    reference: "public/tiaocaoma/assets/char-general-one-arm-v1.png",
    canvas: "landscape_4_3 (2240×1680)",
    oneArm: true,
    desc:
      "刀疤脸的公堂形象，独臂将军，靛青旧袍，右袖为空并固定在肩，绝对没有右手/右臂，只有左手；以跪姿为主。",
    poses: [
      { key: "kneel-front", label: "跪姿正面", priority: "P1", prompt: "kneeling on both knees facing forward, left hand on knee, empty right sleeve, head lowered, front view" },
      { key: "speak", label: "跪姿抬头说话", priority: "P1", prompt: "kneeling, head raised, speaking, left hand raised slightly, empty right sleeve, front view" },
      { key: "kneel-side", label: "跪姿侧面", priority: "P2", prompt: "kneeling in side view facing right, left hand on knee, empty right sleeve, head lowered" },
      { key: "bow", label: "跪拜", priority: "P2", prompt: "kneeling, bowing forward with head to the ground, left hand on the floor, empty right sleeve, side view facing right" },
    ],
  },
  {
    id: "young-general",
    name: "年轻将军",
    reference: "public/tiaocaoma/assets/char-general-young-v1.png",
    canvas: "landscape_4_3 (2240×1680)",
    oneArm: false,
    desc:
      "年轻将领，双袖完整，铠甲，长枪，英气；这是刀疤脸的年轻闪回形象，面部轮廓要能看出同一人。",
    poses: [
      { key: "idle", label: "持枪站立", priority: "P2", prompt: "standing, holding a spear upright, both arms complete, armor, front view" },
      { key: "charge", label: "冲锋", priority: "P2", prompt: "charging forward, spear lowered, cape flying, both arms complete, dynamic side view facing right" },
      { key: "wounded", label: "中箭负伤", priority: "P2", prompt: "kneeling/sitting wounded, holding arm, spear on the ground, both arms complete, side view" },
    ],
  },
  {
    id: "horse",
    name: "瘸马赛赤兔",
    reference: "public/tiaocaoma/assets/char-horse-lame-v1.png",
    canvas: "landscape_4_3 (2240×1680)",
    oneArm: false,
    desc:
      "十岁以上的老马赛赤兔，瘦骨嶙峋、肋骨可见、鬃毛稀疏，右前腿瘸并缠着旧布，旧鞍，脖子挂铜铃；侧视，朝右。",
    poses: [
      { key: "idle", label: "站立", priority: "P1", prompt: "side view facing right, standing, four legs visible, ribs visible, brass bell, bandaged right front leg" },
      { key: "limp", label: "瘸行", priority: "P1", prompt: "side view facing right, mid-step, right front leg lifted, body tilted, limp gait, ribs visible, brass bell" },
      { key: "refuse", label: "拒食", priority: "P2", prompt: "side view facing right, head turned away from food, mouth closed, body tense, ribs visible, brass bell" },
    ],
  },
  {
    id: "riding",
    name: "刀疤脸骑瘸马",
    reference: "public/tiaocaoma/assets/char-scarface-riding.png",
    canvas: "landscape_16_9 (2560×1440)",
    oneArm: true,
    desc:
      "刀疤脸侧身骑在瘸马上，整体朝右；左手拉缰绳，右袖为空并固定在肩，绝对没有右手；瘸马瘦骨嶙峋，右前腿瘸，脖子挂铜铃。人与马在同一张剪纸里。",
    poses: [
      { key: "idle", label: "骑乘站立", priority: "P1", prompt: "side view facing right, rider seated upright, left hand on reins, empty right sleeve, horse standing, ribs visible, brass bell" },
      { key: "limp", label: "骑乘瘸行", priority: "P1", prompt: "side view facing right, horse mid-step with right front leg lifted, rider bobbing, empty right sleeve, brass bell" },
      { key: "stop", label: "勒马停下", priority: "P2", prompt: "side view facing right, horse stopped with head down, rider upright, left hand on reins, empty right sleeve, brass bell" },
    ],
  },
];

const rows = [];
for (const character of characters) {
  for (const pose of character.poses) {
    const output = `asset-qa/pose-raw/pose-${character.id}-${pose.key}.png`;
    const prompt = `${commonPrefix}

Character: ${character.desc}
Pose: ${pose.prompt}
Canvas: ${character.canvas}. Single character only, full body, centered, feet/body visible, pure green background (#00FF00), no shadow, no text, no watermark.`;
    rows.push({
      id: `${character.id}-${pose.key}`,
      character: character.name,
      reference: character.reference,
      output,
      pose: pose.key,
      poseLabel: pose.label,
      priority: pose.priority,
      canvas: character.canvas,
      prompt,
      negative: character.oneArm ? negativeOneArm : negativeDefault,
    });
  }
}

const md = [];
md.push("# 《跳槽马》姿态表生成清单");
md.push("");
md.push("用于 Pass 2 剪纸帧动画：每个角色生成多个姿态，按 on-twos 切换。");
md.push("");
md.push(`- 总姿态：${rows.length} 个`);
md.push(`- P1 必做：${rows.filter((row) => row.priority === "P1").length} 个`);
md.push(`- P2 加分：${rows.filter((row) => row.priority === "P2").length} 个`);
md.push("- 输出目录：`asset-qa/pose-raw/`");
md.push("- 输出格式：PNG，纯绿幕 `#00FF00`，无阴影、无文字、无水印");
md.push("");
md.push("## 通用规则");
md.push("");
md.push("1. **必须使用对应角色的现有单视图作为参考图**，保持脸、年龄、体型、服装、颜色、纸纹完全一致。");
md.push("2. 每个姿态单独一张图，不要拼成多格姿态表；如果是多格，请按姿态度单独输出。");
md.push("3. 角色高度约占画布 70%，居中，脚/身体完整，不要裁切。");
md.push("4. 刀疤脸、独臂将军、骑乘图：右袖必须为空并固定在肩，**绝对不能出现右手/右臂**。");
md.push("5. 所有图都放在纯绿幕上，不要地面阴影、不要渐变背景。");
md.push("6. 先生成 P1，再生成 P2；同一角色使用同一参考图和同一 seed/风格参数。");
md.push("");
md.push("## 通用提示词前缀");
md.push("");
md.push("```text");
md.push(commonPrefix);
md.push("```");
md.push("");
md.push("## 负面提示词");
md.push("");
md.push("普通角色：");
md.push("");
md.push("```text");
md.push(negativeDefault);
md.push("```");
md.push("");
md.push("独臂角色（刀疤脸 / 独臂将军 / 骑乘）：");
md.push("");
md.push("```text");
md.push(negativeOneArm);
md.push("```");
md.push("");

for (const character of characters) {
  md.push(`## ${character.name} \`${character.id}\``);
  md.push("");
  md.push(`- 参考图：\`${character.reference}\``);
  md.push(`- 画幅：${character.canvas}`);
  md.push(`- 角色描述：${character.desc}`);
  md.push("");
  md.push("| 姿态 | 输出文件 | 优先级 | 姿态提示词 |");
  md.push("|---|---|---|---|");
  for (const pose of character.poses) {
    md.push(
      `| ${pose.label} | \`asset-qa/pose-raw/pose-${character.id}-${pose.key}.png\` | ${pose.priority} | ${pose.prompt} |`,
    );
  }
  md.push("");
}

md.push("## 交付后我会做什么");
md.push("");
md.push("1. 批量抠绿幕、去水印、裁切到透明 PNG。");
md.push("2. 按角色建立 `pose-<角色>-<姿态>` 映射。");
md.push("3. 在 Remotion 里按 on-twos 切换姿态，替换现在的整图浮动。");
md.push("4. 用 3–5 秒测试片段检查动作连贯性，再逐镜铺开。");
md.push("");

fs.writeFileSync(OUT_MD, md.join("\n"), "utf8");
fs.writeFileSync(OUT_JSON, JSON.stringify(rows, null, 2), "utf8");

console.log(`Wrote ${OUT_MD}`);
console.log(`Wrote ${OUT_JSON}`);
console.log(
  `Total ${rows.length}, P1 ${rows.filter((row) => row.priority === "P1").length}, P2 ${rows.filter((row) => row.priority === "P2").length}.`,
);
