/**
 * 跳槽马 — 纸艺风格圣经（阶段 2）
 *
 * 用途：
 * 1. 锁定 AI 素材的统一风格、色板、纸材质与光照；
 * 2. 给每个角色定义剪影、服装、分件与关节；
 * 3. 提供可直接复用的 prompt 模板与抠图规范；
 * 4. 定义三张风格帧的生成提示词。
 *
 * 原则：AI 只负责“纸的质感与造型”，分层、关节、阴影、文字、转场全部由代码完成。
 */

import { PALETTE } from "./script";

/** 在脚本色板基础上扩展纸艺专用色。 */
export const PAPER_PALETTE = {
  ...PALETTE,
  paperShadow: "#C9B99A",
  paperHighlight: "#F4EBD8",
  jade: "#5C6E58",
  dusk: "#6B4A3A",
  night: "#1B2633",
} as const;

export const PAPER_STYLE = {
  name: "宣纸剪刻 · 层叠纸偶",
  reference:
    "Chinese folk paper-cut, hand-cut paper collage, miniature stop-motion set, layered construction paper",
  period: {
    era: "虚构明中期京城",
    officials: "圆领官袍、乌纱帽、玉带、补子；不用清代顶戴与辫发",
    commoners: "对襟短褂、布裤、布鞋、瓜皮小帽或束发；不用现代服装",
    military: "旧皮甲、短打、皮靴、束发；不做戏曲化亮甲",
    avoid: "武侠长袍、日式或韩式古装、现代厨师服、清代辫发",
  },
  texture: {
    fiber: "visible mulberry paper fibers, subtle mottling, 6–10% grain",
    edge: "hand-cut edges with 1–3px irregular nicks; never perfectly smooth",
    layer: "3–5 paper layers, each with a 2–4px offset shadow",
    surface: "flat matte color, no gloss, no gradient, no airbrush",
  },
  lighting: {
    key: "warm top-left key light, 3200K",
    shadow: "soft dark-brown shadows, 35–55% opacity",
    atmosphere: "faint paper dust, subtle vignette, no lens flare",
  },
  composition: {
    depthLayers: "foreground / midground / subject / background / sky",
    camera: "locked-off miniature set, slow lateral moves, stepped push-ins",
    aspect: "16:9, 1920×1080",
  },
  animation: {
    cadence: "on twos at 24fps, 12 poses per second",
    boil: "paper edge boil every 2 frames with a deterministic seed",
    joints: "visible brass paper fasteners at shoulders, elbows, hips and knees",
    rule: "no smooth tweening, no CSS transitions; every pose is a discrete paper drawing",
  },
  forbidden: [
    "photorealistic skin",
    "3D render or glossy plastic",
    "anime or cartoon outline",
    "gradient shading or airbrush",
    "perfect vector-smooth edges",
    "text, letters, logos or watermarks",
    "blood or gore",
    "extra limbs or deformed hands",
  ],
} as const;

export const PROMPT_PREFIX =
  "Hand-cut Chinese paper collage for a stop-motion folk tale film, layered construction paper, visible mulberry paper fibers, torn and nicked edges, flat matte colors, soft drop shadows between 3–5 paper layers, miniature set lighting, warm top-left key light, cinematic 16:9 composition, blank surfaces with no text";

export const NEGATIVE_PROMPT =
  "photorealistic, 3D render, glossy plastic, anime, cartoon outline, gradient shading, airbrush, smooth vector edges, digital painting, text, letters, watermark, logo, Chinese characters, blood, gore, extra limbs, deformed hands";

const PALETTE_WORDS =
  "rice paper beige #E8DCC3, ink black #1C1A17, vermilion red #B83A2E, deep indigo #2E4A5A, ochre brown #9A6B3F, muted gold #C9A227";

/** 生成单件素材的完整提示词。 */
export const buildAssetPrompt = (subject: string, extra = ""): string =>
  `[PURPOSE]: Production asset for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: ${subject}. STYLE: ${PROMPT_PREFIX}. PALETTE: ${PALETTE_WORDS}. ${extra} NEGATIVE: ${NEGATIVE_PROMPT}.`;

