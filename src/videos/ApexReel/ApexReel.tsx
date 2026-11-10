import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
} from "remotion";
import { THEME } from "./theme";
import { ApexHUD } from "./components/ApexHUD";
import { CyberGlitch } from "./components/CyberGlitch";
import { GrainNoise } from "./components/GrainNoise";
import { Scene1Singularity } from "./scenes/Scene1Singularity";
import { Scene2SpatialUI } from "./scenes/Scene2SpatialUI";
import { Scene3Morphogenesis } from "./scenes/Scene3Morphogenesis";
import { Scene4BrutalistType } from "./scenes/Scene4BrutalistType";
import { Scene5Montage } from "./scenes/Scene5Montage";
import { Scene6BezierMechanics } from "./scenes/Scene6BezierMechanics";
import { Scene7Dossier } from "./scenes/Scene7Dossier";

export const ApexReel: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.void,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ============================================================= */}
      {/* 7 PRECISION MOTION GRAPHICS ACTS (Total: 1800 frames @ 60fps)  */}
      {/* ============================================================= */}

      {/* Act 1: The Singularity Collapse & High-G Impact (0 - 4.0s | 0 - 240f) */}
      <Sequence from={0} durationInFrames={240} name="Act 01: The Singularity Collapse">
        <Scene1Singularity />
      </Sequence>

      {/* Act 2: Holographic Spatial UI & Quantum Deck (4.0s - 9.0s | 240 - 540f) */}
      <Sequence from={240} durationInFrames={300} name="Act 02: 3D Spatial UI & Holographic Deck">
        <Scene2SpatialUI />
      </Sequence>

      {/* Act 3: Parametric Topology & Chromatic Morphogenesis (9.0s - 14.0s | 540 - 840f) */}
      <Sequence from={540} durationInFrames={300} name="Act 03: Parametric Topology & Fluid">
        <Scene3Morphogenesis />
      </Sequence>

      {/* Act 4: Swiss Brutalist Typography Storm & Slit-Scan (14.0s - 19.0s | 840 - 1140f) */}
      <Sequence from={840} durationInFrames={300} name="Act 04: Swiss Brutalist Kinetic Type">
        <Scene4BrutalistType />
      </Sequence>

      {/* Act 5: Commercial Showcase Montage (19.0s - 25.0s | 1140 - 1500f) */}
      <Sequence from={1140} durationInFrames={360} name="Act 05: Commercial Project Montage">
        <Scene5Montage />
      </Sequence>

      {/* Act 6: Algorithmic Geometry & Bezier Mechanics (25.0s - 28.0s | 1500 - 1680f) */}
      <Sequence from={1500} durationInFrames={180} name="Act 06: Bezier Mathematics & Rigging">
        <Scene6BezierMechanics />
      </Sequence>

      {/* Act 7: The Apex Résumé Dossier & Master Finale (28.0s - 30.0s | 1680 - 1800f) */}
      <Sequence from={1680} durationInFrames={120} name="Act 07: Résumé Dossier & Lockup">
        <Scene7Dossier />
      </Sequence>

      {/* ============================================================= */}
      {/* GLOBAL OVERLAYS & POST-PROCESSING                             */}
      {/* ============================================================= */}

      {/* Subtle organic film grain */}
      <GrainNoise opacity={0.06} />

      {/* Beat flashes and chromatic transition punch */}
      <CyberGlitch />

      {/* Professional SMPTE timecode & telemetry HUD */}
      <ApexHUD />

      {/* Custom-synthesized 120BPM 30-Second Hi-Octane Soundtrack */}
      <Audio
        src={staticFile("apex-score.wav")}
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
