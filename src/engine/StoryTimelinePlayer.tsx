import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  getStaticFiles,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  FlowClipStage,
  KeyframeAnimaticStage,
  computeCameraTransform,
} from "./FlowClipStage";
import { Layered2DStage } from "./Layered2DStage";
import {
  AudioLine,
  DEFAULT_FLOW_FPS,
  KeyframeAnimaticSpec,
  ShotFx,
  ShotTone,
  SpeakerId,
  SpeakerMeta,
  StoryProjectConfig,
  StoryShotTiming,
  VideoClipSpec,
  buildStoryTimeline,
} from "./types";

const TONES: Record<
  ShotTone,
  { bg: string; glow: string; ink: string; vignette: string; dipColor: string }
> = {
  night: {
    bg: "linear-gradient(180deg, #16242D 0%, #223540 58%, #2B3B3A 100%)",
    glow: "rgba(244, 184, 96, 0.38)",
    ink: "#EDF3F5",
    vignette: "rgba(12, 20, 26, 0.36)",
    dipColor: "#0D151B",
  },
  glow: {
    bg: "linear-gradient(180deg, #241C16 0%, #382B20 55%, #4A3828 100%)",
    glow: "rgba(255, 208, 122, 0.62)",
    ink: "#FFF4DC",
    vignette: "rgba(22, 14, 10, 0.34)",
    dipColor: "#1A120C",
  },
  warm: {
    bg: "linear-gradient(180deg, #2D2118 0%, #4E3824 52%, #6B4D2E 100%)",
    glow: "rgba(255, 218, 136, 0.78)",
    ink: "#FFF8EA",
    vignette: "rgba(28, 18, 10, 0.28)",
    dipColor: "#261A10",
  },
  meadow: {
    bg: "linear-gradient(180deg, #1F2E28 0%, #2F463B 55%, #425B47 100%)",
    glow: "rgba(235, 245, 190, 0.52)",
    ink: "#F6FAF2",
    vignette: "rgba(14, 24, 18, 0.30)",
    dipColor: "#111B16",
  },
};

export const WatercolorFxLayer: React.FC<{ fx: ShotFx; glowColor: string }> = ({
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

  if (fx === "ripples") {
    const rings = Array.from({ length: 4 }, (_, i) => {
      const cycle = (t * 0.45 + i * 0.25) % 1;
      const scale = 0.35 + cycle * 1.45;
      const alpha = (1 - cycle) * 0.36;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "68%",
            width: 360,
            height: 120,
            marginLeft: -180,
            marginTop: -60,
            borderRadius: "50%",
            border: `2px solid ${glowColor}`,
            opacity: alpha,
            transform: `scale(${scale.toFixed(3)})`,
          }}
        />
      );
    });
    return <AbsoluteFill style={{ pointerEvents: "none" }}>{rings}</AbsoluteFill>;
  }

  return null;
};

