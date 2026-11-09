import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene5ProjectHighlights: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 4 Rapid-Fire Montage Cuts (90 frames = 1.5s each across 360 frames)
  const cutIndex = Math.min(3, Math.floor(frame / 90));
  const localFrame = frame % 90;

  const cutSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.6 },
  });

  const subSpring = spring({
    frame: localFrame - 8,
    fps,
    config: { damping: 14, stiffness: 150, mass: 0.7 },
  });

  // =========================================================================
  // CUT 01: BRAND IDENTITY SYSTEMS (Yellow #FFE600 & Black #08080A)
  // =========================================================================
  if (cutIndex === 0) {
    const stepAngle = Math.floor(localFrame / 22) * 90 +
      spring({ frame: localFrame % 22, fps, config: { damping: 11, stiffness: 220 } }) * 90;

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFE600",
          color: "#08080A",
          padding: "90px 72px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Left Column: Editorial Case Study Info */}
        <div
          style={{
            flex: 1.1,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            transform: `translateX(${interpolate(cutSpring, [0, 1], [-120, 0])}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                padding: "6px 16px",
                backgroundColor: "#08080A",
                color: "#FFE600",
                fontFamily: "'SF Mono', monospace",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: "0.2em",
              }}
            >
              DISCIPLINE 01 / 04
            </span>
            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 14, fontWeight: 800 }}>
              ★ CANNES LIONS GOLD // D&AD PENCIL
            </span>
          </div>

          <div
            style={{
              fontSize: 104,
              fontWeight: 950,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            DYNAMIC
            <br />
            BRAND
            <br />
            SYSTEMS.
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              maxWidth: 580,
              lineHeight: 1.35,
              borderLeft: "5px solid #08080A",
              paddingLeft: 20,
              marginTop: 8,
            }}
          >
            Generative logomarks & kinetic design languages that adapt to audio, scroll, and real-time data.
          </div>
        </div>

        {/* Right Column: Interactive Morphing Geometric Logomark */}
        <div
          style={{
            width: 560,
            height: 560,
            backgroundColor: "#08080A",
            borderRadius: 48,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${interpolate(cutSpring, [0, 1], [0.7, 1])}) rotate(${interpolate(cutSpring, [0, 1], [-12, 0])}deg)`,
            boxShadow: "0 40px 80px rgba(0,0,0,0.35)",
            position: "relative",
          }}
        >
          <svg viewBox="-200 -200 400 400" style={{ width: 420, height: 420 }}>
            <g transform={`rotate(${stepAngle})`}>
              {[0, 90, 180, 270].map((ang, i) => (
                <g key={i} transform={`rotate(${ang})`}>
                  <rect
                    x="18"
                    y="-68"
                    width="125"
                    height="56"
                    rx="28"
                    fill={i % 2 === 0 ? "#FFE600" : "#FF3B00"}
                  />
                  <circle cx="115" cy="-40" r="12" fill="#08080A" />
                </g>
              ))}
              <circle r="28" fill="#FFFFFF" />
            </g>
          </svg>
          <div
            style={{
              position: "absolute",
              bottom: 24,
              fontFamily: "'SF Mono', monospace",
              fontSize: 12,
              color: "#FFE600",
              letterSpacing: "0.22em",
            }}
          >
            PROCEDURAL BRANDMARK // INFINITE STATES
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CUT 02: 3D EXPLODED SPATIAL UI ARCHITECTURE (Deep Navy & Neon Cyan/Orange)
  // =========================================================================
  if (cutIndex === 1) {
    const zSpread = interpolate(subSpring, [0, 1], [0, 85]);

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#06101E",
          color: "#FFFFFF",
          padding: "90px 72px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          overflow: "hidden",
          perspective: 1400,
        }}
      >
        {/* Left: 3D Exploded Isometric UI Stack */}
        <div
          style={{
            width: 680,
            height: 560,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transformStyle: "preserve-3d",
            transform: `rotateX(52deg) rotateZ(-32deg) scale(${interpolate(cutSpring, [0, 1], [0.75, 1.05])})`,
            position: "relative",
          }}
        >
          {/* Layer 0: Hardware Base Chassis */}
          <div
            style={{
              position: "absolute",
              width: 440,
              height: 300,
              borderRadius: 24,
              backgroundColor: "#0D213F",
              border: "2px solid rgba(0, 240, 255, 0.35)",
              transform: `translateZ(${-zSpread}px)`,
              boxShadow: "0 40px 60px rgba(0,0,0,0.7)",
              padding: 20,
              fontFamily: "'SF Mono', monospace",
              fontSize: 11,
              color: "#00F0FF",
            }}
          >
            LAYER 00 // METAL SHADER SUBSTRATE
          </div>

          {/* Layer 1: UI Grid & Telemetry Graph */}
          <div
            style={{
              position: "absolute",
              width: 440,
              height: 300,
              borderRadius: 24,
              backgroundColor: "rgba(0, 240, 255, 0.14)",
              border: "2px solid #00F0FF",
              transform: `translateZ(0px)`,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, color: "#00F0FF", fontWeight: 800 }}>
              LAYER 01 // REACTIVE VIEWPORT
            </div>
            <div style={{ display: "flex", gap: 12, height: 140, alignItems: "flex-end" }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${35 + Math.sin(localFrame * 0.2 + i) * 55}%`,
                    backgroundColor: i % 2 === 0 ? "#00F0FF" : "#FF4D00",
                    borderRadius: 6,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Layer 2: Top Floating Holographic Modal */}
          <div
            style={{
              position: "absolute",
              width: 340,
              height: 190,
              borderRadius: 20,
              backgroundColor: "rgba(255, 77, 0, 0.9)",
              border: "2px solid #FFFFFF",
              transform: `translateZ(${zSpread * 1.15}px)`,
              boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              padding: 22,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, fontWeight: 800 }}>
              LAYER 02 // SPATIAL GLASS HUD
            </span>
            <span style={{ fontSize: 32, fontWeight: 950 }}>Z-DEPTH: +{Math.round(zSpread)}mm</span>
          </div>
        </div>

        {/* Right: Editorial Text */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            textAlign: "right",
            gap: 18,
            transform: `translateX(${interpolate(cutSpring, [0, 1], [120, 0])}px)`,
          }}
        >
          <span
            style={{
              padding: "6px 16px",
              backgroundColor: "#00F0FF",
              color: "#06101E",
              fontFamily: "'SF Mono', monospace",
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: "0.2em",
            }}
          >
            DISCIPLINE 02 / 04
          </span>
          <div
            style={{
              fontSize: 98,
              fontWeight: 950,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            SPATIAL UI
            <br />
            <span style={{ color: "#00F0FF" }}>&amp; VISION</span>
            <br />
            SYSTEMS.
          </div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.75)", maxWidth: 500 }}>
            Exploded Z-axis component hierarchies &amp; tactile micro-interactions for next-gen operating systems.
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CUT 03: INFOMOTION & NIGHTINGALE ROSE DATA VIZ (Deep Emerald & Mint/Gold)
  // =========================================================================
  if (cutIndex === 2) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#061710",
          color: "#F4F1EA",
          padding: "90px 72px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            transform: `translateY(${interpolate(cutSpring, [0, 1], [90, 0])}px)`,
          }}
        >
          <span
            style={{
              alignSelf: "flex-start",
              padding: "6px 16px",
              backgroundColor: "#00FF9D",
              color: "#061710",
              fontFamily: "'SF Mono', monospace",
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: "0.2em",
            }}
          >
            DISCIPLINE 03 / 04
          </span>
          <div
            style={{
              fontSize: 102,
              fontWeight: 950,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            VISCERAL
            <br />
            <span style={{ color: "#00FF9D" }}>DATA</span>
            <br />
            STORYTELLING.
          </div>
          <div style={{ fontSize: 20, color: "rgba(244,241,234,0.75)", maxWidth: 520 }}>
            Transforming dry telemetry and financial datasets into living, breathing visual narratives.
          </div>
        </div>

        {/* Nightingale Polar Rose Chart SVG */}
        <div style={{ width: 580, height: 580, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <svg viewBox="-260 -260 520 520" style={{ width: "100%", height: "100%" }}>
            <circle r="220" fill="none" stroke="rgba(0,255,157,0.18)" strokeWidth="1" strokeDasharray="6 6" />
            <circle r="150" fill="none" stroke="rgba(0,255,157,0.18)" strokeWidth="1" strokeDasharray="6 6" />
            {Array.from({ length: 16 }).map((_, i) => {
              const a0 = (i * Math.PI * 2) / 16 - Math.PI / 2;
              const a1 = ((i + 0.82) * Math.PI * 2) / 16 - Math.PI / 2;
              const targetR = 85 + ((i * 37) % 135);
              const r = targetR * cutSpring + Math.sin(localFrame * 0.15 + i) * 12;
              const x0 = Math.cos(a0) * r;
              const y0 = Math.sin(a0) * r;
              const x1 = Math.cos(a1) * r;
              const y1 = Math.sin(a1) * r;
              const colors = ["#00FF9D", "#FFE600", "#FF4D00", "#00F0FF"];
              return (
                <path
                  key={i}
                  d={`M 0,0 L ${x0.toFixed(1)},${y0.toFixed(1)} A ${r.toFixed(1)},${r.toFixed(1)} 0 0,1 ${x1.toFixed(1)},${y1.toFixed(1)} Z`}
                  fill={colors[i % 4]}
                  opacity={0.88}
                />
              );
            })}
            <circle r="42" fill="#061710" stroke="#00FF9D" strokeWidth="3" />
          </svg>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CUT 04: CINEMATIC ART DIRECTION & FILM TITLES (Crimson Red #D90429 & Black)
  // =========================================================================
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#D90429",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Rotating Brutalist Starburst Background */}
      <svg
        viewBox="-500 -500 1000 1000"
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          opacity: 0.18,
          transform: `rotate(${localFrame * 0.5}deg) scale(${interpolate(cutSpring, [0, 1], [1.4, 1])})`,
        }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <polygon
            key={i}
            points="0,0 45,-500 -45,-500"
            fill="#08080A"
            transform={`rotate(${i * 15})`}
          />
        ))}
      </svg>

      <div
        style={{
          zIndex: 10,
          textAlign: "center",
          transform: `scale(${interpolate(cutSpring, [0, 1], [1.35, 1])})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 20px",
            backgroundColor: "#08080A",
            color: "#FFE600",
            fontFamily: "'SF Mono', monospace",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: "0.28em",
            marginBottom: 20,
          }}
        >
          DISCIPLINE 04 / 04 // BROADCAST &amp; CINEMA
        </div>

        <div
          style={{
            fontSize: 132,
            fontWeight: 950,
            lineHeight: 0.88,
            letterSpacing: "-0.04em",
            fontFamily: "system-ui, sans-serif",
            color: "#FFFFFF",
            textShadow: "0 20px 0 #08080A",
          }}
        >
          ART DIRECTION
          <br />
          <span style={{ color: "#08080A", WebkitTextStroke: "3px #FFFFFF" }}>WITHOUT LIMITS</span>
        </div>
      </div>
    </div>
  );
};
