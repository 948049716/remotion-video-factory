import React from "react";
import { StoryTimelinePlayer } from "../../engine";
import { PILOT_PROJECT_CONFIG } from "./shots";

export const OldChenFlowPilotVideo: React.FC = () => {
  return <StoryTimelinePlayer config={PILOT_PROJECT_CONFIG} />;
};
