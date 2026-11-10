import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ACCENT,
  BigNumber,
  Callout,
  Campfire,
  ChapterCard,
  CLAMP,
  Climber,
  Gauge,
  Headline,
  HeatWave,
  MONO,
  Motes,
  Mountains,
  pop,
  Scene,
  seg,
  Sky,
  Sun,
  Tag,
  Thermometer,
} from "./primitives";

const at = (p: number, dur: number) => Math.round(p * dur);

const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  accent?: string;
}> = ({ style, children, accent = ACCENT.ice }) => (
  <div
    style={{
      position: "absolute",
      backgroundColor: "rgba(9,17,31,0.62)",
      border: `1px solid ${accent}30`,
      borderRadius: 26,
      boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

const MiniSun: React.FC<{ size?: number }> = ({ size = 46 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ overflow: "visible" }}>
    <circle cx={24} cy={24} r={11} fill={ACCENT.sun} />
    {new Array(10).fill(0).map((_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return (
        <line
          key={i}
          x1={24 + Math.cos(a) * 15}
          y1={24 + Math.sin(a) * 15}
          x2={24 + Math.cos(a) * 20}
          y2={24 + Math.sin(a) * 20}
          stroke={ACCENT.sun}
          strokeWidth={2.6}
          strokeLinecap="round"
          opacity={0.85}
        />
      );
    })}
  </svg>
);

const MiniFlame: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path
      d="M24 4 C30 16 38 20 38 30 A14 14 0 0 1 10 30 C10 22 16 18 18 10 C20 16 22 18 24 20 C26 14 26 10 24 4 Z"
      fill={ACCENT.ember}
      opacity={0.9}
    />
    <path
      d="M24 20 C27 26 31 28 31 33 A7 7 0 0 1 17 33 C17 28 21 26 24 20 Z"
      fill="#FFD9A0"
      opacity={0.9}
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/* 1 · Hook — summer trailhead, sweaty short sleeves                   */
/* ------------------------------------------------------------------ */
const PINES = [
  { x: 236, h: 178 },
  { x: 330, h: 136 },
  { x: 438, h: 108 },
  { x: 508, h: 82 },
];

const Pine: React.FC<{ x: number; h: number; sway: number; opacity?: number }> = ({ x, h, sway, opacity = 1 }) => (
  <svg
    width={h * 0.62}
    height={h}
    viewBox="0 0 100 160"
    style={{
      position: "absolute",
      left: x - h * 0.31,
      top: 900 - h,
      transform: `rotate(${sway}deg)`,
      transformOrigin: "50% 100%",
      opacity,
      overflow: "visible",
    }}
  >
    <path
      d="M50 0 L74 46 L60 43 L84 92 L64 87 L94 148 L6 148 L36 87 L16 92 L40 43 L26 46 Z"
      fill="#0A1120"
      stroke={ACCENT.warm}
      strokeWidth={1.6}
      strokeOpacity={0.22}
      strokeLinejoin="round"
    />
    <rect x={45} y={142} width={10} height={18} fill="#0A1120" />
  </svg>
);

export const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = pop(frame, fps, 4);
  const titleOut = seg(frame, at(0.62, dur), at(0.74, dur), 1, 0);
  const tagIn = pop(frame, fps, at(0.4, dur));
  const signIn = pop(frame, fps, at(0.22, dur));
  const sweat = new Array(5).fill(0).map((_, i) => {
    const t = (frame * 1.6 + i * 26) % 70;
    return { x: 596 + i * 16 + Math.sin((frame + i * 30) / 20) * 3, y: 788 + t * 1.4, o: 1 - t / 70 };
  });
  const snowGlint = 0.55 + 0.45 * Math.sin(frame / 14);
  return (
    <Scene dur={dur}>
      <Sky top="#0A1026" mid="#1C2C4C" bottom="#55301F" stars={40} nebula={ACCENT.warm} seed={11} />
      <Sun x={1700} y={250} r={104} glow={1.15} rays color={ACCENT.sun} />

      {/* mountain massif: the foot of the range fills the foreground */}
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="hook-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#243352" />
            <stop offset="100%" stopColor="#101B2E" />
          </linearGradient>
          <linearGradient id="hook-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D2C46" />
            <stop offset="100%" stopColor="#0D1626" />
          </linearGradient>
          <linearGradient id="hook-main" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B2A33" />
            <stop offset="42%" stopColor="#1B2236" />
            <stop offset="100%" stopColor="#0A1220" />
          </linearGradient>
          <linearGradient id="hook-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#221820" />
            <stop offset="100%" stopColor="#05080F" />
          </linearGradient>
          <linearGradient id="hook-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#04070F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#04070F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* far ridge, left */}
        <path
          d="M0 905 L90 798 L200 858 L320 736 L430 818 L540 716 L652 818 L748 905 Z"
          fill="url(#hook-far)"
          opacity={0.55}
        />
        {/* mid ridge, right */}
        <path
          d="M760 905 L900 700 L1000 782 L1110 660 L1222 760 L1330 640 L1450 760 L1600 680 L1720 780 L1840 700 L1920 762 L1920 905 Z"
          fill="url(#hook-mid)"
          opacity={0.75}
        />
        {/* the peak that towers over the trailhead */}
        <path
          d="M640 905 L760 800 L850 720 L940 640 L1030 560 L1110 470 L1190 380 L1270 300 L1330 220 L1380 150 L1430 240 L1500 350 L1580 460 L1660 560 L1750 670 L1850 780 L1920 842 L1920 905 Z"
          fill="url(#hook-main)"
        />
        {/* shaded left face, away from the low sun */}
        <path
          d="M640 905 L760 800 L850 720 L940 640 L1030 560 L1110 470 L1190 380 L1270 300 L1330 220 L1380 150 L1380 905 Z"
          fill="url(#hook-side)"
        />
        {/* gullies cut into the face */}
        <path d="M1270 300 L1186 432 L1168 618 L1212 780" fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.055} />
        <path d="M1190 380 L1082 522 L1064 700" fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.05} />
        <path d="M1110 470 L992 622 L978 782" fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.04} />
        <path d="M1030 560 L918 700 L908 820" fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.035} />
        {/* cool edge to carve the silhouette out of the night sky */}
        <path
          d="M640 905 L760 800 L850 720 L940 640 L1030 560 L1110 470 L1190 380 L1270 300 L1330 220 L1380 150"
          fill="none"
          stroke="#8FD8FF"
          strokeWidth={2.2}
          strokeLinejoin="round"
          opacity={0.2}
        />
        {/* sun-side rim light along the crest */}
        <path
          d="M1380 150 L1430 240 L1500 350 L1580 460 L1660 560 L1750 670 L1850 780 L1920 842"
          fill="none"
          stroke={ACCENT.warm}
          strokeWidth={3.2}
          strokeLinecap="round"
          opacity={0.5}
          style={{ filter: "drop-shadow(0 0 10px rgba(255,179,71,0.45))" }}
        />
        {/* snow cap — the cold waiting up there */}
        <path
          d="M1330 220 L1380 150 L1430 240 L1410 232 L1396 258 L1380 236 L1362 258 L1348 230 Z"
          fill="#EFF8FF"
          opacity={0.9 + snowGlint * 0.1}
        />
        <circle cx={1378} cy={204} r={3.4} fill="#FFFFFF" opacity={0.25 + snowGlint * 0.5} />
        {/* summit flag */}
        <g transform="translate(1380 150)">
          <line x1={0} y1={0} x2={0} y2={-36} stroke={ACCENT.sun} strokeWidth={3} opacity={0.85} />
          <path
            d={`M0 -36 L${26 + Math.sin(frame / 6) * 4} -28 L0 -18 Z`}
            fill={ACCENT.ember}
            opacity={0.9}
          />
        </g>
        {/* switchback trail from the trailhead to the summit */}
        <path
          d="M806 902 L900 848 L862 810 L970 745 L930 710 L1050 640 L1010 608 L1140 520 L1105 492 L1230 400 L1200 375 L1315 280 L1352 214"
          fill="none"
          stroke="#FFCF8A"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="18 14"
          strokeDashoffset={-frame * 1.1}
          opacity={0.62}
          style={{ filter: "drop-shadow(0 0 6px rgba(255,179,71,0.5))" }}
        />
        {/* trailhead dot */}
        <circle cx={806} cy={902} r={7} fill={ACCENT.warm} opacity={0.9} />
        <circle cx={806} cy={902} r={13} fill="none" stroke={ACCENT.warm} strokeWidth={2} opacity={0.35} />
        {/* ground */}
        <path d="M0 898 L1920 898 L1920 1080 L0 1080 Z" fill="url(#hook-ground)" />
        <path d="M0 898 L1920 898" stroke={ACCENT.ember} strokeWidth={2} opacity={0.4} />
      </svg>

      {/* warm haze above the trail */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 420,
          background: `radial-gradient(70% 100% at 42% 100%, ${ACCENT.ember}30 0%, transparent 70%)`,
        }}
      />
      <Motes count={26} seed={4} color={ACCENT.warm} rise={1.1} size={3} opacity={0.35} />
      {PINES.map((p, i) => (
        <Pine key={i} x={p.x} h={p.h} sway={Math.sin(frame / 55 + i * 1.4) * 0.8} opacity={0.95 - i * 0.06} />
      ))}
      <div
        style={{
          position: "absolute",
          left: 566,
          top: 930,
          width: 108,
          height: 18,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.42)",
          filter: "blur(4px)",
        }}
      />
      <Climber x={620} y={948} scale={1.5} mode="hot" walk />
      {sweat.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: 5,
            height: 9,
            borderRadius: "50% 50% 60% 60%",
            backgroundColor: ACCENT.ice,
            opacity: s.o * 0.8,
          }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <HeatWave
          key={i}
          x={392 + i * 66}
          y={862 + i * 13}
          w={214}
          amp={5}
          thickness={3}
          phase={i * 2.1}
          opacity={0.16}
        />
      ))}

      {/* trailhead signpost, planted at the foot of the mountain */}
      <div
        style={{
          position: "absolute",
          left: 806,
          top: 700,
          opacity: signIn,
          transform: `translateY(${(1 - signIn) * 26}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 6,
            width: 4,
            height: 196,
            borderRadius: 2,
            background: "linear-gradient(180deg, #FFC46B 0%, #A06A32 55%, #4A341F 100%)",
            boxShadow: `0 0 14px ${ACCENT.warm}33`,
          }}
        />
        <div style={{ position: "relative", marginLeft: 24 }}>
          <div
            style={{
              display: "inline-block",
              padding: "12px 20px 13px",
              borderRadius: 14,
              backgroundColor: "rgba(8,14,24,0.9)",
              border: `1.5px solid ${ACCENT.warm}66`,
              boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.3em", color: ACCENT.warm }}>TRAILHEAD</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 3, letterSpacing: "0.06em" }}>登山口</div>
          </div>
          <div style={{ marginTop: 10 }}>
            <span
              style={{
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: 999,
                backgroundColor: ACCENT.warm,
                color: "#1A0F05",
                fontFamily: MONO,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "0.08em",
                boxShadow: `0 0 24px ${ACCENT.warm}55`,
              }}
            >
              海拔 0 m
            </span>
          </div>
        </div>
      </div>

      {/* title, left aligned to let the mountain breathe */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 150,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          opacity: titleIn * titleOut,
          transform: `translateY(${(1 - titleIn) * 40}px) scale(${0.96 + 0.04 * titleIn})`,
          transformOrigin: "0% 50%",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22,
            letterSpacing: "0.5em",
            color: ACCENT.warm,
            marginBottom: 24,
            opacity: 0.9,
          }}
        >
          A 6-MINUTE CLIMATE MYSTERY
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 126, fontWeight: 900, letterSpacing: "0.03em" }}>
          <span>高处不胜</span>
          <span style={{ color: ACCENT.ice, textShadow: `0 0 60px ${ACCENT.ice}66` }}>寒</span>
          <span style={{ fontSize: 54, fontWeight: 700, opacity: 0.75, marginLeft: 18 }}>的真相</span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: MONO,
            fontSize: 24,
            letterSpacing: "0.24em",
            color: "rgba(235,243,255,0.6)",
          }}
        >
          WHY IS IT COLDER UP HIGH?
        </div>
      </div>

      {/* temp tags */}
      <div style={{ position: "absolute", left: 120, bottom: 168, opacity: tagIn, transform: `translateY(${(1 - tagIn) * 20}px)` }}>
        <Tag color={ACCENT.warm} size={24} solid>
          山脚 · 35°C
        </Tag>
        <span style={{ marginLeft: 14 }}>
          <Tag color="rgba(255,255,255,0.7)" size={20}>短袖 · 汗流浃背</Tag>
        </span>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 2 · Hook peak — freezing summit, rented army coat                   */
/* ------------------------------------------------------------------ */
export const HookPeak: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const coatIn = pop(frame, fps, at(0.38, dur));
  const signIn = pop(frame, fps, at(0.55, dur));
  const flagWave = Math.sin(frame / 6) * 5;
  const breath = new Array(4).fill(0).map((_, i) => {
    const t = ((frame + i * 22) % 88) / 88;
    return { t, key: i };
  });
  const gusts = new Array(4).fill(0).map((_, i) => {
    const p = ((frame * 2 + i * 60) % 260) / 260;
    return { p, y: 260 + i * 132, key: i };
  });
  const mist = [
    { x: -200, y: 800, w: 720, h: 180, o: 0.4, sp: 0.0019 },
    { x: 420, y: 812, w: 780, h: 190, o: 0.46, sp: 0.0015 },
    { x: 1120, y: 806, w: 740, h: 180, o: 0.44, sp: 0.0021 },
    { x: 1560, y: 818, w: 660, h: 170, o: 0.38, sp: 0.0017 },
  ];
  return (
    <Scene dur={dur}>
      <Sky top="#01030A" mid="#081426" bottom="#123049" stars={90} nebula={ACCENT.ice} seed={21} />
      <Sun x={1660} y={170} r={64} glow={0.9} color="#FFE8B0" />

      {/* everything below the crest: distant ranges and a sea of clouds */}
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sum-dist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B7793" />
            <stop offset="100%" stopColor="#2B455C" />
          </linearGradient>
          <linearGradient id="sum-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22304A" />
            <stop offset="52%" stopColor="#0D1728" />
            <stop offset="100%" stopColor="#04070E" />
          </linearGradient>
        </defs>
        {/* distant peaks, far below the summit */}
        <path d="M0 904 L70 848 L140 880 L220 828 L300 884 L380 904 Z" fill="url(#sum-dist)" opacity={0.6} />
        <path d="M190 842 L220 828 L250 842 L240 837 L228 848 L214 837 Z" fill="#DCEFFF" opacity={0.5} />
        <path d="M260 904 L340 858 L420 904 Z" fill="#2E4A64" opacity={0.55} />
        <path d="M1500 904 L1580 852 L1660 884 L1740 836 L1820 886 L1880 862 L1920 884 L1920 906 L1500 906 Z" fill="url(#sum-dist)" opacity={0.6} />
        <path d="M1710 850 L1740 836 L1770 850 L1760 845 L1748 856 L1734 845 Z" fill="#DCEFFF" opacity={0.5} />
        <path d="M1560 904 L1630 866 L1700 904 Z" fill="#2E4A64" opacity={0.5} />
      </svg>

      {/* sea of clouds, far below the summit */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 740,
          width: 1920,
          height: 180,
          background:
            "linear-gradient(180deg, rgba(236,248,255,0) 0%, rgba(236,248,255,0.22) 62%, rgba(226,242,255,0.46) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1180,
          top: 770,
          width: 860,
          height: 280,
          background: "radial-gradient(50% 50% at 50% 50%, rgba(255,212,148,0.26) 0%, transparent 70%)",
        }}
      />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sea-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D6EBFA" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8DB4D4" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="sea-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FDFF" />
            <stop offset="22%" stopColor="#E3F1FC" />
            <stop offset="58%" stopColor="#B4D3EA" />
            <stop offset="100%" stopColor="#769FBE" />
          </linearGradient>
        </defs>
        {/* distant cloud row */}
        <path
          d="M0 862 C40 850 90 842 140 848 C190 854 220 868 270 864 C320 860 350 844 400 846 C450 848 480 866 530 862 C580 858 610 840 660 842 C710 844 740 864 790 862 C840 860 870 846 920 848 C970 850 1000 868 1050 864 C1100 860 1130 842 1180 844 C1230 846 1260 864 1310 860 C1360 856 1390 840 1440 842 C1490 844 1520 862 1570 858 C1620 854 1650 838 1700 840 C1750 842 1780 860 1830 856 C1870 852 1890 842 1920 846 L1920 1080 L0 1080 Z"
          fill="url(#sea-back)"
        />
        {/* main cumulus sea */}
        <path
          d="M0 892 C50 876 110 864 170 870 C230 876 260 894 320 890 C380 886 410 868 470 870 C530 872 560 894 620 890 C680 886 710 866 770 868 C830 870 860 892 920 888 C980 884 1010 864 1070 866 C1130 868 1160 890 1220 886 C1280 882 1310 862 1370 864 C1430 866 1460 888 1520 884 C1580 880 1610 860 1670 862 C1730 864 1760 886 1820 882 C1870 878 1900 866 1920 870 L1920 1080 L0 1080 Z"
          fill="url(#sea-front)"
        />
        <path
          d="M0 892 C50 876 110 864 170 870 C230 876 260 894 320 890 C380 886 410 868 470 870 C530 872 560 894 620 890 C680 886 710 866 770 868 C830 870 860 892 920 888 C980 884 1010 864 1070 866 C1130 868 1160 890 1220 886 C1280 882 1310 862 1370 864 C1430 866 1460 888 1520 884 C1580 880 1610 860 1670 862 C1730 864 1760 886 1820 882 C1870 878 1900 866 1920 870"
          fill="none"
          stroke="#8FB3CC"
          strokeWidth={9}
          opacity={0.32}
          transform="translate(0 7)"
        />
        <path
          d="M0 892 C50 876 110 864 170 870 C230 876 260 894 320 890 C380 886 410 868 470 870 C530 872 560 894 620 890 C680 886 710 866 770 868 C830 870 860 892 920 888 C980 884 1010 864 1070 866 C1130 868 1160 890 1220 886 C1280 882 1310 862 1370 864 C1430 866 1460 888 1520 884 C1580 880 1610 860 1670 862 C1730 864 1760 886 1820 882 C1870 878 1900 866 1920 870"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.6}
          opacity={0.7}
        />
      </svg>
      {/* warm light grazing the cloud tops */}
      <div
        style={{
          position: "absolute",
          left: 1200,
          top: 820,
          width: 760,
          height: 200,
          background: "radial-gradient(50% 50% at 50% 50%, rgba(255,214,150,0.3) 0%, transparent 70%)",
        }}
      />
      {/* wisps floating above the sea line */}
      {mist.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: c.x + Math.sin(frame * c.sp) * 16,
            top: c.y,
            width: c.w,
            height: c.h,
            background:
              "radial-gradient(50% 55% at 50% 30%, rgba(252,254,255,0.85) 0%, rgba(224,241,255,0.5) 40%, transparent 72%)",
            opacity: c.o,
            pointerEvents: "none",
          }}
        />
      ))}
      {/* cloud texture streaks */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 80 + i * 64 + Math.sin(frame * 0.004 + i * 2) * 26,
            top: 844 + i * 28,
            width: 1560 - i * 140,
            height: 2,
            background: `linear-gradient(90deg, transparent, rgba(236,247,255,${0.55 - i * 0.09}), transparent)`,
          }}
        />
      ))}

      {/* the summit itself, piercing the cloud sea */}
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sum-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#243550" />
            <stop offset="52%" stopColor="#0E1929" />
            <stop offset="100%" stopColor="#04070E" />
          </linearGradient>
          <linearGradient id="sum-face" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#8FB0CE" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#406080" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1B2A3E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M280 1080 L430 982 L520 1000 L612 902 L700 932 L788 842 L846 782 L888 730 L918 704 L946 692 L1064 692 L1100 704 L1142 742 L1206 806 L1276 880 L1356 946 L1466 1022 L1584 1080 Z"
          fill="url(#sum-cone)"
        />
        {/* sunlit right face */}
        <path
          d="M1010 692 L1064 692 L1100 704 L1142 742 L1206 806 L1276 880 L1356 946 L1466 1022 L1584 1080 L1140 1080 Z"
          fill="url(#sum-face)"
        />
        {/* rock ribs */}
        <path
          d="M946 692 L918 704 L888 730 L846 782 L788 842 L700 932 M1064 692 L1100 704 L1142 742 L1206 806 L1276 880 L1356 946"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2}
          opacity={0.09}
        />
        <path
          d="M742 912 L806 1080 M846 800 L830 1080 M1120 770 L1160 1080 M1214 850 L1278 1080"
          stroke="#FFFFFF"
          strokeWidth={2}
          opacity={0.055}
        />
        {/* snow crest on the summit plateau */}
        <path d="M946 692 L1064 692 L1044 680 L1006 676 L966 680 Z" fill="#EFF8FF" opacity={0.95} />
        <path d="M960 694 L934 806 L968 754" fill="none" stroke="#DFF1FF" strokeWidth={3.4} strokeLinejoin="round" opacity={0.5} />
        <path d="M1006 700 L1022 836 L1054 792" fill="none" stroke="#DFF1FF" strokeWidth={2.8} strokeLinejoin="round" opacity={0.42} />
        <path d="M1062 710 L1104 858 L1132 818" fill="none" stroke="#DFF1FF" strokeWidth={2.2} strokeLinejoin="round" opacity={0.3} />
        <ellipse cx={890} cy={796} rx={24} ry={8} fill="#DFF1FF" opacity={0.16} />
        <ellipse cx={1120} cy={812} rx={20} ry={7} fill="#DFF1FF" opacity={0.12} />
        {/* rim light: warm on the sun side, cold on the shadow side */}
        <path
          d="M946 692 L1064 692 L1100 704 L1142 742 L1206 806 L1276 880 L1356 946 L1466 1022 L1584 1080"
          fill="none"
          stroke={ACCENT.warm}
          strokeWidth={2.8}
          strokeLinejoin="round"
          opacity={0.5}
          style={{ filter: "drop-shadow(0 0 10px rgba(255,179,71,0.45))" }}
        />
        <path
          d="M946 692 L918 704 L888 730 L846 782 L788 842 L700 932 L612 902 L520 1000 L430 982 L280 1080"
          fill="none"
          stroke="#8FD8FF"
          strokeWidth={2.2}
          strokeLinejoin="round"
          opacity={0.26}
        />
        {/* cairn */}
        <g>
          <ellipse cx={1146} cy={806} rx={24} ry={11} fill="#101A28" stroke="#6E8CA8" strokeWidth={1.4} opacity={0.95} />
          <ellipse cx={1142} cy={788} rx={17} ry={8} fill="#0E1826" stroke="#6E8CA8" strokeWidth={1.3} opacity={0.95} />
          <ellipse cx={1148} cy={773} rx={10} ry={5.5} fill="#0C1522" stroke="#6E8CA8" strokeWidth={1.1} opacity={0.95} />
          <ellipse cx={1142} cy={783} rx={13} ry={3.2} fill="#DFF1FF" opacity={0.6} />
          <ellipse cx={1147} cy={768} rx={7} ry={2.4} fill="#DFF1FF" opacity={0.5} />
        </g>
        {/* summit flag, same pennant as seen from the trailhead */}
        <line x1={926} y1={694} x2={926} y2={562} stroke={ACCENT.sun} strokeWidth={4.5} strokeLinecap="round" />
        <path
          d={`M927 566 L${982 + flagWave} 580 L927 597 Z`}
          fill={ACCENT.ember}
          stroke={ACCENT.sun}
          strokeWidth={1.2}
          strokeOpacity={0.5}
        />
      </svg>

      {/* foreground mist so the summit rises out of the cloud sea */}
      {[
        { x: -300, y: 992, w: 1240, h: 210, o: 0.72 },
        { x: 340, y: 1026, w: 1460, h: 200, o: 0.78 },
        { x: 1060, y: 998, w: 1280, h: 210, o: 0.68 },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: c.x + Math.sin(frame * 0.0018 + i * 2) * 14,
            top: c.y,
            width: c.w,
            height: c.h,
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(244,251,255,0.9) 0%, rgba(200,226,250,0.5) 40%, transparent 72%)",
            opacity: c.o,
            pointerEvents: "none",
          }}
        />
      ))}

      <Motes count={70} seed={9} color="#CFF3FF" rise={-0.9} size={3.4} opacity={0.5} area={{ x: 0, y: 0, w: 1920, h: 860 }} />
      {gusts.map((g) => (
        <div
          key={g.key}
          style={{
            position: "absolute",
            left: -400 + g.p * 2600,
            top: g.y,
            width: 380,
            height: 2.5,
            background: `linear-gradient(90deg, transparent, rgba(207,243,255,${0.5 * Math.sin(g.p * Math.PI)}), transparent)`,
            borderRadius: 2,
          }}
        />
      ))}

      {/* summit plate on the flagpole */}
      <div
        style={{
          position: "absolute",
          left: 738,
          top: 600,
          padding: "7px 13px",
          borderRadius: 8,
          backgroundColor: "rgba(6,12,22,0.88)",
          border: `1px solid ${ACCENT.sun}66`,
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: "0.18em",
          color: ACCENT.sun,
          whiteSpace: "nowrap",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        SUMMIT · 山顶
      </div>

      {/* the climber, standing on the snow-capped plateau */}
      <div
        style={{
          position: "absolute",
          left: 996,
          top: 692,
          width: 92,
          height: 16,
          borderRadius: "50%",
          background: "rgba(2,6,12,0.5)",
          filter: "blur(3px)",
        }}
      />
      <Climber x={1042} y={702} scale={1.12} mode={coatIn > 0.5 ? "coat" : "cold"} />
      {breath.map((b) => (
        <div
          key={b.key}
          style={{
            position: "absolute",
            left: 1056 + b.t * 62,
            top: 566 - b.t * 36,
            width: 10 + b.t * 28,
            height: 10 + b.t * 28,
            borderRadius: "50%",
            backgroundColor: "rgba(226,244,255,0.6)",
            opacity: 0.2 * (1 - b.t),
          }}
        />
      ))}

      <div style={{ position: "absolute", right: 180, bottom: 300, opacity: signIn, transform: `translateX(${(1 - signIn) * 40}px)` }}>
        <Card accent={ACCENT.warm} style={{ position: "relative", width: 420, padding: "26px 34px" }}>
          <div style={{ position: "absolute", left: 18, top: -34 }}>
            <MiniFlame size={54} />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.28em", color: ACCENT.warm, marginBottom: 10 }}>
            SUMMIT RENTAL
          </div>
          <div style={{ fontSize: 42, fontWeight: 900 }}>军大衣 · 出租</div>
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 20, color: "rgba(235,243,255,0.6)" }}>
            押金 ¥100 / 租金 ¥50 · 山顶限定
          </div>
          <div style={{ position: "absolute", right: -14, top: -14 }}>
            <Tag color={ACCENT.lime} solid size={22}>+1 件</Tag>
          </div>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 120, bottom: 168 }}>
        <Tag color={ACCENT.cyan} size={24} solid>
          山顶 · -10°C
        </Tag>
        <span
          style={{
            marginLeft: 14,
            padding: "8px 20px",
            borderRadius: 999,
            border: "1px solid rgba(235,243,255,0.28)",
            backgroundColor: "rgba(6,12,22,0.62)",
            color: "rgba(235,243,255,0.9)",
            fontFamily: MONO,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}
        >
          瑟瑟发抖
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          bottom: 168,
          padding: "8px 22px",
          borderRadius: 999,
          border: "1px solid rgba(207,243,255,0.26)",
          backgroundColor: "rgba(6,12,22,0.62)",
          fontFamily: MONO,
          fontSize: 22,
          letterSpacing: "0.2em",
          color: "rgba(207,243,255,0.8)",
        }}
      >
        同一座山 · 两个季节
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 3 · Question — higher & closer, yet colder?                         */
/* ------------------------------------------------------------------ */
export const Question: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const qIn = pop(frame, fps, 4, { damping: 12, stiffness: 90, mass: 1 });
  const leftIn = pop(frame, fps, at(0.18, dur));
  const rightIn = pop(frame, fps, at(0.36, dur));
  const stampIn = pop(frame, fps, at(0.66, dur), { damping: 9, stiffness: 200, mass: 0.8 });
  return (
    <Scene dur={dur}>
      <Sky top="#040713" mid="#0A1526" bottom="#101F36" stars={70} nebula={ACCENT.indigo} seed={31} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 130,
          textAlign: "center",
          fontSize: 26,
          fontFamily: MONO,
          letterSpacing: "0.4em",
          color: ACCENT.indigo,
          opacity: qIn,
        }}
      >
        THE ODD QUESTION
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 196,
          textAlign: "center",
          fontSize: 82,
          fontWeight: 900,
          letterSpacing: "0.02em",
          opacity: qIn,
          transform: `translateY(${(1 - qIn) * 30}px)`,
        }}
      >
        越靠近太阳，为什么越冷？
      </div>
      {/* giant question mark */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -54%) scale(${0.7 + 0.3 * qIn}) rotate(${Math.sin(frame / 90) * 3}deg)`,
          fontSize: 620,
          fontWeight: 900,
          fontFamily: MONO,
          color: "transparent",
          WebkitTextStroke: "2.5px rgba(124,156,255,0.34)",
          opacity: qIn * 0.9,
        }}
      >
        ?
      </div>
      <Card
        accent={ACCENT.sun}
        style={{
          left: 250,
          top: 420,
          width: 560,
          padding: "44px 48px",
          opacity: leftIn,
          transform: `translateX(${(1 - leftIn) * -70}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <MiniSun size={58} />
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.3em", color: ACCENT.sun }}>ALTITUDE ↑</div>
        </div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 26 }}>爬得越高</div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14, color: ACCENT.sun }}>
          <span style={{ fontSize: 32, fontWeight: 700 }}>离太阳更近</span>
          <svg width={40} height={40} viewBox="0 0 40 40">
            <path d="M20 32 V10 M12 18 L20 9 L28 18" stroke={ACCENT.sun} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Card>
      <Card
        accent={ACCENT.cyan}
        style={{
          right: 250,
          top: 420,
          width: 560,
          padding: "44px 48px",
          opacity: rightIn,
          transform: `translateX(${(1 - rightIn) * 70}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width={54} height={54} viewBox="0 0 54 54">
            <circle cx={27} cy={27} r={20} fill="none" stroke={ACCENT.cyan} strokeWidth={3} />
            {new Array(6).fill(0).map((_, i) => {
              const a = (i / 6) * Math.PI * 2;
              return (
                <line key={i} x1={27 + Math.cos(a) * 13} y1={27 + Math.sin(a) * 13} x2={27 + Math.cos(a) * 23} y2={27 + Math.sin(a) * 23} stroke={ACCENT.cyan} strokeWidth={2.4} strokeLinecap="round" />
              );
            })}
          </svg>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.3em", color: ACCENT.cyan }}>TEMPERATURE ↓</div>
        </div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 26 }}>温度反而</div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14, color: ACCENT.cyan }}>
          <span style={{ fontSize: 32, fontWeight: 700 }}>越来越低</span>
          <svg width={40} height={40} viewBox="0 0 40 40">
            <path d="M20 8 V30 M12 22 L20 31 L28 22" stroke={ACCENT.cyan} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Card>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 560,
          transform: `translate(-50%, -50%) rotate(-10deg) scale(${0.6 + 0.4 * stampIn})`,
          opacity: stampIn,
        }}
      >
        <Tag color={ACCENT.red} size={26} solid>
          反直觉 CONTRADICTION
        </Tag>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 150,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 24,
          letterSpacing: "0.3em",
          color: "rgba(235,243,255,0.5)",
          opacity: rightIn,
        }}
      >
        近与远 · 热与冷
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 4 · Intuition — fireplace feels warm                                */
/* ------------------------------------------------------------------ */
export const Intuition: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inA = pop(frame, fps, 3);
  const inB = pop(frame, fps, at(0.62, dur));
  return (
    <Scene dur={dur}>
      <Sky top="#0A0B14" mid="#1A1620" bottom="#241A16" stars={26} seed={41} />
      <Card accent={ACCENT.ember} style={{ left: 210, top: 360, width: 700, height: 460, opacity: inA, transform: `translateY(${(1 - inA) * 40}px)` }}>
        <div style={{ position: "absolute", left: 40, top: 36, fontFamily: MONO, fontSize: 20, letterSpacing: "0.3em", color: ACCENT.ember }}>
          日常直觉 · EVERYDAY INTUITION
        </div>
        {/* fireplace */}
        <div style={{ position: "absolute", left: 60, bottom: 46, width: 340, height: 300 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              background:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 46px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 84px), #221410",
              border: "2px solid rgba(255,180,120,0.25)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 70,
              bottom: 0,
              width: 200,
              height: 190,
              borderRadius: "100px 100px 8px 8px",
              backgroundColor: "#0A0605",
              overflow: "hidden",
            }}
          >
            <Campfire x={100} y={180} scale={0.58} glow={0.55} sparks={4} />
          </div>
          {new Array(5).fill(0).map((_, i) => {
            const t = (frame * 1.2 + i * 21) % 60;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 120 + i * 22 + Math.sin((frame + i * 40) / 16) * 8,
                  bottom: 150 + t * 2.2,
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  backgroundColor: ACCENT.warm,
                  opacity: 0.6 * (1 - t / 60),
                }}
              />
            );
          })}
        </div>
        <div style={{ position: "absolute", right: 60, bottom: 60, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
          <div style={{ fontSize: 46, fontWeight: 900 }}>靠近火炉</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Tag color={ACCENT.lime} solid size={22}>✓ 会变暖</Tag>
          </div>
        </div>
      </Card>
      <Card
        accent={ACCENT.ice}
        style={{
          right: 210,
          top: 400,
          width: 560,
          height: 380,
          opacity: inB,
          transform: `translateY(${(1 - inB) * 40}px)`,
        }}
      >
        <div style={{ position: "absolute", left: 40, top: 36, fontFamily: MONO, fontSize: 20, letterSpacing: "0.3em", color: ACCENT.ice }}>
          但大气层里 · IN THE ATMOSPHERE
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 96, fontWeight: 900, opacity: 0.16 }}>?</div>
          <div style={{ fontSize: 30, color: "rgba(235,243,255,0.75)" }}>燃料在天上，还是在地下？</div>
        </div>
      </Card>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 5 · Lapse rate — 6°C colder per 1000 m                              */
