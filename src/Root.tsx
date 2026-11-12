import React from "react";
import { Composition, Folder } from "remotion";
import { FoxStarlightSeedAnimatic } from "./videos/FoxStarlightSeed/Animatic";
import { FPS, TOTAL_FRAMES } from "./videos/FoxStarlightSeed/shots";

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
        <Composition
          id="FoxStarlightSeed-Animatic"
          component={FoxStarlightSeedAnimatic}
          durationInFrames={TOTAL_FRAMES}
          fps={FPS}
          width={1920}
          height={1080}
        />
      </Folder>

      {/* Register new templates here. */}
      <Folder name="Templates" />
    </>
  );
};
