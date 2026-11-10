import React from "react";
import { AbsoluteFill, Img } from "remotion";
import {
  COLORS, FONT, lerp, part, paperShadow, seeded,
} from "./design";
import { VOICE } from "./data/voice";
import type { Track } from "./data/timeline";
import type { Actor, FxName, Shot } from "./shots";
import {
  Backdrop, Grade, PaperGrain, PaperHorse, PaperPuppet, PropSprite, Scraps,
  Sequences, Vignette,
} from "./paper";

const CLOUD_PARTS = ["fx-sunset-01", "fx-sunset-02", "fx-sunset-03"];
const WIND_PARTS = ["fx-sunset-04", "fx-sunset-06", "fx-sunset-09"];

const Clouds: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 3 }}>
    {CLOUD_PARTS.map((name, i) => {
      const w = 300 + i * 90;
      const x = ((seeded(i * 4.3) * 2300 + frame * (0.22 + i * 0.09)) % 2500) - 350;
      return (
        <div key={name} style={{
          position: "absolute", left: x, top: 90 + i * 118, width: w,
          opacity: 0.75, filter: paperShadow(1.2),
        }}>
          <Img src={part(name)} style={{ width: "100%", height: "auto" }} />
        </div>
      );
    })}
  </AbsoluteFill>
);

const Sun: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{
    position: "absolute", left: 1420, top: 100, width: 330,
    transform: `scale(${lerp(frame, [0, 1200], [0.94, 1.12])})`,
    filter: "drop-shadow(0 0 60px rgba(230,120,40,0.45))", zIndex: 2,
  }}>
    <Img src={part("fx-sunset-00")} style={{ width: "100%", height: "auto" }} />
  </div>
);

const Wind: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 43 }}>
    {WIND_PARTS.map((name, i) => {
      const x = ((seeded(i * 7.7) * 2400 - frame * (0.9 + i * 0.35)) % 2600) + 400;
      return (
        <div key={name} style={{ position: "absolute", left: x, top: 260 + i * 220,
          width: 360 + i * 60, opacity: 0.55, filter: paperShadow(0.7) }}>
          <Img src={part(name)} style={{ width: "100%", height: "auto" }} />
        </div>
      );
    })}
  </AbsoluteFill>
);

const SpeedLines: React.FC<{ frame: number; intensity?: number }> = ({ frame, intensity = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 46, mixBlendMode: "multiply" }}>
    <svg width="100%" height="100%" viewBox="0 0 1920 1080">
      {Array.from({ length: 34 }, (_, i) => {
        const a = (i / 34) * Math.PI * 2 + seeded(i * 2.3) * 0.12;
        const r0 = 430 + seeded(i * 5.1) * 180;
        const r1 = r0 + 420 + seeded(i * 3.3) * 560;
        const pulse = 0.55 + 0.45 * Math.sin(frame * 0.22 + i);
        return (
          <line key={i}
            x1={960 + Math.cos(a) * r0} y1={540 + Math.sin(a) * r0 * 0.62}
            x2={960 + Math.cos(a) * r1} y2={540 + Math.sin(a) * r1 * 0.62}
            stroke={i % 4 === 0 ? COLORS.vermilion : COLORS.ink}
            strokeWidth={2 + seeded(i * 8.8) * 8}
            opacity={(0.10 + seeded(i * 6.2) * 0.34) * pulse * intensity} />
        );
      })}
    </svg>
  </AbsoluteFill>
);

const InkWash: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 7, mixBlendMode: "multiply" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        position: "absolute",
        left: [120, 1420, 760][i], top: [640, 120, 820][i],
        width: 420 + i * 130, height: 420 + i * 130,
        borderRadius: "48% 52% 61% 39%",
        background: `radial-gradient(circle, rgba(58,32,20,${0.13 + i * 0.035}) 0%, rgba(58,32,20,0) 68%)`,
        transform: `rotate(${frame * 0.04 + i * 40}deg)`,
      }} />
    ))}
  </AbsoluteFill>
);

