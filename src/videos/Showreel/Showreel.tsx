import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { GlobalOverlay } from "../../shared/GlobalOverlay";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2KineticTypography } from "./scenes/Scene2KineticTypography";
import { Scene3SpatialUI } from "./scenes/Scene3SpatialUI";
import { Scene4GenerativeGeometry } from "./scenes/Scene4GenerativeGeometry";
import { Scene5ProjectHighlights } from "./scenes/Scene5ProjectHighlights";
import { Scene6Outro } from "./scenes/Scene6Outro";

export const Showreel: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        width: 1920,
        height: 1080,
        backgroundColor: "#08080B",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ACT I (0.0s - 4.5s | Frames 0 - 270): Squash & Stretch + Liquid Metaball Mitosis */}
      <Sequence from={0} durationInFrames={270} name="Act I: The Singularity & Liquid Physics">
        <Scene1Intro />
      </Sequence>

      {/* ACT II (4.5s - 9.0s | Frames 270 - 540): Swiss Brutalist Bento & Slit-Scan Typography */}
      <Sequence from={270} durationInFrames={270} name="Act II: Swiss Brutalism & Slit-Scan Type">
        <Scene2KineticTypography />
      </Sequence>

      {/* ACT III (9.0s - 14.0s | Frames 540 - 840): True Isometric 3D Voxels & Modular Synth */}
      <Sequence from={540} durationInFrames={300} name="Act III: Isometric 3D Voxels & Tactile Deck">
        <Scene3SpatialUI />
      </Sequence>

      {/* ACT IV (14.0s - 19.0s | Frames 840 - 1140): 48-Vertex Polygon Morphing & Chromatic Split */}
      <Sequence from={840} durationInFrames={300} name="Act IV: Procedural Morphology & RGB Shader">
        <Scene4GenerativeGeometry />
      </Sequence>

      {/* ACT V (19.0s - 25.0s | Frames 1140 - 1500): 4 Rapid-Fire Multi-Discipline Showcase Cuts */}
      <Sequence from={1140} durationInFrames={360} name="Act V: Rapid-Fire Portfolio Montage">
        <Scene5ProjectHighlights />
      </Sequence>

      {/* ACT VI (25.0s - 30.0s | Frames 1500 - 1800): High-Speed Strobe Roll & Masterpiece Dossier */}
      <Sequence from={1500} durationInFrames={300} name="Act VI: Crescendo Strobe & Résumé Dossier">
        <Scene6Outro />
      </Sequence>

      {/* Adaptive Telemetry HUD & Progress Track */}
      <GlobalOverlay />

      {/* Custom-Synthesized 120BPM Electronic Soundtrack + Synced Visual SFX */}
      <Audio
        src={staticFile("showreel-music.mp3")}
        volume={(f) =>
          interpolate(f, [0, 10, 1740, 1800], [0.85, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </div>
  );
};
