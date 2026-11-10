import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, CLAMP, F, hexToRgba, Mark, range } from "../theme";

const CUT = 30;

type WorkItem = {
  title: string;
  titleStyle: "display" | "serif";
  category: string;
  year: string;
  caption: string;
  bg: string;
  fg: string;
  accent: string;
};

const WORK: WorkItem[] = [
  {
    title: "Aura",
    titleStyle: "serif",
    category: "BRAND IDENTITY",
    year: "2025",
    caption: "IDENTITY SYSTEM / MOTION LANGUAGE",
    bg: C.vermilion,
    fg: C.paper,
    accent: C.acid,
  },
  {
    title: "Pulse",
    titleStyle: "display",
    category: "SOUND VISUALIZER",
    year: "2024",
    caption: "REALTIME AUDIO / WEBGL",
    bg: C.ink,
    fg: C.acid,
    accent: C.cyan,
  },
  {
    title: "Terra",
    titleStyle: "serif",
    category: "TITLE SEQUENCE",
    year: "2024",
    caption: "MAIN TITLES / 90 SECONDS",
    bg: C.paper,
    fg: C.ink,
    accent: C.cobalt,
  },
  {
    title: "Mono",
    titleStyle: "display",
    category: "TYPEFACE",
    year: "2023",
    caption: "9 WEIGHTS / 812 GLYPHS",
    bg: C.cobalt,
    fg: C.paper,
    accent: C.acid,
  },
  {
    title: "Orbit",
    titleStyle: "display",
    category: "3D LOOP",
    year: "2023",
    caption: "SEAMLESS LOOP / 12 SECONDS",
    bg: "#08080B",
    fg: "#FFD400",
    accent: C.vermilion,
  },
  {
    title: "Flux",
    titleStyle: "display",
    category: "CAMPAIGN",
    year: "2023",
    caption: "OOH / SOCIAL / MOTION TOOLKIT",
    bg: C.acid,
    fg: C.ink,
    accent: C.vermilion,
  },
  {
    title: "Kinetic",
    titleStyle: "display",
    category: "SPORTS IDENT",
    year: "2022",
    caption: "BROADCAST PACKAGE / 14 ASSETS",
    bg: C.vermilion,
    fg: C.ink,
    accent: C.paper,
  },
  {
    title: "Nova",
    titleStyle: "display",
    category: "THE REEL ITSELF",
    year: "2026",
    caption: "DESIGNED & ANIMATED IN CODE",
    bg: C.paper,
    fg: C.ink,
    accent: C.vermilion,
  },
];

const monoLabel = (color: string): React.CSSProperties => ({
  fontFamily: F.mono,
  fontSize: 10.5,
  letterSpacing: "0.22em",
  color,
});

interface MotifProps {
  local: number;
  item: WorkItem;
}

const AuraMotif: React.FC<MotifProps> = ({ local, item }) => {
  const spin = local * 2.2;
  return (
    <>
      {/* vertical rules */}
      {[1180, 1320, 1460, 1600, 1740].map((x, i) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x,
            top: 120,
            bottom: 120,
            width: 1,
            backgroundColor: hexToRgba(item.fg, 0.16),
            transform: `scaleY(${interpolate(local, [0, 10], [0, 1], CLAMP)})`,
            transformOrigin: "top",
            transition: "none",
            opacity: 0.9 - i * 0.1,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          right: 246,
          top: 260,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `repeating-conic-gradient(from ${spin}deg, ${hexToRgba(item.fg, 0.9)} 0deg 3.2deg, transparent 3.2deg 9deg)`,
          maskImage: "radial-gradient(circle, black 60%, transparent 62%)",
          WebkitMaskImage: "radial-gradient(circle, black 60%, transparent 62%)",
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 346,
          top: 360,
          width: 400,
          height: 400,
          borderRadius: "50%",
          backgroundColor: item.fg,
          transform: `scale(${1 + Math.sin(local * 0.4) * 0.015})`,
        }}
      />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            right: 296 - i * 50,
            top: 310 - i * 50,
            width: 500 + i * 100,
            height: 500 + i * 100,
            borderRadius: "50%",
            border: `1px solid ${hexToRgba(item.fg, 0.4 - i * 0.09)}`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          right: 886,
          top: 748,
          fontFamily: F.mono,
          fontSize: 10,
          letterSpacing: "0.3em",
          color: item.fg,
          opacity: 0.6,
        }}
      >
        RADIAL / SYSTEM
      </div>
      <div
        style={{
          position: "absolute",
          left: 420,
          top: 210,
          fontFamily: F.display,
          fontSize: 320,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `1.2px ${hexToRgba(item.fg, 0.2)}`,
        }}
      >
        A
      </div>
    </>
  );
};

