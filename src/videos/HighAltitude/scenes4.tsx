import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  ACCENT,
  ChapterCard,
  DuvetLayer,
  Ground,
  Headline,
  HeatWave,
  Molecule,
  Parcel,
  pop,
  Scene,
  seeded,
  seg,
  Sky,
  Tag,
} from "./primitives";

const at = (p: number, dur: number) => Math.round(p * dur);

/* local: small upward arrow */
const UpArrow: React.FC<{ x: number; y: number; len?: number; color?: string; opacity?: number }> = ({
  x,
  y,
  len = 30,
  color = ACCENT.ember,
  opacity = 0.8,
}) => (
  <svg width={30} height={len + 10} viewBox={`0 0 30 ${len + 10}`} style={{ position: "absolute", left: x - 15, top: y - len - 10, overflow: "visible", opacity }}>
    <line x1={15} y1={len + 8} x2={15} y2={4} stroke={color} strokeWidth={3.2} strokeLinecap="round" />
    <path d={`M8 12 L15 3 L22 12`} fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Falloff — higher air receives less heat from the radiator           */
/* ------------------------------------------------------------------ */
export const Falloff: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const parcels = [
    { x: 620, y: 820, r: 44, heat: 0.92, alt: "近地面", gain: 1 },
    { x: 850, y: 620, r: 54, heat: 0.55, alt: "1500 m", gain: 0.55 },
    { x: 1090, y: 415, r: 64, heat: 0.2, alt: "3000 m", gain: 0.22 },
  ];
  const barsIn = seg(frame, at(0.3, dur), at(0.8, dur), 0, 1);
  return (
    <Scene dur={dur}>
      <Sky top="#050409" mid="#120D14" bottom="#1B1210" stars={38} seed={281} />
      <Headline kicker="FALLOFF · 离暖气片越远" title="升得越高，分到的热量越少" accent={ACCENT.ember} progress={head} size={54} />
      <div style={{ position: "absolute", left: 120, top: 400, width: 1100, height: 600, background: `radial-gradient(ellipse at 32% 100%, ${ACCENT.ember}55 0%, transparent 62%)`, mixBlendMode: "screen" }} />
      <Ground y={870} heat={0.85} height={210} label="GROUND · 暖气片" />
      {[0, 1, 2, 3].map((i) => (
        <HeatWave key={i} x={430 + i * 160} y={800 - i * 18} w={210} amp={9} thickness={4} phase={i * 1.7} opacity={0.4 - i * 0.07} />
      ))}
      {/* altitude axis */}
      <div style={{ position: "absolute", left: 330, top: 330, height: 540, width: 2, background: "linear-gradient(180deg, rgba(255,122,69,0.06), rgba(255,122,69,0.45))" }} />
      {[
        { y: 830, label: "0 m" },
        { y: 620, label: "1500 m" },
        { y: 410, label: "3000 m" },
      ].map((lv) => (
        <React.Fragment key={lv.label}>
          <div style={{ position: "absolute", left: 318, top: lv.y, width: 26, height: 2, backgroundColor: "rgba(255,200,170,0.5)" }} />
          <div style={{ position: "absolute", left: 190, top: lv.y - 13, width: 116, textAlign: "right", fontFamily: "monospace", fontSize: 19, color: "rgba(255,220,200,0.55)" }}>{lv.label}</div>
        </React.Fragment>
      ))}
      {parcels.map((p, i) => {
        const pp = pop(frame, fps, at(0.14, dur) + i * 12);
        return (
          <div key={p.alt} style={{ position: "absolute", left: p.x, top: p.y, opacity: pp }}>
            <Parcel x={0} y={0} r={p.r} heat={p.heat} label={p.alt} />
            <div style={{ position: "absolute", left: 0, top: -p.r - 50, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
              <Tag color={i === 0 ? ACCENT.ember : ACCENT.ice} size={17}>{i === 0 ? "热量充足" : i === 1 ? "热量减半" : "所剩无几"}</Tag>
            </div>
          </div>
        );
      })}
      {/* heat gain bars */}
      <div style={{ position: "absolute", right: 130, top: 350, width: 430, padding: "30px 34px", borderRadius: 22, border: "1px solid rgba(255,122,69,0.28)", backgroundColor: "rgba(12,8,10,0.72)" }}>
        <div style={{ fontFamily: "monospace", fontSize: 17, letterSpacing: "0.26em", color: "rgba(255,200,170,0.65)" }}>获得的热量</div>
        {parcels.map((p, i) => (
          <div key={p.alt} style={{ marginTop: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "inherit", fontSize: 20, color: "rgba(235,243,255,0.6)" }}>
              <span>{p.alt}</span>
              <span style={{ color: i === 0 ? ACCENT.ember : ACCENT.ice }}>{i === 0 ? "满格" : i === 1 ? "过半" : "稀薄"}</span>
            </div>
            <div style={{ marginTop: 8, height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ width: `${p.gain * 100 * barsIn}%`, height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${ACCENT.ember}, ${ACCENT.warm})` }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 26, fontFamily: "inherit", fontSize: 19, lineHeight: 1.5, color: "rgba(235,243,255,0.42)" }}>
          空气靠地面“喂饱”，<br />离得越远，分到越少。
        </div>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Chapter 03A — thin air comes first                                  */
/* ------------------------------------------------------------------ */
export const Chapter3A: React.FC<{ dur: number }> = ({ dur }) => (
  <Scene dur={dur}>
    <Sky top="#020610" mid="#061224" bottom="#0A1A2E" stars={70} nebula={ACCENT.cyan} seed={252} />
    <ChapterCard num="03" title="空气的自我消耗" subtitle="高空空气 · 难留热量" accent={ACCENT.cyan} dur={dur} en="SELF-CONSUMPTION" />
  </Scene>
);

/* ------------------------------------------------------------------ */
/* ThinAir — density drops with altitude                               */
/* ------------------------------------------------------------------ */
export const ThinAir: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const dens = 100 - 67 * seg(frame, at(0.42, dur), at(0.82, dur), 0, 1);
  const card = pop(frame, fps, at(0.3, dur));
  const rnd = seeded(881);
  const dots = new Array(110).fill(0).map(() => {
    const x = rnd();
    const r = rnd();
    const ph = rnd();
    return { x: 1000 + x * 470, y: 300 + Math.pow(r, 1.7) * 540, s: 2.2 + r * 2.4, ph };
  });
  return (
    <Scene dur={dur}>
      <Sky top="#020710" mid="#051326" bottom="#081A2C" stars={54} nebula={ACCENT.cyan} seed={282} />
      <Headline kicker="THIN AIR · 空气变稀薄" title="越往高处，空气密度越低" accent={ACCENT.cyan} progress={head} size={54} />
      {/* mountain */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="thin-mtn" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#122A3C" />
            <stop offset="100%" stopColor="#2A4258" />
          </linearGradient>
        </defs>
        <path d="M120 870 L360 520 L480 650 L620 470 L840 870 Z" fill="url(#thin-mtn)" opacity={0.9} />
        <path d="M560 560 L620 470 L680 560 L640 540 L620 566 L596 538 Z" fill="#EAF6FF" opacity={0.92} />
        <path d="M340 620 L360 520 L392 590 L372 576 L356 600 Z" fill="#DDEEFF" opacity={0.75} />
      </svg>
      <div style={{ position: "absolute", left: 620, top: 415, transform: "translateX(-50%)" }}>
        <Tag color="#EAF6FF" size={20}>8848 m · 珠峰</Tag>
      </div>
      {/* air column density field */}
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x + Math.sin(frame * 0.02 + d.ph * 6) * 8,
            top: d.y + Math.cos(frame * 0.017 + d.ph * 5) * 6,
            width: d.s,
            height: d.s,
            borderRadius: "50%",
            backgroundColor: ACCENT.ice,
            opacity: 0.16 + d.ph * 0.38,
          }}
        />
      ))}
      {/* density label */}
      <div style={{ position: "absolute", left: 1010, top: 250, opacity: pop(frame, fps, at(0.16, dur)) }}>
        <div style={{ fontFamily: "monospace", fontSize: 17, letterSpacing: "0.26em", color: "rgba(207,243,255,0.6)" }}>AIR DENSITY · 空气密度</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
          <span style={{ fontFamily: "monospace", fontSize: 82, fontWeight: 800, color: ACCENT.ice, fontVariantNumeric: "tabular-nums" }}>{Math.round(dens)}</span>
          <span style={{ fontFamily: "monospace", fontSize: 30, color: "rgba(207,243,255,0.6)" }}>%</span>
        </div>
        <div style={{ width: 300, height: 14, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden", marginTop: 12 }}>
          <div style={{ width: `${dens}%`, height: "100%", borderRadius: 7, background: `linear-gradient(90deg, ${ACCENT.indigo}, ${ACCENT.cyan})` }} />
        </div>
      </div>
      {/* side insight card */}
      <div style={{ position: "absolute", right: 130, top: 470, width: 350, padding: "28px 32px", borderRadius: 22, border: "1px solid rgba(127,227,255,0.24)", backgroundColor: "rgba(6,14,26,0.78)", opacity: card }}>
        <div style={{ fontFamily: "monospace", fontSize: 17, letterSpacing: "0.24em", color: "rgba(207,243,255,0.55)" }}>AT 8848 M</div>
        <div style={{ marginTop: 12, fontSize: 30, fontWeight: 800, lineHeight: 1.4 }}>
          空气密度
          <br />
          只剩三分之一
        </div>
        <div style={{ marginTop: 14, fontSize: 19, lineHeight: 1.6, color: "rgba(235,243,255,0.5)" }}>
          同样一口气，<br />含氧量也少得多。
        </div>
      </div>
      <Ground y={900} heat={0.25} height={180} />
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* MoleculeCollide — sparse air keeps less heat                        */
/* ------------------------------------------------------------------ */
const SPARSE_LAYOUT = [
  { bx: 0.18, by: 0.34 },
  { bx: 0.52, by: 0.28 },
  { bx: 0.84, by: 0.36 },
  { bx: 0.28, by: 0.62 },
  { bx: 0.62, by: 0.56 },
  { bx: 0.86, by: 0.72 },
  { bx: 0.46, by: 0.84 },
];

const GasPanel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  count: number;
  seed: number;
  dense: boolean;
  title: string;
  sub: string;
  tag: string;
  tagColor: string;
  progress: number;
}> = ({ x, y, w, h, count, seed, dense, title, sub, tag, tagColor, progress }) => {
  const frame = useCurrentFrame();
  const rnd = seeded(seed);
  const mols = new Array(count).fill(0).map((_, i) => {
    // sparse panels use a fixed spread so the few molecules never overlap
    const layout = count <= 8 ? SPARSE_LAYOUT[i % SPARSE_LAYOUT.length] : { bx: rnd(), by: rnd() };
    return {
      bx: layout.bx + (rnd() - 0.5) * 0.05,
      by: layout.by + (rnd() - 0.5) * 0.05,
      sp: 0.016 + rnd() * 0.014,
      ph: rnd() * 6.28,
      label: rnd() > 0.5 ? "H₂O" : "CO₂",
      c: rnd() > 0.5 ? ACCENT.cyan : ACCENT.violet,
    };
  });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, border: `1.5px solid ${dense ? ACCENT.ice + "3d" : ACCENT.ember + "3d"}`, backgroundColor: dense ? "rgba(8,20,34,0.6)" : "rgba(20,12,14,0.6)", overflow: "hidden", opacity: progress }}>
      <div style={{ position: "absolute", left: 30, top: 24 }}>
        <div style={{ fontFamily: "monospace", fontSize: 16, letterSpacing: "0.26em", color: dense ? "rgba(207,243,255,0.6)" : "rgba(255,220,200,0.6)" }}>{sub}</div>
        <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>{title}</div>
      </div>
      {/* molecules (panel-local coordinates) */}
      {(() => {
        const pts = mols.map((m) => ({
          ...m,
          cx: w / 2 + Math.sin(frame * m.sp + m.ph) * (m.bx - 0.5) * 2 * (w / 2 - 56),
          cy: h / 2 + 12 + Math.cos(frame * m.sp * 0.9 + m.ph * 1.3) * (m.by - 0.5) * 2 * (h / 2 - 76),
        }));
        return (
          <>
            {dense ? (
              <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
                {pts.flatMap((a, i) =>
                  pts.slice(i + 1).map((b, j) => {
                    const d = Math.hypot(a.cx - b.cx, a.cy - b.cy);
                    if (d > 105) return null;
                    return (
                      <line
                        key={`${i}-${j}`}
                        x1={a.cx}
                        y1={a.cy}
                        x2={b.cx}
                        y2={b.cy}
                        stroke={ACCENT.ice}
                        strokeWidth={1.5}
                        opacity={(1 - d / 105) * 0.55}
                      />
                    );
                  }),
                )}
              </svg>
            ) : null}
            {pts.map((m, i) => {
              if (!dense) {
                return <Molecule key={i} x={m.cx} y={m.cy} label={m.label} color={m.c} r={26} />;
              }
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: m.cx - 16,
                    top: m.cy - 16,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: `2.5px solid ${m.c}`,
                    backgroundColor: `${m.c}22`,
                    boxShadow: `0 0 14px ${m.c}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: m.c, opacity: 0.8 }} />
                </div>
              );
            })}
          </>
        );
      })()}
      {/* heat behavior */}
      {dense
        ? [0, 1, 2].map((i) => (
            <HeatWave key={i} x={60 + i * 210} y={h - 86 - i * 30} w={180} amp={8} thickness={3.4} phase={i * 1.6} opacity={0.5} />
          ))
        : [0, 1, 2].map((i) => <UpArrow key={i} x={w / 2 - 90 + i * 90} y={h - 40} len={110 + i * 26} color={ACCENT.ember} opacity={0.5} />)}
      <div style={{ position: "absolute", left: 30, bottom: 26 }}>
        <Tag color={tagColor} size={20}>{tag}</Tag>
      </div>
    </div>
  );
};