const Tear: React.FC<{ frame: number; dur: number }> = ({ frame, dur }) => {
  const local = frame < 54 ? frame : (frame > dur - 54 ? frame - (dur - 54) : -1);
  if (local < 0) return null;
  const topY = local < 24 ? lerp(local, [0, 24], [-1120, 0]) : lerp(local, [24, 52], [0, -1120]);
  const bottomY = local < 24 ? lerp(local, [0, 24], [1120, 0]) : lerp(local, [24, 52], [0, 1120]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 72 }}>
      <div style={{ position: "absolute", left: 0, top: topY, width: 1920, height: 620,
        filter: paperShadow(2) }}>
        <Img src={part("fx-tear-02")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: bottomY + 540, width: 1920, height: 620,
        filter: paperShadow(2) }}>
        <Img src={part("fx-tear-01")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: topY + 540, width: 1920, height: 100,
        filter: paperShadow(1) }}>
        <Img src={part("fx-tear-00")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: bottomY, width: 1920, height: 120,
        filter: paperShadow(1) }}>
        <Img src={part("fx-tear-03")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ frame: number; beats: number[] }> = ({ frame, beats }) => {
  const pulses = beats.length ? beats : [0];
  const alpha = Math.max(...pulses.map((b) =>
    lerp(frame, [b - 2, b, b + 5, b + 18], [0, 0.82, 0.35, 0])));
  return <AbsoluteFill style={{ pointerEvents: "none", zIndex: 70,
    backgroundColor: `rgba(255,246,222,${alpha})` }} />;
};

/** Large kinetic paper headline with a vermilion seal. */
export const KineticHeadline: React.FC<{
  text: string; frame: number; delay?: number; size?: number;
  x?: number; y?: number; color?: string; sub?: string; vertical?: boolean;
}> = ({ text, frame, delay = 8, size = 128, x = 960, y = 330, color, sub, vertical }) => {
  const chars = Array.from(text);
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)",
      zIndex: 55, textAlign: "center", fontFamily: FONT.title,
      writingMode: vertical ? "vertical-rl" : "horizontal-tb",
    }}>
      <div style={{ display: "flex", flexDirection: vertical ? "column" : "row",
        justifyContent: "center", alignItems: "center", gap: 4 }}>
        {chars.map((c, i) => {
          const d = delay + i * 5;
          const o = lerp(frame, [d, d + 14], [0, 1]);
          const dy = lerp(frame, [d, d + 18], [46, 0]);
          const rot = lerp(frame, [d, d + 20], [-9, 0]);
          return (
            <span key={i} style={{
              fontSize: size, lineHeight: 1.05, fontWeight: 900,
              color: color ?? COLORS.vermilion,
              opacity: o, transform: `translateY(${dy}px) rotate(${rot}deg)`,
              textShadow: "0 6px 0 rgba(255,244,218,0.75), 0 14px 22px rgba(48,26,12,0.35)",
            }}>{c}</span>
          );
        })}
      </div>
      {sub ? (
        <div style={{
          marginTop: 26, fontFamily: FONT.body, fontSize: 27, letterSpacing: 10,
          color: COLORS.ink, opacity: lerp(frame, [delay + 30, delay + 56], [0, 0.86]),
        }}>{sub}</div>
      ) : null}
      <div style={{
        position: "absolute", right: -96, top: -34, width: 68, height: 68,
        backgroundColor: COLORS.vermilion, color: COLORS.paperLight,
        fontFamily: FONT.seal, fontSize: 25, lineHeight: "68px",
        transform: `rotate(${lerp(frame, [delay, delay + 40], [-24, -9])}deg)`,
        opacity: lerp(frame, [delay + 20, delay + 42], [0, 1]),
        boxShadow: "0 8px 16px rgba(60,24,12,0.35)", borderRadius: 4,
      }}>印</div>
    </div>
  );
};

