import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";

import { ASSET_FILES } from "./asset-files";
import {
  CHARACTER_LABELS,
  FALLBACK_ASSET_FILES,
} from "./asset-fallbacks";
import type { PuppetGesture } from "./choreography";
import { SERIF } from "./paper";

type PuppetVariant =
  | "human"
  | "official"
  | "waiter"
  | "oneArm"
  | "child"
  | "horse"
  | "riding"
  | "crowd"
  | "horseCrowd";

type PaperPuppetProps = {
  assetKey: string;
  side?: "left" | "center" | "right";
  leftPercent?: number;
  scale?: number;
  speaking?: boolean;
  variant?: PuppetVariant;
  gesture?: PuppetGesture;
  gestureProgress?: number;
  enterProgress?: number;
  exitProgress?: number;
  enterFrom?: "left" | "right" | "bottom" | "none";
  flipX?: boolean;
};

const HUMAN_VIEWBOX = "0 0 220 560";
const HORSE_VIEWBOX = "0 0 360 260";

const CHARACTER_SIZE: Record<string, { width: number; height: string }> = {
  "char.er": { width: 32, height: "62%" },
  "char.scarface": { width: 32, height: "64%" },
  "char.scarface.riding": { width: 54, height: "42%" },
  "char.zhao": { width: 34, height: "66%" },
  "char.yipin": { width: 34, height: "66%" },
  "char.official.guest": { width: 33, height: "64%" },
  "char.general.one-arm": { width: 30, height: "56%" },
  "char.general.young": { width: 32, height: "64%" },
  "char.attendant": { width: 30, height: "62%" },
  "char.guard": { width: 32, height: "64%" },
  "char.child": { width: 24, height: "46%" },
  "char.crowd": { width: 88, height: "34%" },
  "char.horse.crowd": { width: 88, height: "38%" },
  "char.horse.lame": { width: 40, height: "40%" },
  "char.horse.thin": { width: 38, height: "38%" },
  "char.horse.war": { width: 42, height: "42%" },
  "char.horse.war.wounded": { width: 42, height: "42%" },
  "char.horse.zhao": { width: 40, height: "40%" },
};

const HumanSilhouette: React.FC<{
  variant: Exclude<PuppetVariant, "horse" | "riding">;
  label: string;
}> = ({ variant, label }) => {
  const isOfficial = variant === "official";
  const isWaiter = variant === "waiter";
  const isOneArm = variant === "oneArm";

  return (
    <svg
      viewBox={HUMAN_VIEWBOX}
      style={{
        width: "100%",
        height: "100%",
        overflow: "visible",
        position: "relative",
        zIndex: 1,
      }}
    >
      <g
        fill="#1C1A17"
        opacity={0.86}
        stroke="#E8DCC3"
        strokeWidth={2.5}
        strokeLinejoin="round"
      >
        <circle cx="110" cy="62" r="36" />
        <rect x="98" y="94" width="24" height="22" />
        <path d="M62 116 Q110 96 158 116 L172 300 L148 312 L142 470 L116 470 L110 330 L104 470 L78 470 L72 312 L48 300 Z" />
        {!isOneArm && <path d="M62 124 L38 300 L58 306 L84 160 Z" />}
        <path d="M158 124 L182 300 L162 306 L136 160 Z" />
        {isOneArm && (
          <path d="M158 124 L168 250 L150 300 L138 292 L146 200 Z" />
        )}
        {isOfficial && (
          <>
            <path d="M58 30 L162 30 L150 6 L70 6 Z" />
            <rect x="52" y="28" width="116" height="8" />
          </>
        )}
        {isWaiter && (
          <path d="M78 32 Q110 4 142 32 L136 40 L84 40 Z" />
        )}
        {isWaiter && (
          <path
            d="M80 210 L140 210 L134 430 L86 430 Z"
            fill="#E8DCC3"
            opacity={0.45}
            stroke="none"
          />
        )}
      </g>
      <g>
        <rect
          x="10"
          y="518"
          width="200"
          height="30"
          rx="4"
          fill="#1C1A17"
          opacity={0.8}
        />
        <text
          x="110"
          y="539"
          textAnchor="middle"
          fill="#E8DCC3"
          fontSize="16"
          fontFamily={SERIF}
        >
          {label}
        </text>
      </g>
    </svg>
  );
};

const HorseSilhouette: React.FC<{ label: string; thin?: boolean }> = ({
  label,
  thin,
}) => (
  <svg
    viewBox={HORSE_VIEWBOX}
    style={{ width: "100%", height: "100%", overflow: "visible" }}
  >
    <g
      fill="#1C1A17"
      opacity={0.86}
      stroke="#E8DCC3"
      strokeWidth={2.5}
      strokeLinejoin="round"
    >
      <path d="M62 120 Q92 84 142 84 L214 84 Q250 84 268 116 L300 132 L318 120 L330 142 L304 158 L288 196 L268 196 L258 156 L130 156 L118 196 L98 196 L104 150 L72 150 L54 188 L36 180 Z" />
      <path d="M112 156 L104 230 L120 230 L130 156 Z" />
      <path d="M242 156 L250 230 L266 230 L256 156 Z" />
      <path d="M70 120 L58 88 L74 84 L86 112 Z" />
      <path d="M300 132 C330 140 342 170 334 198 L318 192 C326 172 318 152 292 146 Z" />
      {thin && (
        <path
          d="M150 150 L150 178 M170 148 L170 176 M190 148 L190 176"
          stroke="#E8DCC3"
          strokeWidth={3}
          opacity={0.45}
        />
      )}
    </g>
    <g>
      <rect
        x="80"
        y="228"
        width="200"
        height="28"
        rx="4"
        fill="#1C1A17"
        opacity={0.8}
      />
      <text
        x="180"
        y="248"
        textAnchor="middle"
        fill="#E8DCC3"
        fontSize="16"
        fontFamily={SERIF}
      >
        {label}
      </text>
    </g>
  </svg>
);

