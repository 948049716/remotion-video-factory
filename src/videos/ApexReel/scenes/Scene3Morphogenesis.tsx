import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../theme";

export const Scene3Morphogenesis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame,
    fps,
    config: THEME.springs.punchy,
  });

  // Time elapsed in seconds for parametric math
  const t = frame / 60;

  // Dynamic parameters for the mathematical Epitrochoid
  const a = 5;
  const b = 3;
  const phase = t * 1.8;
  const R = 220;
  const r = 90 + Math.sin(t * 2.5) * 45;

  // Generate 72 mathematical points for the dynamic polygon
  const numPoints = 72;
  const points = Array.from({ length: numPoints }).map((_, i) => {
    const theta = (i / numPoints) * Math.PI * 2;
    const x = R * Math.cos(a * theta) + r * Math.cos(b * theta + phase);
    const y = R * Math.sin(a * theta) - r * Math.sin(b * theta + phase);
    return { x, y };
  });

  const pathD =
    points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "") + " Z";

  // Second offset harmonic path for chromatic resonance
  const pathD2 =
    points.reduce((acc, pt, i) => {
      const x2 = pt.x * 0.82;
      const y2 = pt.y * 0.82;
      return i === 0 ? `M ${x2} ${y2}` : `${acc} L ${x2} ${y2}`;
    }, "") + " Z";

  // Liquid Metaball Orbiters (4 organic blob centers)
  const blobs = [
    { rad: 65, dist: 130, speed: 2.2, phase: 0 },
    { rad: 55, dist: 110, speed: -2.8, phase: 1.5 },
    { rad: 50, dist: 140, speed: 1.6, phase: 3.14 },
    { rad: 70, dist: 90, speed: -1.9, phase: 4.5 },
  ];

  // Exit transition whip into horizontal slit (frames 270 - 300)
  const exitScaleY = interpolate(frame, [270, 298], [1, 0.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easings.whip,
  });
  const exitScaleX = interpolate(frame, [270, 298], [1, 3.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easings.whip,
  });
  const exitOpacity = interpolate(frame, [285, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.void,
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${exitScaleX}, ${exitScaleY})`,
        opacity: exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* Background Holographic Rings & Vector Flow Field */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
          padding: 60,
          opacity: 0.25,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 96 }).map((_, i) => {
          const col = i % 12;
          const row = Math.floor(i / 12);
          const angle = Math.sin(col * 0.4 + t) * Math.cos(row * 0.4 + t) * 180;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 1.5,
                  backgroundColor: THEME.colors.electricCyan,
                  transform: `rotate(${angle}deg)`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* SVG Canvas for Liquid Metaballs and Parametric Curves */}
      <svg
        width="1920"
        height="1080"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <defs>
          {/* SVG Gooey / Metaball Filter */}
          <filter id="apex-metaball">
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>

          <linearGradient id="neonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={THEME.colors.electricCyan} />
            <stop offset="50%" stopColor={THEME.colors.neonLime} />
            <stop offset="100%" stopColor={THEME.colors.hyperViolet} />
          </linearGradient>
        </defs>

        {/* Center Group with Transform & Spring Entrance */}
        <g
          transform={`translate(960, 540) scale(${enterSpring}) rotate(${frame * 0.6})`}
        >
          {/* Outer Concentric Polar Grid */}
          {[160, 260, 360, 460].map((radius, idx) => (
            <circle
              key={idx}
              cx="0"
              cy="0"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray={idx % 2 === 0 ? "4 8" : "12 12"}
            />
          ))}

          {/* 1. LIQUID GOOEY METABALL MITOSIS CORE */}
          <g filter="url(#apex-metaball)">
            {/* Center Main Organelle */}
            <circle
              cx="0"
              cy="0"
              r={75 + Math.sin(t * 4) * 15}
              fill={THEME.colors.neonLime}
              opacity="0.88"
            />

            {/* Orbiting blobs merging and tearing away */}
            {blobs.map((b, idx) => {
              const curAngle = t * b.speed + b.phase;
              const bx = Math.cos(curAngle) * b.dist;
              const by = Math.sin(curAngle) * b.dist;
              return (
                <circle
                  key={idx}
                  cx={bx}
                  cy={by}
                  r={b.rad}
                  fill={idx % 2 === 0 ? THEME.colors.electricCyan : THEME.colors.crimsonRed}
                  opacity="0.88"
                />
              );
            })}
          </g>

          {/* 2. PARAMETRIC MATHEMATICAL WIREFRAME OVERLAYS */}
          {/* Cyan Primary Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#neonGrad1)"
            strokeWidth="3.5"
            style={{
              filter: `drop-shadow(0 0 16px ${THEME.colors.electricCyan})`,
            }}
          />

          {/* Neon Secondary Resonant Curve */}
          <path
            d={pathD2}
            fill="none"
            stroke={THEME.colors.neonLime}
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.75"
          />

          {/* Polygon Node Vertices (Key Vector Pins) */}
          {points
            .filter((_, i) => i % 6 === 0)
            .map((pt, i) => (
              <g key={i} transform={`translate(${pt.x}, ${pt.y})`}>
                <circle cx="0" cy="0" r="4" fill={THEME.colors.pureWhite} />
                <circle
                  cx="0"
                  cy="0"
                  r="8"
                  fill="none"
                  stroke={THEME.colors.electricCyan}
                  strokeWidth="1"
                />
              </g>
            ))}
        </g>
      </svg>

      {/* Floating Scientific Architectural Annotations */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 120,
          fontFamily: THEME.fonts.mono,
          fontSize: 13,
          color: THEME.colors.pureWhite,
          lineHeight: 1.8,
          background: "rgba(13, 14, 21, 0.75)",
          padding: "16px 24px",
          borderRadius: 8,
          border: `1px solid ${THEME.colors.border}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ color: THEME.colors.neonLime, fontWeight: 800 }}>
          EQ: f(θ) = [R·cos(aθ) + r·cos(bθ+φ), R·sin(aθ) - r·sin(bθ+φ)]
        </div>
        <div style={{ opacity: 0.75 }}>
          TOPOLOGY: EPITROCHOID CONTINUUM · VERTICES: 72 · DAMPING: 0.94
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 120,
          right: 120,
          textAlign: "right",
          fontFamily: THEME.fonts.display,
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: "-0.02em",
          color: THEME.colors.pureWhite,
        }}
      >
        <div>ORGANIC</div>
        <div style={{ color: THEME.colors.electricCyan }}>MATHEMATICS</div>
      </div>
    </AbsoluteFill>
  );
};
