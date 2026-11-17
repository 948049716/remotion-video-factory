import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  getStaticFiles,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  FPS,
  SPEAKERS,
  STORY_SLUG,
  ShotCue,
  ShotFx,
  ShotTiming,
  ShotTone,
  SpeakerId,
  TIMELINE,
} from "./shots";

const TONES: Record<
  ShotTone,
  { bg: string; glow: string; ink: string; vignette: string }
> = {
  night: {
    bg: "linear-gradient(180deg, #16242D 0%, #223540 58%, #2B3B3A 100%)",
    glow: "rgba(244, 184, 96, 0.38)",
    ink: "#EDF3F5",
    vignette: "rgba(12, 20, 26, 0.36)",
  },
  glow: {
    bg: "linear-gradient(180deg, #241C16 0%, #382B20 55%, #4A3828 100%)",
    glow: "rgba(255, 208, 122, 0.62)",
    ink: "#FFF4DC",
    vignette: "rgba(22, 14, 10, 0.34)",
  },
  warm: {
    bg: "linear-gradient(180deg, #2D2118 0%, #4E3824 52%, #6B4D2E 100%)",
    glow: "rgba(255, 218, 136, 0.78)",
    ink: "#FFF8EA",
    vignette: "rgba(28, 18, 10, 0.28)",
  },
};

