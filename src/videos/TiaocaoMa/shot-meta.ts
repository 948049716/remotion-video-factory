// 由 scripts/export_tiaocao_shot_meta.js 自动生成，请勿手改。

export type ShotSfxCue = {
  name: string;
  family: string;
  file: string | null;
};

export type ShotMeta = {
  id: string;
  act: string;
  title: string;
  location: string;
  framing: string;
  visual: string;
  motion: string;
  assets: string[];
  sfx: ShotSfxCue[];
  transitionIn: string;
};

export const SHOT_META: Record<string, ShotMeta> = {
  "rules-01": {
    "id": "rules-01",
    "act": "rules",
    "title": "片头 · 黑场",
    "location": "片头 · 黑场",
    "framing": "标题卡",
    "visual": "黑场。一张宣纸从画面中央向两侧撕开，纸屑飞散，露出朱红剪纸标题“跳槽马”。标题下方压一行小字：“根据《故事会》同名故事改编”。",
    "motion": "标题纸片逐帧弹入，纸边每 2 帧换一次毛边形状。",
    "assets": [
      "fx.torn-open",
      "title.tiaocaoma"
    ],
    "sfx": [
      {
        "name": "撕纸",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      },
      {
        "name": "纸屑落地",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      }
    ],
    "transitionIn": "paper-open"
  },
  "rules-02": {
    "id": "rules-02",
    "act": "rules",
    "title": "京城西街 · 饭馆外",
    "location": "京城西街 · 饭馆外",
    "framing": "大全景",
    "visual": "城西街口。饭馆门脸由三层纸片叠成：屋檐、红灯笼、布幌子。门前轿马排开，纸片宾客来来往往，热气从门里冒出来。",
    "motion": "背景横移，前后纸层做视差；灯笼每 3 帧摆一次，幅度很小。",
    "assets": [
      "bg.street.west",
      "bg.restaurant.facade",
      "char.crowd",
      "prop.lantern",
      "prop.signboard"
    ],
    "sfx": [
      {
        "name": "街市嘈杂",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "店小二招呼",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "灯笼轻响",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      }
    ],
    "transitionIn": "torn-wipe"
  },
  "rules-03": {
    "id": "rules-03",
    "act": "rules",
    "title": "饭馆内堂",
    "location": "饭馆内堂",
    "framing": "中景",
    "visual": "内堂一张张方桌，桌上三盘菜用叠纸表现：豆瓣鱼、龙脆骨、驴打滚。几位换了便服的官员围坐，筷子起落，说话时刻意压低声音。",
    "motion": "筷子每 2 帧夹一次，人物只用 3 个循环姿态，保持纸偶顿挫感。",
    "assets": [
      "bg.restaurant.interior",
      "prop.dishes",
      "char.official.guest"
    ],
    "sfx": [
      {
        "name": "杯盏碰撞",
        "family": "metal",
        "file": "tiaocaoma/audio/sfx/metal.wav"
      },
      {
        "name": "筷子落碟",
        "family": "metal",
        "file": "tiaocaoma/audio/sfx/metal.wav"
      },
      {
        "name": "低声交谈",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      }
    ],
    "transitionIn": "paper-flip"
  },
  "rules-04": {
    "id": "rules-04",
    "act": "rules",
    "title": "后院马棚",
    "location": "后院马棚",
    "framing": "全景",
    "visual": "后院马棚，木柱与草棚是深赭色剪纸。马匹一字排开，店小二抱着一捆草料从马屁股后面穿过去，往槽里添草。",
    "motion": "店小二走 4 帧循环；马头偶尔甩一下，每 12 帧一次。",
    "assets": [
      "bg.stable",
      "char.er",
      "char.horse.crowd",
      "prop.hay"
    ],
    "sfx": [
      {
        "name": "马嘶",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "草料摩擦",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "木棚轻响",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "rules-05": {
    "id": "rules-05",
    "act": "rules",
    "title": "马槽 · 规则示意",
    "location": "马槽 · 规则示意",
    "framing": "俯拍横移",
    "visual": "俯拍长马槽示意。纸片箭头从西向东推进，东端压一枚金纸“贵”字。一品到五品的官阶木牌依次翻面，排成一条斜线。",
    "motion": "箭头逐格推进，每格 4 帧；木牌依次翻面，每张停 6 帧。",
    "assets": [
      "prop.trough.map",
      "prop.rank.cards",
      "fx.arrow"
    ],
    "sfx": [
      {
        "name": "纸张翻动",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      },
      {
        "name": "木牌落桌",
        "family": "stamp",
        "file": "tiaocaoma/audio/sfx/stamp.wav"
      }
    ],
    "transitionIn": "paper-flip"
  },
  "rules-06": {
    "id": "rules-06",
    "act": "rules",
    "title": "京城西街 · 鸟瞰",
    "location": "京城西街 · 鸟瞰",
    "framing": "鸟瞰",
    "visual": "饭馆与街道的鸟瞰剪纸图。东边升起一轮金纸太阳，马匹队列整体向东倾斜。画面右侧叠一个小构图：官帽越大，马位越靠东。",
    "motion": "太阳纸片分 6 段升起；马队每 8 帧向东挪一格。",
    "assets": [
      "bg.map.west-east",
      "prop.rank.cards",
      "fx.gold-sun"
    ],
    "sfx": [
      {
        "name": "马蹄远去",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "纸片滑移",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "rules-07": {
    "id": "rules-07",
    "act": "rules",
    "title": "马槽 · 草料三等",
    "location": "马槽 · 草料三等",
    "framing": "三联画特写",
    "visual": "三联画。左格是刚割来的嫩草拌细粮，绿纸间夹米白纸屑；中格是普通青草；右格是发黄的枯草。每格上方压一块品级木牌：一品、三品、五品。",
    "motion": "三格依次亮起，每格 8 帧；木牌压下时带 2 帧回弹。",
    "assets": [
      "prop.hay.premium",
      "prop.hay.fresh",
      "prop.hay.dry",
      "prop.rank.plaques"
    ],
    "sfx": [
      {
        "name": "草料落槽",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "木牌压下",
        "family": "stamp",
        "file": "tiaocaoma/audio/sfx/stamp.wav"
      }
    ],
    "transitionIn": "paper-flip"
  },
  "rules-08": {
    "id": "rules-08",
    "act": "rules",
    "title": "马槽 · 全景",
    "location": "马槽 · 全景",
    "framing": "横移长镜",
    "visual": "一条长长的木马槽横贯画面，被隔成几十个小槽，每槽一匹马。槽沿上钉着品级小木牌。镜头从左向右缓慢横移。",
    "motion": "镜头横移，马匹逐格进入画面；纸层前后错开，形成浅景深。",
    "assets": [
      "bg.trough.long",
      "char.horse.crowd",
      "prop.trough"
    ],
    "sfx": [
      {
        "name": "木槽轻响",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "马蹄挪动",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      }
    ],
    "transitionIn": "torn-wipe"
  },
  "rules-09": {
    "id": "rules-09",
    "act": "rules",
    "title": "马槽 · 争食",
    "location": "马槽 · 争食",
    "framing": "近景",
    "visual": "三四只马嘴挤进同一个槽，槽沿被顶得翘起一张纸片。店小二举着木棍冲过来，棍子敲在槽沿上，纸屑震起。",
    "motion": "马嘴每 2 帧伸一次；木棍每 2 帧敲一下，敲击时整个纸舞台抖 1px。",
    "assets": [
      "char.er",
      "char.horse.crowd",
      "prop.stick",
      "prop.trough"
    ],
    "sfx": [
      {
        "name": "木棍敲槽",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "马嚼",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "纸片颤动",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "rules-10": {
    "id": "rules-10",
    "act": "rules",
    "title": "马槽 · 秩序恢复",
    "location": "马槽 · 秩序恢复",
    "framing": "全景",
    "visual": "众马各归其槽，低头吃草。店小二叉腰站在槽边。画面一角，两位官员隔着窗纸会心一笑。",
    "motion": "马头按同一节奏起落，4 帧一个循环；店小二保持得意姿态。",
    "assets": [
      "char.horse.crowd",
      "char.er",
      "char.official.guest",
      "bg.window.paper"
    ],
    "sfx": [
      {
        "name": "咀嚼",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "轻笑",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      }
    ],
    "transitionIn": "paper-flip"
  },
  "exception-01": {
    "id": "exception-01",
    "act": "exception",
    "title": "饭馆外 · 街口",
    "location": "饭馆外 · 街口",
    "framing": "中景",
    "visual": "刀疤脸骑着一匹瘸腿白马入画。人和马都是逆光剪影，脸上那道刀疤用一条白纸留出来。马脖子上的铃铛来回晃，马身一歪一歪。",
    "motion": "人马整体 4 帧一个循环；铃铛每 2 帧摆一次，幅度夸张。",
    "assets": [
      "char.scarface.riding",
      "char.horse.lame",
      "prop.bell"
    ],
    "sfx": [
      {
        "name": "铃铛乱响",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      },
      {
        "name": "不齐的马蹄",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      }
    ],
    "transitionIn": "silhouette"
  },
  "exception-02": {
    "id": "exception-02",
    "act": "exception",
    "title": "饭馆门口",
    "location": "饭馆门口",
    "framing": "近景",
    "visual": "店小二近景。他眼睛左右一扫，嘴角往下一撇，手里算盘拨了一下。背景虚化成几块纸片色块。",
    "motion": "眼神 3 帧一转，眉毛 2 帧一挑，算盘珠 2 帧一弹。",
    "assets": [
      "char.er",
      "fx.thought"
    ],
    "sfx": [
      {
        "name": "算盘一响",
        "family": "abacus",
        "file": "tiaocaoma/audio/sfx/abacus.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "exception-03": {
    "id": "exception-03",
    "act": "exception",
    "title": "饭馆门口",
    "location": "饭馆门口",
    "framing": "中景",
    "visual": "店小二强挤出一丝笑，笑脸是单独一片纸，往脸上一贴。他侧身掀帘，做了个请的手势。",
    "motion": "笑脸纸片弹入，停 4 帧；门帘 3 帧一掀。",
    "assets": [
      "char.er",
      "prop.door.curtain"
    ],
    "sfx": [
      {
        "name": "门帘响",
        "family": "door",
        "file": "tiaocaoma/audio/sfx/door.wav"
      },
      {
        "name": "假笑",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "exception-04": {
    "id": "exception-04",
    "act": "exception",
    "title": "饭馆门口",
    "location": "饭馆门口",
    "framing": "手部特写",
    "visual": "刀疤脸把缰绳递过去，手部特写。瘸马在背景里低头，铃铛轻轻响。",
    "motion": "缰绳传递 3 帧；店小二肩膀憋笑抖 2 帧。",
    "assets": [
      "char.scarface",
      "char.er",
      "char.horse.lame",
      "prop.reins"
    ],
    "sfx": [
      {
        "name": "缰绳摩擦",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      },
      {
        "name": "憋笑",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "铃铛",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "exception-05": {
    "id": "exception-05",
    "act": "exception",
    "title": "饭馆门口",
    "location": "饭馆门口",
    "framing": "中景",
    "visual": "店小二油嘴滑舌，手指比划“两条腿”和“四条腿”。刀疤脸已经转身往店里走，瘸马在旁边抬了一下后腿。",
    "motion": "手指 2 帧一点；马腿 3 帧一抬；店小二身体轻微前仰后合。",
    "assets": [
      "char.er",
      "char.scarface",
      "char.horse.lame"
    ],
    "sfx": [
      {
        "name": "手指点空",
        "family": "body",
        "file": "tiaocaoma/audio/sfx/body.wav"
      },
      {
        "name": "轻笑",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "马腿刨地",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "exception-06": {
    "id": "exception-06",
    "act": "exception",
    "title": "马槽 · 西端",
    "location": "马槽 · 西端",
    "framing": "全景",
    "visual": "马槽最靠西的角落。店小二把瘸马拴在木桩上，随手丢下一把枯草，拍了拍手，转身进店。",
    "motion": "草把落下 2 帧；店小二脚步 4 帧一循环，人马先后出画。",
    "assets": [
      "bg.trough.west",
      "char.horse.lame",
      "prop.hay.dry",
      "char.er"
    ],
    "sfx": [
      {
        "name": "枯草落地",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "脚步",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "铃铛",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      }
    ],
    "transitionIn": "torn-wipe"
  },
  "exception-07": {
    "id": "exception-07",
    "act": "exception",
    "title": "饭馆内堂",
    "location": "饭馆内堂",
    "framing": "中景",
    "visual": "赵大人放下酒杯，扶着桌沿起身，随从赶紧递上外袍。桌上杯盘狼藉。",
    "motion": "起身拆成 4 个关键姿态，每 2 帧换一次；外袍 3 帧一披。",
    "assets": [
      "char.zhao",
      "char.attendant",
      "bg.restaurant.interior"
    ],
    "sfx": [
      {
        "name": "酒杯落桌",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "衣袍摩擦",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      },
      {
        "name": "椅子轻响",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      }
    ],
    "transitionIn": "paper-flip"
  },
  "exception-08": {
    "id": "exception-08",
    "act": "exception",
    "title": "马槽 · 东端",
    "location": "马槽 · 东端",
    "framing": "推镜",
    "visual": "赵大人走到马槽前，脚步停住。镜头顺着他的视线推向东端：瘸马埋头在大槽里，嘴里塞满嫩草，铃铛还在晃。",
    "motion": "推镜用 3 段跳切，每段 8 帧，模拟剪纸定格推近。",
    "assets": [
      "char.zhao",
      "char.horse.lame",
      "bg.trough.east",
      "prop.hay.premium"
    ],
    "sfx": [
      {
        "name": "咀嚼",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "铃铛轻响",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      },
      {
        "name": "音乐骤停",
        "family": "gong",
        "file": "tiaocaoma/audio/sfx/gong.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "exception-09": {
    "id": "exception-09",
    "act": "exception",
    "title": "马槽 · 东端",
    "location": "马槽 · 东端",
    "framing": "近景",
    "visual": "赵大人侧身，手指向东槽。他的脸色由白转红，靠换一张脸纸完成。",
    "motion": "换脸纸 2 帧一张；手指 3 帧一抬。",
    "assets": [
      "char.zhao",
      "char.horse.lame"
    ],
    "sfx": [
      {
        "name": "衣袖一甩",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      },
      {
        "name": "冷声",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "exception-10": {
    "id": "exception-10",
    "act": "exception",
    "title": "马槽 · 东端",
    "location": "马槽 · 东端",
    "framing": "中景",
    "visual": "店小二弯腰赔笑，双手乱摆。瘸马在背景里继续吃，完全不理会。",
    "motion": "双手 2 帧一摆，腰 3 帧一弯；瘸马咀嚼循环。",
    "assets": [
      "char.er",
      "char.zhao",
      "char.horse.lame"
    ],
    "sfx": [
      {
        "name": "赔笑",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "马嚼",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "exception-11": {
    "id": "exception-11",
    "act": "exception",
    "title": "马槽 · 东端",
    "location": "马槽 · 东端",
    "framing": "全景",
    "visual": "赵大人拂袖，转身走向东边牵马。店小二立在原地擦汗，汗珠是几片白色纸点。",
    "motion": "袖片 3 帧一甩；汗珠纸点 2 帧一落。",
    "assets": [
      "char.zhao",
      "char.er",
      "char.horse.zhao"
    ],
    "sfx": [
      {
        "name": "脚步远去",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "擦汗",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      },
      {
        "name": "马铃",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "contest-01": {
    "id": "contest-01",
    "act": "contest",
    "title": "饭馆外 · 重复蒙太奇",
    "location": "饭馆外 · 重复蒙太奇",
    "framing": "重复蒙太奇",
    "visual": "三个纸片日影快速翻过，刀疤脸骑着瘸马一次次进画。店小二躲在门后，捂着嘴偷笑。",
    "motion": "日影翻 3 次，每次 12 帧；人马 4 帧循环；每次进画位置略错开。",
    "assets": [
      "char.scarface.riding",
      "char.horse.lame",
      "char.er",
      "fx.day-flip"
    ],
    "sfx": [
      {
        "name": "铃铛",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      },
      {
        "name": "马蹄",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "翻纸",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      }
    ],
    "transitionIn": "paper-flip"
  },
  "contest-02": {
    "id": "contest-02",
    "act": "contest",
    "title": "饭馆内堂 · 桌边",
    "location": "饭馆内堂 · 桌边",
    "framing": "桌面特写",
    "visual": "一碟花生米、一壶小酒。刀疤脸用筷子一颗一颗夹花生，碟边排出一小堆花生壳。他数得很认真。",
    "motion": "筷子 2 帧一夹，花生纸片弹一下；酒液用一条青纸表示。",
    "assets": [
      "char.scarface",
      "prop.peanuts",
      "prop.wine",
      "bg.table"
    ],
    "sfx": [
      {
        "name": "花生落碟",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "酒入杯",
        "family": "metal",
        "file": "tiaocaoma/audio/sfx/metal.wav"
      },
      {
        "name": "筷子轻碰",
        "family": "metal",
        "file": "tiaocaoma/audio/sfx/metal.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "contest-03": {
    "id": "contest-03",
    "act": "contest",
    "title": "饭馆内堂 · 柜台",
    "location": "饭馆内堂 · 柜台",
    "framing": "中景",
    "visual": "店小二在柜台后擦桌子，越擦越用力，抹布下纸屑飞起。他斜眼盯着刀疤脸那一桌。",
    "motion": "手 2 帧一来回，桌角纸屑 2 帧一跳；眼神固定斜视。",
    "assets": [
      "char.er",
      "prop.cloth",
      "char.scarface"
    ],
    "sfx": [
      {
        "name": "抹布摩擦",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      },
      {
        "name": "咬牙",
        "family": "body",
        "file": "tiaocaoma/audio/sfx/body.wav"
      },
      {
        "name": "算盘轻响",
        "family": "abacus",
        "file": "tiaocaoma/audio/sfx/abacus.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "contest-04": {
    "id": "contest-04",
    "act": "contest",
    "title": "后院 · 木桩",
    "location": "后院 · 木桩",
    "framing": "特写",
    "visual": "木桩特写。店小二把缰绳绕三圈，系了个死扣，双手用力一拉。瘸马歪着头看他，一脸无所谓。",
    "motion": "绕绳 3 帧一圈，共 3 圈；死扣特写停 4 帧；拉动时木桩抖 1px。",
    "assets": [
      "prop.post",
      "prop.reins",
      "char.er",
      "char.horse.lame"
    ],
    "sfx": [
      {
        "name": "绳子勒紧",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      },
      {
        "name": "木桩闷响",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "马鼻息",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "contest-05": {
    "id": "contest-05",
    "act": "contest",
    "title": "饭馆门口",
    "location": "饭馆门口",
    "framing": "全景",
    "visual": "饭馆门口，一品大员的仪仗剪影：伞盖、随从、高头大马。店小二鞠躬到地，脑袋几乎碰到门槛。",
    "motion": "伞盖纸片旋转 4 帧；随从两列推进，每列 3 帧一步。",
    "assets": [
      "char.yipin",
      "char.attendant",
      "prop.umbrella",
      "bg.restaurant.facade"
    ],
    "sfx": [
      {
        "name": "锣声一响",
        "family": "gong",
        "file": "tiaocaoma/audio/sfx/gong.wav"
      },
      {
        "name": "整齐脚步",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "马铃",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      }
    ],
    "transitionIn": "silhouette"
  },
  "contest-06": {
    "id": "contest-06",
    "act": "contest",
    "title": "马槽 · 东端",
    "location": "马槽 · 东端",
    "framing": "横扫推镜",
    "visual": "一品大员走到后院，镜头跟随他的视线横扫马槽，最后停在东端：瘸马又在吃嫩草，铃铛轻晃。",
    "motion": "横扫用 3 段跳切，最后一顿 6 帧；铃铛 2 帧一摆。",
    "assets": [
      "char.yipin",
      "char.horse.lame",
      "bg.trough.east"
    ],
    "sfx": [
      {
        "name": "铃铛",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      },
      {
        "name": "音乐重音",
        "family": "gong",
        "file": "tiaocaoma/audio/sfx/gong.wav"
      },
      {
        "name": "倒吸气",
        "family": "body",
        "file": "tiaocaoma/audio/sfx/body.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "contest-07": {
    "id": "contest-07",
    "act": "contest",
    "title": "后院 · 木桩",
    "location": "后院 · 木桩",
    "framing": "近景",
    "visual": "店小二跪在木桩前，手指摸过被蹭掉一层的木桩。缰绳上全是磨损的毛边，地上散着木屑纸片。",
    "motion": "手指 2 帧一移；木屑纸片 3 帧一落；店小二身体逐渐发抖。",
    "assets": [
      "prop.post.worn",
      "prop.reins.worn",
      "char.er"
    ],
    "sfx": [
      {
        "name": "木头摩擦",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "倒吸气",
        "family": "body",
        "file": "tiaocaoma/audio/sfx/body.wav"
      },
      {
        "name": "木屑落地",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "contest-08": {
    "id": "contest-08",
    "act": "contest",
    "title": "马槽 · 东端",
    "location": "马槽 · 东端",
    "framing": "正面近景",
    "visual": "一品大员正面近景，脸纸换成铁青色。身后随从齐齐低头，不敢出声。",
    "motion": "脸纸 2 帧一换；镜头轻推 3 段；随从纸片整体下沉一档。",
    "assets": [
      "char.yipin",
      "char.attendant"
    ],
    "sfx": [
      {
        "name": "冷风",
        "family": "weather",
        "file": "tiaocaoma/audio/sfx/weather.wav"
      },
      {
        "name": "衣袍",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      },
      {
        "name": "堂威低鸣",
        "family": "gong",
        "file": "tiaocaoma/audio/sfx/gong.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "contest-09": {
    "id": "contest-09",
    "act": "contest",
    "title": "马槽 · 东端",
    "location": "马槽 · 东端",
    "framing": "全景",
    "visual": "店小二扑通跪地，磕头如鸡啄米，额头一次次碰地。一品大员一甩袖子，转身出画。",
    "motion": "磕头 2 帧一次，连续 4 次；袖子 3 帧一甩；地面纸屑震起。",
    "assets": [
      "char.er",
      "char.yipin"
    ],
    "sfx": [
      {
        "name": "磕头",
        "family": "body",
        "file": "tiaocaoma/audio/sfx/body.wav"
      },
      {
        "name": "甩袖",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      },
      {
        "name": "脚步",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "contest-10": {
    "id": "contest-10",
    "act": "contest",
    "title": "饭馆内堂",
    "location": "饭馆内堂",
    "framing": "中景",
    "visual": "店小二拦住刀疤脸，抱拳作揖，几乎要哭出来。刀疤脸把酒盅往桌上一顿，身后是瘸马的剪影。",
    "motion": "抱拳 3 帧一拱；酒盅 2 帧一顿；瘸马剪影轻微晃动。",
    "assets": [
      "char.er",
      "char.scarface",
      "char.horse.lame",
      "prop.wine"
    ],
    "sfx": [
      {
        "name": "酒盅顿桌",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "马铃",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      },
      {
        "name": "椅子挪动",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "hunger-01": {
    "id": "hunger-01",
    "act": "hunger",
    "title": "后院 · 马头特写",
    "location": "后院 · 马头特写",
    "framing": "特写",
    "visual": "马头特写。店小二在原来的缰绳上再加一根粗绳，绕颈一圈，再在木桩上打死扣。一个小童搬来小凳，坐在旁边死死盯着。",
    "motion": "绕绳 3 帧一圈；小童坐下 4 帧；粗绳绷紧时抖 1px。",
    "assets": [
      "prop.rope.thick",
      "prop.post",
      "char.child",
      "char.horse.lame"
    ],
    "sfx": [
      {
        "name": "粗绳摩擦",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      },
      {
        "name": "木凳落地",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "小童脚步",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      }
    ],
    "transitionIn": "torn-wipe"
  },
  "hunger-02": {
    "id": "hunger-02",
    "act": "hunger",
    "title": "马槽 · 西端",
    "location": "马槽 · 西端",
    "framing": "中景",
    "visual": "瘸马梗着脖子，头抬得高高的，面前的枯草一口不动。粗绳被绷得笔直。",
    "motion": "马头 3 帧一抬；绳子 2 帧一颤；枯草保持静止。",
    "assets": [
      "char.horse.lame",
      "prop.hay.dry",
      "prop.rope.thick"
    ],
    "sfx": [
      {
        "name": "马鼻息",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "绳子绷紧",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "hunger-03": {
    "id": "hunger-03",
    "act": "hunger",
    "title": "饭馆 · 后门",
    "location": "饭馆 · 后门",
    "framing": "中景",
    "visual": "店小二抱着胳膊，斜靠门框，嘴角上扬。他心里的话用纸片气泡浮出来，一个字一个字往外蹦。",
    "motion": "气泡逐字弹出，每 2 帧一字；店小二脚尖打拍子，3 帧一颠。",
    "assets": [
      "char.er",
      "fx.speech-bubble"
    ],
    "sfx": [
      {
        "name": "算盘声",
        "family": "abacus",
        "file": "tiaocaoma/audio/sfx/abacus.wav"
      },
      {
        "name": "哼小曲",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "hunger-04": {
    "id": "hunger-04",
    "act": "hunger",
    "title": "马槽 · 全景",
    "location": "马槽 · 全景",
    "framing": "大全景",
    "visual": "众马原本低头吃草，见瘸马绝食，纷纷退后半步，垂头立着，像在“候”着它。整个马棚安静下来。",
    "motion": "马群 3 帧一退；集体定格 8 帧；只有瘸马的铃铛偶尔响。",
    "assets": [
      "char.horse.crowd",
      "char.horse.lame",
      "bg.stable"
    ],
    "sfx": [
      {
        "name": "马群骚动后安静",
        "family": "silence",
        "file": null
      },
      {
        "name": "铃铛轻响",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "hunger-05": {
    "id": "hunger-05",
    "act": "hunger",
    "title": "马槽 · 全景",
    "location": "马槽 · 全景",
    "framing": "中景",
    "visual": "店小二在槽间来回跑，木棍敲得槽沿乱响，纸屑四溅。众马纹丝不动，只是往后退。",
    "motion": "店小二左右跑 4 帧循环；木棍 2 帧一敲；马群每 6 帧退一小步。",
    "assets": [
      "char.er",
      "prop.stick",
      "char.horse.crowd"
    ],
    "sfx": [
      {
        "name": "急促敲槽",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "马退",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "纸屑落地",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "hunger-06": {
    "id": "hunger-06",
    "act": "hunger",
    "title": "马厩 · 夜",
    "location": "马厩 · 夜",
    "framing": "夜景全景",
    "visual": "夜景。马厩里的马匹肋骨用几道白纸线表现，身形明显消瘦。远处府邸窗口亮着灯，马在槽边猛吃。",
    "motion": "月亮纸片缓慢移动；马身瘦纸替换 2 帧；灯火 3 帧一跳。",
    "assets": [
      "bg.stable.night",
      "char.horse.thin",
      "fx.moon"
    ],
    "sfx": [
      {
        "name": "夜风",
        "family": "weather",
        "file": "tiaocaoma/audio/sfx/weather.wav"
      },
      {
        "name": "远处马嚼",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "更鼓",
        "family": "gong",
        "file": "tiaocaoma/audio/sfx/gong.wav"
      }
    ],
    "transitionIn": "silhouette"
  },
  "hunger-07": {
    "id": "hunger-07",
    "act": "hunger",
    "title": "府邸马厩",
    "location": "府邸马厩",
    "framing": "中景",
    "visual": "三位官员围着各自的马，摸马背、皱眉头。马背上的鞍具明显松了一圈。",
    "motion": "手 2 帧一摸；眉头纸片下压；鞍具每 4 帧滑一格。",
    "assets": [
      "char.official.guest",
      "char.horse.thin",
      "prop.saddle"
    ],
    "sfx": [
      {
        "name": "马鞍晃动",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "质问声",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "衣袍摩擦",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "hunger-08": {
    "id": "hunger-08",
    "act": "hunger",
    "title": "饭馆后院",
    "location": "饭馆后院",
    "framing": "全景",
    "visual": "店小二跪在众官员面前，手指向东槽的瘸马。官员们的脸一张张变白，像被换了一层面纸。",
    "motion": "手指 3 帧一指；脸纸依次更换；店小二肩膀持续发抖。",
    "assets": [
      "char.er",
      "char.zhao",
      "char.official.guest",
      "char.horse.lame"
    ],
    "sfx": [
      {
        "name": "倒吸气",
        "family": "body",
        "file": "tiaocaoma/audio/sfx/body.wav"
      },
      {
        "name": "拍案",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "纸片窸窣",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "hunger-09": {
    "id": "hunger-09",
    "act": "hunger",
    "title": "府邸厅堂 · 门口",
    "location": "府邸厅堂 · 门口",
    "framing": "全景",
    "visual": "厅堂门口。两名差役押着刀疤脸进画，刀疤脸不慌不忙，脚步一点不乱。赵大人高坐堂上，脸色铁青。",
    "motion": "差役 4 帧一推；刀疤脸步伐不变；堂上灯影 2 帧一晃。",
    "assets": [
      "char.scarface",
      "char.zhao",
      "char.guard",
      "bg.hall"
    ],
    "sfx": [
      {
        "name": "堂鼓一响",
        "family": "gong",
        "file": "tiaocaoma/audio/sfx/gong.wav"
      },
      {
        "name": "脚步",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "灯焰抖动",
        "family": "weather",
        "file": "tiaocaoma/audio/sfx/weather.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "truth-01": {
    "id": "truth-01",
    "act": "truth",
    "title": "府邸厅堂",
    "location": "府邸厅堂",
    "framing": "大全景",
    "visual": "厅堂全景。官员分列两侧，刀疤脸独立堂中，空着一只右袖。赵大人拍案，案上的纸片茶杯跳了起来。",
    "motion": "拍案 2 帧一顿；茶杯纸片弹起 4 帧；两侧官员微微后仰。",
    "assets": [
      "bg.hall",
      "char.zhao",
      "char.scarface",
      "char.official.guest",
      "prop.table"
    ],
    "sfx": [
      {
        "name": "拍案",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "茶杯跳",
        "family": "metal",
        "file": "tiaocaoma/audio/sfx/metal.wav"
      },
      {
        "name": "堂威",
        "family": "gong",
        "file": "tiaocaoma/audio/sfx/gong.wav"
      }
    ],
    "transitionIn": "paper-open"
  },
  "truth-02": {
    "id": "truth-02",
    "act": "truth",
    "title": "府邸厅堂",
    "location": "府邸厅堂",
    "framing": "近景",
    "visual": "刀疤脸近景，双手抱拳，神情自若。背景官员压成低矮的纸片剪影，只剩几双眼睛。",
    "motion": "抱拳 3 帧；眼神不躲；背景剪影保持静止。",
    "assets": [
      "char.scarface",
      "char.official.guest"
    ],
    "sfx": [
      {
        "name": "堂上安静",
        "family": "silence",
        "file": null
      },
      {
        "name": "衣袍轻响",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "truth-03": {
    "id": "truth-03",
    "act": "truth",
    "title": "府邸厅堂",
    "location": "府邸厅堂",
    "framing": "中景",
    "visual": "赵大人拔剑，剑身是一道银白剪纸。剑光没有直接落在人身上，而是投在身后的纸墙上：两道拉长的影子一交，影子里的手臂先断。随后，一只空袖管从画外飘落。",
    "motion": "剑光 1 帧一闪；墙上影子交错 2 帧；空袖落下 4 帧。断裂瞬间不切白场，改用纸墙上的黑影断开。",
    "assets": [
      "char.zhao",
      "char.scarface",
      "prop.sword",
      "fx.slash"
    ],
    "sfx": [
      {
        "name": "拔剑",
        "family": "sword",
        "file": "tiaocaoma/audio/sfx/sword.wav"
      },
      {
        "name": "破风",
        "family": "sword",
        "file": "tiaocaoma/audio/sfx/sword.wav"
      },
      {
        "name": "纸幕撕裂",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "truth-04": {
    "id": "truth-04",
    "act": "truth",
    "title": "府邸厅堂 · 地面",
    "location": "府邸厅堂 · 地面",
    "framing": "特写",
    "visual": "特写。空袖管落在地上，袖口里滚出一截木头手臂：断口是榫头，木纹一圈一圈，没有一滴血。堂上众人的纸片脸一齐僵住。",
    "motion": "木臂滚 4 帧；停住后回弹 2 帧；木纹保持静态，不闪。",
    "assets": [
      "prop.arm.wood",
      "fx.wood-grain",
      "char.scarface"
    ],
    "sfx": [
      {
        "name": "木头滚地",
        "family": "wood",
        "file": "tiaocaoma/audio/sfx/wood.wav"
      },
      {
        "name": "全场静默",
        "family": "silence",
        "file": null
      }
    ],
    "transitionIn": "cut"
  },
  "truth-05": {
    "id": "truth-05",
    "act": "truth",
    "title": "府邸厅堂",
    "location": "府邸厅堂",
    "framing": "中景",
    "visual": "店小二瘫坐在地，手指着那截木臂，嘴唇直哆嗦。周围官员的脸像被线牵着，一张张转过来。",
    "motion": "手指 2 帧一抖；官员脸纸同步转动；店小二身体 3 帧一缩。",
    "assets": [
      "char.er",
      "prop.arm.wood",
      "char.official.guest"
    ],
    "sfx": [
      {
        "name": "牙齿打颤",
        "family": "body",
        "file": "tiaocaoma/audio/sfx/body.wav"
      },
      {
        "name": "纸片窸窣",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "truth-06": {
    "id": "truth-06",
    "act": "truth",
    "title": "府邸厅堂",
    "location": "府邸厅堂",
    "framing": "近景",
    "visual": "赵大人逼近一步。刀疤脸仰头，空袖管在灯影里晃。堂上的灯火被笑声震得忽明忽暗，众人的影子在纸墙上拉长。",
    "motion": "仰头 3 帧；空袖 3 帧一摆；灯焰 2 帧一晃。",
    "assets": [
      "char.zhao",
      "char.scarface",
      "fx.lamp"
    ],
    "sfx": [
      {
        "name": "长啸",
        "family": "body",
        "file": "tiaocaoma/audio/sfx/body.wav"
      },
      {
        "name": "灯焰抖动",
        "family": "weather",
        "file": "tiaocaoma/audio/sfx/weather.wav"
      },
      {
        "name": "回声",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "truth-07": {
    "id": "truth-07",
    "act": "truth",
    "title": "闪回 · 战场",
    "location": "闪回 · 战场",
    "framing": "皮影闪回",
    "visual": "闪回改用皮影戏呈现：白色纸幕上，年轻将军的剪影横戈跃马，敌军纸片一排排倒下。一支毒箭从画外射来，钉在他的右臂上；画面一黑，只留一支箭和一只空袖的影子。",
    "motion": "皮影剪影 12 张循环，每 2 帧一换；毒箭命中时定格 4 帧；黑场 3 帧。",
    "assets": [
      "bg.battlefield",
      "char.general.young",
      "char.horse.war",
      "fx.burn-edge",
      "prop.spear"
    ],
    "sfx": [
      {
        "name": "战鼓",
        "family": "gong",
        "file": "tiaocaoma/audio/sfx/gong.wav"
      },
      {
        "name": "兵器碰撞",
        "family": "metal",
        "file": "tiaocaoma/audio/sfx/metal.wav"
      },
      {
        "name": "箭矢破空",
        "family": "sword",
        "file": "tiaocaoma/audio/sfx/sword.wav"
      }
    ],
    "transitionIn": "silhouette"
  },
  "truth-08": {
    "id": "truth-08",
    "act": "truth",
    "title": "闪回 · 宫门",
    "location": "闪回 · 宫门",
    "framing": "闪回全景",
    "visual": "宫门在雨里缓缓合上。将军独臂跪在门槛外，铠甲和长枪被留在雨地里。战马倒在泥中，前腿夹着地钩刀，铃铛响了一声。",
    "motion": "宫门 6 帧合拢；雨丝纸线斜落；马身缓慢下沉；铃铛 2 帧一颤。",
    "assets": [
      "bg.palace.gate",
      "char.general.one-arm",
      "char.horse.war.wounded",
      "prop.hook-blade"
    ],
    "sfx": [
      {
        "name": "宫门闷响",
        "family": "door",
        "file": "tiaocaoma/audio/sfx/door.wav"
      },
      {
        "name": "马哀鸣",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "雨声",
        "family": "weather",
        "file": "tiaocaoma/audio/sfx/weather.wav"
      }
    ],
    "transitionIn": "silhouette"
  },
  "truth-09": {
    "id": "truth-09",
    "act": "truth",
    "title": "府邸厅堂",
    "location": "府邸厅堂",
    "framing": "中景",
    "visual": "回到厅堂。赵大人眉头紧锁，试探着问。刀疤脸仰天大笑，空袖管在风里摆。",
    "motion": "空袖 3 帧一摆；笑声 4 帧一顿；赵大人眉头纸片下压。",
    "assets": [
      "char.zhao",
      "char.scarface",
      "bg.hall"
    ],
    "sfx": [
      {
        "name": "堂上回声",
        "family": "crowd",
        "file": "tiaocaoma/audio/sfx/crowd.wav"
      },
      {
        "name": "空袖摆动",
        "family": "cloth",
        "file": "tiaocaoma/audio/sfx/cloth.wav"
      }
    ],
    "transitionIn": "cut"
  },
  "truth-10": {
    "id": "truth-10",
    "act": "truth",
    "title": "饭馆后院 · 黄昏",
    "location": "饭馆后院 · 黄昏",
    "framing": "全景",
    "visual": "刀疤脸走到瘸马身边，抚摸马背。院中众马齐齐低头。瘸马抬起头，铃铛一响，背后浮现当年马王的金色剪影。",
    "motion": "金剪影 8 帧浮现；众马 3 帧一低头；铃铛 2 帧一摆。",
    "assets": [
      "char.scarface",
      "char.horse.lame",
      "char.horse.crowd",
      "fx.horse-king.gold"
    ],
    "sfx": [
      {
        "name": "铃铛",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      },
      {
        "name": "马群低鸣",
        "family": "horse",
        "file": "tiaocaoma/audio/sfx/horse.wav"
      },
      {
        "name": "音乐起",
        "family": "gong",
        "file": "tiaocaoma/audio/sfx/gong.wav"
      }
    ],
    "transitionIn": "silhouette"
  },
  "truth-11": {
    "id": "truth-11",
    "act": "truth",
    "title": "黄昏 · 后门外",
    "location": "黄昏 · 后门外",
    "framing": "结尾剪影",
    "visual": "黄昏。一人一马走出饭馆后门，剪影被夕阳拉得很长。画面叠字“人不如马，人不如马啊”。随后纸张从两侧合拢，露出片尾小字出处。",
    "motion": "剪影 4 帧一走；纸张合拢 12 帧；片尾字静止 4 秒。",
    "assets": [
      "bg.dusk.road",
      "char.scarface",
      "char.horse.lame",
      "fx.paper-close",
      "title.credits"
    ],
    "sfx": [
      {
        "name": "铃铛远去",
        "family": "bell",
        "file": "tiaocaoma/audio/sfx/bell.wav"
      },
      {
        "name": "风声",
        "family": "weather",
        "file": "tiaocaoma/audio/sfx/weather.wav"
      },
      {
        "name": "纸张合拢",
        "family": "paper",
        "file": "tiaocaoma/audio/sfx/paper.wav"
      }
    ],
    "transitionIn": "paper-close"
  }
};
