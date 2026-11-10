import { interpolate, spring } from "remotion";
import { EASING_CURVES, SPRING_CONFIGS } from "../motion-presets";

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Intentional unbounded interpolation: lets a spring's overshoot read as follow-through. */
export const OVERSHOOT = {
  extrapolateLeft: "clamp",
  extrapolateRight: "extend",
} as const;

export type EaseFn = (t: number) => number;

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** Clamped, eased, single-segment interpolation. */
export const seg = (
  frame: number,
  from: number,
  to: number,
  outFrom = 0,
  outTo = 1,
  easing?: EaseFn,
): number =>
  interpolate(
    frame,
    [from, to],
    [outFrom, outTo],
    easing ? { ...CLAMP, easing } : CLAMP,
  );

/** Perceptually even camera / object zoom. */
export const pzoom = (
  frame: number,
  from: number,
  to: number,
  outFrom: number,
  outTo: number,
  easing?: EaseFn,
): number =>
  interpolate(
    frame,
    [from, to],
    [outFrom, outTo],
    easing
      ? { ...CLAMP, easing, output: "perceptual-scale" }
      : { ...CLAMP, output: "perceptual-scale" },
  );

/** Spring with a bounded settling window, so nothing animates forever. */
export const pop = (
  frame: number,
  fps: number,
  delay = 0,
  config: { damping: number; stiffness: number; mass: number } = SPRING_CONFIGS.snappy,
): number =>
  spring({
    frame: frame - delay,
    fps,
    config,
    durationInFrames: 44,
  });

/** Symmetric envelope: fade in, hold, fade out. */
export const fadeWindow = (
  frame: number,
  start: number,
  end: number,
  inFrames = 8,
  outFrames = 8,
): number =>
  clamp01(
    Math.min(
      seg(frame, start, start + inFrames),
      seg(frame, end - outFrames, end, 1, 0),
    ),
  );

/** Deterministic PRNG — no Math.random(), so every frame renders identically. */
export const seeded = (seed: number): (() => number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Exponentially decaying camera shake after an impact. */
export const impactShake = (
  frame: number,
  hitFrame: number,
  amount = 13,
): { x: number; y: number } => {
  const dt = frame - hitFrame;
  if (dt < 0 || dt > 34) return { x: 0, y: 0 };
  const decay = Math.exp(-dt * 0.22);
  return {
    x: Math.sin(dt * 2.9) * amount * decay,
    y: Math.cos(dt * 3.7) * amount * decay * 0.62,
  };
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const pad2 = (n: number): string => ("0" + Math.floor(n)).slice(-2);

export const timecode = (frame: number, fps: number): string => {
  const totalSeconds = Math.floor(frame / fps);
  return `${pad2(Math.floor(totalSeconds / 60))}:${pad2(totalSeconds % 60)}:${pad2(frame % fps)}`;
};

export { EASING_CURVES, SPRING_CONFIGS };
