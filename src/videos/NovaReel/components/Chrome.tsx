import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ACT_BOUNDARIES, ACT_LABELS, C, CLAMP, F, range } from "../theme";

const NOISE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="240" height="240" filter="url(#n)" opacity="0.55"/></svg>`;
const NOISE_URI = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")`;

/** Film grain + print vignette, deterministic and cheap. */
export const Grain: React.FC<{ opacity?: number; seed?: number }> = ({
  opacity = 0.085,
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const x = ((frame * 37 + seed * 91) % 240) - 240;
  const y = ((frame * 53 + seed * 17) % 240) - 240;
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: -240,
          backgroundImage: NOISE_URI,
          backgroundSize: "240px 240px",
          backgroundPosition: `${x}px ${y}px`,
          opacity,
          mixBlendMode: "overlay",
          pointerEvents: "none",
          zIndex: 80,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 46%, transparent 55%, rgba(0,0,0,0.22) 100%)",
          pointerEvents: "none",
          zIndex: 81,
        }}
      />
    </>
  );
};

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

/** Editorial registration chrome, inverted with difference blending. */
export const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  let actIndex = 0;
  for (let i = 0; i < ACT_BOUNDARIES.length - 1; i++) {
    if (frame >= ACT_BOUNDARIES[i]) actIndex = i;
  }

  const seconds = Math.floor(frame / fps);
  const frames = frame % fps;
  const timecode = `00:${pad(seconds)}:${pad(frames)}`;
  const progress = frame / durationInFrames;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 90,
        pointerEvents: "none",
        color: C.white,
        mixBlendMode: "difference",
        fontFamily: F.mono,
      }}
    >
      {/* Registration cross */}
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 36,
          width: 22,
          height: 22,
          opacity: 0.8,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 10.5,
            top: 0,
            width: 1,
            height: 22,
            backgroundColor: C.white,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 10.5,
            left: 0,
            height: 1,
            width: 22,
            backgroundColor: C.white,
          }}
        />
      </div>

      {/* Vertical edge credit */}
      <div
        style={{
          position: "absolute",
          right: 46,
          top: "50%",
          transform: "translateY(-50%) rotate(180deg)",
          writingMode: "vertical-rl",
          fontSize: 9.5,
          letterSpacing: "0.42em",
          opacity: 0.42,
        }}
      >
        SELECTED MOTION — NOVA REYES
      </div>

      {/* Bottom editorial rail */}
      <div
        style={{
          position: "absolute",
          left: 46,
          right: 46,
          bottom: 30,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          fontSize: 10.5,
          letterSpacing: "0.2em",
          opacity: 0.9,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontWeight: 700 }}>
              {pad(actIndex + 1)} / 08
            </span>
            <span style={{ opacity: 0.55 }}>{ACT_LABELS[actIndex]}</span>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {range(8).map((i) => (
              <div
                key={i}
                style={{
                  width: 26,
                  height: 3,
                  backgroundColor: C.white,
                  opacity: i <= actIndex ? 0.95 : 0.2,
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 22,
            letterSpacing: "0.16em",
            opacity: 0.9,
          }}
        >
          <span>1920 × 1080</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>60 FPS</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>TC {timecode}</span>
        </div>
      </div>

      {/* Progress hairline */}
      <div
        style={{
          position: "absolute",
          left: 46,
          right: 46,
          bottom: 18,
          height: 1,
          backgroundColor: C.white,
          opacity: 0.22,
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            backgroundColor: C.white,
          }}
        />
      </div>
    </div>
  );
};

const FLASH_COLORS = [
  C.vermilion,
  C.paper,
  C.vermilion,
  C.acid,
  C.white,
  C.ink,
  C.vermilion,
];

/** Hard, short color flashes that punch the seven act cuts. */
export const CutFlashes: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = ACT_BOUNDARIES.slice(1, -1);

  return (
    <>
      {cuts.map((cut, i) => {
        const d = frame - cut;
        if (d < 0 || d > 4) return null;
        const opacity = interpolate(d, [0, 1, 4], [0.92, 0.55, 0], CLAMP);
        return (
          <div
            key={cut}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: FLASH_COLORS[i],
              opacity,
              zIndex: 85,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
};
