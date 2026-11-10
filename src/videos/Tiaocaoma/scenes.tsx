import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { bg, COLORS, CURVE, FONT, lerp, paperShadow, part } from "./design";
import type { Track } from "./data/timeline";
import type { Shot } from "./shots";
import { FxLayer, KineticHeadline } from "./stage";
import { Grade, PaperGrain, PaperHorse, Scraps, Sequences, Vignette } from "./paper";
import { SEQS, SUPP_PART } from "./rig";

export interface SceneProps {
  shot: Shot;
  track: Track;
  frame: number;
  dur: number;
}

/** Irregular hand-torn paper panel. */
const Panel: React.FC<{
  x: number; y: number; w: number; h: number; rot?: number;
  opacity?: number; color?: string; children?: React.ReactNode;
}> = ({ x, y, w, h, rot = 0, opacity = 1, color, children }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: w, height: h,
    transform: `translate(-50%, -50%) rotate(${rot}deg)`, opacity,
    backgroundColor: color ?? COLORS.paperLight,
    clipPath: "polygon(1% 2%, 14% 0%, 31% 2%, 49% 0%, 68% 2%, 86% 0%, 99% 3%, 100% 22%, 98% 45%, 100% 70%, 99% 98%, 82% 100%, 63% 98%, 44% 100%, 24% 98%, 2% 100%, 0% 74%, 2% 51%, 0% 27%)",
    filter: paperShadow(2), zIndex: 30,
  }}>
    {children}
  </div>
);

