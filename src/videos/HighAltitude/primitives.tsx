import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SPRING_CONFIGS } from "../../shared/motion-presets";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */

export const FONT =
  "'Noto Sans SC', 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans', sans-serif";
export const MONO = "'SF Mono', 'JetBrains Mono', Consolas, 'Noto Sans Mono', monospace";

export const INK = {
  deep: "#04070F",
  mid: "#081120",
  high: "#0C1A2E",
  horizon: "#14283F",
  white: "#F5F8FF",
  dim: "#9FB0C8",
};

export const ACCENT = {
  sun: "#FFD166",
  warm: "#FFB347",
  ember: "#FF7A45",
  ice: "#8FD8FF",
  cyan: "#7FE3FF",
  indigo: "#7C9CFF",
  lime: "#CCFF00",
  red: "#FF5C6C",
  violet: "#B49CFF",
};

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const seg = (
  f: number,
  a: number,
  b: number,
  from: number,
  to: number,
  ease?: (t: number) => number,
) =>
  interpolate(f, [a, b], [from, to], {
    ...CLAMP,
    ...(ease ? { easing: ease } : {}),
  });

export const pop = (
  frame: number,
  fps: number,
  delay = 0,
  config: { damping: number; stiffness: number; mass: number } = SPRING_CONFIGS.snappy,
) =>
  spring({
    frame: frame - delay,
    fps,
    config,
    durationInFrames: 45,
  });

/** Deterministic pseudo-random sequence (mulberry32). */
export const seeded = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pad = (n: number, len = 2): string => {
  const s = String(n);
  return s.length >= len ? s : "0".repeat(len - s.length) + s;
};

