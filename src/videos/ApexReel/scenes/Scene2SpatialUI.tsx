import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../theme";

export const Scene2SpatialUI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame,
    fps,
    config: THEME.springs.heavy,
  });

  // Camera 3D orbital pan
  const camRotX = interpolate(frame, [0, 150, 300], [18, 10, 16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camRotY = interpolate(frame, [0, 150, 300], [-24, 0, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camZoom = interpolate(frame, [0, 40, 260, 300], [0.65, 1, 1.05, 3.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easings.expoOut,
  });
  const exitOpacity = interpolate(frame, [275, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 3D Cube rotation
  const cubeRotX = frame * 1.2;
  const cubeRotY = frame * 1.6;
  const cubeRotZ = frame * 0.8;

  // Infinite Grid scroll offset
  const gridOffset = (frame * 6) % 60;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.void,
        perspective: 1200,
        overflow: "hidden",
        opacity: exitOpacity,
      }}
    >
      {/* 3D Moving Floor Grid */}
      <div
        style={{
          position: "absolute",
          width: 3200,
          height: 3200,
          left: -640,
          bottom: -1100,
          transform: `rotateX(78deg) translateY(${gridOffset}px)`,
          backgroundImage: `
            linear-gradient(to right, rgba(0, 240, 255, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 240, 255, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 75%)",
        }}
      />

      {/* Main 3D World Stage */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transformStyle: "preserve-3d",
          transform: `scale(${camZoom}) rotateX(${camRotX}deg) rotateY(${camRotY}deg)`,
          opacity: enterSpring,
        }}
      >
        {/* ========================================================= */}
        {/* 1. LEFT FLOATING CONTROL DECK                            */}
        {/* ========================================================= */}
        <div
          style={{
            position: "absolute",
            left: 120,
            width: 440,
            padding: 24,
            borderRadius: 14,
            backgroundColor: "rgba(13, 14, 21, 0.85)",
            border: `1px solid ${THEME.colors.borderBright}`,
            backdropFilter: "blur(16px)",
            transform: "translateZ(80px) rotateY(15deg)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 240, 255, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${THEME.colors.border}`,
              paddingBottom: 12,
              marginBottom: 16,
              fontFamily: THEME.fonts.mono,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            <span style={{ color: THEME.colors.neonLime }}>// QUANTUM_DECK v2.6</span>
            <span style={{ color: THEME.colors.pureWhite, opacity: 0.5 }}>CH-04 ONLINE</span>
          </div>

          {/* Interactive Equalizer Faders (Frame Driven) */}
          <div style={{ display: "flex", justifyContent: "space-between", height: 140, marginBottom: 20 }}>
            {Array.from({ length: 8 }).map((_, i) => {
              // Dynamic bounce height driven by frame and sinusoids
              const faderVal = interpolate(
                Math.sin((frame + i * 25) * 0.15) * 0.5 + 0.5,
                [0, 1],
                [15, 90]
              );
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      flex: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      borderRadius: 7,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        height: `${faderVal}%`,
                        backgroundColor: i % 2 === 0 ? THEME.colors.electricCyan : THEME.colors.neonLime,
                        borderRadius: 7,
                        boxShadow: `0 0 8px ${i % 2 === 0 ? THEME.colors.electricCyan : THEME.colors.neonLime}`,
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: THEME.fonts.mono, fontSize: 9, opacity: 0.6 }}>
                    F{i + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Real-time Telemetry Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              fontFamily: THEME.fonts.mono,
              fontSize: 11,
            }}
          >
            <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "8px 12px", borderRadius: 6 }}>
              <div style={{ opacity: 0.5, fontSize: 9 }}>LATENCY</div>
              <div style={{ color: THEME.colors.neonLime, fontWeight: 700 }}>0.42 ms (ULTRA)</div>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "8px 12px", borderRadius: 6 }}>
              <div style={{ opacity: 0.5, fontSize: 9 }}>PIPELINE</div>
              <div style={{ color: THEME.colors.electricCyan, fontWeight: 700 }}>WEBGL2 GPU CORE</div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CENTER TRUE 3D ROTATING WIREFRAME CUBE                 */}
        {/* ========================================================= */}
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            transformStyle: "preserve-3d",
            transform: `translateZ(140px) rotateX(${cubeRotX}deg) rotateY(${cubeRotY}deg) rotateZ(${cubeRotZ}deg)`,
          }}
        >
          {/* 6 Cube Faces */}
          {[
            { transform: "translateZ(130px)", border: THEME.colors.electricCyan },
            { transform: "rotateY(180deg) translateZ(130px)", border: THEME.colors.neonLime },
            { transform: "rotateY(-90deg) translateZ(130px)", border: THEME.colors.crimsonRed },
            { transform: "rotateY(90deg) translateZ(130px)", border: THEME.colors.electricCyan },
            { transform: "rotateX(90deg) translateZ(130px)", border: THEME.colors.solarAmber },
            { transform: "rotateX(-90deg) translateZ(130px)", border: THEME.colors.pureWhite },
          ].map((face, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                inset: 0,
                transform: face.transform,
                border: `2px solid ${face.border}`,
                backgroundColor: "rgba(0, 240, 255, 0.04)",
                boxShadow: `inset 0 0 30px ${face.border}33`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Inner crosshair and geometric diagonals on each face */}
              <div
                style={{
                  width: 140,
                  height: 140,
                  border: "1px dashed rgba(255, 255, 255, 0.4)",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div style={{ width: 6, height: 6, backgroundColor: face.border, borderRadius: "50%" }} />
              </div>
            </div>
          ))}

          {/* Central Pulsing Plasma Core inside the 3D cube */}
          <div
            style={{
              position: "absolute",
              top: 80,
              left: 80,
              width: 100,
              height: 100,
              borderRadius: "50%",
              backgroundColor: THEME.colors.pureWhite,
              boxShadow: `0 0 50px ${THEME.colors.electricCyan}, 0 0 80px ${THEME.colors.neonLime}`,
              transform: `scale(${interpolate(Math.sin(frame * 0.1), [-1, 1], [0.75, 1.25])})`,
            }}
          />
        </div>

        {/* ========================================================= */}
        {/* 3. RIGHT FLOATING HOLOGRAPHIC RADAR & VECTOR SCOPE        */}
        {/* ========================================================= */}
        <div
          style={{
            position: "absolute",
            right: 120,
            width: 420,
            padding: 24,
            borderRadius: 14,
            backgroundColor: "rgba(13, 14, 21, 0.85)",
            border: `1px solid ${THEME.colors.borderBright}`,
            backdropFilter: "blur(16px)",
            transform: "translateZ(80px) rotateY(-15deg)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(204, 255, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${THEME.colors.border}`,
              paddingBottom: 12,
              marginBottom: 16,
              fontFamily: THEME.fonts.mono,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            <span style={{ color: THEME.colors.electricCyan }}>// ORBITAL_TARGETING</span>
            <span style={{ color: THEME.colors.neonLime }}>LOCKED 3D</span>
          </div>

          {/* SVG Rotating Radar Screen */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <svg width="240" height="240" viewBox="-120 -120 240 240">
              {/* Concentric distance rings */}
              {[30, 60, 90, 115].map((r, i) => (
                <circle
                  key={i}
                  cx="0"
                  cy="0"
                  r={r}
                  fill="none"
                  stroke={THEME.colors.electricCyan}
                  strokeWidth="1"
                  strokeDasharray={i % 2 === 1 ? "4 4" : "none"}
                  opacity={0.35}
                />
              ))}

              {/* Crosshair grid */}
              <line x1="-120" y1="0" x2="120" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <line x1="0" y1="-120" x2="0" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

              {/* Sweep Radar Line */}
              <g transform={`rotate(${frame * 4})`}>
                <line x1="0" y1="0" x2="115" y2="0" stroke={THEME.colors.neonLime} strokeWidth="2" />
                <polygon points="0,0 115,-40 115,0" fill="url(#radarSweepGrad)" opacity="0.3" />
              </g>

              {/* Targets blips */}
              {[
                { x: 45, y: -30, label: "SYS_A" },
                { x: -60, y: 50, label: "SYS_B" },
                { x: 70, y: 40, label: "SYS_C" },
              ].map((tgt, i) => (
                <g key={i} transform={`translate(${tgt.x}, ${tgt.y})`}>
                  <circle cx="0" cy="0" r="4" fill={THEME.colors.crimsonRed} />
                  <circle
                    cx="0"
                    cy="0"
                    r={interpolate(frame % 30, [0, 30], [4, 18])}
                    fill="none"
                    stroke={THEME.colors.crimsonRed}
                    strokeWidth="1"
                    opacity={interpolate(frame % 30, [0, 30], [0.8, 0])}
                  />
                  <text
                    x="8"
                    y="4"
                    fill="#FFFFFF"
                    fontSize="9"
                    fontFamily={THEME.fonts.mono}
                    opacity="0.8"
                  >
                    {tgt.label}
                  </text>
                </g>
              ))}

              <defs>
                <linearGradient id="radarSweepGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#CCFF00" stopOpacity="0" />
                  <stop offset="100%" stopColor="#CCFF00" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div
            style={{
              marginTop: 16,
              textAlign: "center",
              fontFamily: THEME.fonts.mono,
              fontSize: 11,
              color: THEME.colors.pureWhite,
              opacity: 0.7,
            }}
          >
            SPATIAL COORD: [X: 192.4, Y: 840.1, Z: 512.9]
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