export const MoleculeCollide: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const left = pop(frame, fps, at(0.1, dur));
  const right = pop(frame, fps, at(0.24, dur));
  const stamp = pop(frame, fps, at(0.68, dur), { damping: 10, stiffness: 160, mass: 0.9 });
  return (
    <Scene dur={dur}>
      <Sky top="#03060F" mid="#0A1322" bottom="#101A2C" stars={44} seed={283} />
      <Headline kicker="COLLISION FREQUENCY · 碰撞频率" title="分子越少，热量越难留住" accent={ACCENT.cyan} progress={head} size={52} />
      <GasPanel x={110} y={270} w={840} h={500} count={22} seed={31} dense title="低空 · 空气稠密" sub="DENSE AIR" tag="碰撞频繁 → 热量留得住" tagColor={ACCENT.lime} progress={left} />
      <GasPanel x={970} y={270} w={840} h={500} count={7} seed={77} dense={false} title="高空 · 空气稀薄" sub="THIN AIR" tag="碰撞稀少 → 热量留不住" tagColor={ACCENT.ember} progress={right} />
      <div style={{ position: "absolute", left: "50%", top: 520, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * stamp})`, opacity: stamp }}>
        <div style={{ width: 108, height: 108, borderRadius: "50%", border: `2px solid ${ACCENT.lime}66`, backgroundColor: "rgba(6,12,24,0.94)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: ACCENT.lime, letterSpacing: "0.06em" }}>VS</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", opacity: pop(frame, fps, at(0.8, dur)), fontSize: 28, color: "rgba(235,243,255,0.6)" }}>
        分子聚不在一起，就很难把热量“攒”住。
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Summary — the verdict                                               */
/* ------------------------------------------------------------------ */
const VERDICT = [
  { n: "01", title: "距离的错觉", body: "高山离太阳近的那一点，微不足道", ok: false, color: ACCENT.indigo },
  { n: "02", title: "暖气片在脚下", body: "真正烤暖空气的，是脚下的地面", ok: true, color: ACCENT.ember },
  { n: "03", title: "空气留不住热", body: "稀薄、低热传导，越高越冷", ok: true, color: ACCENT.cyan },
];

export const Summary: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const line = pop(frame, fps, at(0.78, dur), { damping: 12, stiffness: 130, mass: 0.9 });
  return (
    <Scene dur={dur}>
      <Sky top="#02060F" mid="#081322" bottom="#0D1B2E" stars={52} seed={284} />
      <Headline kicker="THE VERDICT · 三条线索汇合" title="把它们收成一句话" accent={ACCENT.ice} progress={head} size={52} />
      {VERDICT.map((v, i) => {
        const p = pop(frame, fps, at(0.16, dur) + i * 14);
        return (
          <div
            key={v.n}
            style={{
              position: "absolute",
              left: 150,
              top: 280 + i * 176,
              width: 1620,
              height: 150,
              borderRadius: 20,
              border: `1.5px solid ${v.color}3d`,
              backgroundColor: "rgba(6,12,22,0.72)",
              opacity: p,
              transform: `translateX(${(1 - p) * -40}px)`,
              display: "flex",
              alignItems: "center",
              gap: 34,
              padding: "0 44px",
            }}
          >
            <div style={{ fontFamily: "monospace", fontSize: 46, fontWeight: 800, color: `${v.color}aa`, width: 90 }}>{v.n}</div>
            <div style={{ width: 2, height: 80, backgroundColor: `${v.color}33` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 34, fontWeight: 800 }}>{v.title}</div>
              <div style={{ fontSize: 22, color: "rgba(235,243,255,0.52)", marginTop: 8 }}>{v.body}</div>
            </div>
            <div
              style={{
                padding: "10px 26px",
                borderRadius: 999,
                border: `2px solid ${v.ok ? ACCENT.lime : ACCENT.red}`,
                backgroundColor: v.ok ? `${ACCENT.lime}1f` : `${ACCENT.red}1f`,
                color: v.ok ? ACCENT.lime : ACCENT.red,
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "0.12em",
                whiteSpace: "nowrap",
              }}
            >
              {v.ok ? "✓ 真相" : "✕ 错觉"}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 860,
          textAlign: "center",
          fontSize: 42,
          fontWeight: 800,
          letterSpacing: "0.02em",
          color: ACCENT.ice,
          opacity: line,
          transform: `scale(${0.92 + 0.08 * line})`,
          textShadow: `0 0 44px ${ACCENT.ice}55`,
        }}
      >
        真正供暖的源泉，并不在空中。
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* Processes — two cooling processes                                   */
/* ------------------------------------------------------------------ */
const SprayCan: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const frame = useCurrentFrame();
  const puff = 0.7 + 0.3 * Math.sin(frame * 0.18);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${scale})` }}>
      <svg width={300} height={200} viewBox="0 0 300 200">
        <rect x={40} y={74} width={86} height={112} rx={16} fill="#1B2A3A" stroke="#7FE3FF" strokeWidth={3} />
        <rect x={58} y={48} width={50} height={30} rx={6} fill="#24384C" stroke="#7FE3FF" strokeWidth={3} />
        <rect x={78} y={36} width={12} height={16} rx={3} fill="#7FE3FF" />
        <circle cx={84} cy={130} r={17} fill="none" stroke="rgba(127,227,255,0.6)" strokeWidth={3} />
        <path d="M84 116 v28 M70 130 h28" stroke="rgba(127,227,255,0.6)" strokeWidth={3} strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={128 + i * 40 + puff * 14} cy={84 + Math.sin(i * 1.7 + frame * 0.1) * 10} r={2 + i * 1.2} fill="#8FD8FF" opacity={0.5} />
        ))}
        <path d="M128 70 L286 40 L286 128 L128 100 Z" fill="rgba(127,227,255,0.14)" />
        <path d="M128 70 L286 40 M128 100 L286 128" stroke="rgba(127,227,255,0.35)" strokeWidth={2} />
      </svg>
    </div>
  );
};

