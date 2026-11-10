import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, CLAMP, F, hexToRgba, Mark, range } from "../theme";

const Masked: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });
  const y = interpolate(s, [0, 1], [115, 0], CLAMP);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 8, ...style }}>
      <div style={{ transform: `translateY(${y}%)` }}>{children}</div>
    </div>
  );
};

const ResumeCard: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - start,
    fps,
    config: { damping: 15, stiffness: 100, mass: 0.9 },
  });
  const out = interpolate(frame, [100, 120], [1, 0], CLAMP);
  const float = Math.sin(frame * 0.035) * 4;

  if (frame < start) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: 96,
        top: 318,
        width: 580,
        height: 352,
        perspective: 1600,
        opacity: interpolate(s, [0, 1], [0, 1]) * out,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transform: `translateY(${(1 - s) * 90 + float}px) rotateY(${interpolate(s, [0, 1], [-34, 0])}deg) rotateX(${interpolate(s, [0, 1], [12, 0])}deg) rotateZ(${-6 + Math.sin(frame * 0.02) * 0.6}deg) scale(${interpolate(s, [0, 1], [0.92, 1])})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: C.paper,
            color: C.ink,
            boxShadow: `16px 16px 0 ${C.vermilion}`,
            padding: 30,
            boxSizing: "border-box",
            fontFamily: F.mono,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 10,
              backgroundColor: C.vermilion,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.28em", opacity: 0.55 }}>
                DESIGNER / DIRECTOR
              </div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 36,
                  letterSpacing: "-0.035em",
                  marginTop: 9,
                }}
              >
                NOVA REYES
              </div>
            </div>
            <Mark size={54} color={C.ink} accent={C.vermilion} strokeWidth={6} />
          </div>

          <div
            style={{
              height: 1,
              backgroundColor: hexToRgba(C.ink, 0.25),
              margin: "18px 0 16px",
            }}
          />

          <div style={{ fontSize: 13.5, letterSpacing: "0.04em", lineHeight: 1.9 }}>
            <div>hello@novareyes.design</div>
            <div style={{ opacity: 0.55 }}>novareyes.design</div>
            <div style={{ opacity: 0.55 }}>+44 20 7946 0318</div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 30,
              bottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 9,
              letterSpacing: "0.2em",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: C.mint,
                boxShadow: `0 0 10px ${C.mint}`,
              }}
            />
            OPEN FOR 2026
          </div>
          <div
            style={{
              position: "absolute",
              left: 230,
              bottom: 26,
              fontSize: 9,
              letterSpacing: "0.2em",
              opacity: 0.45,
            }}
          >
            LONDON — GLOBAL
          </div>

          {/* Deterministic contact glyph */}
          <div
            style={{
              position: "absolute",
              right: 28,
              bottom: 24,
              width: 72,
              height: 72,
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 2,
            }}
          >
            {range(36).map((i) => {
              const on = (i * 13 + 5) % 7 < 3;
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: on ? C.ink : "transparent",
                    borderRadius: 0.5,
                  }}
                />
              );
            })}
          </div>

          {/* Paper sheen */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(115deg, transparent 35%, ${hexToRgba(C.white, 0.35)} 48%, transparent 60%)`,
              transform: `translateX(${interpolate(frame, [start, start + 40], [-600, 600], CLAMP)}px)`,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const Scene8Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainOut = interpolate(frame, [98, 118], [1, 0], CLAMP);
  const mainY = interpolate(frame, [98, 118], [0, -40], CLAMP);
  const lockIn = spring({
    frame: frame - 112,
    fps,
    config: { damping: 15, stiffness: 100, mass: 0.9 },
  });
  const lockOpacity = interpolate(frame, [112, 130], [0, 1], CLAMP);
  const contentFade = interpolate(frame, [206, 224], [1, 0], CLAMP);
  const dotIn = interpolate(frame, [210, 224], [0, 1], CLAMP);
  const dotOut = interpolate(frame, [226, 240], [1, 0], CLAMP);
  const lineGrow = interpolate(frame, [126, 152], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const underline = interpolate(frame, [72, 100], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const ringRot = frame * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.ink,
        color: C.paper,
        overflow: "hidden",
        fontFamily: F.sans,
      }}
    >
      {/* Environment */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 56% 38%, rgba(31,59,255,0.16), transparent 48%), radial-gradient(ellipse at 24% 88%, rgba(242,68,30,0.12), transparent 44%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${hexToRgba(C.paper, 0.04)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(C.paper, 0.04)} 1px, transparent 1px)`,
          backgroundSize: "160px 160px",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -90,
          bottom: -220,
          fontFamily: F.display,
          fontSize: 700,
          lineHeight: 0.8,
          color: "transparent",
          WebkitTextStroke: `1.5px ${hexToRgba(C.paper, 0.05)}`,
          letterSpacing: "-0.06em",
        }}
      >
        08
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
          opacity: interpolate(frame, [4, 20], [0, 1], CLAMP) * contentFade,
        }}
      >
        <span>
          08 <span style={{ color: C.vermilion }}>/</span> THE RESUME
        </span>
        <span style={{ opacity: 0.55 }}>NOVA REYES — 2026</span>
      </div>

      {/* Main pitch */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 200,
          width: 1080,
          opacity: mainOut,
          transform: `translateY(${mainY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            letterSpacing: "0.28em",
            color: hexToRgba(C.paper, 0.55),
            marginBottom: 26,
            opacity: interpolate(frame, [6, 22], [0, 1], CLAMP),
          }}
        >
          A SHORT LIST OF REASONS TO HIRE ME
        </div>

        <Masked delay={8}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 156,
              lineHeight: 0.92,
              letterSpacing: "-0.065em",
            }}
          >
            LET&apos;S MAKE
          </div>
        </Masked>
        <Masked delay={16}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 156,
              lineHeight: 0.92,
              letterSpacing: "-0.065em",
              color: "transparent",
              WebkitTextStroke: `2px ${C.paper}`,
            }}
          >
            SOMETHING
          </div>
        </Masked>
        <Masked delay={24}>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              fontFamily: F.serif,
              fontStyle: "italic",
              fontSize: 236,
              lineHeight: 0.9,
              letterSpacing: "-0.055em",
              color: C.vermilion,
            }}
          >
            move.
            <div
              style={{
                position: "absolute",
                left: 6,
                bottom: 18,
                height: 9,
                width: `${underline * 86}%`,
                backgroundColor: C.vermilion,
              }}
            />
          </div>
        </Masked>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: interpolate(frame, [54, 76], [0, 1], CLAMP),
            transform: `translateY(${interpolate(frame, [54, 76], [14, 0], CLAMP)}px)`,
          }}
        >
          <span style={{ width: 56, height: 1, backgroundColor: hexToRgba(C.paper, 0.5) }} />
          <span
            style={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontSize: 28,
              color: hexToRgba(C.paper, 0.68),
            }}
          >
            Ten years. One obsession. Every frame earns its place.
          </span>
        </div>
      </div>

      {/* Resume card */}
      <ResumeCard start={32} />

      {/* Final lockup */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: lockOpacity * contentFade,
          transform: `translateY(${(1 - lockIn) * 46}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 760,
            height: 760,
            borderRadius: "50%",
            border: `1px dashed ${hexToRgba(C.paper, 0.16)}`,
            transform: `rotate(${ringRot}deg)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${hexToRgba(C.cobalt, 0.22)}, transparent 66%)`,
          }}
        />

        <div style={{ position: "relative" }}>
          <Mark size={158} color={C.paper} accent={C.vermilion} strokeWidth={5} />
        </div>

        <div style={{ overflow: "hidden", marginTop: 26 }}>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 148,
              lineHeight: 0.95,
              letterSpacing: "-0.065em",
              transform: `translateY(${(1 - lockIn) * 100}%)`,
            }}
          >
            NOVA REYES
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            width: 720 * lineGrow,
            height: 1,
            backgroundColor: hexToRgba(C.paper, 0.45),
          }}
        />

        <div
          style={{
            marginTop: 22,
            fontFamily: F.mono,
            fontSize: 12,
            letterSpacing: "0.3em",
            color: hexToRgba(C.paper, 0.75),
          }}
        >
          MOTION DESIGNER / ART DIRECTOR
        </div>

        <div
          style={{
            marginTop: 34,
            display: "flex",
            alignItems: "center",
            gap: 22,
            fontFamily: F.mono,
            fontSize: 12,
            letterSpacing: "0.16em",
            color: hexToRgba(C.paper, 0.85),
          }}
        >
          <span>HELLO@NOVAREYES.DESIGN</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: C.vermilion }} />
          <span>NOVAREYES.DESIGN</span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 120,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontSize: 24,
            color: hexToRgba(C.paper, 0.5),
            opacity: interpolate(frame, [156, 178], [0, 1], CLAMP),
          }}
        >
          Thank you for your time — let&apos;s make something move.
        </div>
      </div>

      {/* Fade to black, leaving one red registration dot */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: C.ink,
          opacity: interpolate(frame, [218, 236], [0, 1], CLAMP) * 0.7,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1009,
          top: 352,
          width: 13,
          height: 13,
          marginLeft: -6,
          marginTop: -6,
          borderRadius: "50%",
          backgroundColor: C.vermilion,
          opacity: dotIn * dotOut,
          transform: `scale(${interpolate(dotOut, [0, 1], [0.1, 1]) * (1 + Math.sin(frame * 0.2) * 0.08)})`,
          boxShadow: `0 0 28px ${hexToRgba(C.vermilion, 0.55)}`,
        }}
      />
    </div>
  );
};
