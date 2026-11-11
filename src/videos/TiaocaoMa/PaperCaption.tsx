import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

import { PAPER_NOISE, SERIF, tornClipPath } from "./paper";
import type { RetimedVoiceSegment } from "./retimed-timeline";

const SPEAKER_COLORS: Record<string, string> = {
  旁白: "#6B4F2A",
  店小二: "#9A6B3F",
  刀疤脸: "#2E4A5A",
  赵大人: "#B83A2E",
  一品大员: "#1C1A17",
};

type PaperCaptionProps = {
  segment: RetimedVoiceSegment;
  index: number;
  placement?: "bottom" | "top";
  offsetY?: number;
};

export const PaperCaption: React.FC<PaperCaptionProps> = ({
  segment,
  index,
  placement = "bottom",
  offsetY = 0,
}) => {
  const frame = useCurrentFrame();
  const isTop = placement === "top";
  const fadeIn = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [segment.durationInFrames + 2, segment.durationInFrames + 10],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(fadeIn, fadeOut);
  const y = interpolate(frame, [0, 8], [isTop ? -20 : 20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vertical = isTop
    ? { top: 34 + offsetY }
    : { bottom: 28 + offsetY };
  const rotate = -0.35 + Math.sin(index * 1.7) * 0.18;
  const speakerColor = SPEAKER_COLORS[segment.speaker] ?? "#1C1A17";
  const fontSize = segment.text.length > 44 ? 26 : 29;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        ...vertical,
        transform: `translateX(-50%) translateY(${y}px) rotate(${rotate}deg)`,
        maxWidth: 1400,
        minWidth: 680,
        padding: "14px 36px 20px",
        backgroundColor: "#F2E7D3",
        color: "#1C1A17",
        fontFamily: SERIF,
        fontSize,
        lineHeight: 1.5,
        textAlign: "center",
        boxShadow:
          "0 12px 28px rgba(28,26,23,0.28), inset 0 0 0 1px rgba(28,26,23,0.12)",
        clipPath: tornClipPath(index + 1.3),
        opacity,
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 15,
          letterSpacing: "0.22em",
          color: speakerColor,
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        {segment.speaker}
      </div>
      <div>{segment.text}</div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: PAPER_NOISE,
          backgroundSize: "220px 220px",
          opacity: 0.05,
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
