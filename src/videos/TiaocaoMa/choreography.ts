import type { RetimedShot } from "./retimed-timeline";
import type { ShotMeta } from "./shot-meta";

export type CameraMove = {
  startScale: number;
  endScale: number;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  rotate: number;
  shake: number;
};

export type PuppetGesture =
  | "idle"
  | "speak"
  | "bow"
  | "point"
  | "kneel"
  | "kowtow"
  | "sleeve"
  | "limp"
  | "rear"
  | "tremble";

export type PuppetBeat = {
  at: number;
  gesture: PuppetGesture;
  duration?: number;
};

export type PuppetChoreography = {
  role: "primary" | "secondary" | "horse" | "crowd" | "horseCrowd";
  enterFrom?: "left" | "right" | "bottom" | "none";
  enterAt?: number;
  exitAt?: number;
  beats?: PuppetBeat[];
};

export type CaptionPlacement = "bottom" | "top";

export type ShotFxKind =
  | "lantern"
  | "rain"
  | "dust"
  | "confetti"
  | "gold"
  | "ash"
  | "candle";

export type ShotChoreography = {
  camera: CameraMove;
  puppets: PuppetChoreography[];
  caption: { placement: CaptionPlacement; offsetY?: number };
  fx: ShotFxKind[];
  easing: "linear" | "smooth" | "whip";
};

type ChoreographyOverride = {
  camera?: Partial<CameraMove>;
  puppets?: PuppetChoreography[];
  caption?: Partial<ShotChoreography["caption"]>;
  fx?: ShotFxKind[];
  easing?: ShotChoreography["easing"];
};

const hasKeyword = (meta: ShotMeta, keywords: string[]): boolean =>
  keywords.some(
    (keyword) =>
      meta.motion.includes(keyword) || meta.visual.includes(keyword),
  );

const defaultBeats = (meta: ShotMeta): PuppetBeat[] => {
  const beats: PuppetBeat[] = [];
  if (hasKeyword(meta, ["指", "点"])) {
    beats.push({ at: 0.32, gesture: "point", duration: 0.22 });
  }
  if (hasKeyword(meta, ["磕头"])) {
    beats.push({ at: 0.3, gesture: "kowtow", duration: 0.55 });
  } else if (hasKeyword(meta, ["跪"])) {
    beats.push({ at: 0.3, gesture: "kneel", duration: 0.5 });
  }
  if (hasKeyword(meta, ["作揖", "拱手", "抱拳"])) {
    beats.push({ at: 0.34, gesture: "bow", duration: 0.24 });
  }
  if (hasKeyword(meta, ["衣袖", "空袖", "甩袖", "袖"])) {
    beats.push({ at: 0.42, gesture: "sleeve", duration: 0.32 });
  }
  if (hasKeyword(meta, ["颤抖", "发抖", "打颤"])) {
    beats.push({ at: 0.35, gesture: "tremble", duration: 0.4 });
  }
  if (beats.length === 0) {
    beats.push({ at: 0.2, gesture: "speak", duration: 0.55 });
  }
  return beats.length > 0 ? beats : [{ at: 0.1, gesture: "idle" }];
};

const baseCamera = (meta: ShotMeta): CameraMove => {
  const close =
    meta.framing.includes("特写") || meta.framing.includes("近景");
  const wide =
    meta.framing.includes("全景") || meta.framing.includes("远景");
  const text = `${meta.motion} ${meta.visual}`;

  let startScale = close ? 1.02 : wide ? 1.01 : 1.0;
  let endScale = close ? 1.1 : wide ? 1.06 : 1.04;
  let startX = 0;
  let endX = wide ? 18 : 8;
  let startY = 0;
  let endY = wide ? -6 : -2;

  if (text.includes("横移") || text.includes("平移")) {
    startX = -34;
    endX = 34;
  }
  if (text.includes("左移")) {
    startX = 20;
    endX = -20;
  }
  if (text.includes("右移")) {
    startX = -20;
    endX = 20;
  }
  if (text.includes("推近") || text.includes("推")) {
    endScale = close ? 1.14 : 1.09;
  }
  if (text.includes("拉远")) {
    startScale = 1.09;
    endScale = 1.0;
  }
  if (text.includes("下摇") || text.includes("俯")) {
    startY = 12;
    endY = -12;
  }
  if (text.includes("上摇") || text.includes("仰")) {
    startY = -12;
    endY = 12;
  }
  if (text.includes("定格")) {
    endScale = startScale;
    endX = startX;
    endY = startY;
  }

  return {
    startScale,
    endScale,
    startX,
    endX,
    startY,
    endY,
    rotate: -0.3,
    shake: meta.act === "contest" ? 1.5 : 0,
  };
};

