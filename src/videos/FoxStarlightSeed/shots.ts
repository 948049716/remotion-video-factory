/**
 * 《小狐狸找到发光种子》镜头数据 —— 动态分镜（animatic）的唯一数据源。
 *
 * 修改节奏只需要改这里的 durSec / atSec，不必动组件。
 * 音频时长来自 ffprobe 实测（2026-11-12，临时试音版本）。
 */

export type Speaker = "narrator" | "fox";

export type AudioLine = {
  id: string;
  /** 相对 public/ 的路径，必须带视频子目录前缀 */
  file: string;
  /** 字幕文本 */
  text: string;
  speaker: Speaker;
  /** 相对本镜头起点的开始秒数 */
  atSec: number;
  /** 实测音频时长（秒） */
  durSec: number;
};

export type ShotTone = "night" | "glow" | "warm";

export type ShotCue = "push" | "pull" | "still" | "grow" | "pulse";

export type Shot = {
  id: string;
  label: string;
  /** 分镜阶段给绘制用的构图提示 */
  note: string;
  durSec: number;
  tone: ShotTone;
  cue: ShotCue;
  lines: AudioLine[];
};

const AUDIO_DIR = "fox-starlight-seed/audio/temp";

export const SHOTS: Shot[] = [
  {
    id: "01",
    label: "秋夜森林",
    note: "远景推进：森林纵深与薄雾，狐狸在落叶间低头嗅闻，约画面高度 1/5",
    durSec: 9.3,
    tone: "night",
    cue: "push",
    lines: [
      {
        id: "s01-narr",
        file: `${AUDIO_DIR}/s01-narr.mp3`,
        text: "秋夜，微风穿过森林。小狐狸阿狸还在落叶里寻找野山栗。",
        speaker: "narrator",
        atSec: 1.0,
        durSec: 7.272,
      },
    ],
  },
  {
    id: "02",
    label: "树根微光",
    note: "中近景：树根凹陷处透出一线蓝金光，狐狸只入画鼻尖、胡须与前爪",
    durSec: 7.3,
    tone: "glow",
    cue: "pulse",
    lines: [
      {
        id: "s02-narr",
        file: `${AUDIO_DIR}/s02-narr.mp3`,
        text: "忽然，古橡树的根下，有一点光，轻轻闪了一下。",
        speaker: "narrator",
        atSec: 1.2,
        durSec: 5.256,
      },
    ],
  },
  {
    id: "03",
    label: "好奇靠近",
    note: "中景：狐狸低头、抬前爪望向种子，古树根在右，已确认构图",
    durSec: 5.6,
    tone: "glow",
    cue: "still",
    lines: [
      {
        id: "s03-fox",
        file: `${AUDIO_DIR}/s03-fox.mp3`,
        text: "咦？你怎么在这里？",
        speaker: "fox",
        atSec: 1.5,
        durSec: 3.12,
      },
    ],
  },
  {
    id: "04",
    label: "种子特写",
    note: "微距：种子占画面 1/4～1/3，内部星云缓慢旋转，光一明一暗",
    durSec: 10.6,
    tone: "glow",
    cue: "pulse",
    lines: [
      {
        id: "s04-narr",
        file: `${AUDIO_DIR}/s04-narr.mp3`,
        text: "那是一颗小小的种子，里面像藏着星星。蓝金色的光，一明一暗，仿佛正在呼吸。",
        speaker: "narrator",
        atSec: 0.8,
        durSec: 8.64,
      },
    ],
  },
  {
    id: "05",
    label: "森林苏醒",
    note: "中景：坐姿双爪捧种子，周围苔藓转绿、花苞绽开",
    durSec: 9.5,
    tone: "warm",
    cue: "grow",
    lines: [
      {
        id: "s05-narr",
        file: `${AUDIO_DIR}/s05-narr.mp3`,
        text: "阿狸小心地捧起它。光照过的地方，苔藓绿了，花苞也悄悄打开了。",
        speaker: "narrator",
        atSec: 1.0,
        durSec: 7.272,
      },
    ],
  },
  {
    id: "06",
    label: "夜莺落肩",
    note: "中景：夜莺落在右肩，狐狸侧目，一只前爪托着种子靠近胸口",
    durSec: 8.8,
    tone: "warm",
    cue: "still",
    lines: [
      {
        id: "s06-narr",
        file: `${AUDIO_DIR}/s06-narr.mp3`,
        text: "一只夜莺落在他的肩上。一股暖意，也悄悄钻进了他的心里。",
        speaker: "narrator",
        atSec: 1.0,
        durSec: 6.792,
      },
    ],
  },
  {
    id: "07",
    label: "作出决定",
    note: "中景偏全景：望向暗处森林，低头看种子，抬眼——全片第一个转折",
    durSec: 9.1,
    tone: "night",
    cue: "push",
    lines: [
      {
        id: "s07-narr",
        file: `${AUDIO_DIR}/s07-narr.mp3`,
        text: "冬天就要来了。阿狸忽然有了一个念头。",
        speaker: "narrator",
        atSec: 0.8,
        durSec: 4.464,
      },
      {
        id: "s07-fox",
        file: `${AUDIO_DIR}/s07-fox.mp3`,
        text: "我给你找个家吧。",
        speaker: "fox",
        atSec: 5.76,
        durSec: 2.304,
      },
    ],
  },
  {
    id: "08",
    label: "月光引路",
    note: "中全景：夜莺前飞引路，狐狸跟随，斜向小径通往远处月光",
    durSec: 6.5,
    tone: "night",
    cue: "push",
    lines: [
      {
        id: "s08-narr",
        file: `${AUDIO_DIR}/s08-narr.mp3`,
        text: "他跟着夜莺，来到森林高处的月光林地。",
        speaker: "narrator",
        atSec: 1.0,
        durSec: 4.32,
      },
    ],
  },
  {
    id: "09",
    label: "轻轻种下",
    note: "俯视近景：两前爪从画面上方伸入，坑已成形，种子放入",
    durSec: 12.6,
    tone: "glow",
    cue: "still",
    lines: [
      {
        id: "s09-narr",
        file: `${AUDIO_DIR}/s09-narr.mp3`,
        text: "阿狸刨开松软的泥土，轻轻放下种子，再一点一点，把土盖好。",
        speaker: "narrator",
        atSec: 1.2,
        durSec: 6.768,
      },
      {
        id: "s09-fox",
        file: `${AUDIO_DIR}/s09-fox.mp3`,
        text: "在这里，暖暖地长大吧。",
        speaker: "fox",
        atSec: 8.37,
        durSec: 3.192,
      },
    ],
  },
  {
    id: "10",
    label: "星光树生长",
    note: "中景：金色涟漪扩散，嫩芽破土，长成一人高的小树，叶片亮起星光",
    durSec: 13.6,
    tone: "warm",
    cue: "grow",
    lines: [
      {
        id: "s10-narr",
        file: `${AUDIO_DIR}/s10-narr.mp3`,
        text: "忽然，金色的涟漪漫过地面。嫩芽探出头，长成了一棵小树。每一片叶子，都亮起了温柔的星光。",
        speaker: "narrator",
        atSec: 1.5,
        durSec: 10.608,
      },
    ],
  },
  {
    id: "11",
    label: "林地变暖",
    note: "全景：暖光铺开成一片区域，雾气退远，狐狸坐在树旁偏左",
    durSec: 7.4,
    tone: "warm",
    cue: "pull",
    lines: [
      {
        id: "s11-narr",
        file: `${AUDIO_DIR}/s11-narr.mp3`,
        text: "暖意散进林间。这个冬天，森林不会那么冷了。",
        speaker: "narrator",
        atSec: 1.0,
        durSec: 5.424,
      },
    ],
  },
  {
    id: "12",
    label: "树下入眠",
    note: "中景：蜷卧，大尾巴盖住鼻尖，闭眼，镜头缓慢拉远",
    durSec: 9.6,
    tone: "warm",
    cue: "pull",
    lines: [
      {
        id: "s12-narr",
        file: `${AUDIO_DIR}/s12-narr.mp3`,
        text: "阿狸蜷在树下，用尾巴盖住鼻尖，做了一个暖暖的梦。",
        speaker: "narrator",
        atSec: 1.2,
        durSec: 5.448,
      },
    ],
  },
];

export const FPS = 30;

export type ShotTiming = Shot & {
  fromFrame: number;
  durationInFrames: number;
};

/** 按 durSec 依次累加，得到每个镜头的起始帧，避免手算出错。 */
export const TIMELINE: ShotTiming[] = SHOTS.reduce<ShotTiming[]>(
  (acc, shot) => {
    const prev = acc[acc.length - 1];
    const fromFrame = prev ? prev.fromFrame + prev.durationInFrames : 0;
    acc.push({
      ...shot,
      fromFrame,
      durationInFrames: Math.round(shot.durSec * FPS),
    });
    return acc;
  },
  [],
);

export const TOTAL_FRAMES = TIMELINE.reduce(
  (sum, s) => sum + s.durationInFrames,
  0,
);
