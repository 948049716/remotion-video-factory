/**
 * 跳槽马 — 逐镜脚本（阶段 1）
 *
 * 规格：1920×1080 / 24fps / 9:00 / 五幕 51 镜
 * 风格：剪纸纸偶 + AI 纸艺素材 + 代码分层合成
 * 动画：on twos（每 2 帧换一次姿态，12 张/秒），不做平滑补间
 * 旁白：约 1500 字，评书口吻；留出动作、停顿与音乐空间
 *
 * 资产键命名：
 *   bg.*    背景
 *   char.*  角色纸偶
 *   prop.*  道具
 *   fx.*    特效 / 纹理
 *   title.* 标题与片尾
 *
 * 字幕：由 narration 与 dialogue 自动切分，每行不超过 18 字；
 *       旁白音频录制后按字对齐，再回填逐字时间。
 */

export const FPS = 24;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** 纸艺色板：宣纸底、墨黑、朱红、靛青、赭石、金。 */
export const PALETTE = {
  paper: "#E8DCC3",
  ink: "#1C1A17",
  vermilion: "#B83A2E",
  indigo: "#2E4A5A",
  ochre: "#9A6B3F",
  gold: "#C9A227",
} as const;

export type ActId = "rules" | "exception" | "contest" | "hunger" | "truth";

export type TransitionIn =
  | "paper-open"
  | "paper-close"
  | "torn-wipe"
  | "paper-flip"
  | "silhouette"
  | "flash-white"
  | "cut";

export interface DialogueLine {
  speaker: string;
  line: string;
}

export interface Act {
  id: ActId;
  title: string;
  summary: string;
  startFrame: number;
  durationInFrames: number;
}

export interface Shot {
  id: string;
  act: ActId;
  index: number;
  startFrame: number;
  endFrame: number;
  durationInFrames: number;
  location: string;
  framing: string;
  visual: string;
  motion: string;
  narration: string;
  dialogue: DialogueLine[];
  sfx: string[];
  assets: string[];
  transitionIn: TransitionIn;
}

type ShotSpec = Omit<
  Shot,
  "id" | "act" | "index" | "startFrame" | "endFrame"
>;

export const ACTS: Act[] = [
  {
    id: "rules",
    title: "第一幕 · 规矩",
    summary:
      "饭馆开张，生意火爆。店小二按官阶定下东贵西贱、草分三等的规矩。",
    startFrame: 0,
    durationInFrames: 2760,
  },
  {
    id: "exception",
    title: "第二幕 · 破例",
    summary:
      "刀疤脸骑瘸马出现，店小二轻慢待之。瘸马第一次闯进东槽，赵大人不满。",
    startFrame: 2760,
    durationInFrames: 2640,
  },
  {
    id: "contest",
    title: "第三幕 · 较劲",
    summary:
      "刀疤脸只点花生米，店小二死扣拴马。瘸马解扣再闯东槽，一品大员发难。",
    startFrame: 5400,
    durationInFrames: 2520,
  },
  {
    id: "hunger",
    title: "第四幕 · 绝食",
    summary:
      "加粗绳后瘸马绝食，众马畏惧不敢进食，马匹消瘦，事情败露。",
    startFrame: 7920,
    durationInFrames: 2280,
  },
  {
    id: "truth",
    title: "第五幕 · 真相",
    summary:
      "公堂断臂，木假肢揭露常胜将军身世。马王威风犹在，人不如马。",
    startFrame: 10200,
    durationInFrames: 2760,
  },
];

const ACT_START = Object.fromEntries(
  ACTS.map((act) => [act.id, act.startFrame]),
) as Record<ActId, number>;

const buildShots = (act: ActId, specs: ShotSpec[]): Shot[] => {
  let cursor = ACT_START[act];

  return specs.map((spec, index) => {
    const startFrame = cursor;
    const endFrame = startFrame + spec.durationInFrames;
    cursor = endFrame;

    return {
      ...spec,
      id: `${act}-${String(index + 1).padStart(2, "0")}`,
      act,
      index: index + 1,
      startFrame,
      endFrame,
    };
  });
};

/* ------------------------------------------------------------------ */
/* 第一幕 · 规矩（0:00–1:55 / 2760 帧）                                */
/* ------------------------------------------------------------------ */