export const WatercolorPaperOverlay: React.FC<{
  vignetteColor: string;
  filterId: string;
}> = ({ vignetteColor, filterId }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 105px 26px ${vignetteColor}, inset 0 0 16px 4px rgba(250, 244, 232, 0.16)`,
        }}
      />
      <svg
        width="100%"
        height="100%"
        style={{ opacity: 0.045, mixBlendMode: "overlay" }}
      >
        <filter id={filterId}>
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
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </AbsoluteFill>
  );
};

const StorybookSubtitle: React.FC<{
  text: string;
  speaker: SpeakerId;
  speakers: Record<SpeakerId, SpeakerMeta>;
}> = ({ text, speaker, speakers }) => {
  const meta = speakers[speaker] ?? {
    name: speaker,
    accent: "rgba(255, 248, 231, 0.45)",
    showPrefix: false,
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 46,
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

type DiscoveredAssets = {
  allFiles: Set<string>;
  clips: Map<string, string>;
  startFrames: Map<string, string>;
  endFrames: Map<string, string>;
};

const useDiscoveredStoryAssets = (storySlug: string): DiscoveredAssets =>
  useMemo(() => {
    const allFiles = new Set<string>();
    const clips = new Map<string, string>();
    const startFrames = new Map<string, string>();
    const endFrames = new Map<string, string>();

    const videoPrefix = `${storySlug}/video/`;
    const imagePrefix = `${storySlug}/images/`;

    for (const file of getStaticFiles()) {
      const name = file.name.replace(/\\/g, "/");
      allFiles.add(name);
      if (name.startsWith(videoPrefix)) {
        const base = name.slice(videoPrefix.length);
        const match = /^shot-(\d{2,3})\.(mp4|webm)$/i.exec(base);
        if (match && !clips.has(match[1])) {
          clips.set(match[1], name);
        }
      } else if (name.startsWith(imagePrefix)) {
        const base = name.slice(imagePrefix.length);
        const startMatch = /^shot-(\d{2,3})(?:-start)?\.(webp|png|jpe?g)$/i.exec(
          base,
        );
        if (startMatch) {
          // 优先使用显式的 -start 图，若无则使用 shot-XX.webp
          const isExplicitStart = base.includes("-start.");
          if (isExplicitStart || !startFrames.has(startMatch[1])) {
            startFrames.set(startMatch[1], name);
          }
        }
        const endMatch = /^shot-(\d{2,3})-end\.(webp|png|jpe?g)$/i.exec(base);
        if (endMatch && !endFrames.has(endMatch[1])) {
          endFrames.set(endMatch[1], name);
        }
      }
    }

    return { allFiles, clips, startFrames, endFrames };
  }, [storySlug]);

const sampleLineEnvelope = (
  line: AudioLine,
  globalFrame: number,
  lineStartFrame: number,
  fps: number,
): number => {
  const localFrame = Math.max(0, globalFrame - lineStartFrame);
  if (line.envelope && line.envelope.length > 0) {
    const envFps = line.envelopeFps ?? fps;
    const idx = Math.min(
      line.envelope.length - 1,
      Math.max(0, Math.round((localFrame / fps) * envFps)),
    );
    return line.envelope[idx] ?? 0;
  }
  // 未预提取包络时，生成自然音节起伏近似值
  const t = localFrame / fps;
  return 0.35 + 0.55 * Math.abs(Math.sin(t * 7.8) * Math.cos(t * 3.3));
};

const ShotContainer: React.FC<{
  shot: StoryShotTiming;
  index: number;
  discovered: DiscoveredAssets;
  currentSpeaker: SpeakerId | null;
  speechEnergy: number;
  showShotHud: boolean;
  showAnimaticBadge: boolean;
}> = ({
  shot,
  index,
  discovered,
  currentSpeaker,
  speechEnergy,
  showShotHud,
  showAnimaticBadge,
}) => {
  const frame = useCurrentFrame();
  const tone = TONES[shot.tone] ?? TONES.glow;
  const mode = shot.mode ?? "auto";
  const transType = shot.transitionIn ?? "dissolve";
  const transFrames = Math.max(1, shot.transitionFrames ?? 6);

  const fadeIn =
    transType === "cut" || index === 0
      ? 1
      : interpolate(frame, [0, transFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const fadeOut =
    transType === "cut"
      ? 1
      : interpolate(
          frame,
          [
            Math.max(0, shot.durationInFrames - transFrames),
            shot.durationInFrames,
          ],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

  const resolvedClip: VideoClipSpec | null = useMemo(() => {
    if (mode === "layered-2d" || mode === "animatic") return null;
    if (shot.clip) {
      if (mode === "flow-clip" || discovered.allFiles.has(shot.clip.src)) {
        return shot.clip;
      }
      const fallbackAuto = discovered.clips.get(shot.id);
      return fallbackAuto ? { ...shot.clip, src: fallbackAuto } : null;
    }
    const autoClipSrc = discovered.clips.get(shot.id);
    return autoClipSrc ? { src: autoClipSrc } : null;
  }, [mode, shot.clip, shot.id, discovered.allFiles, discovered.clips]);

  const resolvedAnimatic: KeyframeAnimaticSpec | null = useMemo(() => {
    if (shot.animatic) return shot.animatic;
    const startSrc = discovered.startFrames.get(shot.id);
    if (!startSrc) return null;
    return {
      startSrc,
      endSrc: discovered.endFrames.get(shot.id),
    };
  }, [shot.animatic, shot.id, discovered.startFrames, discovered.endFrames]);

  const cam = computeCameraTransform(shot.cue, frame, shot.durationInFrames);
  const isSpeechActive = currentSpeaker !== null;

  let stageNode: React.ReactNode = null;
  if (resolvedClip) {
    stageNode = (
      <FlowClipStage
        shot={shot}
        clip={resolvedClip}
        isSpeechActive={isSpeechActive}
      />
    );
  } else if (
    (mode === "layered-2d" || mode === "auto") &&
    shot.layers &&
    shot.layers.length > 0
  ) {
    stageNode = (
      <Layered2DStage
        layers={shot.layers}
        cam={cam}
        currentSpeaker={currentSpeaker}
        speechEnergy={speechEnergy}
        celLineBoil={shot.celLineBoil}
      />
    );
  } else if (resolvedAnimatic) {
    stageNode = (
      <KeyframeAnimaticStage
        shot={shot}
        animatic={resolvedAnimatic}
        showBadge={showAnimaticBadge}
      />
    );
  }

  const dipOverlayOpacity =
    transType === "dip-to-black" || transType === "dip-to-warm"
      ? 1 - Math.min(fadeIn, fadeOut)
      : 0;

  return (
    <AbsoluteFill
      style={{
        background: tone.bg,
        opacity:
          transType === "dissolve" ? Math.min(fadeIn, fadeOut) : undefined,
        isolation: "isolate",
      }}
    >
      {stageNode}

      <WatercolorFxLayer fx={shot.fx} glowColor={tone.glow} />

      {/* 底部字幕柔化衬底渐变 */}
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

      {showShotHud ? (
        <div
          style={{
            position: "absolute",
            right: "4%",
            top: "4%",
            fontSize: 28,
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
      ) : null}

      <WatercolorPaperOverlay
        vignetteColor={tone.vignette}
        filterId={`paper-grain-${shot.id}`}
      />

      {dipOverlayOpacity > 0.001 ? (
        <AbsoluteFill
          style={{
            backgroundColor:
              transType === "dip-to-warm" ? tone.dipColor : "#080B0E",
            opacity: dipOverlayOpacity,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * 通用手绘水彩真动画时间轴播放器：
 * 原生支持 Google Flow 24fps 视频切片、首尾帧 Animatic 自动热替换、2D 骨骼/口型分层以及 BGM 自动闪避混音。
 */
export const StoryTimelinePlayer: React.FC<{
  config: StoryProjectConfig;
}> = ({ config }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = config.fps ?? DEFAULT_FLOW_FPS;

  const { timeline } = useMemo(
    () => buildStoryTimeline(config.shots, fps),
    [config.shots, fps],
  );

  const discovered = useDiscoveredStoryAssets(config.storySlug);

  const lineSpans = useMemo(() => {
    const items: Array<{ start: number; end: number; line: AudioLine }> = [];
    for (const shot of timeline) {
      for (const line of shot.lines) {
        const start = shot.fromFrame + Math.round(line.atSec * fps);
        const end = start + Math.max(1, Math.round(line.durSec * fps));
        items.push({ start, end, line });
      }
    }
    return items;
  }, [timeline, fps]);

  const activeLine = lineSpans.find(
    (item) => frame >= item.start && frame < item.end,
  );
  const currentSpeaker = activeLine ? activeLine.line.speaker : null;
  const speechEnergy = activeLine
    ? sampleLineEnvelope(activeLine.line, frame, activeLine.start, fps)
    : 0;

  const subtitleOpacity = activeLine
    ? interpolate(
        frame,
        [
          activeLine.start,
          activeLine.start + 4,
          Math.max(activeLine.start + 4, activeLine.end - 4),
          activeLine.end,
        ],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  // 计算 BGM 音量自动闪避包络（有人声前提前 6 帧平滑压低，结束后 8 帧恢复）
  const bgmSpec = config.soundscape?.bgm;
  const bgmVolume = useMemo(() => {
    if (!bgmSpec) return 0;
    const baseV = bgmSpec.volume ?? 0.26;
    const duckV = bgmSpec.duckVolume ?? 0.1;
    const margin = Math.round(0.25 * fps);
    const nearSpeech = lineSpans.some(
      (s) => frame >= s.start - margin && frame <= s.end + margin,
    );
    const rawV = nearSpeech ? duckV : baseV;

    const fadeInFrames = Math.max(1, Math.round((bgmSpec.fadeInSec ?? 1.2) * fps));
    const fadeOutFrames = Math.max(
      1,
      Math.round((bgmSpec.fadeOutSec ?? 1.8) * fps),
    );
    const inEnv = interpolate(frame, [0, fadeInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const outEnv = interpolate(
      frame,
      [Math.max(0, durationInFrames - fadeOutFrames), durationInFrames],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return Number((rawV * Math.min(inEnv, outEnv)).toFixed(4));
  }, [bgmSpec, frame, fps, lineSpans, durationInFrames]);

  const shotMap = useMemo(() => {
    const m = new Map<string, StoryShotTiming>();
    for (const s of timeline) m.set(s.id, s);
    return m;
  }, [timeline]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0E1418" }}>
      {timeline.map((shot, idx) => (
        <Sequence
          key={shot.id}
          from={shot.fromFrame}
          durationInFrames={shot.durationInFrames}
          name={`Shot ${shot.id} · ${shot.label}`}
        >
          <ShotContainer
            shot={shot}
            index={idx}
            discovered={discovered}
            currentSpeaker={currentSpeaker}
            speechEnergy={speechEnergy}
            showShotHud={config.showShotHud ?? false}
            showAnimaticBadge={config.showAnimaticBadge ?? false}
          />
        </Sequence>
      ))}

      {/* 主配音与对话轨（独立于画面转场，天然支持 J-Cut / L-Cut 不截音） */}
      {lineSpans.map((item) => (
        <Sequence
          key={item.line.id}
          from={item.start}
          durationInFrames={Math.max(1, item.end - item.start)}
          name={`Voice · ${item.line.id}`}
        >
          <Audio src={staticFile(item.line.file)} />
        </Sequence>
      ))}

      {/* 可选：带自动人声闪避 (Ducking) 的全局 BGM 配乐轨 */}
      {bgmSpec ? (
        <Audio src={staticFile(bgmSpec.src)} volume={bgmVolume} />
      ) : null}

      {/* 可选：精准帧级触发的动作拟音与环境音效轨 (Foley SFX) */}
      {(config.soundscape?.sfx ?? []).map((cue) => {
        const ownerShot = cue.shotId ? shotMap.get(cue.shotId) : undefined;
        const startFrame =
          (ownerShot ? ownerShot.fromFrame : 0) + Math.round(cue.atSec * fps);
        const durFrames = cue.durSec
          ? Math.max(1, Math.round(cue.durSec * fps))
          : undefined;
        return (
          <Sequence
            key={cue.id}
            from={Math.max(0, startFrame)}
            durationInFrames={durFrames}
            name={`SFX · ${cue.id}`}
          >
            <Audio src={staticFile(cue.src)} volume={cue.volume ?? 0.55} />
          </Sequence>
        );
      })}

      {activeLine ? (
        <AbsoluteFill style={{ opacity: subtitleOpacity, zIndex: 20 }}>
          <StorybookSubtitle
            text={activeLine.line.text}
            speaker={activeLine.line.speaker}
            speakers={config.speakers}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