/* ------------------------------------------------------------------ */
export const LapseRate: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const levels = [
    { alt: "0 m", temp: 20, y: 760 },
    { alt: "1000 m", temp: 14, y: 648 },
    { alt: "2000 m", temp: 8, y: 536 },
    { alt: "3000 m", temp: 2, y: 424 },
    { alt: "4000 m", temp: -4, y: 312 },
  ];
  const head = pop(frame, fps, 4);
  return (
    <Scene dur={dur}>
      <Sky top="#03060F" mid="#0A1526" bottom="#0E1E33" stars={50} nebula={ACCENT.ice} seed={51} />
      <Headline kicker="LAPSE RATE · 气温垂直递减率" title="每升高 1000 米，气温下降约 6℃" accent={ACCENT.ice} progress={head} size={58} />
      {/* altitude axis */}
      <div style={{ position: "absolute", left: 330, top: 300, bottom: 120, width: 3, background: "linear-gradient(180deg, rgba(143,216,255,0.5), rgba(143,216,255,0.06))" }} />
      {levels.map((lv, i) => {
        const p = pop(frame, fps, at(0.2, dur) + i * 14);
        const tempVal = lv.temp * p - (1 - p) * 0;
        return (
          <React.Fragment key={lv.alt}>
            <div
              style={{
                position: "absolute",
                left: 310,
                top: lv.y,
                width: 26,
                height: 26,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                border: `2.5px solid ${ACCENT.ice}`,
                backgroundColor: "#081120",
                boxShadow: p > 0.2 ? `0 0 14px ${ACCENT.ice}66` : "none",
                opacity: p,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 200,
                top: lv.y - 16,
                width: 92,
                textAlign: "right",
                fontFamily: MONO,
                fontSize: 24,
                fontWeight: 700,
                color: "rgba(207,243,255,0.72)",
                opacity: p,
              }}
            >
              {lv.alt}
            </div>
            <div
              style={{
                position: "absolute",
                left: 360,
                top: lv.y - 30,
                opacity: p,
                transform: `translateX(${(1 - p) * -26}px)`,
              }}
            >
              <div
                style={{
                  padding: "12px 26px",
                  borderRadius: 14,
                  border: `1.5px solid ${ACCENT.ice}44`,
                  backgroundColor: "rgba(10,18,32,0.7)",
                  fontFamily: MONO,
                  fontSize: 34,
                  fontWeight: 800,
                  color: tempVal > 9 ? ACCENT.sun : ACCENT.ice,
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 130,
                  textAlign: "center",
                }}
              >
                {Math.round(tempVal)}℃
              </div>
            </div>
            {i < levels.length - 1 ? (
              <div
                style={{
                  position: "absolute",
                  left: 420,
                  top: lv.y - 62,
                  fontFamily: MONO,
                  fontSize: 18,
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.32)",
                  opacity: p,
                }}
              >
                ↓ 1000m · −6℃
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
      {/* formula card */}
      <Card accent={ACCENT.ember} style={{ right: 190, top: 380, width: 560, padding: "40px 48px", opacity: pop(frame, fps, at(0.3, dur)) }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.3em", color: ACCENT.ember }}>THE RULE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 26, fontFamily: MONO }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 30, color: "rgba(235,243,255,0.7)" }}>海拔 ↑</div>
            <div style={{ fontSize: 60, fontWeight: 800 }}>
              1000<span style={{ fontSize: 26 }}>m</span>
            </div>
          </div>
          <div style={{ fontSize: 44, color: "rgba(235,243,255,0.4)" }}>=</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 30, color: "rgba(235,243,255,0.7)" }}>气温</div>
            <div style={{ fontSize: 60, fontWeight: 800, color: ACCENT.ember }}>
              −6<span style={{ fontSize: 26 }}>℃</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 22, fontSize: 22, color: "rgba(235,243,255,0.55)", lineHeight: 1.6 }}>
          无论晴天阴天，这条规律几乎不变。
        </div>
      </Card>
      <Thermometer x={1690} y={430} height={330} value={20 - 24 * seg(frame, at(0.2, dur), at(0.86, dur), 0, 1)} min={-20} max={40} label="−4℃" />
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 6 · Three lies — sun is fine, intuitions deceived us                */
/* ------------------------------------------------------------------ */
export const ThreeLies: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const sunIn = pop(frame, fps, at(0.14, dur));
  const cards = [
    { num: "01", title: "距离的错觉", sub: "高山其实没靠近太阳", icon: <MiniSun size={52} />, color: ACCENT.sun },
    {
      num: "02",
      title: "暖气片在脚下",
      sub: "热源是地面，不是太阳",
      icon: (
        <svg width={52} height={52} viewBox="0 0 52 52">
          <rect x={7} y={14} width={38} height={26} rx={4} fill="none" stroke={ACCENT.ember} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={13 + i * 9} y1={16} x2={13 + i * 9} y2={38} stroke={ACCENT.ember} strokeWidth={3.4} strokeLinecap="round" />
          ))}
        </svg>
      ),
      color: ACCENT.ember,
    },
    {
      num: "03",
      title: "空气自我消耗",
      sub: "膨胀降温 + 棉被变薄",
      icon: (
        <svg width={52} height={52} viewBox="0 0 52 52">
          <circle cx={26} cy={28} r={14} fill="none" stroke={ACCENT.cyan} strokeWidth={3} strokeDasharray="5 4" />
          <circle cx={26} cy={28} r={6} fill={ACCENT.cyan} opacity={0.75} />
          <path d="M26 6 v8 M26 42 v6" stroke={ACCENT.cyan} strokeWidth={3} strokeLinecap="round" />
        </svg>
      ),
      color: ACCENT.cyan,
    },
  ];
  return (
    <Scene dur={dur}>
      <Sky top="#04060F" mid="#0B1424" bottom="#101B2E" stars={60} nebula={ACCENT.violet} seed={61} />
      <Headline kicker="THREE EVERYDAY ILLUSIONS" title="太阳没有失灵，是我们被直觉骗了" accent={ACCENT.violet} progress={head} size={58} />
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 268,
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: sunIn,
          transform: `translateY(${(1 - sunIn) * 20}px)`,
        }}
      >
        <MiniSun size={54} />
        <Tag color={ACCENT.lime} solid size={22}>太阳照常工作</Tag>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 400, display: "flex", gap: 40 }}>
        {cards.map((c, i) => {
          const p = pop(frame, fps, at(0.24, dur) + i * 18);
          return (
            <div
              key={c.num}
              style={{
                flex: 1,
                opacity: p,
                transform: `translateY(${(1 - p) * 60}px) rotate(${(1 - p) * (i % 2 ? 4 : -4)}deg)`,
                perspective: 1200,
              }}
            >
              <div
                style={{
                  height: 400,
                  borderRadius: 26,
                  border: `1px solid ${c.color}44`,
                  backgroundColor: "rgba(9,17,31,0.66)",
                  padding: "36px 40px",
                  position: "relative",
                  boxShadow: `0 30px 80px rgba(0,0,0,0.4)`,
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 74, fontWeight: 800, color: `${c.color}30`, lineHeight: 1 }}>
                  {c.num}
                </div>
                <div style={{ marginTop: 24 }}>{c.icon}</div>
                <div style={{ fontSize: 40, fontWeight: 900, marginTop: 26 }}>{c.title}</div>
                <div style={{ marginTop: 12, fontSize: 22, color: "rgba(235,243,255,0.55)" }}>{c.sub}</div>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, borderRadius: 4, background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 140,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 24,
          letterSpacing: "0.34em",
          color: "rgba(235,243,255,0.5)",
          opacity: pop(frame, fps, at(0.6, dur)),
        }}
      >
        三条直觉 · 逐一拆解
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 7 · Chapter 01                                                     */
/* ------------------------------------------------------------------ */
export const Chapter1: React.FC<{ dur: number }> = ({ dur }) => (
  <Scene dur={dur}>
    <Sky top="#03060F" mid="#0A1322" bottom="#0F1D33" stars={70} nebula={ACCENT.indigo} seed={71} />
    <ChapterCard num="01" title="距离的错觉" subtitle="150米外，往前迈了“半毫米”" accent={ACCENT.indigo} dur={dur} en="ILLUSION OF DISTANCE" />
  </Scene>
);

/* ------------------------------------------------------------------ */
/* 8 · Cosmic scale                                                    */
/* ------------------------------------------------------------------ */
export const CosmicScale: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const zoom = interpolate(frame, [0, dur], [1.32, 1], { ...CLAMP });
  const dash = seg(frame, at(0.3, dur), at(0.7, dur), 0, 1);
  return (
    <Scene dur={dur}>
      <Sky top="#01020A" mid="#070B1C" bottom="#0B1026" stars={150} nebula={ACCENT.violet} seed={81} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "38% 62%" }}>
        {/* sun */}
        <Sun x={1520} y={470} r={330} glow={1.5} pulse rays color="#FFC65A" />
        {/* earth */}
        <div style={{ position: "absolute", left: 360, top: 700 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "radial-gradient(circle at 36% 30%, #6FB6FF 0%, #2E6BB8 48%, #0A1E40 100%)",
              boxShadow: "0 0 70px rgba(90,160,255,0.55)",
            }}
          />
          <div style={{ position: "absolute", left: 24, top: 30, width: 40, height: 26, borderRadius: "50%", backgroundColor: "rgba(160,220,255,0.35)", filter: "blur(2px)" }} />
          <div style={{ position: "absolute", left: 60, top: 70, width: 34, height: 20, borderRadius: "50%", backgroundColor: "rgba(160,220,255,0.25)", filter: "blur(2px)" }} />
          <div style={{ position: "absolute", left: 60, top: -34, fontFamily: MONO, fontSize: 20, letterSpacing: "0.24em", color: "rgba(207,243,255,0.6)" }}>
            EARTH
          </div>
        </div>
        {/* distance line */}
        <div
          style={{
            position: "absolute",
            left: 500,
            top: 760,
            width: 1010 * dash,
            height: 0,
            borderTop: "2px dashed rgba(255,209,102,0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 500 + 440 * dash,
            top: 700,
            opacity: dash,
            padding: "12px 26px",
            borderRadius: 999,
            backgroundColor: "rgba(6,10,22,0.8)",
            border: "1px solid rgba(255,209,102,0.35)",
            fontFamily: MONO,
            fontSize: 26,
            fontWeight: 700,
            color: ACCENT.sun,
            whiteSpace: "nowrap",
          }}
        >
          ≈ 1.5 亿公里
        </div>
        <div
          style={{
            position: "absolute",
            left: 500 + 440 * dash,
            top: 800,
            opacity: dash * 0.7,
            fontFamily: MONO,
            fontSize: 20,
            letterSpacing: "0.2em",
            color: "rgba(235,243,255,0.55)",
            whiteSpace: "nowrap",
          }}
        >
          光也要走 8 分 20 秒
        </div>
      </div>
      <Headline kicker="SCALE CHECK · 宇宙尺度" title="对“宇宙尺度”最大的误解" accent={ACCENT.indigo} progress={head} size={62} />
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 9 · Numbers — 150,000,000 km vs 8.8 km                              */
/* ------------------------------------------------------------------ */
export const Numbers: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const count = seg(frame, at(0.12, dur), at(0.42, dur), 0, 1);
  const everest = pop(frame, fps, at(0.42, dur), { damping: 18, stiffness: 60, mass: 1.2 });
  const ratio = seg(frame, at(0.6, dur), at(0.85, dur), 0, 1);
  return (
    <Scene dur={dur}>
      <Sky top="#030510" mid="#0A1424" bottom="#0D1B2E" stars={60} nebula={ACCENT.ice} seed={91} />
      <Headline kicker="MEASURE IT · 量一量" title="日地距离 vs 珠峰高度" accent={ACCENT.ice} progress={head} size={58} />
      <div style={{ position: "absolute", left: 120, top: 360 }}>
        <BigNumber x={0} y={0} value={150000000} suffix="公里" color={ACCENT.sun} size={120} progress={count} label="日地平均距离 · AVERAGE EARTH–SUN DISTANCE" />
      </div>
      <div style={{ position: "absolute", left: 120, top: 700, display: "flex", alignItems: "center", gap: 22, opacity: seg(frame, at(0.5, dur), at(0.6, dur), 0, 1) }}>
        <div style={{ width: 40, height: 2, backgroundColor: "rgba(235,243,255,0.3)" }} />
        <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.22em", color: "rgba(235,243,255,0.5)" }}>
          1.5 亿公里 ≈ 150,000,000 km
        </div>
      </div>
      {/* divider */}
      <div style={{ position: "absolute", left: 1050, top: 340, width: 1.5, height: 480, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.24), transparent)" }} />
      <div style={{ position: "absolute", left: 1160, top: 380, opacity: everest, transform: `translateY(${(1 - everest) * 60}px)` }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.3em", color: ACCENT.ice, marginBottom: 8 }}>EVEREST · 珠穆朗玛峰</div>
        <div style={{ fontFamily: MONO, fontSize: 104, fontWeight: 800, lineHeight: 1 }}>
          8.8<span style={{ fontSize: 40, marginLeft: 12, opacity: 0.75 }}>公里</span>
        </div>
        <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 22, color: "rgba(235,243,255,0.5)" }}>海拔 8,848 米 · 地球最高点</div>
      </div>
      {/* everest silhouette */}
      <svg width={520} height={420} viewBox="0 0 520 420" style={{ position: "absolute", right: 110, top: 560, opacity: everest, transform: `translateY(${(1 - everest) * 60}px)` }}>
        <defs>
          <linearGradient id="everest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8F6FF" />
            <stop offset="34%" stopColor="#8FD8FF" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#122437" />
          </linearGradient>
        </defs>
        <path d="M40 400 L230 60 L300 180 L360 100 L480 400 Z" fill="url(#everest)" stroke="rgba(180,225,255,0.5)" strokeWidth={2} />
        <path d="M40 400 L480 400" stroke="#8FD8FF" strokeWidth={3} opacity={0.5} />
        <line x1={230} y1={60} x2={230} y2={400} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeDasharray="6 8" />
        <text x={246} y={96} fill={ACCENT.ice} fontFamily="monospace" fontSize={20} opacity={0.85}>
          8848 m
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 120,
          bottom: 150,
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          opacity: ratio,
        }}
      >
        <Tag color={ACCENT.ember} solid size={24}>相差约 1704 万倍</Tag>
        <span style={{ fontFamily: MONO, fontSize: 20, color: "rgba(235,243,255,0.45)" }}>8.8 km ÷ 150,000,000 km</span>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 10 · Bonfire setup — 8.8 km is nothing against 1.5e8 km             */
