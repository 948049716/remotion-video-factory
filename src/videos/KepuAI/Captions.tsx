import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PALETTES } from "../../shared/motion-presets";
import { interFamily, notoFamily } from "./fonts";
import { SPOKEN_AT, secToFrame } from "./timing";

const kitchen = PALETTES.kepuKitchen;

type Part = {
  text: string;
  highlight?: boolean;
  /** Extra delay inside the cue, in seconds. */
  at?: number;
};

type Cue = {
  from: number;
  to: number;
  parts: readonly Part[];
};

const CUES: readonly Cue[] = [
  {
    from: 0.18,
    to: 1.16,
    parts: [{ text: "最近刷短视频、" }],
  },
  {
    from: 1.14,
    to: 2.66,
    parts: [{ text: "看开源代码、" }],
  },
  {
    from: 2.68,
    to: 4.26,
    parts: [
      { text: "用各种" },
      { text: "AI", highlight: true, at: 2.94 },
      { text: "工具", at: 3.26 },
    ],
  },
  {
    from: 4.32,
    to: SPOKEN_AT.ai,
    parts: [
      { text: "你肯定反复撞到过" },
      { text: "这串英文词", at: 6.88 },
    ],
  },
];

const LIST: readonly { text: string; at: number }[] = [
  { text: "AI", at: SPOKEN_AT.ai },
  { text: "Model", at: SPOKEN_AT.model },
  { text: "Token", at: SPOKEN_AT.token },
  { text: "Agent", at: SPOKEN_AT.agent },
];

const clampFade = (
  frame: number,
  fromFrame: number,
  toFrame: number,
  holdTail: boolean,
) => {
  return interpolate(
    frame,
    holdTail
      ? [fromFrame, fromFrame + 6]
      : [fromFrame, fromFrame + 6, toFrame - 6, toFrame],
    holdTail ? [0, 1] : [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const active = CUES.find((cue) => {
    const fromFrame = secToFrame(cue.from, fps);
    const toFrame = secToFrame(cue.to, fps);
    return frame >= fromFrame && frame < toFrame;
  });

  const listFrom = secToFrame(SPOKEN_AT.ai, fps);
  const showList = frame >= listFrom;

  return (
    <div
      style={{
        position: "absolute",
        left: "9%",
        width: "82%",
        bottom: 300,
        display: "flex",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {active ? (
        <div
          style={{
            opacity: clampFade(
              frame,
              secToFrame(active.from, fps),
              secToFrame(active.to, fps),
              false,
            ),
            fontFamily: notoFamily,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.35,
            color: kitchen.canvas,
            textShadow: `0 2px 18px ${kitchen.scrim}`,
          }}
        >
          {active.parts.map((part) => {
            const visibleAt = secToFrame(part.at ?? active.from, fps);
            if (frame < visibleAt) {
              return null;
            }
            const appear = interpolate(frame, [visibleAt, visibleAt + 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            if (part.highlight) {
              return (
                <span
                  key={part.text}
                  style={{
                    opacity: appear,
                    color: kitchen.captionHighlight,
                    fontFamily: interFamily,
                    fontWeight: 700,
                    fontSize: 44,
                    marginLeft: 8,
                    marginRight: 8,
                  }}
                >
                  {part.text}
                </span>
              );
            }
            return (
              <span key={`${part.text}-${part.at ?? 0}`} style={{ opacity: appear }}>
                {part.text}
              </span>
            );
          })}
        </div>
      ) : null}
      {showList ? (
        <div
          style={{
            opacity: clampFade(frame, listFrom, secToFrame(10, fps), true),
            fontFamily: interFamily,
            fontWeight: 700,
            fontSize: 44,
            lineHeight: 1.2,
            color: kitchen.captionHighlight,
            textShadow: `0 2px 18px ${kitchen.scrim}`,
          }}
        >
          {LIST.map((word, index) => {
            const at = secToFrame(word.at, fps);
            if (frame < at) {
              return null;
            }
            const appear = interpolate(frame, [at, at + 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <span key={word.text} style={{ opacity: appear }}>
                {index > 0 ? (
                  <span
                    style={{
                      color: kitchen.canvas,
                      fontFamily: notoFamily,
                      fontWeight: 500,
                      marginLeft: 2,
                      marginRight: 2,
                    }}
                  >
                    、
                  </span>
                ) : null}
                {word.text}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
