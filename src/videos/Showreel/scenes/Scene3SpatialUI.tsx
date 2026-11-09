import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene3SpatialUI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  // =========================================================================
  // 1. TRUE ISOMETRIC 3D VOXEL WAVE MATRIX (5x5 = 25 3-Faced 3D Columns)
  // =========================================================================
  const gridSize = 5;
  const tileW = 54; // half-width of isometric diamond
  const tileH = 31; // half-height of isometric diamond

  const voxels: Array<{
    gx: number;
    gy: number;
    isoX: number;
    isoY: number;
    height: number;
    isAccent: boolean;
    isMint: boolean;
  }> = [];

  for (let gx = 0; gx < gridSize; gx++) {
    for (let gy = 0; gy < gridSize; gy++) {
      const isoX = (gx - gy) * tileW;
      const isoY = (gx + gy) * tileH;
      const dist = Math.sqrt((gx - 2) ** 2 + (gy - 2) ** 2);
      const wave = Math.sin(frame * 0.11 - dist * 1.15);
      const colHeight = interpolate(wave, [-1, 1], [28, 165]) * enterSpring;
      voxels.push({
        gx,
        gy,
        isoX,
        isoY,
        height: colHeight,
        isAccent: wave > 0.68,
        isMint: (gx === 2 && gy === 2) || wave < -0.75,
      });
    }
  }

  // =========================================================================
  // 2. LISSAJOUS HARMONIC OSCILLOSCOPE CURVE
  // =========================================================================
  const lissajousPoints: string[] = [];
  const phase = frame * 0.045;
  for (let i = 0; i <= 140; i++) {
    const t = (i / 140) * Math.PI * 2;
    const lx = Math.sin(3 * t + phase) * 115;
    const ly = Math.sin(4 * t + phase * 0.6) * 75;
    lissajousPoints.push(`${lx.toFixed(1)},${ly.toFixed(1)}`);
  }

  // =========================================================================
  // 3. 16-STEP HARDWARE SEQUENCER (Synced to 120 BPM 16th notes = 7.5 frames)
  // =========================================================================
  const activeStep = Math.floor(frame / 7.5) % 16;

  // Exit Zoom Portal Transition (Frames 274 - 300)
  const exitZoom = interpolate(frame, [274, 300], [1, 4.5], {
    easing: Easing.bezier(0.7, 0, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    output: "perceptual-scale",
  });
  const exitOpacity = interpolate(frame, [282, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#121316",
        color: "#EAECEF",
        overflow: "hidden",
        padding: "84px 56px 76px 56px",
        boxSizing: "border-box",
        display: "flex",
        gap: 32,
        scale: exitZoom,
        opacity: exitOpacity,
      }}
    >
      {/* ==================== LEFT PANEL: ISOMETRIC 3D VOXEL ENGINE ==================== */}
      <div
        style={{
          flex: 1.15,
          backgroundColor: "#191B20",
          borderRadius: 24,
          border: "2px solid #2A2E37",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.06), 0 30px 60px rgba(0,0,0,0.5)",
          padding: 36,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top Industrial Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2 }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 12px",
                borderRadius: 6,
                backgroundColor: "#FF5500",
                color: "#FFFFFF",
                fontFamily: "'SF Mono', monospace",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.18em",
                marginBottom: 10,
              }}
            >
              FIELD-3D // VOXEL SYNTHESIS
            </div>
            <div
              style={{
                fontSize: 42,
                fontWeight: 950,
                letterSpacing: "-0.03em",
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.05,
              }}
            >
              ISOMETRIC VOLUMETRIC
              <br />
              <span style={{ color: "#00FF9D" }}>SPATIAL MATRIX</span>
            </div>
          </div>

          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 12,
              color: "#8C93A4",
              textAlign: "right",
              lineHeight: 1.6,
            }}
          >
            <div>PROJECTION: 30° ISO</div>
            <div>VERTICES: 25×6 FACES</div>
            <div style={{ color: "#FF5500", fontWeight: 700 }}>Z-WAVE: {(Math.sin(frame * 0.1) * 100).toFixed(0)}mm</div>
          </div>
        </div>

        {/* True 3-Faced Isometric Voxel SVG Render */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <svg viewBox="-340 -260 680 460" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            {/* Isometric Base Floor Grid */}
            <polygon
              points={`0,${-5.5 * tileH} ${5.5 * tileW},0 0,${5.5 * tileH} ${-5.5 * tileW},0`}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              transform="translate(0, 80)"
            />

            {/* Render 25 3D Prisms back-to-front (painter's algorithm order) */}
            {voxels.map((v, idx) => {
              const bx = v.isoX;
              const by = v.isoY - 40;
              const h = v.height;

              // Colors for Top, Left (lit), Right (shadow) faces
              const topColor = v.isAccent ? "#FF5500" : v.isMint ? "#00FF9D" : "#E2E6EE";
              const leftColor = v.isAccent ? "#CC4400" : v.isMint ? "#00C478" : "#9BA3B5";
              const rightColor = v.isAccent ? "#882B00" : v.isMint ? "#007A4B" : "#565D6D";

              const w = tileW * 0.82;
              const d = tileH * 0.82;

              // Top diamond face shifted up by h
              const topPts = `${bx},${by - h - d} ${bx + w},${by - h} ${bx},${by - h + d} ${bx - w},${by - h}`;
              // Left vertical face
              const leftPts = `${bx - w},${by - h} ${bx},${by - h + d} ${bx},${by + d} ${bx - w},${by}`;
              // Right vertical face
              const rightPts = `${bx},${by - h + d} ${bx + w},${by - h} ${bx + w},${by} ${bx},${by + d}`;

              return (
                <g key={idx}>
                  <polygon points={leftPts} fill={leftColor} stroke="#191B20" strokeWidth="1" />
                  <polygon points={rightPts} fill={rightColor} stroke="#191B20" strokeWidth="1" />
                  <polygon points={topPts} fill={topColor} stroke="#191B20" strokeWidth="1.2" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Bottom Status Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1.5px solid #2A2E37",
            paddingTop: 16,
            fontFamily: "'SF Mono', monospace",
            fontSize: 13,
            color: "#8C93A4",
          }}
        >
          <span>PAINTER'S Z-SORT // REALTIME SVG</span>
          <span style={{ color: "#EAECEF", fontWeight: 700 }}>HARDWARE ACCELERATED</span>
        </div>
      </div>

      {/* ==================== RIGHT PANEL: TACTILE SYNTHESIZER CONSOLE ==================== */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* MODULE 1: OLED Lissajous Harmonic Oscilloscope */}
        <div
          style={{
            flex: 1.1,
            backgroundColor: "#090A0C",
            borderRadius: 24,
            border: "2px solid #2A2E37",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "'SF Mono', monospace",
              fontSize: 12,
              color: "#00FF9D",
              letterSpacing: "0.18em",
            }}
          >
            <span>// CRT-OSCILLOSCOPE • XY-MODE</span>
            <span>f(x)=sin(3ωt) / f(y)=sin(4ωt)</span>
          </div>

          <svg viewBox="-160 -95 320 190" style={{ width: "100%", height: 185, overflow: "visible" }}>
            <line x1="-150" y1="0" x2="150" y2="0" stroke="rgba(0,255,157,0.15)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="-85" x2="0" y2="85" stroke="rgba(0,255,157,0.15)" strokeWidth="1" strokeDasharray="4 4" />
            <polyline
              points={lissajousPoints.join(" ")}
              fill="none"
              stroke="#00FF9D"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 10px rgba(0,255,157,0.65))" }}
            />
          </svg>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "'SF Mono', monospace",
              fontSize: 12,
              color: "#8C93A4",
            }}
          >
            <span>PHASE SHIFT: {(phase % 6.28).toFixed(2)} RAD</span>
            <span style={{ color: "#FFB800" }}>HARMONIC RATIO: 3:4</span>
          </div>
        </div>

        {/* MODULE 2: 4 Anodized Aluminum Rotary Encoders */}
        <div
          style={{
            height: 210,
            backgroundColor: "#D8DCE3",
            color: "#121316",
            borderRadius: 24,
            padding: "22px 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "inset 0 3px 0 #FFFFFF, 0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "'SF Mono', monospace",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.18em",
              color: "#121316",
            }}
          >
            <span>TACTILE ENCODER ARRAY // TE-OP1</span>
            <span style={{ color: "#FF5500" }}>● ARMED</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            {[
              { label: "TENSION", color: "#FF5500", speed: 1.8, base: -40 },
              { label: "DAMPING", color: "#0044FF", speed: -1.4, base: 30 },
              { label: "INERTIA", color: "#121316", speed: 2.2, base: 10 },
              { label: "RESONANCE", color: "#FFFFFF", speed: -1.9, base: 65 },
            ].map((knob, kIdx) => {
              const angle = knob.base + Math.sin(frame * 0.05 * knob.speed + kIdx) * 110;
              return (
                <div key={kIdx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 86,
                      height: 86,
                      borderRadius: "50%",
                      backgroundColor: "#BCC2CE",
                      border: "2px solid #9BA3B5",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: "inset 0 4px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        backgroundColor: knob.color,
                        boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
                        transform: `rotate(${angle}deg)`,
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 22,
                          borderRadius: 2,
                          backgroundColor: knob.color === "#FFFFFF" ? "#FF5500" : "#FFFFFF",
                          marginTop: 6,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                    }}
                  >
                    {knob.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODULE 3: 16-Step Sequencer LED Strip */}
        <div
          style={{
            height: 86,
            backgroundColor: "#191B20",
            borderRadius: 18,
            border: "2px solid #2A2E37",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {Array.from({ length: 16 }).map((_, sIdx) => {
            const isCurrent = sIdx === activeStep;
            const isQuarter = sIdx % 4 === 0;
            return (
              <div
                key={sIdx}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 6,
                  backgroundColor: isCurrent ? "#FF5500" : isQuarter ? "#2E333E" : "#22252D",
                  border: isCurrent ? "2px solid #FFFFFF" : "1px solid #363B47",
                  boxShadow: isCurrent ? "0 0 18px #FF5500" : "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                  transform: `scale(${isCurrent ? 1.08 : 1})`,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: isCurrent ? "#FFFFFF" : isQuarter ? "#00FF9D" : "#4A5162",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    color: isCurrent ? "#FFFFFF" : "#7A8294",
                  }}
                >
                  {String(sIdx + 1).padStart(2, "0")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
