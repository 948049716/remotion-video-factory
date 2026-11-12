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
  TIMELINE,
  type ShotTiming,
  type ShotTone,
  type Speaker,
} from "./shots";

/**
 * 动态分镜（animatic）占位版。
 *
 * 目的不是好看，而是让人判断节奏：镜头长度、台词落点、留白够不够。
 * 正式分镜图回传后，只需替换 ShotPanel 里的占位视觉，时间轴与音频不动。
 */

const TONES: Record<ShotTone, { bg: string; glow: string; ink: string }> = {
  night: {
    bg: "linear-gradient(180deg, #0b161d 0%, #12232c 55%, #091117 100%)",
    glow: "rgba(127, 184, 201, 0.55)",
    ink: "#cfe6ee",
  },
  glow: {
    bg: "linear-gradient(180deg, #0c1a22 0%, #16303a 55%, #0a1419 100%)",
    glow: "rgba(255, 214, 138, 0.75)",
    ink: "#ffe9c2",
  },
  warm: {
    bg: "linear-gradient(180deg, #131c1d 0%, #26302a 55%, #101715 100%)",
    glow: "rgba(255, 201, 120, 0.7)",
    ink: "#ffe6b8",
  },
};

const CUE_LABEL: Record<string, string> = {
  push: "缓推",
  pull: "缓拉",
  still: "静止",
  grow: "生长",
  pulse: "呼吸光",
};

