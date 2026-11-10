import type { CSSProperties, FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import {
  CLAMP,
  EASING_CURVES,
  OVERSHOOT,
  clamp01,
  fadeWindow,
  hexToRgba,
  pzoom,
  pop,
  seg,
  seeded,
  timecode,
} from "./motion";
import type { IntroTheme, ResolvedIntroConfig } from "./types";

const pad4 = (n: number): string => ("000" + Math.floor(n)).slice(-4);

/** Low-cost film grain: a tiny turbulence tile upscaled over the whole frame. */
export const Grain: FC<{ f: number; id: string; opacity?: number }> = ({
  f,
  id,
  opacity = 0.085,
}) => (
  <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%" }}
    >
      <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.84"
          numOctaves={2}
          seed={Math.floor(f / 2) % 89}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect x="0" y="0" width="320" height="180" filter={`url(#grain-${id})`} />
    </svg>
  </AbsoluteFill>
);

/** Instrument telemetry: registration corners, SMPTE readout, progress rail. */
export const HudFrame: FC<{
  f: number;
  frame: number;
  fps: number;
  durationInFrames: number;
  canonicalFrames: number;
  theme: IntroTheme;
  cfg: ResolvedIntroConfig;
  presetLabel: string;
  end?: number;
}> = ({
  f,
  frame,
  fps,
  durationInFrames,
  canonicalFrames,
  theme,
  cfg,
  presetLabel,
  end = 152,
}) => {
  const opacity = fadeWindow(f, 1, end, 10, 12) * 0.86;
  const corner: CSSProperties = {
    position: "absolute",
    width: 26,
    height: 26,
    borderColor: hexToRgba(theme.ink, 0.55),
    borderStyle: "solid",
    borderWidth: 0,
  };
  const label: CSSProperties = {
    fontFamily: theme.monoFont,
    fontSize: 13,
    letterSpacing: "0.2em",
    color: hexToRgba(theme.ink, 0.72),
    whiteSpace: "nowrap",
  };
  return (
    <AbsoluteFill
      style={{
        opacity,
        pointerEvents: "none",
        fontFamily: theme.monoFont,
        fontSize: 13,
        letterSpacing: "0.18em",
      }}
    >
      <div style={{ ...corner, top: 40, left: 48, borderTopWidth: 2, borderLeftWidth: 2 }} />
      <div style={{ ...corner, top: 40, right: 48, borderTopWidth: 2, borderRightWidth: 2 }} />
      <div style={{ ...corner, bottom: 40, left: 48, borderBottomWidth: 2, borderLeftWidth: 2 }} />
      <div style={{ ...corner, bottom: 40, right: 48, borderBottomWidth: 2, borderRightWidth: 2 }} />

      <div style={{ position: "absolute", top: 44, left: 90, ...label }}>
        <span style={{ color: theme.accent }}>●</span> {cfg.latinName}
        <span style={{ opacity: 0.45 }}> / CHANNEL IDENT</span>
      </div>
      <div style={{ position: "absolute", top: 44, right: 90, ...label }}>
        TC {timecode(frame, fps)} <span style={{ opacity: 0.45 }}>|</span> {Math.round(fps)} FPS
      </div>
      <div style={{ position: "absolute", bottom: 44, left: 90, ...label, opacity: 0.7 }}>
        {presetLabel.toUpperCase()}
      </div>
      <div style={{ position: "absolute", bottom: 44, right: 90, ...label, opacity: 0.7 }}>
        F {pad4(frame)} / {pad4(durationInFrames)}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 74,
          left: 90,
          right: 90,
          height: 2,
          backgroundColor: hexToRgba(theme.ink, 0.14),
        }}
      >
        <div
          style={{
            width: `${clamp01(f / canonicalFrames) * 100}%`,
            height: "100%",
            backgroundColor: theme.accent,
            boxShadow: `0 0 12px ${theme.accent}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Deterministic star dust: anticipation (inward drift) → shockwave (outward burst). */
export const Starfield: FC<{
  f: number;
  width: number;
  height: number;
  accent: string;
  hit?: number;
  count?: number;
}> = ({ f, width, height, accent, hit = 40, count = 108 }) => {
  const rand = seeded(20261110);
  const points = Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    r: rand(),
    phase: rand() * Math.PI * 2,
    depth: 0.3 + rand() * 0.7,
  }));
  const gather = seg(f, 0, hit, 0, 1);
  const burst = seg(f, hit, hit + 34, 0, 1, EASING_CURVES.expoOut);
  const flash = seg(f, hit, hit + 8, 1, 0, EASING_CURVES.expoOut);
  const cx = width / 2;
  const cy = height / 2;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      {points.map((p, i) => {
        const pull = 1 - 0.17 * gather;
        const push = 1 + 0.46 * burst * p.depth;
        const x = cx + (p.x * 2 - 1) * width * 0.64 * pull * push;
        const y = cy + (p.y * 2 - 1) * height * 0.64 * pull * push;
        const twinkle = 0.18 + 0.36 * (0.5 + 0.5 * Math.sin(f * 0.09 + p.phase));
        const opacity =
          clamp01(twinkle + flash * 0.55) * fadeWindow(f, 0, 152, 10, 26);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={0.7 + p.r * 1.8}
            fill={i % 9 === 0 ? accent : "#FFFFFF"}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};

/** Surveyor's reticle: dashed orbit, 72 ticks, crosshair, corner brackets. */
export const OpticsRing: FC<{
  f: number;
  width: number;
  height: number;
  theme: IntroTheme;
  start?: number;
  end?: number;
}> = ({ f, width, height, theme, start = 92, end = 152 }) => {
  const cx = width / 2;
  const cy = height / 2;
  const opacity = fadeWindow(f, start, end + 6, 14, 14) * 0.9;
  const scale = pzoom(f, start, start + 34, 0.84, 1, EASING_CURVES.expoOut);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }}
    >
      <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
        <line x1={-440} y1="0" x2={440} y2="0" stroke={hexToRgba(theme.ink, 0.1)} strokeWidth="1" />
        <line x1="0" y1={-440} x2="0" y2={440} stroke={hexToRgba(theme.ink, 0.1)} strokeWidth="1" />
        <circle r="252" fill="none" stroke={hexToRgba(theme.ink, 0.09)} strokeWidth="1" />
        <circle r="110" fill="none" stroke={hexToRgba(theme.accent, 0.12)} strokeWidth="1" strokeDasharray="3 9" />
      </g>
      <g transform={`translate(${cx} ${cy}) rotate(${f * 0.28}) scale(${scale})`}>
        <circle
          r="306"
          fill="none"
          stroke={hexToRgba(theme.accent, 0.32)}
          strokeWidth="1.5"
          strokeDasharray="2 16"
        />
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * Math.PI * 2;
          const major = i % 6 === 0;
          const len = major ? 17 : 7;
          return (
            <line
              key={i}
              x1={Math.cos(a) * 274}
              y1={Math.sin(a) * 274}
              x2={Math.cos(a) * (274 + len)}
              y2={Math.sin(a) * (274 + len)}
              stroke={major ? hexToRgba(theme.accent, 0.5) : hexToRgba(theme.ink, 0.22)}
              strokeWidth={major ? 2 : 1}
            />
          );
        })}
      </g>
    </svg>
  );
};

/** Expanding shockwave rings, plus an implosion ring that feeds the wordmark. */
export const RippleRings: FC<{
  f: number;
  width: number;
  height: number;
  theme: IntroTheme;
  hit?: number;
  implodeAt?: number;
}> = ({ f, width, height, theme, hit = 40, implodeAt = 118 }) => {
  const cx = width / 2;
  const cy = height / 2;
  const rings = [0, 1, 2, 3].map((i) => {
    const t = clamp01((f - hit - i * 7) / 44);
    const r = 30 + EASING_CURVES.expoOut(t) * 820;
    return { r, opacity: (1 - t) * 0.55, width: 3 - t * 2 };
  });
  const implode = seg(f, implodeAt, implodeAt + 24, 1, 0, EASING_CURVES.whipInOut);
  const implodeR = seg(f, implodeAt, implodeAt + 24, 720, 24, EASING_CURVES.whipInOut);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      {rings.map((ring, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={ring.r}
          fill="none"
          stroke={i === 0 ? theme.accent : hexToRgba(theme.ink, 0.5)}
          strokeWidth={ring.width}
          opacity={ring.opacity}
        />
      ))}
      <circle
        cx={cx}
        cy={cy}
        r={implodeR}
        fill="none"
        stroke={hexToRgba(theme.accent, 0.6)}
        strokeWidth="2"
        opacity={implode * 0.5}
      />
    </svg>
  );
};

/**
 * Kinetic wordmark. Per-character spring slam with squash & stretch,
 * intentional overshoot, motion blur and converging chromatic aberration.
 */
export const KineticWord: FC<{
  text: string;
  f: number;
  fps: number;
  start: number;
  stagger?: number;
  theme: IntroTheme;
  fontSize?: number;
  letterSpacing?: number;
  cjkAccent?: boolean;
  style?: CSSProperties;
}> = ({
  text,
  f,
  fps,
  start,
  stagger = 4,
  theme,
  fontSize = 150,
  letterSpacing = 2,
  cjkAccent = true,
  style,
}) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", ...style }}>
    {Array.from(text).map((ch, i) => {
      const p = pop(f, fps, start + i * stagger, {
        damping: 11,
        stiffness: 190,
        mass: 0.58,
      });
      const y = interpolate(p, [0, 1], [168, 0], OVERSHOOT);
      const rot = interpolate(p, [0, 1], [i % 2 === 0 ? -13 : 13, 0], OVERSHOOT);
      const sx = interpolate(p, [0, 1], [0.82, 1], OVERSHOOT);
      const sy = interpolate(p, [0, 1], [1.36, 1], OVERSHOOT);
      const blur = interpolate(p, [0, 1], [19, 0], CLAMP);
      const chroma = interpolate(p, [0, 1], [17, 0], CLAMP);
      const isCjk = /[\u3400-\u9FFF\uF900-\uFAFF]/.test(ch);
      const prevIsCjk =
        i > 0 && /[\u3400-\u9FFF\uF900-\uFAFF]/.test(Array.from(text)[i - 1]);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            marginLeft: isCjk && !prevIsCjk ? fontSize * 0.045 : 0,
            transform: `translateY(${y}px) rotate(${rot}deg) scale(${sx}, ${sy})`,
            filter: blur > 0.08 ? `blur(${blur}px)` : "none",
            opacity: clamp01(p * 2.7),
            fontFamily: isCjk ? theme.cnFont : theme.displayFont,
            fontSize: isCjk ? fontSize * 0.88 : fontSize,
            fontWeight: isCjk ? 800 : 900,
            color: isCjk && cjkAccent ? theme.accent : theme.ink,
            letterSpacing,
            lineHeight: 1.06,
            textShadow:
              chroma > 0.2
                ? `${chroma}px 0 rgba(255,45,110,0.82), ${-chroma}px 0 rgba(0,240,255,0.82)`
                : "none",
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      );
    })}
  </div>
);

/** Six-band spectral fan emanating from the prism, then collapsing back in. */
export const SpectrumRays: FC<{
  f: number;
  fps: number;
  width: number;
  height: number;
  theme: IntroTheme;
  start?: number;
  collapse?: number;
}> = ({ f, fps, width, height, theme, start = 44, collapse = 118 }) => {
  const cx = width / 2;
  const cy = height / 2;
  const visible = fadeWindow(f, start, collapse + 26, 6, 18);
  const fan = seg(f, start, start + 48, 0.4, 1, EASING_CURVES.expoOut);
  const collapseScale = seg(f, collapse, collapse + 24, 1, 0, EASING_CURVES.whipInOut);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: visible }}
    >
      <defs>
        {theme.spectrum.map((c, i) => (
          <linearGradient key={i} id={`intro-ray-${i}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="0.22" stopColor={c} stopOpacity="0.92" />
            <stop offset="1" stopColor={c} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      <g transform={`translate(${cx} ${cy})`}>
        {theme.spectrum.map((c, i) => {
          const grow = pop(f, fps, start + i * 3, {
            damping: 14,
            stiffness: 150,
            mass: 0.7,
          });
          const angle = (-26 + i * 10.4) * fan;
          const wobble = Math.sin(f * 0.075 + i * 1.3) * 3.2 * (1 - fan * 0.6);
          const length = Math.max(0, (280 + i * 20 + grow * 560) * collapseScale);
          return (
            <g key={i} transform={`rotate(${angle + wobble})`}>
              <rect
                x="0"
                y={-2.2 - i * 0.16}
                width={length}
                height={4.4 + i * 0.32}
                rx="2"
                fill={`url(#intro-ray-${i})`}
                opacity={0.34 + grow * 0.66}
              />
              <circle cx={length} cy="0" r={2.5 + grow * 3.5} fill={c} opacity={grow * collapseScale} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/** Gooey metaball energy core (feGaussianBlur + feColorMatrix). */
export const GooeyCore: FC<{
  f: number;
  width: number;
  height: number;
  theme: IntroTheme;
  hit?: number;
  end?: number;
}> = ({ f, width, height, theme, hit = 40, end = 112 }) => {
  const cx = width / 2;
  const cy = height / 2;
  const spread = pop(f, 60, hit, { damping: 12, stiffness: 120, mass: 0.9 });
  const gather = seg(f, hit + 24, end, 1, 0, EASING_CURVES.whipInOut);
  const orbit = (24 + spread * 118) * gather;
  const opacity = fadeWindow(f, hit, end + 2, 6, 12) * 0.86;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }}
    >
      <defs>
        <filter id="intro-goo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="17" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
      <g filter="url(#intro-goo)" fill={theme.accent} transform={`translate(${cx} ${cy})`}>
        <circle cx="0" cy="0" r={24 + gather * 12} />
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2 + f * 0.021;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * orbit}
              cy={Math.sin(a) * orbit}
              r={20 + 7 * Math.sin(f * 0.11 + i)}
            />
          );
        })}
      </g>
    </svg>
  );
};

