import type { Track } from "./data/timeline";
import type { CharKey } from "./rig";

export type ShotKind =
  | "stage"
  | "portrait"
  | "rank"
  | "title"
  | "ending"
  | "flashback"
  | "impact"
  | "montage";

export type FxName =
  | "clouds"
  | "dust"
  | "sun"
  | "wind"
  | "speedlines"
  | "tear"
  | "flash"
  | "shake"
  | "petals"
  | "spotlight"
  | "ink";

export interface Actor {
  who: CharKey;
  x: number;
  y: number;
  scale: number;
  flip?: boolean;
  expr?: number;
  pose?: "stand" | "bow" | "kneel" | "point" | "panic" | "laugh" | "ride" | "fall" | "think";
  /** "feet" = full-body stage shot, "head" = medium / close-up framing */
  anchor?: "feet" | "head";
  enter?: "left" | "right" | "up" | "none";
  moveTo?: number;
  moveDur?: number;
  hidden?: boolean;
}

export interface StageProp {
  name: string;
  x: number;
  y: number;
  w: number;
  rot?: number;
  flip?: boolean;
  delay?: number;
  parallax?: number;
  spin?: number;
  fly?: { x: number; y: number; frames: number };
}

export interface HorseActor {
  which: "white" | "red" | "black" | "king" | "herd0" | "herd1" | "herd2";
  x: number;
  y: number;
  w: number;
  flip?: boolean;
  moveTo?: number;
  moveDur?: number;
  gait?: number;
  headDown?: boolean;
}

/** A flip-book of cut-out poses (the supplementary 3-frame action sheets). */
export interface FrameSeq {
  parts: readonly string[];
  x: number;
  y: number;
  w: number;
  hold?: number;
  delay?: number;
  loop?: boolean;
  flip?: boolean;
  moveTo?: number;
  moveDur?: number;
  opacity?: number;
  life?: number;
  spin?: number;
  z?: number;
  /** inset the flip-book inside a torn paper medallion (for close-up inserts) */
  badge?: boolean;
}

export interface Shot {
  kind: ShotKind;
  bg: string;
  grade: "day" | "dusk" | "inn" | "sepia" | "dramatic";
  actors: Actor[];
  horses: HorseActor[];
  props: StageProp[];
  sequences: FrameSeq[];
  fx: FxName[];
  camera: { from: number; to: number; panX: number; panY: number };
  headline?: string;
  subline?: string;
  caption: "paper" | "bubble" | "seal" | "none";
  beats: number[];
  chapterCard?: boolean;
}

export const A = (
  who: CharKey, x: number, y: number, scale: number, opts: Partial<Actor> = {},
): Actor => ({ who, x, y, scale, ...opts });

export const P = (
  name: string, x: number, y: number, w: number, opts: Partial<StageProp> = {},
): StageProp => ({ name, x, y, w, ...opts });

export const H = (
  which: HorseActor["which"], x: number, y: number, w: number, opts: Partial<HorseActor> = {},
): HorseActor => ({ which, x, y, w, ...opts });

export const Q = (
  parts: readonly string[], x: number, y: number, w: number, opts: Partial<FrameSeq> = {},
): FrameSeq => ({ parts, x, y, w, ...opts });

type ShotSpec = Partial<Shot> & { kind?: ShotKind; bg?: string };

export const S = (
  kind: ShotKind, bg: string, actors: Actor[] = [], props: StageProp[] = [],
  fx: FxName[] = [], opts: ShotSpec = {}, horses: HorseActor[] = [],
): Shot => ({
  kind,
  bg,
  grade: "day",
  actors,
  horses,
  props,
  sequences: [],
  fx,
  camera: { from: 1.02, to: 1.09, panX: 0, panY: 0 },
  caption: "paper",
  beats: [],
  ...opts,
});

const BG_BY_CHAPTER: Record<number, string> = {
  1: "bg-stable-day",
  2: "bg-stable-day",
  3: "bg-stable-day",
  4: "bg-inn",
  5: "bg-stable-dusk",
  6: "bg-stable-dusk",
};

/** Fallback shot for tracks without an explicit storyboard entry. */
export function defaultShot(t: Track): Shot {
  const speaking = t.speaker;
  const bg = BG_BY_CHAPTER[t.chapter] ?? "bg-stable-day";
  const grade: Shot["grade"] = t.chapter >= 6 ? "dramatic" : t.chapter >= 5 ? "dusk" : "day";
  const actors: Actor[] = [];
  if (speaking === "waiter") {
    actors.push(A("waiter", 1180, 940, 300, { pose: t.inner ? "think" : "stand" }));
    actors.push(A("scar", 620, 930, 290, { flip: true }));
  } else if (speaking === "scar") {
    actors.push(A("scar", 680, 940, 310));
    actors.push(A("waiter", 1280, 930, 280, { flip: true }));
  } else if (speaking === "zhao") {
    actors.push(A("zhao", 700, 950, 320));
    actors.push(A("waiter", 1320, 930, 270, { flip: true, pose: "bow" }));
  } else if (speaking === "firstlord") {
    actors.push(A("firstlord", 700, 960, 340));
    actors.push(A("waiter", 1330, 930, 270, { flip: true, pose: "kneel" }));
  } else {
    actors.push(A("waiter", 1330, 930, 280, { flip: true }));
    actors.push(A("scar", 640, 940, 290));
  }
  return S("stage", bg, actors, [P("prop-manger-00", 960, 810, 1180)], ["dust"], {
    grade,
    caption: t.inner ? "bubble" : "paper",
  }, [H("white", 960, 850, 560)]);
}

/** Find the track that owns a global frame (binary search). */
export function trackAtFrame(frame: number, tracks: Track[]): Track | null {
  let lo = 0;
  let hi = tracks.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const t = tracks[mid];
    if (frame < t.startFrame) hi = mid - 1;
    else if (frame >= t.endFrame) lo = mid + 1;
    else return t;
  }
  return null;
}