/** 生成风格帧的完整提示词。 */
export const buildStyleFramePrompt = (subject: string): string =>
  `[PURPOSE]: Approved style frame for "Tiaocao Ma", a Chinese paper-cut stop-motion short film. SUBJECT: ${subject}. STYLE: ${PROMPT_PREFIX}. PALETTE: ${PALETTE_WORDS}. NEGATIVE: ${NEGATIVE_PROMPT}.`;

/** AI 素材抠图与切件规范。 */
export const CUTOUT_SPEC = {
  background: "solid chroma green #00FF00, evenly lit, no shadow",
  margin: "at least 8% empty padding around the subject",
  minLongEdge: 2048,
  output: "transparent PNG, 2× supersampled",
  edge: "preserve torn paper edge, 1px feather, no white halo",
  anchor:
    "joint pivots (shoulder / elbow / hip / knee / hoof) marked in metadata, not baked into pixels",
  naming: "lowercase dot-separated asset id, e.g. char.horse.lame.side.png",
  watermark:
    "generated images carry a small “AI生成” mark at bottom-right; crop 4% bottom / 6% right before cutout, or regenerate with extra margin",
  continuity:
    "AI concept frames may hallucinate missing limbs; CHARACTER_SPECS parts are authoritative for the final puppet",
} as const;

export interface CharacterSpec {
  name: string;
  age: string;
  build: string;
  costume: string;
  silhouette: string;
  palette: string[];
  parts: string[];
  poses: string[];
  notes: string;
}