const PulseMotif: React.FC<MotifProps> = ({ local, item }) => {
  const points = range(181)
    .map((i) => {
      const x = 260 + i * 8;
      const env = Math.sin((i / 180) * Math.PI);
      const y =
        528 +
        Math.sin(i * 0.11 + local * 0.45) *
          (16 + 78 * env * Math.abs(Math.sin(i * 0.043 + 0.6)));
      return `${x.toFixed(0)},${y.toFixed(0)}`;
    })
    .join(" ");
  const pulse = (local % 15) / 15;

  return (
    <>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            cx={960}
            cy={528}
            r={110 + i * 96 + pulse * 40}
            fill="none"
            stroke={hexToRgba(item.fg, 0.18 - i * 0.03 - pulse * 0.08)}
            strokeWidth={1.5}
          />
        ))}
        <polyline
          points={points}
          fill="none"
          stroke={item.accent}
          strokeWidth={5}
          opacity={0.22}
          transform="translate(0 12)"
        />
        <polyline
          points={points}
          fill="none"
          stroke={item.fg}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {range(3).map((i) => {
          const a = local * 0.16 + (i / 3) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={960 + Math.cos(a) * 430}
              cy={528 + Math.sin(a) * 250}
              r={5 + i * 2}
              fill={i === 0 ? C.vermilion : item.fg}
            />
          );
        })}
        <line x1={200} y1={528} x2={1720} y2={528} stroke={hexToRgba(item.fg, 0.2)} strokeWidth={1} />
      </svg>
      <div
        style={{
          position: "absolute",
          right: 88,
          top: 132,
          fontFamily: F.mono,
          fontSize: 10,
          letterSpacing: "0.24em",
          color: item.accent,
          opacity: 0.8,
        }}
      >
        {`GAIN ${(72 + Math.abs(Math.sin(local * 0.4)) * 24).toFixed(0)}dB`}
      </div>
      <div
        style={{
          position: "absolute",
          left: 88,
          top: 300,
          writingMode: "vertical-rl",
          ...monoLabel(hexToRgba(item.fg, 0.45)),
          transform: "rotate(180deg)",
        }}
      >
        FREQUENCY RESPONSE
      </div>
    </>
  );
};

const TerraMotif: React.FC<MotifProps> = ({ local, item }) => {
  const drift = local * 0.9;
  return (
    <>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hexToRgba(item.accent, 0.06)} />
            <stop offset="100%" stopColor={hexToRgba(item.accent, 0.16)} />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#sky)" />
        <circle cx={1370} cy={320} r={158} fill={item.accent} opacity={0.92} />
        <circle cx={1370} cy={320} r={196} fill="none" stroke={hexToRgba(item.accent, 0.4)} strokeWidth={1} />
        {range(14).map((i) => (
          <line
            key={i}
            x1={90}
            y1={140 + i * 20}
            x2={610}
            y2={140 + i * 20}
            stroke={hexToRgba(item.fg, 0.16)}
            strokeWidth={1}
          />
        ))}
        <polygon
          points="0,900 240,590 430,760 620,520 820,780 1010,610 1220,840 1440,600 1660,820 1920,650 1920,1080 0,1080"
          fill={hexToRgba(C.cobalt, 0.28)}
          transform={`translate(${-drift} 0)`}
        />
        <polygon
          points="0,980 300,760 500,880 720,690 940,900 1150,730 1380,930 1620,740 1820,900 1920,840 1920,1080 0,1080"
          fill={hexToRgba(item.fg, 0.82)}
          transform={`translate(${drift * 0.5} 0)`}
        />
        <polygon
          points="0,1080 0,940 250,860 520,980 780,880 1040,1000 1300,900 1580,1020 1800,930 1920,980 1920,1080"
          fill={C.vermilion}
          transform={`translate(${drift * 0.2} 0)`}
        />
        <path
          d="M90 200 H 780"
          stroke={hexToRgba(item.fg, 0.4)}
          strokeWidth={1}
        />
        <text
          x={90}
          y={186}
          fontFamily={F.mono}
          fontSize={11}
          letterSpacing="3"
          fill={hexToRgba(item.fg, 0.55)}
        >
          ELEVATION 4,206 M
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 238,
          fontFamily: F.serif,
          fontStyle: "italic",
          fontSize: 300,
          lineHeight: 0.9,
          letterSpacing: "-0.06em",
          color: item.fg,
          transform: `translateY(${interpolate(local, [0, 8], [50, 0], CLAMP)}px)`,
          opacity: interpolate(local, [0, 8], [0, 1], CLAMP),
        }}
      >
        Terra
      </div>
      <div
        style={{
          position: "absolute",
          left: 740,
          top: 470,
          ...monoLabel(item.fg),
          opacity: 0.6,
        }}
      >
        A FILM IN FOUR SEASONS
      </div>
    </>
  );
};