/** Radial function of a regular polygon; sides = 0 is a perfect circle. */
const polygonRadius = (sides: number, theta: number, R: number): number => {
  if (sides <= 0) return R;
  const sector = (Math.PI * 2) / sides;
  const a = (((theta % sector) + sector) % sector) - sector / 2;
  return (R * Math.cos(Math.PI / sides)) / Math.cos(a);
};

const shapeRadius = (shape: number, theta: number, R: number): number =>
  shape === 0
    ? polygonRadius(3, theta + Math.PI / 2, R)
    : shape === 1
      ? R
      : polygonRadius(6, theta, R);

/** Vertex morphing: triangle → circle → hexagon, 72 shared vertices. */
export const morphPath = (t: number, R = 128, vertices = 72): string => {
  const stage = t < 0.5 ? 0 : 1;
  const local = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  const eased = clamp01(EASING_CURVES.whipInOut(clamp01(local)));
  let d = "";
  for (let i = 0; i < vertices; i++) {
    const theta = (i / vertices) * Math.PI * 2;
    const rFrom = shapeRadius(stage, theta, R);
    const rTo = shapeRadius(stage + 1, theta, R);
    const r = rFrom + (rTo - rFrom) * eased;
    d += `${i === 0 ? "M" : "L"}${(Math.cos(theta) * r).toFixed(2)} ${(Math.sin(theta) * r).toFixed(2)} `;
  }
  return `${d}Z`;
};

