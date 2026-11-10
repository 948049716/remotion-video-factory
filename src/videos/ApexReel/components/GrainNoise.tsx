import React from "react";
import { useCurrentFrame } from "remotion";

export const GrainNoise: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();

  // Pseudo-random shifting of SVG turbulence seed per frame
  const seed = (frame % 10) * 17;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 895,
        opacity,
        mixBlendMode: "screen",
      }}
    >
      <svg width="100%" height="100%">
        <filter id="apex-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#apex-grain)" />
      </svg>
    </div>
  );
};