/** 镜头内的“运镜”只做轻微缩放/位移，够用来感受节奏即可。 */
const cameraTransform = (shot: ShotTiming, frame: number) => {
  const p = interpolate(frame, [0, shot.durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const eased = 1 - Math.pow(1 - p, 2);

  switch (shot.cue) {
    case "push":
      return { scale: 1 + 0.06 * eased, x: 0, y: 0 };
    case "pull":
      return { scale: 1.06 - 0.06 * eased, x: 0, y: 0 };
    case "grow":
      return { scale: 1 + 0.04 * eased, x: 0, y: -14 * eased };
    case "pulse":
      return { scale: 1 + 0.012 * eased, x: 0, y: 0 };
    default:
      return { scale: 1, x: 0, y: 0 };
  }
};

const ShotPanel: React.FC<{
  shot: ShotTiming;
  index: number;
  imageSrc?: string;
}> = ({ shot, index, imageSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tone = TONES[shot.tone];
  const cam = cameraTransform(shot, frame);

  const fadeIn = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [shot.durationInFrames - 6, shot.durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // 呼吸光：占位阶段用一个缓慢起伏的光团代表种子/星光树
  const breath =
    shot.cue === "pulse" || shot.cue === "grow"
      ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin((frame / fps) * 1.8))
      : 0.6;

  return (
    <AbsoluteFill
      style={{
        background: tone.bg,
        opacity: Math.min(fadeIn, fadeOut),
        fontFamily:
          '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif',
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
        ) : null}

        {/* 占位光团（有分镜图时不再绘制） */}
        {imageSrc ? null : (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "56%",
              width: 900,
              height: 900,
              marginLeft: -450,
              marginTop: -450,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${tone.glow} 0%, rgba(0,0,0,0) 62%)`,
              opacity: breath * 0.55,
              filter: "blur(6px)",
            }}
          />
        )}

        {/* 安全框：只在占位阶段显示 */}
        {imageSrc ? null : (
          <div
            style={{
              position: "absolute",
              inset: "6% 6% 18% 6%",
              border: `1px dashed ${tone.ink}44`,
              borderRadius: 8,
            }}
          />
        )}

        {/* 占位说明：只在没有分镜图时显示 */}
        {imageSrc ? null : (
          <div
            style={{
              position: "absolute",
              left: "8%",
              top: "12%",
              right: "8%",
              color: tone.ink,
            }}
          >
            <div
              style={{
                fontSize: 22,
                letterSpacing: 6,
                opacity: 0.6,
                marginBottom: 10,
              }}
            >
              分镜占位 · SHOT {shot.id} / 12
            </div>
            <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: 2 }}>
              {shot.label}
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 28,
                lineHeight: 1.6,
                maxWidth: 1180,
                opacity: 0.78,
              }}
            >
              {shot.note}
            </div>
            <div
              style={{
                marginTop: 26,
                display: "inline-block",
                padding: "6px 18px",
                borderRadius: 999,
                border: `1px solid ${tone.ink}55`,
                fontSize: 22,
                letterSpacing: 3,
                opacity: 0.8,
              }}
            >
              运镜 {CUE_LABEL[shot.cue]} · {shot.durSec.toFixed(1)}s
            </div>
          </div>
        )}
      </AbsoluteFill>

      {/* 序号水印，方便对表 */}
      <div
        style={{
          position: "absolute",
          right: "6%",
          top: "8%",
          fontSize: 120,
          fontWeight: 800,
          color: imageSrc ? "#FFFFFF" : tone.ink,
          opacity: imageSrc ? 0.16 : 0.08,
          textShadow: imageSrc ? "0 2px 12px rgba(0,0,0,0.6)" : undefined,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};

const Subtitle: React.FC<{ text: string; speaker: Speaker }> = ({
  text,
  speaker,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 56,
        display: "flex",
        justifyContent: "center",
        fontFamily:
          '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          padding: "14px 34px",
          borderRadius: 10,
          background: "rgba(6, 12, 16, 0.55)",
          color: "#FFFFFF",
          fontSize: 44,
          lineHeight: 1.45,
          textAlign: "center",
          letterSpacing: 1,
          textShadow: "0 2px 10px rgba(0,0,0,0.75)",
          borderLeft:
            speaker === "fox"
              ? "4px solid #FFC978"
              : "4px solid rgba(255,255,255,0.28)",
        }}
      >
        {speaker === "fox" ? <span style={{ opacity: 0.65 }}>阿狸：</span> : null}
        {text}
      </div>
    </div>
  );
};

const STORYBOARD_DIR = "fox-starlight-seed/images";

/**
 * 扫描 public/ 下是否已有分镜图（shot-01.webp 等）。
 * 有则用实图，没有则回退占位——因此可以边画边看，不必等 12 张齐全。
 */
const useStoryboard = (): Map<string, string> =>
  useMemo(() => {
    const map = new Map<string, string>();
    for (const file of getStaticFiles()) {
      const name = file.name.replace(/\\/g, "/");
      if (!name.startsWith(`${STORYBOARD_DIR}/`)) continue;
      const base = name.slice(STORYBOARD_DIR.length + 1);
      const match = /^shot-(\d{2})\.(webp|png|jpe?g)$/i.exec(base);
      if (match && !map.has(match[1])) {
        map.set(match[1], name);
      }
    }
    return map;
  }, []);

export const FoxStarlightSeedAnimatic: React.FC = () => {
  const frame = useCurrentFrame();
  const storyboard = useStoryboard();

  // 找到当前正在播放的台词（用于字幕）
  const active = TIMELINE.flatMap((shot) =>
    shot.lines.map((line) => {
      const start = shot.fromFrame + Math.round(line.atSec * FPS);
      const end = start + Math.round(line.durSec * FPS);
      return { start, end, line };
    }),
  ).find((item) => frame >= item.start && frame < item.end);

  const subtitleOpacity = active
    ? interpolate(
        frame,
        [
          active.start,
          active.start + 4,
          active.end - 4,
          active.end,
        ],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#05090B" }}>
      {TIMELINE.map((shot, index) => (
        <Sequence
          key={shot.id}
          from={shot.fromFrame}
          durationInFrames={shot.durationInFrames}
          name={`${shot.id} ${shot.label}`}
        >
          <ShotPanel
            shot={shot}
            index={index}
            imageSrc={storyboard.get(shot.id)}
          />
        </Sequence>
      ))}

      {TIMELINE.flatMap((shot) =>
        shot.lines.map((line) => (
          <Sequence
            key={`${shot.id}-${line.id}`}
            from={shot.fromFrame + Math.round(line.atSec * FPS)}
            durationInFrames={Math.round(line.durSec * FPS)}
            name={`音频 ${line.id}`}
          >
            <Audio src={staticFile(line.file)} />
          </Sequence>
        )),
      )}

      {active ? (
        <AbsoluteFill style={{ opacity: subtitleOpacity }}>
          <Subtitle text={active.line.text} speaker={active.line.speaker} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
