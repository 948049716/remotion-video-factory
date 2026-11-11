/**
 * 跳槽马 — 素材清单（阶段 2）
 *
 * 60 项生产素材，覆盖 script.ts 中全部 77 个资产键。
 * - ai：整张生成，后期抠图/分层
 * - ai+code：AI 生成纸材质与主体，箭头、文字、结构线由代码叠加
 * - code：完全由 SVG / CSS 生成
 *
 * 生成提示词由 style.ts 的 buildAssetPrompt 统一拼接，
 * 保证所有素材共享同一套纸材质、色板与负面词。
 */

import { SHOTS } from "./script";
import { buildAssetPrompt, CHARACTER_SPECS } from "./style";

export type AssetCategory =
  | "background"
  | "character"
  | "prop"
  | "fx"
  | "title";

export type AssetSource = "ai" | "ai+code" | "code";
export type CutoutMode = "full-bleed" | "chroma-key" | "alpha" | "svg";
export type AssetPriority = 1 | 2 | 3;

export interface AssetSpec {
  id: string;
  category: AssetCategory;
  name: string;
  /** 对应 script.ts 中的资产键，可覆盖多个变体。 */
  covers: string[];
  description: string;
  prompt: string;
  imageSize: string;
  source: AssetSource;
  cutout: CutoutMode;
  anchor?: string;
  parts?: string[];
  usedBy: string[];
  priority: AssetPriority;
  status: "planned" | "generated" | "cutout" | "approved";
}

interface AssetSeed
  extends Omit<AssetSpec, "prompt" | "usedBy" | "status"> {
  promptSubject?: string;
  promptExtra?: string;
}

