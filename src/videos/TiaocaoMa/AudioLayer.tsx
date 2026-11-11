import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

import { MUSIC_CUES } from "./audio-direction";
import { RETIMED_SHOTS } from "./retimed-timeline";
import { SHOT_META } from "./shot-meta";

const TOTAL_FRAMES =
  RETIMED_SHOTS[RETIMED_SHOTS.length - 1]?.endFrame ?? 0;
const VOICE_SEGMENTS = RETIMED_SHOTS.flatMap((shot) => shot.segments);

const BASE_VOLUME = 0.3;
const DUCK_VOLUME = 0.07;
const VOICE_VOLUME = 1.35;
const RAMP = 7;

const BGM_VOLUME = new Array<number>(TOTAL_FRAMES).fill(BASE_VOLUME);
for (const segment of VOICE_SEGMENTS) {
  const start = Math.max(0, segment.absoluteStartFrame - RAMP);
  const end = Math.min(
    TOTAL_FRAMES - 1,
    segment.absoluteStartFrame + segment.durationInFrames + RAMP,
  );
  for (let frame = start; frame <= end; frame += 1) {
    const rampIn = Math.min(1, (frame - start) / RAMP);
    const rampOut = Math.min(1, (end - frame) / RAMP);
    const ramp = Math.min(rampIn, rampOut);
    const target = BASE_VOLUME - (BASE_VOLUME - DUCK_VOLUME) * ramp;
    BGM_VOLUME[frame] = Math.min(BGM_VOLUME[frame], target);
  }
}

const SFX_VOLUME: Record<string, number> = {
  paper: 0.42,
  crowd: 0.22,
  bell: 0.45,
  horse: 0.4,
  wood: 0.45,
  metal: 0.32,
  cloth: 0.28,
  stamp: 0.5,
  abacus: 0.38,
  door: 0.45,
  body: 0.45,
  gong: 0.55,
  weather: 0.18,
  sword: 0.5,
};

const SFX_DURATION: Record<string, number> = {
  paper: 24,
  crowd: 96,
  bell: 60,
  horse: 60,
  wood: 24,
  metal: 24,
  cloth: 24,
  stamp: 18,
  abacus: 24,
  door: 36,
  body: 24,
  gong: 72,
  weather: 120,
  sword: 30,
};

export const AudioLayer: React.FC = () => (
  <>
    {MUSIC_CUES.map((cue) => (
      <Sequence
        key={cue.id}
        from={cue.startFrame}
        durationInFrames={cue.endFrame - cue.startFrame}
        name={`BGM ${cue.title}`}
      >
        <Audio
          src={staticFile(cue.file)}
          volume={(frame) => {
            const global =
              frame >= cue.startFrame ? frame : cue.startFrame + frame;
            return (
              BGM_VOLUME[
                Math.min(Math.max(global, 0), TOTAL_FRAMES - 1)
              ] ?? BASE_VOLUME
            );
          }}
        />
      </Sequence>
    ))}

    {VOICE_SEGMENTS.map((segment) => {
      const duration = Math.max(
        1,
        Math.min(
          segment.durationInFrames + 6,
          TOTAL_FRAMES - segment.absoluteStartFrame,
        ),
      );
      return (
        <Sequence
          key={segment.id}
          from={segment.absoluteStartFrame}
          durationInFrames={duration}
          name={`VO ${segment.speaker}`}
        >
          <Audio src={staticFile(segment.staticPath)} volume={VOICE_VOLUME} />
        </Sequence>
      );
    })}

    {RETIMED_SHOTS.flatMap((shot) => {
      const meta = SHOT_META[shot.id];
      if (!meta) return [];
      const playable = meta.sfx.filter(
        (cue) => Boolean(cue.file) && cue.family !== "silence",
      );
      return playable.map((cue, index) => {
        if (!cue.file) return null;
        const offset = Math.round(
          ((index + 1) / (playable.length + 1)) *
            Math.min(shot.durationFrames, 240),
        );
        const start =
          shot.startFrame +
          Math.max(0, Math.min(offset, shot.durationFrames - 12));
        return (
          <Sequence
            key={`${shot.id}-sfx-${index}`}
            from={start}
            durationInFrames={SFX_DURATION[cue.family] ?? 30}
            name={`SFX ${cue.name}`}
          >
            <Audio
              src={staticFile(cue.file)}
              volume={SFX_VOLUME[cue.family] ?? 0.4}
            />
          </Sequence>
        );
      });
    })}
  </>
);
