/**
 * 《老陈的修理铺与八音盒》镜头与配音单一数据源（Single Source of Truth）
 *
 * 所有音频时长 durSec 均来自 ffprobe 实测，TIMELINE 自动累加计算帧号。
 */

export type SpeakerId = "narrator" | "chen" | "girl";

export type SpeakerMeta = {
  name: string;
  /** 角色专属字幕色标 */
  accent: string;
  /** 是否在字幕前显示角色名（旁白为 false，角色对话为 true） */
  showPrefix: boolean;
};

export const SPEAKERS: Record<SpeakerId, SpeakerMeta> = {
  narrator: {
    name: "旁白",
    accent: "rgba(255, 248, 231, 0.45)",
    showPrefix: false,
  },
  chen: {
    name: "老陈",
    accent: "#F4B860",
    showPrefix: true,
  },
  girl: {
    name: "女孩",
    accent: "#8ECAE6",
    showPrefix: true,
  },
};

export type AudioLine = {
  id: string;
  /** 相对 public/ 的路径，必须带视频子目录前缀 */
  file: string;
  text: string;
  speaker: SpeakerId;
  /** 相对本镜头起点的开始秒数 */
  atSec: number;
  /** ffprobe 实测音频秒数 */
  durSec: number;
};

export type ShotTone = "night" | "glow" | "warm";
export type ShotCue =
  | "push"
  | "pull"
  | "pan-right"
  | "pan-left"
  | "grow"
  | "pulse"
  | "still";
export type ShotFx = "leaves" | "starlight" | "petals" | "mist" | "ripples" | "none";

export type Shot = {
  id: string;
  label: string;
  note: string;
  durSec: number;
  tone: ShotTone;
  cue: ShotCue;
  fx: ShotFx;
  lines: AudioLine[];
};

export const STORY_SLUG = "old-chen-music-box";
export const FPS = 30;

