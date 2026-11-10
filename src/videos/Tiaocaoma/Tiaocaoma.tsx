import React from "react";
import { AbsoluteFill, Audio, Sequence, useCurrentFrame } from "remotion";
import {
  CHAPTERS, DURATION_FRAMES, FPS, SFX_EVENTS, TRACKS, type Track,
} from "./data/timeline";
import { VOICE } from "./data/voice";
import { WORD_TIMES } from "./data/wordTimes";
import { AMBIENCE_EVENTS } from "./data/ambience";
import {
  COLORS, FONT, ROLE_LABEL, SCORE, SPEAKER_COLOR, ambienceFile, lerp, sfxFile, voiceFile,
} from "./design";
import { defaultShot, trackAtFrame, type Shot } from "./shots";
import { SHOTS } from "./shotData";
import { Stage } from "./stage";
import {
  ChapterCard, EndingScene, FlashbackScene, MontageScene, RankScene, TitleScene,
} from "./scenes";

/** Exact per-character timing from edgeTTS WordBoundary; waveform as fallback. */
const charTimeCache: Record<number, number[]> = {};
const charTimes = (t: Track): number[] => {
  const exact = WORD_TIMES[t.id];
  if (exact && exact.length === Array.from(t.text).length) return exact;
  if (charTimeCache[t.id]) return charTimeCache[t.id];
  const v = VOICE[t.id];
  const chars = Array.from(t.text);
  const weights = v
    ? Array.from(v.energy, (c) => parseInt(c, 16) + 1)
    : chars.map(() => 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const times: number[] = [];
  let acc = 0;
  let fi = 0;
  for (let i = 0; i < chars.length; i++) {
    const target = ((i + 0.5) / Math.max(1, chars.length)) * total;
    while (acc < target && fi < weights.length) {
      acc += weights[fi];
      fi++;
    }
    times.push(fi);
  }
  charTimeCache[t.id] = times;
  return times;
};

interface CaptionLine {
  text: string;
  start: number;
}

const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));

const captionLines = (text: string): CaptionLine[] => {
  const lines: CaptionLine[] = [];
  let cur = "";
  let start = 0;
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    cur += chars[i];
    const punctuation = "，。？！；：…".indexOf(chars[i]) >= 0;
    if ((punctuation && cur.length >= 12) || cur.length >= 26) {
      lines.push({ text: cur, start });
      start += cur.length;
      cur = "";
    }
  }
  if (cur) lines.push({ text: cur, start });
  return lines.length ? lines : [{ text, start: 0 }];
};

const Caption: React.FC<{ track: Track; local: number; shot: Shot }> = ({ track, local, shot }) => {
  if (shot.caption === "none") return null;
  const times = charTimes(track);
  const spoken = times.reduce((acc, t, i) => (local >= t ? i + 1 : acc), 0);
  const lines = captionLines(track.text);
  const active = lines.reduce((acc, l, i) =>
    (spoken >= l.start ? i : acc), 0);
  const visible = lines.slice(active, active + 2);
  const bubble = shot.caption === "bubble" || track.inner;
  const accent = SPEAKER_COLOR[track.speaker ?? "waiter"] ?? COLORS.vermilion;
  const enter = lerp(local, [0, 12], [0, 1]);
  const exit = lerp(local, [track.durationFrames - 14, track.durationFrames], [1, 0]);
  return (
    <div style={{
      position: "absolute", left: 960, bottom: 74, transform: "translateX(-50%)",
      width: 1420, opacity: enter * exit, zIndex: 62,
    }}>
      <div style={{
        position: "relative", padding: bubble ? "26px 46px" : "26px 58px",
        backgroundColor: bubble ? "rgba(250,241,220,0.93)" : "rgba(243,229,199,0.96)",
        border: bubble ? `3px dashed ${accent}` : `3px solid rgba(120,80,44,0.35)`,
        borderRadius: bubble ? 42 : 4,
        clipPath: bubble ? undefined : "polygon(0 3%, 3% 0, 26% 1%, 52% 0, 78% 2%, 100% 0, 99% 96%, 74% 100%, 48% 98%, 22% 100%, 0 97%)",
        boxShadow: "0 16px 34px rgba(48,26,12,0.34), inset 0 2px 0 rgba(255,255,255,0.6)",
        textAlign: "center",
      }}>
        <div style={{
          position: "absolute", left: -26, top: -26, width: 82, height: 82,
          backgroundColor: accent, color: COLORS.paperLight,
          fontFamily: FONT.seal, fontSize: 19, lineHeight: "24px",
          paddingTop: 17, textAlign: "center", transform: "rotate(-9deg)",
          borderRadius: 5, boxShadow: "0 8px 14px rgba(48,26,12,0.35)",
        }}>{track.inner ? "心" : ROLE_LABEL[track.role]?.slice(0, 1) ?? "说"}</div>
        {visible.map((line, li) => (
          <div key={li} style={{
            fontFamily: FONT.body, fontSize: li === 0 ? 37 : 32,
            lineHeight: 1.55, letterSpacing: 2, color: COLORS.ink,
            opacity: li === 0 ? 1 : 0.58,
          }}>
            {Array.from(line.text).map((c, i) => {
              const idx = line.start + i;
              const said = idx < spoken;
              const now = idx === spoken - 1;
              return (
                <span key={i} style={{
                  color: now ? accent : said ? COLORS.ink : "rgba(74,56,44,0.42)",
                  fontWeight: now ? 800 : 500,
                  textShadow: now ? `0 0 18px ${accent}55` : undefined,
                }}>{c}</span>
              );
            })}
          </div>
        ))}
      </div>
      {bubble ? (
        <div style={{
          position: "absolute", left: 210, bottom: -26, width: 40, height: 40,
          backgroundColor: "rgba(250,241,220,0.93)", borderLeft: `3px dashed ${accent}`,
          borderBottom: `3px dashed ${accent}`, transform: "rotate(-28deg)",
        }} />
      ) : null}
    </div>
  );
};

