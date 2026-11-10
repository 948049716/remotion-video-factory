import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ACCENT,
  Arrow,
  ChapterCard,
  CLAMP,
  DuvetLayer,
  Ground,
  Gauge,
  Headline,
  HeatWave,
  Molecule,
  Motes,
  Parcel,
  pop,
  Scene,
  seg,
  Sky,
  Tag,
  Thermometer,
} from "./primitives";

const at = (p: number, dur: number) => Math.round(p * dur);

/* local: vertical heat arrow */
const HeatArrow: React.FC<{ x: number; y: number; dir?: 1 | -1; color?: string; len?: number; opacity?: number }> = ({
  x,
  y,
  dir = -1,
  color = ACCENT.ember,
  len = 34,
  opacity = 0.8,
}) => (
  <svg width={26} height={len + 12} viewBox={`0 0 26 ${len + 12}`} style={{ position: "absolute", left: x - 13, top: y - (dir === -1 ? len : 0), overflow: "visible", opacity }}>
    <line x1={13} y1={dir === -1 ? len + 10 : 2} x2={13} y2={dir === -1 ? 2 : len + 10} stroke={color} strokeWidth={3.4} strokeLinecap="round" />
    <path d={dir === -1 ? `M6 10 L13 2 L20 10` : `M6 ${len + 2} L13 ${len + 10} L20 ${len + 2}`} fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MouthOpen: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})` }}>
    <svg width={360} height={280} viewBox="0 0 360 280" style={{ overflow: "visible" }}>
      <path
        d="M100 264 C76 232 64 184 70 132 C77 75 116 34 170 28 C215 23 246 47 252 82 C256 101 250 112 266 124 L286 138 Q294 145 280 151 L264 156 C264 163 274 165 282 171 C275 180 266 183 258 182 C269 194 270 204 258 216 C244 230 236 246 234 266 L128 266 Z"
        fill="rgba(232,160,168,0.08)"
        stroke="#E8A0A8"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M258 163 Q274 157 284 171 Q278 190 258 183 Q249 174 258 163 Z" fill="#080407" stroke="#F0A1AC" strokeWidth={4} />
      <path d="M260 181 Q270 184 278 178" fill="none" stroke="#D97E91" strokeWidth={3} strokeLinecap="round" />
      <path d="M202 105 Q220 96 234 105" fill="none" stroke="#E8A0A8" strokeWidth={4} strokeLinecap="round" />
      <path d="M211 116 Q222 122 232 115" fill="none" stroke="#E8A0A8" strokeWidth={3} strokeLinecap="round" />
      <path d="M146 126 C126 112 112 134 124 152 C132 164 146 156 148 144" fill="none" stroke="#C98290" strokeWidth={4} />
      <path d="M96 104 C112 52 160 26 206 38 C168 42 146 64 138 96" fill="rgba(232,160,168,0.12)" stroke="#C98290" strokeWidth={4} strokeLinecap="round" />
    </svg>
  </div>
);

const MouthPursed: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})` }}>
    <svg width={360} height={280} viewBox="0 0 360 280" style={{ overflow: "visible" }}>
      <path
        d="M100 264 C76 232 64 184 70 132 C77 75 116 34 170 28 C215 23 246 47 252 82 C256 101 250 112 266 124 L286 138 Q294 145 280 151 L264 156 C266 163 274 165 282 169 L296 170 C303 172 303 181 296 184 L280 185 C270 190 270 204 258 216 C244 230 236 246 234 266 L128 266 Z"
        fill="rgba(232,160,168,0.08)"
        stroke="#E8A0A8"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx={298} cy={177} rx={12} ry={9} fill="#080407" stroke="#F0A1AC" strokeWidth={4} />
      <path d="M202 105 Q220 96 234 105" fill="none" stroke="#E8A0A8" strokeWidth={4} strokeLinecap="round" />
      <path d="M211 116 Q222 122 232 115" fill="none" stroke="#E8A0A8" strokeWidth={3} strokeLinecap="round" />
      <path d="M146 126 C126 112 112 134 124 152 C132 164 146 156 148 144" fill="none" stroke="#C98290" strokeWidth={4} />
      <path d="M96 104 C112 52 160 26 206 38 C168 42 146 64 138 96" fill="rgba(232,160,168,0.12)" stroke="#C98290" strokeWidth={4} strokeLinecap="round" />
    </svg>
  </div>
);

