import { PrismIdent } from "./variants/PrismIdent";
import { PulseIdent } from "./variants/PulseIdent";
import type { IntroPreset, IntroVariant } from "./types";

/**
 * Ident registry — the replacement point.
 *
 * To ship a new opener later: create `variants/<Name>.tsx`, add ONE entry here,
 * and add its id to `IntroVariant`. No call site in any video has to change.
 */
export const INTRO_PRESETS: Record<IntroVariant, IntroPreset> = {
  prism: {
    id: "prism",
    label: "PRISM / 白光色散",
    description:
      "180f @60fps. Light enters, impacts, disperses through a morphing prism, " +
      "then recombines into the kinetic wordmark. Iris wipe hands off to the episode.",
    canonicalFrames: 180,
    defaultDurationInFrames: 180,
    component: PrismIdent,
  },
  pulse: {
    id: "pulse",
    label: "PULSE / 信号脉冲",
    description:
      "72f @60fps. Compact oscilloscope sting for short-form videos: " +
      "one heartbeat, concentric rings, snap-in wordmark, shutter out.",
    canonicalFrames: 72,
    defaultDurationInFrames: 72,
    component: PulseIdent,
  },
};

export const getIntroPreset = (variant: IntroVariant): IntroPreset =>
  INTRO_PRESETS[variant] ?? INTRO_PRESETS.prism;