/* ------------------------------------------------------------------ */
export const BonfireSetup: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const scan = seg(frame, at(0.2, dur), at(0.6, dur), 0, 1);
  const zoomIn = pop(frame, fps, at(0.55, dur), { damping: 16, stiffness: 90, mass: 1 });
  return (
    <Scene dur={dur}>
      <Sky top="#04060F" mid="#0A1322" bottom="#101B2E" stars={50} seed={101} />
      <Headline kicker="PUT IT IN CONTEXT" title="8.8 公里，放在 1.5 亿公里面前？" accent={ACCENT.sun} progress={head} size={56} />
      {/* long bar */}
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 480,
          height: 84,
          borderRadius: 16,
          border: "1.5px solid rgba(255,209,102,0.35)",
          backgroundColor: "rgba(255,209,102,0.06)",
          overflow: "hidden",
        }}
      >
        {new Array(30).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: `${(i / 30) * 100}%`, top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,209,102,0.12)" }} />
        ))}
        <div
          style={{
            position: "absolute",
            left: `${scan * 100}%`,
            top: 0,
            bottom: 0,
            width: 3,
            background: ACCENT.sun,
            boxShadow: `0 0 18px ${ACCENT.sun}`,
            opacity: 0.9,
          }}
        />
        <div style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", fontFamily: MONO, fontSize: 22, color: "rgba(255,209,102,0.65)", letterSpacing: "0.2em" }}>
          1.5 亿公里 · FULL DISTANCE
        </div>
      </div>
      {/* the sliver */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 480,
          width: 5,
          height: 84,
          backgroundColor: ACCENT.ice,
          boxShadow: `0 0 24px ${ACCENT.ice}`,
          opacity: 0.35 + 0.65 * scan,
        }}
      />
      <div style={{ position: "absolute", left: 150, top: 610, opacity: zoomIn, transform: `translateY(${(1 - zoomIn) * 30}px)` }}>
        <div style={{ width: 520, padding: "34px 40px", borderRadius: 22, border: `1.5px solid ${ACCENT.ice}44`, backgroundColor: "rgba(8,15,28,0.82)" }}>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.3em", color: ACCENT.ice }}>8.8 km 在此 · MAGNIFIED</div>
          <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 64, fontWeight: 800, color: ACCENT.ice }}>
            0.0000059<span style={{ fontSize: 30 }}>%</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 24, color: "rgba(235,243,255,0.6)", lineHeight: 1.6 }}>珠峰高度，只占日地距离的千万分之六。</div>
        </div>
        <div style={{ position: "absolute", left: -22, top: -26, width: 74, height: 74, borderRadius: "50%", border: `2.5px solid ${ACCENT.ice}`, opacity: 0.7 }} />
        <div style={{ position: "absolute", left: -6, top: -10, width: 10, height: 10, borderRadius: "50%", backgroundColor: ACCENT.ice }} />
      </div>
      <div style={{ position: "absolute", left: 770, top: 640, opacity: zoomIn }}>
        <Callout x={0} y={0} text="连一丝零头都算不上" color={ACCENT.warm} progress={zoomIn} />
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 11 · Bonfire step — 150 m away, step forward < 1 cm                */
/* ------------------------------------------------------------------ */
export const BonfireStep: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const panel = pop(frame, fps, at(0.46, dur), SPRING_SMOOTH);
  const stepT = seg(frame, at(0.6, dur), at(0.82, dur), 0, 1);
  return (
    <Scene dur={dur}>
      <Sky top="#050409" mid="#160F1A" bottom="#241414" stars={44} seed={111} />
      <Headline kicker="THE BONFIRE ANALOGY" title="篝火在 150 米外，你往前挪了不到 1 厘米" accent={ACCENT.ember} progress={head} size={52} />
      {/* ground */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, height: 280, background: "linear-gradient(180deg, #241511 0%, #0B0806 70%)" }} />
      <Campfire x={1560} y={806} scale={1.12} glow={1.2} sparks={8} />
      {/* distant figure */}
      <Climber x={430} y={830} scale={1.05} mode="calm" />
      {/* 150 m dimension */}
      <div style={{ position: "absolute", left: 430, top: 862, width: 1130, height: 0, borderTop: "2px dashed rgba(255,255,255,0.35)" }} />
      <div style={{ position: "absolute", left: 820, top: 890, fontFamily: MONO, fontSize: 26, letterSpacing: "0.18em", color: "rgba(235,243,255,0.7)" }}>150 m</div>
      <div style={{ position: "absolute", left: 430, top: 850, width: 2, height: 24, backgroundColor: "rgba(255,255,255,0.4)" }} />
      <div style={{ position: "absolute", left: 1560, top: 850, width: 2, height: 24, backgroundColor: "rgba(255,255,255,0.4)" }} />
      {/* magnifier panel */}
      <div
        style={{
          position: "absolute",
          left: 650,
          top: 400,
          width: 760,
          padding: "34px 40px",
          borderRadius: 24,
          border: `1.5px solid ${ACCENT.ice}55`,
          backgroundColor: "rgba(6,12,24,0.9)",
          opacity: panel,
          transform: `translateY(${(1 - panel) * 50}px) scale(${0.94 + 0.06 * panel})`,
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.3em", color: ACCENT.ice, marginBottom: 20 }}>
          为了取暖 · 挪动的距离
        </div>
        {/* ruler */}
        <div style={{ position: "relative", height: 120 }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, height: 2, backgroundColor: "rgba(207,243,255,0.4)" }} />
          {new Array(21).fill(0).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: `${(i / 20) * 100}%`, bottom: 34, width: 2, height: i % 5 === 0 ? 22 : 12, backgroundColor: i % 5 === 0 ? "rgba(207,243,255,0.7)" : "rgba(207,243,255,0.3)", transform: "translateX(-1px)" }} />
          ))}
          <div style={{ position: "absolute", left: `${4 + stepT * 8}%`, bottom: 56, width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderBottom: `26px solid ${ACCENT.warm}`, transform: "translateX(-14px)" }} />
          <div style={{ position: "absolute", left: `${4 + stepT * 8}%`, bottom: 92, transform: "translateX(-50%)", fontFamily: MONO, fontSize: 30, fontWeight: 800, color: ACCENT.warm, whiteSpace: "nowrap" }}>
            {(stepT * 0.98).toFixed(2)} cm
          </div>
        </div>
        <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 26, color: "rgba(235,243,255,0.85)" }}>
          不到 <span style={{ color: ACCENT.warm, fontWeight: 800 }}>1 厘米</span> · 对 150 米来说，约等于没动
        </div>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 12 · Negligible — less than 1/100,000                               */