/* local: stylized palm */
const Palm: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})` }}>
    <svg width={230} height={260} viewBox="0 0 230 260">
      <path
        d="M70 250 Q40 214 44 170 L52 120 Q54 106 66 106 Q78 106 80 120 L84 150 L82 74 Q82 58 96 58 Q110 58 110 74 L112 140 L114 48 Q114 32 128 32 Q142 32 142 48 L144 140 L148 62 Q148 46 162 46 Q176 46 176 62 L178 148 L182 106 Q184 92 196 94 Q208 96 206 110 L200 190 Q196 238 160 250 Z"
        fill="rgba(255,220,200,0.1)"
        stroke="#FFD9C2"
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M96 178 Q124 194 156 180" fill="none" stroke="rgba(255,217,194,0.55)" strokeWidth={3} strokeLinecap="round" />
    </svg>
  </div>
);

/* local: breath cone */
const BreathCone: React.FC<{ x0: number; y0: number; x1: number; spread: number; color: string; opacity?: number }> = ({
  x0,
  y0,
  x1,
  spread,
  color,
  opacity = 0.5,
}) => {
  const w = x1 - x0;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={`cone-${color.replace("#", "")}-${Math.round(x0)}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0.03} />
        </linearGradient>
      </defs>
      <path
        d={`M${x0} ${y0 - 22} L${x0 + w} ${y0 - spread} L${x0 + w} ${y0 + spread} L${x0} ${y0 + 22} Z`}
        fill={`url(#cone-${color.replace("#", "")}-${Math.round(x0)})`}
        opacity={0.55}
      />
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* 25 · Chapter 03                                                     */
/* ------------------------------------------------------------------ */
export const Chapter3: React.FC<{ dur: number }> = ({ dur }) => (
  <Scene dur={dur}>
    <Sky top="#020610" mid="#061224" bottom="#0A1A2E" stars={80} nebula={ACCENT.cyan} seed={251} />
    <ChapterCard num="03" title="空气的自我消耗" subtitle="绝热膨胀 × 漏风的棉被" accent={ACCENT.cyan} dur={dur} en="SELF-CONSUMPTION" />
  </Scene>
);

