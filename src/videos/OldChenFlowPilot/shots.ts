import { staticFile } from "remotion";
import {
  DEFAULT_FLOW_FPS,
  SpeakerMeta,
  StoryProjectConfig,
  StoryShot,
  buildStoryTimeline,
} from "../../engine";

export const PILOT_FPS = DEFAULT_FLOW_FPS;
export const PILOT_SLUG = "old-chen-flow-pilot";

/**
 * 显式声明当前已落盘的静态资产引用，便于 scripts/check-assets.py 进行完整性与零孤儿校验。
 * 待 Google Flow 真视频回传入库后，StoryTimelinePlayer (mode: "auto") 会自动无感接管播放。
 */
export const PILOT_STATIC_ASSETS = [
  staticFile("old-chen-flow-pilot/images/shot-01-start.webp"),
  staticFile("old-chen-flow-pilot/images/shot-01-end.webp"),
  staticFile("old-chen-flow-pilot/images/shot-02-start.webp"),
  staticFile("old-chen-flow-pilot/images/shot-02-end.webp"),
  staticFile("old-chen-flow-pilot/images/shot-03-start.webp"),
  staticFile("old-chen-flow-pilot/images/shot-03-end.webp"),
  staticFile("old-chen-flow-pilot/audio/p01-narr.mp3"),
  staticFile("old-chen-flow-pilot/audio/p02-girl.mp3"),
  staticFile("old-chen-flow-pilot/audio/p03-chen.mp3"),
] as const;

export const PILOT_SPEAKERS: Record<string, SpeakerMeta> = {
  narrator: {
    name: "旁白",
    accent: "rgba(255, 248, 231, 0.45)",
    showPrefix: false,
  },
  girl: {
    name: "女孩",
    accent: "#8ECAE6",
    showPrefix: true,
  },
  chen: {
    name: "老陈",
    accent: "#F4B860",
    showPrefix: true,
  },
};

const GIRL_LINE_ENVELOPE = [
  0.0, 0.002, 0.433, 0.876, 1.0, 0.929, 0.673, 0.58, 0.678, 0.705, 0.67, 0.708,
  0.671, 0.466, 0.184, 0.019, 0.001, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.001, 0.012,
  0.657, 1.0, 0.667, 0.127, 0.585, 1.0, 0.335, 0.016, 0.653, 0.776, 0.587,
  0.542, 0.068, 0.55, 0.688, 0.544, 0.581, 0.438, 0.511, 0.396, 0.268, 0.247,
  0.238, 0.063, 0.012, 0.014, 0.107, 0.483, 0.481, 0.463, 0.491, 0.519, 0.337,
  0.152, 0.001, 0.001, 0.0, 0.0, 0.0, 0.0, 0.0, 0.003, 0.017, 0.325, 0.719,
  0.567, 0.58, 0.651, 0.781, 0.636, 0.388, 0.027, 0.014, 0.502, 0.901, 0.793,
  0.747, 0.25, 0.034, 0.027, 0.261, 0.634, 0.563, 0.402, 0.227, 0.229, 0.42,
  0.554, 0.534, 0.482, 0.318, 0.111, 0.002, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  0.0, 0.0,
];

const CHEN_LINE_ENVELOPE = [
  0.0, 0.001, 0.055, 0.806, 0.811, 0.893, 0.62, 0.1, 0.311, 1.0, 1.0, 1.0,
  0.697, 0.289, 0.007, 0.018, 0.514, 0.739, 0.664, 0.629, 0.548, 0.258, 0.009,
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.001, 0.369, 0.72, 0.77,
  0.823, 0.589, 0.125, 0.213, 0.842, 1.0, 1.0, 0.946, 0.713, 0.481, 0.674, 1.0,
  0.915, 0.771, 0.597, 0.384, 0.244, 0.012, 0.001, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  0.0, 0.088, 0.711, 0.949, 0.933, 0.477, 0.039, 0.425, 0.53, 0.563, 0.568,
  0.442, 0.522, 0.569, 0.53, 0.436, 0.012, 0.007, 0.351, 0.803, 0.584, 0.087,
  0.012, 0.188, 0.934, 0.794, 0.054, 0.026, 0.031, 0.419, 0.768, 0.953, 0.751,
  0.45, 0.015, 0.031, 0.029, 0.579, 1.0, 0.742, 0.756, 0.67, 0.367, 0.137,
  0.003, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
];

