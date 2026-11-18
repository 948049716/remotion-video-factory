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
 * 显式声明全部已落盘静态资产引用，确保 scripts/check-assets.py 完整性与零孤儿校验通过。
 */
export const PILOT_STATIC_ASSETS = [
  staticFile("old-chen-flow-pilot/images/shot-01-start.webp"),
  staticFile("old-chen-flow-pilot/images/shot-01-end.webp"),
  staticFile("old-chen-flow-pilot/images/shot-02-start.webp"),
  staticFile("old-chen-flow-pilot/images/shot-02-end.webp"),
  staticFile("old-chen-flow-pilot/images/shot-03-start.webp"),
  staticFile("old-chen-flow-pilot/images/shot-03-end.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s01/bg.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s01/lamp-glow.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s01/curtain.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s01/visitor-walk-1.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s01/visitor-walk-2.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s01/visitor-walk-3.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s01/visitor-stand.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s01/counter-fg.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/bg.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/pendulum-left.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/pendulum-right.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/lamp-glow.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/music-box.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/visitor-body.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/visitor-head-closed.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/visitor-head-half.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/visitor-head-open.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/visitor-eyes-open.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/visitor-eyes-closed.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s02/counter-fg.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/bg.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/pendulum.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/lamp-glow.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/chen-body.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/chen-arm.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/chen-head-closed.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/chen-head-half.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/chen-head-open.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/chen-eyes-open.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/chen-eyes-closed.webp"),
  staticFile("old-chen-flow-pilot/images/layers/s03/bench-fg.webp"),
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

const VISITOR_LINE_ENVELOPE = [
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
    note: "2D 逐帧行走序列 + 门帘摆动：角色从微雨青石板巷口跨过门槛停在柜台前",
    durSec: 7.2,
    tone: "night",
    cue: "push",
    fx: "mist",
    mode: "layered-2d",
    transitionIn: "dip-to-black",
    transitionFrames: 8,
    layers: [
      {
        id: "s01-bg",
        src: "old-chen-flow-pilot/images/layers/s01/bg.webp",
        zIndex: 1,
        parallax: 0.75,
        motion: "static",
      },
      {
        id: "s01-lamp-glow",
        src: "old-chen-flow-pilot/images/layers/s01/lamp-glow.webp",
        zIndex: 2,
        origin: [82.8, 14.1],
        parallax: 0.82,
        motion: "glow-pulse",
        blendMode: "screen",
        opacity: 0.85,
      },
      {
        id: "s01-visitor",
        src: "old-chen-flow-pilot/images/layers/s01/visitor-stand.webp",
        zIndex: 4,
        origin: [72.6, 98.0],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.55,
        celSequence: {
          frames: [
            "old-chen-flow-pilot/images/layers/s01/visitor-walk-1.webp",
            "old-chen-flow-pilot/images/layers/s01/visitor-walk-2.webp",
            "old-chen-flow-pilot/images/layers/s01/visitor-walk-3.webp",
            "old-chen-flow-pilot/images/layers/s01/visitor-stand.webp",
          ],
          fps: 6.5,
          activeWindow: [0.0, 4.6],
          idleSrc: "old-chen-flow-pilot/images/layers/s01/visitor-stand.webp",
        },
        keyframes: [
          { atSec: 0.0, x: -560, y: 12 },
          { atSec: 1.5, x: -355, y: 6 },
          { atSec: 3.1, x: -145, y: 2 },
          { atSec: 4.6, x: 0, y: 0 },
          { atSec: 7.2, x: 4, y: 0 },
        ],
      },
      {
        id: "s01-curtain",
        src: "old-chen-flow-pilot/images/layers/s01/curtain.webp",
        zIndex: 6,
        origin: [63.5, 2.0],
        parallax: 1.0,
        keyframes: [
          { atSec: 0.0, rotate: -4.5, scaleX: 0.94 },
          { atSec: 1.3, rotate: -3.5, scaleX: 0.95 },
          { atSec: 2.3, rotate: 11.0, x: 14, scaleX: 1.04 },
          { atSec: 3.7, rotate: -2.2, x: -4, scaleX: 0.98 },
          { atSec: 5.2, rotate: 0.8, x: 0, scaleX: 1.0 },
          { atSec: 7.2, rotate: 0, x: 0, scaleX: 1.0 },
        ],
      },
      {
        id: "s01-counter-fg",
        src: "old-chen-flow-pilot/images/layers/s01/counter-fg.webp",
        zIndex: 8,
        parallax: 1.12,
        motion: "static",
      },
    ],
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
    note: "2D 骨骼关节 + 真实语音口型 + 自然眨眼：轻推八音盒上柜台，抬头期盼询问",
    durSec: 6.5,
    tone: "glow",
    cue: "still",
    fx: "none",
    mode: "layered-2d",
    transitionIn: "dissolve",
    transitionFrames: 6,
    layers: [
      {
        id: "s02-bg",
        src: "old-chen-flow-pilot/images/layers/s02/bg.webp",
        zIndex: 1,
        parallax: 0.72,
      },
      {
        id: "s02-pendulum-left",
        src: "old-chen-flow-pilot/images/layers/s02/pendulum-left.webp",
        zIndex: 2,
        origin: [21.9, 12.6],
        parallax: 0.72,
        motion: "swing",
        amplitude: 1.35,
        speed: 0.95,
      },
      {
        id: "s02-pendulum-right",
        src: "old-chen-flow-pilot/images/layers/s02/pendulum-right.webp",
        zIndex: 2,
        origin: [65.2, 12.4],
        parallax: 0.72,
        motion: "swing",
        amplitude: 1.25,
        speed: 0.88,
        phase: 1.4,
      },
      {
        id: "s02-lamp-glow",
        src: "old-chen-flow-pilot/images/layers/s02/lamp-glow.webp",
        zIndex: 3,
        origin: [51.7, 32.9],
        parallax: 0.85,
        motion: "glow-pulse",
        blendMode: "screen",
        opacity: 0.85,
      },
      {
        id: "s02-music-box",
        src: "old-chen-flow-pilot/images/layers/s02/music-box.webp",
        zIndex: 4,
        origin: [65.0, 78.0],
        parallax: 1.0,
        keyframes: [
          { atSec: 0.0, x: -32, y: -5, rotate: -1.4 },
          { atSec: 1.05, x: 0, y: 0, rotate: 0 },
          { atSec: 6.5, x: 0, y: 0, rotate: 0 },
        ],
      },
      {
        id: "s02-visitor-rig",
        src: "old-chen-flow-pilot/images/layers/s02/visitor-body.webp",
        zIndex: 5,
        origin: [35.5, 84.0],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.7,
        keyframes: [
          { atSec: 0.0, x: -24, y: 4, rotate: 1.4 },
          { atSec: 1.05, x: 0, y: 0, rotate: 0 },
          { atSec: 6.5, x: 2, y: 0, rotate: 0 },
        ],
        children: [
          {
            id: "s02-visitor-head",
            src: "old-chen-flow-pilot/images/layers/s02/visitor-head-closed.webp",
            zIndex: 2,
            origin: [35.8, 42.5],
            motion: "talk",
            amplitude: 0.6,
            activeSpeaker: "girl",
            keyframes: [
              { atSec: 0.0, rotate: 6.2, y: 6 },
              { atSec: 1.08, rotate: 0, y: 0 },
              { atSec: 5.7, rotate: -0.6, y: 0 },
            ],
            visemes: {
              closedSrc:
                "old-chen-flow-pilot/images/layers/s02/visitor-head-closed.webp",
              halfSrc:
                "old-chen-flow-pilot/images/layers/s02/visitor-head-half.webp",
              openSrc:
                "old-chen-flow-pilot/images/layers/s02/visitor-head-open.webp",
            },
            children: [
              {
                id: "s02-visitor-eyes",
                src: "old-chen-flow-pilot/images/layers/s02/visitor-eyes-open.webp",
                zIndex: 3,
                blink: {
                  openSrc:
                    "old-chen-flow-pilot/images/layers/s02/visitor-eyes-open.webp",
                  closedSrc:
                    "old-chen-flow-pilot/images/layers/s02/visitor-eyes-closed.webp",
                  intervalSec: 2.9,
                },
              },
            ],
          },
        ],
      },
      {
        id: "s02-counter-fg",
        src: "old-chen-flow-pilot/images/layers/s02/counter-fg.webp",
        zIndex: 9,
        parallax: 1.06,
      },
    ],
    lines: [
      {
        id: "p02-girl",
        speaker: "girl",
        text: "爷爷，这个旧八音盒，还能修好吗？",
        file: "old-chen-flow-pilot/audio/p02-girl.mp3",
        atSec: 1.1,
        durSec: 4.488,
        envelope: VISITOR_LINE_ENVELOPE,
        envelopeFps: 24,
      },
    ],
  },
  {
    id: "03",
    label: "老陈应允",
    note: "2D 骨骼关节（180度反打）+ 抬手扶镜 + 真实语音口型 + 自然眨眼",
    durSec: 7.0,
    tone: "warm",
    cue: "still",
    fx: "starlight",
    mode: "layered-2d",
    transitionIn: "dissolve",
    transitionFrames: 6,
    layers: [
      {
        id: "s03-bg",
        src: "old-chen-flow-pilot/images/layers/s03/bg.webp",
        zIndex: 1,
        parallax: 0.72,
      },
      {
        id: "s03-pendulum",
        src: "old-chen-flow-pilot/images/layers/s03/pendulum.webp",
        zIndex: 2,
        origin: [68.2, 12.6],
        parallax: 0.72,
        motion: "swing",
        amplitude: 1.35,
        speed: 0.92,
      },
      {
        id: "s03-lamp-glow",
        src: "old-chen-flow-pilot/images/layers/s03/lamp-glow.webp",
        zIndex: 3,
        origin: [27.0, 35.9],
        parallax: 0.85,
        motion: "glow-pulse",
        blendMode: "screen",
        opacity: 0.85,
      },
      {
        id: "s03-chen-rig",
        src: "old-chen-flow-pilot/images/layers/s03/chen-body.webp",
        zIndex: 5,
        origin: [58.5, 84.0],
        parallax: 1.0,
        motion: "breathe",
        amplitude: 0.75,
        keyframes: [
          { atSec: 0.0, x: 12, y: 4, rotate: -1.2 },
          { atSec: 1.15, x: 0, y: 0, rotate: 0 },
          { atSec: 7.0, x: -2, y: 0, rotate: 0 },
        ],
        children: [
          {
            id: "s03-chen-head",
            src: "old-chen-flow-pilot/images/layers/s03/chen-head-closed.webp",
            zIndex: 2,
            origin: [55.8, 40.5],
            motion: "talk",
            amplitude: 0.6,
            activeSpeaker: "chen",
            keyframes: [
              { atSec: 0.0, rotate: -3.6, y: 3 },
              { atSec: 1.15, rotate: 0, y: 0 },
              { atSec: 6.2, rotate: 0.8, y: 0 },
            ],
            visemes: {
              closedSrc:
                "old-chen-flow-pilot/images/layers/s03/chen-head-closed.webp",
              halfSrc:
                "old-chen-flow-pilot/images/layers/s03/chen-head-half.webp",
              openSrc:
                "old-chen-flow-pilot/images/layers/s03/chen-head-open.webp",
            },
            children: [
              {
                id: "s03-chen-eyes",
                src: "old-chen-flow-pilot/images/layers/s03/chen-eyes-open.webp",
                zIndex: 3,
                blink: {
                  openSrc:
                    "old-chen-flow-pilot/images/layers/s03/chen-eyes-open.webp",
                  closedSrc:
                    "old-chen-flow-pilot/images/layers/s03/chen-eyes-closed.webp",
                  intervalSec: 3.2,
                },
              },
            ],
          },
          {
            id: "s03-chen-arm",
            src: "old-chen-flow-pilot/images/layers/s03/chen-arm.webp",
            zIndex: 4,
            origin: [46.2, 60.5],
            keyframes: [
              { atSec: 0.0, rotate: -4.2, x: -2, y: 4 },
              { atSec: 1.15, rotate: 0, x: 0, y: 0 },
              { atSec: 2.8, rotate: 0.6, x: 0, y: 0 },
              { atSec: 4.5, rotate: -2.2, x: -1, y: 2 },
              { atSec: 7.0, rotate: -2.2, x: -1, y: 2 },
            ],
          },
        ],
      },
      {
        id: "s03-bench-fg",
        src: "old-chen-flow-pilot/images/layers/s03/bench-fg.webp",
        zIndex: 8,
        parallax: 1.06,
      },
    ],
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
  showAnimaticBadge: false,
};

export const { timeline: PILOT_TIMELINE, totalFrames: PILOT_TOTAL_FRAMES } =
  buildStoryTimeline(PILOT_SHOTS, PILOT_FPS);
