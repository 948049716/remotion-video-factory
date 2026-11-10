import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Asterisk, beatPulse, C, CLAMP, F, hexToRgba, range } from "../theme";

const ROLES = [
  { n: "01", label: "MOTION DESIGN" },
  { n: "02", label: "ART DIRECTION" },
  { n: "03", label: "3D & SPATIAL" },
  { n: "04", label: "CREATIVE CODE" },
];

const TICKER =
  "KINETIC TYPE ✳ BRAND SYSTEMS ✳ 3D & SPATIAL ✳ SOUND SYNC ✳ 60 FPS ✳ CODE-DRIVEN ✳";

const MaskLine: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  rotate?: number;
}> = ({ delay, children, style, rotate = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 110, mass: 0.9 },
  });
  const y = interpolate(s, [0, 1], [112, 0], CLAMP);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 10, ...style }}>
      <div
        style={{
          transform: `translateY(${y}%) rotate(${rotate}deg)`,
          transformOrigin: "left bottom",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Scene2Manifesto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeRole = Math.floor(frame / 52) % ROLES.length;
  const ruleGrow = interpolate(frame, [0, 26], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const underbar = interpolate(frame, [74, 96], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const fillVisible = interpolate(frame, [132, 168], [0, 100], {
    ...CLAMP,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const asteriskIn = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12, stiffness: 90, mass: 1 },
  });
  const orbit = (frame / 240) * Math.PI * 1.25 - Math.PI / 2;
  const wipe = interpolate(frame, [212, 238], [0, 1], {
    ...CLAMP,
    easing: Easing.bezier(0.76, 0, 0.24, 1),
  });
  const tickerX = -((frame * 6.2) % 2100);

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
      {/* Editorial margin texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 70% 20%, ${hexToRgba(C.white, 0.7)}, transparent 55%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -30,
          bottom: -150,
          fontFamily: F.display,
          fontSize: 640,
          lineHeight: 0.8,
          color: "transparent",
          WebkitTextStroke: `1.5px ${hexToRgba(C.ink, 0.075)}`,
          letterSpacing: "-0.05em",
        }}
      >
        01
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
          opacity: interpolate(frame, [0, 14], [0, 1], CLAMP),
        }}
      >
        <span>
          02 <span style={{ color: C.vermilion }}>/</span> MANIFESTO
        </span>
        <span style={{ opacity: 0.55 }}>NOVA REYES — MOTION DESIGNER</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 78,
          left: 64,
          width: `calc((100% - 128px) * ${ruleGrow})`,
          height: 1,
          backgroundColor: hexToRgba(C.ink, 0.35),
        }}
      />

      {/* Vertical folio */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: "50%",
          transform: "translateY(-50%) rotate(180deg)",
          writingMode: "vertical-rl",
          fontFamily: F.mono,
          fontSize: 9.5,
          letterSpacing: "0.4em",
          opacity: 0.45,
        }}
      >
        SELECTED WORK — VOL. 01 / 2026
      </div>

      {/* Main typographic statement */}
      <div
        style={{
          position: "absolute",
          left: 112,
          top: 194,
          width: 1300,
        }}
      >
        <MaskLine delay={0} style={{ marginBottom: -22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 34,
              fontFamily: F.display,
              fontSize: 214,
              lineHeight: 0.95,
              letterSpacing: "-0.065em",
            }}
          >
            DESIGN
            <span
              style={{
                fontFamily: F.serif,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 120,
                letterSpacing: "-0.03em",
                color: C.vermilion,
              }}
            >
              is
            </span>
          </div>
        </MaskLine>

        <MaskLine delay={10} rotate={-0.7} style={{ marginBottom: -10 }}>
          <div
            style={{
              position: "relative",
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 226,
              lineHeight: 0.98,
              letterSpacing: "-0.055em",
              color: C.cobalt,
              display: "inline-block",
            }}
          >
            thought,
            <div
              style={{
                position: "absolute",
                left: 4,
                bottom: 12,
                height: 10,
                width: `${underbar * 92}%`,
                backgroundColor: C.vermilion,
                opacity: 0.92,
              }}
            />
          </div>
        </MaskLine>

        <MaskLine delay={22}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 22,
              fontFamily: F.display,
              fontSize: 152,
              lineHeight: 1.02,
              letterSpacing: "-0.06em",
            }}
          >
            MADE
            <span style={{ position: "relative", display: "inline-block" }}>
              <span
                style={{
                  color: "transparent",
                  WebkitTextStroke: `2px ${C.ink}`,
                }}
              >
                VISIBLE.
              </span>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  color: C.ink,
                  clipPath: `inset(0 ${100 - fillVisible}% 0 0)`,
                }}
              >
                VISIBLE.
              </span>
            </span>
          </div>
        </MaskLine>

        {/* Supporting line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 30,
            opacity: interpolate(frame, [96, 122], [0, 1], CLAMP),
            transform: `translateY(${interpolate(frame, [96, 122], [14, 0], CLAMP)}px)`,
          }}
        >
          <div
            style={{
              width: 58,
              height: 2,
              backgroundColor: C.vermilion,
            }}
          />
          <div
            style={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontSize: 30,
              color: hexToRgba(C.ink, 0.72),
              letterSpacing: "0.01em",
            }}
          >
            Rhythm is how an idea earns its body.
          </div>
        </div>
      </div>

      {/* Right column — role index */}
      <div
        style={{
          position: "absolute",
          right: 92,
          top: 208,
          width: 372,
          opacity: interpolate(frame, [30, 54], [0, 1], CLAMP),
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: F.mono,
            fontSize: 10.5,
            letterSpacing: "0.24em",
            marginBottom: 18,
          }}
        >
          <span style={{ color: C.vermilion }}>WHAT I DO</span>
          <span style={{ opacity: 0.4 }}>01—04</span>
        </div>

        <div style={{ position: "relative", borderTop: `1px solid ${hexToRgba(C.ink, 0.25)}` }}>
          <div
            style={{
              position: "absolute",
              left: -14,
              top: 6 + activeRole * 52,
              width: 4,
              height: 40,
              backgroundColor: C.vermilion,
              transition: "none",
            }}
          />
          {ROLES.map((role, i) => (
            <div
              key={role.n}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                height: 52,
                paddingTop: 8,
                borderBottom: `1px solid ${hexToRgba(C.ink, 0.16)}`,
                opacity: activeRole === i ? 1 : 0.24,
                transform: `translateX(${activeRole === i ? 8 : 0}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  color: activeRole === i ? C.vermilion : C.ink,
                }}
              >
                {role.n}
              </span>
              <span
                style={{
                  fontFamily: F.display,
                  fontSize: 25,
                  letterSpacing: "-0.015em",
                }}
              >
                {role.label}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 32,
            fontFamily: F.serif,
            fontSize: 24,
            lineHeight: 1.42,
            color: hexToRgba(C.ink, 0.7),
            maxWidth: 340,
          }}
        >
          Ten years of turning strategy into motion — frame by frame, beat by
          beat.
        </div>
      </div>

      {/* Rotating asterisk + satellite */}
      <div
        style={{
          position: "absolute",
          left: 1544,
          top: 676,
          width: 210,
          height: 210,
          opacity: Math.max(0, Math.min(1, asteriskIn)),
          transform: `scale(${interpolate(asteriskIn, [0, 1], [0.4, 1]) * (1 + beatPulse(frame) * 0.025)})`,
        }}
      >
        <div style={{ position: "absolute", left: 5, top: 5 }}>
          <Asterisk
            size={200}
            color={C.cobalt}
            rotation={interpolate(frame, [0, 240], [-18, 42], CLAMP)}
            spokes={12}
            weight={14}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 105 + Math.cos(orbit) * 128 - 8,
            top: 105 + Math.sin(orbit) * 128 - 8,
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: C.vermilion,
          }}
        />
      </div>

      {/* Ticker */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 96,
          height: 64,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            height: "100%",
            backgroundColor: C.ink,
            color: C.paper,
            display: "flex",
            alignItems: "center",
            transform: `translateY(${interpolate(frame, [50, 78], [100, 0], CLAMP)}%)`,
          }}
        >
          <div
            style={{
              display: "flex",
              whiteSpace: "nowrap",
              transform: `translateX(${tickerX}px)`,
              fontFamily: F.mono,
              fontSize: 19,
              letterSpacing: "0.16em",
            }}
          >
            {range(3).map((i) => (
              <span key={i} style={{ paddingRight: 40 }}>
                {TICKER}
              </span>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 190,
              backgroundColor: C.vermilion,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.mono,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.24em",
              color: C.paper,
            }}
          >
            TOOLKIT
          </div>
        </div>
      </div>

      {/* Crop marks */}
      {[
        { left: 64, top: 124 },
        { right: 64, top: 124 },
      ].map((pos, i) => (
        <div key={i} style={{ position: "absolute", ...pos, width: 14, height: 14 }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 14, height: 1, backgroundColor: hexToRgba(C.ink, 0.4) }} />
          <div style={{ position: "absolute", top: 0, left: i === 0 ? 0 : undefined, right: i === 1 ? 0 : undefined, width: 1, height: 14, backgroundColor: hexToRgba(C.ink, 0.4) }} />
        </div>
      ))}

      {/* Wipe into Act III */}
      <div
        style={{
          position: "absolute",
          left: -40,
          top: 0,
          width: 2000,
          height: 1200,
          backgroundColor: C.cobalt,
          transform: `translateY(${(1 - wipe) * 1080}px)`,
          clipPath: "polygon(0 7%, 100% 0, 100% 100%, 0 100%)",
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
            opacity: 0.7,
          }}
        >
          03 — CAPABILITIES
        </div>
      </div>
    </div>
  );
};
