import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
} from "remotion";
import { C } from "./theme";
import { Chrome, CutFlashes, Grain } from "./components/Chrome";
import { Scene1ColdOpen } from "./scenes/Scene1ColdOpen";
import { Scene2Manifesto } from "./scenes/Scene2Manifesto";
import { Scene3Bento } from "./scenes/Scene3Bento";
import { Scene4SpatialType } from "./scenes/Scene4SpatialType";
import { Scene5Generative } from "./scenes/Scene5Generative";
import { Scene6Work } from "./scenes/Scene6Work";
import { Scene7Grid } from "./scenes/Scene7Grid";
import { Scene8Finale } from "./scenes/Scene8Finale";

export const NovaReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
      {/* 01 — 0.0s–2.0s */}
      <Sequence from={0} durationInFrames={120} name="01 Cold Open">
        <Scene1ColdOpen />
      </Sequence>

      {/* 02 — 2.0s–6.0s */}
      <Sequence from={120} durationInFrames={240} name="02 Manifesto">
        <Scene2Manifesto />
      </Sequence>

      {/* 03 — 6.0s–10.0s */}
      <Sequence from={360} durationInFrames={240} name="03 Capabilities">
        <Scene3Bento />
      </Sequence>

      {/* 04 — 10.0s–14.0s */}
      <Sequence from={600} durationInFrames={240} name="04 Spatial Type">
        <Scene4SpatialType />
      </Sequence>

      {/* 05 — 14.0s–18.0s */}
      <Sequence from={840} durationInFrames={240} name="05 Generative">
        <Scene5Generative />
      </Sequence>

      {/* 06 — 18.0s–22.0s */}
      <Sequence from={1080} durationInFrames={240} name="06 Selected Work">
        <Scene6Work />
      </Sequence>

      {/* 07 — 22.0s–26.0s */}
      <Sequence from={1320} durationInFrames={240} name="07 Systems">
        <Scene7Grid />
      </Sequence>

      {/* 08 — 26.0s–30.0s */}
      <Sequence from={1560} durationInFrames={240} name="08 The Resume">
        <Scene8Finale />
      </Sequence>

      <Grain opacity={0.075} />
      <CutFlashes />
      <Chrome />

      <Audio
        src={staticFile("nova-reel-score.wav")}
        volume={(f) =>
          interpolate(f, [0, 8, 1770, 1800], [0.95, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