const basePuppets = (meta: ShotMeta): PuppetChoreography[] => {
  const humanKeys = meta.assets.filter(
    (key) => key.startsWith("char.") && !key.includes("horse"),
  );
  const hasCrowd = humanKeys.includes("char.crowd");
  const hasHorseCrowd = meta.assets.includes("char.horse.crowd");
  const hasHuman = humanKeys.some((key) => key !== "char.crowd");
  const hasSecondaryHuman =
    humanKeys.filter((key) => key !== "char.crowd").length > 1;
  const hasHorse = meta.assets.some(
    (key) => key.includes("horse") && key !== "char.horse.crowd",
  );

  const puppets: PuppetChoreography[] = [];

  if (hasCrowd) {
    puppets.push({
      role: "crowd",
      enterFrom: "none",
      beats: [
        { at: 0.1, gesture: "idle" },
        { at: 0.58, gesture: "tremble", duration: 0.2 },
      ],
    });
  }

  if (hasHorseCrowd) {
    puppets.push({
      role: "horseCrowd",
      enterFrom: "none",
      beats: [{ at: 0.1, gesture: "idle" }],
    });
  }

  if (hasHuman && !hasCrowd) {
    puppets.push({
      role: "primary",
      enterFrom: meta.act === "rules" ? "left" : "none",
      enterAt: meta.act === "rules" ? 0.12 : 0,
      beats: defaultBeats(meta),
    });
  }

  if (hasSecondaryHuman && !hasCrowd) {
    puppets.push({
      role: "secondary",
      enterFrom: "none",
      beats: [{ at: 0.15, gesture: "idle" }],
    });
  }

  if (hasHorse && !hasHorseCrowd) {
    puppets.push({
      role: "horse",
      enterFrom: "right",
      enterAt: 0,
      beats: [
        {
          at: 0.2,
          gesture: meta.act === "hunger" ? "limp" : "idle",
          duration: 0.7,
        },
      ],
    });
  }

  return puppets;
};

const baseFx = (meta: ShotMeta): ShotFxKind[] => {
  const fx: ShotFxKind[] = [];
  if (
    meta.assets.includes("prop.lantern") ||
    meta.visual.includes("灯笼")
  ) {
    fx.push("lantern");
  }
  if (
    meta.visual.includes("雨") &&
    !meta.assets.includes("bg.palace.gate")
  ) {
    fx.push("rain");
  }
  if (meta.act === "contest") {
    fx.push("dust");
  }
  if (meta.visual.includes("纸屑") || meta.visual.includes("纸片飞")) {
    fx.push("confetti");
  }
  if (
    meta.assets.includes("fx.gold-sun") ||
    meta.assets.includes("fx.horse-king.gold")
  ) {
    fx.push("gold");
  }
  if (
    meta.act === "truth" &&
    (meta.visual.includes("剑") || meta.visual.includes("断臂"))
  ) {
    fx.push("ash");
  }
  if (meta.visual.includes("夜") || meta.location.includes("夜")) {
    fx.push("candle");
  }
  return [...new Set(fx)];
};