export const FxLayer: React.FC<{
  fx: FxName[]; frame: number; dur: number; beats: number[];
}> = ({ fx, frame, dur, beats }) => {
  const has = (n: FxName) => fx.indexOf(n) >= 0;
  return (
    <>
      {has("sun") ? <Sun frame={frame} /> : null}
      {has("clouds") ? <Clouds frame={frame} /> : null}
      {has("ink") ? <InkWash frame={frame} /> : null}
      {has("dust") ? <Scraps frame={frame} mode="dust" count={26} seed={3} /> : null}
      {has("petals") ? <Scraps frame={frame} mode="petals" count={20} seed={11} /> : null}
      {has("wind") ? <Wind frame={frame} /> : null}
      {has("speedlines") ? <SpeedLines frame={frame} /> : null}
      {has("spotlight") ? (
        <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50,
          background: "radial-gradient(ellipse 52% 62% at 50% 42%, rgba(255,242,210,0.20) 0%, rgba(36,20,12,0.52) 100%)" }} />
      ) : null}
      {has("flash") ? <Flash frame={frame} beats={beats} /> : null}
      {has("tear") ? <Tear frame={frame} dur={dur} /> : null}
    </>
  );
};

/** The main stage for "stage" and "portrait" shots. */
export const Stage: React.FC<{
  shot: Shot; track: Track; frame: number; dur: number;
}> = ({ shot, track, frame, dur }) => {
  const voice = VOICE[track.id];
  const activeSpeaker = track.inner ? null : track.speaker;
  const lipFor = (who: string): number =>
    activeSpeaker === who && voice ? Number(voice.lip.charAt(frame) || "0") : 0;
  const progress = dur > 0 ? frame / dur : 0;
  const scale = lerp(frame, [0, dur], [shot.camera.from, shot.camera.to]);
  const shake = shot.fx.indexOf("shake") >= 0;
  const shakeX = shake ? Math.sin(frame * 1.7) * lerp(frame, [0, 120, dur], [12, 5, 2]) : 0;
  const shakeY = shake ? Math.cos(frame * 2.3) * lerp(frame, [0, 120, dur], [8, 3, 1.5]) : 0;
  const cam = `scale(${scale}) translate(${shot.camera.panX * progress + shakeX}px, ${shot.camera.panY * progress + shakeY}px)`;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: cam, transformOrigin: "50% 50%" }}>
        <Backdrop name={shot.bg} transform="scale(1.06)" />
        <Grade grade={shot.grade} />
        {shot.props.map((p, i) => (
          <PropSprite key={`${p.name}-${i}`} prop={p} frame={frame} dur={dur} />
        ))}
        <Sequences items={shot.sequences} frame={frame} dur={dur} />
        {shot.horses.map((h, i) => (
          <PaperHorse key={`${h.which}-${i}`} horse={h} frame={frame} dur={dur} />
        ))}
        {shot.actors.map((a, i) => {
          const close = shot.kind === "portrait" || shot.kind === "impact";
          const adjusted: Actor = close
            ? { ...a, anchor: "head", y: Math.max(24, (a.y - 1000) * 0.22 + 60) }
            : { ...a, scale: a.scale * 0.68 };
          return (
            <PaperPuppet key={`${a.who}-${i}`} actor={adjusted} frame={frame} dur={dur}
              lip={lipFor(a.who)} speaking={activeSpeaker === a.who} />
          );
        })}
      </AbsoluteFill>
      <FxLayer fx={shot.fx} frame={frame} dur={dur} beats={shot.beats} />
      {shot.headline ? (
        <KineticHeadline text={shot.headline} sub={shot.subline} frame={frame}
          size={shot.kind === "portrait" ? 92 : 116} y={250} />
      ) : null}
      <Vignette strength={shot.kind === "portrait" ? 0.62 : 0.48} />
      <PaperGrain />
    </AbsoluteFill>
  );
};
