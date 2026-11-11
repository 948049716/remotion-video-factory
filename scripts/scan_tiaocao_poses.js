/**
 * 扫描 public/tiaocaoma/poses 下的姿态图，生成角色 → 姿态 → 文件映射。
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIR = path.join(ROOT, "public", "tiaocaoma", "poses");
const OUT_PATH = path.join(
  ROOT,
  "src",
  "videos",
  "TiaocaoMa",
  "pose-files.ts",
);

const PREFIXES = [
  "young-general",
  "scarface",
  "general",
  "riding",
  "horse",
  "yipin",
  "zhao",
  "er",
];

const files = fs.existsSync(SCAN_DIR)
  ? fs
      .readdirSync(SCAN_DIR)
      .filter((name) => name.startsWith("pose-") && name.endsWith(".png"))
      .sort()
  : [];

const sets = {};
const unresolved = [];

for (const name of files) {
  const stem = name.slice("pose-".length, -".png".length);
  const prefix = PREFIXES.find((candidate) =>
    stem.startsWith(`${candidate}-`),
  );
  if (!prefix) {
    unresolved.push(name);
    continue;
  }
  const pose = stem.slice(prefix.length + 1);
  sets[prefix] = sets[prefix] ?? {};
  sets[prefix][pose] = `tiaocaoma/poses/${name}`;
}

const lines = [];
lines.push("// 由 scripts/scan_tiaocao_poses.js 自动生成，请勿手改。");
lines.push("");
lines.push(
  `export const POSE_FILES: Record<string, Record<string, string>> = ${JSON.stringify(
    sets,
    null,
    2,
  )};`,
);
lines.push("");

fs.writeFileSync(OUT_PATH, lines.join("\n"), "utf8");

const counts = Object.entries(sets)
  .map(([prefix, poses]) => `${prefix}:${Object.keys(poses).length}`)
  .join(", ");
console.log(`Wrote ${OUT_PATH}: ${files.length} files (${counts}).`);
if (unresolved.length > 0) {
  console.log(`Unresolved: ${unresolved.join(", ")}`);
}
