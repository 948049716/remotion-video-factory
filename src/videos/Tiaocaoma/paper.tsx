import React from "react";
import { AbsoluteFill, Img } from "remotion";
import {
  bg, COLORS, lerp, mouthFile, paperShadow, part, seeded, wobble,
} from "./design";
import { HORSE, RIG, sized, type CharKey, type HorseKey } from "./rig";
import type { Actor, FrameSeq, HorseActor, StageProp } from "./shots";

/** Deterministic paper fibre / grain, rendered as an SVG turbulence rect. */
export const PaperGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.13 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "multiply", opacity, zIndex: 60 }}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="tc-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves={3} seed={9} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#tc-grain)" />
    </svg>
  </AbsoluteFill>
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill style={{
    pointerEvents: "none", zIndex: 58,
    background: `radial-gradient(ellipse 78% 72% at 50% 46%, transparent 42%, rgba(38,22,12,${strength}) 100%)`,
  }} />
);

const GRADES: Record<string, string> = {
  day: "rgba(255,240,205,0.06)",
  dusk: "rgba(196,84,32,0.20)",
  inn: "rgba(255,196,96,0.14)",
  sepia: "rgba(176,126,62,0.24)",
  dramatic: "rgba(52,20,14,0.34)",
};

export const Grade: React.FC<{ grade: string }> = ({ grade }) => (
  <AbsoluteFill style={{
    pointerEvents: "none", zIndex: 5, mixBlendMode: "multiply",
    background: GRADES[grade] ?? GRADES.day,
  }} />
);

export const Backdrop: React.FC<{ name: string; transform: string }> = ({ name, transform }) => (
  <AbsoluteFill style={{ zIndex: 0, overflow: "hidden", backgroundColor: COLORS.paper }}>
    <Img src={bg(name)} style={{
      width: "100%", height: "100%", objectFit: "cover",
      transform, transformOrigin: "50% 50%", filter: "saturate(0.95) contrast(1.03)",
    }} />
  </AbsoluteFill>
);

/** One paper cut-out, with the layered shadow that sells the paper thickness. */
export const Cut: React.FC<{
  src: string; w: number; h?: number; style?: React.CSSProperties; depth?: number;
}> = ({ src, w, h, style, depth = 1 }) => (
  <Img src={src} style={{
    width: w, ...(h !== undefined ? { height: h } : { height: "auto" }),
    display: "block", filter: paperShadow(depth), ...style,
  }} />
);

/** Speaking head: upper face is spliced with an audio-driven lower-face viseme. */
export const PaperHead: React.FC<{
  who: CharKey; headW: number; lip: number; expr?: number;
  speaking: boolean; frame: number;
}> = ({ who, headW, lip, expr, speaking, frame }) => {
  const rig = RIG[who];
  const hs = sized(rig.head, headW);
  const useExpr = !speaking && expr !== undefined && rig.expr && rig.expr[expr];
  const src = useExpr ? part(rig.expr![expr!]) : part(rig.head);
  // Only the active speaker is spliced with an audio-driven viseme.
  // Non-speaking puppets keep their intact expression head (a static expression,
  // not a speaking mouth), which reads far more naturally in wide shots.
  const showMouth = who !== "boy" && speaking;
  const m = rig.mouth;
  const bob = speaking ? wobble(frame + 7, 0.10, 2.2) : wobble(frame, 0.035, 1.2);
  const tilt = speaking ? wobble(frame + 31, 0.055, 1.4) : 0;
  return (
    <div style={{
      position: "absolute", width: headW, height: hs.h,
      transform: `translateY(${bob}px) rotate(${tilt}deg)`,
      transformOrigin: "50% 80%", filter: paperShadow(1.4),
    }}>
      <div style={{
        width: headW, height: hs.h, overflow: "hidden",
        clipPath: showMouth ? `inset(0 0 ${m.cut * 100}% 0)` : undefined,
      }}>
        <Img src={src} style={{ width: headW, height: "auto", display: "block" }} />
      </div>
      {showMouth ? (
        <Img
          src={mouthFile(`${who}-${Math.max(0, Math.min(3, lip))}`)}
          style={{
            position: "absolute",
            width: headW * m.w,
            height: "auto",
            left: headW * (0.5 - m.w / 2 + m.dx),
            top: hs.h * m.top,
            filter: "drop-shadow(0 3px 4px rgba(40,24,12,0.32))",
          }}
        />
      ) : null}
    </div>
  );
};