/** 主要角色纸偶设定。 */
export const CHARACTER_SPECS: Record<string, CharacterSpec> = {
  er: {
    name: "店小二",
    age: "二十出头，机灵相",
    build: "瘦猴似的身形，窄肩、长脖子，动作碎而快",
    costume:
      "青色对襟短褂、灰布腰带、米白围裙、肩上搭白毛巾、黑布鞋、瓜皮小帽",
    silhouette: "小帽 + 尖下巴 + 前倾瘦身 + 甩动的毛巾",
    palette: ["indigo", "paper", "ink"],
    parts: [
      "head",
      "torso",
      "upperArmL",
      "upperArmR",
      "forearmL",
      "forearmR",
      "handL",
      "handR",
      "thighL",
      "thighR",
      "shinL",
      "shinR",
      "footL",
      "footR",
      "apron",
      "towel",
    ],
    poses: ["stand", "bow", "sneer", "run", "kowtow", "point", "wipeTable"],
    notes:
      "不是现代厨师或咖啡店员；要像老饭馆里跑堂的市井伙计，眉眼精明、笑容谄媚。表情靠换脸纸：假笑、赔笑、得意、惊恐、咬牙五张即可覆盖全片。",
  },
  scarface: {
    name: "刀疤脸",
    age: "四十五岁上下",
    build: "肩宽背厚，站姿笔直，脸上有风霜与胡茬",
    costume:
      "褪色靛青交领短袄、旧皮护腕、黑布腰带、旧皮靴，右袖空荡并别在肩头",
    silhouette: "宽肩 + 空右袖 + 长刀疤 + 束发",
    palette: ["indigo", "ink", "paper"],
    parts: [
      "head",
      "scar",
      "torso",
      "leftUpperArm",
      "leftForearm",
      "leftHand",
      "emptySleeve",
      "thighL",
      "thighR",
      "shinL",
      "shinR",
      "footL",
      "footR",
    ],
    poses: ["stand", "bowFist", "ride", "laugh", "touchHorse", "kneel"],
    notes:
      "不是年轻侠客；要像被朝廷遗忘的老兵，黑脸、晒痕、胡茬、深眼窝，刀疤从颧骨拉到下颌。刀疤是一条浅色纸线，不做伤口；空袖是角色最重要的剪影符号。",
  },
  zhao: {
    name: "赵大人",
    age: "五十上下",
    build: "敦实，圆脸双下巴，肚子先到，步子慢而稳",
    costume: "暗红圆领官袍、乌纱帽、玉带、黑官靴，短须",
    silhouette: "乌纱帽双翅 + 圆腹 + 宽袖",
    palette: ["vermilion", "ink", "gold"],
    parts: ["head", "hat", "torso", "armL", "armR", "legL", "legR"],
    poses: ["stand", "point", "flickSleeve", "startled", "drawSword"],
    notes:
      "养尊处优的京官，表情傲慢；情绪变化靠换脸纸：红脸、白脸、铁青脸三张。",
  },
  yipin: {
    name: "一品大员",
    age: "六十上下",
    build: "高瘦，颧骨高，脖颈笔直",
    costume: "紫黑圆领官袍、金边、高顶乌纱帽、玉带、细长八字胡",
    silhouette: "高帽 + 窄肩 + 下垂的宽袖",
    palette: ["indigo", "gold", "ink"],
    parts: ["head", "hat", "torso", "armL", "armR", "legL", "legR"],
    poses: ["stand", "glare", "flickSleeve", "boardHorse"],
    notes: "比赵大人更高、更冷，像收在鞘里的刀；脸纸只有冷白与铁青两档。",
  },
  "official.guest": {
    name: "便服官员",
    age: "三十五至五十五",
    build: "中等偏胖，姿态松弛",
    costume: "靛青或赭石圆领便袍，束发或方巾，不戴官帽",
    silhouette: "圆领便袍 + 束发 + 微驼的坐姿",
    palette: ["indigo", "ochre", "paper"],
    parts: ["head", "torso", "armL", "armR", "legL", "legR"],
    poses: ["sit", "eat", "stand", "whisper", "shock"],
    notes: "做两个色变体即可组成官员群像，脸上要有酒足饭饱的松弛感。",
  },
  "horse.lame": {
    name: "赛赤兔（瘸腿白马）",
    age: "十岁以上的老马",
    build: "瘦骨嶙峋，肋骨可见，右前腿跛，鬃毛稀疏",
    costume: "旧鞍、磨旧的缰绳、脖子挂铜铃",
    silhouette: "低垂马头 + 一高一低的步态 + 晃动的铃铛",
    palette: ["paper", "paperShadow", "gold"],
    parts: [
      "body",
      "neck",
      "head",
      "earL",
      "earR",
      "frontLegL",
      "frontLegR",
      "backLegL",
      "backLegR",
      "tail",
      "bell",
    ],
    poses: ["stand", "walkLame", "eat", "raiseHead", "lieDown"],
    notes:
      "不是俊马；老、瘦、瘸要一眼看出，和金色马王剪影形成反差。瘸腿步态是 4 帧循环：健腿落地、瘸腿点地、身体下沉、铃铛滞后。",
  },
  "horse.crowd": {
    name: "众马",
    age: "成年",
    build: "膘肥体壮，姿态整齐",
    costume: "棕、黑、枣红三种毛色，普通鞍具",
    silhouette: "整齐低头的马群，形成压迫感",
    palette: ["ochre", "ink", "dusk"],
    parts: ["body", "neck", "head", "fourLegs", "tail"],
    poses: ["eat", "stand", "stepBack", "bowHead"],
    notes:
      "普通马群，膘肥体壮，和瘸马的瘦形成对比；群像不用逐匹精细，剪影与节奏一致即可。",
  },
  "general.young": {
    name: "年轻将军",
    age: "二十多岁",
    build: "挺拔，肩背开阔",
    costume: "红黑旧甲、披风、长枪，束发",
    silhouette: "高盔 + 披风 + 长枪的斜线",
    palette: ["vermilion", "ink", "gold"],
    parts: ["head", "helmet", "torso", "armL", "armR", "legL", "legR", "cape"],
    poses: ["ride", "raiseSpear", "capture", "hitByArrow"],
    notes: "只出现在皮影闪回里；要英气但不过度俊美，轮廓比细节重要。",
  },
  "general.one-arm": {
    name: "独臂将军",
    age: "四十多岁",
    build: "消瘦，风霜满面，右袖空荡",
    costume: "旧甲、破损披风、旧皮靴，跪姿",
    silhouette: "空右袖 + 旧甲 + 低垂的头",
    palette: ["indigo", "ochre", "ink"],
    parts: [
      "head",
      "torso",
      "leftArm",
      "emptySleeve",
      "legL",
      "legR",
      "tornCape",
    ],
    poses: ["kneel", "stand", "lookBack"],
    notes: "同一将军的多年后状态；不要年轻化，要和刀疤脸的老兵气质一致。",
  },
};

