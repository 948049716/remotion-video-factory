import React from "react";
import { Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PALETTES } from "../../shared/motion-presets";
import {
  CHAPTERS,
  DURATION_FRAMES,
  FPS,
  SEGMENTS,
  TERM_META,
  segmentAtFrame,
  segmentFrames,
  startFrame,
} from "./timeline";
import { SceneRenderer } from "./scenes";

const C = PALETTES.chromaticNight;
const FONT =
  "'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans', sans-serif";
const MONO = "'SF Mono', Consolas, 'Noto Sans Mono', monospace";

/** MM:SS:FF timecode at 60fps. */
const timecode = (frame: number): string => {
  const totalSeconds = Math.floor(frame / FPS);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  const ff = String(frame % FPS).padStart(2, "0");
  return `${mm}:${ss}:${ff}`;
};

const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const seg = segmentAtFrame(frame);
  const meta = seg ? TERM_META[seg.term] : TERM_META.INTRO;
  const progress = frame / durationInFrames;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 100,
        fontFamily: FONT,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 48,
          right: 48,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "8px 20px",
            borderRadius: 999,
            backgroundColor: "rgba(10,10,14,0.85)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: meta.color,
              boxShadow: `0 0 12px ${meta.color}`,
            }}
          />
          <span>AI 概念科普 · 七词七十年</span>
          {seg && seg.term !== "INTRO" && seg.term !== "RECAP" && seg.term !== "CLOSING" && (
            <>
              <span style={{ opacity: 0.35 }}>|</span>
              <span style={{ color: meta.color }}>
                {meta.en} · {meta.cn}
              </span>
            </>
          )}
          {seg && (seg.term === "RECAP" || seg.term === "CLOSING") && (
            <>
              <span style={{ opacity: 0.35 }}>|</span>
              <span style={{ color: meta.color }}>{meta.cn}</span>
            </>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "8px 20px",
            borderRadius: 999,
            backgroundColor: "rgba(10,10,14,0.85)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#FFFFFF",
            fontFamily: MONO,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          <span>TC {timecode(frame)}</span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span>
            {seg ? `${String(seg.index).padStart(2, "0")}/37` : "—/37"}
          </span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span style={{ color: C.acidLime }}>
            F:{String(frame).padStart(5, "0")}/{durationInFrames}
          </span>
        </div>
      </div>

      {/* Bottom progress rail + chapter markers */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 48,
          right: 48,
          height: 26,
        }}
      >
        {CHAPTERS.map(({ term, fromFrame }) => {
          const left = `${(fromFrame / DURATION_FRAMES) * 100}%`;
          const covered = frame >= fromFrame;
          const m = TERM_META[term];
          return (
            <div
              key={term}
              style={{
                position: "absolute",
                left,
                bottom: 0,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: covered ? m.color : "rgba(255,255,255,0.45)",
                }}
              >
                {m.en}
              </span>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: covered ? m.color : "rgba(255,255,255,0.35)",
                  boxShadow: covered ? `0 0 8px ${m.color}` : "none",
                }}
              />
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 2,
            height: 5,
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.16)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${C.acidLime} 0%, ${C.cyberCyan} 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

/** Caption bar: typewriter reveal of the current segment's verbatim text. */
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = segmentAtFrame(frame);
  if (!seg) {
    return null;
  }
  const local = (frame - startFrame(seg)) / segmentFrames(seg);
  const shown = Math.floor(
    interpolate(local, [0, 1], [0, seg.text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const meta = TERM_META[seg.term];
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        right: 96,
        bottom: 62,
        zIndex: 90,
        backgroundColor: "rgba(6,4,12,0.78)",
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 14,
        padding: "12px 24px",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: "0.14em",
          color: meta.color,
          marginBottom: 4,
        }}
      >
        {String(seg.index).padStart(2, "0")} · {meta.en} {meta.cn} · {seg.headline}
      </div>
      <div
        style={{
          fontSize: 27,
          lineHeight: 1.5,
          color: "#FFFFFF",
          minHeight: 82,
          maxHeight: 122,
          overflow: "hidden",
        }}
      >
        {seg.text.slice(0, shown)}
        <span style={{ color: meta.color }}>▍</span>
      </div>
    </div>
  );
};

export const AiExplainer: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        width: 1920,
        height: 1080,
        backgroundColor: C.void,
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT,
      }}
    >
      {/* One Sequence per timetable chunk — visuals strictly follow the audio. */}
      {SEGMENTS.map((seg) => (
        <Sequence
          key={seg.index}
          from={startFrame(seg)}
          durationInFrames={segmentFrames(seg)}
          name={`Seg ${seg.index}: ${seg.headline}`}
        >
          <SceneRenderer seg={seg} frames={segmentFrames(seg)} />
        </Sequence>
      ))}

      {/* Narration from frame 0 (public/ai-explainer/narration.wav, 669.94s). */}
      <Audio src={staticFile("ai-explainer/narration.wav")} />

      <Captions />
      <Hud />
    </div>
  );
};
