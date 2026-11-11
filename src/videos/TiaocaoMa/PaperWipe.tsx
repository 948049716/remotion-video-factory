import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

import { PAPER_NOISE, tornClipPath } from "./paper";

export const PaperWipe: React.FC<{ seed?: number }> = ({ seed = 2.4 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.7, 0, 0.2, 1),
  });
  const translateX = interpolate(progress, [0, 1], ["0%", "-115%"]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#E8DCC3",
        clipPath: tornClipPath(seed),
        transform: `translateX(${translateX})`,
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: PAPER_NOISE,
          backgroundSize: "220px 220px",
          opacity: 0.08,
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};
