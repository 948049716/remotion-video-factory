import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../theme";

export const Scene5Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 4 Commercial Projects, each exactly 90 frames (1.5 seconds)
  const projectIdx = Math.min(3, Math.floor(frame / 90));
  const subFrame = frame % 90;

  // Snappy impact spring at the start of each project cut
  const cutSpring = spring({
    frame: subFrame,
    fps,
    config: THEME.springs.snap,
  });

  const zoomPunch = interpolate(cutSpring, [0, 1], [1.18, 1]);
  const cutFlash = interpolate(subFrame, [0, 3, 10], [0.7, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.void,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Dynamic Flash on each commercial cut */}
      {cutFlash > 0.02 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#FFFFFF",
            opacity: cutFlash,
            zIndex: 50,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ============================================================= */}
      {/* PROJECT 01: NEURA // NEURAL INTERFACE (Frames 0 - 90)        */}
      {/* ============================================================= */}
      {projectIdx === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${zoomPunch})`,
          }}
        >
          {/* Neural Synapse Network Canvas */}
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            {/* Pulsing Synapse Nodes and Axon Filaments */}
            {Array.from({ length: 28 }).map((_, i) => {
              const angle = (i / 28) * Math.PI * 2;
              const r = 260 + Math.sin(subFrame * 0.15 + i) * 60;
              const nx = 960 + Math.cos(angle) * r;
              const ny = 540 + Math.sin(angle) * r;
              return (
                <g key={i}>
                  {/* Axon branch towards center */}
                  <line
                    x1="960"
                    y1="540"
                    x2={nx}
                    y2={ny}
                    stroke={THEME.colors.electricCyan}
                    strokeWidth={1.5}
                    opacity={0.4}
                  />
                  {/* Synaptic glowing node */}
                  <circle
                    cx={nx}
                    cy={ny}
                    r={6}
                    fill={i % 2 === 0 ? THEME.colors.neonLime : THEME.colors.electricCyan}
                    style={{
                      filter: `drop-shadow(0 0 10px ${THEME.colors.electricCyan})`,
                    }}
                  />
                  {/* Firing action potential pulse */}
                  <circle
                    cx={interpolate(subFrame % 30, [0, 30], [960, nx])}
                    cy={interpolate(subFrame % 30, [0, 30], [540, ny])}
                    r={3}
                    fill="#FFFFFF"
                  />
                </g>
              );
            })}

            {/* Central Neural Nucleus */}
            <circle
              cx="960"
              cy="540"
              r={90}
              fill="none"
              stroke={THEME.colors.neonLime}
              strokeWidth={3}
              strokeDasharray="8 6"
              transform={`rotate(${subFrame * 2} 960 540)`}
            />
            <circle
              cx="960"
              cy="540"
              r={70}
              fill={THEME.colors.surface}
              stroke={THEME.colors.electricCyan}
              strokeWidth={2}
            />
          </svg>

          {/* Project Title Card */}
          <div
            style={{
              position: "absolute",
              bottom: 120,
              left: 120,
              fontFamily: THEME.fonts.display,
            }}
          >
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 14,
                color: THEME.colors.electricCyan,
                fontWeight: 700,
                letterSpacing: "0.25em",
                marginBottom: 6,
              }}
            >
              SELECTED WORK // 01 · BCI LABS
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              NEURA // SYNAPSE CORE
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* PROJECT 02: CHRONOS // HAUTE HORLOGERIE (Frames 90 - 180)     */}
      {/* ============================================================= */}
      {projectIdx === 1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${zoomPunch})`,
          }}
        >
          {/* Mechanical Tourbillon Precision Gears Canvas */}
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            {/* Gear 1: Outer Giant Escapement Wheel */}
            <g transform={`translate(960, 540) rotate(${subFrame * 1.5})`}>
              <circle cx="0" cy="0" r="320" fill="none" stroke={THEME.colors.solarAmber} strokeWidth="3" />
              {Array.from({ length: 36 }).map((_, i) => (
                <rect
                  key={i}
                  x="-8"
                  y="-335"
                  width="16"
                  height="30"
                  fill={THEME.colors.solarAmber}
                  transform={`rotate(${(i / 36) * 360})`}
                />
              ))}
            </g>

            {/* Gear 2: Counter-rotating Secondary Gear */}
            <g transform={`translate(960, 540) rotate(${-subFrame * 3})`}>
              <circle cx="0" cy="0" r="210" fill="none" stroke={THEME.colors.pureWhite} strokeWidth="2" strokeDasharray="14 8" />
              {Array.from({ length: 24 }).map((_, i) => (
                <rect
                  key={i}
                  x="-6"
                  y="-222"
                  width="12"
                  height="24"
                  fill={THEME.colors.pureWhite}
                  transform={`rotate(${(i / 24) * 360})`}
                />
              ))}
            </g>

            {/* Gear 3: Center Balance Spring Mechanism */}
            <g transform={`translate(960, 540) rotate(${Math.sin(subFrame * 0.4) * 45})`}>
              <circle cx="0" cy="0" r="95" fill="rgba(255, 145, 0, 0.15)" stroke={THEME.colors.solarAmber} strokeWidth="4" />
              <line x1="-95" y1="0" x2="95" y2="0" stroke="#FFFFFF" strokeWidth="4" />
              <line x1="0" y1="-95" x2="0" y2="95" stroke="#FFFFFF" strokeWidth="4" />
              <circle cx="0" cy="0" r="16" fill={THEME.colors.crimsonRed} />
            </g>
          </svg>

          {/* Project Title Card */}
          <div
            style={{
              position: "absolute",
              bottom: 120,
              left: 120,
              fontFamily: THEME.fonts.display,
            }}
          >
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 14,
                color: THEME.colors.solarAmber,
                fontWeight: 700,
                letterSpacing: "0.25em",
                marginBottom: 6,
              }}
            >
              SELECTED WORK // 02 · SWISS LUXURY
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              CHRONOS // TOURBILLON 3D
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* PROJECT 03: SYNAPSE // QUANTUM LEDGER (Frames 180 - 270)      */}
      {/* ============================================================= */}
      {projectIdx === 2 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${zoomPunch})`,
          }}
        >
          {/* Holographic Quantum Cryptographic Lattice */}
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            <g transform={`translate(960, 540) rotate(${subFrame * 1.8})`}>
              {/* Rotating Concentric Hexagons */}
              {[120, 220, 320].map((r, idx) => {
                const hexPoints = Array.from({ length: 6 }).map((_, i) => {
                  const rad = (i / 6) * Math.PI * 2;
                  return `${Math.cos(rad) * r},${Math.sin(rad) * r}`;
                }).join(" ");

                return (
                  <polygon
                    key={idx}
                    points={hexPoints}
                    fill="none"
                    stroke={idx % 2 === 0 ? THEME.colors.neonLime : THEME.colors.electricCyan}
                    strokeWidth={2}
                    transform={`rotate(${idx * 30 + (idx % 2 === 0 ? subFrame : -subFrame)})`}
                    opacity={0.8}
                  />
                );
              })}

              {/* Data Hash Packet Beams */}
              {Array.from({ length: 12 }).map((_, i) => {
                const rad = (i / 12) * Math.PI * 2;
                return (
                  <line
                    key={i}
                    x1={Math.cos(rad) * 40}
                    y1={Math.sin(rad) * 40}
                    x2={Math.cos(rad) * 380}
                    y2={Math.sin(rad) * 380}
                    stroke="rgba(204, 255, 0, 0.4)"
                    strokeWidth={1}
                    strokeDasharray="6 6"
                  />
                );
              })}
            </g>
          </svg>

          {/* Project Title Card */}
          <div
            style={{
              position: "absolute",
              bottom: 120,
              left: 120,
              fontFamily: THEME.fonts.display,
            }}
          >
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 14,
                color: THEME.colors.neonLime,
                fontWeight: 700,
                letterSpacing: "0.25em",
                marginBottom: 6,
              }}
            >
              SELECTED WORK // 03 · QUANTUM PROTOCOL
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              SYNAPSE // PROTOCOL V4
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* PROJECT 04: AURA // AUTONOMOUS FLIGHT HUD (Frames 270 - 360) */}
      {/* ============================================================= */}
      {projectIdx === 3 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${zoomPunch})`,
          }}
        >
          {/* Spatial Avionics Cockpit HUD */}
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            {/* Artificial Horizon Pitch Ladder */}
            <g transform={`translate(960, 540) rotate(${Math.sin(subFrame * 0.1) * 12})`}>
              <line x1="-350" y1="0" x2="-80" y2="0" stroke={THEME.colors.electricCyan} strokeWidth={3} />
              <line x1="80" y1="0" x2="350" y2="0" stroke={THEME.colors.electricCyan} strokeWidth={3} />
              <circle cx="0" cy="0" r="12" fill="none" stroke={THEME.colors.pureWhite} strokeWidth={2} />

              {/* Pitch Marks */}
              {[-60, -30, 30, 60].map((py, idx) => (
                <g key={idx} transform={`translate(0, ${py})`}>
                  <line x1="-120" y1="0" x2="-40" y2="0" stroke={THEME.colors.electricCyan} strokeWidth="1.5" />
                  <line x1="40" y1="0" x2="120" y2="0" stroke={THEME.colors.electricCyan} strokeWidth="1.5" />
                  <text x="130" y="4" fill={THEME.colors.electricCyan} fontSize="10" fontFamily={THEME.fonts.mono}>
                    {Math.abs(py / 3)}°
                  </text>
                </g>
              ))}
            </g>

            {/* Flight Compass Ring */}
            <circle
              cx="960"
              cy="540"
              r="420"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
              strokeDasharray="4 8"
            />
          </svg>

          {/* Project Title Card */}
          <div
            style={{
              position: "absolute",
              bottom: 120,
              left: 120,
              fontFamily: THEME.fonts.display,
            }}
          >
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 14,
                color: THEME.colors.crimsonRed,
                fontWeight: 700,
                letterSpacing: "0.25em",
                marginBottom: 6,
              }}
            >
              SELECTED WORK // 04 · AEROSPACE HUD
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              AURA // SPATIAL COCKPIT
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