export const SHOTS: Shot[] = [
  {
    id: "01",
    label: "老街修理铺",
    note: "远景推进：阴雨江南老街尽头，褪色木牌与修理铺暖黄木窗内老陈的剪影",
    durSec: 14.1,
    tone: "night",
    cue: "push",
    fx: "mist",
    lines: [
      {
        id: "s01-narr",
        file: "old-chen-music-box/audio/s01-narr.mp3",
        text: "老陈的修理铺开在一条即将拆迁的老街尽头，门脸上挂着一块褪色的木牌，上面写着“专修各种不服”。",
        speaker: "narrator",
        atSec: 1.0,
        durSec: 11.952,
      },
    ],
  },
  {
    id: "02",
    label: "岁月老手艺",
    note: "室内中景：厚底老花镜、耳后铅笔、黄铜螺丝刀，身后挂钟与旧收音机",
    durSec: 26.5,
    tone: "glow",
    cue: "still",
    fx: "none",
    lines: [
      {
        id: "s02-narr",
        file: "old-chen-music-box/audio/s02-narr.mp3",
        text: "其实他修得最多的，是街坊邻里的旧收音机、老式挂钟，偶尔也有小孩摔坏的遥控汽车。老陈话少，戴着一副厚底老花镜，干活时总喜欢在耳后夹一支铅笔，手里攥着一把用了二十多年的黄铜螺丝刀。",
        speaker: "narrator",
        atSec: 0.9,
        durSec: 24.624,
      },
    ],
  },
  {
    id: "03",
    label: "雨天来客",
    note: "门口中全景：布帘掀开，穿蓝白校服的女孩怀抱塑料袋包裹的纸盒走进来",
    durSec: 16.0,
    tone: "night",
    cue: "push",
    fx: "mist",
    lines: [
      {
        id: "s03-narr",
        file: "old-chen-music-box/audio/s03-narr.mp3",
        text: "这天下午，雨下得有些闷。门帘被掀开，走进来一个穿校服的女孩，怀里抱着一个用塑料袋裹得严严实实的纸盒。",
        speaker: "narrator",
        atSec: 1.0,
        durSec: 14.04,
      },
    ],
  },
  {
    id: "04",
    label: "折翼的舞者",
    note: "桌面近景特写：剥开塑料袋，斑驳八音盒内断了一条腿的小芭蕾舞者歪倒在绒布上",
    durSec: 25.7,
    tone: "glow",
    cue: "pulse",
    fx: "none",
    lines: [
      {
        id: "s04-girl",
        file: "old-chen-music-box/audio/s04-girl.mp3",
        text: "爷爷，这个……能修吗？",
        speaker: "girl",
        atSec: 0.8,
        durSec: 3.144,
      },
      {
        id: "s04-narr",
        file: "old-chen-music-box/audio/s04-narr.mp3",
        text: "女孩把盒子放在油腻的木桌上，小心翼翼地剥开塑料袋。里面是一个老式的八音盒，漆面已经斑驳，发条拧死，里面的小芭蕾舞者断了一条腿，歪倒在绒布底座上。",
        speaker: "narrator",
        atSec: 4.44,
        durSec: 20.232,
      },
    ],
  },
  {
    id: "05",
    label: "奶奶的旧物",
    note: "中近景对话：老陈推了推老花镜查看机芯，女孩低头诉说奶奶留下的回忆",
    durSec: 36.6,
    tone: "glow",
    cue: "still",
    fx: "none",
    lines: [
      {
        id: "s05-narr",
        file: "old-chen-music-box/audio/s05-narr.mp3",
        text: "老陈推了推老花镜，拿起来凑近看了看。",
        speaker: "narrator",
        atSec: 0.8,
        durSec: 5.496,
      },
      {
        id: "s05-chen",
        file: "old-chen-music-box/audio/s05-chen.mp3",
        text: "机芯锈死了，齿轮也崩了两个牙。这玩意儿年纪比你都大，修起来费工夫，买个新的不比这强？",
        speaker: "chen",
        atSec: 6.85,
        durSec: 12.696,
      },
      {
        id: "s05-narr-2",
        file: "old-chen-music-box/audio/s05-narr-2.mp3",
        text: "女孩咬了咬嘴唇，低声说：",
        speaker: "narrator",
        atSec: 20.09,
        durSec: 3.744,
      },
      {
        id: "s05-girl",
        file: "old-chen-music-box/audio/s05-girl.mp3",
        text: "这是我奶奶留下的。以前我睡不着，她就拧这个给我听。上周我不小心从书架上碰掉了……",
        speaker: "girl",
        atSec: 24.39,
        durSec: 11.184,
      },
    ],
  },
  {
    id: "06",
    label: "铁盒与承诺",
    note: "工作台近景：摸出装满上百个废旧零件的小铁盒，低头拧开八音盒螺丝",
    durSec: 28.7,
    tone: "glow",
    cue: "push",
    fx: "starlight",
    lines: [
      {
        id: "s06-narr",
        file: "old-chen-music-box/audio/s06-narr.mp3",
        text: "老陈没再说话，只是把耳后的铅笔拿下来，在指尖转了一圈，然后伸手从工具箱最底层摸出一个装满废旧零件的小铁盒。",
        speaker: "narrator",
        atSec: 0.9,
        durSec: 14.472,
      },
      {
        id: "s06-chen",
        file: "old-chen-music-box/audio/s06-chen.mp3",
        text: "后天下午来拿吧。老物件和人一样，看着散架了，只要芯子还在，就能一点点接回来。",
        speaker: "chen",
        atSec: 15.92,
        durSec: 11.712,
      },
    ],
  },
  {
    id: "07",
    label: "雨后夕阳",
    note: "中全景横移：雨停后暖黄夕阳洒满老街与柜台，老陈轻轻拨动八音盒发条",
    durSec: 21.1,
    tone: "warm",
    cue: "pan-right",
    fx: "leaves",
    lines: [
      {
        id: "s07-narr",
        file: "old-chen-music-box/audio/s07-narr.mp3",
        text: "后天下午，雨停了，夕阳把老街的青石板路染成了暖黄色。女孩推门进来时，八音盒正安静地摆在柜台最干净的一角。老陈伸手轻轻拨动了一下发条。",
        speaker: "narrator",
        atSec: 1.0,
        durSec: 19.056,
      },
    ],
  },
  {
    id: "08",
    label: "银色勋章",
    note: "微距特写：清脆《致爱丽丝》流淌，小芭蕾舞者重新直立旋转，裙摆下留下一道细微银色焊痕",
    durSec: 27.4,
    tone: "warm",
    cue: "grow",
    fx: "starlight",
    lines: [
      {
        id: "s08-narr",
        file: "old-chen-music-box/audio/s08-narr.mp3",
        text: "叮，咚，叮。清脆的《致爱丽丝》在狭小的铺子里流淌开来。小芭蕾舞者重新立了起来，随着音乐缓缓旋转，断掉的那条腿被接得严丝合缝，只在裙摆阴影处留下一道极细的银色焊痕，像是一枚小小的勋章。",
        speaker: "narrator",
        atSec: 0.9,
        durSec: 25.32,
      },
    ],
  },
  {
    id: "09",
    label: "五块手工费",
    note: "中近景：女孩眼睛发亮递过零花钱，老陈温和摆手只收下一张五块",
    durSec: 17.4,
    tone: "warm",
    cue: "still",
    fx: "petals",
    lines: [
      {
        id: "s09-narr",
        file: "old-chen-music-box/audio/s09-narr.mp3",
        text: "女孩眼睛亮了起来，掏出攒了很久的零花钱递过去。老陈摆摆手，只拿了一张五块的。",
        speaker: "narrator",
        atSec: 0.8,
        durSec: 10.8,
      },
      {
        id: "s09-chen",
        file: "old-chen-music-box/audio/s09-chen.mp3",
        text: "收个手工费，剩下的买糖吃。",
        speaker: "chen",
        atSec: 12.1,
        durSec: 4.272,
      },
    ],
  },
  {
    id: "10",
    label: "余音与新址",
    note: "远景拉远：女孩抱着八音盒跑进夕阳，老陈擦了擦老花镜，把门口木牌翻面写下新址",
    durSec: 27.1,
    tone: "warm",
    cue: "pull",
    fx: "leaves",
    lines: [
      {
        id: "s10-narr",
        file: "old-chen-music-box/audio/s10-narr.mp3",
        text: "女孩抱着八音盒跑进夕阳里，清脆的琴声一路洒在老街的风中。老陈站在门口，摘下老花镜擦了擦，转身回到屋里，把木牌翻了个面，上面用粉笔新写了一行字：“下周搬迁，新址在街口第三家。”",
        speaker: "narrator",
        atSec: 1.0,
        durSec: 24.264,
      },
    ],
  },
];

export type ShotTiming = Shot & {
  fromFrame: number;
  durationInFrames: number;
};

export const TIMELINE: ShotTiming[] = SHOTS.reduce<ShotTiming[]>((acc, shot) => {
  const prev = acc[acc.length - 1];
  const fromFrame = prev ? prev.fromFrame + prev.durationInFrames : 0;
  acc.push({
    ...shot,
    fromFrame,
    durationInFrames: Math.max(1, Math.round(shot.durSec * FPS)),
  });
  return acc;
}, []);

export const TOTAL_FRAMES = Math.max(
  1,
  TIMELINE.reduce((sum, s) => sum + s.durationInFrames, 0),
);