export const fmt = (n: number): string =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const mixHex = (a: string, b: string, t: number): string => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const p = pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.min(1, Math.max(0, t))));
  return `#${p.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

/* ------------------------------------------------------------------ */
/* Scene wrapper: camera drift + fade in/out                           */
/* ------------------------------------------------------------------ */

export const Scene: React.FC<{
  dur: number;
  children: React.ReactNode;
  fadeIn?: number;
  fadeOut?: number;
  camera?: number;
}> = ({ dur, children, fadeIn = 10, fadeOut = 10, camera = 0.02 }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    seg(frame, 0, fadeIn, 0, 1),
    seg(frame, dur - fadeOut, dur, 1, 0),
  );
  const scale = 1 + camera * (frame / Math.max(1, dur));
  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
        fontFamily: FONT,
        color: INK.white,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Sky: gradient + stars + drifting nebulas                            */
/* ------------------------------------------------------------------ */

export const Sky: React.FC<{
  top?: string;
  mid?: string;
  bottom?: string;
  stars?: number;
  nebula?: string;
  seed?: number;
}> = ({
  top = "#02040A",
  mid = INK.mid,
  bottom = INK.high,
  stars = 80,
  nebula,
  seed = 7,
}) => {
  const frame = useCurrentFrame();
  const rnd = seeded(seed);
  const starArr = new Array(stars).fill(0).map((_, i) => {
    const x = rnd() * 1920;
    const y = rnd() * 1080;
    const r = 0.6 + rnd() * 1.8;
    const ph = rnd() * Math.PI * 2;
    const sp = 0.02 + rnd() * 0.05;
    return { x, y, r, ph, sp, key: i };
  });
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${bottom} 100%)`,
        overflow: "hidden",
      }}
    >
      {nebula ? (
        <>
          <div
            style={{
              position: "absolute",
              width: 1100,
              height: 1100,
              left: -300 + Math.sin(frame / 260) * 60,
              top: -420,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${nebula}22 0%, transparent 62%)`,
              filter: "blur(10px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 900,
              height: 900,
              right: -260 + Math.cos(frame / 300) * 50,
              bottom: -380,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${nebula}18 0%, transparent 60%)`,
              filter: "blur(12px)",
            }}
          />
        </>
      ) : null}
      {starArr.map((s) => (
        <div
          key={s.key}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.r * 2,
            height: s.r * 2,
            borderRadius: "50%",
            backgroundColor: "#DCE9FF",
            opacity: 0.25 + 0.55 * Math.abs(Math.sin(frame * s.sp + s.ph)),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Sun                                                                */
/* ------------------------------------------------------------------ */

export const Sun: React.FC<{
  x: number;
  y: number;
  r?: number;
  glow?: number;
  pulse?: boolean;
  rays?: boolean;
  color?: string;
}> = ({ x, y, r = 90, glow = 1, pulse = true, rays = false, color = ACCENT.sun }) => {
  const frame = useCurrentFrame();
  const p = pulse ? 1 + 0.015 * Math.sin(frame / 18) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute",
          width: r * 10 * glow,
          height: r * 10 * glow,
          left: -r * 5 * glow,
          top: -r * 5 * glow,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}33 0%, ${color}12 28%, transparent 62%)`,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: r * 4 * glow,
          height: r * 4 * glow,
          left: -r * 2 * glow,
          top: -r * 2 * glow,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}55 0%, ${color}22 40%, transparent 70%)`,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: r * 2,
          height: r * 2,
          left: -r,
          top: -r,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 36%, #FFF6D8 0%, ${color} 55%, #FF8E3C 100%)`,
          boxShadow: `0 0 ${r * 0.9}px ${color}aa`,
          transform: `scale(${p})`,
        }}
      />
      {rays
        ? new Array(14).fill(0).map((_, i) => {
            const ang = (i / 14) * Math.PI * 2 + frame / 380;
            const len = r * (2.6 + 1.1 * Math.abs(Math.sin(frame / 40 + i * 1.7)));
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: Math.cos(ang) * r * 1.9,
                  top: Math.sin(ang) * r * 1.9,
                  width: len,
                  height: 3,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${color}99, transparent)`,
                  transform: `rotate(${ang}rad)`,
                  transformOrigin: "0 50%",
                  opacity: 0.5,
                }}
              />
            );
          })
        : null}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Mountain ridges                                                    */
/* ------------------------------------------------------------------ */

export const Mountains: React.FC<{
  y?: number;
  shift?: number;
  snow?: boolean;
  glow?: number;
  scale?: number;
  opacity?: number;
}> = ({ y = 720, shift = 0, snow = false, glow = 0, scale = 1, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const path =
    "M0 260 L150 150 L260 210 L420 60 L540 180 L680 40 L800 170 L960 90 L1100 200 L1240 70 L1400 190 L1540 110 L1700 210 L1830 130 L1920 200 L1920 360 L0 360 Z";
  return (
    <svg
      width={1920}
      height={400}
      viewBox="0 0 1920 400"
      style={{
        position: "absolute",
        left: 0,
        top: y - 400 * (scale - 1) * 0,
        transform: `translateY(${shift}px) scale(${scale})`,
        transformOrigin: "50% 100%",
        opacity,
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id="mtnGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B3352" />
          <stop offset="100%" stopColor="#0A1526" />
        </linearGradient>
      </defs>
      <path d={path} fill="url(#mtnGrad)" />
      {snow ? (
        <path
          d="M420 60 L470 100 L500 82 L540 112 L560 90 L600 120 L640 66 L680 40 L720 96 L760 120 L800 86 L840 128 L880 100 L920 108 L960 90 L1000 120 L1030 96 L1060 124 L1100 98 L1130 90 L1160 122 L1200 96 L1240 70 L1270 104 L1310 96 L1340 120 L1380 94 L1420 116 L1400 190 L1240 70 L1100 200 L960 90 L800 170 L680 40 Z"
          fill="#DFF1FF"
          opacity={0.92}
        />
      ) : null}
      {glow > 0 ? (
        <path
          d={path}
          fill="none"
          stroke={ACCENT.ice}
          strokeWidth={2.5}
          opacity={0.25 + 0.1 * Math.sin(frame / 20) * glow}
        />
      ) : null}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Tiny climber silhouette                                            */
/* ------------------------------------------------------------------ */

export const Climber: React.FC<{
  x: number;
  y: number;
  scale?: number;
  mode?: "hot" | "cold" | "coat" | "calm";
  walk?: boolean;
}> = ({ x, y, scale = 1, mode = "calm", walk = false }) => {
  const frame = useCurrentFrame();
  const shiver =
    mode === "cold" || mode === "coat" ? Math.sin(frame * 0.9) * 2.4 : 0;
  const swing = walk ? Math.sin(frame * 0.22) : 0;
  const liftL = Math.max(0, swing) * 5;
  const liftR = Math.max(0, -swing) * 5;
  const armSwing = swing * 7;
  const bob = walk ? -Math.abs(swing) * 2 : 0;

  const ink = "#0A1526";
  const skin = "#F3D2AD";
  const pants = "#22374E";
  const boot = "#0B1422";
  const hot = mode === "hot";
  const coat = mode === "coat";
  const shivering = mode === "cold" || mode === "coat";
  const torso = hot ? "#FF8A54" : coat ? "#49573A" : "#33506B";
  const armIn = shivering ? 7 : 0;

  return (
    <svg
      width={90}
      height={130}
      viewBox="0 0 90 130"
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -100%) translateY(${bob}px) scale(${scale}) rotate(${shiver * 0.35}deg)`,
        transformOrigin: "50% 100%",
        overflow: "visible",
      }}
    >
      <g stroke={ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
        {/* hood behind the head in coat mode */}
        {coat ? <circle cx={45} cy={22} r={17} fill="#3E4C31" /> : null}
        {/* daypack peeking behind the shoulders */}
        {!coat ? <rect x={52} y={47} width={14} height={23} rx={5.5} fill="#1E3348" /> : null}

        {/* legs */}
        <g transform={`rotate(${-swing * 4} 45 86) translate(0 ${-liftL})`}>
          <rect x={34.5} y={84} width={10} height={hot ? 16 : 30} rx={5} fill={pants} />
          {hot ? <rect x={35.6} y={98} width={7.8} height={16} rx={3.9} fill={skin} /> : null}
          <path d="M30.5 112 L45 112 L45 119 Q45 122 41 122 L31.5 122 Q29 122 29 119 Z" fill={boot} />
        </g>
        <g transform={`rotate(${swing * 4} 45 86) translate(0 ${-liftR})`}>
          <rect x={45.5} y={84} width={10} height={hot ? 16 : 30} rx={5} fill={pants} />
          {hot ? <rect x={46.6} y={98} width={7.8} height={16} rx={3.9} fill={skin} /> : null}
          <path d="M45 112 L59.5 112 L61 119 Q61 122 58.5 122 L49 122 Q45 122 45 119 Z" fill={boot} />
        </g>

        {/* torso */}
        {coat ? (
          <>
            <path d="M27 44 Q45 35 63 44 L67 106 Q45 113 23 106 Z" fill={torso} />
            <path d="M45 42 L45 106" stroke={ink} strokeWidth={1.4} opacity={0.45} />
            <rect x={24} y={64} width={42} height={7} rx={3} fill="#2C3623" />
            <rect x={41.5} y={63} width={7} height={9} rx={2} fill="#C9D8B0" />
            <path d="M34 39 Q45 31 56 39 Q45 47 34 39 Z" fill="#E9F4FF" />
          </>
        ) : (
          <>
            <path d="M29 44 Q45 37 61 44 L58 86 Q45 91 32 86 Z" fill={torso} />
            <path d="M36 41 L45 49 L54 41 Q45 37 36 41 Z" fill="#1E3348" />
            <path d="M45 50 L45 86" stroke={ink} strokeWidth={1.3} opacity={0.4} />
            <path d="M37.5 43 L35.5 84" stroke="#16263A" strokeWidth={2.6} fill="none" />
            <path d="M52.5 43 L54.5 84" stroke="#16263A" strokeWidth={2.6} fill="none" />
          </>
        )}

        {/* arms */}
        <g transform={`rotate(${armIn + armSwing} 31.5 45)`}>
          {hot ? (
            <>
              <rect x={27.5} y={43} width={8.5} height={15} rx={4.2} fill={torso} />
              <rect x={28.2} y={56} width={7.2} height={16} rx={3.6} fill={skin} />
            </>
          ) : (
            <rect x={27.5} y={43} width={8.5} height={29} rx={4.2} fill={torso} />
          )}
          <circle cx={31.6} cy={74} r={4} fill={skin} />
        </g>
        <g transform={`rotate(${-armIn - armSwing} 58.5 45)`}>
          {hot ? (
            <>
              <rect x={54} y={43} width={8.5} height={15} rx={4.2} fill={torso} />
              <rect x={54.6} y={56} width={7.2} height={16} rx={3.6} fill={skin} />
            </>
          ) : (
            <rect x={54} y={43} width={8.5} height={29} rx={4.2} fill={torso} />
          )}
          <circle cx={58.4} cy={74} r={4} fill={skin} />
        </g>

        {/* neck, ears, head */}
        <rect x={40.5} y={33} width={9} height={9} rx={3} fill={skin} />
        <circle cx={33.5} cy={26} r={2.6} fill={skin} />
        <circle cx={56.5} cy={26} r={2.6} fill={skin} />
        <circle cx={45} cy={24} r={11} fill={skin} />
        {hot ? (
          <>
            <path d="M34 22 Q34 9 45 9 Q56 9 56 22 Z" fill="#FFC46B" />
            <path d="M55 18 Q64 18 65 22.5 L56 24 Z" fill="#FFC46B" />
          </>
        ) : (
          <>
            <path d="M33.5 23 Q33.5 8 45 8 Q56.5 8 56.5 23 Z" fill="#7FD8FF" />
            <rect x={32.5} y={19.5} width={25} height={6} rx={3} fill="#7FD8FF" />
            <circle cx={45} cy={7.5} r={3.2} fill="#7FD8FF" />
          </>
        )}
        <circle cx={41} cy={27} r={1.7} fill={ink} stroke="none" />
        <circle cx={49} cy={27} r={1.7} fill={ink} stroke="none" />
        <path d="M42 31.5 Q45 33.5 48 31.5" fill="none" strokeWidth={1.5} />

        {mode === "cold" ? (
          <path d="M35.5 35 Q45 40 54.5 35 L56 40 Q45 46 34 40 Z" fill="#7FD8FF" opacity={0.9} />
        ) : null}
      </g>
      {hot ? (
        <>
          <circle cx={38} cy={29.5} r={2.2} fill="#FF9A78" opacity={0.55} />
          <circle cx={52} cy={29.5} r={2.2} fill="#FF9A78" opacity={0.55} />
          <circle cx={30} cy={19} r={2.4} fill="#8FD8FF" opacity={0.9} />
          <circle cx={61} cy={23} r={2} fill="#8FD8FF" opacity={0.8} />
        </>
      ) : null}
      {shivering ? (
        <g stroke="#9FE5FF" strokeWidth={1.8} opacity={0.7} fill="none" strokeLinecap="round">
          <path d="M18 26 l5 9" />
          <path d="M72 26 l-5 9" />
        </g>
      ) : null}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Thermometer                                                        */
/* ------------------------------------------------------------------ */

export const Thermometer: React.FC<{
  x: number;
  y: number;
  height?: number;
  value: number;
  min?: number;
  max?: number;
  label?: string;
}> = ({ x, y, height = 220, value, min = -20, max = 40, label }) => {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const color = mixHex("#7FE3FF", "#FF7A45", t);
  const bulb = 18;
  const innerH = height - bulb * 2 - 16;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 14 + 8,
          height,
          borderRadius: 12,
          border: "2.5px solid rgba(255,255,255,0.55)",
          backgroundColor: "rgba(255,255,255,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 3,
            right: 3,
            height: `${12 + innerH * t}px`,
            borderRadius: 8,
            background: `linear-gradient(180deg, ${color}, ${mixHex(color, "#ffffff", 0.25)})`,
            boxShadow: `0 0 16px ${color}88`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: 4,
            width: 34,
            height: 34,
            borderRadius: "50%",
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}aa`,
            transform: "translateX(-50%)",
          }}
        />
      </div>
      {label !== undefined ? (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22,
            fontWeight: 700,
            color,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Tag / pill label                                                    */
/* ------------------------------------------------------------------ */

export const Tag: React.FC<{
  color?: string;
  size?: number;
  solid?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ color = ACCENT.ice, size = 24, solid = false, children, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: `${size * 0.28}px ${size * 0.7}px`,
      borderRadius: 999,
      border: `1.5px solid ${color}${solid ? "ff" : "88"}`,
      backgroundColor: solid ? color : `${color}14`,
      color: solid ? "#05080F" : color,
      fontFamily: MONO,
      fontSize: size,
      fontWeight: 700,
      letterSpacing: "0.06em",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

/* ------------------------------------------------------------------ */
/* Headline block (per-scene)                                         */
/* ------------------------------------------------------------------ */

export const Headline: React.FC<{
  x?: number;
  y?: number;
  kicker?: string;
  title: string;
  accent?: string;
  progress: number;
  size?: number;
}> = ({ x = 120, y = 120, kicker, title, accent = ACCENT.ice, progress, size = 64 }) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    {kicker ? (
      <div
        style={{
          fontFamily: MONO,
          fontSize: 20,
          letterSpacing: "0.32em",
          color: accent,
          opacity: 0.85 * progress,
          transform: `translateY(${(1 - progress) * 14}px)`,
          marginBottom: 12,
        }}
      >
        {kicker}
      </div>
    ) : null}
    <div
      style={{
        fontSize: size,
        fontWeight: 900,
        letterSpacing: "0.01em",
        lineHeight: 1.16,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 22}px)`,
        textShadow: "0 6px 40px rgba(0,0,0,0.45)",
      }}
    >
      {title}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Arrows                                                             */