export const PILOT_SHOTS: StoryShot[] = [
  {
    id: "01",
    label: "推门进店",
    note: "中远景锁机位：女孩从微雨青石板巷口掀帘跨入暖黄修理铺停在柜台前",
    durSec: 7.2,
    tone: "night",
    cue: "push",
    fx: "mist",
    mode: "auto",
    transitionIn: "dip-to-black",
    transitionFrames: 8,
    clip: {
      src: "old-chen-flow-pilot/video/shot-01.mp4",
      sourceDurSec: 8.0,
      keepAmbientAudio: true,
      ambientVolume: 0.34,
      duckedAmbientVolume: 0.12,
    },
    animatic: {
      startSrc: "old-chen-flow-pilot/images/shot-01-start.webp",
      endSrc: "old-chen-flow-pilot/images/shot-01-end.webp",
      crossfadeStartRatio: 0.48,
    },
    lines: [
      {
        id: "p01-narr",
        speaker: "narrator",
        text: "雨天傍晚，女孩掀开门帘，抱紧木盒走进店里。",
        file: "old-chen-flow-pilot/audio/p01-narr.mp3",
        atSec: 0.5,
        durSec: 6.12,
      },
    ],
  },
  {
    id: "02",
    label: "递出八音盒",
    note: "近景面朝右（正打）：女孩双手轻放胡桃木八音盒到柜台，抬头期盼询问",
    durSec: 6.5,
    tone: "glow",
    cue: "still",
    fx: "none",
    mode: "auto",
    transitionIn: "dissolve",
    transitionFrames: 6,
    clip: {
      src: "old-chen-flow-pilot/video/shot-02.mp4",
      sourceDurSec: 8.0,
      keepAmbientAudio: false,
    },
    animatic: {
      startSrc: "old-chen-flow-pilot/images/shot-02-start.webp",
      endSrc: "old-chen-flow-pilot/images/shot-02-end.webp",
      crossfadeStartRatio: 0.42,
    },
    lines: [
      {
        id: "p02-girl",
        speaker: "girl",
        text: "爷爷，这个旧八音盒，还能修好吗？",
        file: "old-chen-flow-pilot/audio/p02-girl.mp3",
        atSec: 1.1,
        durSec: 4.488,
        envelope: GIRL_LINE_ENVELOPE,
        envelopeFps: 24,
      },
    ],
  },
  {
    id: "03",
    label: "老陈应允",
    note: "近景面朝左（180度反打）：老陈放下黄铜螺丝刀，抬头轻扶圆框眼镜温和应允",
    durSec: 7.0,
    tone: "warm",
    cue: "still",
    fx: "starlight",
    mode: "auto",
    transitionIn: "dissolve",
    transitionFrames: 6,
    clip: {
      src: "old-chen-flow-pilot/video/shot-03.mp4",
      sourceDurSec: 8.0,
      keepAmbientAudio: false,
    },
    animatic: {
      startSrc: "old-chen-flow-pilot/images/shot-03-start.webp",
      endSrc: "old-chen-flow-pilot/images/shot-03-end.webp",
      crossfadeStartRatio: 0.42,
    },
    lines: [
      {
        id: "p03-chen",
        speaker: "chen",
        text: "别着急，拿过来，我给你仔细瞧瞧。",
        file: "old-chen-flow-pilot/audio/p03-chen.mp3",
        atSec: 1.2,
        durSec: 4.872,
        envelope: CHEN_LINE_ENVELOPE,
        envelopeFps: 24,
      },
    ],
  },
];

export const PILOT_PROJECT_CONFIG: StoryProjectConfig = {
  storySlug: PILOT_SLUG,
  fps: PILOT_FPS,
  speakers: PILOT_SPEAKERS,
  shots: PILOT_SHOTS,
  showShotHud: false,
  showAnimaticBadge: true,
};

export const { timeline: PILOT_TIMELINE, totalFrames: PILOT_TOTAL_FRAMES } =
  buildStoryTimeline(PILOT_SHOTS, PILOT_FPS);
