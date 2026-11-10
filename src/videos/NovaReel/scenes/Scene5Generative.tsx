import React, { useMemo } from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, CLAMP, F, hexToRgba, range } from "../theme";

interface Ribbon {
  d: string;
  dots: { x: number; y: number; r: number }[];
}

const buildRibbons = (frame: number): Ribbon[] => {
  const rot = frame * 0.0065;
  const cr = Math.cos(rot);
  const sr = Math.sin(rot);

  return range(3).map((k) => {
    const phase = k * 2.094 + 0.4;
    let d = "";
    const dots: Ribbon["dots"] = [];
    const steps = 620;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const breathe = 1 + 0.08 * Math.sin(t * 2 + frame * 0.02 + k);
      const x3 =
        Math.sin(3 * t + phase + frame * 0.004) *
        Math.cos(t * 0.5 + phase * 0.6);
      const y3 = Math.sin(4 * t + phase * 0.7) * 0.82;
      const z3 = Math.cos(3 * t + phase) * Math.sin(t * 0.5 + 0.5);
      const persp = 1.55 / (1.9 - z3 * 0.55);
      const x = x3 * 395 * persp * breathe;
      const y = y3 * 365 * persp * breathe;
      const xr = x * cr - y * sr;
      const yr = x * sr + y * cr;

      d += `${i === 0 ? "M" : "L"}${xr.toFixed(1)} ${yr.toFixed(1)} `;

      if (i % 62 === 0) {
        dots.push({ x: xr, y: yr, r: 2.4 + persp * 2.6 });
      }
    }

    return { d: `${d}Z`, dots };
  });
};