/* ------------------------------------------------------------------ */
export const Negligible: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const frac = pop(frame, fps, at(0.16, dur), { damping: 16, stiffness: 90, mass: 1 });
  const stamp = pop(frame, fps, at(0.52, dur), { damping: 9, stiffness: 210, mass: 0.7 });
  const shake = stamp > 0.9 ? Math.sin(frame * 1.9) * 2.4 * Math.max(0, 1 - (frame - at(0.52, dur)) / 18) : 0;
  return (
    <Scene dur={dur}>
      <Sky top="#04060F" mid="#0A1322" bottom="#101B2E" stars={46} seed={121} />
      <Headline kicker="HOW SMALL?" title="太阳辐射增强：连十万分之一都不到" accent={ACCENT.lime} progress={head} size={52} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", justifyContent: "center", opacity: frac, transform: `translateY(${(1 - frac) * 50}px)` }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 26, justifyContent: "center", fontFamily: MONO }}>
            <div style={{ fontSize: 210, fontWeight: 800, lineHeight: 1, color: ACCENT.lime }}>1</div>
            <div style={{ height: 190, width: 4, backgroundColor: "rgba(255,255,255,0.55)", transform: "rotate(6deg)" }} />
            <div style={{ fontSize: 210, fontWeight: 800, lineHeight: 1, color: "rgba(235,243,255,0.92)" }}>100,000</div>
          </div>
          <div style={{ marginTop: 26, fontFamily: MONO, fontSize: 26, letterSpacing: "0.24em", color: "rgba(235,243,255,0.55)" }}>
            INCREASE IN SOLAR RADIATION &lt; 0.001%
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", right: 210, top: 300, opacity: pop(frame, fps, at(0.3, dur)) }}>
        <Gauge x={0} y={0} value={0.05 + 0.012 * Math.sin(frame / 9)} label="辐射强度" color={ACCENT.lime} size={210} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 760,
          transform: `translate(-50%, -50%) rotate(-8deg) scale(${0.5 + 0.5 * stamp}) translateX(${shake}px)`,
          opacity: stamp,
          border: `4px solid ${ACCENT.lime}`,
          borderRadius: 18,
          padding: "18px 44px",
          fontFamily: MONO,
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: "0.16em",
          color: ACCENT.lime,
          backgroundColor: "rgba(10,20,10,0.4)",
          boxShadow: `0 0 40px ${ACCENT.lime}44`,
        }}
      >
        忽 略 不 计
      </div>
      <div style={{ position: "absolute", left: 150, top: 430, opacity: pop(frame, fps, at(0.34, dur)), display: "flex", flexDirection: "column", gap: 16 }}>
        <Tag color={ACCENT.sun} size={22}>太阳还是那个太阳</Tag>
        <Tag color="rgba(235,243,255,0.7)" size={20}>Δ 距离 ≈ 0</Tag>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 13 · Same sun — sea level vs summit                                 */
