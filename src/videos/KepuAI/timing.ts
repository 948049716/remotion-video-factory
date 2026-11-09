/**
 * Word attacks in koubo_10s.wav, read from 10ms RMS.
 * List times are the rise into each English word (not the energy peak),
 * so the badge spring is already moving when the vowel lands.
 * Skill / MCP / Harness continue past this 10.0s cut and must not pop here.
 */
export const SPOKEN_AT = {
  /** Peak of the mid-sentence “AI” inside “用各种 AI 工具”. Pulse only. */
  aiMention: 3.01,
  ai: 7.62,
  model: 8.3,
  token: 8.97,
  agent: 9.84,
} as const;

export const secToFrame = (seconds: number, fps: number) => {
  return Math.round(seconds * fps);
};
