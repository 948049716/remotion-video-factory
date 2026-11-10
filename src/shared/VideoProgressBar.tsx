import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export interface VideoProgressBarProps {
  /** Which frame edge the bar hugs. Defaults to "bottom". */
  position?: "top" | "bottom";
  /** Distance in px from the frame edge. */
  offset?: number;
  /** Bar thickness in px. */
  height?: number;
  /** Gradient stops, left to right. */
  colors?: string[];
  trackColor?: string;
  /** Soft glow around the fill and a bright playhead dot. */
  glow?: boolean;
  zIndex?: number;
  style?: React.CSSProperties;
}

export const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  position = "bottom",
  offset = 0,
  height = 6,
  colors = ["#7FE3FF", "#7C9CFF", "#FFB347"],
  trackColor = "rgba(4,8,16,0.55)",
  glow = true,
  zIndex = 120,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames - 1)));
  const tail = colors[colors.length - 1];

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height,
        backgroundColor: trackColor,
        overflow: "hidden",
        zIndex,
        pointerEvents: "none",
        ...(position === "top" ? { top: offset } : { bottom: offset }),
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${progress * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${colors.join(", ")})`,
          boxShadow: glow ? `0 0 ${height * 2.4}px ${tail}88` : undefined,
        }}
      >
        {glow ? (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              width: height * 1.7,
              height: height * 1.7,
              transform: "translate(50%, -50%)",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              boxShadow: `0 0 ${height * 3}px ${tail}`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