const poseTransform = (pose: Actor["pose"], frame: number): string => {
  switch (pose) {
    case "bow": return `rotate(9deg) translateY(26px)`;
    case "kneel": return `translateY(104px) scaleY(0.74)`;
    case "panic": return `rotate(${wobble(frame, 0.22, 3.2)}deg) translateY(${Math.abs(wobble(frame, 0.3, 5))}px)`;
    case "laugh": return `translateY(${-Math.abs(wobble(frame, 0.16, 10))}px) rotate(${wobble(frame, 0.11, 2)}deg)`;
    case "think": return `rotate(-3deg)`;
    case "ride": return `translateY(-70px) rotate(2deg)`;
    case "fall": return `rotate(${lerp(frame, [0, 40], [0, 78])}deg) translateY(120px)`;
    default: return `rotate(${wobble(frame, 0.028, 0.9)}deg)`;
  }
};

/** A fully articulated cut-out puppet assembled from the separated sprite parts. */
export const PaperPuppet: React.FC<{
  actor: Actor; lip: number; speaking: boolean; frame: number; dur: number;
}> = ({ actor, lip, speaking, frame, dur }) => {
  const rig = RIG[actor.who];
  const headW = actor.scale;
  const hs = sized(rig.head, headW);
  const bodyW = headW * rig.body;
  const bs = sized(rig.torso, bodyW);
  const armW = headW * 0.36;
  const armS = sized(rig.armL, armW);
  const legW = headW * 0.34;
  const legS = rig.legL ? sized(rig.legL, legW) : { w: 0, h: 0 };
  const cw = bodyW * 2.05;
  const ch = hs.h + bs.h * 0.9 + legS.h * 0.8;
  const cx = cw / 2;

  const enterX = actor.enter === "left" ? lerp(frame, [0, 28], [-420, 0])
    : actor.enter === "right" ? lerp(frame, [0, 28], [420, 0])
    : actor.enter === "up" ? lerp(frame, [0, 24], [-260, 0]) : 0;
  const moveX = actor.moveTo !== undefined
    ? lerp(frame, [0, actor.moveDur ?? 600], [actor.x, actor.moveTo]) - actor.x : 0;
  const armSwing = speaking ? wobble(frame + 13, 0.13, 13) : wobble(frame, 0.04, 3);
  const pointArm = actor.pose === "point" ? -52 : 0;
  const fade = lerp(frame, [0, 14, dur - 12, dur], [0, 1, 1, 0]);

  const limb = (name: string, left: number, top: number, w: number, h: number,
                rot: number, origin: string): React.ReactNode => (
    <div key={name} style={{
      position: "absolute", left, top, transform: `rotate(${rot}deg)`,
      transformOrigin: origin, filter: paperShadow(1),
    }}>
      <Cut src={part(name)} w={w} h={h} />
    </div>
  );

  const headAnchor = actor.anchor === "head";
  return (
    <div style={{
      position: "absolute", left: actor.x + moveX + enterX, top: actor.y,
      width: cw, height: ch,
      transform: headAnchor ? "translate(-50%, 0)" : "translate(-50%, -100%)",
      opacity: actor.hidden ? 0 : fade, zIndex: 20,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        transform: `${poseTransform(actor.pose, frame)} ${actor.flip ? "scaleX(-1)" : ""}`,
        transformOrigin: "50% 92%",
      }}>
        {rig.legL ? limb(rig.legL, cx - bodyW * 0.36, hs.h * 0.78 + bs.h * 0.74,
          legW, legS.h, wobble(frame, 0.05, 2), "50% 0%") : null}
        {rig.legR ? limb(rig.legR, cx + bodyW * 0.10, hs.h * 0.78 + bs.h * 0.74,
          legW, legS.h, wobble(frame + 17, 0.05, 2), "50% 0%") : null}
        {limb(rig.torso, cx - bodyW / 2, hs.h * 0.78, bodyW, bs.h, 0, "50% 0%")}
        {limb(rig.armL, cx - bodyW / 2 - armW * 0.50, hs.h * 0.86, armW, armS.h,
          -armSwing + (actor.pose === "bow" ? 22 : 0), "80% 10%")}
        {limb(rig.armR, cx + bodyW / 2 - armW * 0.50, hs.h * 0.86, armW, armS.h,
          armSwing + pointArm, "20% 10%")}
        {rig.extra && rig.extra[0] === "char-waiter-01" ? (
          <div style={{ position: "absolute", left: cx - headW * 0.40, top: hs.h * 0.80,
            width: headW * 0.80, filter: paperShadow(1), zIndex: 1 }}>
            <Img src={part("char-waiter-01")} style={{ width: "100%", height: "auto" }} />
          </div>
        ) : null}
        <div style={{ position: "absolute", left: cx - headW / 2, top: 0,
          width: headW, height: hs.h, zIndex: 3 }}>
          <PaperHead who={actor.who} headW={headW} lip={lip} expr={actor.expr}
            speaking={speaking} frame={frame} />
        </div>
      </div>
    </div>
  );
};

