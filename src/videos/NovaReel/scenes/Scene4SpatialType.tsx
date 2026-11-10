import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, CLAMP, F, hexToRgba, range } from "../theme";

const PLANES = 11;
const SPACING = 500;

const LAYER_COLORS = [
  C.paper,
  C.paper,
  C.cobalt,
  C.paper,
  C.acid,
  C.paper,
  C.vermilion,
  C.paper,
  C.cobalt,
  C.paper,
  C.paper,
];

const PARTICLE_COLORS = [C.vermilion, C.cobalt, C.acid, C.paper, C.cyan];

const PARTICLES = range(46).map((i) => {
  const g = (n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    x: (g(1) - 0.5) * 2600,
    y: (g(2) - 0.5) * 1500,
    z: -SPACING * 0.4 - i * 118,
    size: 5 + g(3) * 26,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    spin: g(4) * 720,
    round: g(5) > 0.55,
    opacity: 0.25 + g(6) * 0.6,
  };
});

export const Scene4SpatialType: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fly the camera forward through the planes, ease to a full-width landing on the last one.
  const camProgress = Math.min(frame, 222) / 222;
  const cameraZ = 5560 * Math.pow(camProgress, 2.4);
  const worldRotZ = interpolate(frame, [0, 240], [-3, 0], CLAMP);

  const intro = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 90, mass: 1 },
  });
  const outro = interpolate(frame, [178, 208], [1, 0], CLAMP);
  const landing = interpolate(frame, [212, 228], [0, 1], CLAMP);
  const flashOut = interpolate(frame, [232, 240], [0, 0.92], {
    ...CLAMP,
    easing: Easing.bezier(0.7, 0, 1, 1),
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#060509",
        overflow: "hidden",
        fontFamily: F.sans,
        color: C.paper,
      }}
    >
      {/* Light environment */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 48%, rgba(48,64,255,0.22), transparent 52%), radial-gradient(ellipse at 50% 100%, rgba(242,68,30,0.16), transparent 55%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 900,
          height: 900,
          marginLeft: -450,
          marginTop: -450,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12), transparent 62%)",
          filter: "blur(30px)",
        }}
      />

      {/* Perspective floor grid */}
      <div
        style={{
          position: "absolute",
          left: -400,
          right: -400,
          bottom: -120,
          height: 620,
          perspective: 700,
          overflow: "hidden",
          opacity: 0.28,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotateX(74deg)",
            transformOrigin: "center bottom",
            backgroundImage: `linear-gradient(${hexToRgba(C.paper, 0.5)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(C.paper, 0.5)} 1px, transparent 1px)`,
            backgroundSize: "100px 100px",
            maskImage: "linear-gradient(to top, black, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to top, black, transparent 80%)",
          }}
        />
      </div>

      {/* 3D tunnel — per-plane perspective so Chromium cannot flatten the depth */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "48%",
          }}
        >
          {range(PLANES).map((i) => {
            const z = -200 - i * SPACING;
            const screenZ = z + cameraZ;
            // 420 lets the last plane land in front of the screen plane; earlier planes pop out at 1.9x.
            if (screenZ > 420) return null;
            const distance = Math.max(0, -screenZ);
            const fog = interpolate(distance, [0, 300, 1800, 5200], [1, 0.95, 0.42, 0.12], CLAMP);
            const isFinal = i === PLANES - 1;
            const color = LAYER_COLORS[i];
            const tilt = isFinal ? 0 : (i % 2 === 0 ? 1 : -1) * (2 + i * 0.5);

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 2200,
                  marginLeft: -1100,
                  marginTop: -180,
                  transform: `perspective(900px) translateZ(${screenZ}px) rotateZ(${tilt + (isFinal ? 0 : worldRotZ)}deg)`,
                  textAlign: "center",
                  opacity: fog,
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: isFinal ? 330 : 300,
                    lineHeight: 0.9,
                    letterSpacing: "-0.06em",
                    color: isFinal ? C.paper : "transparent",
                    WebkitTextStroke: isFinal ? undefined : `2.5px ${color}`,
                    textShadow: isFinal ? `0 0 80px ${hexToRgba(C.paper, 0.25)}` : undefined,
                  }}
                >
                  CRAFT
                </div>
                <div
                  style={{
                    marginTop: 20,
                    fontFamily: F.mono,
                    fontSize: 18,
                    letterSpacing: "0.62em",
                    color: isFinal ? C.ink : hexToRgba(color, 0.8),
                    opacity: isFinal ? 1 : 0.75,
                    paddingLeft: "0.62em",
                  }}
                >
                  {isFinal ? "MADE TO MOVE — 003" : `${String(i + 1).padStart(2, "0")} / ${PLANES}`}
                </div>
                {isFinal && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: 760,
                      height: 2,
                      marginLeft: -380,
                      marginTop: 250,
                      backgroundColor: C.vermilion,
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Floating debris */}
          {PARTICLES.map((p, i) => {
            const screenZ = p.z + cameraZ;
            if (screenZ > 160) return null;
            const fog = Math.min(1, Math.max(0, -screenZ) / 700);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: p.round ? "50%" : 1,
                  opacity: p.opacity * fog,
                  transform: `perspective(900px) translate3d(${p.x}px, ${p.y}px, ${screenZ}px) rotateZ(${frame * 0.8 + p.spin}deg)`,
                  mixBlendMode: p.color === C.paper ? "normal" : "screen",
                }}
              />
            );
          })}

          {/* Orbital rings */}
          {range(6).map((i) => {
            const z = -450 - i * 880;
            const screenZ = z + cameraZ;
            if (screenZ > 160) return null;
            const distance = Math.max(0, -screenZ);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 760 + i * 90,
                  height: 760 + i * 90,
                  marginLeft: -(380 + i * 45),
                  marginTop: -(380 + i * 45),
                  borderRadius: "50%",
                  border: `1px solid ${hexToRgba(i % 2 ? C.acid : C.vermilion, 0.55)}`,
                  transform: `perspective(900px) translate3d(0, 0, ${screenZ}px) rotateX(${70 + i * 4}deg) rotateZ(${frame * (0.3 + i * 0.08)}deg)`,
                  opacity: interpolate(distance, [0, 3000], [0.8, 0], CLAMP),
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Fixed editorial labels */}
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
          opacity: Math.max(0, Math.min(1, outro)),
        }}
      >
        <span>
          04 <span style={{ color: C.vermilion }}>/</span> SPATIAL TYPE
        </span>
        <span style={{ opacity: 0.55 }}>FOV 900PX — Z-AXIS ACTIVE</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 92,
          opacity: Math.max(0, Math.min(1, intro) * outro),
          transform: `translateY(${interpolate(intro, [0, 1], [26, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontSize: 52,
            letterSpacing: "-0.02em",
            color: C.paper,
          }}
        >
          z is a place.
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: F.mono,
            fontSize: 10.5,
            letterSpacing: "0.28em",
            color: hexToRgba(C.paper, 0.55),
          }}
        >
          TYPE BUILT IN THREE DIMENSIONS
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 92,
          textAlign: "right",
          fontFamily: F.mono,
          fontSize: 10.5,
          letterSpacing: "0.22em",
          color: hexToRgba(C.paper, 0.6),
          opacity: Math.max(0, Math.min(1, intro) * outro),
        }}
      >
        <div>11 PLANES</div>
        <div style={{ marginTop: 8, color: C.acid }}>ONE WORD</div>
      </div>

      {/* Landing captions on the final plane */}
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
          opacity: landing,
        }}
      >
        <span>
          04 <span style={{ color: C.vermilion }}>/</span> SPATIAL TYPE
        </span>
        <span style={{ color: C.acid }}>FINAL PLANE — 11 / 11</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 76,
          opacity: landing,
          transform: `translateY(${interpolate(landing, [0, 1], [16, 0], CLAMP)}px)`,
        }}
      >
        <span
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontSize: 36,
            color: C.paper,
          }}
        >
          z is a place.
        </span>
      </div>

      {/* Frame brackets */}
      {[
        { left: 64, top: 80, borderLeft: true, borderTop: true },
        { right: 64, top: 80, borderRight: true, borderTop: true },
        { left: 64, bottom: 64, borderLeft: true, borderBottom: true },
        { right: 64, bottom: 64, borderRight: true, borderBottom: true },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            borderLeft: p.borderLeft ? `1px solid ${hexToRgba(C.paper, 0.4)}` : undefined,
            borderRight: p.borderRight ? `1px solid ${hexToRgba(C.paper, 0.4)}` : undefined,
            borderTop: p.borderTop ? `1px solid ${hexToRgba(C.paper, 0.4)}` : undefined,
            borderBottom: p.borderBottom ? `1px solid ${hexToRgba(C.paper, 0.4)}` : undefined,
            left: p.left,
            right: p.right,
            top: p.top,
            bottom: p.bottom,
            opacity: Math.max(0, Math.min(1, outro)),
          }}
        />
      ))}

      {/* Flash out into the generative act */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: C.paper,
          opacity: flashOut,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