export const MorphPrism: FC<{
  f: number;
  width: number;
  height: number;
  theme: IntroTheme;
  start?: number;
  end?: number;
}> = ({ f, width, height, theme, start = 44, end = 100 }) => {
  const cx = width / 2;
  const cy = height / 2;
  const opacity = fadeWindow(f, start, end + 8, 8, 12);
  const scale = pzoom(f, start, start + 26, 0.5, 1, EASING_CURVES.expoOut);
  const spin = seg(f, start, end, -26, 20, EASING_CURVES.expoOut);
  // Energy condenses into a triangle, holds through dispersion, then dissolves
  // into a hexagon at the hand-off: circle → triangle → hexagon vertex morph.
  const condense = seg(f, start, start + 16, 1, 0, EASING_CURVES.expoOut);
  const dissolve = seg(f, end - 6, end + 8, 0, 0.5, EASING_CURVES.whipInOut);
  const t = clamp01(0.44 * condense + dissolve);
  const path = morphPath(t);
  const glow = 18 + 22 * seg(f, start, start + 12, 0, 1, EASING_CURVES.expoOut);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }}
    >
      <defs>
        <linearGradient id="intro-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="0.55" stopColor={theme.accent} stopOpacity="0.08" />
          <stop offset="1" stopColor="#00F0FF" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="intro-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#00F0FF" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FF3D8A" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <g
        transform={`translate(${cx} ${cy}) rotate(${spin}) scale(${scale})`}
        style={{ filter: `drop-shadow(0 0 ${glow}px ${hexToRgba(theme.accent, 0.55)})` }}
      >
        <path d={path} fill="url(#intro-glass)" stroke="url(#intro-edge)" strokeWidth="2.6" />
        <path
          d={morphPath(t, 96)}
          fill="none"
          stroke={hexToRgba(theme.ink, 0.24)}
          strokeWidth="1"
        />
        <line x1="-128" y1="-64" x2="128" y2="-64" stroke={hexToRgba(theme.ink, 0.3)} strokeWidth="1" />
      </g>
    </svg>
  );
};