const MonoMotif: React.FC<MotifProps> = ({ local, item }) => {
  const shift = Math.sin(local * 0.3) * 26;
  return (
    <>
      {range(11).map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 160 + i * 160,
            top: 120,
            bottom: 120,
            width: 1,
            backgroundColor: hexToRgba(item.fg, 0.12),
          }}
        />
      ))}
      {range(6).map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 140 + i * 140,
            left: 120,
            right: 120,
            height: 1,
            backgroundColor: hexToRgba(item.fg, 0.1),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 600 + shift,
          top: 110,
          fontFamily: F.display,
          fontSize: 760,
          lineHeight: 0.9,
          color: item.fg,
          mixBlendMode: "difference",
        }}
      >
        M
      </div>
      <div
        style={{
          position: "absolute",
          left: 720 - shift,
          top: 150,
          fontFamily: F.serif,
          fontSize: 700,
          lineHeight: 0.9,
          color: item.accent,
          mixBlendMode: "difference",
        }}
      >
        M
      </div>
      <div
        style={{
          position: "absolute",
          right: 118,
          top: 150,
          fontFamily: F.mono,
          fontSize: 11,
          letterSpacing: "0.24em",
          color: item.fg,
          opacity: 0.65,
          textAlign: "right",
          lineHeight: 1.9,
        }}
      >
        <div>GROTESK</div>
        <div>012 / 9 WEIGHTS</div>
        <div style={{ color: item.accent }}>VARIABLE</div>
      </div>
    </>
  );
};

const OrbitMotif: React.FC<MotifProps> = ({ local, item }) => {
  const stars = range(70).map((i) => {
    const g = (n: number) => {
      const x = Math.sin(i * 91.7 + n * 47.3) * 43758.5453;
      return x - Math.floor(x);
    };
    return {
      x: 80 + g(1) * 1760,
      y: 70 + g(2) * 760,
      r: 0.6 + g(3) * 1.9,
      o: 0.25 + g(4) * 0.7,
    };
  });
  const a = local * 0.12;
  return (
    <>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={item.fg} opacity={s.o} />
        ))}
        <g transform="translate(1040 520) rotate(-16)">
          <ellipse rx={420} ry={116} fill="none" stroke={item.fg} strokeWidth={2} opacity={0.75} />
          <ellipse rx={520} ry={150} fill="none" stroke={item.fg} strokeWidth={1} opacity={0.25} />
          <ellipse rx={330} ry={86} fill="none" stroke={item.accent} strokeWidth={1} opacity={0.35} transform="rotate(8)" />
        </g>
        <circle cx={1040} cy={520} r={218} fill="#FFD400" />
        <circle cx={1040} cy={520} r={218} fill="url(#planetGrad)" opacity={0.55} />
        <defs>
          <radialGradient id="planetGrad" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFF1A8" />
            <stop offset="55%" stopColor="#FFC400" />
            <stop offset="100%" stopColor="#FF7A00" />
          </radialGradient>
        </defs>
        <circle cx={1040} cy={520} r={218} fill="url(#planetGrad)" />
        <circle
          cx={1040 + Math.cos(a) * 480}
          cy={520 + Math.sin(a) * 140}
          r={10}
          fill={C.paper}
        />
        <circle
          cx={1040 + Math.cos(a + 2.1) * 610}
          cy={520 + Math.sin(a + 2.1) * 176}
          r={5}
          fill={item.accent}
        />
        <g transform="translate(380 700)" opacity={0.5}>
          <circle r={120} fill="none" stroke={hexToRgba(item.fg, 0.4)} strokeWidth={1} strokeDasharray="2 8" />
          <circle r={92} fill="none" stroke={hexToRgba(item.fg, 0.25)} strokeWidth={1} />
          <text x={-36} y={4} fill={item.fg} fontFamily={F.mono} fontSize={11} letterSpacing="2">ORBIT</text>
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 118,
          top: 210,
          fontFamily: F.mono,
          fontSize: 10.5,
          letterSpacing: "0.3em",
          color: item.fg,
          opacity: 0.6,
          lineHeight: 2,
        }}
      >
        <div>SUN / 01</div>
        <div>RING SYSTEM 7.2°</div>
        <div style={{ color: item.accent }}>LOOP — SEAMLESS</div>
      </div>
    </>
  );
};

