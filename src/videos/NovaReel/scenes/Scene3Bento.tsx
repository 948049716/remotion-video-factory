import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Asterisk, C, CLAMP, F, hexToRgba, range } from "../theme";

const TOOLS = [
  { name: "AFTER EFFECTS", pct: 96, color: C.vermilion, tag: "AE" },
  { name: "CINEMA 4D", pct: 92, color: C.cyan, tag: "C4D" },
  { name: "FIGMA", pct: 88, color: C.acid, tag: "FG" },
  { name: "REMOTION / REACT", pct: 94, color: C.mint, tag: "RM" },
];

const Tile: React.FC<{
  delay: number;
  bg: string;
  color: string;
  label: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  shadow?: string;
}> = ({ delay, bg, color, label, style, children, shadow = C.ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 120, mass: 0.9 },
  });
  const y = interpolate(s, [0, 1], [110, 0], CLAMP);
  const rx = interpolate(s, [0, 1], [-9, 0], CLAMP);
  const opacity = interpolate(frame, [delay, delay + 9], [0, 1], CLAMP);

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: bg,
        color,
        overflow: "hidden",
        boxShadow: `10px 10px 0 ${shadow}`,
        transform: `perspective(1400px) translateY(${y}px) rotateX(${rx}deg)`,
        opacity,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 22,
          fontFamily: F.mono,
          fontSize: 10.5,
          letterSpacing: "0.22em",
          opacity: 0.62,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
};