/** Opening title card dissolves into the bustling western market street. */
export const TitleScene: React.FC<SceneProps> = ({ shot, frame, dur }) => {
  const cardAlpha = lerp(frame, [230, 350], [1, 0]);
  const cardScale = lerp(frame, [0, 350], [1, 1.14], CURVE.out);
  const streetScale = lerp(frame, [0, dur], [1.14, 1.02]);
  const sealIn = lerp(frame, [46, 74], [0, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <Img src={bg("bg-street")} style={{
        width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${streetScale})`, filter: "saturate(0.92)",
      }} />
      <Grade grade="day" />
      <Sequences items={shot.sequences} frame={frame} dur={dur} />
      <FxLayer fx={["clouds", "dust", "petals"]} frame={frame} dur={dur} beats={[]} />
      <div style={{
        position: "absolute", inset: 0, opacity: cardAlpha,
        transform: `scale(${cardScale})`, transformOrigin: "50% 50%", zIndex: 44,
      }}>
        <Img src={bg("title")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{
        position: "absolute", left: 1500, top: 760, width: 118, height: 118,
        backgroundColor: COLORS.vermilion, color: COLORS.paperLight,
        fontFamily: FONT.seal, fontSize: 34, lineHeight: "118px", textAlign: "center",
        transform: `rotate(${lerp(frame, [40, 90], [-28, -11])}deg) scale(${sealIn})`,
        opacity: sealIn * cardAlpha, borderRadius: 6, zIndex: 46,
        boxShadow: "0 12px 24px rgba(60,26,12,0.4)",
      }}>剪纸<br />戏</div>
      <div style={{
        position: "absolute", left: 960, top: 940, transform: "translateX(-50%)",
        fontFamily: FONT.body, fontSize: 24, letterSpacing: 12, color: COLORS.ink,
        opacity: lerp(frame, [70, 110, 230, 330], [0, 0.8, 0.8, 0]), zIndex: 46,
      }}>根据《故事会》同名故事改编 · 剪纸定格动画</div>
      <div style={{
        position: "absolute", left: 260, top: 300, fontFamily: FONT.title,
        fontSize: 62, writingMode: "vertical-rl", letterSpacing: 14,
        color: COLORS.ink, opacity: lerp(frame, [330, 390, 900, 980], [0, 0.85, 0.85, 0]),
        zIndex: 46, textShadow: "0 4px 0 rgba(255,246,222,0.8)",
      }}>京城 · 城西</div>
      <Vignette strength={0.42} />
      <PaperGrain />
    </AbsoluteFill>
  );
};

const RANK_LABELS = [
  { x: 520, label: "五品以下", food: "枯草", part: "prop-fodder-01", color: COLORS.paperDeep },
  { x: 960, label: "三品至五品", food: "青草", part: "prop-fodder-02", color: COLORS.jade },
  { x: 1400, label: "一品二品", food: "细粮嫩草", part: "prop-fodder-00", color: COLORS.vermilion },
];

/** Act I infographic: the east-is-noble manger hierarchy. */
export const RankScene: React.FC<SceneProps> = ({ shot, frame, dur }) => {
  const phases = shot.beats.length ? shot.beats : [0];
  const phase = phases.reduce((acc, b, i) => (frame >= b ? i : acc), 0);
  const alpha = (i: number, from: number) => lerp(frame, [from, from + 34], [0, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <Img src={bg("bg-stable-day")} style={{
        width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${lerp(frame, [0, dur], [1.02, 1.1])})`,
        opacity: 0.42, filter: "saturate(0.6)",
      }} />
      <AbsoluteFill style={{ backgroundColor: "rgba(246,232,203,0.72)", zIndex: 1 }} />
      <Sequences items={shot.sequences} frame={frame} dur={dur} />
      <InkCorner />
      <div style={{
        position: "absolute", left: 960, top: 112, transform: "translateX(-50%)",
        fontFamily: FONT.title, fontSize: 52, color: COLORS.ink,
        letterSpacing: 18, opacity: alpha(0, 20), zIndex: 34,
      }}>无 规 矩 不 成 方 圆</div>
      <Panel x={960} y={560} w={1580} h={720} rot={-0.5} opacity={alpha(1, phases[1] ?? 300)}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,34,0.05) 0 1px, transparent 1px 78px)",
        }} />
        <div style={{ position: "absolute", left: 120, top: 250, width: 1340,
          opacity: alpha(1, (phases[1] ?? 300) + 20), filter: paperShadow(1.4) }}>
          <Img src={part("prop-manger-00")} style={{ width: "100%", height: "auto" }} />
        </div>
        {RANK_LABELS.map((r, i) => {
          const start = (phases[2] ?? 700) + i * 90;
          const drop = lerp(frame, [start, start + 30], [-160, 0], CURVE.out);
          return (
            <div key={r.label} style={{
              position: "absolute", left: r.x - 400, top: 120 + drop, width: 230,
              opacity: lerp(frame, [start, start + 20], [0, 1]),
              transform: `rotate(${lerp(frame, [start, start + 40], [-14, 0])}deg)`,
              zIndex: 36,
            }}>
              <Img src={part(r.part)} style={{ width: "100%", height: "auto", filter: paperShadow(1.5) }} />
              <div style={{
                marginTop: 16, padding: "10px 0", textAlign: "center",
                fontFamily: FONT.title, fontSize: 30, color: COLORS.paperLight,
                backgroundColor: r.color, clipPath: "polygon(0 6%, 100% 0, 98% 100%, 2% 94%)",
                filter: paperShadow(1),
              }}>{r.food}</div>
              <div style={{ marginTop: 12, textAlign: "center", fontFamily: FONT.body,
                fontSize: 22, letterSpacing: 4, color: COLORS.ink }}>{r.label}</div>
            </div>
          );
        })}
        <div style={{
          position: "absolute", left: 120, top: 560, width: 1340, height: 6,
          backgroundColor: COLORS.vermilion, opacity: alpha(3, phases[3] ?? 1400),
          boxShadow: "0 6px 0 rgba(178,43,36,0.25)",
        }} />
        <div style={{
          position: "absolute", left: 120, top: 590, width: 1340,
          display: "flex", justifyContent: "space-between",
          fontFamily: FONT.title, fontSize: 40, color: COLORS.vermilion,
          opacity: alpha(3, (phases[3] ?? 1400) + 20),
        }}>
          <span>西 · 贱</span><span style={{ fontSize: 24, color: COLORS.ink, alignSelf: "center" }}>食客向东而行 →</span><span>东 · 贵</span>
        </div>
      </Panel>
      {phase >= 4 ? (
        <div style={{
          position: "absolute", left: 1500, top: 210, width: 132, height: 132,
          backgroundColor: COLORS.vermilion, color: COLORS.paperLight,
          fontFamily: FONT.seal, fontSize: 46, lineHeight: "132px", textAlign: "center",
          transform: `rotate(${lerp(frame, [phases[4] ?? 2000, (phases[4] ?? 2000) + 40], [-30, -12])}deg)`,
          opacity: alpha(4, (phases[4] ?? 2000) + 10), borderRadius: 8, zIndex: 48,
          boxShadow: "0 14px 28px rgba(60,26,12,0.4)",
        }}>规<br />矩</div>
      ) : null}
      <Scraps frame={frame} mode="dust" count={14} seed={21} />
      <Vignette strength={0.34} />
      <PaperGrain />
    </AbsoluteFill>
  );
};

