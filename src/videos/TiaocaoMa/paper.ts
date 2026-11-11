/** 纸艺视觉的共享常量与撕边工具。 */

export const SERIF =
  '"Noto Serif SC", "Songti SC", "STSong", "SimSun", serif';

export const PAPER_NOISE = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="220" height="220" filter="url(#n)" opacity="0.55"/></svg>`,
)}")`;

/**
 * 生成确定性的手撕纸边 polygon。
 * 顶部保持直边，底部按 seed 产生不规则毛边。
 */
export const tornClipPath = (seed: number, steps = 22): string => {
  const points = ["0% 0%", "100% 0%", "100% 92%"];
  for (let i = steps; i >= 0; i -= 1) {
    const x = (i / steps) * 100;
    const y =
      92 +
      Math.sin(seed + i * 1.7) * 4 +
      Math.cos(seed * 0.7 + i * 0.9) * 2;
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  points.push("0% 92%");
  return `polygon(${points.join(", ")})`;
};