const OVERRIDES: Record<string, ChoreographyOverride> = {
  "rules-01": {
    camera: {
      startScale: 1.0,
      endScale: 1.06,
      startX: 0,
      endX: 0,
      startY: 0,
      endY: -4,
    },
    puppets: [],
    fx: ["dust"],
    easing: "smooth",
  },
  "rules-09": {
    camera: {
      startScale: 1.03,
      endScale: 1.07,
      startX: -55,
      endX: 55,
    },
    puppets: [
      {
        role: "primary",
        enterFrom: "none",
        beats: [
          { at: 0.18, gesture: "point", duration: 0.2 },
          { at: 0.62, gesture: "point", duration: 0.18 },
        ],
      },
      {
        role: "horseCrowd",
        enterFrom: "none",
        beats: [
          { at: 0.1, gesture: "idle" },
          { at: 0.55, gesture: "tremble", duration: 0.2 },
        ],
      },
    ],
    fx: ["dust"],
  },
  "exception-01": {
    camera: {
      startScale: 1.05,
      endScale: 1.09,
      startX: 28,
      endX: -12,
    },
    puppets: [
      {
        role: "primary",
        enterFrom: "right",
        enterAt: 0,
        beats: [{ at: 0.35, gesture: "sleeve", duration: 0.4 }],
      },
      {
        role: "horse",
        enterFrom: "right",
        enterAt: 0.05,
        beats: [{ at: 0.1, gesture: "limp", duration: 0.8 }],
      },
    ],
    fx: ["dust"],
  },
  "exception-04": {
    camera: {
      startScale: 1.04,
      endScale: 1.1,
      startX: 12,
      endX: -8,
    },
    caption: { placement: "top" },
    puppets: [
      {
        role: "primary",
        enterFrom: "none",
        beats: [{ at: 0.25, gesture: "sleeve", duration: 0.5 }],
      },
      {
        role: "secondary",
        enterFrom: "none",
        beats: [{ at: 0.2, gesture: "tremble", duration: 0.5 }],
      },
    ],
    fx: ["dust"],
  },
  "contest-09": {
    camera: {
      startScale: 1.04,
      endScale: 1.12,
      startX: 10,
      endX: -10,
      shake: 2.5,
    },
    caption: { placement: "top" },
    puppets: [
      {
        role: "primary",
        enterFrom: "none",
        beats: [
          { at: 0.02, gesture: "kneel", duration: 0.1 },
          { at: 0.12, gesture: "kowtow", duration: 0.76 },
        ],
      },
      {
        role: "secondary",
        enterFrom: "none",
        beats: [{ at: 0.15, gesture: "sleeve", duration: 0.4 }],
      },
    ],
    fx: ["dust"],
  },
  "hunger-05": {
    camera: {
      startScale: 1.03,
      endScale: 1.08,
      startX: 8,
      endX: -8,
    },
    caption: { placement: "bottom" },
    puppets: [
      {
        role: "horse",
        enterFrom: "none",
        beats: [
          { at: 0.1, gesture: "limp", duration: 0.4 },
          { at: 0.55, gesture: "tremble", duration: 0.3 },
        ],
      },
      {
        role: "primary",
        enterFrom: "none",
        beats: [{ at: 0.3, gesture: "sleeve", duration: 0.4 }],
      },
    ],
    fx: ["candle"],
  },
  "truth-03": {
    camera: {
      startScale: 1.05,
      endScale: 1.14,
      startX: 14,
      endX: -14,
      shake: 4,
    },
    caption: { placement: "top" },
    fx: ["ash", "candle"],
    easing: "whip",
  },
  "truth-04": {
    camera: {
      startScale: 1.02,
      endScale: 1.08,
      startX: 0,
      endX: 0,
    },
    caption: { placement: "top" },
    puppets: [
      {
        role: "primary",
        enterFrom: "none",
        beats: [{ at: 0.25, gesture: "sleeve", duration: 0.5 }],
      },
    ],
    fx: ["ash", "candle"],
    easing: "smooth",
  },
  "truth-10": {
    camera: {
      startScale: 1.08,
      endScale: 1.0,
      startX: 0,
      endX: 0,
      startY: 0,
      endY: -8,
    },
    fx: ["gold"],
    easing: "smooth",
  },
  "truth-11": {
    camera: {
      startScale: 1.04,
      endScale: 0.98,
      startX: 0,
      endX: 0,
    },
    easing: "smooth",
  },
};

export const getChoreography = (
  shot: RetimedShot,
  meta: ShotMeta,
): ShotChoreography => {
  const base: ShotChoreography = {
    camera: baseCamera(meta),
    puppets: basePuppets(meta),
    caption: {
      placement: meta.framing.includes("特写") ? "top" : "bottom",
      offsetY: 0,
    },
    fx: baseFx(meta),
    easing:
      meta.act === "contest"
        ? "whip"
        : meta.act === "truth"
          ? "smooth"
          : "linear",
  };

  const override = OVERRIDES[shot.id];
  if (!override) return base;

  return {
    ...base,
    ...override,
    camera: { ...base.camera, ...(override.camera ?? {}) },
    caption: { ...base.caption, ...(override.caption ?? {}) },
    puppets: override.puppets ?? base.puppets,
    fx: override.fx ?? base.fx,
  };
};
