import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../theme";

export const Scene7Dossier: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance heavy impact spring
  const slamSpring = spring({
    frame,
    fps,
    config: THEME.springs.heavy,
  });

  const cardScale = interpolate(slamSpring, [0, 1], [1.35, 1]);
  const cardOpacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shockwave ring on impact
  const shockwave = interpolate(frame, [0, 45], [50, 750], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easings.expoOut,
  });
  const shockwaveOpacity = interpolate(frame, [0, 15, 45], [0.8, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered capability meters
  const skills = [
    { name: "REMOTION CODE VIDEO", pct: 100, color: THEME.colors.neonLime },
    { name: "WEBGL / GLSL SHADERS", pct: 98, color: THEME.colors.electricCyan },
    { name: "GENERATIVE TOPOLOGY", pct: 96, color: THEME.colors.pureWhite },
    { name: "SWISS EDITORIAL TYPE", pct: 99, color: THEME.colors.crimsonRed },
    { name: "SPATIAL UI / 3D HUDS", pct: 97, color: THEME.colors.solarAmber },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.void,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background Shockwave from Impact Drop */}
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <circle
          cx="960"
          cy="540"
          r={shockwave}
          fill="none"
          stroke={THEME.colors.electricCyan}
          strokeWidth="3"
          opacity={shockwaveOpacity}
        />
        <circle
          cx="960"
          cy="540"
          r={shockwave * 0.75}
          fill="none"
          stroke={THEME.colors.neonLime}
          strokeWidth="1.5"
          strokeDasharray="12 8"
          opacity={shockwaveOpacity}
        />
      </svg>

      {/* Main Dossier Glassmorphic Masterpiece Card */}
      <div
        style={{
          width: 1380,
          backgroundColor: "rgba(13, 14, 21, 0.92)",
          border: `1.5px solid ${THEME.colors.borderBright}`,
          borderRadius: 20,
          padding: "48px 60px",
          boxShadow: "0 30px 90px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(24px)",
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 32,
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: `1px solid ${THEME.colors.border}`,
            paddingBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 13,
                color: THEME.colors.neonLime,
                letterSpacing: "0.25em",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              CANDIDATE DOSSIER // OFFICIAL 2026 SELECTION
            </div>
            <div
              style={{
                fontFamily: THEME.fonts.display,
                fontSize: 76,
                fontWeight: 900,
                color: THEME.colors.pureWhite,
                letterSpacing: "-0.03em",
                lineHeight: 0.95,
              }}
            >
              KAI CHEN
            </div>
            <div
              style={{
                fontFamily: THEME.fonts.sans,
                fontSize: 18,
                color: THEME.colors.electricCyan,
                fontWeight: 600,
                letterSpacing: "0.1em",
                marginTop: 8,
              }}
            >
              PRINCIPAL MOTION TECHNOLOGIST &amp; CREATIVE DIRECTOR
            </div>
          </div>

          {/* Rotating Holographic Verification Seal */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                border: `2px dashed ${THEME.colors.solarAmber}`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transform: `rotate(${frame * 0.8}deg)`,
                boxShadow: `0 0 20px rgba(255, 145, 0, 0.3)`,
              }}
            >
              <div
                style={{
                  fontFamily: THEME.fonts.mono,
                  fontSize: 10,
                  fontWeight: 900,
                  color: THEME.colors.solarAmber,
                  textAlign: "center",
                }}
              >
                APEX
                <br />
                CERTIFIED
              </div>
            </div>
            <span style={{ fontFamily: THEME.fonts.mono, fontSize: 10, opacity: 0.5 }}>
              HASH: #8F9A2B
            </span>
          </div>
        </div>

        {/* Middle Body: Skills Matrix & Industry Honors */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 48 }}>
          {/* Left: Capability Progress Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.6)",
                letterSpacing: "0.15em",
                marginBottom: 4,
              }}
            >
              CORE TECHNICAL DISCIPLINE ACCREDITATION:
            </div>

            {skills.map((s, idx) => {
              // Staggered fill spring
              const barFill = spring({
                frame: frame - 15 - idx * 5,
                fps,
                config: THEME.springs.snap,
              });
              const currentWidth = interpolate(barFill, [0, 1], [0, s.pct]);

              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: THEME.fonts.mono,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: THEME.colors.pureWhite }}>{s.name}</span>
                    <span style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${currentWidth}%`,
                        height: "100%",
                        backgroundColor: s.color,
                        boxShadow: `0 0 10px ${s.color}`,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Accolades & Contact Card */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: 12,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: THEME.fonts.mono,
                  fontSize: 12,
                  color: THEME.colors.neonLime,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  marginBottom: 12,
                }}
              >
                INDUSTRY DISTINCTIONS:
              </div>
              <div
                style={{
                  fontFamily: THEME.fonts.sans,
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: THEME.colors.pureWhite,
                }}
              >
                <div>✦ Awwwards Site of the Year 2025</div>
                <div>✦ FWA of the Day × 8 Consecutive Honors</div>
                <div>✦ Motion Design Awards // Grand Prix</div>
                <div>✦ Red Dot: Best of the Best in UI Motion</div>
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                borderTop: `1px solid ${THEME.colors.border}`,
                paddingTop: 16,
                fontFamily: THEME.fonts.mono,
                fontSize: 12,
                color: THEME.colors.electricCyan,
              }}
            >
              <div>PORTFOLIO: KAICHEN.STUDIO</div>
              <div style={{ color: THEME.colors.pureWhite, marginTop: 4 }}>
                STATUS: AVAILABLE FOR SELECTIVE ENGAGEMENT
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
