import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../theme";

export const Scene6BezierMechanics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame,
    fps,
    config: THEME.springs.snap,
  });

  // Time in seconds
  const t = frame / 60;

  // Bezier Control Handles dynamic physics
  // P0 = (-400, 150), P3 = (400, -150)
  // Dynamic animated handles P1 and P2
  const p1X = -200 + Math.sin(t * 5.0) * 120;
  const p1Y = -250 + Math.cos(t * 4.2) * 100;
  const p2X = 200 + Math.cos(t * 4.8) * 120;
  const p2Y = 250 + Math.sin(t * 5.4) * 100;

  // Final tension pull into straight laser line (frames 150 - 180)
  const tension = interpolate(frame, [145, 178], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easings.cinematic,
  });

  const effP1X = interpolate(tension, [0, 1], [p1X, -133]);
  const effP1Y = interpolate(tension, [0, 1], [p1Y, 50]);
  const effP2X = interpolate(tension, [0, 1], [p2X, 133]);
  const effP2Y = interpolate(tension, [0, 1], [p2Y, -50]);

  const pathD = `M -400 150 C ${effP1X} ${effP1Y}, ${effP2X} ${effP2Y}, 400 -150`;

  // Waveform oscilloscope points for damped harmonic motion
  const wavePoints = Array.from({ length: 60 }).map((_, i) => {
    const wx = (i / 59) * 500;
    const wt = (frame * 0.12 - i * 0.08);
    const wy = Math.exp(-((i % 20) * 0.06)) * Math.sin(wt * 3.5) * 65;
    return `${wx},${wy}`;
  }).join(" ");

  // Exit flash & scale out
  const exitScale = interpolate(frame, [165, 180], [1, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easings.whip,
  });
  const exitOpacity = interpolate(frame, [172, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.void,
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${exitScale})`,
        opacity: exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* Background Cartesian Coordinate Grid & Code Stream */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.8,
        }}
      />

      {/* Code Annotation Columns */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 140,
          fontFamily: THEME.fonts.mono,
          fontSize: 12,
          lineHeight: 1.8,
          color: "rgba(255, 255, 255, 0.4)",
          pointerEvents: "none",
        }}
      >
        <div style={{ color: THEME.colors.electricCyan, fontWeight: 700 }}>
          // REMOTION SPRING PHYSICS HARNESS
        </div>
        <div>const k = 180.0; // Stiffness</div>
        <div>const c = 2.0 * Math.sqrt(m * k) * damping;</div>
        <div>const a = (-k * x - c * v) / mass;</div>
        <div style={{ color: THEME.colors.neonLime }}>B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃</div>
      </div>

      {/* SVG Interactive Bezier Mechanics Rig */}
      <svg
        width="1920"
        height="1080"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          transform: `scale(${enterSpring})`,
        }}
      >
        <g transform="translate(960, 540)">
          {/* Coordinate axes */}
          <line x1="-500" y1="0" x2="500" y2="0" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <line x1="0" y1="-320" x2="0" y2="320" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />

          {/* Tangent Handle Line P0 -> P1 */}
          <line
            x1="-400"
            y1="150"
            x2={effP1X}
            y2={effP1Y}
            stroke={THEME.colors.neonLime}
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Tangent Handle Line P3 -> P2 */}
          <line
            x1="400"
            y1="-150"
            x2={effP2X}
            y2={effP2Y}
            stroke={THEME.colors.electricCyan}
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* The Hero Bézier Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={4.5}
            style={{
              filter: `drop-shadow(0 0 12px ${THEME.colors.electricCyan})`,
            }}
          />

          {/* Control Point Node 1 (P1) */}
          <g transform={`translate(${effP1X}, ${effP1Y})`}>
            <circle cx="0" cy="0" r="14" fill="rgba(204, 255, 0, 0.2)" stroke={THEME.colors.neonLime} strokeWidth="2" />
            <circle cx="0" cy="0" r="4" fill={THEME.colors.neonLime} />
            <text x="18" y="5" fill={THEME.colors.neonLime} fontSize="11" fontFamily={THEME.fonts.mono} fontWeight="700">
              P₁ [{effP1X.toFixed(0)}, {effP1Y.toFixed(0)}]
            </text>
          </g>

          {/* Control Point Node 2 (P2) */}
          <g transform={`translate(${effP2X}, ${effP2Y})`}>
            <circle cx="0" cy="0" r="14" fill="rgba(0, 240, 255, 0.2)" stroke={THEME.colors.electricCyan} strokeWidth="2" />
            <circle cx="0" cy="0" r="4" fill={THEME.colors.electricCyan} />
            <text x="18" y="5" fill={THEME.colors.electricCyan} fontSize="11" fontFamily={THEME.fonts.mono} fontWeight="700">
              P₂ [{effP2X.toFixed(0)}, {effP2Y.toFixed(0)}]
            </text>
          </g>

          {/* Anchor Points P0 & P3 */}
          <rect x="-408" y="142" width="16" height="16" fill="#FFFFFF" />
          <rect x="392" y="-158" width="16" height="16" fill="#FFFFFF" />
        </g>
      </svg>

      {/* Damped Oscillator Scope Box in Bottom Right */}
      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: 120,
          width: 520,
          padding: 20,
          borderRadius: 10,
          backgroundColor: "rgba(13, 14, 21, 0.88)",
          border: `1px solid ${THEME.colors.borderBright}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: THEME.fonts.mono,
            fontSize: 11,
            color: THEME.colors.pureWhite,
            marginBottom: 10,
          }}
        >
          <span style={{ color: THEME.colors.neonLime }}>// DAMPED_OSCILLATOR_SCOPE</span>
          <span style={{ opacity: 0.6 }}>FREQ: 120Hz · ZETA: 0.707</span>
        </div>

        <svg width="480" height="90" viewBox="0 -80 480 160">
          <line x1="0" y1="0" x2="480" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <polyline
            points={wavePoints}
            fill="none"
            stroke={THEME.colors.electricCyan}
            strokeWidth="2.5"
            style={{ filter: `drop-shadow(0 0 8px ${THEME.colors.electricCyan})` }}
          />
        </svg>
      </div>

      {/* Giant Watermark */}
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 80,
          fontFamily: THEME.fonts.display,
          fontSize: 64,
          fontWeight: 900,
          color: "rgba(255, 255, 255, 0.15)",
          textAlign: "right",
        }}
      >
        MOTION AS
        <br />
        ENGINEERING
      </div>
    </AbsoluteFill>
  );
};
