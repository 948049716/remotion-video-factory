import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  ChannelIntro,
  DEFAULT_BRAND,
  getIntroPreset,
} from "../../shared/ChannelIntro";
import { CLAMP, EASING_CURVES } from "../../shared/ChannelIntro/motion";
import type { ChannelIntroProps } from "../../shared/ChannelIntro";

/**
 * Demo composition: a stand-in "episode" with the ident layered on top.
 * This is the exact integration pattern any production video should copy —
 * the episode renders underneath from frame 0, the ident reveals it.
 */
const EpisodeBackdrop: React.FC<{ frame: number; introEnd: number }> = ({
  frame,
  introEnd,
}) => {
  const gridShift = (frame * 0.6) % 80;
  const reveal = interpolate(frame, [introEnd - 14, introEnd + 24], [1, 0], {
    ...CLAMP,
    easing: EASING_CURVES.expoOut,
  });
  const cardIn = interpolate(frame, [introEnd + 10, introEnd + 40], [0, 1], {
    ...CLAMP,
    easing: EASING_CURVES.expoOut,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1120", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(120,170,255,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(120,170,255,0.075) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `${gridShift}px ${gridShift * 0.5}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(40,80,160,0.28) 0%, rgba(10,17,32,0) 62%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 64,
          left: 88,
          fontFamily: "'SF Mono', Consolas, monospace",
          fontSize: 15,
          letterSpacing: "0.3em",
          color: "rgba(233,241,255,0.6)",
        }}
      >
        ● {DEFAULT_BRAND.displayName} <span style={{ opacity: 0.45 }}>/ EPISODE 001</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) translateY(${(1 - cardIn) * 42}px)`,
          opacity: cardIn,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            fontFamily: "'SF Mono', Consolas, monospace",
            fontSize: 17,
            letterSpacing: "0.42em",
            color: DEFAULT_BRAND.accent,
            marginBottom: 34,
          }}
        >
          CHAPTER 01 / OPTICS
        </div>
        <div
          style={{
            fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
            fontSize: 82,
            fontWeight: 800,
            color: "#F2F6FF",
            letterSpacing: "0.04em",
          }}
        >
          光，为什么会有颜色？
        </div>
        <div
          style={{
            marginTop: 30,
            width: 92,
            height: 3,
            backgroundColor: DEFAULT_BRAND.accent,
          }}
        />
        <div
          style={{
            marginTop: 30,
            fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
            fontSize: 24,
            letterSpacing: "0.2em",
            color: "rgba(233,241,255,0.62)",
          }}
        >
          从一束白光开始
        </div>
      </div>

      {/* The episode itself develops out of the ident's white flash. */}
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: reveal }} />
    </AbsoluteFill>
  );
};

export const NawaIdent: React.FC<ChannelIntroProps> = (props) => {
  const frame = useCurrentFrame();
  const preset = getIntroPreset(props.variant ?? "prism");
  const introEnd =
    (props.startFrame ?? 0) + (props.durationInFrames ?? preset.defaultDurationInFrames);

  return (
    <AbsoluteFill>
      <EpisodeBackdrop frame={frame} introEnd={introEnd} />
      <ChannelIntro {...props} />
    </AbsoluteFill>
  );
};
