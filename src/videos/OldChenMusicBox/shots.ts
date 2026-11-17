/**
 * 《老陈的修理铺与八音盒》镜头、2D 分层关节与配音单一数据源（Single Source of Truth）
 *
 * 采用「混合 2D 分层动画（Hybrid 2D Layered Animation）」：
 *   - 保留 100% 稳定柔和的手绘水彩绘本笔触
 *   - 驱动环境摇曳、视差景深、角色呼吸/劳作摆臂、语音同步说话微动与八音盒舞者旋转
 * 所有音频时长 durSec 均来自 ffprobe 实测，TIMELINE 自动累加计算帧号。
 */

import type React from "react";

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

export type LayerMotion =
  | "static"
  | "breathe"
  | "swing"
  | "sway"
  | "nod"
  | "talk"
  | "spin-y"
  | "rotate"
  | "float"
  | "glow-pulse";

export type LayerSpec = {
  id: string;
  src: string;
  zIndex?: number;
  origin?: [number, number];
  parallax?: number;
  motion?: LayerMotion;
  amplitude?: number;
  speed?: number;
  phase?: number;
  activeSpeaker?: SpeakerId;
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
};

export type Shot = {
  id: string;
  label: string;
  note: string;
  durSec: number;
  tone: ShotTone;
  cue: ShotCue;
  fx: ShotFx;
  layers?: LayerSpec[];
  lines: AudioLine[];
};

export const STORY_SLUG = "old-chen-music-box";
export const FPS = 30;