export const PaperPuppet: React.FC<PaperPuppetProps> = ({
  assetKey,
  side = "center",
  leftPercent,
  scale = 1,
  speaking = false,
  variant = "human",
  gesture,
  gestureProgress = 0,
  enterProgress = 1,
  exitProgress = 0,
  enterFrom = "none",
  flipX = false,
}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);
  const bob = Math.sin(step * 0.18) * 5;
  const sway = Math.sin(step * 0.11) * 0.7;
  const jitter = Math.sin(step * 0.7) * 1.2;
  const breath = 1 + Math.sin(step * 0.09) * 0.006;
  const nod = speaking ? Math.sin(step * 0.9) * 1.1 : 0;

  const gestureValue = Math.min(1, Math.max(0, gestureProgress));
  const effectiveGesture =
    assetKey === "char.general.one-arm" && gesture === "kneel"
      ? "idle"
      : gesture;
  let gestureX = 0;
  let gestureY = 0;
  let gestureRotate = 0;
  let gestureScaleY = 1;
  switch (effectiveGesture) {
    case "bow":
      gestureRotate = Math.sin(gestureValue * Math.PI) * 9;
      gestureY = Math.sin(gestureValue * Math.PI) * 10;
      break;
    case "point":
      gestureRotate = Math.sin(gestureValue * Math.PI) * -5;
      gestureX = Math.sin(gestureValue * Math.PI) * -8;
      break;
    case "kneel":
      gestureY = gestureValue * 90 + Math.sin(step * 1.1) * 8;
      gestureScaleY = 1 - gestureValue * 0.3;
      gestureRotate = Math.sin(step * 0.9) * 1.2;
      break;
    case "sleeve":
      gestureRotate = Math.sin(gestureValue * Math.PI * 4) * 2.5;
      break;
    case "limp":
      gestureY = Math.abs(Math.sin(step * 0.22)) * 7;
      gestureRotate = Math.sin(step * 0.22) * 1.4;
      break;
    case "rear":
      gestureRotate = -8 * Math.sin(gestureValue * Math.PI);
      gestureY = -18 * Math.sin(gestureValue * Math.PI);
      break;
    case "tremble":
      gestureX = Math.sin(step * 2.1) * 3 * (1 - gestureValue);
      break;
    default:
      break;
  }

  const enter = Math.min(1, Math.max(0, enterProgress));
  const exit = Math.min(1, Math.max(0, exitProgress));
  const enterX =
    enter < 1
      ? (enterFrom === "right" ? 700 : enterFrom === "left" ? -700 : 0) *
        (1 - enter)
      : 0;
  const enterY =
    enter < 1 && enterFrom === "bottom" ? 320 * (1 - enter) : 0;
  const exitX = exit * -700;
  const opacity = Math.max(0, Math.min(enter, 1 - exit));

  const file =
    ASSET_FILES[assetKey] ?? FALLBACK_ASSET_FILES[assetKey];
  const label = CHARACTER_LABELS[assetKey] ?? assetKey;
  const isHorse = variant === "horse";
  const isRiding = variant === "riding";
  const isCrowd = variant === "crowd";
  const isHorseCrowd = variant === "horseCrowd";
  const sizeOverride = CHARACTER_SIZE[assetKey];
  const widthPercent =
    sizeOverride?.width ??
    (isCrowd ? 88 : isHorseCrowd ? 88 : isRiding ? 54 : isHorse ? 40 : 32);
  const height =
    sizeOverride?.height ??
    (isCrowd
      ? "34%"
      : isHorseCrowd
        ? "38%"
        : isRiding
          ? "42%"
          : isHorse
            ? "40%"
            : "64%");
  const bottom = isCrowd || isHorseCrowd ? 190 : 150;
  const silhouetteVariant =
    variant === "horse" || variant === "riding" || variant === "horseCrowd"
      ? "human"
      : variant === "crowd"
        ? "human"
        : variant;

  let horizontal: React.CSSProperties = {};
  if (leftPercent !== undefined) {
    horizontal = { left: `${leftPercent - widthPercent / 2}%` };
  } else if (side === "left") {
    horizontal = { left: "8%" };
  } else if (side === "right") {
    horizontal = { right: "6%" };
  } else {
    horizontal = { left: `${50 - widthPercent / 2}%` };
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom,
        width: `${widthPercent}%`,
        height,
        ...horizontal,
        transform: `translate(${enterX + exitX + gestureX + jitter}px, ${enterY + bob + gestureY}px) rotate(${sway + nod + gestureRotate}deg) scale(${breath * scale}) scaleY(${gestureScaleY}) scaleX(${flipX ? -1 : 1})`,
        transformOrigin: "50% 100%",
        filter: "drop-shadow(0 18px 24px rgba(28,26,23,0.35))",
        opacity,
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -6,
          width: isHorse || isRiding || isHorseCrowd ? "92%" : "74%",
          height: 22,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(28,26,23,0.38), rgba(28,26,23,0) 70%)",
          filter: "blur(2px)",
          opacity: 0.55,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {file ? (
        <Img
          src={staticFile(file)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "bottom center",
            position: "relative",
            zIndex: 1,
          }}
        />
      ) : isHorse || isHorseCrowd ? (
        <HorseSilhouette label={label} thin={assetKey.includes("thin")} />
      ) : (
        <HumanSilhouette variant={silhouetteVariant} label={label} />
      )}
    </div>
  );
};
