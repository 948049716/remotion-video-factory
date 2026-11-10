import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const FRAMES = {
  "01-hook": 150,
  "02-hook-peak": 460,
  "03-question": 780,
  "04-intuition": 1150,
  "05-lapse-rate": 1400,
  "06-three-lies": 1780,
  "07-chapter-1": 2200,
  "08-cosmic-scale": 2550,
  "09-numbers": 3000,
  "10-bonfire-step": 3800,
  "11-same-sun": 4800,
  "12-chapter-2": 5200,
  "13-source": 5600,
  "14-picky": 6000,
  "15-shortwave": 6400,
  "16-armor-piercing": 7000,
  "17-ground-heat": 7600,
  "18-longwave": 8000,
  "19-catch": 8700,
  "20-falloff": 9500,
  "21-thin-air": 10700,
  "22-molecule-collide": 11900,
  "23-summary": 13600,
  "24-chain": 15050,
  "25-blanket": 15600,
  "26-climb-away": 16400,
  "27-processes": 17400,
  "28-rise-expand": 18400,
  "29-adiabatic": 19200,
  "30-experiment-warm": 19900,
  "31-experiment-cold": 20300,
  "32-experiment-37": 21000,
  "33-duvet": 21900,
  "34-gauze": 22700,
  "35-outro": 23200,
};

const only = process.argv.slice(2);
const entries = Object.entries(FRAMES).filter(([n]) => only.length === 0 || only.some((filter) => n.includes(filter)));

const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  webpackOverride: (config) => config,
});

const composition = await selectComposition({
  serveUrl,
  id: "高处不胜寒",
});

console.log("composition", composition.width, composition.height, composition.durationInFrames);

const queue = [...entries];
const workers = Array.from({ length: 2 }, async () => {
  while (queue.length) {
    const [name, frame] = queue.shift();
    await renderStill({
      composition,
      serveUrl,
      frame,
      output: path.resolve(`out/audit/${name}.png`),
    });
    console.log("done", name, frame);
  }
});
await Promise.all(workers);
console.log("all done");
process.exit(0);
