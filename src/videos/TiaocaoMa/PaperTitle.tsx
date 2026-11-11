import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { SPRING_CONFIGS } from "../../shared/motion-presets";
import { PAPER_NOISE, SERIF, tornClipPath } from "./paper";

export const PaperTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const open = spring({
    frame,
    fps,
    config: SPRING_CONFIGS.smooth,
    durationInFrames: 28,
  });
  const titleOpacity = interpolate(
    frame,
    [0, 8, 104, 124],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const seal = spring({
    frame: Math.max(0, frame - 48),
    fps,
    config: SPRING_CONFIGS.elastic,
    durationInFrames: 30,
  });
  const exit = interpolate(frame, [108, 128], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(open, [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1C1A17",
        opacity: 1 - exit,
        zIndex: 100,
        fontFamily: SERIF,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: PAPER_NOISE,
          backgroundSize: "220px 220px",
          opacity: 0.12,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#E8DCC3",
          clipPath: tornClipPath(1.7),
          transform: `scale(${scale})`,
          opacity: titleOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "10%",
          right: "10%",
          bottom: "8%",
          backgroundColor: "#F2E7D3",
          clipPath: tornClipPath(3.2),
          transform: `scale(${scale}) rotate(-0.6deg)`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          opacity: titleOpacity,
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
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.4em",
            color: "#6B4F2A",
            marginBottom: 18,
          }}
        >
          纸艺动画
        </div>
        <div
          style={{
            fontSize: 190,
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "#1C1A17",
            lineHeight: 1,
            textShadow: "6px 8px 0 rgba(184,58,46,0.18)",
          }}
        >
          跳槽马
        </div>
        <div
          style={{
            fontSize: 30,
            letterSpacing: "0.18em",
            color: "#2E4A5A",
            marginTop: 26,
          }}
        >
          根据同名民间故事改编
        </div>
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            marginTop: 34,
          }}
        >
          <span
            style={{ width: 60, height: 2, backgroundColor: "#9A6B3F" }}
          />
          <span
            style={{
              fontSize: 20,
              letterSpacing: "0.28em",
              color: "#6B4F2A",
            }}
          >
            人不如马 · 马不如人
          </span>
          <span
            style={{ width: 60, height: 2, backgroundColor: "#9A6B3F" }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: "14%",
          bottom: "18%",
          width: 150,
          height: 150,
          border: "6px solid #B83A2E",
          color: "#B83A2E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(-7deg) scale(${seal})`,
          opacity: seal,
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: "0.08em",
          lineHeight: 1.1,
          textAlign: "center",
          padding: 10,
        }}
      >
        民间
        <br />
        故事
      </div>
    </AbsoluteFill>
  );
};
