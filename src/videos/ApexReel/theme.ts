import { Easing } from "remotion";

/**
 * ApexReel Design System & Motion Physics Presets
 */
export const THEME = {
  colors: {
    void: "#050508",          // Deep obsidian black
    surface: "#0D0E15",       // Dark elevated panel
    elevated: "#151824",      // High contrast card surface
    border: "rgba(255, 255, 255, 0.12)",
    borderBright: "rgba(255, 255, 255, 0.35)",
    
    // Core Accent Triad
    electricCyan: "#00F0FF",  // Laser cyan
    neonLime: "#CCFF00",      // High-visibility acid lime
    crimsonRed: "#FF1744",    // Aggressive Swiss vermilion
    solarAmber: "#FF9100",    // Warm telemetry amber
    hyperViolet: "#8A2BE2",   // Deep holographic purple
    pureWhite: "#FFFFFF",
    mutedWhite: "rgba(255, 255, 255, 0.65)",
    dimWhite: "rgba(255, 255, 255, 0.35)",
  },

  fonts: {
    mono: "'SF Mono', 'JetBrains Mono', 'Fira Code', Consolas, monospace",
    display: "'Impact', 'Arial Black', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
    sans: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
  },

  springs: {
    // Ultra crisp UI snap
    snap: { damping: 14, stiffness: 220, mass: 0.5 },
    // Dramatic elastic overshoot
    punchy: { damping: 11, stiffness: 180, mass: 0.65 },
    // Heavy mechanical inertia
    heavy: { damping: 18, stiffness: 120, mass: 1.2 },
    // Liquid smooth organic motion
    liquid: { damping: 25, stiffness: 90, mass: 1.0 },
    // Extreme spring bounce
    trampoline: { damping: 8, stiffness: 240, mass: 0.8 },
  },

  easings: {
    expoOut: Easing.bezier(0.16, 1.0, 0.3, 1.0),
    whip: Easing.bezier(0.85, 0.0, 0.15, 1.0),
    cinematic: Easing.bezier(0.25, 0.1, 0.25, 1.0),
    gravity: Easing.bezier(0.6, 0.04, 0.98, 0.34),
  },
} as const;