const FluxMotif: React.FC<MotifProps> = ({ local, item }) => {
  const drift = Math.sin(local * 0.32) * 34;
  return (
    <>
      <div
        style={{
          position: "absolute",
          right: 260 + drift,
          top: 300,
          width: 400,
          height: 400,
          borderRadius: 14,
          backgroundColor: item.fg,
          transform: `rotate(${-8 + local * 0.5}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 470 - drift,
          top: 420,
          width: 250,
          height: 250,
          borderRadius: "50%",
          backgroundColor: item.bg,
          border: `3px solid ${item.fg}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 240 - drift,
          top: 690,
          width: 150,
          height: 150,
          backgroundColor: item.accent,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 300,
          fontFamily: F.display,
          fontSize: 300,
          lineHeight: 0.86,
          letterSpacing: "-0.07em",
          color: item.fg,
        }}
      >
        FLUX
      </div>
      <div
        style={{
          position: "absolute",
          left: 164,
          top: 520,
          width: 720,
          height: 2,
          backgroundColor: item.fg,
          transform: `scaleX(${interpolate(local, [0, 9], [0, 1], CLAMP)})`,
          transformOrigin: "left",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 660,
          top: 330,
          fontFamily: F.display,
          fontSize: 300,
          lineHeight: 0.86,
          letterSpacing: "-0.07em",
          color: "transparent",
          WebkitTextStroke: `2px ${item.fg}`,
          transform: "translate(10px, 10px)",
          opacity: 0.4,
        }}
      >
        FLUX
      </div>
      <div
        style={{
          position: "absolute",
          left: 164,
          top: 560,
          ...monoLabel(item.fg),
          opacity: 0.65,
        }}
      >
        MOVE WITH THE CURRENT
      </div>
    </>
  );
};

const KineticMotif: React.FC<MotifProps> = ({ local, item }) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: -200,
          background: `repeating-linear-gradient(118deg, ${hexToRgba(item.fg, 0.9)} 0 16px, transparent 16px 84px)`,
          transform: `translateX(${local * 9}px)`,
          opacity: 0.16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 160,
          fontFamily: F.display,
          fontSize: 292,
          lineHeight: 0.86,
          letterSpacing: "-0.075em",
          color: item.fg,
          transform: "skewX(-9deg)",
          whiteSpace: "nowrap",
        }}
      >
        KINETIC
      </div>
      <div
        style={{
          position: "absolute",
          left: 86,
          top: 178,
          fontFamily: F.display,
          fontSize: 292,
          lineHeight: 0.86,
          letterSpacing: "-0.075em",
          color: "transparent",
          WebkitTextStroke: `2px ${hexToRgba(item.fg, 0.55)}`,
          transform: "skewX(-9deg)",
          whiteSpace: "nowrap",
        }}
      >
        KINETIC
      </div>
      <div
        style={{
          position: "absolute",
          right: 150,
          bottom: 210,
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: `3px solid ${item.fg}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 240,
          bottom: 300,
          width: 140,
          height: 140,
          borderRadius: "50%",
          backgroundColor: item.accent,
          transform: `translate(${Math.sin(local * 0.4) * 18}px, ${Math.cos(local * 0.33) * 14}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 512,
          fontFamily: F.mono,
          fontSize: 11,
          letterSpacing: "0.3em",
          color: item.fg,
          opacity: 0.7,
        }}
      >
        FAST / LOUD / UNMISSABLE
      </div>
    </>
  );
};

