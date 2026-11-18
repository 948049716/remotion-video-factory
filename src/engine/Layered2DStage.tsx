import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  BlinkSpriteSpec,
  LayerSpec,
  PoseKeyframe,
  SpeakerId,
  VisemeSpriteSpec,
} from "./types";

const sampleKeyframes = (
  keyframes: PoseKeyframe[] | undefined,
  sec: number,
): {
  x: number;
  y: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  opacityMul: number;
} => {
  if (!keyframes || keyframes.length === 0) {
    return { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, opacityMul: 1 };
  }
  const sorted = [...keyframes].sort((a, b) => a.atSec - b.atSec);
  if (sec <= sorted[0].atSec) {
    const k = sorted[0];
    return {
      x: k.x ?? 0,
      y: k.y ?? 0,
      rotate: k.rotate ?? 0,
      scaleX: k.scaleX ?? 1,
      scaleY: k.scaleY ?? 1,
      opacityMul: k.opacity ?? 1,
    };
  }
  const last = sorted[sorted.length - 1];
  if (sec >= last.atSec) {
    return {
      x: last.x ?? 0,
      y: last.y ?? 0,
      rotate: last.rotate ?? 0,
      scaleX: last.scaleX ?? 1,
      scaleY: last.scaleY ?? 1,
      opacityMul: last.opacity ?? 1,
    };
  }

  let idx = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sec >= sorted[i].atSec && sec < sorted[i + 1].atSec) {
      idx = i;
      break;
    }
  }
  const a = sorted[idx];
  const b = sorted[idx + 1];
  const span = Math.max(0.001, b.atSec - a.atSec);
  const rawP = Math.min(1, Math.max(0, (sec - a.atSec) / span));
  const p = rawP * rawP * (3 - 2 * rawP);

  const lerp = (v1: number, v2: number) => v1 + (v2 - v1) * p;
  return {
    x: lerp(a.x ?? 0, b.x ?? 0),
    y: lerp(a.y ?? 0, b.y ?? 0),
    rotate: lerp(a.rotate ?? 0, b.rotate ?? 0),
    scaleX: lerp(a.scaleX ?? 1, b.scaleX ?? 1),
    scaleY: lerp(a.scaleY ?? 1, b.scaleY ?? 1),
    opacityMul: lerp(a.opacity ?? 1, b.opacity ?? 1),
  };
};

const selectBlinkSrc = (
  blink: BlinkSpriteSpec,
  sec: number,
  seedOffset: number,
): string => {
  const interval = Math.max(1.8, blink.intervalSec ?? 3.4);
  const local = (sec + seedOffset * 1.13) % interval;
  // 每次自然眨眼约持续 0.16s
  if (local > interval - 0.16) {
    const phase = interval - local;
    if (phase > 0.11 || phase < 0.04) {
      return blink.halfSrc ?? blink.closedSrc;
    }
    return blink.closedSrc;
  }
  return blink.openSrc;
};

const selectVisemeSrc = (
  visemes: VisemeSpriteSpec,
  isSpeaking: boolean,
  speechEnergy: number,
  sec: number,
): string => {
  if (!isSpeaking || speechEnergy < 0.08) {
    return visemes.closedSrc;
  }
  if (speechEnergy >= 0.58) {
    if (visemes.roundSrc && Math.sin(sec * 9.5) > 0.55) {
      return visemes.roundSrc;
    }
    return visemes.openSrc;
  }
  return visemes.halfSrc;
};