const InkCorner: React.FC = () => (
  <div style={{
    position: "absolute", left: -160, top: -160, width: 620, height: 620, zIndex: 2,
    borderRadius: "50%", mixBlendMode: "multiply",
    background: "radial-gradient(circle, rgba(70,42,24,0.16) 0%, rgba(70,42,24,0) 70%)",
  }} />
);

const MONTAGE_WORDS: Record<number, string[]> = {
  19: ["初一 · 又来了", "初二 · 又来了", "初三 · 还是来了"],
  33: ["赛赤兔？", "一步三晃", "比乌龟快不了多少"],
  42: ["马无夜草不肥", "一饿一撑", "日渐消瘦"],
};

/** Flip-book montage: tilted paper cards swap on the beat. */
export const MontageScene: React.FC<SceneProps> = ({ shot, track, frame, dur }) => {
  const phases = shot.beats.length ? shot.beats : [0];
  const idx = phases.reduce((acc, b, i) => (frame >= b ? i : acc), 0);
  const start = phases[idx] ?? 0;
  const local = frame - start;
  const words = MONTAGE_WORDS[track.id] ?? [shot.headline ?? "……", "……", "……"];
  const word = words[idx % words.length];
  const inA = lerp(local, [0, 14], [0, 1]);
  const outA = lerp(local, [Math.max(20, (phases[idx + 1] ?? dur) - start - 16),
    Math.max(34, (phases[idx + 1] ?? dur) - start)], [1, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paperDeep }}>
      <Img src={bg(shot.bg)} style={{ width: "100%", height: "100%", objectFit: "cover",
        opacity: 0.5, transform: `scale(${lerp(frame, [0, dur], [1.06, 1.14])})` }} />
      <Grade grade={shot.grade} />
      <FxLayer fx={["dust", "speedlines", "petals"]} frame={frame} dur={dur} beats={shot.beats} />
      <Sequences items={shot.sequences} frame={frame} dur={dur} />
      {shot.props.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: p.x, top: p.y,
          transform: `translate(-50%,-50%) rotate(${lerp(local, [0, 40], [-16, 6])}deg)`,
          width: p.w, opacity: inA, zIndex: 32, filter: paperShadow(2) }}>
          <Img src={part(p.name)} style={{ width: "100%", height: "auto" }} />
        </div>
      ))}
      <Panel x={960} y={520} w={1120} h={480} rot={lerp(local, [0, 36], [-5, -1.5])}
        opacity={inA * outA}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT.title, fontSize: 96, color: COLORS.vermilion,
            letterSpacing: 8, textShadow: "0 6px 0 rgba(255,246,222,0.9)" }}>{word}</div>
          <div style={{ marginTop: 28, fontFamily: FONT.body, fontSize: 24, letterSpacing: 8,
            color: COLORS.inkSoft }}>第 {idx + 1} 折 · 剪纸连环画</div>
        </div>
      </Panel>
      <div style={{ position: "absolute", left: 960, top: 940, transform: "translateX(-50%)",
        display: "flex", gap: 16, zIndex: 50 }}>
        {phases.map((_, i) => (
          <div key={i} style={{ width: 44, height: 8, borderRadius: 4,
            backgroundColor: i === idx ? COLORS.vermilion : "rgba(70,44,26,0.28)" }} />
        ))}
      </div>
      <Vignette strength={0.5} />
      <PaperGrain />
    </AbsoluteFill>
  );
};

