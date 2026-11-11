import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";

import type { PuppetGesture } from "./choreography";
import { POSE_FILES } from "./pose-files";

type PaperPoseProps = {
  assetKey: string;
  side?: "left" | "center" | "right";
  leftPercent?: number;
  scale?: number;
  speaking?: boolean;
  gesture?: PuppetGesture;
  gestureProgress?: number;
  enterProgress?: number;
  exitProgress?: number;
  enterFrom?: "left" | "right" | "bottom" | "none";
  flipX?: boolean;
};

/** 角色素材 → 姿态集前缀。 */
export const POSE_PREFIX: Record<string, string> = {
  "char.er": "er",
  "char.scarface": "scarface",
  "char.zhao": "zhao",
  "char.yipin": "yipin",
  "char.general.one-arm": "general",
  "char.general.young": "young-general",
  "char.horse.lame": "horse",
  "char.scarface.riding": "riding",
};

/** 角色在画面中的目标身高（占 1080 高度的百分比），与 PaperPuppet 对齐。 */
const TARGET_HEIGHT: Record<string, number> = {
  "char.er": 62,
  "char.scarface": 64,
  "char.zhao": 66,
  "char.yipin": 66,
  "char.general.one-arm": 56,
  "char.general.young": 64,
  "char.horse.lame": 40,
  "char.scarface.riding": 42,
};

/** 姿态画布宽高比；未列出的按 4:3。 */
const POSE_ASPECT: Record<string, number> = {
  riding: 16 / 9,
};

const DEFAULT_CHAIN: Record<PuppetGesture, string[]> = {
  idle: ["idle", "speak"],
  speak: ["speak", "idle"],
  bow: ["bow", "speak", "idle"],
  point: ["point", "speak", "idle"],
  kneel: ["kneel", "tremble", "idle"],
  kowtow: ["kowtow", "kneel", "tremble", "idle"],
  sleeve: ["sleeve", "speak", "idle"],
  limp: ["limp", "idle"],
  rear: ["rear", "idle"],
  tremble: ["tremble", "kneel", "idle"],
};

const POSE_CHAIN: Record<
  string,
  Partial<Record<PuppetGesture, string[]>>
> = {
  er: {
    kneel: ["kneel", "tremble", "idle"],
    kowtow: ["kowtow", "kneel", "tremble", "idle"],
    sleeve: ["speak", "idle"],
  },
  scarface: {
    tremble: ["kneel", "idle"],
    limp: ["idle"],
    rear: ["idle"],
  },
  zhao: {
    kneel: ["bow", "idle"],
    tremble: ["idle"],
    limp: ["idle"],
    rear: ["idle"],
  },
  yipin: {
    kneel: ["bow", "idle"],
    bow: ["speak", "idle"],
    tremble: ["cold", "idle"],
    sleeve: ["turn", "idle"],
    limp: ["idle"],
    rear: ["idle"],
  },
  general: {
    idle: ["kneel-front"],
    speak: ["speak", "kneel-front"],
    bow: ["bow", "kneel-front"],
    point: ["speak", "kneel-front"],
    sleeve: ["speak", "kneel-front"],
    kneel: ["kneel-front", "kneel-side"],
    tremble: ["kneel-front"],
    limp: ["kneel-front"],
    rear: ["kneel-front"],
  },
  "young-general": {
    idle: ["charge", "idle"],
    speak: ["charge", "idle"],
    point: ["charge", "idle"],
    sleeve: ["charge", "idle"],
    bow: ["charge", "idle"],
    kneel: ["wounded", "idle"],
    tremble: ["wounded", "idle"],
    limp: ["wounded", "idle"],
    rear: ["wounded", "idle"],
  },
  horse: {
    speak: ["idle"],
    bow: ["idle"],
    point: ["idle"],
    sleeve: ["idle"],
    kneel: ["refuse", "idle"],
    tremble: ["refuse", "limp", "idle"],
    rear: ["refuse", "idle"],
  },
  riding: {
    speak: ["idle"],
    bow: ["idle"],
    point: ["idle"],
    sleeve: ["idle"],
    kneel: ["stop", "idle"],
    tremble: ["stop", "idle"],
    rear: ["stop", "idle"],
  },
};

/** 生成器会把角色撑到接近画布高度，跪/伏姿态需要按真实比例缩回。 */
const POSE_SCALE: Record<string, Record<string, number>> = {
  er: { kneel: 0.72, kowtow: 0.62, tremble: 0.72 },
  scarface: { kneel: 0.72 },
  general: {
    "kneel-front": 0.72,
    "kneel-side": 0.72,
    "court-kneel-front": 0.84,
    "court-kneel-side": 0.84,
    "court-speak": 0.84,
    "court-bow": 0.7,
    speak: 0.72,
    bow: 0.6,
  },
  "young-general": { wounded: 0.62 },
};

type ResolvedPose = { pose: string; file: string };

const resolvePose = (
  assetKey: string,
  gesture: PuppetGesture,
  speaking: boolean,
): ResolvedPose | null => {
  const prefix = POSE_PREFIX[assetKey];
  if (!prefix) return null;
  const set = POSE_FILES[prefix];
  if (!set) return null;

  const effectiveGesture =
    gesture === "speak" && !speaking && prefix !== "young-general"
      ? "idle"
      : gesture === "idle" &&
          speaking &&
          prefix !== "horse" &&
          prefix !== "riding"
        ? "speak"
        : gesture;
  const chain =
    POSE_CHAIN[prefix]?.[effectiveGesture] ??
    DEFAULT_CHAIN[effectiveGesture] ??
    ["idle"];

  for (const pose of chain) {
    if (set[pose]) return { pose, file: set[pose] };
  }
  const fallbackPose = set.idle ? "idle" : Object.keys(set)[0];
  return fallbackPose
    ? { pose: fallbackPose, file: set[fallbackPose] }
    : null;
};