const computeJointTransform = (
  layer: LayerSpec,
  effectiveFrame: number,
  fps: number,
  currentSpeaker: SpeakerId | null,
  speechEnergy: number,
): { jointStyle: React.CSSProperties; opacity: number } => {
  const sec = effectiveFrame / fps;
  const t = sec + (layer.phase ?? 0);
  const spd = layer.speed ?? 1.0;
  const amp = layer.amplitude ?? 1.0;
  const motion = layer.motion ?? "static";

  const kf = sampleKeyframes(layer.keyframes, sec);
  let tx = kf.x;
  let ty = kf.y;
  let rot = kf.rotate;
  let sx = kf.scaleX;
  let sy = kf.scaleY;
  let extraOpacity = (layer.opacity ?? 1) * kf.opacityMul;

  const isSpeaking =
    Boolean(layer.activeSpeaker) && currentSpeaker === layer.activeSpeaker;
  const energyBoost = isSpeaking ? 0.55 + 0.85 * speechEnergy : 0;

  switch (motion) {
    case "breathe": {
      const b = Math.sin(t * 1.9 * spd);
      sy *= 1 + 0.008 * amp * b;
      ty += -2.5 * amp * b;
      break;
    }
    case "swing": {
      rot += Math.sin(t * 2.6 * spd) * (3.5 * amp);
      break;
    }
    case "sway": {
      rot +=
        (Math.sin(t * 1.4 * spd) * 0.7 + Math.sin(t * 2.3 * spd) * 0.3) *
        (2.2 * amp);
      tx += Math.sin(t * 1.4 * spd) * (2.5 * amp);
      break;
    }
    case "nod": {
      const factor = isSpeaking ? 2.0 : 0.75;
      rot += Math.sin(t * 2.4 * spd) * (1.5 * amp * factor);
      ty += Math.sin(t * 4.8 * spd) * (1.2 * amp * factor);
      break;
    }
    case "talk": {
      if (isSpeaking) {
        const cadence =
          Math.sin(t * 7.2 * spd) * 0.6 + Math.sin(t * 11.0 * spd) * 0.4;
        const drive = energyBoost > 0 ? energyBoost : Math.abs(cadence);
        rot += cadence * (1.6 * amp);
        ty += -drive * (2.4 * amp);
        sy *= 1 + 0.008 * amp * drive;
      } else {
        const idle = Math.sin(t * 1.6);
        ty += -1.1 * idle;
        rot += idle * 0.35;
      }
      break;
    }
    case "spin-y": {
      const angle = t * 1.75 * spd;
      const cosA = Math.cos(angle);
      const dir = cosA >= 0 ? 1 : -1;
      sx *= dir * Math.max(0.14, Math.abs(cosA));
      ty += Math.sin(angle * 2) * (-4.0 * amp);
      break;
    }
    case "rotate": {
      rot += (t * 45 * spd) % 360;
      break;
    }
    case "float": {
      ty += Math.sin(t * 1.7 * spd) * (6 * amp);
      tx += Math.cos(t * 1.1 * spd) * (4 * amp);
      rot += Math.sin(t * 1.3 * spd) * (2 * amp);
      break;
    }
    case "glow-pulse": {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.1 * spd);
      extraOpacity = (layer.opacity ?? 0.65) * (0.6 + 0.4 * pulse) * kf.opacityMul;
      sx *= 1 + 0.03 * amp * pulse;
      sy *= 1 + 0.03 * amp * pulse;
      break;
    }
    case "static":
    default:
      break;
  }

  const origin = layer.origin ?? [50, 50];

  return {
    opacity: extraOpacity,
    jointStyle: {
      transformOrigin: `${origin[0]}% ${origin[1]}%`,
      transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`,
    },
  };
};

const LayerNode: React.FC<{
  layer: LayerSpec;
  effectiveFrame: number;
  fps: number;
  currentSpeaker: SpeakerId | null;
  speechEnergy: number;
  seedIndex: number;
}> = ({
  layer,
  effectiveFrame,
  fps,
  currentSpeaker,
  speechEnergy,
  seedIndex,
}) => {
  const sec = effectiveFrame / fps;
  const isSpeaking =
    Boolean(layer.activeSpeaker) && currentSpeaker === layer.activeSpeaker;

  const { jointStyle, opacity } = computeJointTransform(
    layer,
    effectiveFrame,
    fps,
    currentSpeaker,
    speechEnergy,
  );

  let activeSrc = layer.src;
  if (layer.visemes) {
    activeSrc = selectVisemeSrc(layer.visemes, isSpeaking, speechEnergy, sec);
  } else if (layer.blink) {
    activeSrc = selectBlinkSrc(layer.blink, sec, seedIndex);
  }

  const sortedChildren = useMemo(
    () =>
      layer.children
        ? [...layer.children].sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1))
        : [],
    [layer.children],
  );

  return (
    <AbsoluteFill
      style={{
        ...jointStyle,
        opacity,
        mixBlendMode: layer.blendMode,
      }}
    >
      <Img
        src={staticFile(activeSrc)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {sortedChildren.map((child, cIdx) => (
        <LayerNode
          key={child.id}
          layer={child}
          effectiveFrame={effectiveFrame}
          fps={fps}
          currentSpeaker={currentSpeaker}
          speechEnergy={speechEnergy}
          seedIndex={seedIndex * 7 + cIdx + 1}
        />
      ))}
    </AbsoluteFill>
  );
};

export const Layered2DStage: React.FC<{
  layers: LayerSpec[];
  cam: { scale: number; x: number; y: number };
  currentSpeaker: SpeakerId | null;
  speechEnergy: number;
  celLineBoil?: boolean;
}> = ({ layers, cam, currentSpeaker, speechEnergy, celLineBoil = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 开启手绘一拍二 (12fps) 抽帧节奏时，局部关节采样按约 12fps 步进，赋予传统赛璐珞呼吸感
  const stepDivisor = celLineBoil ? Math.max(1, Math.round(fps / 12)) : 1;
  const effectiveFrame =
    stepDivisor > 1 ? Math.floor(frame / stepDivisor) * stepDivisor : frame;

  const sorted = useMemo(
    () => [...layers].sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1)),
    [layers],
  );

  const boilSeed = Math.floor(frame / Math.max(1, Math.round(fps / 10))) % 7;
  const filterId = `cel-line-boil-${boilSeed}`;

  return (
    <AbsoluteFill
      style={{
        isolation: "isolate",
        zIndex: 0,
        filter: celLineBoil ? `url(#${filterId})` : undefined,
      }}
    >
      {celLineBoil ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <defs>
            <filter id={filterId}>
              <feTurbulence
                type="turbulence"
                baseFrequency="0.025"
                numOctaves={2}
                seed={boilSeed + 1}
                result="turbulence"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale={interpolate(speechEnergy, [0, 1], [1.4, 2.2], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      ) : null}

      {sorted.map((layer, idx) => {
        const parallax = layer.parallax ?? 1.0;
        const camScale = 1 + (cam.scale - 1) * parallax;
        const camX = cam.x * parallax;
        const camY = cam.y * parallax;

        return (
          <AbsoluteFill
            key={layer.id}
            style={{
              zIndex: layer.zIndex ?? 1,
              transformOrigin: "50% 50%",
              transform: `translate(${camX.toFixed(2)}px, ${camY.toFixed(2)}px) scale(${camScale.toFixed(4)})`,
            }}
          >
            <LayerNode
              layer={layer}
              effectiveFrame={effectiveFrame}
              fps={fps}
              currentSpeaker={currentSpeaker}
              speechEnergy={speechEnergy}
              seedIndex={idx + 1}
            />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
