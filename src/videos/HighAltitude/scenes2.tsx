import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  ACCENT,
  Arrow,
  ChapterCard,
  Climber,
  Ground,
  Headline,
  HeatWave,
  Molecule,
  Motes,
  Parcel,
  pop,
  Scene,
  seg,
  Sky,
  Sun,
  Tag,
  Thermometer,
  ZigzagRay,
} from "./primitives";

const at = (p: number, dur: number) => Math.round(p * dur);

/* ------------------------------------------------------------------ */
/* 14 · Chapter 02                                                     */
/* ------------------------------------------------------------------ */
export const Chapter2: React.FC<{ dur: number }> = ({ dur }) => (
  <Scene dur={dur}>
    <Sky top="#070409" mid="#160F14" bottom="#1F1410" stars={60} nebula={ACCENT.ember} seed={141} />
    <ChapterCard num="02" title="暖气片在你脚下" subtitle="真正烤暖空气的，是地面" accent={ACCENT.ember} dur={dur} en="THE RADIATOR BELOW" />
  </Scene>
);

/* ------------------------------------------------------------------ */
/* 15 · Source — the direct heat source is the ground                  */
/* ------------------------------------------------------------------ */
export const Source: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const sunChip = pop(frame, fps, at(0.16, dur));
  const groundChip = pop(frame, fps, at(0.5, dur), { damping: 12, stiffness: 140, mass: 0.9 });
  const stamp = pop(frame, fps, at(0.74, dur), { damping: 10, stiffness: 170, mass: 0.8 });
  return (
    <Scene dur={dur}>
      <Sky top="#050409" mid="#120D14" bottom="#1B1210" stars={40} seed={151} />
      <Headline kicker="THE REAL HEAT SOURCE" title="把空气烤暖的，从来不是头顶的太阳" accent={ACCENT.ember} progress={head} size={54} />
      <Sun x={960} y={310} r={76} glow={1.05} rays color={ACCENT.sun} />
      {[0, 1, 2].map((i) => (
        <ZigzagRay key={i} x={760 + i * 200} y1={395} y2={700} color={ACCENT.sun} width={3.5} amp={9} progress={seg(frame, at(0.1, dur) + i * 8, at(0.36, dur) + i * 8, 0, 1)} />
      ))}
      <Ground y={720} heat={0.55 + 0.35 * seg(frame, at(0.3, dur), at(0.8, dur), 0, 1)} height={380} label="GROUND · 地面" />
      {[0, 1, 2, 3].map((i) => (
        <HeatWave key={i} x={640 + i * 180} y={640 - i * 12} w={190} amp={9} thickness={4} phase={i * 1.7} opacity={0.3 + 0.3 * (i % 2)} />
      ))}
      <div style={{ position: "absolute", left: 200, top: 360, opacity: sunChip, transform: `translateY(${(1 - sunChip) * 20}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: ACCENT.red, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#05070C" }}>✕</span>
          <span style={{ fontFamily: "inherit", fontSize: 28, fontWeight: 800 }}>太阳 · 不是直接热源</span>
        </div>
        <div style={{ marginTop: 10, marginLeft: 44, fontFamily: "inherit", fontSize: 20, color: "rgba(235,243,255,0.5)" }}>阳光几乎不加热空气</div>
      </div>
      <div style={{ position: "absolute", right: 200, bottom: 260, opacity: groundChip, transform: `translateY(${(1 - groundChip) * 20}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: ACCENT.lime, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#05070C" }}>✓</span>
          <span style={{ fontSize: 28, fontWeight: 800 }}>地面 · 真正的加热器</span>
        </div>
        <div style={{ marginTop: 10, marginLeft: 44, fontSize: 20, color: "rgba(235,243,255,0.5)" }}>吸收阳光 → 再温暖空气</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 520,
          transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * stamp}) rotate(-6deg)`,
          opacity: stamp,
          fontFamily: "inherit",
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: "0.1em",
          color: ACCENT.ember,
          textShadow: `0 0 50px ${ACCENT.ember}66`,
        }}
      >
        热源 = 地面
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 16 · Picky atmosphere                                               */
/* ------------------------------------------------------------------ */
export const Picky: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const band = pop(frame, fps, at(0.1, dur), { damping: 18, stiffness: 90, mass: 1.1 });
  const stamp = pop(frame, fps, at(0.6, dur), { damping: 9, stiffness: 190, mass: 0.8 });
  const blink = Math.sin(frame / 26) > 0.92 ? 0.15 : 1;
  return (
    <Scene dur={dur}>
      <Sky top="#04060F" mid="#0A1322" bottom="#0D182A" stars={40} seed={161} />
      <Headline kicker="PICKY EATER" title="大气层，是个非常“挑食”的家伙" accent={ACCENT.violet} progress={head} size={54} />
      {/* atmosphere band */}
      <div
        style={{
          position: "absolute",
          left: 260,
          right: 260,
          top: 470,
          height: 260,
          borderRadius: 130,
          border: `2px solid ${ACCENT.violet}55`,
          background: `linear-gradient(180deg, rgba(124,156,255,0.14), rgba(124,156,255,0.05))`,
          boxShadow: `0 0 80px ${ACCENT.violet}22 inset`,
          opacity: band,
          transform: `scale(${0.92 + 0.08 * band})`,
        }}
      >
        <div style={{ position: "absolute", left: 60, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#E8EEFF", opacity: blink }} />
          <div style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#E8EEFF", opacity: blink }} />
        </div>
        <div style={{ position: "absolute", right: 70, top: 20, fontFamily: "inherit", fontSize: 22, letterSpacing: "0.36em", color: "rgba(180,156,255,0.65)" }}>
          ATMOSPHERE · 大气层
        </div>
      </div>
      {/* shortwave passes */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: band }}>
        <ZigzagRay x={560} y1={330} y2={820} color={ACCENT.sun} width={4} amp={11} />
      </div>
      <div style={{ position: "absolute", left: 610, top: 700, opacity: pop(frame, fps, at(0.34, dur)) }}>
        <Tag color={ACCENT.lime} solid size={22}>短波：放行 ✓</Tag>
      </div>
      {/* longwave absorbed */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: band }}>
        {[0, 1, 2].map((i) => (
          <HeatWave key={i} x={1180 + i * 60} y={790 - i * 40} w={210} amp={12} thickness={4.5} phase={i * 1.9} opacity={0.85 - i * 0.2} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 1170, top: 585, opacity: pop(frame, fps, at(0.42, dur)) }}>
        <Tag color={ACCENT.ember} solid size={22}>长波：吸收 ✓</Tag>
      </div>
      {/* arrows */}
      <Arrow x1={560} y1={300} x2={560} y2={430} color={ACCENT.sun} width={3} progress={band} />
      <Arrow x1={1280} y1={800} x2={1280} y2={650} color={ACCENT.ember} width={3} progress={band} />
      <div
        style={{
          position: "absolute",
          right: 210,
          top: 300,
          transform: `rotate(8deg) scale(${0.5 + 0.5 * stamp})`,
          opacity: stamp,
          border: `4px solid ${ACCENT.violet}`,
          borderRadius: 16,
          padding: "14px 34px",
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: "0.16em",
          color: ACCENT.violet,
          boxShadow: `0 0 40px ${ACCENT.violet}44`,
        }}
      >
        挑 食
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 120, textAlign: "center", fontFamily: "inherit", fontSize: 26, color: "rgba(235,243,255,0.55)", opacity: pop(frame, fps, at(0.7, dur)) }}>
        对短波无动于衷，对长波来者不拒
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 17 · Shortwave — passes straight through                            */
/* ------------------------------------------------------------------ */
export const Shortwave: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const labels = pop(frame, fps, at(0.4, dur));
  return (
    <Scene dur={dur}>
      <Sky top="#05060F" mid="#0B1424" bottom="#101C2E" stars={44} seed={171} />
      <Headline kicker="SHORTWAVE · 可见光" title="阳光长驱直入，空气几乎抓不住它" accent={ACCENT.sun} progress={head} size={54} />
      <Sun x={180} y={460} r={74} glow={1.1} rays color={ACCENT.sun} />
      {[0, 1, 2, 3, 4].map((i) => (
        <ZigzagRay key={i} x={370 + i * 260} y1={470 + i * 18} y2={800} color={ACCENT.sun} width={3.2 + (i % 2)} amp={8} speed={2.6} progress={seg(frame, at(0.1, dur) + i * 6, at(0.32, dur) + i * 6, 0, 1)} />
      ))}
      {/* atmosphere dashes */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 340,
            right: 160,
            top: 460 + i * 90,
            height: 0,
            borderTop: "1.5px dashed rgba(180,210,255,0.18)",
          }}
        />
      ))}
      <Ground y={820} heat={0.5 + 0.3 * seg(frame, at(0.5, dur), at(0.9, dur), 0, 1)} height={280} />
      {/* impact ripples */}
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 40) % 120) / 120;
        return (
          <div key={i} style={{ position: "absolute", left: 600 + i * 260 - 30 * t, top: 800 - 8 * t, width: 60 + 80 * t, height: 16 + 20 * t, borderRadius: "50%", border: `2px solid ${ACCENT.warm}`, opacity: 0.5 * (1 - t) }} />
        );
      })}
      <div style={{ position: "absolute", left: 360, top: 330, opacity: labels }}>
        <Tag color={ACCENT.sun} size={22} solid>短波辐射</Tag>
      </div>
      <div style={{ position: "absolute", right: 300, top: 560, opacity: labels }}>
        <Tag color="rgba(235,243,255,0.75)" size={20}>大气：几乎是透明的</Tag>
      </div>
      <div style={{ position: "absolute", left: 150, bottom: 300, opacity: labels, fontFamily: "inherit", fontSize: 26, color: "rgba(235,243,255,0.6)" }}>
        λ 短 · 能量高 · 穿透力强
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 18 · Armor-piercing — molecules swipe and miss                      */
/* ------------------------------------------------------------------ */
export const ArmorPiercing: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const rounds = [0, 1, 2, 3, 4, 5].map((i) => {
    const speed = 14 + (i % 3) * 4;
    const travel = ((frame * speed + i * 190) % 560);
    return { x: 430 + i * 210, y: 300 + travel, key: i, speed };
  });
  const misses = [
    { x: 690, y: 520, at: at(0.3, dur) },
    { x: 1110, y: 640, at: at(0.46, dur) },
    { x: 1460, y: 470, at: at(0.6, dur) },
  ];
  const mols = [
    { label: "H₂O", x: 700, y: 520, c: ACCENT.cyan },
    { label: "CO₂", x: 1120, y: 640, c: ACCENT.violet },
    { label: "H₂O", x: 1470, y: 470, c: ACCENT.cyan },
    { label: "CO₂", x: 920, y: 760, c: ACCENT.violet },
  ];
  return (
    <Scene dur={dur}>
      <Sky top="#05060F" mid="#0A1322" bottom="#0D192B" stars={46} seed={181} />
      <Headline kicker="ARMOR-PIERCING LIGHT" title="像穿甲弹一样：空气根本抓不住" accent={ACCENT.warm} progress={head} size={54} />
      <Sun x={170} y={450} r={70} glow={1.05} rays color={ACCENT.sun} />
      {/* tracer rounds */}
      {rounds.map((r) => (
        <div key={r.key} style={{ position: "absolute", left: r.x, top: r.y, width: 4, height: 46, borderRadius: 2, background: `linear-gradient(180deg, transparent, ${ACCENT.sun})`, boxShadow: `0 0 16px ${ACCENT.sun}`, opacity: 0.9 }}>
          <div style={{ position: "absolute", left: -2, bottom: -6, width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FFF3CE", boxShadow: `0 0 18px ${ACCENT.sun}` }} />
        </div>
      ))}
      {mols.map((m) => {
        let grab = 0;
        for (const ms of misses) {
          if (ms.x === m.x && ms.y === m.y) {
            const dt = frame - ms.at;
            if (dt > 0 && dt < 26) grab = Math.sin(Math.min(1, dt / 8) * Math.PI);
          }
        }
        return <Molecule key={`${m.x}-${m.y}`} x={m.x} y={m.y} label={m.label} color={m.c} grab={grab} />;
      })}
      {misses.map((m, i) => {
        const dt = frame - m.at;
        const show = dt > 0 && dt < 34;
        return show ? (
          <div key={i} style={{ position: "absolute", left: m.x + 44, top: m.y - 46, opacity: 1 - dt / 34, fontFamily: "monospace", fontSize: 18, letterSpacing: "0.12em", color: ACCENT.red, whiteSpace: "nowrap" }}>
            扑空 MISS
          </div>
        ) : null;
      })}
      <Ground y={840} heat={0.35} height={260} />
      {[0, 1].map((i) => {
        const t = ((frame + i * 60) % 120) / 120;
        return <div key={i} style={{ position: "absolute", left: 900 + i * 300, top: 812, width: 40 + 110 * t, height: 12 + 26 * t, borderRadius: "50%", border: `2px solid ${ACCENT.sun}`, opacity: 0.55 * (1 - t) }} />;
      })}
      <div style={{ position: "absolute", left: 150, bottom: 190, opacity: pop(frame, fps, at(0.5, dur)) }}>
        <Tag color={ACCENT.lime} size={22}>阳光：畅通无阻 ↓</Tag>
      </div>
      <div style={{ position: "absolute", right: 160, bottom: 190, opacity: pop(frame, fps, at(0.68, dur)) }}>
        <Tag color="rgba(235,243,255,0.7)" size={20}>空气：只能眼睁睁看着</Tag>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 19 · Ground heat — soil, rock, ocean absorb the sun                 */
/* ------------------------------------------------------------------ */
export const GroundHeat: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const heat = 0.3 + 0.65 * seg(frame, at(0.2, dur), at(0.8, dur), 0, 1);
  const temp = 10 + 19 * seg(frame, at(0.2, dur), at(0.8, dur), 0, 1);
  const soilIn = pop(frame, fps, at(0.34, dur));
  const rockIn = pop(frame, fps, at(0.44, dur));
  const oceanIn = pop(frame, fps, at(0.54, dur));
  return (
    <Scene dur={dur}>
      <Sky top="#05060F" mid="#0C1424" bottom="#191310" stars={30} seed={191} />
      <Headline kicker="ABSORB & WARM UP" title="大地吸饱阳光，开始升温" accent={ACCENT.ember} progress={head} size={54} />
      <Sun x={960} y={200} r={70} glow={1} rays color={ACCENT.sun} />
      {[0, 1, 2, 3].map((i) => (
        <ZigzagRay key={i} x={700 + i * 170} y1={280} y2={620} color={ACCENT.sun} width={3} amp={7} progress={seg(frame, at(0.06, dur) + i * 5, at(0.3, dur) + i * 5, 0, 1)} />
      ))}
      <Ground y={640} heat={heat} height={420} />
      <svg width={1920} height={420} viewBox="0 0 1920 420" style={{ position: "absolute", left: 0, top: 640, overflow: "visible" }}>
        <defs>
          <linearGradient id="soilSection" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6E4329" />
            <stop offset="0.35" stopColor="#4A2B1D" />
            <stop offset="1" stopColor="#241712" />
          </linearGradient>
          <linearGradient id="rockFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#B7B0A6" />
            <stop offset="0.48" stopColor="#716D69" />
            <stop offset="1" stopColor="#383638" />
          </linearGradient>
          <linearGradient id="oceanDepth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#258AA0" stopOpacity={0.9} />
            <stop offset="1" stopColor="#082B43" stopOpacity={0.96} />
          </linearGradient>
          <clipPath id="soilClip"><rect x={150} y={82} width={470} height={294} rx={20} /></clipPath>
          <clipPath id="oceanClip"><rect x={1240} y={172} width={520} height={204} rx={22} /></clipPath>
        </defs>
        <g opacity={soilIn} transform={`translate(0 ${(1 - soilIn) * 28})`}>
          <rect x={150} y={82} width={470} height={294} rx={20} fill="url(#soilSection)" stroke="#B9805266" strokeWidth={2} />
          <g clipPath="url(#soilClip)">
            <path d="M140 126 Q230 108 320 128 T500 124 T640 130 L640 88 L140 88 Z" fill="#8A5A34" opacity={0.85} />
            <path d="M140 214 Q260 190 390 218 T650 204" fill="none" stroke="#B8784533" strokeWidth={18} />
            <path d="M140 302 Q260 278 400 306 T650 292" fill="none" stroke="#D0985A22" strokeWidth={12} />
            {[
              [205, 164, 22, 12], [292, 246, 30, 16], [412, 174, 18, 11], [520, 274, 34, 18], [230, 330, 25, 13], [450, 334, 20, 12],
            ].map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? "#9C7455" : "#6F5B4B"} opacity={0.72} />)}
            <g fill="none" stroke="#C9A36B" strokeWidth={3} strokeLinecap="round" opacity={0.8}>
              <path d="M340 86 C338 128 320 148 326 190 C330 220 312 244 300 270" />
              <path d="M338 130 C364 154 372 184 366 218 M326 176 C298 190 282 214 278 244 M366 196 C392 212 400 238 396 264" />
              <path d="M314 230 C334 252 338 278 330 306 M300 270 C278 282 268 304 266 330" />
            </g>
          </g>
          <path d="M340 84 C340 56 338 36 342 14" fill="none" stroke="#7FA65A" strokeWidth={6} strokeLinecap="round" />
          <path d="M340 48 C306 44 292 24 296 8 C324 8 340 22 340 48 Z" fill="#8FBA64" />
          <path d="M341 34 C366 30 382 12 380 -4 C356 -2 342 12 341 34 Z" fill="#B0CC73" />
          <path d="M150 82 Q260 66 385 80 T620 82" fill="none" stroke="#D89A59" strokeWidth={5} opacity={0.45 + heat * 0.35} />
        </g>
        <g opacity={rockIn} transform={`translate(0 ${(1 - rockIn) * 32})`}>
          <ellipse cx={960} cy={344} rx={210} ry={28} fill="#05070A" opacity={0.48} />
          <path d="M770 326 L806 198 L910 116 L1040 142 L1140 258 L1110 342 Z" fill="url(#rockFace)" stroke="#D9D1C755" strokeWidth={2} />
          <path d="M806 198 L910 116 L934 234 L770 326 Z" fill="#A8A097" opacity={0.66} />
          <path d="M910 116 L1040 142 L1010 246 L934 234 Z" fill="#C2B9AA" opacity={0.54} />
          <path d="M934 234 L1010 246 L1110 342 L770 326 Z" fill="#4B4848" opacity={0.66} />
          <path d="M1040 142 L1140 258 L1010 246 Z" fill="#77716B" />
          <path d="M838 210 L904 154 M954 154 L1012 166" stroke="#F2D7B0" strokeWidth={6} strokeLinecap="round" opacity={0.12 + heat * 0.3} />
          <path d="M850 286 L900 268 L924 286 M1028 286 L1060 306" fill="none" stroke="#29282B" strokeWidth={4} opacity={0.65} />
        </g>
        <g opacity={oceanIn} transform={`translate(0 ${(1 - oceanIn) * 26})`}>
          <rect x={1240} y={172} width={520} height={204} rx={22} fill="url(#oceanDepth)" stroke="#65D5E266" strokeWidth={2} />
          <g clipPath="url(#oceanClip)">
            <path d={`M1210 182 Q1260 ${160 + Math.sin(frame / 16) * 5} 1310 182 T1410 182 T1510 182 T1610 182 T1710 182 T1810 182 L1810 210 L1210 210 Z`} fill="#57C4D2" opacity={0.56} />
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${1270 + i * 94} ${232 + (i % 2) * 42} q28 -14 56 0 t56 0`}
                fill="none"
                stroke="#8CEBF0"
                strokeWidth={3}
                opacity={0.12 + 0.12 * Math.sin(frame / 20 + i) ** 2}
              />
            ))}
            <path d="M1390 184 L1450 376 L1570 376 L1510 184 Z" fill="#FFE2A0" opacity={0.025 + heat * 0.055} />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={1370 + i * 62} y1={196 + i * 9} x2={1410 + i * 62} y2={196 + i * 9} stroke="#FFE6AE" strokeWidth={5} strokeLinecap="round" opacity={0.16 + heat * 0.28} />
            ))}
          </g>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 210, top: 676, opacity: soilIn }}>
        <Tag color="#D8B48C" size={20}>土壤 SOIL</Tag>
      </div>
      <div style={{ position: "absolute", left: 850, top: 690, opacity: rockIn }}>
        <Tag color="#A8B6C8" size={20}>岩石 ROCK</Tag>
      </div>
      <div style={{ position: "absolute", right: 250, top: 706, opacity: oceanIn }}>
        <Tag color={ACCENT.cyan} size={20}>海洋 OCEAN</Tag>
      </div>
      {/* surface glow */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, height: 120, background: `radial-gradient(60% 100% at 50% 40%, ${ACCENT.ember}${heat > 0.6 ? "3d" : "22"} 0%, transparent 70%)` }} />
      {/* thermometers */}
      <div style={{ position: "absolute", right: 200, top: 330 }}>
        <Thermometer x={0} y={0} height={260} value={temp} min={-10} max={40} label={`${Math.round(temp)}℃`} />
      </div>
      <div style={{ position: "absolute", right: 330, top: 380, opacity: pop(frame, fps, at(0.3, dur)) }}>
        <Tag color={ACCENT.ember} size={20}>地表升温中</Tag>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 20 · Longwave — ground radiates infrared                            */