/** Oscilloscope trace with a decaying heartbeat envelope. */
export const Waveform: FC<{
  f: number;
  width: number;
  height: number;
  theme: IntroTheme;
  start?: number;
}> = ({ f, width, height, theme, start = 8 }) => {
  const cy = height / 2;
  const elapsed = Math.max(0, f - start);
  const envelope = Math.exp(-elapsed * 0.055) * seg(f, start, start + 5, 0, 1);
  const amp = 210 * envelope;
  let d = "";
  for (let x = 0; x <= width; x += 8) {
    const distance = Math.abs(x - width / 2) / (width * 0.34);
    const spatial = Math.exp(-distance * distance);
    const y =
      cy +
      Math.sin(x * 0.021 + f * 0.38) * amp * spatial +
      Math.sin(x * 0.009 - f * 0.22) * amp * 0.32 * spatial;
    d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)} `;
  }
  const opacity = fadeWindow(f, start, 64, 4, 12);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }}
    >
      <path d={d} fill="none" stroke={theme.accent} strokeWidth="14" opacity="0.14" />
      <path d={d} fill="none" stroke={theme.accent} strokeWidth="2.6" />
      <line
        x1="0"
        y1={cy}
        x2={width}
        y2={cy}
        stroke={hexToRgba(theme.ink, 0.18)}
        strokeWidth="1"
        strokeDasharray="4 12"
      />
    </svg>
  );
};

/** Shared helper for variants: a full-bleed colour wash with a hot centre. */
export const CentreGlow: FC<{
  f: number;
  theme: IntroTheme;
  hit?: number;
  intensity?: number;
}> = ({ f, theme, hit = 40, intensity = 1 }) => {
  const pulse = seg(f, hit, hit + 26, 1, 0, EASING_CURVES.expoOut);
  const breath = 0.35 + 0.1 * Math.sin(f * 0.06);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, ${hexToRgba(
          theme.accent,
          (breath + pulse * 0.4) * 0.13 * intensity,
        )} 0%, ${hexToRgba(theme.void, 0)} 58%)`,
        pointerEvents: "none",
      }}
    />
  );
};

