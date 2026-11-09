import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene2KineticTypography: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 3 Sub-beats across 270 frames (90 frames = 1.5s each)
  const phraseIdx = Math.min(2, Math.floor(frame / 90));
  const localFrame = frame % 90;

  const phrases = [
    { top: "FORM FOLLOWS", bottom: "VELOCITY", code: "01 // KINETIC LAW", accent: "#FF2A00" },
    { top: "MATHEMATICAL", bottom: "TENSION", code: "02 // SPRING DAMPING", accent: "#0038FF" },
    { top: "SUB-PIXEL", bottom: "OBSESSION", code: "03 // SWISS PRECISION", accent: "#FF2A00" },
  ];
  const current = phrases[phraseIdx];

  // Slit-scan 3-slice horizontal entry & exit spring
  const sliceSpring1 = spring({
    frame: localFrame,
    fps,
    config: { damping: 13, stiffness: 190, mass: 0.55 },
  });
  const sliceSpring2 = spring({
    frame: localFrame - 4,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.6 },
  });
  const sliceSpring3 = spring({
    frame: localFrame - 8,
    fps,
    config: { damping: 11, stiffness: 170, mass: 0.65 },
  });

  // Living Bento Grid Dynamic Proportions (Grid cells breathe and shift on every phrase!)
  const leftColWidth = interpolate(
    phraseIdx,
    [0, 1, 2],
    [1180, 1060, 1220]
  );
  const topRowHeight = interpolate(
    Math.sin(frame * 0.07),
    [-1, 1],
    [560, 620]
  );

  // Stepped rotation for Swiss Pinwheel (steps every 30 frames = 0.5s beat)
  const beatIndex = Math.floor(frame / 30);
  const beatLocal = frame % 30;
  const beatSpring = spring({
    frame: beatLocal,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
  });
  const pinwheelAngle = (beatIndex + beatSpring) * 45;

  // Bezier visualizer progress (loops every 60 frames = 1.0s)
  const bezierLoop = (frame % 60) / 60;
  const bezierEased = Easing.bezier(0.16, 1, 0.3, 1)(bezierLoop);

  // Exit Venetian Blind Shutter Wipe (Frames 246 - 270)
  const shutterProgress = interpolate(frame, [244, 270], [0, 1], {
    easing: Easing.bezier(0.65, 0, 0.35, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#F4F1EA",
        color: "#0A0A0C",
        overflow: "hidden",
        padding: "76px 48px 68px 48px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Main Swiss Brutalist Bento Container */}
      <div
        style={{
          flex: 1,
          border: "3px solid #0A0A0C",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#0A0A0C",
          gap: 3,
        }}
      >
        {/* ==================== TOP ROW ==================== */}
        <div
          style={{
            height: topRowHeight,
            display: "flex",
            gap: 3,
          }}
        >
          {/* TOP-LEFT CELL: Slit-Scan Sliced Kinetic Typography */}
          <div
            style={{
              width: leftColWidth,
              backgroundColor: "#F4F1EA",
              padding: "36px 44px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle Swiss Background Diagonal Hatching */}
            <div
              style={{
                position: "absolute",
                right: -40,
                top: -40,
                width: 260,
                height: 260,
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(10,10,12,0.06) 0px, rgba(10,10,12,0.06) 4px, transparent 4px, transparent 14px)",
                borderRadius: "50%",
              }}
            />

            {/* Header Metadata */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #0A0A0C",
                paddingBottom: 14,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', Consolas, monospace",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  color: current.accent,
                }}
              >
                {current.code}
              </span>
              <span
                style={{
                  fontFamily: "'SF Mono', Consolas, monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "4px 12px",
                  backgroundColor: "#0A0A0C",
                  color: "#F4F1EA",
                }}
              >
                SWISS GRID // ZÜRICH-26
              </span>
            </div>

            {/* SLICED KINETIC TYPOGRAPHY BLOCK (3 Horizontal Clip-Path Strips) */}
            <div style={{ position: "relative", height: 290, display: "flex", alignItems: "center" }}>
              {[
                { clip: "inset(0% 0% 66% 0%)", sp: sliceSpring1, dir: -160 },
                { clip: "inset(33% 0% 33% 0%)", sp: sliceSpring2, dir: 160 },
                { clip: "inset(66% 0% 0% 0%)", sp: sliceSpring3, dir: -120 },
              ].map((slice, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: slice.clip,
                    transform: `translateX(${interpolate(slice.sp, [0, 1], [slice.dir, 0])}px)`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 112,
                      fontWeight: 950,
                      lineHeight: 0.92,
                      letterSpacing: "-0.04em",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      color: "#0A0A0C",
                    }}
                  >
                    {current.top}
                  </div>
                  <div
                    style={{
                      fontSize: 128,
                      fontWeight: 950,
                      lineHeight: 0.92,
                      letterSpacing: "-0.04em",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      color: current.accent,
                    }}
                  >
                    {current.bottom}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Ruler & Coordinates */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "'SF Mono', Consolas, monospace",
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(10,10,12,0.65)",
              }}
            >
              <span>SLIT-SCAN DISPLACEMENT: {(1 - sliceSpring2).toFixed(3)}px</span>
              <span>KERNING: -0.04EM // LEADING: 92%</span>
            </div>
          </div>

          {/* TOP-RIGHT CELL: International Klein Blue Swiss Pinwheel */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#0038FF",
              color: "#FFFFFF",
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <svg viewBox="-220 -220 440 440" style={{ width: 400, height: 400 }}>
              <defs>
                <path
                  id="textCirclePath"
                  d="M 0, -175 A 175,175 0 1,1 -0.1,-175"
                />
              </defs>

              {/* Rotating Circular Typography */}
              <g transform={`rotate(${-frame * 0.8})`}>
                <text
                  fill="#FFFFFF"
                  fontSize="14.5"
                  fontWeight="800"
                  letterSpacing="5.2"
                  fontFamily="'SF Mono', monospace"
                >
                  <textPath href="#textCirclePath">
                    PRECISION • RHYTHM • ELASTICITY • BALANCE •
                  </textPath>
                </text>
              </g>

              {/* Stepped Geometric Pinwheel */}
              <g transform={`rotate(${pinwheelAngle})`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <path
                    key={i}
                    d="M 0,0 L 115,-28 L 95,28 Z"
                    fill={i % 2 === 0 ? "#F4F1EA" : "#FF2A00"}
                    transform={`rotate(${i * 45})`}
                  />
                ))}
                <circle r="22" fill="#0A0A0C" />
                <circle r="8" fill="#E5FF00" />
              </g>
            </svg>

            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 24,
                fontFamily: "'SF Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.15em",
              }}
            >
              STEPPED ROTATION: {Math.round(pinwheelAngle)}°
            </div>
          </div>
        </div>

        {/* ==================== BOTTOM ROW ==================== */}
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 3,
          }}
        >
          {/* BOTTOM-LEFT CELL: Dark Mode Kinetic Ticker & Variable Stretch Bars */}
          <div
            style={{
              width: 740,
              backgroundColor: "#0A0A0C",
              color: "#F4F1EA",
              padding: "24px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "'SF Mono', monospace",
                fontSize: 12,
                color: "#E5FF00",
                letterSpacing: "0.2em",
              }}
            >
              <span>// HARMONIC WAVEFORM</span>
              <span>120.0 BPM LOCKED</span>
            </div>

            {/* 28 Kinetic Phase Pillars */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 140,
                gap: 6,
              }}
            >
              {Array.from({ length: 28 }).map((_, i) => {
                const wave = Math.sin(frame * 0.14 - i * 0.32);
                const h = interpolate(wave, [-1, 1], [18, 128]);
                const isPeak = wave > 0.75;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: h,
                      backgroundColor: isPeak ? "#FF2A00" : i % 3 === 0 ? "#E5FF00" : "#F4F1EA",
                      borderRadius: 99,
                    }}
                  />
                );
              })}
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                fontFamily: "system-ui, sans-serif",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>DESIGN IS HOW IT MOVES.</span>
              <span style={{ color: "#FF2A00", fontSize: 18, fontFamily: "monospace" }}>[60 FPS]</span>
            </div>
          </div>

          {/* BOTTOM-RIGHT CELL: Vermilion Red Live Cubic-Bezier Curve Lab */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#FF2A00",
              color: "#F4F1EA",
              padding: "24px 36px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                <div style={{ fontFamily: "'SF Mono', monospace", fontSize: 13, fontWeight: 800, letterSpacing: "0.18em" }}>
                  EASING CURVE ARCHITECTURE
                </div>
                <div style={{ fontSize: 44, fontWeight: 950, lineHeight: 1.05, marginTop: 8 }}>
                  cubic-bezier
                  <br />
                  <span style={{ color: "#E5FF00", fontFamily: "'SF Mono', monospace", fontSize: 34 }}>
                    (0.16, 1.0, 0.3, 1.0)
                  </span>
                </div>
              </div>

              {/* Animated Bouncing Pill Preview */}
              <div style={{ width: 420, height: 32, backgroundColor: "rgba(10,10,12,0.25)", borderRadius: 99, padding: 4 }}>
                <div
                  style={{
                    width: 64,
                    height: 24,
                    borderRadius: 99,
                    backgroundColor: "#E5FF00",
                    transform: `translateX(${bezierEased * 348}px)`,
                  }}
                />
              </div>
            </div>

            {/* Live SVG Bezier Handle Graph */}
            <svg viewBox="-20 -20 240 240" style={{ width: 220, height: 220, backgroundColor: "#0A0A0C", borderRadius: 16 }}>
              <line x1="0" y1="200" x2="200" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Handle lines */}
              <line x1="0" y1="200" x2="32" y2="0" stroke="#0038FF" strokeWidth="2" />
              <line x1="200" y1="0" x2="60" y2="0" stroke="#E5FF00" strokeWidth="2" />
              {/* Cubic Bezier Curve */}
              <path
                d="M 0,200 C 32,0 60,0 200,0"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4"
              />
              {/* Control Points */}
              <circle cx="32" cy="0" r="6" fill="#0038FF" />
              <circle cx="60" cy="0" r="6" fill="#E5FF00" />
              {/* Live Travelling Dot */}
              <circle
                cx={bezierLoop * 200}
                cy={200 - bezierEased * 200}
                r="9"
                fill="#FF2A00"
                stroke="#FFFFFF"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Venetian Blind Diagonal Shutter Transition to Scene 3 */}
      {shutterProgress > 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 60, pointerEvents: "none" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "100%",
                backgroundColor: "#121316",
                transform: `scaleX(${shutterProgress})`,
                transformOrigin: "left center",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
