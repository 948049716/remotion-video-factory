import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../theme";

export const Scene4BrutalistType: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sub-phases:
  // Phase A: 0 - 100 frames (Slit-scan typography)
  // Phase B: 100 - 200 frames (Swiss Bento grid layout & inverted red blocks)
  // Phase C: 200 - 300 frames (High-speed opposing marquee strips & strobe exit)

  // Slit scan horizontal offset wave
  const slitWave = Math.sin(frame * 0.22);

  // Phase B Spring
  const bentoSpring = spring({
    frame: frame - 100,
    fps,
    config: THEME.springs.snap,
  });

  // Phase C Marquee continuous scroll
  const marqueeOffset1 = (frame * 18) % 1920;
  const marqueeOffset2 = -(frame * 24) % 1920;

  // Exit transition: High speed shutter collapse
  const exitScaleY = interpolate(frame, [275, 300], [1, 0], {
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
        transform: `scaleY(${exitScaleY})`,
        opacity: exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* PHASE A: SLIT-SCAN TYPOGRAPHY (Frames 0 - 100)               */}
      {/* ------------------------------------------------------------- */}
      {frame < 105 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: THEME.colors.void,
          }}
        >
          {/* 10 Slit Scan Strips creating organic kinetic type shear */}
          {Array.from({ length: 10 }).map((_, i) => {
            const stripProgress = interpolate(frame, [0, 45, 95], [1, 0, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: THEME.easings.expoOut,
            });
            const shearX = (Math.sin(frame * 0.15 + i * 0.7) + slitWave * 0.3) * 80 * stripProgress;
            const stripHeight = 85;

            return (
              <div
                key={i}
                style={{
                  width: 1920,
                  height: stripHeight,
                  overflow: "hidden",
                  position: "relative",
                  transform: `translateX(${shearX}px)`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -i * stripHeight,
                    width: 1920,
                    height: 850,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: THEME.fonts.display,
                      fontSize: 168,
                      fontWeight: 900,
                      lineHeight: 0.88,
                      letterSpacing: "-0.05em",
                      color: i % 2 === 0 ? THEME.colors.pureWhite : THEME.colors.neonLime,
                      textTransform: "uppercase",
                      textAlign: "center",
                    }}
                  >
                    PURE MOMENTUM
                  </div>
                </div>
              </div>
            );
          })}

          {/* Swiss Metric Accents */}
          <div
            style={{
              position: "absolute",
              top: 80,
              left: 100,
              fontFamily: THEME.fonts.mono,
              fontSize: 14,
              color: THEME.colors.pureWhite,
              letterSpacing: "0.2em",
            }}
          >
            [04] // SWISS RIGOR · HIGH-VELOCITY DISPLACEMENT
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PHASE B: SWISS BENTO GRID & CONTRAST LOCKUP (Frames 100 - 200) */}
      {/* ------------------------------------------------------------- */}
      {frame >= 95 && frame < 205 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gridTemplateRows: "1fr 1fr",
            gap: 24,
            transform: `scale(${bentoSpring})`,
            opacity: interpolate(frame, [95, 105], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {/* Card 1: Vermilion Giant Type Block */}
          <div
            style={{
              gridRow: "1 / span 2",
              backgroundColor: THEME.colors.crimsonRed,
              borderRadius: 16,
              padding: 48,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 20px 50px rgba(255, 23, 68, 0.25)",
            }}
          >
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 14,
                color: "#FFFFFF",
                fontWeight: 700,
                letterSpacing: "0.2em",
              }}
            >
              DISCIPLINE // 01
            </div>

            <div
              style={{
                fontFamily: THEME.fonts.display,
                fontSize: 110,
                fontWeight: 900,
                lineHeight: 0.85,
                color: "#FFFFFF",
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
              }}
            >
              PRECISION
              <br />
              IS
              <br />
              EMOTION
            </div>

            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 12,
                color: "#FFFFFF",
                opacity: 0.9,
                letterSpacing: "0.15em",
              }}
            >
              GRID RATIO: 1.618 · BASELINE: 8PX · CHRONO DYNAMICS
            </div>
          </div>

          {/* Card 2: Obsidian Matrix Info */}
          <div
            style={{
              backgroundColor: THEME.colors.surface,
              borderRadius: 16,
              border: `1px solid ${THEME.colors.borderBright}`,
              padding: 40,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: THEME.fonts.mono,
                fontSize: 12,
              }}
            >
              <span style={{ color: THEME.colors.electricCyan }}>CHRONO KINETICS</span>
              <span style={{ color: THEME.colors.neonLime }}>60.000 FPS</span>
            </div>

            <div
              style={{
                fontFamily: THEME.fonts.display,
                fontSize: 48,
                color: THEME.colors.pureWhite,
                fontWeight: 900,
                lineHeight: 1.05,
              }}
            >
              FRAME-DRIVEN
              <br />
              DETERMINISM
            </div>

            <div style={{ height: 4, width: "100%", background: THEME.colors.electricCyan }} />
          </div>

          {/* Card 3: Acid Lime High Impact Card */}
          <div
            style={{
              backgroundColor: THEME.colors.neonLime,
              borderRadius: 16,
              padding: 40,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 12,
                color: "#000000",
                fontWeight: 800,
              }}
            >
              ZERO CSS TRANSITION // 100% MATH
            </div>

            <div
              style={{
                fontFamily: THEME.fonts.display,
                fontSize: 64,
                color: "#000000",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 0.9,
              }}
            >
              EASE IN · OUT
              <br />
              SPRING PHYSICS
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PHASE C: OPPOSING DIAGONAL MARQUEE BANDS (Frames 200 - 300)   */}
      {/* ------------------------------------------------------------- */}
      {frame >= 195 && (
        <div
          style={{
            position: "absolute",
            inset: -100,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 28,
            transform: "rotate(-7deg)",
            opacity: interpolate(frame, [195, 205], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {/* Top Marquee Band */}
          <div
            style={{
              display: "flex",
              whiteSpace: "nowrap",
              transform: `translateX(${marqueeOffset1}px)`,
              backgroundColor: THEME.colors.pureWhite,
              padding: "16px 0",
              boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                style={{
                  fontFamily: THEME.fonts.display,
                  fontSize: 72,
                  fontWeight: 900,
                  color: "#000000",
                  letterSpacing: "-0.02em",
                  marginRight: 60,
                }}
              >
                TYPOGRAPHY // SPATIAL ARCHITECTURE // MOTION DIRECTION //
              </span>
            ))}
          </div>

          {/* Bottom Inverted Marquee Band */}
          <div
            style={{
              display: "flex",
              whiteSpace: "nowrap",
              transform: `translateX(${marqueeOffset2}px)`,
              backgroundColor: THEME.colors.crimsonRed,
              padding: "16px 0",
              boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                style={{
                  fontFamily: THEME.fonts.display,
                  fontSize: 72,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                  marginRight: 60,
                }}
              >
                // RHYTHM IN CODE // HIGH-G VISUAL VELOCITY // BEZIER RIGGING
              </span>
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
