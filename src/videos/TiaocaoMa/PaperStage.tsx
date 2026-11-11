import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

import { ASSET_FILES } from "./asset-files";
import { FALLBACK_ASSET_FILES } from "./asset-fallbacks";
import type { CameraMove } from "./choreography";
import { PAPER_NOISE, SERIF, tornClipPath } from "./paper";
import type { SceneDef } from "./scene-bible";
import type { ShotMeta } from "./shot-meta";

type PaperStageProps = {
  meta: ShotMeta;
  durationInFrames: number;
  camera: CameraMove;
  easing: "linear" | "smooth" | "whip";
  scene: SceneDef;
};

export const PaperStage: React.FC<PaperStageProps> = ({
  meta,
  durationInFrames,
  camera,
  easing,
  scene,
}) => {
  const frame = useCurrentFrame();
  const bgKey = scene.background;
  const bgFile = bgKey
    ? ASSET_FILES[bgKey] ?? FALLBACK_ASSET_FILES[bgKey]
    : undefined;
  const isDiagram = scene.key === "diagram";

  const easingFn =
    easing === "smooth"
      ? Easing.bezier(0.16, 1, 0.3, 1)
      : easing === "whip"
        ? Easing.bezier(0.7, 0, 0.2, 1)
        : Easing.linear;
  const progress = interpolate(
    frame,
    [0, Math.max(1, durationInFrames - 1)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easingFn,
    },
  );
  const scale = interpolate(
    progress,
    [0, 1],
    [camera.startScale, camera.endScale],
  );
  const offsetX = interpolate(
    progress,
    [0, 1],
    [camera.startX, camera.endX],
  );
  const offsetY = interpolate(
    progress,
    [0, 1],
    [camera.startY, camera.endY],
  );
  const shakeX = camera.shake
    ? Math.sin(frame * 1.9) * camera.shake * (1 - progress)
    : 0;
  const shakeY = camera.shake
    ? Math.cos(frame * 2.3) * camera.shake * 0.6 * (1 - progress)
    : 0;
  const stageTransform = `translate(${offsetX + shakeX}px, ${offsetY + shakeY}px) scale(${scale}) rotate(${camera.rotate}deg)`;

  const objectPosition = scene.objectPosition;
  const isNight = scene.key === "stableNight";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#E8DCC3",
        overflow: "hidden",
        fontFamily: SERIF,
      }}
    >
      {bgFile ? (
        <Img
          src={staticFile(bgFile)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition,
            transform: stageTransform,
            filter: isNight
              ? "brightness(0.55) saturate(0.7) hue-rotate(-8deg)"
              : "none",
          }}
        />
      ) : (
        <AbsoluteFill style={{ backgroundColor: "#E8DCC3" }}>
          <AbsoluteFill style={{ transform: stageTransform }}>
          <div
            style={{
              position: "absolute",
              top: "6%",
              left: "8%",
              right: "8%",
              bottom: "8%",
              backgroundColor: "#D9C9AC",
              clipPath: tornClipPath(2.1),
              transform: "rotate(-0.4deg)",
              boxShadow: "0 24px 60px rgba(28,26,23,0.22)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "12%",
              right: "12%",
              bottom: "14%",
              backgroundColor: "#EADDC5",
              clipPath: tornClipPath(4.3),
              transform: "rotate(0.3deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#1C1A17",
              opacity: isDiagram ? 0.06 : 0.16,
            }}
          >
            <div
              style={{
                fontSize: 20,
                letterSpacing: "0.24em",
                marginBottom: 12,
              }}
            >
              {meta.act.toUpperCase()}
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {meta.location}
            </div>
            <div
              style={{
                fontSize: 20,
                marginTop: 14,
                letterSpacing: "0.14em",
              }}
            >
              {meta.framing}
            </div>
          </div>
          </AbsoluteFill>
          {!isDiagram ? (
            <div
              style={{
                position: "absolute",
                top: 26,
                right: 30,
                padding: "6px 12px",
                border: "1px solid rgba(28,26,23,0.2)",
                fontSize: 14,
                letterSpacing: "0.08em",
                color: "#1C1A17",
                opacity: 0.45,
              }}
            >
              素材待生成 · {bgKey ?? "bg"}
            </div>
          ) : null}
        </AbsoluteFill>
      )}

      <AbsoluteFill
        style={{
          backgroundImage: PAPER_NOISE,
          backgroundSize: "220px 220px",
          opacity: 0.07,
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 220px rgba(28,26,23,0.32)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 16,
          backgroundColor: "#D8C9AC",
          clipPath: tornClipPath(1.2),
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 18,
          height: 56,
          background:
            "linear-gradient(to top, rgba(28,26,23,0.20), rgba(28,26,23,0))",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 30,
          backgroundColor: "#D8C9AC",
          clipPath: tornClipPath(3.7),
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
};
