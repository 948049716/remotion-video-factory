import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, CLAMP, F, hexToRgba, range } from "../theme";

const COLS = 12;
const ROWS = 8;
const TILE = 100;
const GAP = 10;
const GRID_W = COLS * TILE + (COLS - 1) * GAP;
const GRID_H = ROWS * TILE + (ROWS - 1) * GAP;
const LEFT = (1920 - GRID_W) / 2;
const TOP = (1080 - GRID_H) / 2 - 8;

const N_CELLS = new Set<string>();
const N_ROWS: number[][] = [
  [0, 1, 10, 11],
  [0, 1, 2, 9, 10, 11],
  [0, 1, 2, 3, 8, 9, 10, 11],
  [0, 1, 4, 5, 7, 8, 10, 11],
  [0, 1, 5, 6, 10, 11],
  [0, 1, 6, 7, 10, 11],
  [0, 1, 7, 8, 10, 11],
  [0, 1, 8, 9, 10, 11],
];
N_ROWS.forEach((cols, row) => cols.forEach((col) => N_CELLS.add(`${row}-${col}`)));

const COLORS = [C.ink, C.ink, C.ink, C.cobalt, C.vermilion, C.ink, C.acid];

export const Scene7Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const assemble = interpolate(frame, [148, 184], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const introLabel = interpolate(frame, [8, 30], [0, 1], CLAMP);
  const labelsOut = interpolate(frame, [160, 184], [1, 0], CLAMP);
  const scanX = LEFT + ((frame * 8.4) % (GRID_W + 200)) - 100;
  const wipe = interpolate(frame, [214, 240], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.76, 0, 0.24, 1),
  });
  const ripple = (frame % 60) / 60;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.paper,
        color: C.ink,
        overflow: "hidden",
        fontFamily: F.sans,
      }}
    >
      {/* Ambient wash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 45%, ${hexToRgba(C.white, 0.65)}, transparent 62%)`,
        }}
      />

      {/* Background ruler ring */}
      <div
        style={{
          position: "absolute",
          left: 960 - 470,
          top: 540 - 470,
          width: 940,
          height: 940,
          borderRadius: "50%",
          border: `1px dashed ${hexToRgba(C.ink, 0.18)}`,
          transform: `rotate(${frame * 0.12}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960 - 354,
          top: 540 - 354,
          width: 708,
          height: 708,
          borderRadius: "50%",
          border: `1px solid ${hexToRgba(C.vermilion, 0.16)}`,
          transform: `scale(${1 + ripple * 0.22})`,
          opacity: 1 - ripple,
        }}
      />

      {/* Ghost act numeral */}
      <div
        style={{
          position: "absolute",
          right: -40,
          bottom: -170,
          fontFamily: F.display,
          fontSize: 650,
          lineHeight: 0.8,
          letterSpacing: "-0.06em",
          color: "transparent",
          WebkitTextStroke: `1.5px ${hexToRgba(C.ink, 0.06)}`,
        }}
      >
        07
      </div>

      {/* Module grid */}
      <div
        style={{
          position: "absolute",
          left: LEFT,
          top: TOP,
          width: GRID_W,
          height: GRID_H,
        }}
      >
        {range(ROWS).map((row) =>
          range(COLS).map((col) => {
            const key = `${row}-${col}`;
            const isN = N_CELLS.has(key);
            const dist = Math.abs(col - (COLS - 1) / 2) + Math.abs(row - (ROWS - 1) / 2);
            const entry = spring({
              frame: frame - 4 - dist * 2.2,
              fps,
              config: { damping: 14, stiffness: 130, mass: 0.7 },
            });
            const wave =
              Math.abs(
                Math.sin(col * 0.52 + row * 0.36 - frame * 0.105) *
                  Math.cos(col * 0.11 - frame * 0.045 + row * 0.2)
              );
            const baseScale = 0.38 + wave * 0.62;
            const baseRot = Math.sin(col * 0.4 + row * 0.5 - frame * 0.08) * 10;
            const targetScale = isN ? 1 : 0.001;
            const targetRot = 0;
            const scale =
              (interpolate(assemble, [0, 1], [baseScale, targetScale], CLAMP)) *
              interpolate(entry, [0, 1], [0, 1], CLAMP);
            const rot = interpolate(assemble, [0, 1], [baseRot, targetRot], CLAMP);
            const baseColor = COLORS[(col * 3 + row * 5) % COLORS.length];
            const color = isN
              ? assemble > 0.5
                ? C.ink
                : baseColor
              : baseColor;
            const opacity =
              interpolate(entry, [0, 1], [0, 1], CLAMP) *
              interpolate(assemble, [0, 1], [1, isN ? 1 : 0], CLAMP);

            return (
              <div
                key={key}
                style={{
                  position: "absolute",
                  left: col * (TILE + GAP),
                  top: row * (TILE + GAP),
                  width: TILE,
                  height: TILE,
                  backgroundColor: color,
                  borderRadius: (col + row) % 9 === 0 ? "50%" : 2,
                  transform: `scale(${scale}) rotate(${rot}deg)`,
                  opacity,
                }}
              />
            );
          })
        )}

        {/* Scan line */}
        <div
          style={{
            position: "absolute",
            top: -30,
            left: scanX - LEFT,
            width: 2,
            height: GRID_H + 60,
            backgroundColor: C.vermilion,
            opacity: 0.65 * labelsOut,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -52,
            left: scanX - LEFT + 8,
            fontFamily: F.mono,
            fontSize: 9.5,
            letterSpacing: "0.2em",
            color: C.vermilion,
            opacity: labelsOut,
            whiteSpace: "nowrap",
          }}
        >
          SCAN
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: F.mono,
          fontSize: 11.5,
          letterSpacing: "0.22em",
          opacity: introLabel,
        }}
      >
        <span>
          07 <span style={{ color: C.vermilion }}>/</span> SYSTEMS
        </span>
        <span style={{ opacity: 0.55 }}>GRID 12 × 8 — 96 MODULES</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 82,
          left: 64,
          right: 64,
          height: 1,
          backgroundColor: hexToRgba(C.ink, 0.3),
          transform: `scaleX(${interpolate(frame, [0, 24], [0, 1], CLAMP)})`,
          transformOrigin: "left",
        }}
      />

      {/* Rotated margin caption */}
      <div
        style={{
          position: "absolute",
          left: 58,
          top: 802,
          transform: "rotate(-90deg)",
          transformOrigin: "left top",
          display: "flex",
          alignItems: "center",
          gap: 22,
          opacity: labelsOut,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontSize: 46,
            letterSpacing: "-0.02em",
          }}
        >
          rhythm, repeated.
        </span>
        <span
          style={{
            width: 110,
            height: 1,
            backgroundColor: hexToRgba(C.ink, 0.35),
          }}
        />
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            letterSpacing: "0.24em",
            opacity: 0.55,
          }}
        >
          SINE FIELDS / ONE RULE — REPEAT
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 92,
          textAlign: "right",
          fontFamily: F.mono,
          fontSize: 10,
          letterSpacing: "0.22em",
          opacity: 0.55 * labelsOut,
          lineHeight: 1.9,
        }}
      >
        <div>96 TILES</div>
        <div>60 FRAMES / SEC</div>
        <div style={{ color: C.vermilion }}>NO ASSETS</div>
      </div>

      {/* Assembled monogram caption */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 62,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 10,
          letterSpacing: "0.4em",
          color: C.ink,
          opacity: Math.max(0, (assemble - 0.7) * 3),
          transform: `translateY(${(1 - assemble) * 12}px)`,
        }}
      >
        N / R — SYSTEMS AT REST
      </div>

      {/* Wipe into the finale */}
      <div
        style={{
          position: "absolute",
          left: -40,
          top: 0,
          width: 2000,
          height: 1160,
          backgroundColor: C.ink,
          transform: `translateY(${(1 - wipe) * 1120}px)`,
          clipPath: "polygon(0 5%, 100% 0, 100% 100%, 0 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 64,
            bottom: 120,
            fontFamily: F.mono,
            fontSize: 12,
            letterSpacing: "0.3em",
            color: C.paper,
            opacity: 0.75,
          }}
        >
          08 — THE RESUME
        </div>
      </div>
    </div>
  );
};