/* ------------------------------------------------------------------ */
export const SameSun: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const eq = pop(frame, fps, at(0.5, dur), { damping: 11, stiffness: 120, mass: 0.9 });
  const bar = seg(frame, at(0.3, dur), at(0.5, dur), 0, 1);
  return (
    <Scene dur={dur}>
      <Sky top="#03060F" mid="#0A1526" bottom="#0E2038" stars={50} seed={131} />
      <Headline kicker="SAME SUN, SAME BURN" title="海平面 vs 珠峰顶：烘烤强度几乎一致" accent={ACCENT.lime} progress={head} size={52} />
      {/* left: sea */}
      <div style={{ position: "absolute", left: 60, top: 330, width: 860, height: 540, borderRadius: 26, overflow: "hidden", border: "1px solid rgba(255,209,102,0.25)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0B1B30 0%, #12324E 46%, #0A2A44 64%, #06202F 100%)" }} />
        <Sun x={430} y={210} r={74} glow={1.1} rays color={ACCENT.sun} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 388, height: 3, background: "linear-gradient(90deg, transparent, rgba(255,209,102,0.8), transparent)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 392, bottom: 0, background: "linear-gradient(180deg, rgba(255,209,102,0.16), transparent 40%)" }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 120 + i * 210, top: 430 + i * 26, width: 120 + i * 60, height: 2, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 2 }} />
        ))}
        <div style={{ position: "absolute", left: 36, bottom: 30 }}>
          <Tag color={ACCENT.sun} size={22} solid>海平面 · 0 m</Tag>
        </div>
        <div style={{ position: "absolute", right: 24, top: 24, padding: "7px 16px", borderRadius: 999, backgroundColor: "rgba(4,10,18,0.62)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: MONO, fontSize: 19, color: "rgba(255,235,200,0.8)" }}>光线强度 100%</div>
      </div>
      {/* right: summit */}
      <div style={{ position: "absolute", right: 60, top: 330, width: 860, height: 540, borderRadius: 26, overflow: "hidden", border: "1px solid rgba(143,216,255,0.25)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #050A14 0%, #0B1C30 55%, #10263C 100%)" }} />
        <Sun x={430} y={180} r={74} glow={1.1} rays color="#FFE8B0" />
        <Mountains y={330} snow scale={0.9} glow={0.4} />
        <Motes count={40} seed={17} color="#CFF3FF" rise={-0.8} size={3} opacity={0.5} area={{ x: 0, y: 0, w: 860, h: 540 }} />
        <div style={{ position: "absolute", left: 36, bottom: 30 }}>
          <Tag color={ACCENT.ice} size={22} solid>珠峰顶 · 8848 m</Tag>
        </div>
        <div style={{ position: "absolute", right: 24, top: 24, padding: "7px 16px", borderRadius: 999, backgroundColor: "rgba(4,10,18,0.62)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: MONO, fontSize: 19, color: "rgba(207,243,255,0.8)" }}>光线强度 100%</div>
      </div>
      {/* center equals */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 590,
          transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * eq})`,
          width: 150,
          height: 150,
          borderRadius: "50%",
          backgroundColor: "rgba(6,12,24,0.92)",
          border: `2.5px solid ${ACCENT.lime}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 90,
          fontWeight: 900,
          color: ACCENT.lime,
          boxShadow: `0 0 60px ${ACCENT.lime}33`,
        }}
      >
        ≈
      </div>
      {/* equality bars */}
      <div style={{ position: "absolute", left: 60, bottom: 132, width: 1800, display: "flex", justifyContent: "space-between", opacity: bar }}>
        <div style={{ width: 700, height: 10, borderRadius: 5, backgroundColor: "rgba(255,209,102,0.55)", transform: `scaleX(${bar})`, transformOrigin: "0 50%" }} />
        <div style={{ width: 700, height: 10, borderRadius: 5, backgroundColor: "rgba(143,216,255,0.55)", transform: `scaleX(${bar})`, transformOrigin: "100% 50%" }} />
      </div>
    </Scene>
  );
};

const SPRING_SMOOTH = { damping: 200, stiffness: 120, mass: 1 } as const;