const ASSET_SEEDS: AssetSeed[] = [
  /* ---------------- 背景 13 项 ---------------- */
  {
    id: "bg.street.west",
    category: "background",
    name: "京城西街外景",
    covers: ["bg.street.west"],
    description:
      "大全景定场：城西街口、饭馆门脸、轿马与行人，前中后三层纸片视差。",
    promptSubject:
      "wide establishing shot of a bustling old Beijing street in the late afternoon, a small restaurant with a tiled roof, red paper lanterns and a blank cloth banner, sedan chairs and paper-cut pedestrians in the background only, warm dusty light, layered paper set, clear empty foreground",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "full-bleed",
    priority: 1,
  },
  {
    id: "bg.restaurant.facade",
    category: "background",
    name: "饭馆门脸",
    covers: ["bg.restaurant.facade"],
    description:
      "正门视角：屋檐、窗棂、灯笼、幌子，供宾客人流与仪仗叠层。",
    promptSubject:
      "front view of a small traditional Beijing restaurant facade, tiled roof, red paper lanterns, wooden lattice windows, blank cloth banner, a few paper-cut customers entering, warm lantern light, layered paper set",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "full-bleed",
    priority: 1,
  },
  {
    id: "bg.restaurant.interior",
    category: "background",
    name: "饭馆内堂",
    covers: ["bg.restaurant.interior"],
    description:
      "内堂中景：方桌、条凳、蒸汽、便服官员，供桌面特写与人物调度。",
    promptSubject:
      "interior of a small traditional Beijing restaurant, square wooden tables, paper-cut officials in plain clothes eating in the background only, steam rising from dishes, warm interior light, layered paper set, shallow depth, foreground tables empty",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "full-bleed",
    priority: 1,
  },
  {
    id: "bg.stable",
    category: "background",
    name: "后院马棚 · 白天",
    covers: ["bg.stable"],
    description:
      "空马棚全景：木柱、草棚、长槽、草料，供规则建立与绝食戏使用。",
    promptSubject:
      "empty backyard horse stable of a traditional Beijing restaurant, wooden posts, thatched roof, long empty wooden trough, hay bundles, afternoon sunlight, layered paper set, no horses, no animals, clear empty foreground",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "full-bleed",
    priority: 1,
  },
  {
    id: "bg.stable.night",
    category: "background",
    name: "马厩夜景",
    covers: ["bg.stable.night"],
    description:
      "同一马棚的夜景：靛青纸天、纸月、灯火，供瘦马纸偶叠加。",
    promptSubject:
      "night view of an empty traditional horse stable, deep indigo paper sky, a paper moon, lantern glow, quiet and cold atmosphere, layered paper set, no horses, no animals, clear empty foreground",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "full-bleed",
    priority: 2,
  },
  {
    id: "bg.trough.panorama",
    category: "background",
    name: "长马槽全景",
    covers: ["bg.trough.long", "bg.trough.west", "bg.trough.east"],
    description:
      "3.56:1 超宽长图，一条马槽从西贯到东；西端、东端、中段均为同一张图的裁切。",
    promptSubject:
      "ultra-wide panoramic view of a long empty wooden horse trough divided into dozens of small compartments, wooden posts, hay, stable interior, continuous horizontal set design, layered paper, no horses, no animals, clear empty foreground",
    imageSize: "3840x1080",
    source: "ai",
    cutout: "full-bleed",
    priority: 1,
  },
  {
    id: "bg.hall",
    category: "background",
    name: "府邸厅堂",
    covers: ["bg.hall"],
    description:
      "公堂全景：黑木柱、红案、两列官员、灯火，供第五幕对质。",
    promptSubject:
      "grand traditional Chinese official hall, dark wooden pillars, red lacquer table, paper-cut officials standing in two rows in the background only, lantern light, solemn atmosphere, layered paper set, foreground empty",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "full-bleed",
    priority: 1,
  },
  {
    id: "bg.table",
    category: "background",
    name: "桌面木纹",
    covers: ["bg.table"],
    description:
      "俯拍桌面底板，带磨损与杯痕，供花生米、酒壶、菜碟叠层。",
    promptSubject:
      "top-down close-up of a worn wooden restaurant table, visible paper texture, a few crumbs and cup rings, warm light, empty composition for props, layered paper",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "full-bleed",
    priority: 2,
  },
  {
    id: "bg.window.paper",
    category: "background",
    name: "窗纸光影",
    covers: ["bg.window.paper"],
    description:
      "窗纸与木格 overlay，用于内堂官员会心一笑的隔窗镜头。",
    promptSubject:
      "close-up of a traditional Chinese lattice window with rice paper, warm backlight, visible paper fibers, soft shadows, layered paper overlay",
    imageSize: "square",
    source: "ai",
    cutout: "alpha",
    priority: 3,
  },
  {
    id: "bg.map.west-east",
    category: "background",
    name: "西东西贵示意图",
    covers: ["bg.map.west-east"],
    description:
      "鸟瞰纸片地图：饭馆、街道、东边金太阳；箭头与标注由代码叠加。",
    promptSubject:
      "top-down illustrated map of a small restaurant and a street running east-west, paper-cut rooftops, a golden paper sun rising in the east, blank paths, folk art map, layered paper",
    promptExtra: "Leave the path areas blank for code-drawn arrows.",
    imageSize: "landscape_16_9",
    source: "ai+code",
    cutout: "full-bleed",
    priority: 2,
  },
  {
    id: "bg.battlefield",
    category: "background",
    name: "皮影战场",
    covers: ["bg.battlefield"],
    description:
      "白纸幕皮影战场：红黑两军剪影、箭影、烟尘，用于将军闪回。",
    promptSubject:
      "shadow-puppet battlefield on a white paper screen, silhouettes of ancient Chinese cavalry and infantry, red and black paper armies, dust and arrow silhouettes, dramatic backlight, no gore",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "full-bleed",
    priority: 2,
  },
  {
    id: "bg.palace.gate",
    category: "background",
    name: "宫门雨夜",
    covers: ["bg.palace.gate"],
    description:
      "朱红宫门在雨中合拢，石阶湿冷，供独臂将军被弃的闪回。",
    promptSubject:
      "rainy night at a grand Chinese palace gate, vermilion doors closing, wet stone steps, paper rain lines, cold indigo palette, layered paper, empty gate, no people, clear empty foreground",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "full-bleed",
    priority: 1,
  },
  {
    id: "bg.dusk.road",
    category: "background",
    name: "黄昏后门外",
    covers: ["bg.dusk.road"],
    description:
      "饭馆后门外的黄昏土路，长影、纸树、暖赭天空，供结尾一人一马。",
    promptSubject:
      "quiet road outside the back gate of a restaurant at dusk, long shadows, warm ochre sky, paper-cut trees and rooftops, empty composition for two silhouettes, layered paper",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "full-bleed",
    priority: 1,
  },

  /* ---------------- 角色 18 项 ---------------- */
  {
    id: "char.er",
    category: "character",
    name: "店小二纸偶",
    covers: ["char.er"],
    description:
      "三视图 + 分件：瓜皮小帽、青色对襟短褂、灰布腰带、米白围裙、白毛巾、黑布鞋。",
    promptSubject:
      "character turnaround sheet of a thin foxy young Ming-dynasty restaurant waiter, pointed chin, small eyes, small skullcap, indigo cross-collar short jacket, gray cloth belt, cream apron, white towel over shoulder, black cloth shoes, flat paper puppet, front side and back views, neutral pose, jointed limbs, not a modern chef",
    promptExtra: "Arrange the views in a clean row on chroma green with even spacing.",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    parts: CHARACTER_SPECS.er.parts,
    priority: 1,
  },
  {
    id: "char.scarface",
    category: "character",
    name: "刀疤脸纸偶",
    covers: ["char.scarface"],
    description:
      "三视图 + 分件：四十五岁老兵、黑脸胡茬、长刀疤、褪色靛青短袄、空右袖。",
    promptSubject:
      "character turnaround sheet of a weathered 45-year-old former general, dark tanned face, deep-set eyes, stubble, a long pale scar from cheekbone to jaw, broad shoulders, faded indigo cross-collar short jacket, old leather belt and boots, right sleeve empty and pinned at the shoulder, flat paper puppet, front side and back views, neutral pose, jointed limbs, not a young handsome swordsman",
    promptExtra: "The scar is a thin pale paper line, not a wound. No blood.",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    parts: CHARACTER_SPECS.scarface.parts,
    priority: 1,
  },
  {
    id: "char.scarface.riding",
    category: "character",
    name: "刀疤脸骑瘸马",
    covers: ["char.scarface.riding"],
    description:
      "预组合侧视姿态，供登场与重复蒙太奇直接使用。",
    promptSubject:
      "side view paper-cut puppet of a weathered 45-year-old scar-faced former general with a dark tanned face, long pale scar and stubble, faded indigo cross-collar short jacket, right sleeve empty and pinned, riding an old bony white horse with visible ribs, sparse mane, a lame right front leg and a small brass bell, the horse tilting mid-step, layered paper silhouette, isolated on chroma green",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "chroma-key",
    anchor: "horse-hoof",
    priority: 2,
  },
  {
    id: "char.zhao",
    category: "character",
    name: "赵大人纸偶",
    covers: ["char.zhao"],
    description:
      "三视图 + 分件：暗红官袍、乌纱帽、短须、玉带、圆腹。",
    promptSubject:
      "character turnaround sheet of a stout 50-year-old Ming-dynasty second-rank official, round face, double chin, short beard, dark red round-collar robe, black winged hat, jade belt, flat paper puppet, front side and back views, jointed limbs",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    parts: CHARACTER_SPECS.zhao.parts,
    priority: 1,
  },
  {
    id: "char.yipin",
    category: "character",
    name: "一品大员纸偶",
    covers: ["char.yipin"],
    description:
      "三视图 + 分件：紫黑金边官袍、高顶官帽、细长八字胡。",
    promptSubject:
      "character turnaround sheet of a tall cold 60-year-old Ming-dynasty first-rank official, high cheekbones, thin mustache, purple-black gold-trimmed round-collar robe, tall winged hat, jade belt, flat paper puppet, front side and back views, jointed limbs",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    parts: CHARACTER_SPECS.yipin.parts,
    priority: 1,
  },
  {
    id: "char.official.guest",
    category: "character",
    name: "便服官员",
    covers: ["char.official.guest"],
    description:
      "两位便服官员纸偶，靛青与赭石两色，供内堂与质问戏复用。",
    promptSubject:
      "character sheet of two middle-aged Ming-dynasty officials in plain round-collar robes, muted indigo and ochre, slightly paunchy and relaxed, flat paper puppets, front and three-quarter views, jointed limbs",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    parts: CHARACTER_SPECS["official.guest"].parts,
    priority: 2,
  },
  {
    id: "char.attendant",
    category: "character",
    name: "随从",
    covers: ["char.attendant"],
    description: "灰短袍随从，负责递外袍、牵马、站班。",
    promptSubject:
      "character sheet of a Ming-dynasty Chinese servant attendant in a short gray robe, carrying a bundle, flat paper puppet, front and side views",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    priority: 3,
  },
  {
    id: "char.guard",
    category: "character",
    name: "差役",
    covers: ["char.guard"],
    description: "深色公门差役，持木杖，用于押送刀疤脸。",
    promptSubject:
      "character sheet of a Ming-dynasty Chinese court guard in a dark uniform with a wooden staff, flat paper puppet, front and side views",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    priority: 3,
  },
  {
    id: "char.child",
    category: "character",
    name: "小童",
    covers: ["char.child"],
    description: "短袍小童，搬凳盯马，增加绝食戏的生活感。",
    promptSubject:
      "character sheet of a small Ming-dynasty Chinese servant boy in a plain short robe, flat paper puppet, front and side views",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    priority: 3,
  },
  {
    id: "char.crowd",
    category: "character",
    name: "街市宾客剪影组",
    covers: ["char.crowd"],
    description:
      "文人、商人、仆役、轿夫等剪影组，供街景与内堂背景人流。",
    promptSubject:
      "set of Ming-dynasty Chinese street crowd silhouettes, scholars, merchants, servants and sedan chair bearers, flat paper cutouts in muted indigo and ochre, isolated on chroma green",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "chroma-key",
    anchor: "feet",
    priority: 2,
  },
  {
    id: "char.horse.lame",
    category: "character",
    name: "赛赤兔纸偶",
    covers: ["char.horse.lame"],
    description:
      "老瘦白马三视图 + 分件：可见肋骨、稀疏鬃毛、瘸右前腿、旧鞍、铜铃。",
    promptSubject:
      "character turnaround sheet of an old bony white horse with visible ribs, sparse mane, a lame right front leg and a small brass bell on a worn strap, flat paper puppet with jointed legs, side front and three-quarter views, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    parts: CHARACTER_SPECS["horse.lame"].parts,
    priority: 1,
  },
  {
    id: "char.horse.crowd",
    category: "character",
    name: "众马纸偶",
    covers: ["char.horse.crowd"],
    description: "棕、黑、枣红三匹普通马，供马槽群像与低头畏惧。",
    promptSubject:
      "set of three well-fed Ming-dynasty stable horses in brown, black and bay, flat paper puppets, side views, jointed legs, isolated on chroma green",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    parts: CHARACTER_SPECS["horse.crowd"].parts,
    priority: 1,
  },
  {
    id: "char.horse.thin",
    category: "character",
    name: "消瘦马",
    covers: ["char.horse.thin"],
    description: "肋骨外露、垂头的瘦马，供夜景与官员质问。",
    promptSubject:
      "side view of an emaciated Chinese horse, visible ribs, drooping head, flat paper puppet, muted colors, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    priority: 2,
  },
  {
    id: "char.horse.war",
    category: "character",
    name: "战马",
    covers: ["char.horse.war"],
    description: "红鞍黑甲的战马，供皮影闪回中的将军坐骑。",
    promptSubject:
      "side view of a magnificent ancient Chinese warhorse with a red saddle and dark armor, flat paper puppet, dynamic galloping pose, isolated on chroma green",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    priority: 2,
  },
  {
    id: "char.horse.war.wounded",
    category: "character",
    name: "受伤战马",
    covers: ["char.horse.war.wounded"],
    description:
      "倒在泥中的战马，前腿夹地钩刀，无血，供宫门闪回。",
    promptSubject:
      "side view of a wounded ancient Chinese warhorse lying in mud, a hooked blade caught in its front leg, no blood, flat paper puppet, muted colors, isolated on chroma green",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    priority: 2,
  },
  {
    id: "char.horse.zhao",
    category: "character",
    name: "赵大人的马",
    covers: ["char.horse.zhao"],
    description: "体面棕马与精细鞍具，供赵大人牵马离场。",
    promptSubject:
      "side view of a well-groomed brown official's horse with a fine saddle, flat paper puppet, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    priority: 3,
  },
  {
    id: "char.general.young",
    category: "character",
    name: "年轻将军",
    covers: ["char.general.young"],
    description: "红黑铠甲、披风、长枪，只用于皮影闪回。",
    promptSubject:
      "character sheet of a young Ming-dynasty general in red and black worn armor, tied hair, flowing cape and spear, flat paper puppet, front and side views, isolated on chroma green, heroic but not overly handsome",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    parts: CHARACTER_SPECS["general.young"].parts,
    priority: 1,
  },
  {
    id: "char.general.one-arm",
    category: "character",
    name: "独臂将军",
    covers: ["char.general.one-arm"],
    description: "多年后的将军，空袖、旧甲、跪姿，供宫门雨夜。",
    promptSubject:
      "character sheet of a weathered 45-year-old one-armed Ming-dynasty general, gaunt face, empty right sleeve, worn armor and torn cape, kneeling pose, flat paper puppet, front and side views, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "joint-pivots",
    priority: 1,
  },

  /* ---------------- 道具 17 项 ---------------- */
  {
    id: "prop.trough",
    category: "prop",
    name: "长马槽结构",
    covers: ["prop.trough"],
    description:
      "木槽侧视与俯视，含隔板与槽沿，供代码拼装成几十格长槽。",
    promptSubject:
      "long wooden horse trough divided into small compartments, side and top views, flat paper prop, warm ochre wood, isolated on chroma green",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "chroma-key",
    anchor: "trough-center",
    priority: 1,
  },
  {
    id: "prop.trough.map",
    category: "prop",
    name: "马槽俯视示意",
    covers: ["prop.trough.map"],
    description:
      "干净俯视线稿，编号、箭头、品级字由代码叠加。",
    promptSubject:
      "top-down diagram of a long horse trough with empty compartments, flat paper cutout, clean shapes, isolated on chroma green",
    promptExtra: "Leave all labels and numbers blank for code typography.",
    imageSize: "landscape_16_9",
    source: "ai+code",
    cutout: "alpha",
    priority: 2,
  },
  {
    id: "prop.rank.plaques",
    category: "prop",
    name: "官阶木牌",
    covers: ["prop.rank.cards", "prop.rank.plaques"],
    description:
      "大小两种空白木牌，文字与品级数字由代码写上去。",
    promptSubject:
      "set of blank wooden rank plaques and small trough labels, different sizes, flat paper props, isolated on chroma green",
    promptExtra: "All plaques must be blank, no carved characters.",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "center",
    priority: 2,
  },
  {
    id: "prop.hay",
    category: "prop",
    name: "草料三档",
    covers: ["prop.hay", "prop.hay.premium", "prop.hay.fresh", "prop.hay.dry"],
    description:
      "三堆草料并排：嫩草拌细粮、普通青草、发黄枯草。",
    promptSubject:
      "three separate piles of horse feed: fresh green grass mixed with grain, plain green grass, dry yellow hay, flat paper props, isolated on chroma magenta",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "chroma-key",
    anchor: "pile-base",
    priority: 1,
  },
  {
    id: "prop.stick",
    category: "prop",
    name: "敲槽木棍",
    covers: ["prop.stick"],
    description: "店小二敲槽用的细木棍，带使用磨损。",
    promptSubject:
      "simple worn wooden stick for tapping a trough, flat paper prop, side view, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "grip",
    priority: 3,
  },
  {
    id: "prop.post",
    category: "prop",
    name: "木桩双态",
    covers: ["prop.post", "prop.post.worn"],
    description:
      "完好与磨损两态：后者带绳痕与缺口，供解扣揭示。",
    promptSubject:
      "wooden hitching post in two states, intact and worn with rope marks and a chipped surface, flat paper prop, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "base",
    priority: 1,
  },
  {
    id: "prop.reins",
    category: "prop",
    name: "缰绳双态",
    covers: ["prop.reins", "prop.reins.worn"],
    description:
      "完好与磨损两态：后者带毛边和死扣，供“用嘴解扣”特写。",
    promptSubject:
      "leather horse reins in two states, intact and frayed with a tight knot, flat paper prop, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "knot",
    priority: 1,
  },
  {
    id: "prop.rope.thick",
    category: "prop",
    name: "粗绳",
    covers: ["prop.rope.thick"],
    description: "加绑用的粗麻绳，可盘绕、绷紧、打死扣。",
    promptSubject:
      "thick hemp rope coil, flat paper prop, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "rope-end",
    priority: 2,
  },
  {
    id: "prop.bell",
    category: "prop",
    name: "马铃",
    covers: ["prop.bell"],
    description: "铜铃与皮绳，铃铛是瘸马出场与结尾的声音符号。",
    promptSubject:
      "small brass horse bell on a leather strap, flat paper prop, isolated on chroma green",
    imageSize: "square",
    source: "ai",
    cutout: "chroma-key",
    anchor: "strap-top",
    priority: 2,
  },
  {
    id: "prop.facade.decor",
    category: "prop",
    name: "灯笼幌子门帘",
    covers: ["prop.lantern", "prop.signboard", "prop.door.curtain"],
    description:
      "红灯笼、空白布幌、花纹门帘，幌子文字由代码叠加。",
    promptSubject:
      "set of restaurant facade decorations: red paper lantern, blank cloth banner and patterned door curtain, flat paper props, isolated on chroma green",
    promptExtra: "The banner must be blank, no text.",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "hanging-point",
    priority: 2,
  },
  {
    id: "prop.table.set",
    category: "prop",
    name: "桌上一套",
    covers: ["prop.dishes", "prop.peanuts", "prop.wine", "prop.table"],
    description:
      "俯视一套：豆瓣鱼、龙脆骨、驴打滚、花生米、酒壶酒盅、方桌。",
    promptSubject:
      "set of restaurant table props: plate of braised fish, plate of crispy bone, plate of rolled pastries, dish of peanuts, wine pot and cup, worn square table, flat paper props, top-down view, isolated on chroma green",
    imageSize: "square",
    source: "ai",
    cutout: "chroma-key",
    anchor: "table-center",
    priority: 1,
  },
  {
    id: "prop.cloth",
    category: "prop",
    name: "抹布",
    covers: ["prop.cloth"],
    description: "揉皱的抹布，供店小二擦桌发泄。",
    promptSubject:
      "crumpled cleaning cloth, flat paper prop, isolated on chroma green",
    imageSize: "square",
    source: "ai",
    cutout: "chroma-key",
    anchor: "center",
    priority: 3,
  },
  {
    id: "prop.sword",
    category: "prop",
    name: "长剑",
    covers: ["prop.sword"],
    description: "银白纸剑身、深色剑鞘，供公堂断臂。",
    promptSubject:
      "ancient Chinese straight sword, silver paper blade and dark scabbard, flat paper prop, side view, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "grip",
    priority: 1,
  },
  {
    id: "prop.arm.wood",
    category: "prop",
    name: "木假肢",
    covers: ["prop.arm.wood"],
    description:
      "带榫头与木纹的右臂假肢，无血，供全片最大反转。",
    promptSubject:
      "wooden prosthetic right arm with a mortise joint and visible wood grain, no blood, flat paper prop, side view, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "shoulder-joint",
    priority: 1,
  },
  {
    id: "prop.weapons",
    category: "prop",
    name: "长枪与地钩刀",
    covers: ["prop.spear", "prop.hook-blade"],
    description: "将军的长枪与伤马的地钩刀，两件一组。",
    promptSubject:
      "ancient Chinese spear and a hooked blade weapon, flat paper props, side views, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "grip",
    priority: 2,
  },
  {
    id: "prop.umbrella",
    category: "prop",
    name: "仪仗伞盖",
    covers: ["prop.umbrella"],
    description: "一品大员仪仗的暗红金边伞盖。",
    promptSubject:
      "traditional Chinese official ceremonial umbrella canopy, dark red and muted gold, flat paper prop, isolated on chroma green",
    imageSize: "square",
    source: "ai",
    cutout: "chroma-key",
    anchor: "pole-top",
    priority: 3,
  },
  {
    id: "prop.saddle",
    category: "prop",
    name: "马鞍",
    covers: ["prop.saddle"],
    description: "磨损皮鞍，供官员摸马、鞍具松动的细节。",
    promptSubject:
      "worn leather horse saddle, flat paper prop, side view, isolated on chroma green",
    imageSize: "landscape_4_3",
    source: "ai",
    cutout: "chroma-key",
    anchor: "saddle-center",
    priority: 3,
  },

  /* ---------------- 特效 10 项 ---------------- */
  {
    id: "fx.torn-open",
    category: "fx",
    name: "撕纸开场",
    covers: ["fx.torn-open"],
    description:
      "宣纸从中间撕开的边缘，纸屑与纤维由代码加粒子。",
    promptSubject:
      "torn rice paper opening effect, ragged fibers, blank center, flat paper overlay, isolated on chroma green",
    imageSize: "landscape_16_9",
    source: "ai+code",
    cutout: "alpha",
    anchor: "center",
    priority: 1,
  },
  {
    id: "fx.arrow",
    category: "fx",
    name: "纸片箭头",
    covers: ["fx.arrow"],
    description: "朱红与金色纸箭头、方向标记，纯 SVG。",
    imageSize: "svg",
    source: "code",
    cutout: "svg",
    anchor: "tail",
    priority: 3,
  },
  {
    id: "fx.gold-sun",
    category: "fx",
    name: "金纸太阳",
    covers: ["fx.gold-sun"],
    description: "带毛边的金纸圆片，供“东边为贵”的鸟瞰图。",
    promptSubject:
      "round muted gold paper sun with torn edges, subtle paper texture, flat overlay, isolated on chroma green",
    imageSize: "square",
    source: "ai",
    cutout: "chroma-key",
    anchor: "center",
    priority: 2,
  },
  {
    id: "fx.thought",
    category: "fx",
    name: "纸片气泡",
    covers: ["fx.thought"],
    description: "思考气泡与视线小纸片，纯 SVG。",
    imageSize: "svg",
    source: "code",
    cutout: "svg",
    anchor: "bubble-tail",
    priority: 3,
  },
  {
    id: "fx.day-flip",
    category: "fx",
    name: "日影翻页",
    covers: ["fx.day-flip"],
    description: "一叠日历纸翻页，AI 纸材质 + 代码翻页。",
    promptSubject:
      "stack of blank paper calendar pages with a simple sun motif, flipping sequence, flat paper prop, isolated on chroma green",
    promptExtra: "No numbers or text on the pages.",
    imageSize: "landscape_4_3",
    source: "ai+code",
    cutout: "chroma-key",
    anchor: "page-corner",
    priority: 3,
  },
  {
    id: "fx.speech-bubble",
    category: "fx",
    name: "台词气泡",
    covers: ["fx.speech-bubble"],
    description: "空白纸片对话气泡，文字由代码排版。",
    imageSize: "svg",
    source: "code",
    cutout: "svg",
    anchor: "bubble-tail",
    priority: 3,
  },
  {
    id: "fx.slash",
    category: "fx",
    name: "剑光影子",
    covers: ["fx.slash"],
    description:
      "一道白纸剑光与纸墙上的断影，不表现伤口，供第五幕断臂。",
    promptSubject:
      "dramatic sword-slash light effect made of a single white paper strip, shadow on a paper wall, no blood, flat overlay, isolated on chroma green",
    imageSize: "landscape_16_9",
    source: "ai+code",
    cutout: "alpha",
    anchor: "slash-center",
    priority: 1,
  },
  {
    id: "fx.horse-king.gold",
    category: "fx",
    name: "马王金剪影",
    covers: ["fx.horse-king.gold"],
    description:
      "半透明金色马王剪影，供结尾回忆浮现。",
    promptSubject:
      "translucent golden paper silhouette of a magnificent galloping warhorse, ornate mane, glowing torn edges, flat overlay, isolated on chroma green",
    imageSize: "landscape_16_9",
    source: "ai",
    cutout: "alpha",
    anchor: "hoof-line",
    priority: 1,
  },
  {
    id: "fx.paper-close",
    category: "fx",
    name: "合纸转场",
    covers: ["fx.paper-close"],
    description: "两张宣纸从左右合拢，纸边由代码控制。",
    promptSubject:
      "two large sheets of rice paper closing from left and right, torn edges, blank center, flat overlay, isolated on chroma green",
    imageSize: "landscape_16_9",
    source: "ai+code",
    cutout: "alpha",
    anchor: "center",
    priority: 2,
  },
  {
    id: "fx.atmosphere",
    category: "fx",
    name: "夜景与纹理氛围",
    covers: ["fx.wood-grain", "fx.burn-edge", "fx.lamp", "fx.moon"],
    description:
      "木纹、烧纸边、油灯光、纸月四件一组，供夜景与闪回叠加。",
    promptSubject:
      "atmosphere texture sheet with four separate elements: warm wood grain, burnt paper edge, oil lamp glow and a paper moon, flat paper textures on chroma green",
    imageSize: "square",
    source: "ai",
    cutout: "chroma-key",
    anchor: "element-center",
    priority: 2,
  },

  /* ---------------- 标题 2 项 ---------------- */
  {
    id: "title.tiaocaoma",
    category: "title",
    name: "片头标题",
    covers: ["title.tiaocaoma"],
    description:
      "朱红剪纸“跳槽马”三字与副标题，纯 SVG，纸张纹理用 CSS 叠加。",
    imageSize: "svg",
    source: "code",
    cutout: "svg",
    anchor: "center",
    priority: 1,
  },
  {
    id: "title.credits",
    category: "title",
    name: "片尾出处",
    covers: ["title.credits"],
    description:
      "片尾小字：原作、出处、改编说明，纯 SVG 排版。",
    imageSize: "svg",
    source: "code",
    cutout: "svg",
    anchor: "center",
    priority: 3,
  },
];