/** Battle flashback — now staged with the supplied 沙场 plates. */
export const FlashbackScene: React.FC<SceneProps> = ({ shot, frame, dur }) => {
  const phases = shot.beats.length ? shot.beats : [0];
  const idx = phases.reduce((acc, b, i) => (frame >= b ? i : acc), 0);
  const local = frame - (phases[idx] ?? 0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#7A3A22" }}>
      <Img src={bg(shot.bg)} style={{
        width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${lerp(frame, [0, dur], [1.04, 1.13])})`,
      }} />
      <Grade grade={shot.grade} />
      <FxLayer fx={["dust", "speedlines", "sun"]} frame={frame} dur={dur} beats={shot.beats} />
      {SEQS.rebels.map((name, i) => (
        <div key={name} style={{
          position: "absolute", left: 120 + i * 352, top: 462 + (i % 2) * 36,
          width: 236, opacity: 0.74,
          transform: `scaleX(${i % 2 ? -1 : 1}) translateY(${Math.sin(frame * 0.025 + i) * 9}px)`,
          filter: "brightness(0.88) drop-shadow(0 14px 18px rgba(50,20,8,0.45))", zIndex: 12,
        }}>
          <Img src={part(name)} style={{ width: "100%", height: "auto" }} />
        </div>
      ))}
      {shot.props.map((p, i) => (
        <div key={`${p.name}-${i}`} style={{
          position: "absolute", left: p.x, top: p.y, width: p.w,
          transform: `translate(-50%, -50%) rotate(${p.rot ?? 0}deg)`,
          opacity: lerp(frame, [(p.delay ?? 0), (p.delay ?? 0) + 24], [0, 1]),
          filter: paperShadow(1.6), zIndex: 14,
        }}>
          <Img src={part(p.name)} style={{ width: "100%", height: "auto" }} />
        </div>
      ))}
      <Sequences items={shot.sequences} frame={frame} dur={dur} />
      <PaperHorse horse={{ which: "king", x: 620, y: 880, w: 470, gait: 1 }} frame={frame} dur={dur} />
      <div style={{
        position: "absolute", left: 1580, top: 720, width: 360,
        transform: "translate(-50%, -50%)", zIndex: 18, filter: paperShadow(2),
        opacity: lerp(frame, [0, 30], [0, 1]),
      }}>
        <Img src={part(SUPP_PART.generalBody)} style={{ width: "100%", height: "auto" }} />
      </div>
      <KineticHeadline text={shot.headline ?? ""} sub={shot.subline} frame={local}
        size={idx === 0 ? 112 : 132} x={960} y={220} color={COLORS.paperLight} delay={6} />
      <div style={{
        position: "absolute", left: 960, top: 940, transform: "translateX(-50%)",
        fontFamily: FONT.body, fontSize: 26, letterSpacing: 10, color: COLORS.paperLight,
        opacity: 0.78, zIndex: 50, textShadow: "0 3px 10px rgba(40,16,8,0.7)",
      }}>{["横戈跃马 · 生擒贼首", "中毒箭 · 断右臂", "人被遗忘 · 马仍记得", "威风犹在"][idx % 4]}</div>
      <Scraps frame={frame} mode="petals" count={26} seed={41} />
      <Vignette strength={0.6} />
      <PaperGrain />
    </AbsoluteFill>
  );
};

/** Final card: 人不如马. */
export const EndingScene: React.FC<SceneProps> = ({ shot, frame, dur }) => {
  const a = lerp(frame, [0, 28], [0, 1]);
  const s = lerp(frame, [0, dur], [1.06, 1.0], CURVE.out);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <div style={{ position: "absolute", inset: 0, opacity: a,
        transform: `scale(${s})`, transformOrigin: "50% 50%" }}>
        <Img src={bg("ending")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <Sequences items={shot.sequences} frame={frame} dur={dur} />
      <Scraps frame={frame} mode="petals" count={18} seed={77} />
      <div style={{
        position: "absolute", left: 960, top: 900, transform: "translateX(-50%)",
        fontFamily: FONT.body, fontSize: 22, letterSpacing: 14, color: COLORS.inkSoft,
        opacity: lerp(frame, [40, 76], [0, 0.9]), zIndex: 50,
      }}>跳 槽 马 · 全 剧 终</div>
      <Vignette strength={0.3} />
      <PaperGrain />
    </AbsoluteFill>
  );
};

/** A 3-second chapter plate at the head of each act. */
export const ChapterCard: React.FC<{ frame: number; label: string; sub: string }> = ({
  frame, label, sub,
}) => {
  const a = lerp(frame, [0, 14, 130, 168], [0, 1, 1, 0]);
  const y = lerp(frame, [0, 24], [40, 0], CURVE.out);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 66, opacity: a }}>
      <AbsoluteFill style={{ backgroundColor: "rgba(38,22,13,0.72)" }} />
      <div style={{
        position: "absolute", left: 960, top: 470, transform: `translate(-50%, -50%) translateY(${y}px)`,
        textAlign: "center", color: COLORS.paperLight,
      }}>
        <div style={{ fontFamily: FONT.title, fontSize: 128, letterSpacing: 22,
          textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>{label}</div>
        <div style={{ marginTop: 34, fontFamily: FONT.body, fontSize: 28,
          letterSpacing: 12, opacity: 0.84 }}>{sub}</div>
        <div style={{ margin: "42px auto 0", width: 260, height: 4,
          backgroundColor: COLORS.vermilion }} />
      </div>
    </AbsoluteFill>
  );
};
