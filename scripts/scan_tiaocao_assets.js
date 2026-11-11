/**
 * 扫描 public/tiaocaoma 下已生成的图片，映射到素材 key。
 * 运行前编译 script.ts 到 .tmp-tiaocao。
 */

const fs = require("fs");
const path = require("path");

const { SHOTS } = require("../.tmp-tiaocao/script.js");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const OUT_PATH = path.join(
  ROOT,
  "src",
  "videos",
  "TiaocaoMa",
  "asset-files.ts",
);

const SCAN_DIRS = [
  { dir: "tiaocaoma/assets", priority: 0 },
  { dir: "tiaocaoma/raw", priority: 1 },
];
const IGNORED_BASES = new Set(["contact-sheet", "turnaround-sheet"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const files = [];
for (const { dir, priority } of SCAN_DIRS) {
  const fullDir = path.join(PUBLIC, dir);
  if (!fs.existsSync(fullDir)) continue;
  for (const name of fs.readdirSync(fullDir)) {
    const ext = path.extname(name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;
    const base = path.basename(name, ext);
    if (IGNORED_BASES.has(base)) continue;
    files.push({ base, rel: `${dir}/${name}`, priority });
  }
}

const byBase = new Map();
for (const file of files) {
  const existing = byBase.get(file.base);
  if (!existing || file.priority < existing.priority) {
    byBase.set(file.base, file);
  }
}

const assetKeys = [
  ...new Set(SHOTS.flatMap((shot) => shot.assets)),
].sort();

const assetFiles = {};
const missing = [];
for (const key of assetKeys) {
  const normalized = key.replace(/\./g, "-");
  const candidates = key.startsWith("char.")
    ? [
        `${normalized}-v1`,
        normalized,
        `${normalized}-front`,
        `${normalized}-sheet`,
      ]
    : [
        normalized,
        `${normalized}-v1`,
        `${normalized}-front`,
        `${normalized}-sheet`,
      ];
  let found = null;
  for (const candidate of candidates) {
    if (byBase.has(candidate)) {
      found = byBase.get(candidate);
      break;
    }
  }
  if (found) {
    assetFiles[key] = found.rel;
  } else {
    missing.push(key);
  }
}

const lines = [];
lines.push("// 由 scripts/scan_tiaocao_assets.js 自动生成，请勿手改。");
lines.push("");
lines.push(
  `export const ASSET_FILES: Record<string, string> = ${JSON.stringify(
    assetFiles,
    null,
    2,
  )};`,
);
lines.push("");
lines.push(
  `export const MISSING_ASSETS: string[] = ${JSON.stringify(
    missing,
    null,
    2,
  )};`,
);
lines.push("");

fs.writeFileSync(OUT_PATH, lines.join("\n"), "utf8");

console.log(
  `Wrote ${OUT_PATH}: ${assetKeys.length} asset keys, ${Object.keys(assetFiles).length} mapped, ${missing.length} missing.`,
);
console.log(`Missing: ${missing.join(", ")}`);
