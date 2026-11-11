/**
 * 核对 asset-qa/raw 是否符合素材清单。
 * 运行：node scripts/audit_tiaocao_assets.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LIST_PATH = path.join(
  ROOT,
  "public",
  "tiaocaoma",
  "asset-generation-list.md",
);
const RAW_DIR = path.join(ROOT, "asset-qa", "raw");
const OUT_JSON = path.join(ROOT, "asset-qa", "asset-audit.json");
const OUT_MD = path.join(ROOT, "asset-qa", "asset-audit.md");

const markdown = fs.readFileSync(LIST_PATH, "utf8");
const sections = markdown.split(/^###\s+/m).slice(1);

const expected = [];
for (const section of sections) {
  const lines = section.split("\n");
  const heading = lines[0];
  const headingMatch = heading.match(
    /^\d+\.\s+`([^`]+)`\s+—\s+(.+)$/,
  );
  const fileMatch = section.match(/- 输出文件：`([^`]+)`/);
  const sizeMatch = section.match(/- 画幅：(.+)/);
  const backgroundMatch = section.match(/- 幕布：(.+)/);
  if (!headingMatch || !fileMatch) continue;

  const sizeText = sizeMatch ? sizeMatch[1].trim() : "";
  const pixelsMatch = sizeText.match(/(\d+)×(\d+)/);
  expected.push({
    id: headingMatch[1],
    name: headingMatch[2].trim(),
    file: fileMatch[1].trim(),
    sizeText,
    expectedWidth: pixelsMatch ? Number(pixelsMatch[1]) : null,
    expectedHeight: pixelsMatch ? Number(pixelsMatch[2]) : null,
    background: backgroundMatch ? backgroundMatch[1].trim() : "",
  });
}

const actualFiles = fs
  .readdirSync(RAW_DIR)
  .filter((file) => file.endsWith(".png"))
  .sort();
const expectedFiles = new Set(expected.map((asset) => asset.file));
const actualSet = new Set(actualFiles);

const missing = expected.filter((asset) => !actualSet.has(asset.file));
const extra = actualFiles.filter((file) => !expectedFiles.has(file));
const byFile = new Map(expected.map((asset) => [asset.file, asset]));

function readPngHeader(filePath) {
  const fd = fs.openSync(filePath, "r");
  const buffer = Buffer.alloc(33);
  fs.readSync(fd, buffer, 0, 33, 0);
  fs.closeSync(fd);

  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") return null;

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer[24];
  const colorType = buffer[25];
  const hasAlpha = colorType === 4 || colorType === 6;
  return { width, height, bitDepth, colorType, hasAlpha };
}

const files = actualFiles.map((file) => {
  const info = readPngHeader(path.join(RAW_DIR, file));
  const expectedAsset = byFile.get(file) ?? null;
  const ratio = info ? info.width / info.height : null;
  const expectedRatio =
    expectedAsset?.expectedWidth && expectedAsset?.expectedHeight
      ? expectedAsset.expectedWidth / expectedAsset.expectedHeight
      : null;
  const ratioMismatch =
    ratio !== null &&
    expectedRatio !== null &&
    Math.abs(ratio - expectedRatio) / expectedRatio > 0.02;

  return {
    file,
    id: expectedAsset?.id ?? null,
    name: expectedAsset?.name ?? null,
    width: info?.width ?? null,
    height: info?.height ?? null,
    bitDepth: info?.bitDepth ?? null,
    colorType: info?.colorType ?? null,
    hasAlpha: info?.hasAlpha ?? false,
    expectedWidth: expectedAsset?.expectedWidth ?? null,
    expectedHeight: expectedAsset?.expectedHeight ?? null,
    background: expectedAsset?.background ?? null,
    ratioMismatch,
    likelyNeedsCutout:
      Boolean(info) &&
      !info.hasAlpha &&
      Boolean(expectedAsset) &&
      !expectedAsset.background.includes("满幅"),
  };
});

const dimensionMismatches = files.filter((file) => file.ratioMismatch);
const needsCutout = files.filter((file) => file.likelyNeedsCutout);
const backgroundsWithAlpha = files.filter(
  (file) =>
    file.background?.includes("满幅") && file.hasAlpha,
);

const report = {
  generatedAt: new Date().toISOString(),
  expectedCount: expected.length,
  actualCount: actualFiles.length,
  missing,
  extra,
  dimensionMismatches,
  needsCutout,
  backgroundsWithAlpha,
  files,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), "utf8");

const md = [];
md.push("# 《跳槽马》素材 QA 报告");
md.push("");
md.push(`- 清单预期：${expected.length} 张`);
md.push(`- 实际文件：${actualFiles.length} 张`);
md.push(`- 缺失：${missing.length} 张`);
md.push(`- 多余：${extra.length} 张`);
md.push(`- 比例不符：${dimensionMismatches.length} 张`);
md.push(`- 无透明通道、可能需要抠图：${needsCutout.length} 张`);
md.push(`- 满幅背景却带透明通道：${backgroundsWithAlpha.length} 张`);
md.push("");

if (missing.length) {
  md.push("## 缺失");
  md.push("");
  for (const asset of missing) {
    md.push(`- \`${asset.id}\` → \`${asset.file}\``);
  }
  md.push("");
}

if (extra.length) {
  md.push("## 多余 / 未匹配");
  md.push("");
  for (const file of extra) {
    md.push(`- \`${file}\``);
  }
  md.push("");
}

md.push("## 逐项检查");
md.push("");
md.push(
  "| 文件 | 素材键 | 实际尺寸 | 预期尺寸 | 透明通道 | 备注 |",
);
md.push("|---|---|---|---|---|---|");
for (const file of files) {
  const notes = [];
  if (file.ratioMismatch) notes.push("比例不符");
  if (file.likelyNeedsCutout) notes.push("需抠图");
  if (file.background?.includes("满幅") && file.hasAlpha) {
    notes.push("背景带 alpha");
  }
  md.push(
    `| \`${file.file}\` | \`${file.id ?? "—"}\` | ${file.width}×${file.height} | ${file.expectedWidth ?? "—"}×${file.expectedHeight ?? "—"} | ${file.hasAlpha ? "是" : "否"} | ${notes.join("；") || "OK"} |`,
  );
}
md.push("");

fs.writeFileSync(OUT_MD, md.join("\n"), "utf8");

console.log(`Wrote ${OUT_JSON}`);
console.log(`Wrote ${OUT_MD}`);
console.log(
  `Expected ${expected.length}, actual ${actualFiles.length}, missing ${missing.length}, extra ${extra.length}, ratio mismatches ${dimensionMismatches.length}, needs cutout ${needsCutout.length}.`,
);
if (missing.length) {
  console.log("Missing:");
  for (const asset of missing) console.log(`  ${asset.file}`);
}
if (extra.length) {
  console.log("Extra:");
  for (const file of extra) console.log(`  ${file}`);
}
