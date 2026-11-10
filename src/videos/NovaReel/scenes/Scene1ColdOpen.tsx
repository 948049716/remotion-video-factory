import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, CLAMP, F, hexToRgba, range } from "../theme";

const WORD = "EVERYTHING";

export const Scene1ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0-88 ink, 88-120 paper — a hard inversion on the downbeat.
  const inverted = frame >= 88;
  const bg = inverted ? C.paper : C.ink;
  const fg = inverted ? C.ink : C.paper;
  const invertFlash =
    frame < 88 ? 0 : interpolate(frame, [88, 90, 98], [0.95, 0.5, 0], CLAMP);

  const groupOut = interpolate(frame, [100, 116], [1, 0.94], CLAMP);
  const groupOpacity = interpolate(frame, [102, 116], [1, 0.6], CLAMP);
  const dotScale = interpolate(frame, [0, 9, 88, 100], [0, 1, 1, 5], {
    ...CLAMP,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const dotOpacity = interpolate(frame, [0, 8, 92, 110], [0, 1, 1, 0], CLAMP);

  const hairline = interpolate(frame, [6, 30], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const labelReveal = interpolate(frame, [2, 20], [0, 1], CLAMP);
  const movesSpring = spring({
    frame: frame - 36,
    fps,
    config: { damping: 13, stiffness: 120, mass: 0.8 },
  });
  const movesY = interpolate(movesSpring, [0, 1], [220, 0], CLAMP);
  const underline = interpolate(frame, [58, 74], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const counter = Math.max(0, Math.ceil(interpolate(frame, [0, 86], [30, 0], CLAMP)));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: bg,
        color: fg,
        overflow: "hidden",
        fontFamily: F.sans,
      }}
    >
      {/* Giant countdown ghost */}
      <div
        style={{
          position: "absolute",
          right: 58,
          bottom: -52,
          fontFamily: F.display,
          fontSize: 420,
          lineHeight: 0.8,
          letterSpacing: "-0.08em",
          color: "transparent",
          WebkitTextStroke: `1.5px ${hexToRgba(inverted ? C.ink : C.paper, 0.14)}`,
        }}
      >
        {String(counter).padStart(2, "0")}
      </div>

      {/* Soft stage light */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: inverted
            ? `radial-gradient(circle at 52% 42%, ${hexToRgba(C.white, 0.6)}, transparent 62%)`
            : `radial-gradient(circle at 52% 42%, ${hexToRgba(C.vermilion, 0.11)}, transparent 60%)`,
        }}
      />

      {/* Top labels */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          fontFamily: F.mono,
          fontSize: 12,
          letterSpacing: "0.24em",
          opacity: labelReveal,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <span style={{ fontWeight: 700 }}>NOVA REYES</span>
          <span style={{ opacity: 0.5 }}>MOTION DESIGNER</span>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 7 }}>
          <span style={{ color: inverted ? C.vermilion : C.acid }}>REEL / 2026</span>
          <span style={{ opacity: 0.5 }}>A STUDY IN MOTION</span>
        </div>
      </div>

      {/* Center lockup */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${groupOut})`,
          opacity: groupOpacity,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 12,
            letterSpacing: "0.34em",
            opacity: interpolate(frame, [12, 30], [0, 0.65], CLAMP),
            marginBottom: 18,
            transform: `translateY(${interpolate(frame, [12, 30], [10, 0], CLAMP)}px)`,
          }}
        >
          A PORTFOLIO IN MOTION
        </div>

        <div
          style={{
            width: 620 * hairline,
            height: 1,
            backgroundColor: fg,
            opacity: 0.45,
            marginBottom: 34,
          }}
        />

        <div
          style={{
            overflow: "hidden",
            paddingTop: 14,
            paddingBottom: 18,
            marginTop: -12,
            marginBottom: -10,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: F.display,
              fontSize: 172,
              lineHeight: 0.92,
              letterSpacing: "-0.062em",
              textTransform: "uppercase",
            }}
          >
            {WORD.split("").map((ch, i) => {
              const start = 16 + i * 2.1;
              const s = spring({
                frame: frame - start,
                fps,
                config: { damping: 14, stiffness: 150, mass: 0.55 },
              });
              const y = interpolate(s, [0, 1], [150, 0], CLAMP);
              const opacity = interpolate(frame, [start, start + 7], [0, 1], CLAMP);
              const blur = interpolate(s, [0, 1], [12, 0], CLAMP);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    transform: `translateY(${y}px)`,
                    opacity,
                    filter: `blur(${blur}px)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            marginTop: -26,
            paddingLeft: 250,
            paddingRight: 20,
            paddingBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontSize: 206,
              lineHeight: 0.9,
              letterSpacing: "-0.055em",
              color: C.vermilion,
              transform: `translateY(${movesY}px)`,
            }}
          >
            moves.
          </div>
          <div
            style={{
              position: "absolute",
              left: 256,
              bottom: 22,
              height: 9,
              width: 520 * underline,
              backgroundColor: C.vermilion,
            }}
          />
        </div>
      </div>

      {/* Corner metadata */}
      <div
        style={{
          position: "absolute",
          bottom: 66,
          left: 64,
          display: "flex",
          gap: 36,
          fontFamily: F.mono,
          fontSize: 10.5,
          letterSpacing: "0.2em",
          opacity: interpolate(frame, [40, 60], [0, 0.7], CLAMP),
        }}
      >
        <span>30 SECONDS</span>
        <span style={{ opacity: 0.5 }}>08 ACTS</span>
        <span style={{ opacity: 0.5 }}>NO CGI</span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 66,
          right: 64,
          fontFamily: F.mono,
          fontSize: 10.5,
          letterSpacing: "0.2em",
          opacity: interpolate(frame, [46, 66], [0, 0.7], CLAMP),
        }}
      >
        DESIGN / DIRECTION / ANIMATION
      </div>

      {/* Registration dot */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 12,
          height: 12,
          marginLeft: -6,
          marginTop: -6,
          borderRadius: "50%",
          backgroundColor: C.vermilion,
          transform: `scale(${dotScale})`,
          opacity: dotOpacity,
          boxShadow: `0 0 36px ${hexToRgba(C.vermilion, 0.55)}`,
        }}
      />

      {/* Inversion flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: C.paper,
          opacity: invertFlash,
          pointerEvents: "none",
        }}
      />

      {/* Tiny frame markers */}
      {range(4).map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 18,
            height: 1,
            backgroundColor: fg,
            opacity: 0.35,
            left: i % 2 === 0 ? 64 : undefined,
            right: i % 2 === 1 ? 64 : undefined,
            top: i < 2 ? 88 : undefined,
            bottom: i >= 2 ? 88 : undefined,
          }}
        />
      ))}
    </div>
  );
};
