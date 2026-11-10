/** Batch-render one representative frame for every shot, plus edge cases. */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const TIMETABLE = "D:/下载/跳槽马AI视频-20261110T134214Z-1-001/跳槽马AI视频/02-音频与时刻表/音频时刻表.json";
const OUT = path.resolve("out/tc-audit");
fs.mkdirSync(OUT, { recursive: true });

const tt = JSON.parse(fs.readFileSync(TIMETABLE, "utf8"));
const items = tt.tracks.map((t) => ({
  name: `${String(t.id).padStart(2, "0")}-mid`,
  frame: Math.round((t.startFrame + t.endFrame) / 2),
}));
const extras = [
  ["00-first", 0], ["00-title-out", 350], ["00-cut", 5663],
  ["48-start", 37356], ["48-end", 37435],
  ["54-last", 42330], ["54-end", 42334],
];
for (const [name, frame] of extras) items.push({ name, frame });
items.sort((a, b) => a.frame - b.frame);

const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  webpackOverride: (config) => config,
});
const composition = await selectComposition({ serveUrl, id: "跳槽马" });
console.log("composition", composition.width, composition.height, composition.durationInFrames);

const errors = [];
const queue = [...items];
const workers = Array.from({ length: 3 }, async () => {
  while (queue.length) {
    const { name, frame } = queue.shift();
    try {
      await renderStill({
        composition,
        serveUrl,
        frame,
        output: path.join(OUT, `${name}-${frame}.png`),
      });
      console.log("ok", name, frame);
    } catch (e) {
      errors.push(`${name}@${frame}: ${e.message}`);
      console.error("FAIL", name, frame, e.message);
    }
  }
});
await Promise.all(workers);
console.log(`rendered ${items.length - errors.length}/${items.length}`);
if (errors.length) {
  console.log("ERRORS:\n" + errors.join("\n"));
  process.exitCode = 1;
}
process.exit(errors.length ? 1 : 0);
