/**
 * 导出逐镜视觉元数据（location / framing / visual / motion / assets / sfx）。
 * 运行前编译 script.ts 到 .tmp-tiaocao。
 */

const fs = require("fs");
const path = require("path");

const { SHOTS } = require("../.tmp-tiaocao/script.js");

const ROOT = path.resolve(__dirname, "..");
const AUDIO_LINES_PATH = path.join(
  ROOT,
  "public",
  "tiaocaoma",
  "audio",
  "audio-lines.json",
);
const OUT_PATH = path.join(
  ROOT,
  "src",
  "videos",
  "TiaocaoMa",
  "shot-meta.ts",
);

const audioLines = JSON.parse(fs.readFileSync(AUDIO_LINES_PATH, "utf8"));
const sfxByShot = new Map(
  audioLines.map((shot) => [shot.shotId, shot.sfx || []]),
);

const meta = {};
for (const shot of SHOTS) {
  meta[shot.id] = {
    id: shot.id,
    act: shot.act,
    title: shot.location,
    location: shot.location,
    framing: shot.framing,
    visual: shot.visual,
    motion: shot.motion,
    assets: shot.assets,
    sfx: sfxByShot.get(shot.id) || [],
    transitionIn: shot.transitionIn,
  };
}

const lines = [];
lines.push("// 由 scripts/export_tiaocao_shot_meta.js 自动生成，请勿手改。");
lines.push("");
lines.push("export type ShotSfxCue = {");
lines.push("  name: string;");
lines.push("  family: string;");
lines.push("  file: string | null;");
lines.push("};");
lines.push("");
lines.push("export type ShotMeta = {");
lines.push("  id: string;");
lines.push("  act: string;");
lines.push("  title: string;");
lines.push("  location: string;");
lines.push("  framing: string;");
lines.push("  visual: string;");
lines.push("  motion: string;");
lines.push("  assets: string[];");
lines.push("  sfx: ShotSfxCue[];");
lines.push("  transitionIn: string;");
lines.push("};");
lines.push("");
lines.push(
  `export const SHOT_META: Record<string, ShotMeta> = ${JSON.stringify(
    meta,
    null,
    2,
  )};`,
);
lines.push("");

fs.writeFileSync(OUT_PATH, lines.join("\n"), "utf8");

console.log(
  `Wrote ${OUT_PATH}: ${Object.keys(meta).length} shots, ${new Set(
    SHOTS.flatMap((shot) => shot.assets),
  ).size} unique asset keys.`,
);
