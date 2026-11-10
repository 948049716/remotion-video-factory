import React from "react";
import { Composition, Folder } from "remotion";
import { HelloWorld } from "./videos/HelloWorld/HelloWorld";
import { Logo } from "./videos/HelloWorld/Logo";
import { Title } from "./videos/HelloWorld/Title";
import { Showreel } from "./videos/Showreel/Showreel";
import { NovaReel } from "./videos/NovaReel/NovaReel";
import { ApexReel } from "./videos/ApexReel/ApexReel";
import { AiExplainer } from "./videos/AiExplainer/AiExplainer";
import { DURATION_FRAMES as AI_EXPLAINER_FRAMES } from "./videos/AiExplainer/timeline";
import { HighAltitude } from "./videos/HighAltitude/HighAltitude";
import { DURATION_FRAMES as HIGH_ALTITUDE_FRAMES } from "./videos/HighAltitude/timeline";

/**
 * Central Video Registry (RemotionRoot)
 *
 * AGENT INSTRUCTION:
 * When creating a new video:
 * 1. Place all scene & component files inside `src/videos/<YourVideoName>/`
 * 2. Import the main entry component here and register a new `<Composition>` inside `<Folder name="Productions">`.
 * 3. Do NOT delete existing compositions unless explicitly requested.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Productions">
        {/* 30-Second Motion Designer Resume Showreel (1800 frames @ 60fps) */}
        <Composition
          id="gemini4argon"
          component={Showreel}
          durationInFrames={1800}
          fps={60}
          width={1920}
          height={1080}
        />
        {/* NovaReel — 30s editorial motion showreel / resume (1800 frames @ 60fps) */}
        <Composition
          id="deepseek"
          component={NovaReel}
          durationInFrames={1800}
          fps={60}
          width={1920}
          height={1080}
        />
        {/* ApexReel — 30s High-Octane Motion Designer Résumé Showreel (1800 frames @ 60fps) */}
        <Composition
          id="gemini3-8演示"
          component={ApexReel}
          durationInFrames={1800}
          fps={60}
          width={1920}
          height={1080}
        />
        {/* 11m10s AI concepts explainer, synced to narration timetable (40197 frames @ 60fps) */}
        {/* 6m29s science explainer — why it gets colder the higher you climb (60fps) */}
        <Composition
          id="高处不胜寒"
          component={HighAltitude}
          durationInFrames={HIGH_ALTITUDE_FRAMES}
          fps={60}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Templates">
        <Composition
          id="HelloWorld"
          component={HelloWorld}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion Video Factory",
            titleColor: "#000000",
          }}
        />
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
    </>
  );
};