export const hasPaperPose = (assetKey: string): boolean => {
  const prefix = POSE_PREFIX[assetKey];
  return Boolean(prefix && POSE_FILES[prefix]);
};

export const PaperPose: React.FC<PaperPoseProps> = ({
  assetKey,
  side = "center",
  leftPercent,
  scale = 1,
  speaking = false,
  gesture = "idle",
  gestureProgress = 0,
  enterProgress = 1,
  exitProgress = 0,
  enterFrom = "none",
  flipX = false,
}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);

  const prefix = POSE_PREFIX[assetKey];
  const resolved = resolvePose(assetKey, gesture, speaking);
  if (!resolved || !prefix) return null;

  // 骑乘镜头按 4 帧循环在站立/瘸行之间切换，避免人马整张图平移。
  const rideGait =
    prefix === "riding" &&
    (gesture === "idle" || gesture === "speak") &&
    Math.floor(frame / 4) % 2 === 1
      ? POSE_FILES.riding?.limp
      : undefined;
  let poseName = resolved.pose;
  let file = resolved.file;
  if (rideGait) {
    poseName = "limp";
    file = rideGait;
  } else if (
    resolved.pose === "kowtow" &&
    prefix === "er" &&
    Math.floor(frame / 6) % 2 === 1
  ) {
    // 磕头：伏地 6 帧、起身 6 帧，形成连续的“鸡啄米”。
    const kneelFile = POSE_FILES.er?.kneel;
    if (kneelFile) {
      poseName = "kneel";
      file = kneelFile;
    }
  }
  const poseScale = POSE_SCALE[prefix]?.[poseName] ?? 1;

  // 姿态图画布统一为“人物居中、脚底 85%”，按角色目标身高反推容器。
  const targetHeight = TARGET_HEIGHT[assetKey] ?? 62;
  const heightPercent = targetHeight / 0.7;
  const aspect = POSE_ASPECT[prefix] ?? 4 / 3;
  const widthPercent = heightPercent * 0.5625 * aspect;
  const heightPx = (heightPercent / 100) * 1080;
  const bottom = 150 - 0.15 * heightPx;

  let left: number;
  if (leftPercent !== undefined) {
    left = leftPercent - widthPercent / 2;
  } else if (side === "left") {
    left = 25 - widthPercent / 2;
  } else if (side === "right") {
    left = 75 - widthPercent / 2;
  } else {
    left = 50 - widthPercent / 2;
  }

  const enter = Math.min(1, Math.max(0, enterProgress));
  const exit = Math.min(1, Math.max(0, exitProgress));
  const enterX =
    enter < 1
      ? (enterFrom === "right" ? 900 : enterFrom === "left" ? -900 : 0) *
        (1 - enter)
      : 0;
  const enterY =
    enter < 1 && enterFrom === "bottom" ? 360 * (1 - enter) : 0;
  const exitX = exit * -900;
  const opacity = Math.max(0, Math.min(enter, 1 - exit));

  // on twos：每 2 帧换一次轻微纸片位移，保留剪纸定格感。
  const boilX = Math.sin(step * 2.7) * 1.1;
  const boilY = Math.sin(step * 1.9) * 1.3;
  const boilRotate = Math.sin(step * 1.3) * 0.3;
  const breath = 1 + Math.sin(step * 0.12) * 0.004;
  const talkPulse =
    speaking && gesture === "speak"
      ? 1 + Math.sin(step * 2.4) * 0.006
      : 1;
  const gestureX = gesture === "tremble" ? Math.sin(step * 3.1) * 3 : 0;
  const gestureY = gesture === "tremble" ? Math.cos(step * 2.7) * 1.5 : 0;
  const gestureRotate =
    gesture === "sleeve"
      ? Math.sin(step * 1.7) * 0.8
      : gesture === "tremble"
        ? Math.sin(step * 2.3) * 0.6
        : 0;

  const isKneeling =
    gesture === "kneel" ||
    gesture === "kowtow" ||
    gesture === "tremble" ||
    prefix === "general";
  const shadowWidth =
    prefix === "horse"
      ? "42%"
      : prefix === "riding"
        ? "46%"
        : isKneeling
          ? "36%"
          : "27%";

  return (
    <div
      style={{
        position: "absolute",
        bottom,
        left: `${left}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        transform: `translate(${enterX + exitX + boilX + gestureX}px, ${enterY + boilY + gestureY}px) rotate(${boilRotate + gestureRotate}deg) scale(${scale * breath * talkPulse}) scaleX(${flipX ? -1 : 1})`,
        transformOrigin: "50% 100%",
        filter: "drop-shadow(0 18px 24px rgba(28,26,23,0.32))",
        opacity,
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "calc(15% - 10px)",
          width: shadowWidth,
          height: 20,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(28,26,23,0.38), rgba(28,26,23,0) 70%)",
          filter: "blur(2px)",
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Img
        src={staticFile(file)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          position: "relative",
          zIndex: 1,
          transform: `scale(${poseScale})`,
          transformOrigin: "50% 85%",
        }}
      />
    </div>
  );
};