export const Scene3Bento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const years = Math.floor(interpolate(frame, [8, 52], [0, 12], CLAMP));
  const projects = Math.floor(interpolate(frame, [14, 72], [0, 240], CLAMP));
  const wipe = interpolate(frame, [216, 240], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.76, 0, 0.24, 1),
  });
  const titleIn = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 110, mass: 1 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.cobalt,
        color: C.paper,
        overflow: "hidden",
        fontFamily: F.sans,
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: F.mono,
          fontSize: 11.5,
          letterSpacing: "0.22em",
          opacity: interpolate(frame, [0, 12], [0, 1], CLAMP),
        }}
      >
        <span>
          03 <span style={{ color: C.acid }}>/</span> CAPABILITIES
        </span>
        <span style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 22, letterSpacing: "0em", opacity: 0.88 }}>
          Everything, end to end.
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 82,
          left: 64,
          right: 64,
          height: 1,
          backgroundColor: hexToRgba(C.paper, 0.35),
          transform: `scaleX(${interpolate(frame, [0, 22], [0, 1], CLAMP)})`,
          transformOrigin: "left",
        }}
      />

      {/* Bento grid */}
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          top: 112,
          bottom: 70,
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: 18,
        }}
      >
        {/* A — years */}
        <Tile
          delay={2}
          bg={C.paper}
          color={C.ink}
          label="01 / EXPERIENCE"
          style={{ gridColumn: "1 / span 5", gridRow: "1 / span 2", padding: 24 }}
        >
          <div
            style={{
              position: "absolute",
              left: 22,
              top: 78,
              fontFamily: F.display,
              fontSize: 300,
              lineHeight: 0.82,
              letterSpacing: "-0.08em",
              transform: `translateY(${(1 - titleIn) * 30}px)`,
            }}
          >
            {years}
          </div>
          <div
            style={{
              position: "absolute",
              left: 26,
              top: 350,
              fontFamily: F.display,
              fontSize: 43,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
            }}
          >
            YEARS OF
            <br />
            MAKING THINGS
            <br />
            MOVE.
          </div>
          <div
            style={{
              position: "absolute",
              left: 26,
              bottom: 26,
              right: 26,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontFamily: F.mono,
              fontSize: 10,
              letterSpacing: "0.2em",
              opacity: 0.55,
            }}
          >
            <span>2014 — 2026</span>
            <span>INDEPENDENT / GLOBAL</span>
          </div>
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 210,
              height: 210,
              background: `repeating-linear-gradient(45deg, ${hexToRgba(C.ink, 0.14)} 0 3px, transparent 3px 11px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 26,
              top: 24,
              width: 50,
              height: 50,
              backgroundColor: C.vermilion,
              color: C.paper,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.sans,
              fontSize: 24,
            }}
          >
            ↗
          </div>
        </Tile>

        {/* B — projects */}
        <Tile
          delay={8}
          bg={C.vermilion}
          color={C.paper}
          label="02 / SHIPPED"
          style={{ gridColumn: "6 / span 4", gridRow: "1", padding: 24 }}
        >
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 56,
              fontFamily: F.display,
              fontSize: 128,
              lineHeight: 0.9,
              letterSpacing: "-0.07em",
            }}
          >
            {projects}
            <span style={{ fontSize: 72 }}>+</span>
          </div>
          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 24,
              right: 24,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: F.mono,
              fontSize: 10,
              letterSpacing: "0.18em",
            }}
          >
            <span>PROJECTS</span>
            <span style={{ opacity: 0.6 }}>14 COUNTRIES</span>
          </div>
        </Tile>

        {/* C — toolkit */}
        <Tile
          delay={5}
          bg={C.ink}
          color={C.paper}
          label="03 / TOOLKIT"
          style={{ gridColumn: "10 / span 4", gridRow: "1 / span 2", padding: 24 }}
        >
          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              top: 66,
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            {TOOLS.map((tool, i) => {
              const p = spring({
                frame: frame - 28 - i * 8,
                fps,
                config: { damping: 18, stiffness: 70, mass: 1.2 },
              });
              return (
                <div key={tool.name}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 9,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontFamily: F.mono,
                        fontSize: 10.5,
                        letterSpacing: "0.12em",
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 20,
                          border: `1px solid ${hexToRgba(C.paper, 0.4)}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 8.5,
                          color: tool.color,
                        }}
                      >
                        {tool.tag}
                      </span>
                      {tool.name}
                    </span>
                    <span style={{ fontFamily: F.mono, fontSize: 10, color: tool.color }}>
                      {tool.pct}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 5,
                      backgroundColor: hexToRgba(C.paper, 0.14),
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${tool.pct * p}%`,
                        height: "100%",
                        backgroundColor: tool.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 64,
            }}
          >
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 9,
                letterSpacing: "0.2em",
                opacity: 0.38,
              }}
            >
              SELECTED CLIENTS
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: F.sans,
                fontSize: 15,
                lineHeight: 1.75,
                letterSpacing: "0.02em",
                opacity: 0.82,
              }}
            >
              NIKE — A24 — VOGUE
              <br />
              SONY — STRIPE — ARC&apos;TERYX
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 24,
              fontFamily: F.mono,
              fontSize: 9.5,
              letterSpacing: "0.18em",
              opacity: 0.45,
            }}
          >
            FULL-STACK MOTION — NO HANDOFFS
          </div>
        </Tile>

        {/* D — awards */}
        <Tile
          delay={11}
          bg={C.acid}
          color={C.ink}
          label="04 / RECOGNITION"
          style={{ gridColumn: "6 / span 4", gridRow: "2", padding: 24 }}
        >
          <div
            style={{
              position: "absolute",
              right: -52,
              bottom: -64,
              opacity: 0.9,
            }}
          >
            <Asterisk
              size={260}
              color={C.ink}
              rotation={interpolate(frame, [0, 240], [0, 55], CLAMP)}
              spokes={14}
              weight={13}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 22,
              top: 56,
              fontFamily: F.display,
              fontSize: 120,
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
            }}
          >
            18
          </div>
          <div
            style={{
              position: "absolute",
              left: 26,
              top: 172,
              fontFamily: F.display,
              fontSize: 27,
              letterSpacing: "-0.01em",
            }}
          >
            AWARDS
          </div>
          <div
            style={{
              position: "absolute",
              left: 26,
              bottom: 24,
              fontFamily: F.mono,
              fontSize: 9.5,
              letterSpacing: "0.14em",
              opacity: 0.65,
            }}
          >
            D&AD · ADC · AWWWARDS
          </div>
        </Tile>

        {/* E — sound */}
        <Tile
          delay={14}
          bg={C.ink}
          color={C.paper}
          label="05 / SOUND"
          style={{ gridColumn: "1 / span 5", gridRow: "3", padding: 24 }}
        >
          <div
            style={{
              position: "absolute",
              left: 22,
              bottom: 26,
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              height: 132,
            }}
          >
            {range(30).map((i) => {
              const h =
                16 +
                Math.abs(
                  Math.sin(frame * 0.13 + i * 0.52) *
                    Math.cos(frame * 0.05 + i * 0.21)
                ) *
                  112;
              const hot = i % 7 === 0;
              return (
                <div
                  key={i}
                  style={{
                    width: 9,
                    height: h,
                    backgroundColor: hot ? C.vermilion : hexToRgba(C.paper, 0.85),
                  }}
                />
              );
            })}
          </div>
          <div
            style={{
              position: "absolute",
              right: 24,
              top: 76,
              textAlign: "right",
              fontFamily: F.display,
              fontSize: 28,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            AUDIO-
            <br />
            REACTIVE
          </div>
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 28,
              fontFamily: F.mono,
              fontSize: 9.5,
              letterSpacing: "0.16em",
              opacity: 0.5,
              textAlign: "right",
            }}
          >
            DESIGNED IN SYNC
            <br />
            WITH THE CUT
          </div>
        </Tile>

        {/* F — spatial */}
        <Tile
          delay={17}
          bg={C.paper}
          color={C.ink}
          label="06 / SPATIAL"
          style={{ gridColumn: "6 / span 4", gridRow: "3", padding: 24 }}
        >
          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 24,
              fontFamily: F.display,
              fontSize: 30,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            3D IS JUST
            <br />
            ANOTHER GRID.
          </div>
          <div
            style={{
              position: "absolute",
              right: 74,
              top: 58,
              width: 130,
              height: 130,
              perspective: 600,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 130,
                height: 130,
                transformStyle: "preserve-3d",
                transform: `rotateX(-22deg) rotateY(${interpolate(frame, [0, 240], [20, 380], CLAMP)}deg)`,
              }}
            >
              {[
                "translateZ(65px)",
                "rotateY(180deg) translateZ(65px)",
                "rotateY(90deg) translateZ(65px)",
                "rotateY(-90deg) translateZ(65px)",
                "rotateX(90deg) translateZ(65px)",
                "rotateX(-90deg) translateZ(65px)",
              ].map((t, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 130,
                    height: 130,
                    border: `2px solid ${C.ink}`,
                    backgroundColor: hexToRgba(C.cobalt, i % 2 ? 0.28 : 0.55),
                    transform: t,
                  }}
                />
              ))}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 28,
              fontFamily: F.mono,
              fontSize: 9,
              letterSpacing: "0.16em",
              opacity: 0.5,
            }}
          >
            CSS · PRESERVE-3D
          </div>
        </Tile>

        {/* G — process */}
        <Tile
          delay={20}
          bg={C.vermilion}
          color={C.paper}
          label="07 / PROCESS"
          style={{ gridColumn: "10 / span 4", gridRow: "3", padding: 24 }}
        >
          <div
            style={{
              position: "absolute",
              left: "-20%",
              top: 76,
              width: "140%",
              transform: "rotate(-9deg)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {[0, 1].map((row) => (
              <div
                key={row}
                style={{
                  whiteSpace: "nowrap",
                  fontFamily: F.display,
                  fontSize: 32,
                  letterSpacing: "-0.02em",
                  transform: `translateX(${((frame * (row === 0 ? 4 : -4)) % 420) - 210}px)`,
                  opacity: row === 0 ? 1 : 0.55,
                }}
              >
                DESIGN ✳ ANIMATE ✳ SHIP ✳ REPEAT ✳ DESIGN ✳ ANIMATE ✳
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: F.mono,
              fontSize: 10,
              letterSpacing: "0.18em",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: C.acid,
              }}
            />
            ALWAYS IN MOTION
          </div>
        </Tile>
      </div>

      {/* Crop marks */}
      <div
        style={{
          position: "absolute",
          right: 30,
          top: 30,
          width: 16,
          height: 16,
          borderTop: `1px solid ${hexToRgba(C.paper, 0.5)}`,
          borderRight: `1px solid ${hexToRgba(C.paper, 0.5)}`,
        }}
      />

      {/* Wipe into Act IV */}
      <div
        style={{
          position: "absolute",
          left: -60,
          top: -20,
          width: 2040,
          height: 1140,
          backgroundColor: C.ink,
          transform: `translateX(${interpolate(wipe, [0, 1], [-2040, 0], CLAMP)}px)`,
          clipPath: "polygon(0 0, 100% 0, 94% 100%, 0 100%)",
        }}
      />
    </div>
  );
};
