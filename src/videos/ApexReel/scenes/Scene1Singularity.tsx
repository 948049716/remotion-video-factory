import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../theme";

export const Scene1Singularity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Inward gravitational collapse (0 - 100 frames)
  const collapseProgress = interpolate(frame, [0, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easings.cinematic,
  });

  // Scale of the outer gravitational rings collapsing inward
  const ringScale = interpolate(collapseProgress, [0, 1], [3.2, 0.05]);
  const rotationDeg = interpolate(frame, [0, 100, 240], [0, 480, 720]);

  // Phase 2: High-G Burst at frame 100 (2026 kinetic impact)
  const burstSpring = spring({
    frame: frame - 100,
    fps,
    config: THEME.springs.punchy,
  });

  // Squash and stretch right before burst (frames 85 - 100)
  const squashX = interpolate(frame, [85, 96, 100, 115], [1, 1.8, 0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const squashY = interpolate(frame, [85, 96, 100, 115], [1, 0.4, 2.0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shockwave expansion
  const shockwaveRadius = interpolate(frame, [100, 180], [0, 950], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easings.expoOut,
  });
  const shockwaveOpacity = interpolate(frame, [100, 120, 180], [0.9, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Title typography entrance
  const titleSpring = spring({
    frame: frame - 108,
    fps,
    config: THEME.springs.snap,
  });
  const titleScale = interpolate(titleSpring, [0, 1], [2.2, 1]);
  const titleOpacity = interpolate(frame, [106, 114], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Whip zoom out into next scene (frames 210 - 240)
  const exitZoom = interpolate(frame, [210, 240], [1, 4.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easings.whip,
  });
  const exitOpacity = interpolate(frame, [228, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 48 Orbital Quantum Particles
  const particles = Array.from({ length: 48 }).map((_, i) => {
    const angle = (i / 48) * Math.PI * 2;
    const baseDist = 580 + (i % 5) * 80;
    // Spiral inward during collapse, then explode outward
    let dist: number;
    if (frame < 100) {
      dist = interpolate(collapseProgress, [0, 1], [baseDist, 15]);
    } else {
      const burstDist = interpolate(frame, [100, 200], [15, baseDist * 1.8], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: THEME.easings.expoOut,
      });
      dist = burstDist;
    }
    const currentAngle = angle + (frame * 0.035 * (i % 2 === 0 ? 1 : -1));
    const px = Math.cos(currentAngle) * dist;
    const py = Math.sin(currentAngle) * dist;
    const size = (i % 4) + 2.5;
    return { px, py, size, key: i };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.void,
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${exitZoom})`,
        opacity: exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* Dynamic Radial Background Glow */}
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0, 240, 255, 0.18) 0%, rgba(204, 255, 0, 0.05) 40%, rgba(5, 5, 8, 0) 70%)`,
          transform: `scale(${frame < 100 ? collapseProgress * 1.5 : burstSpring * 1.2})`,
          opacity: 0.85,
        }}
      />

      {/* SVG Canvas for Inward Rings & Shockwave Geometry */}
      <svg
        width="1920"
        height="1080"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <g
          transform={`translate(960, 540) rotate(${rotationDeg}) scale(${squashX}, ${squashY})`}
        >
          {/* Gravitational collapsing concentric circles */}
          {[120, 260, 420, 600, 780].map((radius, idx) => (
            <circle
              key={idx}
              cx="0"
              cy="0"
              r={radius * (frame < 100 ? ringScale : 0.01)}
              fill="none"
              stroke={idx % 2 === 0 ? THEME.colors.electricCyan : THEME.colors.neonLime}
              strokeWidth={1.5}
              strokeDasharray={idx % 2 === 0 ? "8 6" : "18 12"}
              opacity={interpolate(collapseProgress, [0, 0.85, 1], [0.8, 0.9, 0])}
            />
          ))}

          {/* Crosshair coordinate markers */}
          {frame < 100 && (
            <>
              <line x1="-800" y1="0" x2="800" y2="0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="0" y1="-500" x2="0" y2="500" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </>
          )}

          {/* Central Singularity Core */}
          <circle
            cx="0"
            cy="0"
            r={frame < 100 ? interpolate(collapseProgress, [0, 1], [24, 6]) : interpolate(burstSpring, [0, 1], [6, 38])}
            fill={frame < 100 ? THEME.colors.pureWhite : THEME.colors.neonLime}
            filter="drop-shadow(0 0 18px #CCFF00)"
          />

          {/* Outward Shockwave expanding after frame 100 */}
          {frame >= 100 && (
            <>
              <circle
                cx="0"
                cy="0"
                r={shockwaveRadius}
                fill="none"
                stroke={THEME.colors.electricCyan}
                strokeWidth={3}
                opacity={shockwaveOpacity}
              />
              <circle
                cx="0"
                cy="0"
                r={shockwaveRadius * 0.72}
                fill="none"
                stroke={THEME.colors.neonLime}
                strokeWidth={1.5}
                strokeDasharray="14 10"
                opacity={shockwaveOpacity}
              />
              <rect
                x={-shockwaveRadius * 0.5}
                y={-shockwaveRadius * 0.5}
                width={shockwaveRadius}
                height={shockwaveRadius}
                fill="none"
                stroke={THEME.colors.pureWhite}
                strokeWidth={1}
                transform={`rotate(${frame * 1.5})`}
                opacity={shockwaveOpacity * 0.6}
              />
            </>
          )}

          {/* Quantum Particle Cloud */}
          {particles.map((p) => (
            <circle
              key={p.key}
              cx={p.px}
              cy={p.py}
              r={p.size}
              fill={p.key % 3 === 0 ? THEME.colors.neonLime : THEME.colors.electricCyan}
              opacity={0.85}
            />
          ))}
        </g>
      </svg>

      {/* Center Kinetic Typography Lockup (Frames 108 - 240) */}
      {frame >= 105 && (
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
            zIndex: 10,
          }}
        >
          {/* Eyebrow Label */}
          <div
            style={{
              fontFamily: THEME.fonts.mono,
              fontSize: 14,
              letterSpacing: "0.35em",
              color: THEME.colors.neonLime,
              fontWeight: 700,
              marginBottom: 8,
              padding: "4px 16px",
              background: "rgba(204, 255, 0, 0.1)",
              border: `1px solid ${THEME.colors.neonLime}`,
              borderRadius: 3,
            }}
          >
            SYS.INIT // HIGH-VELOCITY REEL
          </div>

          {/* Huge Display Impact Headline */}
          <div
            style={{
              fontFamily: THEME.fonts.display,
              fontSize: 104,
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              color: THEME.colors.pureWhite,
              textTransform: "uppercase",
              textShadow: `0 0 35px rgba(0, 240, 255, 0.45)`,
              position: "relative",
            }}
          >
            {/* RGB Chromatic Split Underlay */}
            <span
              style={{
                position: "absolute",
                left: -3,
                top: 0,
                color: THEME.colors.crimsonRed,
                mixBlendMode: "screen",
                opacity: 0.7,
                pointerEvents: "none",
              }}
            >
              KINETIC APEX
            </span>
            <span
              style={{
                position: "absolute",
                left: 3,
                top: 0,
                color: THEME.colors.electricCyan,
                mixBlendMode: "screen",
                opacity: 0.7,
                pointerEvents: "none",
              }}
            >
              KINETIC APEX
            </span>
            <span>KINETIC APEX</span>
          </div>

          {/* Subtitle Telemetry */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginTop: 18,
              fontFamily: THEME.fonts.mono,
              fontSize: 16,
              letterSpacing: "0.22em",
              color: THEME.colors.pureWhite,
              fontWeight: 600,
            }}
          >
            <span style={{ color: THEME.colors.electricCyan }}>
              ALGORITHMIC MOTION
            </span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span>SPATIAL COMPUTING</span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: THEME.colors.neonLime }}>60 FPS PRECISION</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