const HUD: React.FC<{ frame: number }> = ({ frame }) => {
  const sec = Math.floor(frame / FPS);
  const tc = `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}:${pad2(frame % FPS)}`;
  const chapter = CHAPTERS.reduce((acc, c, i) => (frame >= c.fromFrame ? i : acc), 0);
  const trackNo = TRACKS.reduce((acc, t, i) => (frame >= t.startFrame ? i + 1 : acc), 0);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 64, fontFamily: FONT.mono }}>
      <div style={{ position: "absolute", left: 46, top: 38, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 12, height: 12, backgroundColor: COLORS.vermilion, transform: "rotate(45deg)" }} />
        <div style={{ fontSize: 19, letterSpacing: 5, color: COLORS.paperLight,
          textShadow: "0 2px 6px rgba(30,16,8,0.8)" }}>跳槽马 · 剪纸定格动画</div>
        <div style={{ fontSize: 15, opacity: 0.7, color: COLORS.paperLight }}>/ TRACK {pad2(trackNo)} · 54</div>
      </div>
      <div style={{ position: "absolute", right: 46, top: 38, fontSize: 20, letterSpacing: 3,
        color: COLORS.paperLight, textShadow: "0 2px 6px rgba(30,16,8,0.8)" }}>{tc}</div>
      <div style={{ position: "absolute", left: 46, bottom: 26, display: "flex", gap: 6,
        alignItems: "flex-end" }}>
        {CHAPTERS.map((c, i) => {
          const w = Math.max(48, (c.toFrame - c.fromFrame) / DURATION_FRAMES * 1420);
          const p = lerp(frame, [c.fromFrame, c.toFrame], [0, 1]);
          return (
            <div key={c.id} style={{ width: w, height: 5, backgroundColor: "rgba(246,232,203,0.35)",
              position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${p * 100}%`,
                backgroundColor: i === chapter ? COLORS.vermilion : "rgba(246,232,203,0.65)" }} />
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", right: 46, bottom: 22, fontSize: 15, letterSpacing: 3,
        color: COLORS.paperLight, opacity: 0.8 }}>{CHAPTERS[chapter]?.label}</div>
    </AbsoluteFill>
  );
};

/** 10-frame paper wipe at each cut. */
const CutVeil: React.FC<{ local: number; muted: boolean }> = ({ local, muted }) => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 65,
    backgroundColor: COLORS.paperLight,
    opacity: lerp(local, [0, 3, 11],
      [muted ? 0.10 : 0.22, muted ? 0.05 : 0.10, 0]) }} />
);

export const Tiaocaoma: React.FC = () => {
  const frame = useCurrentFrame();
  const current = trackAtFrame(frame, TRACKS)
    ?? TRACKS.reduce((acc, t) => (frame >= t.startFrame ? t : acc), TRACKS[0]);
  const local = Math.max(0, Math.min(frame - current.startFrame, current.durationFrames - 1));
  const shot = SHOTS[current.id] ?? defaultShot(current);
  const inGap = frame >= current.endFrame;
  const sceneProps = { shot, track: current, frame: local, dur: current.durationFrames };

  const renderScene = () => {
    switch (shot.kind) {
      case "title": return <TitleScene {...sceneProps} />;
      case "rank": return <RankScene {...sceneProps} />;
      case "montage": return <MontageScene {...sceneProps} />;
      case "flashback": return <FlashbackScene {...sceneProps} />;
      case "ending": return <EndingScene {...sceneProps} />;
      default: return <Stage {...sceneProps} />;
    }
  };

  const card = CHAPTERS.slice(1).find((c) => frame >= c.fromFrame && frame < c.fromFrame + 168);
  const cardLocal = card ? frame - card.fromFrame : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      {renderScene()}
      {!inGap ? <Caption track={current} local={local} shot={shot} /> : null}
      <CutVeil local={local} muted={shot.fx.indexOf("flash") >= 0} />
      {card ? <ChapterCard frame={cardLocal} label={card.label} sub={card.sub} /> : null}
      <HUD frame={frame} />

      {/* 54 dialogue clips placed at their exact absolute frame — frame-accurate sound. */}
      {TRACKS.map((t) => (
        <Sequence key={`v-${t.id}`} from={t.startFrame} durationInFrames={t.durationFrames}
          name={`#${pad2(t.id)} ${t.role}`}>
          <Audio src={voiceFile(t.file)} volume={1} />
        </Sequence>
      ))}
      {/* Five missing foley events, synthesised and aligned to the timetable. */}
      {SFX_EVENTS.map((e) => (
        <Sequence key={`s-${e.frame}`} from={e.frame} durationInFrames={135} name={e.label}>
          <Audio src={sfxFile(e.file)} volume={0.6} />
        </Sequence>
      ))}
      {/* edgeTTS ambience / crowd-reaction voice layers, ducked under the dialogue. */}
      {AMBIENCE_EVENTS.map((e, i) => (
        <Sequence key={`a-${i}`} from={e.frame} durationInFrames={e.frames} name={e.label}>
          <Audio src={ambienceFile(e.file)} volume={e.volume} />
        </Sequence>
      ))}
      {/* Quiet paper-theatre score, ducked under the voices. */}
      <Audio src={SCORE} volume={(f) => lerp(f,
        [0, 120, DURATION_FRAMES - 180, DURATION_FRAMES], [0, 0.085, 0.085, 0])} />
    </AbsoluteFill>
  );
};
