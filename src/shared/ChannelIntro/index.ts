/**
 * ChannelIntro — reusable channel ident.
 *
 * USAGE (any video, at the root of its component tree):
 *   import { ChannelIntro } from "../../shared/ChannelIntro";
 *   ...
 *   <AbsoluteFill> ...episode... </AbsoluteFill>
 *   <ChannelIntro />
 *
 * REBRAND:  <ChannelIntro displayName="新频道名" tagline="..." accent="#00F0FF" />
 * REPLACE:  add a variant in `registry.ts`, then <ChannelIntro variant="yourId" />
 * CONFIG:   src/shared/ChannelIntro/theme.ts → DEFAULT_BRAND (one source of truth)
 */
export { ChannelIntro } from "./ChannelIntro";
export { INTRO_PRESETS, getIntroPreset } from "./registry";
export {
  DEFAULT_BRAND,
  DEFAULT_SPECTRUM,
  DISPLAY_FONT,
  CN_FONT,
  MONO_FONT,
  resolveTheme,
} from "./theme";
export { channelIntroPropsSchema } from "./schema";
export * from "./primitives";
export * from "./motion";
export type {
  ChannelIntroProps,
  IdentSceneProps,
  IntroPreset,
  IntroTheme,
  IntroVariant,
  ResolvedIntroConfig,
} from "./types";
