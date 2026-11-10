import type { FC } from "react";

/**
 * Stable public contract for the channel ident.
 *
 * Every video opts in with a single line:
 *   <ChannelIntro />
 * and every part of the brand / timing / look is overridable through props.
 */
export type IntroVariant = "prism" | "pulse";

export interface ChannelIntroProps {
  /** Brand name shown in the kinetic lockup. Change this one field to rebrand. */
  displayName?: string;
  /** Small Latin wordmark used by the telemetry HUD. */
  latinName?: string;
  /** Tagline under the lockup. */
  tagline?: string;
  /** Primary accent colour (hex). */
  accent?: string;
  /** Which ident design to play. Swapping this value replaces the whole opener. */
  variant?: IntroVariant;
  /** Total length in frames. Defaults to the selected variant's length. */
  durationInFrames?: number;
  /** Frame at which the ident begins. Defaults to 0. */
  startFrame?: number;
  /** Canvas colour, or "transparent" to overlay the ident on existing footage. */
  background?: string;
  /** Dip-to-white iris that hands the frame back to the episode. */
  transitionOut?: boolean;
  /** Instrument-style corner telemetry. */
  showHud?: boolean;
  /** Optional SFX, e.g. staticFile("ident.wav"). Silent when omitted. */
  audioSrc?: string;
  /** Stacking order above the episode. */
  zIndex?: number;
}

export interface ResolvedIntroConfig {
  displayName: string;
  latinName: string;
  tagline: string;
  accent: string;
  variant: IntroVariant;
  durationInFrames: number;
  startFrame: number;
  background: string;
  transitionOut: boolean;
  showHud: boolean;
  audioSrc: string | undefined;
  zIndex: number;
}

export interface IntroTheme {
  bg: string;
  ink: string;
  accent: string;
  accentSoft: string;
  void: string;
  spectrum: string[];
  displayFont: string;
  cnFont: string;
  monoFont: string;
}

/** Everything a variant receives. `f` is a canonical 0..canonicalFrames clock. */
export interface IdentSceneProps {
  f: number;
  frame: number;
  fps: number;
  width: number;
  height: number;
  canonicalFrames: number;
  durationInFrames: number;
  theme: IntroTheme;
  cfg: ResolvedIntroConfig;
  presetLabel: string;
}

export interface IntroPreset {
  id: IntroVariant;
  label: string;
  description: string;
  /** Reference timeline length at 60fps; all choreography is keyed to this. */
  canonicalFrames: number;
  defaultDurationInFrames: number;
  component: FC<IdentSceneProps>;
}
