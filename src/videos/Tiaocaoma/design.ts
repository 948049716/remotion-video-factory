import { Easing, interpolate, staticFile } from "remotion";

/** 《跳槽马》 paper-cut art direction. Single source of visual constants. */
export const COLORS = {
  paper: "#F1E3C6",
  paperLight: "#F8EED8",
  paperDeep: "#E2C99E",
  ink: "#2B211B",
  inkSoft: "#4A382C",
  vermilion: "#B32B24",
  vermilionBright: "#D6402F",
  gold: "#C99547",
  jade: "#5F7C6C",
  indigo: "#2F4A5C",
  dusk: "#8C3A1F",
  bloodless: "#E8D2B0",
} as const;

export const FONT = {
  title: '"STKaiti", "KaiTi", "楷体", "Microsoft YaHei", serif',
  body: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif',
  seal: '"STKaiti", "KaiTi", "楷体", serif',
  mono: '"Consolas", "SFMono-Regular", monospace',
} as const;

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const CURVE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  whip: Easing.bezier(0.7, 0, 0.2, 1),
  soft: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

/** interpolate() with mandatory clamping — deterministic in headless Chromium. */
export const lerp = (
  frame: number,
  input: readonly number[],
  output: readonly number[],
  easing?: (t: number) => number,
): number =>
  interpolate(frame, input as number[], output as number[], {
    ...CLAMP,
    ...(easing ? { easing } : {}),
  });

/** Quantise to 12fps for the hand-made stop-motion cut-out feel. */
export const stepped = (frame: number, rate = 12): number => {
  const step = Math.round(60 / rate);
  return Math.floor(frame / step) * step;
};

export const wobble = (frame: number, speed = 0.035, amp = 1): number =>
  Math.sin(stepped(frame) * speed) * amp;

export const seeded = (i: number): number => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Layered paper thickness: soft cast shadow + bright cut edge. */
export const paperShadow = (depth = 1): string =>
  `drop-shadow(0 ${5 * depth}px ${9 * depth}px rgba(48,28,16,0.30)) ` +
  `drop-shadow(0 ${1.5 * depth}px 0 rgba(255,246,222,0.42))`;

export const bg = (name: string) => staticFile(`tiaocaoma/bg/${name}.png`);
export const part = (name: string) => staticFile(`tiaocaoma/parts/${name}.png`);
export const mouthFile = (name: string) => staticFile(`tiaocaoma/mouths/${name}.png`);
export const voiceFile = (name: string) => staticFile(`tiaocaoma/audio/${name}`);
export const sfxFile = (name: string) => staticFile(`tiaocaoma/sfx/${name}`);
export const ambienceFile = (name: string) => staticFile(`tiaocaoma/ambience/${name}`);
export const SCORE = staticFile("tiaocaoma/score.mp3");

export const ROLE_LABEL: Record<string, string> = {
  旁白: "说书人",
  店小二: "店小二",
  "店小二·内心OS": "店小二 · 心里话",
  刀疤脸: "刀疤脸",
  赵大人: "赵大人",
  一品大员: "一品大员",
};

export const SPEAKER_COLOR: Record<string, string> = {
  scar: COLORS.ink,
  waiter: COLORS.vermilion,
  zhao: COLORS.indigo,
  firstlord: COLORS.dusk,
};
