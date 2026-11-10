import React from "react";

export const C = {
  ink: "#0B0B0C",
  inkSoft: "#151518",
  paper: "#F2EFE6",
  paperDeep: "#E4DFD1",
  white: "#FFFFFF",
  vermilion: "#F2441E",
  cobalt: "#1F3BFF",
  acid: "#E9FF1A",
  cyan: "#00E5FF",
  magenta: "#FF1F8F",
  mint: "#00E5A0",
} as const;

export const F = {
  display: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Consolas', 'SF Mono', Menlo, monospace",
} as const;

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const ACT_BOUNDARIES = [0, 120, 360, 600, 840, 1080, 1320, 1560, 1800];

export const ACT_LABELS = [
  "COLD OPEN",
  "MANIFESTO",
  "CAPABILITIES",
  "SPATIAL TYPE",
  "GENERATIVE",
  "SELECTED WORK",
  "SYSTEMS",
  "THE RESUME",
];

export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const clampValue = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** 1 on the beat, decaying to 0 before the next one. */
export const beatPulse = (frame: number, bpm = 120, fps = 60) => {
  const framesPerBeat = (60 / bpm) * fps;
  const p = (frame % framesPerBeat) / framesPerBeat;
  return Math.exp(-p * 7);
};

export const hexToRgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

interface MarkProps {
  size?: number;
  color?: string;
  accent?: string;
  strokeWidth?: number;
}

/** Nova Reyes monogram — geometric N inside a registration ring. */
export const Mark: React.FC<MarkProps> = ({
  size = 120,
  color = C.ink,
  accent = C.vermilion,
  strokeWidth = 5,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    style={{ display: "block", overflow: "visible" }}
  >
    <circle
      cx={60}
      cy={60}
      r={53}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M38 82 V38 L82 82 V38"
      fill="none"
      stroke={color}
      strokeWidth={12}
      strokeLinecap="square"
    />
    <circle cx={99} cy={21} r={7.5} fill={accent} />
  </svg>
);

interface AsteriskProps {
  size?: number;
  color?: string;
  rotation?: number;
  spokes?: number;
  weight?: number;
}

export const Asterisk: React.FC<AsteriskProps> = ({
  size = 160,
  color = C.ink,
  rotation = 0,
  spokes = 12,
  weight = 15,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    style={{ display: "block", transform: `rotate(${rotation}deg)` }}
  >
    {range(spokes).map((i) => {
      const a = (i / spokes) * Math.PI * 2;
      const r0 = 26;
      const r1 = i % 3 === 0 ? 92 : 74;
      return (
        <line
          key={i}
          x1={100 + Math.cos(a) * r0}
          y1={100 + Math.sin(a) * r0}
          x2={100 + Math.cos(a) * r1}
          y2={100 + Math.sin(a) * r1}
          stroke={color}
          strokeWidth={weight}
          strokeLinecap="round"
        />
      );
    })}
    <circle cx={100} cy={100} r={13} fill={color} />
  </svg>
);
