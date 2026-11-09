import React from "react";
import {
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PALETTES, SPRING_CONFIGS } from "../../shared/motion-presets";
import { interFamily, notoFamily } from "./fonts";
import { KeywordGlyph } from "./icons";
import type { KeywordDef } from "./keywords";
import { secToFrame } from "./timing";

const kitchen = PALETTES.kepuKitchen;

/**
 * snappy peaks at about 1.0806. Reshape that overshoot so the badge
 * scale travels 0.6 → 1.05 → 1.0 (1.05 is spring value 1.125).
 */
const SNAPPY_PEAK = (() => {
  let peak = 1;
  for (let frame = 0; frame < 90; frame++) {
    peak = Math.max(
      peak,
      spring({ frame, fps: 60, config: SPRING_CONFIGS.snappy }),
    );
  }
  return peak;
})();

const OVERSHOOT_AT = 1.125;

const shapeSnappy = (value: number) => {
  if (value <= 1) {
    return value;
  }
  const gain = (OVERSHOOT_AT - 1) / Math.max(SNAPPY_PEAK - 1, 0.0001);
  return 1 + (value - 1) * gain;
};

const BadgeFace: React.FC<{
  keyword: KeywordDef;
  englishSize: number;
  tone: "ghost" | "solid";
  glow?: number;
}> = ({ keyword, englishSize, tone, glow = 0 }) => {
  const textColor = keyword.text === "ink" ? kitchen.ink : kitchen.canvas;
  const solid = tone === "solid";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: "12px 22px 12px 14px",
        borderRadius: 999,
        boxSizing: "border-box",
        backgroundColor: solid ? keyword.color : "transparent",
        borderWidth: 2,
        borderStyle: solid ? "solid" : "dashed",
        borderColor: keyword.color,
        color: solid ? textColor : keyword.color,
        boxShadow: solid
          ? `0 0 ${8 + glow * 42}px ${keyword.color}, 0 16px 30px ${kitchen.scrim}`
          : glow > 0
            ? `0 0 ${22 * glow}px ${keyword.color}`
            : undefined,
        whiteSpace: "nowrap",
      }}
    >
      <KeywordGlyph id={keyword.id} size={englishSize > 58 ? 48 : 42} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <div
          style={{
            fontFamily: interFamily,
            fontWeight: 600,
            fontSize: englishSize,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
          }}
        >
          {keyword.en}
        </div>
        <div
          style={{
            fontFamily: notoFamily,
            fontWeight: 500,
            fontSize: 26,
            lineHeight: 1.15,
            letterSpacing: "0.04em",
            opacity: solid ? 0.86 : 0.9,
          }}
        >
          {keyword.zh}
        </div>
      </div>
    </div>
  );
};

const PoppedBadge: React.FC<{
  keyword: KeywordDef;
  englishSize: number;
}> = ({ keyword, englishSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame,
    fps,
    config: SPRING_CONFIGS.snappy,
  });
  const scale = interpolate(shapeSnappy(progress), [0, 1], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "extend",
  });
  const opacity = interpolate(progress, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = interpolate(frame, [0, 6, 22], [0, 1, 0.16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        translate: "-50% -50%",
        scale,
        opacity,
      }}
    >
      <BadgeFace
        keyword={keyword}
        englishSize={englishSize}
        tone="solid"
        glow={glow}
      />
    </div>
  );
};

export const KeywordBadge: React.FC<{
  keyword: KeywordDef;
  englishSize: number;
}> = ({ keyword, englishSize }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const ghostIn = spring({
    frame: frame - secToFrame(0.28, fps),
    fps,
    config: SPRING_CONFIGS.smooth,
  });

  const popFrame =
    keyword.popAt === null ? null : secToFrame(keyword.popAt, fps);

  const pulse =
    keyword.pulseAt === null
      ? 0
      : interpolate(
          frame,
          [
            secToFrame(keyword.pulseAt - 0.08, fps),
            secToFrame(keyword.pulseAt, fps),
            secToFrame(keyword.pulseAt + 0.22, fps),
          ],
          [0, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

  const cover =
    popFrame === null
      ? 0
      : interpolate(frame, [popFrame, popFrame + Math.round(0.16 * fps)], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const ghostOpacity = ghostIn * (0.24 + pulse * 0.42) * (1 - cover);
  const ghostScale = 1 + pulse * 0.045;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ opacity: ghostOpacity, scale: ghostScale }}>
        <BadgeFace
          keyword={keyword}
          englishSize={englishSize}
          tone="ghost"
          glow={pulse}
        />
      </div>
      {popFrame !== null ? (
        <Sequence
          from={popFrame}
          durationInFrames={Math.max(1, durationInFrames - popFrame)}
          premountFor={fps}
          name={`${keyword.en} badge`}
          style={{ zIndex: 2 }}
          styleWhilePremounted={{ opacity: 0 }}
        >
          <PoppedBadge keyword={keyword} englishSize={englishSize} />
        </Sequence>
      ) : null}
    </div>
  );
};