/** Horses: either one of the three assembled cut-out horses, or a herd silhouette. */
export const PaperHorse: React.FC<{ horse: HorseActor; frame: number; dur: number }> = ({
  horse, frame, dur,
}) => {
  const rig = HORSE[horse.which as HorseKey];
  const fade = lerp(frame, [0, 12, dur - 10, dur], [0, 1, 1, 0]);
  const moveX = horse.moveTo !== undefined
    ? lerp(frame, [0, horse.moveDur ?? 600], [horse.x, horse.moveTo]) - horse.x : 0;
  const limp = horse.gait ? Math.abs(wobble(frame, 0.16, 1)) : 0;
  const bob = horse.gait ? Math.abs(wobble(frame, 0.16, 12)) * 0.7 : wobble(frame, 0.03, 3);

  if (horse.which.startsWith("herd")) {
    const s = sized(rig.head, horse.w);
    return (
      <div style={{
        position: "absolute", left: horse.x + moveX, top: horse.y,
        transform: `translate(-50%, -100%) scaleX(${horse.flip ? -1 : 1})`,
        opacity: fade, zIndex: 16, filter: paperShadow(1.2),
      }}>
        <Img src={part(rig.head)} style={{ width: horse.w, height: s.h,
          transform: horse.headDown ? "rotate(12deg)" : undefined }} />
      </div>
    );
  }

  const bs = sized(rig.body, horse.w);
  const headW = horse.w * 0.42;
  const headS = sized(rig.head, headW);
  const tailW = horse.w * 0.24;
  const tailS = sized(rig.tail, tailW);
  const legW = horse.w * 0.14;
  const legS = sized(rig.legs[0], legW);
  const cw = horse.w * 1.5;
  const ch = bs.h + legS.h * 1.25;
  const left = (cw - horse.w) / 2;

  return (
    <div style={{
      position: "absolute", left: horse.x + moveX, top: horse.y - bob,
      width: cw, height: ch, transform: `translate(-50%, -100%) scaleX(${horse.flip ? -1 : 1})`,
      opacity: fade, zIndex: 18,
    }}>
      <div style={{ position: "absolute", left: left - tailW * 0.1, top: -bs.h * 0.08,
        width: tailW, transform: `rotate(${wobble(frame, 0.09, 5)}deg)`, filter: paperShadow(1) }}>
        <Img src={part(rig.tail)} style={{ width: tailW, height: tailS.h }} />
      </div>
      {rig.legs.map((name, i) => (
        <div key={name} style={{
          position: "absolute",
          left: left + horse.w * (0.10 + i * 0.235),
          top: bs.h * 0.70,
          transform: `rotate(${horse.gait ? wobble(frame + i * 11, 0.20, 11 + limp * 5) : wobble(frame + i * 9, 0.04, 1.5)}deg)`,
          transformOrigin: "50% 0%", filter: paperShadow(0.8),
        }}>
          <Img src={part(name)} style={{ width: legW, height: legS.h }} />
        </div>
      ))}
      <div style={{ position: "absolute", left, top: 0, filter: paperShadow(1.2) }}>
        <Img src={part(rig.body)} style={{ width: horse.w, height: bs.h }} />
      </div>
      <div style={{
        position: "absolute", left: left - headW * 0.42, top: -headS.h * 0.12,
        width: headW, transform: `rotate(${horse.headDown ? 22 : wobble(frame + 3, 0.06, 2)}deg)`,
        transformOrigin: "80% 80%", filter: paperShadow(1.2),
      }}>
        <Img src={part(rig.head)} style={{ width: headW, height: headS.h }} />
      </div>
      {rig.bell ? (
        <div style={{
          position: "absolute", left: left - headW * 0.30, top: headS.h * 0.38,
          width: headW * 0.44,
          transform: `rotate(${wobble(frame, 0.24, 9)}deg)`,
          transformOrigin: "50% 0%", filter: paperShadow(0.8),
        }}>
          <Img src={part(rig.bell)} style={{ width: "100%", height: "auto" }} />
        </div>
      ) : null}
    </div>
  );
};

