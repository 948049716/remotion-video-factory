import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export interface ChapterItem {
  fromFrame: number;
  label: string;
}

export interface GlobalOverlayProps {
  projectTitle?: string;
  bpm?: number;
  chapters?: ChapterItem[];
}

const DEFAULT_CHAPTERS: ChapterItem[] = [
  { fromFrame: 0, label: "ACT I // THE SINGULARITY" },
  { fromFrame: 270, label: "ACT II // SWISS BRUTALISM" },
  { fromFrame: 540, label: "ACT III // ISOMETRIC 3D VOXELS" },
  { fromFrame: 840, label: "ACT IV // PROCEDURAL MORPHOLOGY" },
  { fromFrame: 1140, label: "ACT V // RAPID-FIRE SHOWCASE" },
  { fromFrame: 1500, label: "ACT VI // MASTERPIECE DOSSIER" },
];

export const GlobalOverlay: React.FC<GlobalOverlayProps> = ({
  projectTitle = "ALEX VANCE // SHOWREEL '26",
  bpm = 120,
  chapters = DEFAULT_CHAPTERS,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Format precision SMPTE timecode MM:SS:FF
  const totalSeconds = Math.floor(frame / fps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const subFrame = frame % fps;
  const timecode = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(subFrame).padStart(2, "0")}`;

  // Determine current chapter title
  let chapterLabel = chapters[0]?.label ?? "ACTIVE SEQUENCE";
  for (const ch of chapters) {
    if (frame >= ch.fromFrame) {
      chapterLabel = ch.label;
    }
  }

  // Beat indicator dot flashes on every beat
  const framesPerBeat = Math.max(1, Math.round((60 / bpm) * fps));
  const isBeatHit = frame % framesPerBeat < Math.max(2, Math.round(framesPerBeat * 0.2));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 100,
        fontFamily: "'SF Mono', Consolas, monospace",
      }}
    >
      {/* Top Floating Telemetry Pill Bar */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 48,
          right: 48,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "6px 16px",
            borderRadius: 999,
            backgroundColor: "rgba(10, 10, 14, 0.82)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(10px)",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isBeatHit ? "#CCFF00" : "#FF3B00",
              boxShadow: isBeatHit ? "0 0 10px #CCFF00" : "0 0 8px #FF3B00",
            }}
          />
          <span>{projectTitle}</span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span style={{ color: "#CCFF00" }}>{chapterLabel}</span>
        </div>

        {/* Right Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "6px 16px",
            borderRadius: 999,
            backgroundColor: "rgba(10, 10, 14, 0.82)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(10px)",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
          }}
        >
          <span>{bpm} BPM SYNC</span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span>TC {timecode}</span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span style={{ color: "#FF3B00" }}>
            F:{String(frame).padStart(4, "0")}/{durationInFrames}
          </span>
        </div>
      </div>

      {/* Bottom Progress Rail */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 48,
          right: 48,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            width: "100%",
            height: 4,
            backgroundColor: "rgba(10, 10, 14, 0.45)",
            borderRadius: 99,
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <div
            style={{
              width: `${(frame / durationInFrames) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #FF3B00 0%, #FFE600 50%, #CCFF00 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