export const SHOTS: Shot[] = [
  {
    id: "01",
    label: "老街修理铺",
    note: "Tier A 视差远景推进：褪色木牌在微风细雨中轻摆，暖黄木窗内老陈伏案呼吸",
    durSec: 14.1,
    tone: "night",
    cue: "push",
    fx: "mist",
    layers: [
      {
        id: "bg",
        src: "old-chen-music-box/images/layers/shot-01/bg.webp",
        zIndex: 1,
        parallax: 1.0,
        motion: "static",
      },
      {
        id: "chen-window",
        src: "old-chen-music-box/images/layers/shot-01/chen-window.webp",
        zIndex: 2,
        origin: [76.0, 63.8],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.75,
        speed: 0.9,
      },
      {
        id: "sign",
        src: "old-chen-music-box/images/layers/shot-01/sign.webp",
        zIndex: 4,
        origin: [47.8, 21.8],
        parallax: 1.08,
        motion: "sway",
        amplitude: 0.85,
        speed: 0.95,
      },
      {
        id: "window-glow",
        src: "old-chen-music-box/images/layers/shot-01/window-glow.webp",
        zIndex: 5,
        origin: [75.5, 50.0],
        parallax: 1.02,
        motion: "glow-pulse",
        opacity: 0.55,
        blendMode: "screen",
      },
    ],
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
    note: "Tier B 完整角色关节中景：双钟摆规律摇曳，老陈俯身呼吸、微点头、手臂持螺丝刀劳作",
    durSec: 26.5,
    tone: "glow",
    cue: "still",
    fx: "none",
    layers: [
      {
        id: "bg",
        src: "old-chen-music-box/images/layers/shot-02/bg.webp",
        zIndex: 1,
        parallax: 1.0,
        motion: "static",
      },
      {
        id: "pendulum-1",
        src: "old-chen-music-box/images/layers/shot-02/pendulum-1.webp",
        zIndex: 2,
        origin: [16.0, 12.0],
        parallax: 1.0,
        motion: "swing",
        amplitude: 1.15,
        speed: 0.9,
      },
      {
        id: "pendulum-2",
        src: "old-chen-music-box/images/layers/shot-02/pendulum-2.webp",
        zIndex: 2,
        origin: [30.4, 12.0],
        parallax: 1.0,
        motion: "swing",
        amplitude: 1.05,
        speed: 1.15,
        phase: 0.7,
      },
      {
        id: "chen-body",
        src: "old-chen-music-box/images/layers/shot-02/chen-body.webp",
        zIndex: 3,
        origin: [38.0, 92.0],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.9,
      },
      {
        id: "chen-head",
        src: "old-chen-music-box/images/layers/shot-02/chen-head.webp",
        zIndex: 5,
        origin: [45.5, 34.0],
        parallax: 1.0,
        motion: "nod",
        amplitude: 0.75,
        speed: 0.85,
      },
      {
        id: "chen-arm",
        src: "old-chen-music-box/images/layers/shot-02/chen-arm.webp",
        zIndex: 6,
        origin: [44.5, 61.5],
        parallax: 1.0,
        motion: "swing",
        amplitude: 0.55,
        speed: 0.85,
      },
      {
        id: "lamp-glow",
        src: "old-chen-music-box/images/layers/shot-02/lamp-glow.webp",
        zIndex: 7,
        origin: [72.5, 35.0],
        parallax: 1.02,
        motion: "glow-pulse",
        opacity: 0.52,
        blendMode: "screen",
      },
    ],
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
    note: "Tier B 门口中全景：雨水细雾中木牌与白布门帘轻摇，怀抱纸盒的女孩站定微喘",
    durSec: 16.0,
    tone: "night",
    cue: "push",
    fx: "mist",
    layers: [
      {
        id: "bg",
        src: "old-chen-music-box/images/layers/shot-03/bg.webp",
        zIndex: 1,
        parallax: 1.0,
        motion: "static",
      },
      {
        id: "curtain",
        src: "old-chen-music-box/images/layers/shot-03/curtain.webp",
        zIndex: 2,
        origin: [66.0, 2.0],
        parallax: 1.02,
        motion: "sway",
        amplitude: 0.5,
        speed: 0.9,
      },
      {
        id: "girl-body",
        src: "old-chen-music-box/images/layers/shot-03/girl-body.webp",
        zIndex: 3,
        origin: [41.5, 92.0],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.85,
      },
      {
        id: "girl-head",
        src: "old-chen-music-box/images/layers/shot-03/girl-head.webp",
        zIndex: 5,
        origin: [43.0, 48.5],
        parallax: 1.0,
        motion: "nod",
        amplitude: 0.75,
        speed: 0.9,
      },
      {
        id: "sign",
        src: "old-chen-music-box/images/layers/shot-03/sign.webp",
        zIndex: 6,
        origin: [43.6, 20.5],
        parallax: 1.07,
        motion: "sway",
        amplitude: 0.8,
        phase: 0.4,
      },
    ],
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
    note: "Tier B 近景交互：女孩轻轻开口询问“爷爷，这个……能修吗？”，语音同步触发抬头说话微动",
    durSec: 25.7,
    tone: "glow",
    cue: "pulse",
    fx: "none",
    layers: [
      {
        id: "bg",
        src: "old-chen-music-box/images/layers/shot-04/bg.webp",
        zIndex: 1,
        parallax: 1.0,
        motion: "static",
      },
      {
        id: "curtain",
        src: "old-chen-music-box/images/layers/shot-04/curtain.webp",
        zIndex: 2,
        origin: [62.11, -36.77],
        parallax: 1.01,
        motion: "sway",
        amplitude: 0.45,
        speed: 0.85,
      },
      {
        id: "girl-body",
        src: "old-chen-music-box/images/layers/shot-04/girl-body.webp",
        zIndex: 3,
        origin: [25.87, 96.38],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.9,
      },
      {
        id: "girl-head",
        src: "old-chen-music-box/images/layers/shot-04/girl-head.webp",
        zIndex: 5,
        origin: [28.09, 32.03],
        parallax: 1.0,
        motion: "talk",
        activeSpeaker: "girl",
        amplitude: 1.1,
      },
      {
        id: "warm-glow",
        src: "old-chen-music-box/images/layers/shot-04/warm-glow.webp",
        zIndex: 7,
        origin: [82.0, 38.0],
        parallax: 1.02,
        motion: "glow-pulse",
        opacity: 0.5,
        blendMode: "screen",
      },
    ],
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
    note: "Tier B 对话特写：老陈发言期间触发语音同步说话律动，停顿和倾听时恢复待机微喘",
    durSec: 36.6,
    tone: "glow",
    cue: "still",
    fx: "none",
    layers: [
      {
        id: "bg",
        src: "old-chen-music-box/images/layers/shot-05/bg.webp",
        zIndex: 1,
        parallax: 1.0,
        motion: "static",
      },
      {
        id: "pendulum-2",
        src: "old-chen-music-box/images/layers/shot-05/pendulum-2.webp",
        zIndex: 2,
        origin: [19.21, 7.61],
        parallax: 1.0,
        motion: "swing",
        amplitude: 0.95,
        speed: 1.1,
      },
      {
        id: "chen-body",
        src: "old-chen-music-box/images/layers/shot-05/chen-body.webp",
        zIndex: 3,
        origin: [31.8, 133.5],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.85,
      },
      {
        id: "chen-head",
        src: "old-chen-music-box/images/layers/shot-05/chen-head.webp",
        zIndex: 5,
        origin: [44.23, 44.05],
        parallax: 1.0,
        motion: "talk",
        activeSpeaker: "chen",
        amplitude: 1.1,
      },
      {
        id: "chen-arm",
        src: "old-chen-music-box/images/layers/shot-05/chen-arm.webp",
        zIndex: 6,
        origin: [42.57, 89.6],
        parallax: 1.0,
        motion: "swing",
        amplitude: 0.45,
        speed: 0.8,
      },
      {
        id: "lamp-glow",
        src: "old-chen-music-box/images/layers/shot-05/lamp-glow.webp",
        zIndex: 7,
        origin: [72.5, 35.0],
        parallax: 1.02,
        motion: "glow-pulse",
        opacity: 0.48,
        blendMode: "screen",
      },
    ],
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
    note: "Tier B 工作台手部近景：手臂执黄铜螺丝刀细腻拧动，绿台灯微光呼吸，星光粒子浮动",
    durSec: 28.7,
    tone: "glow",
    cue: "push",
    fx: "starlight",
    layers: [
      {
        id: "bg",
        src: "old-chen-music-box/images/layers/shot-06/bg.webp",
        zIndex: 1,
        parallax: 1.0,
        motion: "static",
      },
      {
        id: "chen-body",
        src: "old-chen-music-box/images/layers/shot-06/chen-body.webp",
        zIndex: 3,
        origin: [-12.35, 87.14],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.8,
      },
      {
        id: "chen-arm",
        src: "old-chen-music-box/images/layers/shot-06/chen-arm.webp",
        zIndex: 5,
        origin: [-0.53, 31.68],
        parallax: 1.0,
        motion: "swing",
        amplitude: 0.65,
        speed: 0.95,
      },
      {
        id: "lamp-glow",
        src: "old-chen-music-box/images/layers/shot-06/lamp-glow.webp",
        zIndex: 6,
        origin: [40.0, 20.0],
        parallax: 1.02,
        motion: "glow-pulse",
        opacity: 0.5,
        blendMode: "screen",
      },
    ],
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
    note: "Tier B 暖金夕阳横移：女孩微点头呼应暖光落叶，门帘与褪色木牌沐浴在金色暮风中",
    durSec: 21.1,
    tone: "warm",
    cue: "pan-right",
    fx: "leaves",
    layers: [
      {
        id: "bg",
        src: "old-chen-music-box/images/layers/shot-07/bg.webp",
        zIndex: 1,
        parallax: 1.0,
        motion: "static",
      },
      {
        id: "curtain",
        src: "old-chen-music-box/images/layers/shot-07/curtain.webp",
        zIndex: 2,
        origin: [66.0, 2.0],
        parallax: 1.02,
        motion: "sway",
        amplitude: 0.55,
        speed: 0.85,
      },
      {
        id: "girl-body",
        src: "old-chen-music-box/images/layers/shot-07/girl-body.webp",
        zIndex: 3,
        origin: [41.5, 92.0],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.85,
      },
      {
        id: "girl-head",
        src: "old-chen-music-box/images/layers/shot-07/girl-head.webp",
        zIndex: 5,
        origin: [43.0, 48.5],
        parallax: 1.0,
        motion: "nod",
        amplitude: 0.85,
      },
      {
        id: "sign",
        src: "old-chen-music-box/images/layers/shot-07/sign.webp",
        zIndex: 6,
        origin: [43.6, 20.5],
        parallax: 1.06,
        motion: "sway",
        amplitude: 0.85,
        phase: 0.5,
      },
      {
        id: "lamp-glow",
        src: "old-chen-music-box/images/layers/shot-07/lamp-glow.webp",
        zIndex: 7,
        origin: [82.5, 16.0],
        parallax: 1.02,
        motion: "glow-pulse",
        opacity: 0.5,
        blendMode: "screen",
      },
    ],
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
    note: "Tier B 道具高潮动画：浅景深老陈背景虚化，手绘胡桃木八音盒内陶瓷芭蕾舞者优雅 360° 原地连续旋转",
    durSec: 27.4,
    tone: "warm",
    cue: "grow",
    fx: "starlight",
    layers: [
      {
        id: "bg",
        src: "old-chen-music-box/images/layers/shot-08/bg.webp",
        zIndex: 1,
        parallax: 0.92,
        motion: "static",
      },
      {
        id: "music-box",
        src: "old-chen-music-box/images/layers/shot-08/music-box.webp",
        zIndex: 2,
        origin: [50.0, 74.0],
        parallax: 1.05,
        motion: "breathe",
        amplitude: 0.35,
        speed: 0.7,
      },
      {
        id: "ballerina",
        src: "old-chen-music-box/images/layers/shot-08/ballerina.webp",
        zIndex: 4,
        origin: [50.0, 57.2],
        parallax: 1.05,
        motion: "spin-y",
        speed: 1.0,
        amplitude: 1.0,
      },
      {
        id: "box-glow",
        src: "old-chen-music-box/images/layers/shot-08/box-glow.webp",
        zIndex: 6,
        origin: [50.0, 44.0],
        parallax: 1.05,
        motion: "glow-pulse",
        opacity: 0.6,
        blendMode: "screen",
      },
    ],
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
    note: "Tier B 暖光近景：女孩开心点头微笑，吊灯暖光晕染、花瓣飘落",
    durSec: 17.4,
    tone: "warm",
    cue: "still",
    fx: "petals",
    layers: [
      {
        id: "bg",
        src: "old-chen-music-box/images/layers/shot-09/bg.webp",
        zIndex: 1,
        parallax: 1.0,
        motion: "static",
      },
      {
        id: "curtain",
        src: "old-chen-music-box/images/layers/shot-09/curtain.webp",
        zIndex: 2,
        origin: [82.27, -20.5],
        parallax: 1.01,
        motion: "sway",
        amplitude: 0.45,
        speed: 0.85,
      },
      {
        id: "girl-body",
        src: "old-chen-music-box/images/layers/shot-09/girl-body.webp",
        zIndex: 3,
        origin: [43.07, 123.5],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.9,
      },
      {
        id: "girl-head",
        src: "old-chen-music-box/images/layers/shot-09/girl-head.webp",
        zIndex: 5,
        origin: [45.47, 53.9],
        parallax: 1.0,
        motion: "nod",
        amplitude: 1.05,
        speed: 1.0,
      },
      {
        id: "sign",
        src: "old-chen-music-box/images/layers/shot-09/sign.webp",
        zIndex: 6,
        origin: [46.43, 9.1],
        parallax: 1.05,
        motion: "sway",
        amplitude: 0.65,
      },
      {
        id: "lamp-glow",
        src: "old-chen-music-box/images/layers/shot-09/lamp-glow.webp",
        zIndex: 7,
        origin: [82.0, 16.0],
        parallax: 1.02,
        motion: "glow-pulse",
        opacity: 0.52,
        blendMode: "screen",
      },
    ],
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
    note: "Tier A 暮色远景拉远：褪色木牌轻摇、老陈在暖黄木窗内静立呼吸，金叶飘舞收束全篇",
    durSec: 27.1,
    tone: "warm",
    cue: "pull",
    fx: "leaves",
    layers: [
      {
        id: "bg",
        src: "old-chen-music-box/images/layers/shot-10/bg.webp",
        zIndex: 1,
        parallax: 1.0,
        motion: "static",
      },
      {
        id: "chen-window",
        src: "old-chen-music-box/images/layers/shot-10/chen-window.webp",
        zIndex: 2,
        origin: [76.0, 63.8],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.75,
        speed: 0.9,
      },
      {
        id: "sign",
        src: "old-chen-music-box/images/layers/shot-10/sign.webp",
        zIndex: 4,
        origin: [47.8, 21.8],
        parallax: 1.08,
        motion: "sway",
        amplitude: 0.85,
      },
      {
        id: "window-glow",
        src: "old-chen-music-box/images/layers/shot-10/window-glow.webp",
        zIndex: 5,
        origin: [75.5, 50.0],
        parallax: 1.02,
        motion: "glow-pulse",
        opacity: 0.6,
        blendMode: "screen",
      },
    ],
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