export const Processes: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const c1 = pop(frame, fps, at(0.1, dur), { damping: 14, stiffness: 110, mass: 1 });
  const c2 = pop(frame, fps, at(0.3, dur), { damping: 14, stiffness: 110, mass: 1 });
  const footer = pop(frame, fps, at(0.72, dur));
  return (
    <Scene dur={dur}>
      <Sky top="#02060F" mid="#071322" bottom="#0A192A" stars={48} seed={285} />
      <Headline kicker="TWO COOLING PROCESSES · 两个降温过程" title="离得远还不够，空气自己还会变冷" accent={ACCENT.cyan} progress={head} size={50} />
      {/* card 1 */}
      <div style={{ position: "absolute", left: 120, top: 300, width: 810, height: 470, borderRadius: 26, border: "1.5px solid rgba(127,227,255,0.3)", backgroundColor: "rgba(6,14,26,0.7)", opacity: c1, transform: `translateY(${(1 - c1) * 30}px)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 40, top: 32, fontFamily: "monospace", fontSize: 20, letterSpacing: "0.24em", color: ACCENT.cyan }}>PROCESS · 01</div>
        <div style={{ position: "absolute", left: 40, top: 70, fontSize: 42, fontWeight: 900 }}>膨胀降温</div>
        <div style={{ position: "absolute", left: 40, top: 128, fontSize: 22, color: "rgba(235,243,255,0.55)" }}>像喷雾罐一样，越喷越冷</div>
        <SprayCan x={80} y={196} scale={1.12} />
        <div style={{ position: "absolute", left: 400, top: 306, fontFamily: "monospace", fontSize: 19, letterSpacing: "0.2em", color: "rgba(207,243,255,0.55)" }}>
          气压 ↓ · 体积 ↑
        </div>
        <div style={{ position: "absolute", left: 400, top: 340, fontSize: 18, color: "rgba(235,243,255,0.4)" }}>对外做功，内能减少</div>
        <div style={{ position: "absolute", right: 36, top: 232, textAlign: "right" }}>
          <div style={{ fontFamily: "monospace", fontSize: 48, fontWeight: 800, color: ACCENT.ice }}>-31℃</div>
          <div style={{ fontSize: 18, color: "rgba(207,243,255,0.5)", marginTop: 6 }}>气体膨胀，温度骤降</div>
        </div>
      </div>
      {/* card 2 */}
      <div style={{ position: "absolute", left: 990, top: 300, width: 810, height: 470, borderRadius: 26, border: "1.5px solid rgba(255,122,69,0.3)", backgroundColor: "rgba(16,10,12,0.7)", opacity: c2, transform: `translateY(${(1 - c2) * 30}px)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 40, top: 32, fontFamily: "monospace", fontSize: 20, letterSpacing: "0.24em", color: ACCENT.ember }}>PROCESS · 02</div>
        <div style={{ position: "absolute", left: 40, top: 70, fontSize: 42, fontWeight: 900 }}>棉被变薄</div>
        <div style={{ position: "absolute", left: 40, top: 128, fontSize: 22, color: "rgba(235,243,255,0.55)" }}>保温层少了，热量更容易跑掉</div>
        <DuvetLayer x={70} y={270} w={670} h={120} color="#FFB347" thickness={0.9} />
        {[0, 1, 2, 3, 4].map((i) => (
          <UpArrow key={i} x={160 + i * 130} y={310 - ((frame * 0.9 + i * 34) % 80)} len={34} color={ACCENT.warm} opacity={0.55} />
        ))}
        <div style={{ position: "absolute", right: 40, top: 36, textAlign: "right" }}>
          <div style={{ fontFamily: "monospace", fontSize: 48, fontWeight: 800, color: ACCENT.ember }}>散失 ↑</div>
          <div style={{ fontSize: 18, color: "rgba(255,220,200,0.5)", marginTop: 6 }}>热量直逃太空</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", fontSize: 26, color: "rgba(235,243,255,0.55)", opacity: footer }}>
        一个来自空气自己，一个来自越来越薄的“棉被”。
      </div>
    </Scene>
  );
};
