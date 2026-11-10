import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

interface Chapter {
  startFrame: number;
  label: string;
  tag: string;
}

const CHAPTERS: Chapter[] = [
  { startFrame: 0, label: "01 // QUANTUM COLLAPSE", tag: "SINGULARITY" },
  { startFrame: 240, label: "02 // 3D SPATIAL MATRIX", tag: "ISOMETRIC UI" },
  { startFrame: 540, label: "03 // PARAMETRIC TOPOLOGY", tag: "GENERATIVE" },
  { startFrame: 840, label: "04 // SWISS KINETIC TYPE", tag: "TYPOGRAPHY" },
  { startFrame: 1140, label: "05 // SELECTED MASTERWORKS", tag: "CASE STUDIES" },
  { startFrame: 1500, label: "06 // BEZIER MATHEMATICS", tag: "RIGGING & CODE" },
  { startFrame: 1680, label: "07 // APEX DOSSIER", tag: "RÉSUMÉ LOCKUP" },
];

export const ApexHUD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Precision SMPTE Timecode
  const totalSeconds = Math.floor(frame / fps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const frames = frame % fps;
  const timecode = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;

  // Current chapter detection
  let currentChapter = CHAPTERS[0];
  for (const ch of CHAPTERS) {
    if (frame >= ch.startFrame) {
      currentChapter = ch;
    }
  }

  // Audio beat strobe (120 BPM = 30 frames per beat)
  const isBeat = frame % 30 < 4;
  const progress = frame / durationInFrames;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 900,
        fontFamily: THEME.fonts.mono,
        color: THEME.colors.pureWhite,
      }}
    >
      {/* 1. TOP HEADER STATUS BAR */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 36,
          right: 36,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          letterSpacing: "0.15em",
        }}
      >
        {/* Left Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(13, 14, 21, 0.8)",
            padding: "8px 18px",
            borderRadius: 6,
            border: `1px solid ${THEME.colors.borderBright}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isBeat ? THEME.colors.neonLime : THEME.colors.crimsonRed,
              boxShadow: isBeat ? `0 0 10px ${THEME.colors.neonLime}` : `0 0 8px ${THEME.colors.crimsonRed}`,
            }}
          />
          <span style={{ fontWeight: 800, color: THEME.colors.pureWhite }}>
            KAI CHEN
          </span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span style={{ color: THEME.colors.electricCyan, fontWeight: 700 }}>
            APEX 2026 REEL
          </span>
        </div>

        {/* Center Live Chapter Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(13, 14, 21, 0.8)",
            padding: "8px 20px",
            borderRadius: 6,
            border: `1px solid ${THEME.colors.border}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <span style={{ color: THEME.colors.neonLime, fontWeight: 700 }}>
            {currentChapter.tag}
          </span>
          <span style={{ opacity: 0.35 }}>//</span>
          <span style={{ opacity: 0.85 }}>{currentChapter.label}</span>
        </div>

        {/* Right Telemetry */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "rgba(13, 14, 21, 0.8)",
            padding: "8px 18px",
            borderRadius: 6,
            border: `1px solid ${THEME.colors.borderBright}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <span style={{ color: THEME.colors.solarAmber }}>60 FPS SYNC</span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span style={{ color: THEME.colors.pureWhite, fontWeight: 700 }}>
            {timecode}
          </span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span style={{ color: THEME.colors.electricCyan }}>
            F:{String(frame).padStart(4, "0")}
          </span>
        </div>
      </div>

      {/* 2. FOUR CORNER RETICLE BRACKETS */}
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", inset: 0, opacity: 0.4 }}
      >
        {/* Top-Left */}
        <path d="M 36 64 L 36 36 L 64 36" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Top-Right */}
        <path d="M 1884 64 L 1884 36 L 1856 36" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Bottom-Left */}
        <path d="M 36 1016 L 36 1044 L 64 1044" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Bottom-Right */}
        <path d="M 1884 1016 L 1884 1044 L 1856 1044" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Center Crosshairs Micro Reticle */}
        <line x1="945" y1="540" x2="975" y2="540" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="960" y1="525" x2="960" y2="555" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx="960" cy="540" r="14" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />
      </svg>

      {/* 3. BOTTOM RHYTHMIC TIMELINE & METRICS RAIL */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 36,
          right: 36,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Top Bar with Dynamic Mini-Waveform Visualizer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 10,
            opacity: 0.75,
            letterSpacing: "0.1em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span>REMOTION PROGRAMMATIC RENDER ENGINE</span>
            <span>·</span>
            <span style={{ color: THEME.colors.electricCyan }}>100% MATH & CODE DRIVEN</span>
          </div>

          {/* Mini Spectrum Bars */}
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 16 }}>
            {Array.from({ length: 18 }).map((_, i) => {
              const h = Math.abs(Math.sin((frame + i * 8) * 0.18)) * 14 + 2;
              return (
                <div
                  key={i}
                  style={{
                    width: 2,
                    height: h,
                    backgroundColor: i % 3 === 0 ? THEME.colors.electricCyan : THEME.colors.pureWhite,
                    opacity: 0.8,
                  }}
                />
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span>AUDIO SYNC: 120 BPM</span>
            <span>·</span>
            <span style={{ color: THEME.colors.neonLime }}>
              {(progress * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Global Progress Track with Chapter Markers */}
        <div
          style={{
            width: "100%",
            height: 3,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            position: "relative",
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          {/* Active Fill */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${THEME.colors.electricCyan}, ${THEME.colors.neonLime})`,
              boxShadow: `0 0 10px ${THEME.colors.electricCyan}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
