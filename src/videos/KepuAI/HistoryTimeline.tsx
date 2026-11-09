import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASING_CURVES, PALETTES } from "../../shared/motion-presets";

const kitchen = PALETTES.kepuKitchen;

const TICKS = [150, 250, 360, 490, 620, 760, 870, 960];

/**
 * Unlabeled dashed ruler. It only suggests a long history — no years yet.
 */
export const HistoryTimeline: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [8, 86], [0, 1], {
    easing: EASING_CURVES.expoOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <svg
      width={1080}
      height={140}
      viewBox="0 0 1080 140"
      style={{
        display: "block",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <clipPath id="kepu-timeline-draw">
        <rect x={90} y={0} width={900 * draw} height={140} />
      </clipPath>
      <g clipPath="url(#kepu-timeline-draw)" opacity={0.2 + 0.8 * draw}>
        <line
          x1={90}
          y1={70}
          x2={990}
          y2={70}
          stroke={kitchen.timeline}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="10 16"
          opacity={0.5}
        />
        {TICKS.map((x, index) => {
          const height = index % 3 === 0 ? 18 : 10;
          return (
            <line
              key={x}
              x1={x}
              x2={x}
              y1={70 - height / 2}
              y2={70 + height / 2}
              stroke={kitchen.timeline}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.38}
            />
          );
        })}
      </g>
    </svg>
  );
};