/* ------------------------------------------------------------------ */

export const Arrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
  progress?: number;
  dashed?: boolean;
  head?: number;
}> = ({ x1, y1, x2, y2, color = ACCENT.ice, width = 4, progress = 1, dashed = false, head = 16 }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const shown = len * progress;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x1,
          top: y1 - width / 2,
          width: shown,
          height: width,
          background: dashed
            ? `repeating-linear-gradient(90deg, ${color} 0 14px, transparent 14px 26px)`
            : color,
          borderRadius: width / 2,
          transform: `rotate(${ang}deg)`,
          transformOrigin: "0 50%",
          opacity: 0.95,
        }}
      />
      {progress > 0.9 ? (
        <div
          style={{
            position: "absolute",
            left: x2 - head,
            top: y2 - head * 0.62,
            width: 0,
            height: 0,
            borderLeft: `${head}px solid ${color}`,
            borderTop: `${head * 0.62}px solid transparent`,
            borderBottom: `${head * 0.62}px solid transparent`,
            transform: `rotate(${ang}deg)`,
            opacity: (progress - 0.9) * 10,
          }}
        />
      ) : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Waves: shortwave zigzag / longwave sine                            */
/* ------------------------------------------------------------------ */

export const ZigzagRay: React.FC<{
  x: number;
  y1: number;
  y2: number;
  color?: string;
  width?: number;
  amp?: number;
  speed?: number;
  progress?: number;
}> = ({ x, y1, y2, color = ACCENT.sun, width = 4, amp = 10, speed = 2.2, progress = 1 }) => {
  const frame = useCurrentFrame();
  const n = 14;
  const pts: string[] = [];
  const total = (y2 - y1) * progress;
  for (let i = 0; i <= n; i++) {
    const ty = y1 + (total * i) / n;
    const tx = x + (i % 2 === 0 ? -amp : amp) * (i === 0 || i === n ? 0.2 : 1);
    pts.push(`${tx},${ty}`);
  }
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      width={1920}
      height={1080}
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinejoin="round"
        strokeDasharray="26 14"
        strokeDashoffset={-frame * speed}
        opacity={0.9}
      />
    </svg>
  );
};

