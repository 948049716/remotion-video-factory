import React from "react";
import { Folder } from "remotion";

/**
 * Central Video Registry (RemotionRoot)
 *
 * AGENT INSTRUCTION:
 * When creating a new video:
 * 1. Place all scene & component files inside `src/videos/<YourVideoName>/`
 * 2. Import the main entry component here and register a new `<Composition>` inside `<Folder name="Productions">`.
 * 3. Do NOT delete existing compositions unless explicitly requested.
 *
 * NOTE: All compositions were cleared on request; no videos are currently registered.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Register new productions here. */}
      <Folder name="Productions" />

      {/* Register new templates here. */}
      <Folder name="Templates" />
    </>
  );
};
