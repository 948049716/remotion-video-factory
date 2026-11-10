import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ACCENT, INK, MONO, pad, FONT } from "./primitives";
import { VideoProgressBar } from "../../shared/VideoProgressBar";
import {
  DURATION_FRAMES,
  FPS,
  NARRATION_SECONDS,
  SEGMENTS,
  segmentFrames,
  startFrame,
  type Segment,
} from "./timeline";
import {
  BonfireSetup,
  BonfireStep,
  Chapter1,
  Hook,
  HookPeak,
  CosmicScale,
  Intuition,
  LapseRate,
  Negligible,
  Numbers,
  Question,
  SameSun,
  ThreeLies,
} from "./scenes1";
import {
  ArmorPiercing,
  Blanket,
  Catch,
  Chain,
  Chapter2,
  ClimbAway,
  GroundHeat,
  Longwave,
  Picky,
  Shortwave,
  Source,
} from "./scenes2";
import {
  Adiabatic,
  Chapter3,
  Duvet,
  Experiment37,
  ExperimentCold,
  ExperimentWarm,
  Gauze,
  Outro,
  RiseExpand,
} from "./scenes3";
import {
  Chapter3A,
  Falloff,
  MoleculeCollide,
  Processes,
  Summary,
  ThinAir,
} from "./scenes4";

const OUTRO_FRAMES = DURATION_FRAMES - Math.round(NARRATION_SECONDS * FPS);

const Acts = [
  { id: "intro", cn: "开场", en: "PROLOGUE", color: ACCENT.warm },
  { id: "distance", cn: "距离的错觉", en: "01 · DISTANCE", color: ACCENT.indigo },
  { id: "radiator", cn: "地面暖气片", en: "02 · RADIATOR", color: ACCENT.ember },
  { id: "adiabatic", cn: "空气的自我消耗", en: "03 · SELF-CONSUMPTION", color: ACCENT.cyan },
  { id: "recap", cn: "回顾", en: "RECAP · 三条线索", color: ACCENT.ice },
  { id: "outro", cn: "尾声", en: "EPILOGUE", color: "#C7D5EA" },
] as const;

const ACT_RANGES: { act: (typeof Acts)[number]; fromFrame: number }[] = [
  { act: Acts[0], fromFrame: 0 },
  { act: Acts[1], fromFrame: startFrame(SEGMENTS.find((s) => s.scene === "chapter-1")!) },
  { act: Acts[2], fromFrame: startFrame(SEGMENTS.find((s) => s.scene === "chapter-2")!) },
  { act: Acts[3], fromFrame: startFrame(SEGMENTS.find((s) => s.scene === "chapter-3a")!) },
  { act: Acts[4], fromFrame: startFrame(SEGMENTS.find((s) => s.scene === "recap")!) },
  { act: Acts[3], fromFrame: startFrame(SEGMENTS.find((s) => s.scene === "chapter-3b")!) },
  { act: Acts[5], fromFrame: Math.round(NARRATION_SECONDS * FPS) },
];

const actAt = (frame: number) => {
  let current = ACT_RANGES[0];
  for (const r of ACT_RANGES) {
    if (frame >= r.fromFrame) current = r;
  }
  return current.act;
};

const timecode = (frame: number): string => {
  const totalSeconds = Math.floor(frame / FPS);
  const mm = pad(Math.floor(totalSeconds / 60));
  const ss = pad(totalSeconds % 60);
  const ff = pad(frame % FPS);
  return `${mm}:${ss}:${ff}`;
};

