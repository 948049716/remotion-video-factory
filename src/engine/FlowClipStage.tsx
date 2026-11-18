import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  KeyframeAnimaticSpec,
  ShotCue,
  StoryShotTiming,
  VideoClipSpec,
} from "./types";

export const computeCameraTransform = (
  cue: ShotCue,
  frame: number,
  totalFrames: number,
): { scale: number; x: number; y: number } => {
  const p = interpolate(frame, [0, Math.max(1, totalFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = p * p * (3 - 2 * p);

  switch (cue) {
    case "push":
      return { scale: 1 + 0.06 * eased, x: 0, y: -5 * eased };
    case "pull":
      return { scale: 1.06 - 0.06 * eased, x: 0, y: 5 * (1 - eased) };
    case "pan-right":
      return { scale: 1.05, x: interpolate(eased, [0, 1], [20, -20]), y: 0 };
    case "pan-left":
      return { scale: 1.05, x: interpolate(eased, [0, 1], [-20, 20]), y: 0 };
    case "grow":
      return { scale: 1 + 0.045 * eased, x: 0, y: -12 * eased };
    case "pulse":
      return {
        scale: 1 + 0.018 * Math.sin(p * Math.PI),
        x: 0,
        y: 0,
      };
    case "still":
    default:
      return { scale: 1 + 0.012 * eased, x: 0, y: 0 };
  }
};

/**
 * 解析当前镜头的安全播放变速比：
 * 若视频原片比镜头目标时长略短（例如 5.7s 原片需撑满 6.0s 镜头），自动做无感微慢放（下限 0.84x），
 * 防止镜头末尾出现黑屏或画面定格跳变。
 */
export const resolveClipPlaybackRate = (
  clip: VideoClipSpec,
  shotDurSec: number,
): number => {
  if (typeof clip.playbackRate === "number" && clip.playbackRate > 0) {
    return clip.playbackRate;
  }
  if (typeof clip.sourceDurSec === "number" && clip.sourceDurSec > 0) {
    const usableSec = Math.max(0.2, clip.sourceDurSec - (clip.trimBeforeSec ?? 0));
    if (usableSec < shotDurSec) {
      const neededRate = usableSec / Math.max(0.2, shotDurSec);
      return Number(Math.max(0.84, Math.min(1.0, neededRate * 0.99)).toFixed(4));
    }
  }
  return 1.0;
};

/**
 * Google Flow 真动画视频切片舞台（基于 OffthreadVideo 帧级精确解码）
 */
export const FlowClipStage: React.FC<{
  shot: StoryShotTiming;
  clip: VideoClipSpec;
  isSpeechActive: boolean;
}> = ({ shot, clip, isSpeechActive }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const trimBeforeFrames = Math.max(0, Math.round((clip.trimBeforeSec ?? 0) * fps));
  const playbackRate = resolveClipPlaybackRate(clip, shot.durSec);
  const keepAudio = Boolean(clip.keepAmbientAudio);

  const cam = clip.applyCameraCue
    ? computeCameraTransform(shot.cue, frame, shot.durationInFrames)
    : { scale: 1, x: 0, y: 0 };

  const baseVol = clip.ambientVolume ?? 0.35;
  const duckVol = clip.duckedAmbientVolume ?? 0.12;
  const targetVol = isSpeechActive ? duckVol : baseVol;

  const edgeFade = interpolate(
    frame,
    [
      0,
      Math.min(6, shot.durationInFrames),
      Math.max(0, shot.durationInFrames - 6),
      shot.durationInFrames,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        transform:
          cam.scale !== 1 || cam.x !== 0 || cam.y !== 0
            ? `translate(${cam.x.toFixed(2)}px, ${cam.y.toFixed(2)}px) scale(${cam.scale.toFixed(4)})`
            : undefined,
      }}
    >
      <OffthreadVideo
        src={staticFile(clip.src)}
        trimBefore={trimBeforeFrames > 0 ? trimBeforeFrames : undefined}
        playbackRate={playbackRate}
        muted={!keepAudio}
        volume={keepAudio ? Number((targetVol * edgeFade).toFixed(4)) : 0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * 首尾关键帧动态故事板舞台（Animatic Stage）：
 * 在去 Google Flow 生成视频前（或部分镜头还在生成中时），
 * 直接用首尾帧 + 运镜实时预览全片配音节奏与构图衔接。
 */
export const KeyframeAnimaticStage: React.FC<{
  shot: StoryShotTiming;
  animatic: KeyframeAnimaticSpec;
  showBadge?: boolean;
}> = ({ shot, animatic, showBadge = false }) => {
  const frame = useCurrentFrame();
  const cam = computeCameraTransform(shot.cue, frame, shot.durationInFrames);

  const ratio = animatic.crossfadeStartRatio ?? 0.55;
  const crossStart = Math.round(shot.durationInFrames * ratio);
  const crossEnd = Math.max(crossStart + 1, Math.round(shot.durationInFrames * 0.88));
  const endOpacity = animatic.endSrc
    ? interpolate(frame, [crossStart, crossEnd], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translate(${cam.x.toFixed(2)}px, ${cam.y.toFixed(2)}px) scale(${cam.scale.toFixed(4)})`,
        }}
      >
        <Img
          src={staticFile(animatic.startSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {animatic.endSrc ? (
          <Img
            src={staticFile(animatic.endSrc)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: endOpacity,
            }}
          />
        ) : null}
      </AbsoluteFill>

      {showBadge ? (
        <div
          style={{
            position: "absolute",
            left: "3.5%",
            top: "4%",
            padding: "6px 14px",
            borderRadius: 8,
            background: "rgba(20, 26, 32, 0.65)",
            border: "1px solid rgba(244, 184, 96, 0.55)",
            color: "#F4B860",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 1,
            fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
          }}
        >
          ANIMATIC · 待导入 Flow 视频 ({shot.id})
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