export const HeatWave: React.FC<{
  x: number;
  y: number;
  w?: number;
  color?: string;
  amp?: number;
  thickness?: number;
  phase?: number;
  opacity?: number;
}> = ({ x, y, w = 140, color = ACCENT.ember, amp = 10, thickness = 4, phase = 0, opacity = 0.9 }) => {
  const frame = useCurrentFrame();
  const n = 16;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const tx = x + (w * i) / n;
    const ty = y + Math.sin(i * 0.7 + frame * 0.12 + phase) * amp;
    pts.push(`${tx},${ty}`);
  }
  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      width={1920}
      height={1080}
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        opacity={opacity}
      />
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Molecule                                                           */
/* ------------------------------------------------------------------ */

export const Molecule: React.FC<{
  x: number;
  y: number;
  label: string;
  color?: string;
  r?: number;
  grab?: number; // 0..1 arm extension
  frozen?: boolean;
}> = ({ x, y, label, color = ACCENT.cyan, r = 34, grab = 0, frozen = false }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.05 + x * 0.01) * 4;
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r + bob,
        width: r * 2,
        height: r * 2,
      }}
    >
      <div
        style={{
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          border: `3px solid ${color}`,
          backgroundColor: `${color}1A`,
          boxShadow: `0 0 24px ${color}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO,
          fontSize: Math.max(14, r * 0.52),
          fontWeight: 800,
          color,
          opacity: frozen ? 0.45 : 1,
        }}
      >
        {label}
      </div>
      {/* little catching arms */}
      <div
        style={{
          position: "absolute",
          left: -r * 0.4,
          top: r * 0.5,
          width: r * 0.9,
          height: 3,
          borderRadius: 2,
          backgroundColor: color,
          transform: `rotate(${-30 - grab * 35}deg)`,
          transformOrigin: "100% 50%",
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -r * 0.4,
          top: r * 0.5,
          width: r * 0.9,
          height: 3,
          borderRadius: 2,
          backgroundColor: color,
          transform: `rotate(${30 + grab * 35}deg)`,
          transformOrigin: "0 50%",
          opacity: 0.85,
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Air parcel blob                                                    */
/* ------------------------------------------------------------------ */

export const Parcel: React.FC<{
  x: number;
  y: number;
  r?: number;
  color?: string;
  heat?: number; // 0 cold .. 1 hot
  wobble?: number;
  label?: string;
}> = ({ x, y, r = 70, color, heat = 0.5, wobble = 1, label }) => {
  const frame = useCurrentFrame();
  const c = color || mixHex("#6FB6FF", "#FF9A4D", heat);
  const n = 10;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const rr = r * (1 + 0.06 * wobble * Math.sin(frame * 0.09 + i * 1.9));
    pts.push(`${Math.cos(ang) * rr},${Math.sin(ang) * rr}`);
  }
  const d = (() => {
    let path = `M ${pts[0]}`;
    for (let i = 1; i <= n; i++) {
      const p = pts[i % n].split(",").map(Number);
      const prev = pts[i - 1].split(",").map(Number);
      const mx = (p[0] + prev[0]) / 2;
      const my = (p[1] + prev[1]) / 2;
      path += ` Q ${prev[0]} ${prev[1]} ${mx} ${my}`;
    }
    return `${path} Z`;
  })();
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <svg
        width={r * 3}
        height={r * 3}
        viewBox={`${-r * 1.5} ${-r * 1.5} ${r * 3} ${r * 3}`}
        style={{ position: "absolute", left: -r * 1.5, top: -r * 1.5, overflow: "visible" }}
      >
        <defs>
          <radialGradient id={`parcel-${Math.round(x)}-${Math.round(y)}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor={mixHex(c, "#ffffff", 0.5)} stopOpacity={0.95} />
            <stop offset="55%" stopColor={c} stopOpacity={0.55} />
            <stop offset="100%" stopColor={c} stopOpacity={0.22} />
          </radialGradient>
        </defs>
        <path d={d} fill={`url(#parcel-${Math.round(x)}-${Math.round(y)})`} stroke={c} strokeWidth={3} style={{ filter: `drop-shadow(0 0 12px ${c}66)` }} />
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
            fontFamily: MONO,
            fontSize: 24,
            fontWeight: 800,
            color: "#FFFFFF",
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Particles (deterministic)                                          */
/* ------------------------------------------------------------------ */

export const Motes: React.FC<{
  count?: number;
  seed?: number;
  color?: string;
  rise?: number;
  size?: number;
  opacity?: number;
  area?: { x: number; y: number; w: number; h: number };
}> = ({
  count = 40,
  seed = 3,
  color = ACCENT.ice,
  rise = 0.6,
  size = 3,
  opacity = 0.5,
  area = { x: 0, y: 0, w: 1920, h: 1080 },
}) => {
  const frame = useCurrentFrame();
  const rnd = seeded(seed);
  const items = new Array(count).fill(0).map((_, i) => {
    const x0 = rnd();
    const y0 = rnd();
    const sp = 0.2 + rnd() * 0.9;
    const ph = rnd() * Math.PI * 2;
    const drift = (rnd() - 0.5) * 30;
    return { x0, y0, sp, ph, drift, key: i };
  });
  return (
    <>
      {items.map((p) => {
        const y =
          area.y +
          ((((p.y0 * area.h - frame * rise * p.sp) % area.h) + area.h) % area.h);
        const x = area.x + p.x0 * area.w + Math.sin(frame / 50 + p.ph) * p.drift;
        return (
          <div
            key={p.key}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: opacity * (0.4 + 0.6 * Math.abs(Math.sin(frame / 30 + p.ph))),
            }}
          />
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Gauge (pressure dial)                                              */
/* ------------------------------------------------------------------ */

export const Gauge: React.FC<{
  x: number;
  y: number;
  value: number; // 0..1
  label: string;
  color?: string;
  size?: number;
}> = ({ x, y, value, label, color = ACCENT.cyan, size = 170 }) => {
  const ang = -120 + 240 * Math.min(1, Math.max(0, value));
  const r = size / 2;
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={r - 6} fill="rgba(8,15,28,0.7)" stroke={`${color}55`} strokeWidth={2} />
        {new Array(13).fill(0).map((_, i) => {
          const a = (-120 + (240 * i) / 12) * (Math.PI / 180);
          const x1 = r + Math.sin(a) * (r - 18);
          const y1 = r - Math.cos(a) * (r - 18);
          const x2 = r + Math.sin(a) * (r - 28);
          const y2 = r - Math.cos(a) * (r - 28);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${color}66`} strokeWidth={2} />;
        })}
        <g transform={`rotate(${ang} ${r} ${r})`}>
          <line x1={r} y1={r + 8} x2={r} y2={28} stroke={color} strokeWidth={4} strokeLinecap="round" />
        </g>
        <circle cx={r} cy={r} r={7} fill={color} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 6,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 18,
          fontWeight: 800,
          color,
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Chapter card                                                       */
/* ------------------------------------------------------------------ */

export const ChapterCard: React.FC<{
  num: string;
  title: string;
  subtitle?: string;
  accent: string;
  dur: number;
  en?: string;
}> = ({ num, title, subtitle, accent, dur, en }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const numIn = pop(frame, fps, 2, SPRING_CONFIGS.smooth);
  const titleIn = pop(frame, fps, 10, SPRING_CONFIGS.snappy);
  const subIn = pop(frame, fps, 18);
  const sweep = seg(frame, 0, 26, -30, 130);
  const wipeOut = seg(frame, dur - 16, dur, 1, 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(1100px 600px at 30% 45%, ${accent}1c 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5 * wipeOut,
          background: `linear-gradient(115deg, transparent 42%, ${accent}2e 50%, transparent 58%)`,
          transform: `translateX(${(sweep - 50) * 12}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 250,
          fontSize: 400,
          fontWeight: 900,
          lineHeight: 1,
          fontFamily: MONO,
          color: "transparent",
          WebkitTextStroke: `2.5px ${accent}`,
          opacity: 0.55,
          transform: `translateY(${(1 - numIn) * 120}px)`,
        }}
      >
        {num}
      </div>
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 360,
          maxWidth: 1100,
        }}
      >
        {en ? (
          <div
            style={{
              fontFamily: MONO,
              fontSize: 22,
              letterSpacing: "0.42em",
              color: accent,
              marginBottom: 18,
              opacity: titleIn,
            }}
          >
            {en}
          </div>
        ) : null}
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: "0.02em",
            transform: `translateY(${(1 - titleIn) * 50}px)`,
            opacity: Math.min(1, titleIn * 1.2),
            textShadow: "0 10px 60px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 26,
              fontFamily: MONO,
              fontSize: 30,
              color: "rgba(235,243,255,0.78)",
              letterSpacing: "0.04em",
              opacity: subIn,
              transform: `translateY(${(1 - subIn) * 24}px)`,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 156,
          bottom: 180,
          width: 90,
          height: 4,
          backgroundColor: accent,
          opacity: subIn,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Callout: small label anchored with a leader line                   */
/* ------------------------------------------------------------------ */

export const Callout: React.FC<{
  x: number;
  y: number;
  text: string;
  color?: string;
  dir?: "left" | "right";
  progress?: number;
  size?: number;
}> = ({ x, y, text, color = ACCENT.ice, dir = "right", progress = 1, size = 24 }) => {
  const w = Math.max(120, text.length * size * 0.62 + 36);
  return (
    <div
      style={{
        position: "absolute",
        left: dir === "right" ? x : x - w,
        top: y - 22,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 10}px)`,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "10px 18px",
          borderRadius: 8,
          border: `1.5px solid ${color}88`,
          backgroundColor: "rgba(5,10,20,0.72)",
          fontFamily: MONO,
          fontSize: size,
          fontWeight: 700,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: "absolute",
          top: "100%",
          [dir === "right" ? "left" : "right"]: 24,
          width: 1.5,
          height: 26,
          backgroundColor: `${color}88`,
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Ground slab with warm/cool glow                                    */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Campfire: logs + three teardrop flame layers + sparks               */
/* (x, y) is the ground contact point at the centre of the logs.       */
/* ------------------------------------------------------------------ */

const FLAME_PATH =
  "M0 0 C -40 -14 -52 -52 -32 -92 C -20 -116 -10 -128 0 -156 C 10 -128 20 -116 32 -92 C 52 -52 40 -14 0 0 Z";

export const Campfire: React.FC<{
  x: number;
  y: number;
  scale?: number;
  glow?: number;
  sparks?: number;
}> = ({ x, y, scale = 1, glow = 1, sparks = 6 }) => {
  const frame = useCurrentFrame();
  const flick = (i: number) =>
    1 + 0.07 * Math.sin(frame / (4.5 + i * 1.7) + i * 2.1) + 0.04 * Math.sin(frame / 1.9 + i);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute",
          left: -300 * scale * glow,
          top: -330 * scale * glow,
          width: 600 * scale * glow,
          height: 600 * scale * glow,
          background: `radial-gradient(circle, ${ACCENT.ember}55 0%, transparent 62%)`,
          mixBlendMode: "screen",
          opacity: 0.7 + 0.12 * Math.sin(frame / 9),
        }}
      />
      <svg
        width={260 * scale}
        height={260 * scale}
        viewBox="-130 -230 260 260"
        style={{ position: "absolute", left: -130 * scale, top: -230 * scale, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="cfOuter" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#FFB347" />
            <stop offset="55%" stopColor="#FF7A45" />
            <stop offset="100%" stopColor="#FF5C3C" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="cfMid" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#FFE9B0" />
            <stop offset="60%" stopColor="#FFC65A" />
            <stop offset="100%" stopColor="#FF9A3C" />
          </linearGradient>
          <linearGradient id="cfCore" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#FFF8E2" />
            <stop offset="100%" stopColor="#FFE2A0" />
          </linearGradient>
        </defs>
        <ellipse cx={0} cy={8} rx={76} ry={11} fill="#160D09" opacity={0.85} />
        {[0, 1, 2].map((i) => (
          <g
            key={i}
            transform={`translate(0 ${-26 - i * 2}) scale(${(1 - i * 0.16) * (1 + (flick(i) - 1) * 0.6)} ${(1 - i * 0.16) * flick(i)})`}
          >
            <path d={FLAME_PATH} fill={i === 0 ? "url(#cfOuter)" : i === 1 ? "url(#cfMid)" : "url(#cfCore)"} />
          </g>
        ))}
        <g transform="rotate(10)">
          <rect x={-70} y={-24} width={140} height={19} rx={9.5} fill="#3E2317" />
          <ellipse cx={70} cy={-14.5} rx={5.5} ry={9.5} fill="#7A4B30" />
        </g>
        <g transform="rotate(-9)">
          <rect x={-76} y={-12} width={152} height={21} rx={10.5} fill="#4A2A1B" />
          <ellipse cx={76} cy={-1.5} rx={6} ry={10.5} fill="#8A5636" />
          <ellipse cx={76} cy={-1.5} rx={3} ry={5.5} fill="#5A3520" />
        </g>
      </svg>
      {new Array(sparks).fill(0).map((_, i) => {
        const t = (frame * 1.3 + i * 23) % 85;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (-30 + i * 60) * scale * 0.6 + Math.sin((frame + i * 30) / 14) * 12 * scale,
              top: (-60 - t * 3) * scale,
              width: 5 * scale,
              height: 5 * scale,
              borderRadius: "50%",
              backgroundColor: ACCENT.warm,
              boxShadow: `0 0 ${8 * scale}px ${ACCENT.warm}`,
              opacity: 0.75 * (1 - t / 85),
            }}
          />
        );
      })}
    </div>
  );
};

export const Ground: React.FC<{
  y: number;
  heat?: number; // 0..1
  color?: string;
  height?: number;
  label?: string;
}> = ({ y, heat = 0.6, color, height = 260, label }) => {
  const frame = useCurrentFrame();
  const c = color || mixHex("#3A2A22", "#7A3B24", heat);
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1920, height }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${c} 0%, #170F0C 90%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -70,
          height: 140,
          background: `radial-gradient(60% 100% at 50% 100%, ${ACCENT.ember}${heat > 0.3 ? "44" : "18"} 0%, transparent 70%)`,
          opacity: 0.4 + 0.3 * heat,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 6,
          background: `linear-gradient(90deg, transparent, ${ACCENT.ember}${heat > 0.4 ? "aa" : "44"}, transparent)`,
          opacity: 0.55 + 0.25 * Math.sin(frame / 22),
        }}
      />
      {label ? (
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 34,
            fontFamily: MONO,
            fontSize: 22,
            letterSpacing: "0.2em",
            color: "rgba(255,235,220,0.6)",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Duvet layer (thick puff) / gauze                                   */
/* ------------------------------------------------------------------ */

export const DuvetLayer: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  color?: string;
  thickness?: number;
}> = ({ x, y, w = 760, h = 150, color = "#8FD8FF", thickness = 1 }) => {
  const frame = useCurrentFrame();
  const puff = 1 + 0.015 * Math.sin(frame / 26);
  const chambers = Math.max(3, Math.round(w / 175));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `scaleY(${puff})`,
        transformOrigin: "50% 100%",
        opacity: thickness > 0.6 ? 0.95 : 0.4,
        borderRadius: `${h * 0.55}px ${h * 0.55}px ${h * 0.2}px ${h * 0.2}px`,
        background: `linear-gradient(180deg, ${color}${thickness > 0.6 ? "55" : "22"} 0%, ${color}${thickness > 0.6 ? "28" : "10"} 70%, transparent 100%)`,
        border: `${2 + thickness * 3}px solid ${color}${thickness > 0.6 ? "77" : "33"}`,
        boxShadow: `inset 0 8px 30px ${color}22, 0 0 40px ${color}11`,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 5, display: "flex", gap: 4 }}>
        {new Array(chambers).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: `${h * 0.42}px ${h * 0.42}px ${h * 0.15}px ${h * 0.15}px`,
              background: `radial-gradient(ellipse at 46% 18%, ${color}48 0%, ${color}20 48%, ${color}08 78%)`,
              borderTop: `1.5px solid ${color}55`,
              borderBottom: `1.5px dashed ${color}44`,
              boxShadow: `inset 0 10px 18px ${color}18, inset 0 -12px 20px rgba(0,0,0,0.2)`,
              transform: `translateY(${Math.sin(frame / 30 + i * 0.8) * 1.5}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Number ticker                                                      */
/* ------------------------------------------------------------------ */

export const BigNumber: React.FC<{
  x: number;
  y: number;
  value: number;
  suffix?: string;
  color?: string;
  size?: number;
  decimals?: number;
  progress?: number;
  label?: string;
}> = ({ x, y, value, suffix = "", color = "#F5F8FF", size = 140, decimals = 0, progress = 1, label }) => {
  const shown = value * progress;
  const text =
    decimals > 0
      ? shown.toFixed(decimals)
      : Math.round(shown)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: size,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color,
          lineHeight: 1,
          textShadow: `0 0 46px ${color}33`,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {text}
        {suffix ? <span style={{ fontSize: size * 0.42, marginLeft: 14, opacity: 0.8 }}>{suffix}</span> : null}
      </div>
      {label ? (
        <div
          style={{
            marginTop: 14,
            fontFamily: MONO,
            fontSize: 22,
            letterSpacing: "0.2em",
            color: "rgba(220,232,248,0.6)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
