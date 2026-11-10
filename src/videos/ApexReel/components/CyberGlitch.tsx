import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

/**
 * Keyframe transition cut-points (in frames) where visual punches trigger
 */
const CUT_FRAMES = [0, 240, 540, 840, 1140, 1230, 1320, 1410, 1500, 1680];

export const CyberGlitch: React.FC = () => {
  const frame = useCurrentFrame();

  // Find distance to the closest cut frame
  let minDiff = 999;
  for (const c of CUT_FRAMES) {
    const diff = frame - c;
    if (diff >= 0 && diff < minDiff) {
      minDiff = diff;
    }
  }

  // Flash opacity over 8 frames after a cut
  const flashOpacity = interpolate(minDiff, [0, 2, 7], [0.45, 0.25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // RGB chromatic split offset
  const rgbShift = interpolate(minDiff, [0, 2, 8], [8, 3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Camera punch shake
  const shakeX = Math.sin(frame * 2.8) * rgbShift * 0.8;
  const shakeY = Math.cos(frame * 3.4) * rgbShift * 0.6;

  return (
    <>
      {/* High-speed white cut flash */}
      {flashOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#FFFFFF",
            opacity: flashOpacity,
            mixBlendMode: "overlay",
            pointerEvents: "none",
            zIndex: 950,
          }}
        />
      )}

      {/* Subtle Scanlines and screen jitter */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${shakeX}px, ${shakeY}px)`,
          backgroundImage:
            "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%)",
          backgroundSize: "100% 4px",
          pointerEvents: "none",
          zIndex: 890,
          opacity: 0.35,
        }}
      />
    </>
  );
};