/* ------------------------------------------------------------------ */
export const Longwave: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const tag = pop(frame, fps, at(0.32, dur));
  return (
    <Scene dur={dur}>
      <Sky top="#050409" mid="#100D18" bottom="#1D1412" stars={30} seed={201} />
      <Headline kicker="LONGWAVE · INFRARED" title="地面开始向外散发热量：长波辐射" accent={ACCENT.ember} progress={head} size={54} />
      <Ground y={720} heat={0.95} height={360} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <HeatWave key={i} x={420 + i * 190} y={690 - (i % 2) * 26} w={210} amp={13} thickness={5} phase={i * 1.4} opacity={0.85} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <HeatWave key={`b-${i}`} x={470 + i * 190} y={620 - (i % 2) * 30} w={210} amp={13} thickness={4} phase={i * 1.4 + 0.9} opacity={0.4} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 660, height: 80, background: `radial-gradient(60% 100% at 50% 100%, ${ACCENT.ember}44 0%, transparent 70%)` }} />
      <div style={{ position: "absolute", left: 150, top: 320, opacity: tag }}>
        <Tag color={ACCENT.ember} size={24} solid>长波辐射 · 红外线</Tag>
      </div>
      {/* wavelength comparison inset */}
      <div style={{ position: "absolute", right: 170, top: 300, width: 470, padding: "26px 30px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.14)", backgroundColor: "rgba(8,12,22,0.8)", opacity: tag }}>
        <div style={{ fontFamily: "monospace", fontSize: 17, letterSpacing: "0.26em", color: "rgba(235,243,255,0.5)", marginBottom: 16 }}>波长对比 WAVELENGTH</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
          <span style={{ fontFamily: "monospace", fontSize: 20, color: ACCENT.sun, width: 110 }}>短波 短 λ</span>
          <svg width={240} height={22}>
            <polyline points={new Array(13).fill(0).map((_, i) => `${8 + i * 19},${11 + (i % 2 === 0 ? -7 : 7)}`).join(" ")} fill="none" stroke={ACCENT.sun} strokeWidth={2.6} />
          </svg>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "monospace", fontSize: 20, color: ACCENT.ember, width: 110 }}>长波 长 λ</span>
          <svg width={240} height={22}>
            <path d="M8 11 Q 38 -7 68 11 T 128 11 T 188 11 T 248 11" fill="none" stroke={ACCENT.ember} strokeWidth={2.6} />
          </svg>
        </div>
      </div>
      <div style={{ position: "absolute", left: 150, bottom: 190, opacity: pop(frame, fps, at(0.6, dur)), fontFamily: "inherit", fontSize: 26, color: "rgba(255,225,205,0.75)" }}>
        地面：把吸收的能量，还给了天空
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 21 · Catch — greenhouse gases grab longwave, ignore shortwave       */
/* ------------------------------------------------------------------ */
export const Catch: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const catchAt = [at(0.32, dur), at(0.52, dur), at(0.7, dur)];
  const mols = [
    { label: "H₂O", x: 620, y: 560, c: ACCENT.cyan, ci: 0 },
    { label: "CO₂", x: 1050, y: 480, c: ACCENT.violet, ci: 1 },
    { label: "H₂O", x: 1440, y: 600, c: ACCENT.cyan, ci: 2 },
  ];
  const scoreIn = pop(frame, fps, at(0.78, dur), { damping: 10, stiffness: 180, mass: 0.8 });
  return (
    <Scene dur={dur}>
      <Sky top="#04060F" mid="#0A1224" bottom="#0E1A2E" stars={42} seed={211} />
      <Headline kicker="GREENHOUSE GASES" title="水汽、二氧化碳：对长波一抓一个准" accent={ACCENT.cyan} progress={head} size={52} />
      <Ground y={860} heat={0.9} height={220} />
      {/* rising longwave */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const y = 800 - ((frame * 2.1 + i * 62) % 460);
        return <HeatWave key={i} x={420 + i * 180} y={y} w={150} amp={10} thickness={4} phase={i} opacity={0.55} />;
      })}
      {mols.map((m) => {
        const dt = frame - catchAt[m.ci];
        const caught = dt > 0;
        const pulse = caught ? Math.max(0, 1 - dt / 30) : 0;
        return (
          <React.Fragment key={m.label + m.x}>
            <div style={{ position: "absolute", left: m.x, top: m.y, opacity: pulse * 0.8 }}>
              <div style={{ position: "absolute", left: -70, top: -70, width: 140, height: 140, borderRadius: "50%", border: `2px solid ${m.c}`, transform: `scale(${0.4 + (1 - Math.max(0, 1 - dt / 24)) * 0.6})`, opacity: 0.8 }} />
            </div>
            <Molecule x={m.x} y={m.y} label={m.label} color={m.c} grab={caught ? Math.max(0, Math.sin(Math.min(1, dt / 14) * Math.PI)) : 0} />
            {caught ? (
              <div style={{ position: "absolute", left: m.x - 40, top: m.y - 96, fontFamily: "monospace", fontSize: 18, letterSpacing: "0.1em", color: m.c, opacity: Math.max(0, 1 - dt / 40), whiteSpace: "nowrap" }}>
                + 热量
              </div>
            ) : null}
            {caught ? <HeatWave x={m.x - 50} y={m.y - 34} w={100} amp={7} thickness={3} phase={m.ci * 2} opacity={Math.max(0, 1 - dt / 50)} /> : null}
          </React.Fragment>
        );
      })}
      {/* shortwave ignored */}
      {[0, 1].map((i) => (
        <ZigzagRay key={i} x={840 + i * 420} y1={300} y2={840} color={`${ACCENT.sun}88`} width={2.6} amp={7} progress={seg(frame, 12, 34, 0, 1)} />
      ))}
      <div style={{ position: "absolute", left: 1090, top: 700, opacity: pop(frame, fps, at(0.42, dur)) }}>
        <Tag color="rgba(235,243,255,0.6)" size={18}>短波路过 · 无动于衷</Tag>
      </div>
      <div style={{ position: "absolute", left: "50%", top: 260, transform: `translateX(-50%) scale(${0.7 + 0.3 * scoreIn})`, opacity: scoreIn }}>
        <Tag color={ACCENT.lime} solid size={26}>命中率 100%</Tag>
      </div>
      <div style={{ position: "absolute", left: 150, bottom: 150, opacity: pop(frame, fps, at(0.6, dur)), fontFamily: "inherit", fontSize: 26, color: "rgba(235,243,255,0.6)" }}>
        温室气体：专吃地面送来的“长波外卖”
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 22 · Chain — sun heats ground first                                 */
/* ------------------------------------------------------------------ */
export const Chain: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const packets = [0, 1, 2].map((i) => ((frame * 2.2 + i * 50) % 240) / 240);
  return (
    <Scene dur={dur}>
      <Sky top="#05060F" mid="#0B1424" bottom="#121A28" stars={44} seed={221} />
      <Headline kicker="THE CHAIN" title="顺序是这样的：太阳 → 地面 → 空气" accent={ACCENT.sun} progress={head} size={54} />
      {/* nodes */}
      <Sun x={400} y={380} r={72} glow={1} rays color={ACCENT.sun} />
      <div style={{ position: "absolute", left: 330, top: 470, fontFamily: "monospace", fontSize: 22, letterSpacing: "0.22em", color: "rgba(255,209,102,0.75)" }}>SUN · 太阳</div>
      <Ground y={780} heat={0.8} height={300} />
      <div style={{ position: "absolute", left: 880, top: 826, fontFamily: "monospace", fontSize: 22, letterSpacing: "0.22em", color: "rgba(255,186,150,0.8)" }}>GROUND · 地面</div>
      <div style={{ position: "absolute", right: 330, top: 360, width: 210, height: 210, borderRadius: "50%", border: `2px solid ${ACCENT.violet}66`, backgroundColor: `${ACCENT.violet}12`, boxShadow: `0 0 60px ${ACCENT.violet}22` }} />
      <div style={{ position: "absolute", right: 380, top: 440, fontFamily: "monospace", fontSize: 22, letterSpacing: "0.22em", color: `${ACCENT.violet}cc`, textAlign: "center", width: 110 }}>AIR<br />空气</div>
      {/* sun -> ground shortwave path */}
      <Arrow x1={480} y1={430} x2={880} y2={760} color={ACCENT.sun} width={4} progress={seg(frame, at(0.08, dur), at(0.3, dur), 0, 1)} />
      {packets.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: 480 + 400 * p, top: 430 + 330 * p, width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FFF0C4", boxShadow: `0 0 14px ${ACCENT.sun}`, opacity: 0.9 }} />
      ))}
      <div style={{ position: "absolute", left: 560, top: 520, opacity: pop(frame, fps, at(0.2, dur)) }}>
        <Tag color={ACCENT.sun} size={20}>短波 · 晒热地面</Tag>
      </div>
      {/* ground -> air longwave */}
      <Arrow x1={1120} y1={740} x2={1560} y2={500} color={ACCENT.ember} width={4} progress={seg(frame, at(0.4, dur), at(0.6, dur), 0, 1)} dashed />
      {[0, 1, 2].map((i) => {
        const p = ((frame * 1.8 + i * 60) % 180) / 180;
        return <HeatWave key={i} x={1120 + 380 * p} y={740 - 220 * p} w={90} amp={8} thickness={3.5} phase={i * 2} opacity={0.7} />;
      })}
      <div style={{ position: "absolute", left: 1210, top: 580, opacity: pop(frame, fps, at(0.5, dur)) }}>
        <Tag color={ACCENT.ember} size={20}>长波 · 烤热空气</Tag>
      </div>
      {/* troposphere bracket */}
      <div style={{ position: "absolute", right: 180, top: 320, width: 20, height: 420, borderRight: `2px dashed ${ACCENT.ice}55` }}>
        <div style={{ position: "absolute", right: -10, top: -26, fontFamily: "monospace", fontSize: 18, letterSpacing: "0.2em", color: `${ACCENT.ice}aa` }}>对流层</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 128, textAlign: "center", opacity: pop(frame, fps, at(0.66, dur)), fontFamily: "inherit", fontSize: 26, color: "rgba(235,243,255,0.55)" }}>
        头顶的太阳并未直接加热空气——它先加热了地面
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 23 · Blanket — electric blanket heating from below                  */
/* ------------------------------------------------------------------ */
export const Blanket: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const parcels = [0, 1, 2, 3, 4].map((i) => {
    const t = ((frame * 0.5 + i * 34) % 150) / 150;
    return { x: 520 + i * 220, y: 800 - t * 430, r: 46 + t * 26, heat: 0.85 - t * 0.5, key: i };
  });
  return (
    <Scene dur={dur}>
      <Sky top="#050409" mid="#0D0F19" bottom="#191312" stars={36} seed={231} />
      <Headline kicker="RADIATOR MODE" title="地面像一块巨大的电热毯，从下往上烤" accent={ACCENT.ember} progress={head} size={52} />
      {/* blanket */}
      <div style={{ position: "absolute", left: 380, top: 740, width: 1160, height: 130, borderRadius: 34, border: `2.5px solid ${ACCENT.ember}77`, background: "linear-gradient(180deg, rgba(255,122,69,0.22), rgba(255,122,69,0.06))", boxShadow: `0 0 70px ${ACCENT.ember}33` }}>
        <svg width={1160} height={130} style={{ position: "absolute", inset: 0 }}>
          <path d="M40 40 H 340 V 90 H 640 V 40 H 940 V 90 H 1120" fill="none" stroke={ACCENT.ember} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 2" opacity={0.9} style={{ filter: `drop-shadow(0 0 6px ${ACCENT.ember})` }} />
          <path d="M40 80 H 280 V 46 H 620 V 84 H 960 V 46 H 1120" fill="none" stroke={ACCENT.warm} strokeWidth={2.4} opacity={0.4} strokeDasharray="2 2" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 400, top: 704, padding: "5px 14px", borderRadius: 8, backgroundColor: "rgba(8,10,16,0.82)", fontFamily: "monospace", fontSize: 16, letterSpacing: "0.2em", color: `${ACCENT.ember}cc`, whiteSpace: "nowrap" }}>ELECTRIC BLANKET · 对流层底部</div>
      <Ground y={850} heat={0.75} height={230} />
      {parcels.map((p) => (
        <Parcel key={p.key} x={p.x} y={p.y} r={p.r} heat={p.heat} label={p.key === 2 ? "暖空气" : undefined} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <HeatWave key={i} x={420 + i * 300} y={820 - i * 20} w={220} amp={9} thickness={4} phase={i * 1.7} opacity={0.35} />
      ))}
      {/* temperature gradient */}
      <div style={{ position: "absolute", right: 120, top: 330, width: 90 }}>
        <div style={{ width: 26, height: 380, borderRadius: 13, overflow: "hidden", border: "2px solid rgba(255,255,255,0.28)", background: "linear-gradient(180deg, #6FB6FF 0%, #8FD8FF 30%, #FFB347 68%, #FF7A45 100%)", opacity: 0.85 }} />
        <div style={{ position: "absolute", left: 44, top: -6, fontFamily: "monospace", fontSize: 18, color: ACCENT.ice }}>冷</div>
        <div style={{ position: "absolute", left: 44, bottom: -6, fontFamily: "monospace", fontSize: 18, color: ACCENT.ember }}>暖</div>
        <div style={{ position: "absolute", left: -10, top: -34, fontFamily: "monospace", fontSize: 16, letterSpacing: "0.18em", color: "rgba(235,243,255,0.5)", whiteSpace: "nowrap" }}>温度梯度</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 128, textAlign: "center", opacity: pop(frame, fps, at(0.62, dur)), fontFamily: "inherit", fontSize: 26, color: "rgba(235,243,255,0.55)" }}>
        离地越远，越像是离开了暖气片
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ */
/* 24 · Climb away — distance from the radiator                        */
/* ------------------------------------------------------------------ */
export const ClimbAway: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = pop(frame, fps, 3);
  const climb = seg(frame, at(0.08, dur), at(0.86, dur), 0, 1);
  const x = 380 + 1150 * climb;
  const y = 880 - 520 * climb;
  const temp = 22 - 34 * climb;
  const heatDist = seg(frame, at(0.1, dur), at(0.9, dur), 0.05, 0.95);
  return (
    <Scene dur={dur}>
      <Sky top="#03060F" mid="#0A1526" bottom="#0E2038" stars={50} seed={241} />
      <Headline kicker="CLIMB AWAY FROM THE HEATER" title="爬得越高，离真正的热源越远" accent={ACCENT.ice} progress={head} size={54} />
      {/* slope */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="slope" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#3A2B22" />
            <stop offset="55%" stopColor="#1C2838" />
            <stop offset="100%" stopColor="#16293D" />
          </linearGradient>
        </defs>
        <path d="M0 1080 L0 860 L1640 320 L1920 320 L1920 1080 Z" fill="url(#slope)" />
        <path d="M0 860 L1640 320" stroke="rgba(143,216,255,0.35)" strokeWidth={2} strokeDasharray="8 10" />
      </svg>
      {/* radiator glow at base */}
      <div style={{ position: "absolute", left: 60, top: 780, width: 360, height: 220, borderRadius: 24, background: `radial-gradient(circle at 40% 60%, ${ACCENT.ember}66 0%, transparent 68%)`, mixBlendMode: "screen" }} />
      {[0, 1, 2, 3].map((i) => (
        <HeatWave key={i} x={100 + i * 60} y={840 - i * 16} w={180} amp={9} thickness={4} phase={i * 1.6} opacity={0.4} />
      ))}
      <div style={{ position: "absolute", left: 80, top: 900 }}>
        <Tag color={ACCENT.ember} size={20}>大暖气片</Tag>
      </div>
      {/* climber */}
      <Climber x={x + 34} y={y + 26} scale={1.2} mode={climb > 0.6 ? "cold" : "calm"} walk />
      {climb > 0.55 ? <Motes count={30} seed={29} color="#CFF3FF" rise={-0.7} size={3} opacity={0.5} area={{ x: 900, y: 200, w: 900, h: 500 }} /> : null}
      {/* distance meter */}
      <div style={{ position: "absolute", left: 260, top: 250, width: 420, padding: "28px 32px", borderRadius: 20, border: "1px solid rgba(143,216,255,0.3)", backgroundColor: "rgba(8,15,28,0.78)" }}>
        <div style={{ fontFamily: "monospace", fontSize: 17, letterSpacing: "0.26em", color: "rgba(207,243,255,0.6)", marginBottom: 14 }}>离热源的距离</div>
        <div style={{ height: 14, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{ width: `${heatDist * 100}%`, height: "100%", background: `linear-gradient(90deg, ${ACCENT.ember}, ${ACCENT.ice})` }} />
        </div>
        <div style={{ marginTop: 22, position: "relative", height: 190 }}>
          <Thermometer x={6} y={0} height={150} value={temp} min={-20} max={30} label={`${Math.round(temp)}℃`} />
          <div style={{ position: "absolute", left: 76, top: 34, fontFamily: "inherit", fontSize: 22, color: "rgba(235,243,255,0.65)", lineHeight: 1.5 }}>
            离热源越远
            <br />
            自然就越冷
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", right: 200, top: 300, opacity: pop(frame, fps, at(0.6, dur)) }}>
        <Tag color={ACCENT.ice} size={22}>离太阳：近了 0.0000059%</Tag>
        <div style={{ marginTop: 14 }}>
          <Tag color={ACCENT.ember} size={22} solid>离地面：远了 8848 米</Tag>
        </div>
      </div>
    </Scene>
  );
};