/* ------------------------------------------------------------------ */
/* HUD                                                                 */
/* ------------------------------------------------------------------ */
const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const act = actAt(frame);
  const seg = SEGMENTS.find((s) => frame >= Math.round(s.startSec * FPS) && frame < Math.round(s.endSec * FPS));
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90, fontFamily: FONT }}>
      {/* brand */}
      <div style={{ position: "absolute", top: 26, left: 48, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: act.color, boxShadow: `0 0 12px ${act.color}` }} />
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.06em", color: "rgba(245,248,255,0.92)" }}>高处不胜寒的真相</span>
        <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.22em", color: "rgba(235,243,255,0.4)" }}>A CLIMATE MYSTERY</span>
      </div>
      {/* act + timecode */}
      <div style={{ position: "absolute", top: 22, right: 48, display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ padding: "6px 16px", borderRadius: 999, border: `1px solid ${act.color}66`, backgroundColor: "rgba(6,10,18,0.62)", fontFamily: MONO, fontSize: 15, letterSpacing: "0.16em", color: act.color }}>
          {act.en}
        </span>
        <span style={{ padding: "6px 14px", borderRadius: 999, backgroundColor: "rgba(4,8,16,0.5)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: MONO, fontSize: 15, letterSpacing: "0.12em", color: "rgba(235,243,255,0.72)", fontVariantNumeric: "tabular-nums" }}>
          TC {timecode(frame)} · {seg ? pad(seg.index) : "—"}/{pad(SEGMENTS.length)}
        </span>
      </div>
      {/* chapter map (overall progress lives in the bottom VideoProgressBar) */}
      <div style={{ position: "absolute", top: 80, left: 48, right: 48, display: "flex", gap: 6 }}>
        {ACT_RANGES.map((r, i) => {
          const end = i + 1 < ACT_RANGES.length ? ACT_RANGES[i + 1].fromFrame : durationInFrames;
          const active = act === r.act;
          return (
            <div
              key={`${r.act.id}-${r.fromFrame}`}
              style={{
                flex: Math.max(1, end - r.fromFrame),
                height: 4,
                borderRadius: 2,
                backgroundColor: active ? r.act.color : "rgba(255,255,255,0.12)",
                boxShadow: active ? `0 0 10px ${r.act.color}66` : "none",
              }}
            />
          );
        })}
      </div>
      {/* vignette */}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 240px rgba(0,0,0,0.55)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Karaoke captions                                                    */
/* ------------------------------------------------------------------ */
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = SEGMENTS.find((s) => frame >= Math.round(s.startSec * FPS) && frame < Math.round(s.endSec * FPS));
  if (!seg) return null;
  const sec = frame / FPS;
  let last = 0;
  for (let i = 0; i < seg.charTimes.length; i++) {
    if (seg.charTimes[i] <= sec) last = i + 1;
  }
  const act = actAt(frame);
  const chars = seg.text.split("");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, zIndex: 80, display: "flex", justifyContent: "center", pointerEvents: "none", fontFamily: FONT }}>
      <div
        style={{
          maxWidth: 1560,
          padding: "12px 30px 10px",
          borderRadius: 16,
          backgroundColor: "rgba(4,8,16,0.66)",
          border: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 27, lineHeight: 1.52, letterSpacing: "0.02em" }}>
          {chars.map((c, i) => {
            const spoken = i < last - 1;
            const current = i === last - 1;
            return (
              <span
                key={i}
                style={{
                  color: current ? act.color : spoken ? "rgba(245,248,255,0.95)" : "rgba(245,248,255,0.32)",
                  fontWeight: current ? 800 : 500,
                  textShadow: current ? `0 0 20px ${act.color}66` : "none",
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scene switch                                                       */
/* ------------------------------------------------------------------ */
const SCENE_COMPONENTS: Record<string, React.FC<{ dur: number }>> = {
  hook: Hook,
  "hook-peak": HookPeak,
  question: Question,
  intuition: Intuition,
  "lapse-rate": LapseRate,
  "three-lies": ThreeLies,
  "chapter-1": Chapter1,
  "cosmic-scale": CosmicScale,
  numbers: Numbers,
  "bonfire-setup": BonfireSetup,
  "bonfire-step": BonfireStep,
  negligible: Negligible,
  "same-sun": SameSun,
  "chapter-2": Chapter2,
  source: Source,
  picky: Picky,
  shortwave: Shortwave,
  "armor-piercing": ArmorPiercing,
  "ground-heat": GroundHeat,
  longwave: Longwave,
  catch: Catch,
  falloff: Falloff,
  "chapter-3a": Chapter3A,
  "thin-air": ThinAir,
  "molecule-collide": MoleculeCollide,
  recap: HookPeak,
  summary: Summary,
  "catch-recap": Catch,
  chain: Chain,
  blanket: Blanket,
  "climb-away": ClimbAway,
  "chapter-3b": Chapter3,
  processes: Processes,
  "rise-expand": RiseExpand,
  adiabatic: Adiabatic,
  "experiment-warm": ExperimentWarm,
  "experiment-cold": ExperimentCold,
  "experiment-37": Experiment37,
  duvet: Duvet,
  gauze: Gauze,
};

const SceneRenderer: React.FC<{ seg: Segment }> = ({ seg }) => {
  const Comp = SCENE_COMPONENTS[seg.scene];
  if (!Comp) {
    return null;
  }
  return <Comp dur={segmentFrames(seg)} />;
};

/* ------------------------------------------------------------------ */
/* Main composition                                                   */
/* ------------------------------------------------------------------ */
export const HighAltitude: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: INK.deep, fontFamily: FONT }}>
      {SEGMENTS.map((seg) => (
        <Sequence
          key={seg.index}
          from={startFrame(seg)}
          durationInFrames={Math.max(1, segmentFrames(seg))}
          name={`${pad(seg.index)} ${seg.headline}`}
        >
          <SceneRenderer seg={seg} />
        </Sequence>
      ))}

      {/* outro, music only */}
      <Sequence
        from={Math.round(NARRATION_SECONDS * FPS)}
        durationInFrames={OUTRO_FRAMES}
        name="Outro"
      >
        <Outro dur={OUTRO_FRAMES} />
      </Sequence>

      {/* narration from frame 0 (public/high-altitude/narration.mp3, 382.92s) */}
      <Audio src={staticFile("high-altitude/narration.mp3")} volume={1} />
      {/* light acoustic bed, ducked under narration; keep this low */}
      <Audio src={staticFile("high-altitude/bgm.mp3")} volume={0.25} />

      <Captions />
      <Hud />
      <VideoProgressBar
        height={6}
        colors={[ACCENT.warm, ACCENT.indigo, ACCENT.ember, ACCENT.cyan]}
      />
    </AbsoluteFill>
  );
};
