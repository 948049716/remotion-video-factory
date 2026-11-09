import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene6Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // =========================================================================
  // PHASE 1: High-Speed Snare Roll Strobe (Frames 0 - 72 | 25.0s - 26.2s)
  // =========================================================================
  if (frame < 72) {
    const strobeWords = [
      { text: "KINETIC", bg: "#08080A", fg: "#FFFFFF" },
      { text: "SPATIAL 3D", bg: "#FF3B00", fg: "#08080A" },
      { text: "PROCEDURAL", bg: "#F4F1EA", fg: "#08080A" },
      { text: "60 FPS CRAFT", bg: "#0038FF", fg: "#FFFFFF" },
      { text: "GO ALL OUT.", bg: "#CCFF00", fg: "#08080A" },
    ];
    const idx = Math.min(4, Math.floor(frame / 14.4));
    const current = strobeWords[idx];
    const localF = frame % 14.4;
    const scalePop = interpolate(localF, [0, 14], [1.22, 0.96]);

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: current.bg,
          color: current.fg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "0.35em",
            marginBottom: 16,
            opacity: 0.75,
          }}
        >
          // CRESCENDO SEQUENCE 0{idx + 1}
        </div>
        <div
          style={{
            fontSize: 168,
            fontWeight: 950,
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            fontFamily: "system-ui, sans-serif",
            transform: `scale(${scalePop})`,
          }}
        >
          {current.text}
        </div>
      </div>
    );
  }

  // =========================================================================
  // PHASE 2: The Final Drop — Masterpiece Résumé Dossier (Frames 72 - 300)
  // =========================================================================
  const dropFrame = frame - 72;

  const mainSpring = spring({
    frame: dropFrame,
    fps,
    config: { damping: 13, stiffness: 150, mass: 0.75 },
  });

  const cardSpring = spring({
    frame: dropFrame - 8,
    fps,
    config: { damping: 14, stiffness: 130, mass: 0.85 },
  });

  // Impact Camera Shake right at frame 72 (26.20s)
  const shakeDecay = Math.exp(-dropFrame * 0.22);
  const shakeX = dropFrame < 20 ? Math.sin(dropFrame * 3.2) * 26 * shakeDecay : 0;
  const shakeY = dropFrame < 20 ? Math.cos(dropFrame * 4.1) * 26 * shakeDecay : 0;

  // Impact Flash
  const dropFlash = interpolate(dropFrame, [0, 15], [0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const skills = [
    { name: "MOTION DIRECTION & KINETIC SYSTEMS", pct: 100, color: "#FF3B00" },
    { name: "REACT / TYPESCRIPT / REMOTION ENGINE", pct: 99, color: "#CCFF00" },
    { name: "3D SPATIAL UI & VOLUMETRIC DESIGN", pct: 97, color: "#00F0FF" },
    { name: "SOUND DESIGN & AUDIO-VISUAL SYNC", pct: 96, color: "#FFFFFF" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#08080B",
        color: "#F4F1EA",
        padding: "88px 64px 78px 64px",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "stretch",
        gap: 44,
        overflow: "hidden",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Drop White/Lime Impact Flash */}
      {dropFlash > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#CCFF00",
            opacity: dropFlash,
            zIndex: 80,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ==================== LEFT COLUMN: EDITORIAL HERO STATEMENT ==================== */}
      <div
        style={{
          flex: 1.15,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translateX(${interpolate(mainSpring, [0, 1], [-90, 0])}px)`,
        }}
      >
        {/* Top Availability Badge */}
        <div
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 20px",
            borderRadius: 999,
            backgroundColor: "rgba(204, 255, 0, 0.12)",
            border: "1.5px solid #CCFF00",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#CCFF00",
              boxShadow: "0 0 12px #CCFF00",
            }}
          />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.22em",
              color: "#CCFF00",
            }}
          >
            AVAILABLE FOR SELECT ROLES &amp; DIRECTION
          </span>
        </div>

        {/* Gigantic Asymmetric Statement */}
        <div>
          <div
            style={{
              fontSize: 112,
              fontWeight: 950,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#FFFFFF",
            }}
          >
            HIRE THE
            <br />
            <span style={{ color: "#FF3B00" }}>UNFAIR</span>
            <br />
            <span style={{ color: "#CCFF00" }}>ADVANTAGE.</span>
          </div>

          <div
            style={{
              marginTop: 24,
              fontSize: 22,
              fontWeight: 700,
              color: "rgba(244, 241, 234, 0.78)",
              letterSpacing: "0.02em",
              maxWidth: 640,
              lineHeight: 1.4,
            }}
          >
            Bridging world-class motion craft, Swiss typographic rigor, and deterministic React code.
          </div>
        </div>

        {/* Bottom Contact Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            paddingTop: 22,
            borderTop: "2px solid rgba(255,255,255,0.15)",
            fontFamily: "'SF Mono', monospace",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          <div>
            <span style={{ color: "#8C93A4", marginRight: 8 }}>MAIL //</span>
            <span style={{ color: "#FFFFFF" }}>alex@vance.studio</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <div>
            <span style={{ color: "#8C93A4", marginRight: 8 }}>REEL //</span>
            <span style={{ color: "#CCFF00" }}>vance.studio/2026</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <div>
            <span style={{ color: "#FF3B00" }}>@vance_motion</span>
          </div>
        </div>
      </div>

      {/* ==================== RIGHT COLUMN: RÉSUMÉ DOSSIER SPEC CARD ==================== */}
      <div
        style={{
          flex: 0.95,
          backgroundColor: "#121318",
          borderRadius: 28,
          border: "2px solid #2A2E39",
          padding: 36,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translateY(${interpolate(cardSpring, [0, 1], [100, 0])}px)`,
          boxShadow: "0 35px 70px rgba(0,0,0,0.65)",
        }}
      >
        {/* Dossier Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1.5px solid #2A2E39",
            paddingBottom: 20,
          }}
        >
          <div>
            <div style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, color: "#FF3B00", fontWeight: 800, letterSpacing: "0.2em" }}>
              CANDIDATE DOSSIER // ID-2026
            </div>
            <div style={{ fontSize: 32, fontWeight: 950, color: "#FFFFFF", marginTop: 4 }}>
              ALEX VANCE
            </div>
            <div style={{ fontSize: 14, color: "#8C93A4", fontFamily: "'SF Mono', monospace", marginTop: 2 }}>
              Principal Motion Designer &amp; Creative Technologist
            </div>
          </div>

          {/* Rotating Seal Monogram */}
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              backgroundColor: "#FF3B00",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: 950,
              fontSize: 24,
              color: "#FFFFFF",
              transform: `rotate(${dropFrame * 0.8}deg)`,
            }}
          >
            AV
          </div>
        </div>

        {/* Animated Capability Telemetry Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, margin: "16px 0" }}>
          {skills.map((sk, idx) => {
            const barSpring = spring({
              frame: dropFrame - 16 - idx * 6,
              fps,
              config: { damping: 15, stiffness: 120 },
            });
            const currentPct = Math.round(sk.pct * barSpring);
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                  }}
                >
                  <span style={{ color: "#EAECEF" }}>{sk.name}</span>
                  <span style={{ color: sk.color }}>{currentPct}%</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 10,
                    borderRadius: 99,
                    backgroundColor: "#1E212B",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${sk.pct * barSpring}%`,
                      height: "100%",
                      borderRadius: 99,
                      backgroundColor: sk.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Barcode & Verification Stamp */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1.5px solid #2A2E39",
            paddingTop: 18,
          }}
        >
          {/* Procedural SVG Barcode */}
          <div style={{ display: "flex", alignItems: "center", gap: 3, height: 32 }}>
            {Array.from({ length: 26 }).map((_, bIdx) => (
              <div
                key={bIdx}
                style={{
                  width: bIdx % 3 === 0 ? 4 : bIdx % 2 === 0 ? 2 : 1,
                  height: "100%",
                  backgroundColor: "#8C93A4",
                }}
              />
            ))}
          </div>

          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 11,
              color: "#CCFF00",
              textAlign: "right",
              fontWeight: 700,
            }}
          >
            <div>VERIFIED SHOWREEL</div>
            <div style={{ color: "#8C93A4" }}>1800 FRAMES @ 60FPS</div>
          </div>
        </div>
      </div>
    </div>
  );
};