const RULES_SHOTS = buildShots("rules", [
  {
    durationInFrames: 144,
    location: "片头 · 黑场",
    framing: "标题卡",
    visual:
      "黑场。一张宣纸从画面中央向两侧撕开，纸屑飞散，露出朱红剪纸标题“跳槽马”。标题下方压一行小字：“根据《故事会》同名故事改编”。",
    motion: "标题纸片逐帧弹入，纸边每 2 帧换一次毛边形状。",
    narration: "话说京城城西，新开了一家饭馆。",
    dialogue: [],
    sfx: ["撕纸", "纸屑落地"],
    assets: ["fx.torn-open", "title.tiaocaoma"],
    transitionIn: "paper-open",
  },
  {
    durationInFrames: 288,
    location: "京城西街 · 饭馆外",
    framing: "大全景",
    visual:
      "城西街口。饭馆门脸由三层纸片叠成：屋檐、红灯笼、布幌子。门前轿马排开，纸片宾客来来往往，热气从门里冒出来。",
    motion: "背景横移，前后纸层做视差；灯笼每 3 帧摆一次，幅度很小。",
    narration:
      "开张才一个月，生意就火得不得了。豆瓣鱼、龙脆骨、驴打滚，一道道民间家常菜，把京城的达官显贵都引来了。",
    dialogue: [],
    sfx: ["街市嘈杂", "店小二招呼", "灯笼轻响"],
    assets: [
      "bg.street.west",
      "bg.restaurant.facade",
      "char.crowd",
      "prop.lantern",
      "prop.signboard",
    ],
    transitionIn: "torn-wipe",
  },
  {
    durationInFrames: 264,
    location: "饭馆内堂",
    framing: "中景",
    visual:
      "内堂一张张方桌，桌上三盘菜用叠纸表现：豆瓣鱼、龙脆骨、驴打滚。几位换了便服的官员围坐，筷子起落，说话时刻意压低声音。",
    motion: "筷子每 2 帧夹一次，人物只用 3 个循环姿态，保持纸偶顿挫感。",
    narration:
      "这些有身份的人，怕出入小馆子有失体面，常常轻车简从，有的只带一个随从，悄悄来吃。",
    dialogue: [],
    sfx: ["杯盏碰撞", "筷子落碟", "低声交谈"],
    assets: [
      "bg.restaurant.interior",
      "prop.dishes",
      "char.official.guest",
    ],
    transitionIn: "paper-flip",
  },
  {
    durationInFrames: 264,
    location: "后院马棚",
    framing: "全景",
    visual:
      "后院马棚，木柱与草棚是深赭色剪纸。马匹一字排开，店小二抱着一捆草料从马屁股后面穿过去，往槽里添草。",
    motion: "店小二走 4 帧循环；马头偶尔甩一下，每 12 帧一次。",
    narration:
      "他们的坐骑，就拴在后院马棚里，由店小二加草添料。别看是畜生，待遇一点不比人差。",
    dialogue: [],
    sfx: ["马嘶", "草料摩擦", "木棚轻响"],
    assets: ["bg.stable", "char.er", "char.horse.crowd", "prop.hay"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 240,
    location: "马槽 · 规则示意",
    framing: "俯拍横移",
    visual:
      "俯拍长马槽示意。纸片箭头从西向东推进，东端压一枚金纸“贵”字。一品到五品的官阶木牌依次翻面，排成一条斜线。",
    motion: "箭头逐格推进，每格 4 帧；木牌依次翻面，每张停 6 帧。",
    narration:
      "马匹一多，怎么排顺序、怎么添草料，就大有学问了。店小二鬼精着呢，您猜怎么着？",
    dialogue: [],
    sfx: ["纸张翻动", "木牌落桌"],
    assets: ["prop.trough.map", "prop.rank.cards", "fx.arrow"],
    transitionIn: "paper-flip",
  },
  {
    durationInFrames: 336,
    location: "京城西街 · 鸟瞰",
    framing: "鸟瞰",
    visual:
      "饭馆与街道的鸟瞰剪纸图。东边升起一轮金纸太阳，马匹队列整体向东倾斜。画面右侧叠一个小构图：官帽越大，马位越靠东。",
    motion: "太阳纸片分 6 段升起；马队每 8 帧向东挪一格。",
    narration:
      "饭馆在城西，食客用完饭大多骑马向东，因此东边为贵。官越大，马排得越靠东，出行越方便。这讲究，比朝堂还清楚。",
    dialogue: [],
    sfx: ["马蹄远去", "纸片滑移"],
    assets: ["bg.map.west-east", "prop.rank.cards", "fx.gold-sun"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 312,
    location: "马槽 · 草料三等",
    framing: "三联画特写",
    visual:
      "三联画。左格是刚割来的嫩草拌细粮，绿纸间夹米白纸屑；中格是普通青草；右格是发黄的枯草。每格上方压一块品级木牌：一品、三品、五品。",
    motion: "三格依次亮起，每格 8 帧；木牌压下时带 2 帧回弹。",
    narration:
      "草料也分三等：一品二品，吃刚割来的嫩草细粮；三品到五品，只有青草；五品以下，寻常枯草。半点乱不得。",
    dialogue: [],
    sfx: ["草料落槽", "木牌压下"],
    assets: [
      "prop.hay.premium",
      "prop.hay.fresh",
      "prop.hay.dry",
      "prop.rank.plaques",
    ],
    transitionIn: "paper-flip",
  },
  {
    durationInFrames: 264,
    location: "马槽 · 全景",
    framing: "横移长镜",
    visual:
      "一条长长的木马槽横贯画面，被隔成几十个小槽，每槽一匹马。槽沿上钉着品级小木牌。镜头从左向右缓慢横移。",
    motion: "镜头横移，马匹逐格进入画面；纸层前后错开，形成浅景深。",
    narration:
      "店小二还打造了一条长长的马槽，隔成几十个小槽，一马一格，互不干涉。槽沿上钉着品级木牌。",
    dialogue: [],
    sfx: ["木槽轻响", "马蹄挪动"],
    assets: ["bg.trough.long", "char.horse.crowd", "prop.trough"],
    transitionIn: "torn-wipe",
  },
  {
    durationInFrames: 336,
    location: "马槽 · 争食",
    framing: "近景",
    visual:
      "三四只马嘴挤进同一个槽，槽沿被顶得翘起一张纸片。店小二举着木棍冲过来，棍子敲在槽沿上，纸屑震起。",
    motion: "马嘴每 2 帧伸一次；木棍每 2 帧敲一下，敲击时整个纸舞台抖 1px。",
    narration:
      "可马哪懂人间的论资排辈？这一槽草，吃得跟打仗一样。",
    dialogue: [
      {
        speaker: "店小二",
        line: "哎哎，三品马，怎么把嘴伸到二品槽里了？五品马，放着青草不吃，干吗吃枯草？",
      },
    ],
    sfx: ["木棍敲槽", "马嚼", "纸片颤动"],
    assets: [
      "char.er",
      "char.horse.crowd",
      "prop.stick",
      "prop.trough",
    ],
    transitionIn: "cut",
  },
  {
    durationInFrames: 312,
    location: "马槽 · 秩序恢复",
    framing: "全景",
    visual:
      "众马各归其槽，低头吃草。店小二叉腰站在槽边。画面一角，两位官员隔着窗纸会心一笑。",
    motion: "马头按同一节奏起落，4 帧一个循环；店小二保持得意姿态。",
    narration:
      "日子一长，马匹都被训练得规规矩矩，各吃各槽，少有越礼。达官显贵看在眼里，会心一笑。这碗饭算是端稳了。",
    dialogue: [],
    sfx: ["咀嚼", "轻笑"],
    assets: [
      "char.horse.crowd",
      "char.er",
      "char.official.guest",
      "bg.window.paper",
    ],
    transitionIn: "paper-flip",
  },
]);

/* ------------------------------------------------------------------ */
/* 第二幕 · 破例（1:55–3:40 / 2640 帧）                                */
/* ------------------------------------------------------------------ */

const EXCEPTION_SHOTS = buildShots("exception", [
  {
    durationInFrames: 312,
    location: "饭馆外 · 街口",
    framing: "中景",
    visual:
      "刀疤脸骑着一匹瘸腿白马入画。人和马都是逆光剪影，脸上那道刀疤用一条白纸留出来。马脖子上的铃铛来回晃，马身一歪一歪。",
    motion: "人马整体 4 帧一个循环；铃铛每 2 帧摆一次，幅度夸张。",
    narration:
      "这天，一个刀疤脸中年人，骑着一匹瘸腿白马来了。黑脸上一道长刀疤。马脖子挂着铃铛，一走一歪，叮当乱响。",
    dialogue: [],
    sfx: ["铃铛乱响", "不齐的马蹄"],
    assets: ["char.scarface.riding", "char.horse.lame", "prop.bell"],
    transitionIn: "silhouette",
  },
  {
    durationInFrames: 216,
    location: "饭馆门口",
    framing: "近景",
    visual:
      "店小二近景。他眼睛左右一扫，嘴角往下一撇，手里算盘拨了一下。背景虚化成几块纸片色块。",
    motion: "眼神 3 帧一转，眉毛 2 帧一挑，算盘珠 2 帧一弹。",
    narration:
      "店小二搭眼一看：贩夫走卒，没什么背景。穿得寒酸，马也瘸。",
    dialogue: [],
    sfx: ["算盘一响"],
    assets: ["char.er", "fx.thought"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 192,
    location: "饭馆门口",
    framing: "中景",
    visual:
      "店小二强挤出一丝笑，笑脸是单独一片纸，往脸上一贴。他侧身掀帘，做了个请的手势。",
    motion: "笑脸纸片弹入，停 4 帧；门帘 3 帧一掀。",
    narration: "他脸上堆笑，心里却冷。",
    dialogue: [
      { speaker: "店小二", line: "客官里面请，我给马添些草料。" },
    ],
    sfx: ["门帘响", "假笑"],
    assets: ["char.er", "prop.door.curtain"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 264,
    location: "饭馆门口",
    framing: "手部特写",
    visual:
      "刀疤脸把缰绳递过去，手部特写。瘸马在背景里低头，铃铛轻轻响。",
    motion: "缰绳传递 3 帧；店小二肩膀憋笑抖 2 帧。",
    narration: "店小二接过缰绳，答应得痛快。",
    dialogue: [
      { speaker: "刀疤脸", line: "好好伺候，可别欺负它啊！" },
      { speaker: "店小二", line: "客官说笑了。" },
    ],
    sfx: ["缰绳摩擦", "憋笑", "铃铛"],
    assets: [
      "char.scarface",
      "char.er",
      "char.horse.lame",
      "prop.reins",
    ],
    transitionIn: "cut",
  },
  {
    durationInFrames: 264,
    location: "饭馆门口",
    framing: "中景",
    visual:
      "店小二油嘴滑舌，手指比划“两条腿”和“四条腿”。刀疤脸已经转身往店里走，瘸马在旁边抬了一下后腿。",
    motion: "手指 2 帧一点；马腿 3 帧一抬；店小二身体轻微前仰后合。",
    narration: "这话油滑，刀疤脸却没笑。",
    dialogue: [
      {
        speaker: "店小二",
        line: "我两条腿的，怎敢欺负四条腿的？它要发起怒来，踢我一脚，我怎么追得上？",
      },
    ],
    sfx: ["手指点空", "轻笑", "马腿刨地"],
    assets: ["char.er", "char.scarface", "char.horse.lame"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 240,
    location: "马槽 · 西端",
    framing: "全景",
    visual:
      "马槽最靠西的角落。店小二把瘸马拴在木桩上，随手丢下一把枯草，拍了拍手，转身进店。",
    motion: "草把落下 2 帧；店小二脚步 4 帧一循环，人马先后出画。",
    narration:
      "店小二把瘸马牵到最靠西的槽子，扔下一把枯草，就进店去了。那槽子又偏又冷。",
    dialogue: [],
    sfx: ["枯草落地", "脚步", "铃铛"],
    assets: [
      "bg.trough.west",
      "char.horse.lame",
      "prop.hay.dry",
      "char.er",
    ],
    transitionIn: "torn-wipe",
  },
  {
    durationInFrames: 216,
    location: "饭馆内堂",
    framing: "中景",
    visual:
      "赵大人放下酒杯，扶着桌沿起身，随从赶紧递上外袍。桌上杯盘狼藉。",
    motion: "起身拆成 4 个关键姿态，每 2 帧换一次；外袍 3 帧一披。",
    narration:
      "一个时辰过去，二品大员赵大人酒足饭饱，起身回府。这位赵大人，最讲排场。",
    dialogue: [],
    sfx: ["酒杯落桌", "衣袍摩擦", "椅子轻响"],
    assets: ["char.zhao", "char.attendant", "bg.restaurant.interior"],
    transitionIn: "paper-flip",
  },
  {
    durationInFrames: 240,
    location: "马槽 · 东端",
    framing: "推镜",
    visual:
      "赵大人走到马槽前，脚步停住。镜头顺着他的视线推向东端：瘸马埋头在大槽里，嘴里塞满嫩草，铃铛还在晃。",
    motion: "推镜用 3 段跳切，每段 8 帧，模拟剪纸定格推近。",
    narration:
      "店小二送到马槽前，眼睛直了：那匹瘸腿马，正凑在最靠东的槽子里，大嚼细粮嫩草！",
    dialogue: [],
    sfx: ["咀嚼", "铃铛轻响", "音乐骤停"],
    assets: [
      "char.zhao",
      "char.horse.lame",
      "bg.trough.east",
      "prop.hay.premium",
    ],
    transitionIn: "cut",
  },
  {
    durationInFrames: 240,
    location: "马槽 · 东端",
    framing: "近景",
    visual:
      "赵大人侧身，手指向东槽。他的脸色由白转红，靠换一张脸纸完成。",
    motion: "换脸纸 2 帧一张；手指 3 帧一抬。",
    narration: "话里带着刺。",
    dialogue: [
      {
        speaker: "赵大人",
        line: "不知这瘸马是哪位大人的宝驹？难道今日店里还有一品大员，我竟没瞧见？",
      },
    ],
    sfx: ["衣袖一甩", "冷声"],
    assets: ["char.zhao", "char.horse.lame"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 264,
    location: "马槽 · 东端",
    framing: "中景",
    visual:
      "店小二弯腰赔笑，双手乱摆。瘸马在背景里继续吃，完全不理会。",
    motion: "双手 2 帧一摆，腰 3 帧一弯；瘸马咀嚼循环。",
    narration: "店小二腰弯得像虾米。",
    dialogue: [
      {
        speaker: "店小二",
        line: "大人别误会，是小人疏忽，忘了拴好这倒霉马。它是个畜生，不懂人事，大人莫怪。",
      },
    ],
    sfx: ["赔笑", "马嚼"],
    assets: ["char.er", "char.zhao", "char.horse.lame"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 192,
    location: "马槽 · 东端",
    framing: "全景",
    visual:
      "赵大人拂袖，转身走向东边牵马。店小二立在原地擦汗，汗珠是几片白色纸点。",
    motion: "袖片 3 帧一甩；汗珠纸点 2 帧一落。",
    narration:
      "赵大人只说了句“下不为例”，拂袖而去。店小二擦了一把冷汗。",
    dialogue: [],
    sfx: ["脚步远去", "擦汗", "马铃"],
    assets: ["char.zhao", "char.er", "char.horse.zhao"],
    transitionIn: "cut",
  },
]);

/* ------------------------------------------------------------------ */
/* 第三幕 · 较劲（3:40–5:30 / 2520 帧）                                */
/* ------------------------------------------------------------------ */

const CONTEST_SHOTS = buildShots("contest", [
  {
    durationInFrames: 264,
    location: "饭馆外 · 重复蒙太奇",
    framing: "重复蒙太奇",
    visual:
      "三个纸片日影快速翻过，刀疤脸骑着瘸马一次次进画。店小二躲在门后，捂着嘴偷笑。",
    motion: "日影翻 3 次，每次 12 帧；人马 4 帧循环；每次进画位置略错开。",
    narration:
      "一连几天，刀疤脸总骑着瘸腿马来吃饭。店小二看他颠来颠去，心里直乐：这是图啥呢？真是花钱买罪受。",
    dialogue: [],
    sfx: ["铃铛", "马蹄", "翻纸"],
    assets: [
      "char.scarface.riding",
      "char.horse.lame",
      "char.er",
      "fx.day-flip",
    ],
    transitionIn: "paper-flip",
  },
  {
    durationInFrames: 264,
    location: "饭馆内堂 · 桌边",
    framing: "桌面特写",
    visual:
      "一碟花生米、一壶小酒。刀疤脸用筷子一颗一颗夹花生，碟边排出一小堆花生壳。他数得很认真。",
    motion: "筷子 2 帧一夹，花生纸片弹一下；酒液用一条青纸表示。",
    narration:
      "更气人的是，别人来总点几样招牌菜，他倒好，只点一碟花生米、一壶小酒，一颗一颗数着吃，惬意得很。",
    dialogue: [],
    sfx: ["花生落碟", "酒入杯", "筷子轻碰"],
    assets: ["char.scarface", "prop.peanuts", "prop.wine", "bg.table"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 168,
    location: "饭馆内堂 · 柜台",
    framing: "中景",
    visual:
      "店小二在柜台后擦桌子，越擦越用力，抹布下纸屑飞起。他斜眼盯着刀疤脸那一桌。",
    motion: "手 2 帧一来回，桌角纸屑 2 帧一跳；眼神固定斜视。",
    narration:
      "店小二看得直咬牙，擦桌子的手都重了三分。他越看越来气。",
    dialogue: [],
    sfx: ["抹布摩擦", "咬牙", "算盘轻响"],
    assets: ["char.er", "prop.cloth", "char.scarface"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 264,
    location: "后院 · 木桩",
    framing: "特写",
    visual:
      "木桩特写。店小二把缰绳绕三圈，系了个死扣，双手用力一拉。瘸马歪着头看他，一脸无所谓。",
    motion: "绕绳 3 帧一圈，共 3 圈；死扣特写停 4 帧；拉动时木桩抖 1px。",
    narration:
      "这天刀疤脸又来了。店小二把缰绳在木桩上系了个死扣：这回看你往哪跑！他使出了吃奶的劲。",
    dialogue: [],
    sfx: ["绳子勒紧", "木桩闷响", "马鼻息"],
    assets: [
      "prop.post",
      "prop.reins",
      "char.er",
      "char.horse.lame",
    ],
    transitionIn: "cut",
  },
  {
    durationInFrames: 168,
    location: "饭馆门口",
    framing: "全景",
    visual:
      "饭馆门口，一品大员的仪仗剪影：伞盖、随从、高头大马。店小二鞠躬到地，脑袋几乎碰到门槛。",
    motion: "伞盖纸片旋转 4 帧；随从两列推进，每列 3 帧一步。",
    narration:
      "不巧，今天店里来了一位一品大员。真正的大人物。",
    dialogue: [],
    sfx: ["锣声一响", "整齐脚步", "马铃"],
    assets: [
      "char.yipin",
      "char.attendant",
      "prop.umbrella",
      "bg.restaurant.facade",
    ],
    transitionIn: "silhouette",
  },
  {
    durationInFrames: 288,
    location: "马槽 · 东端",
    framing: "横扫推镜",
    visual:
      "一品大员走到后院，镜头跟随他的视线横扫马槽，最后停在东端：瘸马又在吃嫩草，铃铛轻晃。",
    motion: "横扫用 3 段跳切，最后一顿 6 帧；铃铛 2 帧一摆。",
    narration:
      "一品大员饭后到后院，脸色骤变：那匹瘸马，又蹭到最靠东的槽子，吃起了细粮嫩草！他简直不敢相信自己的眼睛。",
    dialogue: [],
    sfx: ["铃铛", "音乐重音", "倒吸气"],
    assets: ["char.yipin", "char.horse.lame", "bg.trough.east"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 264,
    location: "后院 · 木桩",
    framing: "近景",
    visual:
      "店小二跪在木桩前，手指摸过被蹭掉一层的木桩。缰绳上全是磨损的毛边，地上散着木屑纸片。",
    motion: "手指 2 帧一移；木屑纸片 3 帧一落；店小二身体逐渐发抖。",
    narration:
      "店小二跑到木桩前一看，娘啊，木桩被蹭掉一层，缰绳也有磨损——这破马会用嘴解扣！心都凉了半截。",
    dialogue: [],
    sfx: ["木头摩擦", "倒吸气", "木屑落地"],
    assets: ["prop.post.worn", "prop.reins.worn", "char.er"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 264,
    location: "马槽 · 东端",
    framing: "正面近景",
    visual:
      "一品大员正面近景，脸纸换成铁青色。身后随从齐齐低头，不敢出声。",
    motion: "脸纸 2 帧一换；镜头轻推 3 段；随从纸片整体下沉一档。",
    narration: "一品大员的脸，黑得能滴出水来。",
    dialogue: [
      {
        speaker: "一品大员",
        line: "怎么？难道当今圣上今日不在宫中用膳，跑来你这饭馆寻乐？",
      },
    ],
    sfx: ["冷风", "衣袍", "堂威低鸣"],
    assets: ["char.yipin", "char.attendant"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 312,
    location: "马槽 · 东端",
    framing: "全景",
    visual:
      "店小二扑通跪地，磕头如鸡啄米，额头一次次碰地。一品大员一甩袖子，转身出画。",
    motion: "磕头 2 帧一次，连续 4 次；袖子 3 帧一甩；地面纸屑震起。",
    narration:
      "店小二扑通跪倒，磕头如鸡啄米。一品大员一甩袖子，走了。店小二的魂都吓飞了。",
    dialogue: [
      {
        speaker: "一品大员",
        line: "下次再看到这破马扫本大人的兴……",
      },
    ],
    sfx: ["磕头", "甩袖", "脚步"],
    assets: ["char.er", "char.yipin"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 264,
    location: "饭馆内堂",
    framing: "中景",
    visual:
      "店小二拦住刀疤脸，抱拳作揖，几乎要哭出来。刀疤脸把酒盅往桌上一顿，身后是瘸马的剪影。",
    motion: "抱拳 3 帧一拱；酒盅 2 帧一顿；瘸马剪影轻微晃动。",
    narration: "",
    dialogue: [
      {
        speaker: "店小二",
        line: "客官，您那良驹太不安分，能不能别带它来？",
      },
      {
        speaker: "刀疤脸",
        line: "一派胡言！我与赛赤兔感情深厚，人在马在！",
      },
    ],
    sfx: ["酒盅顿桌", "马铃", "椅子挪动"],
    assets: [
      "char.er",
      "char.scarface",
      "char.horse.lame",
      "prop.wine",
    ],
    transitionIn: "cut",
  },
]);

/* ------------------------------------------------------------------ */
/* 第四幕 · 绝食（5:30–7:05 / 2280 帧）                                */
/* ------------------------------------------------------------------ */

const HUNGER_SHOTS = buildShots("hunger", [
  {
    durationInFrames: 264,
    location: "后院 · 马头特写",
    framing: "特写",
    visual:
      "马头特写。店小二在原来的缰绳上再加一根粗绳，绕颈一圈，再在木桩上打死扣。一个小童搬来小凳，坐在旁边死死盯着。",
    motion: "绕绳 3 帧一圈；小童坐下 4 帧；粗绳绷紧时抖 1px。",
    narration:
      "这回，店小二在马头上多加一根粗绳，桩上系死扣，还派小童死死盯着。看你还怎么解！这回是双保险。",
    dialogue: [],
    sfx: ["粗绳摩擦", "木凳落地", "小童脚步"],
    assets: [
      "prop.rope.thick",
      "prop.post",
      "char.child",
      "char.horse.lame",
    ],
    transitionIn: "torn-wipe",
  },
  {
    durationInFrames: 216,
    location: "马槽 · 西端",
    framing: "中景",
    visual:
      "瘸马梗着脖子，头抬得高高的，面前的枯草一口不动。粗绳被绷得笔直。",
    motion: "马头 3 帧一抬；绳子 2 帧一颤；枯草保持静止。",
    narration:
      "瘸马挣不脱，脾气却上来了，梗着脖子，半点草料不吃。它宁可饿着，也不低头。",
    dialogue: [],
    sfx: ["马鼻息", "绳子绷紧"],
    assets: ["char.horse.lame", "prop.hay.dry", "prop.rope.thick"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 240,
    location: "饭馆 · 后门",
    framing: "中景",
    visual:
      "店小二抱着胳膊，斜靠门框，嘴角上扬。他心里的话用纸片气泡浮出来，一个字一个字往外蹦。",
    motion: "气泡逐字弹出，每 2 帧一字；店小二脚尖打拍子，3 帧一颠。",
    narration:
      "店小二心里痛快：“不吃才好呢！你主人一碟花生米，还不够你吃草的钱！”小算盘打得噼啪响。",
    dialogue: [],
    sfx: ["算盘声", "哼小曲"],
    assets: ["char.er", "fx.speech-bubble"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 288,
    location: "马槽 · 全景",
    framing: "大全景",
    visual:
      "众马原本低头吃草，见瘸马绝食，纷纷退后半步，垂头立着，像在“候”着它。整个马棚安静下来。",
    motion: "马群 3 帧一退；集体定格 8 帧；只有瘸马的铃铛偶尔响。",
    narration:
      "可没美几天，怪事来了：那些达官显贵的马，见瘸马不进食，竟都立在一边乖乖候着，谁也不敢低头。这叫什么事儿？",
    dialogue: [],
    sfx: ["马群骚动后安静", "铃铛轻响"],
    assets: ["char.horse.crowd", "char.horse.lame", "bg.stable"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 288,
    location: "马槽 · 全景",
    framing: "中景",
    visual:
      "店小二在槽间来回跑，木棍敲得槽沿乱响，纸屑四溅。众马纹丝不动，只是往后退。",
    motion: "店小二左右跑 4 帧循环；木棍 2 帧一敲；马群每 6 帧退一小步。",
    narration:
      "店小二敲着槽沿：“吃啊！你们家主人多厉害，别让这破瘸马唬住了！”可众马还是胆战心惊，不敢动草。嗓子都喊哑了。",
    dialogue: [],
    sfx: ["急促敲槽", "马退", "纸屑落地"],
    assets: ["char.er", "prop.stick", "char.horse.crowd"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 240,
    location: "马厩 · 夜",
    framing: "夜景全景",
    visual:
      "夜景。马厩里的马匹肋骨用几道白纸线表现，身形明显消瘦。远处府邸窗口亮着灯，马在槽边猛吃。",
    motion: "月亮纸片缓慢移动；马身瘦纸替换 2 帧；灯火 3 帧一跳。",
    narration:
      "日子一长，马匹白天不敢吃，回府再猛补，一饿一撑，全都瘦了下去。马瘦毛长，瞒不住了。",
    dialogue: [],
    sfx: ["夜风", "远处马嚼", "更鼓"],
    assets: ["bg.stable.night", "char.horse.thin", "fx.moon"],
    transitionIn: "silhouette",
  },
  {
    durationInFrames: 216,
    location: "府邸马厩",
    framing: "中景",
    visual:
      "三位官员围着各自的马，摸马背、皱眉头。马背上的鞍具明显松了一圈。",
    motion: "手 2 帧一摸；眉头纸片下压；鞍具每 4 帧滑一格。",
    narration:
      "达官显贵察觉了，纷纷质问店小二：是不是照看马匹不周？一个个找上门来。",
    dialogue: [],
    sfx: ["马鞍晃动", "质问声", "衣袍摩擦"],
    assets: ["char.official.guest", "char.horse.thin", "prop.saddle"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 264,
    location: "饭馆后院",
    framing: "全景",
    visual:
      "店小二跪在众官员面前，手指向东槽的瘸马。官员们的脸一张张变白，像被换了一层面纸。",
    motion: "手指 3 帧一指；脸纸依次更换；店小二肩膀持续发抖。",
    narration:
      "店小二不敢再瞒，把那瘸腿马的事，一五一十全说了。赵大人和几位官员一听，勃然大怒。纸包不住火。",
    dialogue: [],
    sfx: ["倒吸气", "拍案", "纸片窸窣"],
    assets: [
      "char.er",
      "char.zhao",
      "char.official.guest",
      "char.horse.lame",
    ],
    transitionIn: "cut",
  },
  {
    durationInFrames: 264,
    location: "府邸厅堂 · 门口",
    framing: "全景",
    visual:
      "厅堂门口。两名差役押着刀疤脸进画，刀疤脸不慌不忙，脚步一点不乱。赵大人高坐堂上，脸色铁青。",
    motion: "差役 4 帧一推；刀疤脸步伐不变；堂上灯影 2 帧一晃。",
    narration: "堂鼓一响，众人到齐。他们把刀疤脸叫到跟前。",
    dialogue: [
      {
        speaker: "赵大人",
        line: "你好大的胆子，竟敢拿一匹瘸马吓唬本大人的坐骑！",
      },
    ],
    sfx: ["堂鼓一响", "脚步", "灯焰抖动"],
    assets: [
      "char.scarface",
      "char.zhao",
      "char.guard",
      "bg.hall",
    ],
    transitionIn: "cut",
  },
]);

/* ------------------------------------------------------------------ */
/* 第五幕 · 真相（7:05–9:00 / 2760 帧）                                */
/* ------------------------------------------------------------------ */

const TRUTH_SHOTS = buildShots("truth", [
  {
    durationInFrames: 312,
    location: "府邸厅堂",
    framing: "大全景",
    visual:
      "厅堂全景。官员分列两侧，刀疤脸独立堂中，空着一只右袖。赵大人拍案，案上的纸片茶杯跳了起来。",
    motion: "拍案 2 帧一顿；茶杯纸片弹起 4 帧；两侧官员微微后仰。",
    narration:
      "刀疤脸被带到堂前，赵大人拍案而起：“你好大的胆子，竟敢拿一匹瘸腿马来吓唬本大人的坐骑！你该当何罪？”堂上鸦雀无声。",
    dialogue: [],
    sfx: ["拍案", "茶杯跳", "堂威"],
    assets: [
      "bg.hall",
      "char.zhao",
      "char.scarface",
      "char.official.guest",
      "prop.table",
    ],
    transitionIn: "paper-open",
  },
  {
    durationInFrames: 192,
    location: "府邸厅堂",
    framing: "近景",
    visual:
      "刀疤脸近景，双手抱拳，神情自若。背景官员压成低矮的纸片剪影，只剩几双眼睛。",
    motion: "抱拳 3 帧；眼神不躲；背景剪影保持静止。",
    narration: "刀疤脸不慌不忙。",
    dialogue: [
      {
        speaker: "刀疤脸",
        line: "大人明鉴，在下只是骑马来吃饭。马不吃草，这有何罪？",
      },
    ],
    sfx: ["堂上安静", "衣袍轻响"],
    assets: ["char.scarface", "char.official.guest"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 216,
    location: "府邸厅堂",
    framing: "中景",
    visual:
      "赵大人拔剑，剑身是一道银白剪纸。剑光没有直接落在人身上，而是投在身后的纸墙上：两道拉长的影子一交，影子里的手臂先断。随后，一只空袖管从画外飘落。",
    motion:
      "剑光 1 帧一闪；墙上影子交错 2 帧；空袖落下 4 帧。断裂瞬间不切白场，改用纸墙上的黑影断开。",
    narration:
      "赵大人气得抽出长剑，挥向刀疤脸的右臂。刀疤脸抬手去挡——“喀嚓”一声！剑风一闪。",
    dialogue: [],
    sfx: ["拔剑", "破风", "纸幕撕裂"],
    assets: [
      "char.zhao",
      "char.scarface",
      "prop.sword",
      "fx.slash",
    ],
    transitionIn: "cut",
  },
  {
    durationInFrames: 240,
    location: "府邸厅堂 · 地面",
    framing: "特写",
    visual:
      "特写。空袖管落在地上，袖口里滚出一截木头手臂：断口是榫头，木纹一圈一圈，没有一滴血。堂上众人的纸片脸一齐僵住。",
    motion: "木臂滚 4 帧；停住后回弹 2 帧；木纹保持静态，不闪。",
    narration:
      "右臂应声而断，却不见半点鲜血。众人仔细一看：那竟是一条木头做的假肢！众人都愣住了。",
    dialogue: [],
    sfx: ["木头滚地", "全场静默"],
    assets: ["prop.arm.wood", "fx.wood-grain", "char.scarface"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 168,
    location: "府邸厅堂",
    framing: "中景",
    visual:
      "店小二瘫坐在地，手指着那截木臂，嘴唇直哆嗦。周围官员的脸像被线牵着，一张张转过来。",
    motion: "手指 2 帧一抖；官员脸纸同步转动；店小二身体 3 帧一缩。",
    narration: "店小二吓得结巴。",
    dialogue: [
      {
        speaker: "店小二",
        line: "没……没胳膊啊……断臂人骑瘸腿马，倒是般配。",
      },
    ],
    sfx: ["牙齿打颤", "纸片窸窣"],
    assets: ["char.er", "prop.arm.wood", "char.official.guest"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 288,
    location: "府邸厅堂",
    framing: "近景",
    visual:
      "赵大人逼近一步。刀疤脸仰头，空袖管在灯影里晃。堂上的灯火被笑声震得忽明忽暗，众人的影子在纸墙上拉长。",
    motion: "仰头 3 帧；空袖 3 帧一摆；灯焰 2 帧一晃。",
    narration:
      "刀疤脸仰天长啸，笑声震得堂上众人面面相觑。这一问，问出了十几年的旧账。",
    dialogue: [{ speaker: "赵大人", line: "你到底是谁？" }],
    sfx: ["长啸", "灯焰抖动", "回声"],
    assets: ["char.zhao", "char.scarface", "fx.lamp"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 288,
    location: "闪回 · 战场",
    framing: "皮影闪回",
    visual:
      "闪回改用皮影戏呈现：白色纸幕上，年轻将军的剪影横戈跃马，敌军纸片一排排倒下。一支毒箭从画外射来，钉在他的右臂上；画面一黑，只留一支箭和一只空袖的影子。",
    motion:
      "皮影剪影 12 张循环，每 2 帧一换；毒箭命中时定格 4 帧；黑场 3 帧。",
    narration:
      "十几年前，我为朝廷横戈跃马，把叛军杀得丢盔卸甲，生擒贼首。可一次激战，我中了毒箭，郎中只能砍去我的右臂。",
    dialogue: [],
    sfx: ["战鼓", "兵器碰撞", "箭矢破空"],
    assets: [
      "bg.battlefield",
      "char.general.young",
      "char.horse.war",
      "fx.burn-edge",
      "prop.spear",
    ],
    transitionIn: "silhouette",
  },
  {
    durationInFrames: 264,
    location: "闪回 · 宫门",
    framing: "闪回全景",
    visual:
      "宫门在雨里缓缓合上。将军独臂跪在门槛外，铠甲和长枪被留在雨地里。战马倒在泥中，前腿夹着地钩刀，铃铛响了一声。",
    motion: "宫门 6 帧合拢；雨丝纸线斜落；马身缓慢下沉；铃铛 2 帧一颤。",
    narration:
      "朝廷见我不能再上马，兔死狗烹，把我抛弃了。我的战马也中了地钩刀，从此瘸了。一将功成，万骨枯。",
    dialogue: [],
    sfx: ["宫门闷响", "马哀鸣", "雨声"],
    assets: [
      "bg.palace.gate",
      "char.general.one-arm",
      "char.horse.war.wounded",
      "prop.hook-blade",
    ],
    transitionIn: "silhouette",
  },
  {
    durationInFrames: 288,
    location: "府邸厅堂",
    framing: "中景",
    visual:
      "回到厅堂。赵大人眉头紧锁，试探着问。刀疤脸仰天大笑，空袖管在风里摆。",
    motion: "空袖 3 帧一摆；笑声 4 帧一顿；赵大人眉头纸片下压。",
    narration: "赵大人明白了七八分。",
    dialogue: [
      {
        speaker: "赵大人",
        line: "你……十几年前朝廷封过一位常胜将军，可就是你？",
      },
      {
        speaker: "刀疤脸",
        line: "朝廷忘了我，我也不记得自己姓甚名谁。",
      },
    ],
    sfx: ["堂上回声", "空袖摆动"],
    assets: ["char.zhao", "char.scarface", "bg.hall"],
    transitionIn: "cut",
  },
  {
    durationInFrames: 336,
    location: "饭馆后院 · 黄昏",
    framing: "全景",
    visual:
      "刀疤脸走到瘸马身边，抚摸马背。院中众马齐齐低头。瘸马抬起头，铃铛一响，背后浮现当年马王的金色剪影。",
    motion: "金剪影 8 帧浮现；众马 3 帧一低头；铃铛 2 帧一摆。",
    narration:
      "奇的是，人会遗忘，畜生却不会。赛赤兔当年日行千里，人称马王。如今腿瘸了，威风犹在，凡马仍然怕它，这就是别的马不敢吃草的缘故。",
    dialogue: [],
    sfx: ["铃铛", "马群低鸣", "音乐起"],
    assets: [
      "char.scarface",
      "char.horse.lame",
      "char.horse.crowd",
      "fx.horse-king.gold",
    ],
    transitionIn: "silhouette",
  },
  {
    durationInFrames: 168,
    location: "黄昏 · 后门外",
    framing: "结尾剪影",
    visual:
      "黄昏。一人一马走出饭馆后门，剪影被夕阳拉得很长。画面叠字“人不如马，人不如马啊”。随后纸张从两侧合拢，露出片尾小字出处。",
    motion: "剪影 4 帧一走；纸张合拢 12 帧；片尾字静止 4 秒。",
    narration:
      "刀疤脸抚着马背，连声叹道：“人不如马，人不如马啊！”",
    dialogue: [],
    sfx: ["铃铛远去", "风声", "纸张合拢"],
    assets: [
      "bg.dusk.road",
      "char.scarface",
      "char.horse.lame",
      "fx.paper-close",
      "title.credits",
    ],
    transitionIn: "paper-close",
  },
]);

export const SHOTS: Shot[] = [
  ...RULES_SHOTS,
  ...EXCEPTION_SHOTS,
  ...CONTEST_SHOTS,
  ...HUNGER_SHOTS,
  ...TRUTH_SHOTS,
];

export const TOTAL_FRAMES = ACTS.reduce(
  (total, act) => total + act.durationInFrames,
  0,
);

export const TOTAL_SECONDS = TOTAL_FRAMES / FPS;

for (const act of ACTS) {
  const actual = SHOTS.filter((shot) => shot.act === act.id).reduce(
    (total, shot) => total + shot.durationInFrames,
    0,
  );

  if (actual !== act.durationInFrames) {
    throw new Error(
      `Act "${act.id}" duration mismatch: ${actual} !== ${act.durationInFrames}`,
    );
  }
}

export const CREDITS = [
  "原作：赵连凤",
  "原载《故事会》2010 年 5 月上半月刊·红版",
  "剪纸动画改编",
] as const;

export const formatTimecode = (frame: number): string => {
  const totalSeconds = Math.floor(frame / FPS);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

/**
 * 旁白 + 台词合并为字幕源文本。
 * 后续按旁白音频逐字对齐时，以该函数返回的顺序切分字幕。
 */
export const getCaptionSource = (shot: Shot): string[] => {
  const lines = [
    ...(shot.narration ? [shot.narration] : []),
    ...shot.dialogue.map((line) => `${line.speaker}：${line.line}`),
  ];

  return lines;
};
