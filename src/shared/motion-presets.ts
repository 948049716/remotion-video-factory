import { Easing } from "remotion";

/**
 * Shared Spring Physics Presets for consistent, world-class motion feel across all videos.
 */
export const SPRING_CONFIGS = {
  /** Crisp, responsive UI & kinetic typography entry */
  snappy: { damping: 13, stiffness: 180, mass: 0.6 },
  /** High-energy bounce with controlled overshoot */
  elastic: { damping: 10, stiffness: 160, mass: 0.7 },
  /** Heavy architectural / 3D object movement */
  heavy: { damping: 16, stiffness: 110, mass: 1.1 },
  /** Smooth, no-bounce critically damped settle */
  smooth: { damping: 200, stiffness: 140, mass: 1.0 },
} as const;

/**
 * Shared Cubic-Bezier Easing Curves
 */
export const EASING_CURVES = {
  /** Apple / Swiss exponential out */
  expoOut: Easing.bezier(0.16, 1.0, 0.3, 1.0),
  /** Dramatic slow-in, fast-out whip transition */
  whipInOut: Easing.bezier(0.7, 0.0, 0.2, 1.0),
  /** Gravity free-fall acceleration */
  gravityIn: Easing.bezier(0.55, 0.0, 0.9, 0.4),
} as const;

/**
 * Curated Art-Direction Color Palettes
 */
export const PALETTES = {
  swissBrutalist: {
    canvas: "#F4F1EA",
    ink: "#0A0A0C",
    kleinBlue: "#0038FF",
    vermilion: "#FF2A00",
    acidYellow: "#E5FF00",
  },
  teenageEngineering: {
    chassisDark: "#121316",
    panelDark: "#191B20",
    aluminum: "#D8DCE3",
    fieldOrange: "#FF5500",
    oscMint: "#00FF9D",
  },
  chromaticNight: {
    void: "#06040C",
    acidLime: "#CCFF00",
    cyberCyan: "#00F0FF",
    neonMagenta: "#FF0055",
  },
  /**
   * 科普片「七个词讲清 AI」厨房宇宙色板。
   * 七个关键词色全片锁定，场景组件只引用这里，不另写 HEX。
   */
  kepuKitchen: {
    canvas: "#F7F4EF",
    plateDark: "#121826",
    plateLift: "#1B2636",
    ink: "#1A2332",
    inkMuted: "#5C6570",
    card: "#E8E0D4",
    captionHighlight: "#F4C430",
    warning: "#D97706",
    brake: "#D64545",
    mist: "#E4E8EE",
    timeline: "#8E99AA",
    scrim: "#070B12",
    keywords: {
      ai: "#2B4C7E",
      model: "#E07A3D",
      token: "#2A9D8F",
      agent: "#3D7EA6",
      skill: "#6B8F3C",
      mcp: "#6C5B7B",
      harness: "#C9A227",
    },
  },
} as const;
