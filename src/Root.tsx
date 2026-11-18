import React from "react";
import { Composition, Folder } from "remotion";
import { OldChenMusicBoxVideo } from "./videos/OldChenMusicBox/StoryVideo";
import { FPS, TOTAL_FRAMES } from "./videos/OldChenMusicBox/shots";
import { OldChenFlowPilotVideo } from "./videos/OldChenFlowPilot/StoryVideo";
import {
  PILOT_FPS,
  PILOT_TOTAL_FRAMES,
} from "./videos/OldChenFlowPilot/shots";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Productions">
        <Composition
          id="OldChenFlowPilot"
          component={OldChenFlowPilotVideo}
          durationInFrames={PILOT_TOTAL_FRAMES}
          fps={PILOT_FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="OldChenMusicBox"
          component={OldChenMusicBoxVideo}
          durationInFrames={TOTAL_FRAMES}
          fps={FPS}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Templates" />
    </>
  );
};