export interface StyleFrameSpec {
  id: string;
  title: string;
  shotIds: string[];
  path: string;
  prompt: string;
}

/** 四张风格帧：群像、角色设定、登场、情感落点。 */
export const STYLE_FRAMES: StyleFrameSpec[] = [
  {
    id: "trough-hierarchy",
    title: "马槽等级",
    shotIds: ["rules-07", "rules-08", "rules-09"],
    path: "public/tiaocaoma/styleframes/01-trough-hierarchy",
    prompt: buildStyleFramePrompt(
      "Wide establishing shot of a long wooden horse trough in the backyard of a traditional Beijing restaurant in the Ming dynasty, divided into dozens of small compartments, paper-cut horses of different colors standing in their own slots, a thin foxy young restaurant waiter with a pointed chin, small eyes, small skullcap, indigo cross-collar short jacket, gray cloth belt, cream apron, white towel over his shoulder and black cloth shoes, holding a wooden stick, officials' horses on the east side with fresh green hay, common horses on the west with dry yellow hay, blank wooden plaques with no text, warm late-afternoon light, layered paper set with visible torn edges and soft drop shadows",
    ),
  },
  {
    id: "character-lineup",
    title: "角色设定总览",
    shotIds: ["rules-04", "exception-01", "contest-05", "truth-01"],
    path: "public/tiaocaoma/styleframes/04-character-lineup",
    prompt: buildStyleFramePrompt(
      "Character lineup sheet on a plain rice paper background, five full-body Ming-dynasty paper puppets standing in a row with clear space between them: a thin foxy young restaurant waiter with a pointed chin, small eyes, small skullcap, indigo cross-collar short jacket, gray cloth belt, cream apron, white towel and black cloth shoes; a weathered 45-year-old former general with a dark tanned face, deep-set eyes, stubble, a long pale scar from cheekbone to jaw, broad shoulders, faded indigo cross-collar short jacket, old leather belt and boots, right sleeve empty and pinned at the shoulder; a stout 50-year-old official with a round face, double chin, short beard, dark red round-collar robe, black winged hat and jade belt; a tall cold 60-year-old first-rank official with high cheekbones, thin mustache, purple-black gold-trimmed round-collar robe and tall winged hat; and an old bony white horse with visible ribs, sparse mane, a lame right front leg and a brass bell. Flat paper cutout, exaggerated folk caricature proportions, visible brass joints, neutral standing poses, soft drop shadows, no text",
    ),
  },
  {
    id: "scarface-arrival",
    title: "刀疤脸登场",
    shotIds: ["exception-01", "exception-03", "exception-04"],
    path: "public/tiaocaoma/styleframes/02-scarface-arrival",
    prompt: buildStyleFramePrompt(
      "A weathered 45-year-old former general with a dark tanned face, deep-set eyes, stubble and a long pale scar from cheekbone to jaw, broad shoulders, faded indigo cross-collar short jacket, old leather belt and boots, his right sleeve hanging empty and pinned at the shoulder with no right hand, rides an old bony white horse with visible ribs, sparse mane, a lame right front leg and a small brass bell. The horse tilts mid-step. He arrives at the gate of a busy Ming-dynasty Beijing restaurant, red paper lanterns and a blank cloth banner, paper-cut officials and sedan chairs in the background, dusk light, layered paper silhouette with visible fibers and torn edges, no blood, no text",
    ),
  },
  {
    id: "horse-king-dusk",
    title: "马王黄昏",
    shotIds: ["truth-10", "truth-11"],
    path: "public/tiaocaoma/styleframes/03-horse-king-dusk",
    prompt: buildStyleFramePrompt(
      "Emotional final shot at dusk: the same weathered 45-year-old former general with a dark tanned face, long pale scar, stubble, faded indigo cross-collar short jacket and an empty right sleeve pinned at the shoulder, stands beside an old bony white horse with visible ribs and a lame front leg, touching its back with his left hand. A herd of well-fed officials' horses bow their heads in the courtyard behind them. A translucent golden paper silhouette of a magnificent galloping warhorse rises behind the lame horse like a memory. Warm rim light, deep indigo shadows, layered paper cutout with visible fibers and torn edges, cinematic 16:9 composition, no text",
    ),
  },
];