const defineAssets = (seeds: AssetSeed[]): AssetSpec[] =>
  seeds.map((seed) => ({
    ...seed,
    prompt: seed.promptSubject
      ? buildAssetPrompt(seed.promptSubject, seed.promptExtra)
      : "",
    usedBy: SHOTS.filter((shot) =>
      shot.assets.some((key) => seed.covers.includes(key)),
    ).map((shot) => shot.id),
    status: "planned",
  }));

export const ASSETS: AssetSpec[] = defineAssets(ASSET_SEEDS);

const SCRIPT_KEYS = [...new Set(SHOTS.flatMap((shot) => shot.assets))];
const COVERED_KEYS = ASSETS.flatMap((asset) => asset.covers);

const missingKeys = SCRIPT_KEYS.filter((key) => !COVERED_KEYS.includes(key));
if (missingKeys.length > 0) {
  throw new Error(`Missing asset coverage: ${missingKeys.join(", ")}`);
}

const duplicateKeys = COVERED_KEYS.filter(
  (key, index) => COVERED_KEYS.indexOf(key) !== index,
);
if (duplicateKeys.length > 0) {
  throw new Error(`Duplicate asset coverage: ${duplicateKeys.join(", ")}`);
}

export const ASSET_STATS = {
  total: ASSETS.length,
  coveredScriptKeys: COVERED_KEYS.length,
  ai: ASSETS.filter((asset) => asset.source === "ai").length,
  hybrid: ASSETS.filter((asset) => asset.source === "ai+code").length,
  code: ASSETS.filter((asset) => asset.source === "code").length,
  byCategory: {
    background: ASSETS.filter((asset) => asset.category === "background").length,
    character: ASSETS.filter((asset) => asset.category === "character").length,
    prop: ASSETS.filter((asset) => asset.category === "prop").length,
    fx: ASSETS.filter((asset) => asset.category === "fx").length,
    title: ASSETS.filter((asset) => asset.category === "title").length,
  },
} as const;

export const getAssetsForShot = (shotId: string): AssetSpec[] =>
  ASSETS.filter((asset) => asset.usedBy.includes(shotId));
