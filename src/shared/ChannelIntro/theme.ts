import { PALETTES } from "../motion-presets";
import { hexToRgba } from "./motion";
import type { IntroTheme, ResolvedIntroConfig } from "./types";

/** Single source of truth for the (still undecided) channel name. */
export const DEFAULT_BRAND = {
  displayName: "nawa科普",
  latinName: "NAWA / SCIENCE CHANNEL",
  tagline: "把复杂的世界，讲得简单一点",
  accent: "#C9FF3D",
} as const;

/** White light split into six readable spectral bands. */
export const DEFAULT_SPECTRUM = [
  "#00F0FF",
  "#4D8CFF",
  "#A66BFF",
  "#FF3D8A",
  "#FFA62B",
  "#C9FF3D",
] as const;

export const DISPLAY_FONT =
  "'Arial Black', 'Helvetica Neue', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
export const CN_FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif";
export const MONO_FONT =
  "'SF Mono', 'Cascadia Mono', Consolas, 'Liberation Mono', monospace";

export const resolveTheme = (cfg: ResolvedIntroConfig): IntroTheme => ({
  bg: cfg.background,
  ink: "#F7F9FF",
  accent: cfg.accent,
  accentSoft: hexToRgba(cfg.accent, 0.16),
  void: PALETTES.chromaticNight.void,
  spectrum: DEFAULT_SPECTRUM.slice(),
  displayFont: DISPLAY_FONT,
  cnFont: CN_FONT,
  monoFont: MONO_FONT,
});