export const Scene5Generative: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ribbons = useMemo(() => buildRibbons(frame), [frame]);
  const intro = spring({
    frame: frame - 4,
    fps,
    config: { damping: 16, stiffness: 70, mass: 1.15 },
  });
  const zoom = interpolate(frame, [214, 240], [1, 1.65], {
    ...CLAMP,
    easing: Easing.bezier(0.7, 0, 1, 1),
  });
  const flash = interpolate(frame, [226, 240], [0, 0.95], {
    ...CLAMP,
    easing: Easing.bezier(0.7, 0, 1, 1),
  });
  const wave = interpolate(frame, [0, 240], [-10, 14], CLAMP);
  const ringRot = frame * 0.35;
  const tickRot = frame * 0.12;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#050509",
        overflow: "hidden",
        fontFamily: F.sans,
        color: C.paper,
      }}
    >
      {/* Atmospheric light */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 48%, rgba(31,59,255,0.20), transparent 46%), radial-gradient(circle at 32% 70%, rgba(242,68,30,0.16), transparent 40%), radial-gradient(circle at 70% 32%, rgba(255,31,143,0.10), transparent 38%)",
        }}
      />

      {/* Ghosted infinity */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          transform: "translate(-50%, -50%)",
          fontFamily: F.serif,
          fontSize: 980,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `1px ${hexToRgba(C.paper, 0.055)}`,
          userSelect: "none",
        }}
      >
        ∞
      </div>

      {/* Fine measurement grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${hexToRgba(C.paper, 0.045)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(C.paper, 0.045)} 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          opacity: 0.6,
        }}
      />

      {/* The knot */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          width: 1200,
          height: 1200,
          marginLeft: -600,
          marginTop: -600,
          transform: `scale(${zoom * interpolate(intro, [0, 1], [0.7, 1])}) rotate(${wave}deg)`,
          opacity: interpolate(intro, [0, 1], [0, 1]),
        }}
      >
        <svg width={1200} height={1200} viewBox="-600 -600 1200 1200">
          <defs>
            <linearGradient id="g1" x1="-500" y1="-500" x2="500" y2="500" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={C.vermilion} />
              <stop offset="55%" stopColor={C.acid} />
              <stop offset="100%" stopColor={C.vermilion} />
            </linearGradient>
            <linearGradient id="g2" x1="500" y1="-400" x2="-500" y2="500" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={C.cyan} />
              <stop offset="60%" stopColor={C.cobalt} />
              <stop offset="100%" stopColor={C.magenta} />
            </linearGradient>
            <linearGradient id="g3" x1="-400" y1="500" x2="400" y2="-500" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={C.magenta} />
              <stop offset="50%" stopColor={C.vermilion} />
              <stop offset="100%" stopColor={C.cyan} />
            </linearGradient>
            <filter id="knotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <filter id="dotGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* Measurement ring */}
          <g opacity={0.55} transform={`rotate(${ringRot})`}>
            <circle r={540} fill="none" stroke={hexToRgba(C.paper, 0.18)} strokeWidth={1} strokeDasharray="2 12" />
            <circle r={505} fill="none" stroke={hexToRgba(C.vermilion, 0.22)} strokeWidth={1} />
            {range(48).map((i) => {
              const a = (i / 48) * Math.PI * 2;
              const r0 = 522;
              const r1 = i % 6 === 0 ? 546 : 534;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * r0}
                  y1={Math.sin(a) * r0}
                  x2={Math.cos(a) * r1}
                  y2={Math.sin(a) * r1}
                  stroke={hexToRgba(C.paper, i % 6 === 0 ? 0.5 : 0.22)}
                  strokeWidth={1}
                />
              );
            })}
          </g>

          {/* Tick wheel */}
          <g opacity={0.24} transform={`rotate(${-tickRot})`}>
            {range(120).map((i) => {
              const a = (i / 120) * Math.PI * 2;
              const r0 = 575;
              const r1 = i % 10 === 0 ? 598 : 585;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * r0}
                  y1={Math.sin(a) * r0}
                  x2={Math.cos(a) * r1}
                  y2={Math.sin(a) * r1}
                  stroke={C.paper}
                  strokeWidth={1}
                />
              );
            })}
          </g>

          {/* Chromatic ghosts */}
          <g transform="translate(-6 2)" opacity={0.4} fill="none">
            {ribbons.map((r, i) => (
              <path key={i} d={r.d} stroke={C.cyan} strokeWidth={1.4} />
            ))}
          </g>
          <g transform="translate(6 -2)" opacity={0.4} fill="none">
            {ribbons.map((r, i) => (
              <path key={i} d={r.d} stroke={C.magenta} strokeWidth={1.4} />
            ))}
          </g>

          {/* Glow pass */}
          <g filter="url(#knotGlow)" opacity={0.45} fill="none">
            {ribbons.map((r, i) => (
              <path
                key={i}
                d={r.d}
                stroke={["url(#g1)", "url(#g2)", "url(#g3)"][i]}
                strokeWidth={7}
              />
            ))}
          </g>

          {/* Main ribbons */}
          {ribbons.map((r, i) => (
            <g key={i} fill="none">
              <path
                d={r.d}
                stroke={["url(#g1)", "url(#g2)", "url(#g3)"][i]}
                strokeWidth={[2.6, 2.2, 1.7][i]}
                strokeLinecap="round"
              />
              {i === 0 && (
                <path
                  d={r.d}
                  stroke={C.paper}
                  strokeWidth={1}
                  strokeDasharray="1 16"
                  opacity={0.55}
                />
              )}
            </g>
          ))}

          {/* Node dots */}
          {ribbons.map((r, ri) =>
            r.dots.map((dot, i) => (
              <g key={`${ri}-${i}`}>
                <circle cx={dot.x} cy={dot.y} r={dot.r * 2.4} fill={[C.vermilion, C.cyan, C.magenta][ri]} filter="url(#dotGlow)" opacity={0.55} />
                <circle cx={dot.x} cy={dot.y} r={dot.r} fill={C.paper} />
              </g>
            ))
          )}

          {/* Core */}
          <g>
            <circle r={62} fill={hexToRgba(C.paper, 0.06)} />
            <circle r={34} fill="none" stroke={hexToRgba(C.paper, 0.6)} strokeWidth={1} strokeDasharray="3 5" transform={`rotate(${-frame * 1.4})`} />
            <circle r={8} fill={C.paper} />
            {range(3).map((i) => {
              const a = frame * 0.02 + (i / 3) * Math.PI * 2;
              return (
                <circle
                  key={i}
                  cx={Math.cos(a) * 110}
                  cy={Math.sin(a) * 110}
                  r={3 + i}
                  fill={[C.vermilion, C.acid, C.cyan][i]}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* UI labels */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: F.mono,
          fontSize: 11.5,
          letterSpacing: "0.22em",
          opacity: interpolate(frame, [10, 30], [0, 1], CLAMP),
        }}
      >
        <span>
          05 <span style={{ color: C.vermilion }}>/</span> GENERATIVE
        </span>
        <span style={{ opacity: 0.55 }}>SEED 0024 — PARAMETRIC</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 96,
          opacity: interpolate(frame, [26, 52], [0, 1], CLAMP),
        }}
      >
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontSize: 52,
            color: C.paper,
            letterSpacing: "-0.02em",
          }}
        >
          math, in motion.
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 20,
            alignItems: "center",
            fontFamily: F.mono,
            fontSize: 10,
            letterSpacing: "0.22em",
            color: hexToRgba(C.paper, 0.55),
          }}
        >
          <span style={{ width: 42, height: 1, backgroundColor: C.vermilion }} />
          NO KEYFRAMES — PURE FUNCTION
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 96,
          textAlign: "right",
          fontFamily: F.mono,
          fontSize: 10,
          letterSpacing: "0.22em",
          color: hexToRgba(C.paper, 0.55),
          opacity: interpolate(frame, [26, 52], [0, 1], CLAMP),
        }}
      >
        <div>RIBBONS × 03</div>
        <div style={{ color: C.acid, marginTop: 7 }}>SAMPLES 1860</div>
      </div>

      {/* Right edge live meter */}
      <div
        style={{
          position: "absolute",
          right: 46,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          opacity: 0.5,
        }}
      >
        {range(14).map((i) => {
          const a = 0.12 + Math.abs(Math.sin(frame * 0.09 + i * 0.55)) * 0.8;
          return (
            <div
              key={i}
              style={{
                width: 2,
                height: 12,
                backgroundColor: C.paper,
                opacity: a,
              }}
            />
          );
        })}
      </div>

      {/* White out into the montage */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: C.white,
          opacity: flash,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