const cameraTransform = (cue: ShotCue, frame: number, totalFrames: number) => {
  const p = interpolate(frame, [0, Math.max(1, totalFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = p * p * (3 - 2 * p);

  switch (cue) {
    case "push":
      return { scale: 1 + 0.065 * eased, x: 0, y: -6 * eased };
    case "pull":
      return { scale: 1.065 - 0.065 * eased, x: 0, y: 6 * (1 - eased) };
    case "pan-right":
      return { scale: 1.05, x: interpolate(eased, [0, 1], [22, -22]), y: 0 };
    case "pan-left":
      return { scale: 1.05, x: interpolate(eased, [0, 1], [-22, 22]), y: 0 };
    case "grow":
      return { scale: 1 + 0.05 * eased, x: 0, y: -14 * eased };
    case "pulse":
      return {
        scale: 1 + 0.02 * Math.sin(p * Math.PI),
        x: 0,
        y: 0,
      };
    case "still":
    default:
      return { scale: 1 + 0.015 * eased, x: 0, y: 0 };
  }
};

/**
 * 程序化手绘水彩氛围层：所有粒子均由 frame 确定性计算，保证无头渲染完全一致。
 */
const WatercolorFxLayer: React.FC<{ fx: ShotFx; glowColor: string }> = ({
  fx,
  glowColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  if (fx === "none") return null;

  if (fx === "starlight") {
    const stars = Array.from({ length: 16 }, (_, i) => {
      const baseX = ((i * 137.5) % 88) + 6;
      const baseY = ((i * 73.1) % 72) + 10;
      const driftY = Math.sin(t * 0.9 + i) * 12 - t * 6;
      const alpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.7));
      const size = 7 + (i % 4) * 4;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${baseX}%`,
            top: `calc(${baseY}% + ${driftY}px)`,
            width: size,
            height: size,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #FFFDF5 0%, #FFD685 48%, rgba(255,214,133,0) 100%)",
            boxShadow: `0 0 ${size * 2.2}px ${glowColor}`,
            opacity: alpha,
          }}
        />
      );
    });
    return <AbsoluteFill style={{ pointerEvents: "none" }}>{stars}</AbsoluteFill>;
  }

  if (fx === "leaves" || fx === "petals") {
    const isPetal = fx === "petals";
    const items = Array.from({ length: 10 }, (_, i) => {
      const startX = (i * 119) % 100;
      const speedY = 14 + (i % 3) * 7;
      const yPct = ((i * 23 + t * speedY) % 112) - 8;
      const swayX = Math.sin(t * 1.3 + i * 1.3) * 26;
      const rot = Math.sin(t * 1.1 + i) * 32 + i * 25;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(${startX}% + ${swayX}px)`,
            top: `${yPct}%`,
            width: isPetal ? 13 : 16,
            height: isPetal ? 9 : 10,
            borderRadius: "70% 30% 70% 30%",
            background: isPetal
              ? "rgba(255, 228, 178, 0.55)"
              : "rgba(232, 168, 92, 0.48)",
            boxShadow: `0 0 10px ${glowColor}`,
            transform: `rotate(${rot}deg)`,
            filter: "blur(0.4px)",
          }}
        />
      );
    });
    return <AbsoluteFill style={{ pointerEvents: "none" }}>{items}</AbsoluteFill>;
  }

  if (fx === "mist") {
    const offset = Math.sin(t * 0.45) * 36;
    const raindrops = Array.from({ length: 18 }, (_, i) => {
      const rx = (i * 97) % 100;
      const ry = ((i * 31 + t * 85) % 115) - 10;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${rx}%`,
            top: `${ry}%`,
            width: 1.5,
            height: 28,
            background:
              "linear-gradient(180deg, rgba(220,235,245,0) 0%, rgba(220,235,245,0.32) 100%)",
            transform: "rotate(6deg)",
          }}
        />
      );
    });
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {raindrops}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 78%, rgba(235, 245, 248, 0.14) 0%, rgba(235, 245, 248, 0) 70%)",
            transform: `translateX(${offset}px)`,
          }}
        />
      </AbsoluteFill>
    );
  }

  return null;
};

/**
 * 水彩纸张纹理与绘本柔边暗角（赋予全片统一的手绘水彩绘本纸感）
 */
const WatercolorPaperOverlay: React.FC<{ vignetteColor: string }> = ({
  vignetteColor,
}) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 110px 28px ${vignetteColor}, inset 0 0 18px 4px rgba(250, 244, 232, 0.18)`,
        }}
      />
      <svg
        width="100%"
        height="100%"
        style={{ opacity: 0.055, mixBlendMode: "overlay" }}
      >
        <filter id="watercolor-paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves={3}
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.45 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#watercolor-paper-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const ShotPanel: React.FC<{
  shot: ShotTiming;
  index: number;
  imageSrc?: string;
}> = ({ shot, index, imageSrc }) => {
  const frame = useCurrentFrame();
  const tone = TONES[shot.tone] ?? TONES.glow;
  const cam = cameraTransform(shot.cue, frame, shot.durationInFrames);

  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [Math.max(0, shot.durationInFrames - 8), shot.durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: tone.bg,
        opacity: Math.min(fadeIn, fadeOut),
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${cam.scale}) translate(${cam.x}px, ${cam.y}px)`,
        }}
      >
        {imageSrc ? (
          <Img
            src={staticFile(imageSrc)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: "10%",
              color: tone.ink,
              fontFamily:
                '"Noto Serif SC", "Songti SC", "Microsoft YaHei", serif',
            }}
          >
            <div style={{ fontSize: 26, opacity: 0.65, letterSpacing: 4 }}>
              SHOT {shot.id}
            </div>
            <div style={{ fontSize: 64, fontWeight: 700, marginTop: 12 }}>
              {shot.label}
            </div>
            <div
              style={{
                fontSize: 28,
                opacity: 0.8,
                marginTop: 20,
                maxWidth: 1100,
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              {shot.note}
            </div>
          </AbsoluteFill>
        )}

        <WatercolorFxLayer fx={shot.fx} glowColor={tone.glow} />
      </AbsoluteFill>

      {/* 底部字幕柔化衬底渐变，提升水彩亮部画面的字幕可读性 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "24%",
          background:
            "linear-gradient(180deg, rgba(10, 14, 18, 0) 0%, rgba(10, 14, 18, 0.52) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 右上角轻量分镜水印，方便审片对表 */}
      <div
        style={{
          position: "absolute",
          right: "4%",
          top: "4%",
          fontSize: 32,
          fontWeight: 700,
          color: "#FFFDF9",
          opacity: 0.22,
          letterSpacing: 2,
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          fontFamily: '"Noto Serif SC", "Microsoft YaHei", serif',
        }}
      >
        {String(index + 1).padStart(2, "0")} · {shot.label}
      </div>

      <WatercolorPaperOverlay vignetteColor={tone.vignette} />
    </AbsoluteFill>
  );
};

const StorybookSubtitle: React.FC<{
  text: string;
  speaker: SpeakerId;
}> = ({ text, speaker }) => {
  const meta = SPEAKERS[speaker] ?? SPEAKERS.narrator;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 48,
        display: "flex",
        justifyContent: "center",
        padding: "0 64px",
        fontFamily:
          '"Noto Serif SC", "Source Han Serif SC", "PingFang SC", "Microsoft YaHei", serif',
      }}
    >
      <div
        style={{
          maxWidth: 1420,
          padding: "14px 34px",
          borderRadius: 14,
          background: "rgba(14, 18, 22, 0.62)",
          backdropFilter: "blur(6px)",
          color: "#FFFDF9",
          fontSize: 40,
          lineHeight: 1.48,
          textAlign: "center",
          letterSpacing: 1.1,
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.75)",
          borderLeft: `5px solid ${meta.accent}`,
          boxShadow: "0 8px 28px rgba(0, 0, 0, 0.28)",
        }}
      >
        {meta.showPrefix ? (
          <span
            style={{
              color: meta.accent,
              fontWeight: 700,
              marginRight: 8,
            }}
          >
            {meta.name}：
          </span>
        ) : null}
        {text}
      </div>
    </div>
  );
};

const useStoryboardImages = (): Map<string, string> =>
  useMemo(() => {
    const map = new Map<string, string>();
    const prefix = `${STORY_SLUG}/images/`;
    for (const file of getStaticFiles()) {
      const name = file.name.replace(/\\/g, "/");
      if (!name.startsWith(prefix)) continue;
      const base = name.slice(prefix.length);
      const match = /^shot-(\d{2,3})\.(webp|png|jpe?g)$/i.exec(base);
      if (match && !map.has(match[1])) {
        map.set(match[1], name);
      }
    }
    return map;
  }, []);

export const OldChenMusicBoxVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const storyboard = useStoryboardImages();

  const activeLine = TIMELINE.flatMap((shot) =>
    shot.lines.map((line) => {
      const start = shot.fromFrame + Math.round(line.atSec * FPS);
      const end = start + Math.round(line.durSec * FPS);
      return { start, end, line };
    }),
  ).find((item) => frame >= item.start && frame < item.end);

  const subtitleOpacity = activeLine
    ? interpolate(
        frame,
        [
          activeLine.start,
          activeLine.start + 5,
          Math.max(activeLine.start + 5, activeLine.end - 5),
          activeLine.end,
        ],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0E1418" }}>
      {TIMELINE.map((shot, idx) => (
        <Sequence
          key={shot.id}
          from={shot.fromFrame}
          durationInFrames={shot.durationInFrames}
          name={`Shot ${shot.id} · ${shot.label}`}
        >
          <ShotPanel
            shot={shot}
            index={idx}
            imageSrc={storyboard.get(shot.id)}
          />
        </Sequence>
      ))}

      {TIMELINE.flatMap((shot) =>
        shot.lines.map((line) => (
          <Sequence
            key={`${shot.id}-${line.id}`}
            from={shot.fromFrame + Math.round(line.atSec * FPS)}
            durationInFrames={Math.max(1, Math.round(line.durSec * FPS))}
            name={`Audio ${line.id}`}
          >
            <Audio src={staticFile(line.file)} />
          </Sequence>
        )),
      )}

      {activeLine ? (
        <AbsoluteFill style={{ opacity: subtitleOpacity }}>
          <StorybookSubtitle
            text={activeLine.line.text}
            speaker={activeLine.line.speaker}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