/** Set dressing with delayed entrance, parallax drift and optional fly-away. */
export const PropSprite: React.FC<{ prop: StageProp; frame: number; dur: number }> = ({
  prop, frame, dur,
}) => {
  const delay = prop.delay ?? 0;
  const t = frame - delay;
  if (t < -2) return null;
  const s = sized(prop.name, prop.w);
  const appear = lerp(t, [0, 16], [0, 1]);
  const rise = lerp(t, [0, 20], [34, 0]);
  const drift = (prop.parallax ?? 0) * Math.sin(frame * 0.006);
  let flyX = 0;
  let flyY = 0;
  let spin = 0;
  if (prop.fly && t >= 0) {
    const p = lerp(t, [0, prop.fly.frames], [0, 1]);
    flyX = prop.fly.x * p;
    flyY = prop.fly.y * p * p;
    spin = (prop.spin ?? 0) * p * 540;
  }
  const exit = lerp(frame, [dur - 14, dur], [1, 0]);
  return (
    <div style={{
      position: "absolute", left: prop.x + drift + flyX, top: prop.y + rise + flyY,
      width: prop.w, height: s.h,
      transform: `translate(-50%, -50%) rotate(${(prop.rot ?? 0) + spin}deg) scaleX(${prop.flip ? -1 : 1})`,
      opacity: appear * exit, zIndex: 14, filter: paperShadow(1.2),
    }}>
      <Img src={part(prop.name)} style={{ width: prop.w, height: s.h }} />
    </div>
  );
};

/** Flip-book cut-out: one supplementary pose frame per hold window. */
export const FrameSeqSprite: React.FC<{
  seq: FrameSeq; frame: number; dur: number;
}> = ({ seq, frame, dur }) => {
  const t = frame - (seq.delay ?? 0);
  if (t < 0 || (seq.life !== undefined && t >= seq.life)) return null;
  const hold = Math.max(1, seq.hold ?? 10);
  const i = seq.loop === false
    ? Math.min(seq.parts.length - 1, Math.floor(t / hold))
    : Math.floor(t / hold) % seq.parts.length;
  const name = seq.parts[i];
  const s = sized(name, seq.w);
  const moveX = seq.moveTo !== undefined
    ? lerp(t, [0, seq.moveDur ?? dur], [seq.x, seq.moveTo]) - seq.x : 0;
  const fade = lerp(t, [0, 10], [0, 1]);
  const spin = (seq.spin ?? 0) * t;
  return (
    <div style={{
      position: "absolute", left: seq.x + moveX, top: seq.y,
      width: seq.w, height: s.h,
      transform: `translate(-50%, -50%) scaleX(${seq.flip ? -1 : 1}) rotate(${spin}deg)`,
      opacity: (seq.opacity ?? 1) * fade, zIndex: seq.z ?? 22, filter: paperShadow(1.5),
    }}>
      <Img src={part(name)} style={{ width: seq.w, height: s.h }} />
    </div>
  );
};

export const Sequences: React.FC<{
  items: FrameSeq[]; frame: number; dur: number;
}> = ({ items, frame, dur }) => (
  <>{items.map((q, i) => (
    <FrameSeqSprite key={`${q.parts[0]}-${i}`} seq={q} frame={frame} dur={dur} />
  ))}</>
);

/** Small floating paper scraps for dust / petals. */
export const Scraps: React.FC<{ frame: number; count?: number; mode: "dust" | "petals"; seed?: number }> = ({
  frame, count = 22, mode, seed = 0,
}) => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 40 }}>
    {Array.from({ length: count }, (_, i) => {
      const r = seeded(i * 3.7 + seed);
      const r2 = seeded(i * 9.1 + seed);
      const x = (r * 2100 - 90 + frame * (mode === "dust" ? 0.28 : 0.16) * (0.4 + r2)) % 2100 - 90;
      const y = (r2 * 1150 - frame * (mode === "dust" ? 0.16 : 0.55) * (0.5 + r)) % 1250;
      const size = mode === "dust" ? 8 + r * 22 : 12 + r * 26;
      return (
        <div key={i} style={{
          position: "absolute", left: x, top: y, width: size, height: size * (0.5 + r),
          backgroundColor: mode === "dust" ? COLORS.paperDeep : (r > 0.5 ? COLORS.vermilion : COLORS.paperLight),
          opacity: 0.22 + r2 * 0.38, borderRadius: mode === "petals" ? "60% 10% 60% 10%" : "40%",
          transform: `rotate(${frame * (0.4 + r) + i * 40}deg)`,
          filter: "drop-shadow(0 2px 2px rgba(60,36,18,0.25))",
        }} />
      );
    })}
  </AbsoluteFill>
);