/* ------------------------------------------------------------------ */
/* 26 · Rise & expand                                                  */
/* ------------------------------------------------------------------ */
export const RiseExpand: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const hero = seg(frame, at(0.12, dur), at(0.9, dur), 0, 1);
  const heroY = 830 - 470 * hero;
  const heroR = 46 + 46 * hero;
  const heroHeat = 0.9 - 0.5 * hero;
  const pressure = 1000 - 500 * hero;
  const levels = [
    { y: 830, p: "1000 hPa", alt: "0 m" },
    { y: 705, p: "850 hPa", alt: "1500 m" },
    { y: 580, p: "700 hPa", alt: "3000 m" },
    { y: 455, p: "600 hPa", alt: "4500 m" },
    { y: 330, p: "500 hPa", alt: "5500 m" },
  ];
  const loops = [0, 1, 2].map((i) => {
    const t = ((frame * 0.42 + i * 40) % 140) / 140;
    return { x: 420 + i * 150, y: 810 - t * 470, r: 34 + t * 30, heat: 0.85 - t * 0.45, key: i, o: Math.sin(t * Math.PI) };
  });
  return (
    <Scene dur={dur}>
      <Sky top="#03070F" mid="#081726" bottom="#0C2136" stars={46} seed={261} />
      <Headline kicker="RISE & EXPAND" title="上升、减压、膨胀：热空气的旅程" accent={ACCENT.cyan} progress={head} size={52} />
      <Ground y={900} heat={0.7} height={180} />
      {/* altitude ruler */}
      <div style={{ position: "absolute", left: 220, top: 300, bottom: 220, width: 2, backgroundColor: "rgba(127,227,255,0.28)" }} />
      {levels.map((lv) => (
        <React.Fragment key={lv.p}>
          <div style={{ position: "absolute", left: 96, top: lv.y - 16, width: 100, textAlign: "right", fontFamily: "monospace", fontSize: 18, color: "rgba(207,243,255,0.55)" }}>{lv.alt}</div>
          <div style={{ position: "absolute", left: 210, top: lv.y, width: 24, height: 2, backgroundColor: "rgba(127,227,255,0.5)" }} />
          <div style={{ position: "absolute", left: 250, top: lv.y - 14, fontFamily: "monospace", fontSize: 17, letterSpacing: "0.08em", color: `rgba(207,243,255,${lv.y >= heroY ? 0.75 : 0.3})` }}>{lv.p}</div>
        </React.Fragment>
      ))}
      {/* ambient rising parcels */}
      {loops.map((p) => (
        <Parcel key={p.key} x={p.x} y={p.y} r={p.r} heat={p.heat} wobble={1.2} />
      ))}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <path d="M940 850 C900 736 980 548 940 344" fill="none" stroke={ACCENT.cyan} strokeWidth={2} strokeDasharray="7 13" opacity={0.24} />
        <path d="M928 364 L940 342 L952 364" fill="none" stroke={ACCENT.cyan} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      </svg>
      {/* hero parcel */}
      <Parcel x={940} y={heroY} r={heroR} heat={heroHeat} label="热空气团" />
      <div style={{ position: "absolute", left: 940 + heroR + 64, top: heroY - 20, opacity: hero > 0.1 ? 1 : 0 }}>
        <Tag color={ACCENT.ice} size={18}>体积 {Math.round(100 + hero * 120)}%</Tag>
      </div>
      {/* expansion arrows */}
      {[-1, 1].map((dir) => (
        <Arrow
          key={dir}
          x1={940 + dir * (heroR + 10)}
          y1={heroY}
          x2={940 + dir * (heroR + 60)}
          y2={heroY}
          color={ACCENT.cyan}
          width={3}
          progress={hero}
        />
      ))}
      {/* pressure gauge */}
      <div style={{ position: "absolute", right: 260, top: 380, opacity: pop(frame, fps, at(0.3, dur)) }}>
        <Gauge x={0} y={0} value={1 - hero * 0.55} label={`${Math.round(pressure)} hPa`} color={ACCENT.cyan} size={200} />
      </div>
      <div style={{ position: "absolute", right: 200, top: 610, width: 320, opacity: pop(frame, fps, at(0.36, dur)) }}>
        <div style={{ fontFamily: "inherit", fontSize: 24, lineHeight: 1.8, color: "rgba(235,243,255,0.68)" }}>
          海拔越高 → 空气越稀薄
          <br />
          外面压力变小 → 气团膨胀
        </div>
      </div>
      <div style={{ position: "absolute", left: 150, bottom: 130, opacity: pop(frame, fps, at(0.72, dur)) }}>
        <Tag color={ACCENT.cyan} size={22}>像解开束缚一样向外膨胀</Tag>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 27 · Adiabatic — expanding does work, spends internal energy        */
/* ------------------------------------------------------------------ */
export const Adiabatic: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const drain = seg(frame, at(0.24, dur), at(0.68, dur), 0, 1);
  const temp = 20 - 38 * drain;
  const stamp = pop(frame, fps, at(0.6, dur), { damping: 10, stiffness: 170, mass: 0.8 });
  const cells = 6;
  return (
    <Scene dur={dur}>
      <Sky top="#02060F" mid="#07111F" bottom="#0A1626" stars={40} seed={271} />
      <Headline kicker="ADIABATIC COOLING" title="膨胀要对外做功 —— 只能花自己的内能" accent={ACCENT.cyan} progress={head} size={52} />
      <Parcel x={760} y={560} r={150} heat={0.85 - drain * 0.7} wobble={1.2} />
      {/* internal energy cells */}
      <div style={{ position: "absolute", left: 930, top: 700, display: "flex", gap: 12 }}>
        {new Array(cells).fill(0).map((_, i) => {
          const lit = 1 - Math.min(1, Math.max(0, drain * cells - i));
          return <div key={i} style={{ width: 34, height: 52, borderRadius: 7, border: `2px solid ${ACCENT.warm}`, backgroundColor: `rgba(255,179,71,${0.1 + 0.72 * lit})`, boxShadow: lit > 0.5 ? `0 0 14px ${ACCENT.warm}55` : "none" }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 930, top: 764, fontFamily: "monospace", fontSize: 18, letterSpacing: "0.2em", color: "rgba(255,200,160,0.6)" }}>内能 INTERNAL ENERGY</div>
      {/* work arrows */}
      {[
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
      ].map((d, i) => (
        <Arrow
          key={i}
          x1={760 + d.dx * 200}
          y1={560 + d.dy * 200}
          x2={760 + d.dx * (240 + drain * 40)}
          y2={560 + d.dy * (240 + drain * 40)}
          color={ACCENT.cyan}
          width={4}
          progress={seg(frame, at(0.32, dur) + i * 4, at(0.5, dur) + i * 4, 0, 1)}
        />
      ))}
      <div style={{ position: "absolute", left: 480, top: 300, opacity: pop(frame, fps, at(0.4, dur)) }}>
        <Tag color={ACCENT.cyan} size={20}>对外做功 W ↑</Tag>
      </div>
      {/* temperature readout */}
      <div style={{ position: "absolute", right: 220, top: 380, textAlign: "right" }}>
        <div style={{ fontFamily: "monospace", fontSize: 18, letterSpacing: "0.28em", color: "rgba(207,243,255,0.5)", marginBottom: 8 }}>温度 TEMPERATURE</div>
        <div style={{ fontFamily: "monospace", fontSize: 150, fontWeight: 800, lineHeight: 1, color: temp > 5 ? ACCENT.warm : ACCENT.cyan, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(temp)}℃
        </div>
        <div style={{ marginTop: 16, fontFamily: "monospace", fontSize: 20, color: "rgba(235,243,255,0.55)" }}>Q = 0 · 没有外界补充能量</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 880,
          transform: `translate(-50%, -50%) rotate(-5deg) scale(${0.55 + 0.45 * stamp})`,
          opacity: stamp,
          border: `4px solid ${ACCENT.cyan}`,
          borderRadius: 18,
          padding: "16px 40px",
          fontSize: 42,
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: ACCENT.cyan,
          backgroundColor: "rgba(4,12,22,0.6)",
          boxShadow: `0 0 50px ${ACCENT.cyan}44`,
          whiteSpace: "nowrap",
        }}
      >
        绝热膨胀降温
      </div>
      <div style={{ position: "absolute", left: 150, bottom: 170, opacity: pop(frame, fps, at(0.76, dur)), fontFamily: "inherit", fontSize: 24, color: "rgba(235,243,255,0.55)" }}>
        上升的空气，靠消耗自己变冷
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 28 · Experiment warm — open mouth "haa"                             */
/* ------------------------------------------------------------------ */
export const ExperimentWarm: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const breath = seg(frame, at(0.2, dur), at(0.5, dur), 0, 1);
  const tagIn = pop(frame, fps, at(0.42, dur));
  const particles = new Array(16).fill(0).map((_, i) => {
    const t = ((frame * 0.014 + i * 0.062) % 1);
    const spread = 20 + t * 90;
    const y = 520 + Math.sin(i * 2.4 + frame / 20) * spread * (0.35 + t * 0.6);
    return { x: 780 + t * 620, y, o: Math.sin(t * Math.PI) * 0.7, r: 8 + t * 22, key: i };
  });
  return (
    <Scene dur={dur}>
      <Sky top="#080409" mid="#1A0F12" bottom="#241311" stars={26} seed={281} />
      <Headline kicker="MINI EXPERIMENT · 哈气" title="张大嘴，哈——气是暖的" accent={ACCENT.warm} progress={head} size={54} />
      <MouthOpen x={560} y={540} />
      <BreathCone x0={700} y0={540} x1={1350} spread={150} color={ACCENT.warm} opacity={0.5 * breath} />
      {particles.map((p) => (
        <div key={p.key} style={{ position: "absolute", left: p.x, top: p.y, width: p.r, height: p.r, borderRadius: "50%", backgroundColor: ACCENT.warm, opacity: p.o * breath * 0.6, filter: "blur(3px)" }} />
      ))}
      <Palm x={1430} y={540} />
      {[0, 1, 2].map((i) => (
        <HeatWave key={i} x={780 + i * 40} y={470 + i * 62} w={420} amp={7} thickness={3} phase={i * 1.8} opacity={0.22 * breath} />
      ))}
      <div style={{ position: "absolute", left: 680, top: 370, opacity: tagIn, fontFamily: "inherit", fontSize: 66, fontWeight: 900, color: ACCENT.warm, letterSpacing: "0.1em" }}>
        哈——
      </div>
      <div style={{ position: "absolute", right: 240, top: 320, opacity: tagIn }}>
        <Thermometer x={0} y={0} height={200} value={37} min={0} max={50} label="暖" />
      </div>
      <div style={{ position: "absolute", left: 150, bottom: 140, opacity: tagIn }}>
        <Tag color={ACCENT.warm} size={24} solid>呼出的气 ≈ 37℃</Tag>
      </div>
      <div style={{ position: "absolute", right: 200, bottom: 140, opacity: tagIn }}>
        <Tag color={ACCENT.lime} size={22}>✓ 手心变暖</Tag>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 29 · Experiment cold — pursed lips "foo"                            */
/* ------------------------------------------------------------------ */
export const ExperimentCold: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const jet = seg(frame, at(0.16, dur), at(0.4, dur), 0, 1);
  const tagIn = pop(frame, fps, at(0.38, dur));
  const particles = new Array(18).fill(0).map((_, i) => {
    const t = ((frame * 0.03 + i * 0.055) % 1);
    const x = 780 + 90 * Math.min(1, t * 3) + t * 520;
    const spread = 6 + Math.max(0, t - 0.3) * 190;
    const y = 540 + Math.sin(i * 2.2 + frame / 14) * spread * 0.8;
    return { x, y, o: Math.sin(t * Math.PI) * 0.75, r: 4 + t * 16, key: i };
  });
  return (
    <Scene dur={dur}>
      <Sky top="#040710" mid="#081524" bottom="#0A1B2C" stars={34} seed={291} />
      <Headline kicker="MINI EXPERIMENT · 吹气" title="噘起嘴，吹——气立刻变凉" accent={ACCENT.cyan} progress={head} size={54} />
      <MouthPursed x={560} y={540} />
      <BreathCone x0={700} y0={540} x1={1300} spread={16} color={ACCENT.ice} opacity={0.5 * jet} />
      <BreathCone x0={900} y0={540} x1={1330} spread={120} color={ACCENT.cyan} opacity={0.35 * jet} />
      {particles.map((p) => (
        <div key={p.key} style={{ position: "absolute", left: p.x, top: p.y, width: p.r, height: p.r, borderRadius: "50%", backgroundColor: ACCENT.ice, opacity: p.o * jet * 0.6, filter: "blur(2px)" }} />
      ))}
      <Palm x={1430} y={540} />
      <div style={{ position: "absolute", left: 640, top: 370, opacity: tagIn, fontFamily: "inherit", fontSize: 60, fontWeight: 900, color: ACCENT.cyan, letterSpacing: "0.1em" }}>
        吹——
      </div>
      <div style={{ position: "absolute", right: 240, top: 320, opacity: tagIn }}>
        <Thermometer x={0} y={0} height={200} value={9} min={0} max={50} label="凉" />
      </div>
      <div style={{ position: "absolute", left: 150, bottom: 140, opacity: tagIn }}>
        <Tag color={ACCENT.cyan} size={24} solid>同样是 37℃ 的气</Tag>
      </div>
      <div style={{ position: "absolute", right: 200, bottom: 140, opacity: tagIn }}>
        <Tag color={ACCENT.ice} size={22}>手心：凉</Tag>
      </div>
      <div style={{ position: "absolute", left: 980, top: 680, opacity: tagIn, fontFamily: "monospace", fontSize: 18, letterSpacing: "0.14em", color: "rgba(207,243,255,0.6)" }}>
        窄口喷出 → 瞬间膨胀
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 30 · Same 37°C — comparison + mountain everyday loop                 */
/* ------------------------------------------------------------------ */
export const Experiment37: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const switchTo = at(0.52, dur);
  const compareO = interpolate(frame, [switchTo - 14, switchTo], [1, 0], CLAMP);
  const mountainO = interpolate(frame, [switchTo, switchTo + 16], [0, 1], CLAMP);
  const steps = [
    { label: "窄口", sub: "小孔喷出" },
    { label: "膨胀", sub: "向外做功" },
    { label: "耗能", sub: "消耗内能" },
    { label: "降温", sub: "温度下降" },
  ];
  const risingParcels = [0, 1, 2].map((i) => {
    const t = ((frame * 0.4 + i * 42) % 140) / 140;
    return { x: 1150 + i * 210, y: 780 - t * 430, r: 30 + t * 34, heat: 0.9 - t * 0.55, key: i };
  });
  return (
    <Scene dur={dur}>
      <Sky top="#03060F" mid="#0A1526" bottom="#0E2038" stars={44} seed={301} />
      <Headline kicker="SAME AIR, DIFFERENT STORY" title="都是 37℃，差别只在“膨胀”" accent={ACCENT.ice} progress={head} size={52} />
      <div style={{ position: "absolute", inset: 0, opacity: compareO }}>
        <div style={{ position: "absolute", left: 260, top: 400, width: 560, padding: "34px 40px", borderRadius: 24, border: `1px solid ${ACCENT.warm}44`, backgroundColor: "rgba(20,12,10,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Tag color={ACCENT.warm} size={22} solid>张大嘴 · 哈</Tag>
            <span style={{ fontFamily: "monospace", fontSize: 30, fontWeight: 800, color: ACCENT.warm }}>37℃</span>
          </div>
          <div style={{ marginTop: 18, fontSize: 30, fontWeight: 800 }}>气流慢 · 几乎不膨胀</div>
          <div style={{ marginTop: 10, color: "rgba(235,243,255,0.55)", fontSize: 22 }}>热量没被消耗 → 暖</div>
        </div>
        <div style={{ position: "absolute", right: 260, top: 400, width: 560, padding: "34px 40px", borderRadius: 24, border: `1px solid ${ACCENT.cyan}44`, backgroundColor: "rgba(8,16,26,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Tag color={ACCENT.cyan} size={22} solid>噘嘴 · 吹</Tag>
            <span style={{ fontFamily: "monospace", fontSize: 30, fontWeight: 800, color: ACCENT.cyan }}>37℃</span>
          </div>
          <div style={{ marginTop: 18, fontSize: 30, fontWeight: 800 }}>窄口喷出 · 瞬间膨胀</div>
          <div style={{ marginTop: 10, color: "rgba(235,243,255,0.55)", fontSize: 22 }}>消耗内能 → 凉</div>
        </div>
        <div style={{ position: "absolute", left: 260, right: 260, top: 700, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: pop(frame, fps, at(0.3, dur)) }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 120, height: 120, borderRadius: "50%", border: `2px solid ${ACCENT.ice}55`, backgroundColor: "rgba(127,227,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: ACCENT.ice }}>
                  {s.label}
                </div>
                <div style={{ marginTop: 12, fontFamily: "monospace", fontSize: 17, color: "rgba(235,243,255,0.5)" }}>{s.sub}</div>
              </div>
              {i < steps.length - 1 ? <div style={{ flex: 1, height: 2, margin: "0 16px", background: `repeating-linear-gradient(90deg, ${ACCENT.ice}66 0 10px, transparent 10px 20px)` }} /> : null}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: mountainO }}>
        <Ground y={860} heat={0.7} height={220} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d="M1080 1080 L1500 380 L1620 460 L1760 340 L1920 520 L1920 1080 Z" fill="#0E1F31" />
          <path d="M1500 380 L1560 440 L1620 460 L1580 500 L1520 470 Z" fill="#CFF3FF" opacity={0.8} />
        </svg>
        {risingParcels.map((p) => (
          <Parcel key={p.key} x={p.x} y={p.y} r={p.r} heat={p.heat} />
        ))}
        {[0, 1].map((i) => (
          <Arrow key={i} x1={1120 + i * 300} y1={760} x2={1120 + i * 300} y2={420} color={ACCENT.ice} width={3} dashed progress={mountainO} />
        ))}
        <div style={{ position: "absolute", left: 200, top: 420 }}>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.5 }}>
            高空的空气
            <br />
            <span style={{ color: ACCENT.ice }}>每天都在经历</span>
          </div>
          <div style={{ marginTop: 20, fontSize: 24, color: "rgba(235,243,255,0.55)" }}>上升 → 膨胀 → 降温 → 下沉回流</div>
        </div>
        <div style={{ position: "absolute", left: 200, top: 640, opacity: pop(frame, fps, at(0.66, dur)) }}>
          <Tag color={ACCENT.cyan} size={22}>大气对流：一台巨型制冷机</Tag>
        </div>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 31 · Duvet — thick down blanket traps heat                          */
/* ------------------------------------------------------------------ */
export const Duvet: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const tag = pop(frame, fps, at(0.5, dur));
  const mols = [
    { x: 500, y: 430, c: ACCENT.cyan, l: "H₂O" },
    { x: 760, y: 380, c: ACCENT.violet, l: "CO₂" },
    { x: 1060, y: 420, c: ACCENT.cyan, l: "H₂O" },
    { x: 1340, y: 370, c: "#D8B48C", l: "尘埃" },
    { x: 1560, y: 440, c: ACCENT.violet, l: "CO₂" },
  ];
  return (
    <Scene dur={dur}>
      <Sky top="#070409" mid="#140F16" bottom="#1E1512" stars={30} seed={311} />
      <Headline kicker="LOW ALTITUDE · 低海拔" title="空气稠密，像盖了一层厚厚的羽绒被" accent={ACCENT.warm} progress={head} size={50} />
      {mols.map((m) => (
        <Molecule key={m.l + m.x} x={m.x} y={m.y} label={m.l} color={m.c} r={28} />
      ))}
      <DuvetLayer x={420} y={560} w={1080} h={150} color={ACCENT.warm} thickness={1} />
      <Ground y={840} heat={0.9} height={240} />
      {/* trapped heat */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const bounce = Math.abs(Math.sin(frame / (16 + i * 3) + i));
        const y = 828 - bounce * 200;
        return (
          <div key={i} style={{ position: "absolute", left: 520 + i * 150, top: y }}>
            <HeatArrow x={0} y={0} dir={bounce < 0.5 ? -1 : 1} color={ACCENT.ember} len={26} opacity={0.75} />
          </div>
        );
      })}
      {[0, 1, 2].map((i) => (
        <HeatWave key={i} x={560 + i * 300} y={690 - i * 14} w={200} amp={8} thickness={4} phase={i * 1.6} opacity={0.4} />
      ))}
      <div style={{ position: "absolute", right: 210, top: 300, opacity: tag }}>
        <Tag color={ACCENT.lime} size={24} solid>热量：被锁住 ✓</Tag>
      </div>
      <div style={{ position: "absolute", left: 150, top: 300, opacity: tag }}>
        <Tag color="rgba(235,243,255,0.7)" size={20}>水汽 · 尘埃 · 二氧化碳</Tag>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 130, textAlign: "center", opacity: tag, fontFamily: "inherit", fontSize: 26, color: "rgba(255,228,205,0.7)" }}>
        上升的热量，被“棉被”挡了回来
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 32 · Gauze — thin veil, heat escapes to space                       */
/* ------------------------------------------------------------------ */
export const Gauze: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const tag = pop(frame, fps, at(0.42, dur));
  const mols = [
    { x: 640, y: 520, c: ACCENT.cyan, l: "H₂O" },
    { x: 1480, y: 500, c: ACCENT.violet, l: "CO₂" },
  ];
  const escape = [0, 1, 2, 3, 4].map((i) => {
    const t = ((frame * 0.6 + i * 30) % 130) / 130;
    return { x: 560 + i * 210, y: 820 - t * 760, o: t < 0.86 ? Math.sin(t * Math.PI) * 0.8 : 0, key: i };
  });
  return (
    <Scene dur={dur}>
      <Sky top="#01030A" mid="#050F1E" bottom="#0A1B2E" stars={100} seed={321} />
      <Headline kicker="HIGH ALTITUDE · 高海拔" title="羽绒被变成了薄纱巾，热量直逃太空" accent={ACCENT.ice} progress={head} size={50} />
      <Ground y={860} heat={0.65} height={220} />
      <Motes count={60} seed={33} color="#DCEBFF" rise={0.2} size={2.2} opacity={0.5} />
      {mols.map((m) => (
        <Molecule key={m.l + m.x} x={m.x} y={m.y} label={m.l} color={m.c} r={26} />
      ))}
      {/* gauze veil */}
      <svg width={1920} height={240} style={{ position: "absolute", left: 0, top: 600, overflow: "visible" }}>
        <defs>
          <linearGradient id="gauzeFabric" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#CFF3FF" stopOpacity={0.2} />
            <stop offset="0.55" stopColor="#8FD8FF" stopOpacity={0.08} />
            <stop offset="1" stopColor="#8FD8FF" stopOpacity={0.02} />
          </linearGradient>
          <pattern id="gauzeMesh" width={30} height={24} patternUnits="userSpaceOnUse" patternTransform="rotate(-5)">
            <path d="M0 0 H30 M0 0 V24" fill="none" stroke="#CFF3FF" strokeWidth={1} opacity={0.18} />
          </pattern>
        </defs>
        <path
          d={`M300 120 C480 ${90 + Math.sin(frame / 30) * 6} 660 100 820 118 C1020 140 1220 96 1340 116 C1480 128 1580 108 1660 122 L1640 150 C1500 160 1400 130 1240 146 C1060 164 940 130 880 148 C700 168 520 ${128 + Math.cos(frame / 26) * 7} 330 150 Z`}
          fill="url(#gauzeFabric)"
          stroke="rgba(207,243,255,0.38)"
          strokeWidth={1.6}
        />
        <path
          d={`M300 120 C480 ${90 + Math.sin(frame / 30) * 6} 660 100 820 118 C1020 140 1220 96 1340 116 C1480 128 1580 108 1660 122 L1640 150 C1500 160 1400 130 1240 146 C1060 164 940 130 880 148 C700 168 520 ${128 + Math.cos(frame / 26) * 7} 330 150 Z`}
          fill="url(#gauzeMesh)"
        />
        <path
          d={`M300 120 C480 ${90 + Math.sin(frame / 30) * 6} 660 100 820 118 C1020 140 1220 96 1340 116 C1480 128 1580 108 1660 122`}
          fill="none"
          stroke="rgba(207,243,255,0.62)"
          strokeWidth={2.2}
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${1640 + i * 6} ${138 + i * 2} q18 10 28 4`} fill="none" stroke="#CFF3FF" strokeWidth={1.4} opacity={0.34} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 1360, top: 560, fontFamily: "monospace", fontSize: 18, letterSpacing: "0.2em", color: "rgba(207,243,255,0.6)" }}>
        薄纱巾 · 稀薄干燥
      </div>
      {/* escaping heat */}
      {escape.map((e) => (
        <div key={e.key} style={{ position: "absolute", left: e.x, top: e.y, opacity: e.o }}>
          <HeatArrow x={0} y={0} dir={-1} color={ACCENT.ice} len={40} opacity={0.9} />
        </div>
      ))}
      {[0, 1].map((i) => (
        <HeatWave key={i} x={700 + i * 420} y={780 - i * 30} w={240} amp={9} thickness={4} phase={i * 2} opacity={0.35} />
      ))}
      <div style={{ position: "absolute", right: 200, top: 280, opacity: tag }}>
        <Tag color={ACCENT.ice} size={24} solid>热量 → 逃逸太空</Tag>
      </div>
      <div style={{ position: "absolute", left: 150, top: 280, opacity: tag }}>
        <Tag color="rgba(235,243,255,0.7)" size={20}>高海拔 · 空气稀薄 · 水汽极少</Tag>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 130, textAlign: "center", opacity: tag, fontFamily: "inherit", fontSize: 30, color: "rgba(207,243,255,0.8)" }}>
        留不住温度，只剩冷
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 33 · Outro — recap + title card (music only)                        */
/* ------------------------------------------------------------------ */
export const Outro: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t1 = pop(frame, fps, 8, { damping: 16, stiffness: 90, mass: 1 });
  const t2 = pop(frame, fps, 26, { damping: 16, stiffness: 90, mass: 1 });
  const t3 = pop(frame, fps, 44, { damping: 16, stiffness: 90, mass: 1 });
  const title = pop(frame, fps, 66, { damping: 18, stiffness: 70, mass: 1.1 });
  const fade = interpolate(frame, [dur - 40, dur - 2], [1, 0], CLAMP);
  const chips = [
    { num: "01", label: "距离的错觉", c: ACCENT.indigo },
    { num: "02", label: "地面暖气片", c: ACCENT.ember },
    { num: "03", label: "绝热膨胀 + 棉被", c: ACCENT.cyan },
  ];
  return (
    <Scene dur={dur} fadeIn={12} fadeOut={24}>
      <Sky top="#02040A" mid="#070D1A" bottom="#0B1526" stars={110} nebula={ACCENT.ice} seed={331} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", justifyContent: "center", gap: 70, opacity: fade }}>
        {chips.map((c, i) => (
          <div key={c.num} style={{ opacity: i === 0 ? t1 : i === 1 ? t2 : t3, transform: `translateY(${(1 - (i === 0 ? t1 : i === 1 ? t2 : t3)) * 36}px)`, textAlign: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 20, color: `${c.c}`, letterSpacing: "0.3em" }}>{c.num}</div>
            <div style={{ marginTop: 12, fontSize: 30, fontWeight: 800 }}>{c.label}</div>
            <div style={{ marginTop: 16, width: 220, height: 3, borderRadius: 2, background: `linear-gradient(90deg, transparent, ${c.c}, transparent)` }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center", opacity: fade }}>
        <div style={{ fontSize: 26, fontFamily: "monospace", letterSpacing: "0.5em", color: ACCENT.ice, opacity: title }}>
          THE TRUTH
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 118,
            fontWeight: 900,
            letterSpacing: "0.05em",
            transform: `translateY(${(1 - title) * 46}px) scale(${0.96 + 0.04 * title})`,
            opacity: title,
          }}
        >
          高处不胜<span style={{ color: ACCENT.ice }}>寒</span>的真相
        </div>
        <div style={{ marginTop: 44, fontSize: 32, color: "rgba(235,243,255,0.75)", opacity: t3, transform: `translateY(${(1 - t3) * 24}px)`, lineHeight: 1.7 }}>
          太阳从未失灵。是大地在供暖，
          <br />
          而你，正离它越来越远。
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", opacity: t3 * 0.55, fontFamily: "monospace", fontSize: 20, letterSpacing: "0.3em", color: "rgba(235,243,255,0.6)" }}>
        口播 · 原创文稿&nbsp;&nbsp;/&nbsp;&nbsp;配乐 · 原创氛围音乐
      </div>
    </Scene>
  );
};