const NovaMotif: React.FC<MotifProps> = ({ local, item }) => {
  const pulse = 1 + Math.sin(local * 0.4) * 0.02;
  return (
    <>
      <div
        style={{
          position: "absolute",
          right: 240,
          top: 160,
          width: 620,
          height: 620,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pulse})`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 360 + i * 130,
              height: 360 + i * 130,
              borderRadius: "50%",
              border: `1px solid ${hexToRgba(item.fg, 0.22 - i * 0.05)}`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            width: 358,
            height: 358,
            borderRadius: "50%",
            backgroundColor: item.accent,
          }}
        />
        <div style={{ position: "relative" }}>
          <Mark size={230} color={item.fg} accent={item.bg} strokeWidth={4.5} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 186,
          fontFamily: F.mono,
          fontSize: 11,
          letterSpacing: "0.26em",
          color: item.fg,
          opacity: 0.55,
          lineHeight: 2,
        }}
      >
        <div>REEL / 2026</div>
        <div>DIRECTED, DESIGNED</div>
        <div>&amp; ANIMATED BY</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 350,
          fontFamily: F.display,
          fontSize: 250,
          lineHeight: 0.9,
          letterSpacing: "-0.065em",
          color: item.fg,
        }}
      >
        NOVA
        <br />
        REYES
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 720,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: F.mono,
          fontSize: 10.5,
          letterSpacing: "0.22em",
          color: item.fg,
          opacity: 0.7,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            backgroundColor: item.accent,
          }}
        />
        MOTION DESIGNER — LONDON / EVERYWHERE
      </div>
    </>
  );
};

const MOTIFS = [
  AuraMotif,
  PulseMotif,
  TerraMotif,
  MonoMotif,
  OrbitMotif,
  FluxMotif,
  KineticMotif,
  NovaMotif,
];

export const Scene6Work: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const index = Math.min(7, Math.floor(frame / CUT));
  const local = frame - index * CUT;
  const item = WORK[index];
  const Motif = MOTIFS[index];

  const enter = spring({
    frame: local,
    fps,
    config: { damping: 20, stiffness: 260, mass: 0.5 },
  });
  const scale = interpolate(enter, [0, 1], [1.06, 1], CLAMP);
  const rotate = interpolate(enter, [0, 1], [0.6, 0], CLAMP);
  const cutFlash = interpolate(local, [0, 1, 4], [0.5, 0.22, 0], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: item.bg,
        color: item.fg,
        overflow: "hidden",
        fontFamily: F.sans,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${scale}) rotate(${rotate}deg)`,
        }}
      >
        <Motif local={local} item={item} />

        {/* Poster frame */}
        <div
          style={{
            position: "absolute",
            inset: 40,
            border: `1px solid ${hexToRgba(item.fg, 0.3)}`,
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            position: "absolute",
            top: 62,
            left: 76,
            right: 76,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            ...monoLabel(item.fg),
            opacity: 0.7,
          }}
        >
          <span>
            06 / SELECTED WORK <span style={{ opacity: 0.6 }}>— {String(index + 1).padStart(2, "0")} OF 08</span>
          </span>
          <span>
            {item.year} <span style={{ opacity: 0.5 }}>/</span> {item.category}
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            left: 84,
            bottom: 78,
            right: 84,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: item.titleStyle === "serif" ? F.serif : F.display,
                fontStyle: item.titleStyle === "serif" ? "italic" : "normal",
                fontSize: item.titleStyle === "serif" ? 188 : 152,
                lineHeight: 0.9,
                letterSpacing: "-0.055em",
                color: item.fg,
              }}
            >
              {item.title}
              {item.titleStyle === "display" && (
                <span style={{ color: item.accent }}>.</span>
              )}
            </div>
            <div
              style={{
                marginTop: 14,
                ...monoLabel(hexToRgba(item.fg, 0.55)),
              }}
            >
              {item.caption}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", gap: 5 }}>
              {range(8).map((i) => (
                <div
                  key={i}
                  style={{
                    width: 24,
                    height: 3,
                    backgroundColor: i === index ? item.fg : hexToRgba(item.fg, 0.22),
                  }}
                />
              ))}
            </div>
            <div style={monoLabel(hexToRgba(item.fg, 0.5))}>
              {String(local).padStart(2, "0")}F / 0.5S
            </div>
          </div>
        </div>

        {/* Corner ticks */}
        {[
          { left: 40, top: 40, borderLeft: true, borderTop: true },
          { right: 40, top: 40, borderRight: true, borderTop: true },
          { left: 40, bottom: 40, borderLeft: true, borderBottom: true },
          { right: 40, bottom: 40, borderRight: true, borderBottom: true },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 18,
              height: 18,
              borderLeft: p.borderLeft ? `1px solid ${item.fg}` : undefined,
              borderRight: p.borderRight ? `1px solid ${item.fg}` : undefined,
              borderTop: p.borderTop ? `1px solid ${item.fg}` : undefined,
              borderBottom: p.borderBottom ? `1px solid ${item.fg}` : undefined,
              left: p.left,
              right: p.right,
              top: p.top,
              bottom: p.bottom,
              opacity: 0.5,
            }}
          />
        ))}
      </div>

      {/* Cut flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: item.bg === C.paper ? C.ink : C.white,
          opacity: cutFlash,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
