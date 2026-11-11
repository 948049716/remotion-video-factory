/**
 * 导出《跳槽马》全部图片素材的生成清单与提示词。
 * 数据源：.tmp-tiaocao/assets.js（由 assets.ts 编译而来）。
 *
 * 运行：
 *   npx tsc src/videos/TiaocaoMa/script.ts src/videos/TiaocaoMa/style.ts src/videos/TiaocaoMa/assets.ts \
 *     --outDir .tmp-tiaocao --rootDir src/videos/TiaocaoMa --module commonjs --target es2020 \
 *     --skipLibCheck --esModuleInterop
 *   node scripts/export_tiaocao_prompts.js
 */

const fs = require("fs");
const path = require("path");

const { ASSETS, ASSET_STATS } = require("../.tmp-tiaocao/assets.js");
const {
  PAPER_STYLE,
  PROMPT_PREFIX,
  NEGATIVE_PROMPT,
} = require("../.tmp-tiaocao/style.js");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "tiaocaoma");
const MD_PATH = path.join(OUT_DIR, "asset-generation-list.md");
const JSON_PATH = path.join(OUT_DIR, "asset-generation-list.json");
const QA_DIR = path.join(ROOT, "asset-qa");
const QA_JSON_PATH = path.join(QA_DIR, "asset-list.json");

const SIZE_MAP = {
  landscape_16_9: { pixels: "2560x1440", label: "landscape_16_9（2560×1440）" },
  landscape_4_3: { pixels: "2240x1680", label: "landscape_4_3（2240×1680）" },
  square: { pixels: "1920x1920", label: "square（1920×1920）" },
  "3840x1080": { pixels: "3840x1080", label: "3840×1080（超宽长图）" },
  svg: { pixels: null, label: "—（代码绘制）" },
};

const CATEGORY_LABELS = {
  background: "背景",
  character: "角色",
  prop: "道具",
  fx: "特效",
  title: "标题",
};

const getOutputName = (asset) => asset.id.replace(/\./g, "-") + ".png";

const getBackgroundLabel = (asset) => {
  if (asset.cutout === "svg") return "不需要生图（代码绘制）";
  if (asset.cutout === "full-bleed") return "满幅背景，不抠图";
  if (asset.cutout === "chroma-key") {
    return /magenta/i.test(asset.prompt)
      ? "纯洋红幕 #FF00FF"
      : "纯绿幕 #00FF00";
  }
  if (asset.cutout === "alpha") return "纯绿幕 #00FF00（保留透明边缘）";
  return asset.cutout;
};

const getBackgroundCode = (asset) => {
  if (asset.cutout === "svg") return "code-only";
  if (asset.cutout === "full-bleed") return "full-bleed";
  if (asset.cutout === "chroma-key") {
    return /magenta/i.test(asset.prompt) ? "magenta" : "green";
  }
  if (asset.cutout === "alpha") return "green-alpha";
  return asset.cutout;
};

const getPrompt = (asset) => {
  if (asset.source === "code") return null;

  let prompt = asset.prompt.trim();

  // 全局前缀里写死了 16:9，按素材画幅替换，避免 4:3/方形素材被拉宽。
  const aspectText =
    asset.imageSize === "landscape_4_3"
      ? "cinematic 4:3 composition"
      : asset.imageSize === "square"
        ? "square composition"
        : asset.imageSize === "3840x1080"
          ? "ultra-wide panoramic composition"
          : "cinematic 16:9 composition";
  prompt = prompt.replace(/cinematic 16:9 composition/g, aspectText);

  const needsChroma = asset.cutout === "chroma-key" || asset.cutout === "alpha";
  const hasChromaInstruction = /chroma|green screen|magenta|isolated on/i.test(
    prompt,
  );

  if (needsChroma && !hasChromaInstruction) {
    const isMagenta = /magenta/i.test(prompt);
    const bgInstruction = isMagenta
      ? " Place the subject on a flat chroma magenta #FF00FF background with even lighting, no shadows, and at least 8% empty margin."
      : " Place the subject on a flat chroma green #00FF00 background with even lighting, no shadows, and at least 8% empty margin.";
    prompt = prompt.includes("NEGATIVE:")
      ? prompt.replace("NEGATIVE:", bgInstruction + " NEGATIVE:")
      : prompt + bgInstruction;
  }

  return prompt;
};

const getNotes = (asset) => {
  const notes = [asset.description];

  if (asset.source === "code") {
    notes.push("纯 SVG/CSS 绘制，不需要生图。");
  }

  if (
    ["bg.street.west", "bg.restaurant.interior", "bg.hall"].includes(asset.id)
  ) {
    notes.push(
      "背景中的路人/官员只做远景剪影；前景必须留空，不要烤进主角、赵大人、一品大员或瘸马。",
    );
  }

  if (
    ["bg.stable", "bg.stable.night", "bg.trough.panorama", "bg.palace.gate"].includes(asset.id)
  ) {
    notes.push(
      "背景板不要烤进马匹或人物；所有主角与马匹由纸偶层单独叠加，前景留空。",
    );
  }

  if (
    ["char.scarface", "char.scarface.riding", "char.general.one-arm"].includes(
      asset.id,
    )
  ) {
    notes.push(
      "空右袖是关键剪影。AI 常把断臂补成残臂或绑带，保留生成结果即可，后期会在肩点裁掉并换成代码绘制的空袖。",
    );
  }

  if (["prop.rank.plaques", "prop.facade.decor", "prop.trough.map"].includes(asset.id)) {
    notes.push("木牌、幌子、标注全部留空，文字与数字由代码叠加。");
  }

  if (asset.id === "prop.hay") {
    notes.push(
      "必须用洋红幕。草料本身含绿色，绿幕会把绿色草料一起抠掉。",
    );
  }

  if (asset.id === "char.er") {
    notes.push("不要现代厨师服或咖啡店员造型；是明中期饭馆跑堂伙计。");
  }

  if (asset.id === "char.horse.lame") {
    notes.push("老、瘦、瘸要一眼看出：肋骨可见、鬃毛稀疏、右前腿跛。");
  }

  return notes.join(" ");
};

const assets = ASSETS.map((asset, index) => {
  const size = SIZE_MAP[asset.imageSize] || {
    pixels: asset.imageSize,
    label: asset.imageSize,
  };
  const prompt = getPrompt(asset);
  const sourceLabel =
    asset.source === "ai"
      ? "AI 生图"
      : asset.source === "ai+code"
        ? "AI 生图 + 代码叠加"
        : "代码绘制";

  return {
    index: index + 1,
    id: asset.id,
    category: asset.category,
    categoryLabel: CATEGORY_LABELS[asset.category],
    name: asset.name,
    description: asset.description,
    output: asset.source === "code" ? null : getOutputName(asset),
    imageSize: asset.imageSize,
    pixels: size.pixels,
    sizeLabel: size.label,
    background: getBackgroundLabel(asset),
    backgroundCode: getBackgroundCode(asset),
    cutout: asset.cutout,
    source: asset.source,
    sourceLabel,
    priority: asset.priority,
    usedBy: asset.usedBy,
    prompt,
    notes: getNotes(asset),
  };
});

const generationAssets = assets.filter((asset) => asset.prompt);
const codeAssets = assets.filter((asset) => !asset.prompt);

const md = [];
md.push("# 跳槽马 — 图片素材生成清单");
md.push("");
md.push(
  `这份清单可以直接交给生图 agent。共 **${assets.length} 项**素材：**${generationAssets.length} 项需要生图**，**${codeAssets.length} 项由代码绘制**。`,
);
md.push("");
md.push("## 使用说明");
md.push("");
md.push(
  "1. 按每项的“输出文件”命名，保存到 `public/tiaocaoma/raw/`；文件名用连字符，不要用点号。如果生成器只能输出 JPG，用同名 `.jpg` 即可。",
);
md.push(
  "2. 每个 Prompt 已包含 `[PURPOSE]`、`SUBJECT`、`STYLE`、`PALETTE`、`NEGATIVE`，整段粘贴即可。",
);
md.push(
  "3. 人物、道具、特效必须放在纯色幕布上；背景板满幅生成，不需要幕布。",
);
md.push(
  "4. 如果生成器支持单独填负面提示词，使用本文末尾的 `Global Negative Prompt`；Prompt 内已内置一份。",
);
md.push("5. 生成图右下角如有水印，不用处理，后期统一裁掉。");
md.push("");
md.push("## 建议生成顺序");
md.push("");
md.push(
  `- **P1 先做**：${generationAssets.filter((a) => a.priority === 1).length} 项，覆盖主要背景、主角、瘸马与关键道具。`,
);
md.push(
  `- **P2 再做**：${generationAssets.filter((a) => a.priority === 2).length} 项，补充群像、官员、次要道具与特效。`,
);
md.push(
  `- **P3 最后**：${generationAssets.filter((a) => a.priority === 3).length} 项，补齐小道具与次要角色。`,
);
md.push(
  "- 每批生成后先检查文件名、幕布、是否烤进主角，再进入下一批。",
);
md.push("");
md.push("## 全局风格");
md.push("");
md.push(`- 风格：${PAPER_STYLE.name}`);
md.push(
  "- 材质：3–5 层纸片，每层 2–4px 错位阴影；1–3px 手撕毛边，不做完美矢量平滑边。",
);
md.push(
  "- 光照：左上方暖色主光 3200K；深棕柔和阴影，35–55% 不透明度。",
);
md.push(
  `- 色板：宣纸米黄 #E8DCC3、墨黑 #1C1A17、朱红 #B83A2E、靛青 #2E4A5A、赭石 #9A6B3F、哑金 #C9A227`,
);
md.push(
  "- 禁止：写实皮肤、3D 渲染或塑料高光、动漫描边、渐变/喷枪、完美矢量平滑边、文字/字母/logo/水印、血腥、额外肢体或畸形手。",
);
md.push("");
md.push("## 幕布规则");
md.push("");
md.push(
  "- **绿幕**：纯 `#00FF00`，均匀光照，无阴影，主体四周留至少 8% 空白。",
);
md.push(
  "- **洋红幕**：纯 `#FF00FF`，只用于草料这种本身含绿色的素材。",
);
md.push("- **满幅**：直接生成 16:9 背景，不要幕布。");
md.push(
  "- **透明边缘**：撕纸、剑光、马王剪影等仍放在绿幕上，后期保留 alpha。",
);
md.push("");
md.push("## 画幅对照");
md.push("");
md.push("| 参数 | 像素 |");
md.push("|---|---|");
md.push("| landscape_16_9 | 2560×1440 |");
md.push("| landscape_4_3 | 2240×1680 |");
md.push("| square | 1920×1920 |");
md.push("| 3840x1080 | 3840×1080 |");
md.push("");

let currentCategory = null;
for (const asset of assets) {
  if (asset.category !== currentCategory) {
    currentCategory = asset.category;
    const count = assets.filter((a) => a.category === currentCategory).length;
    md.push(`## ${asset.categoryLabel}（${count} 项）`);
    md.push("");
  }

  md.push(
    `### ${String(asset.index).padStart(2, "0")}. \`${asset.id}\` — ${asset.name}`,
  );
  md.push("");
  md.push(
    `- 输出文件：${asset.output ? "`" + asset.output + "`" : "无（代码绘制）"}`,
  );
  md.push(`- 生成方式：${asset.sourceLabel}`);
  md.push(`- 画幅：${asset.sizeLabel}`);
  md.push(`- 幕布：${asset.background}`);
  md.push(`- 优先级：P${asset.priority}`);
  md.push(
    `- 使用镜头：${asset.usedBy.length ? asset.usedBy.map((id) => "`" + id + "`").join("、") : "—"}`,
  );
  md.push(`- 备注：${asset.notes}`);
  md.push("");

  if (asset.prompt) {
    md.push("Prompt：");
    md.push("");
    md.push("```text");
    md.push(asset.prompt);
    md.push("```");
    md.push("");
  } else {
    md.push("生成方式：不需要生图，由代码绘制。");
    md.push("");
  }
}

md.push("## Global Negative Prompt");
md.push("");
md.push("```text");
md.push(NEGATIVE_PROMPT);
md.push("```");
md.push("");
md.push("## Global Style Prefix");
md.push("");
md.push("```text");
md.push(PROMPT_PREFIX);
md.push("```");
md.push("");
md.push(
  "> 手动使用全局前缀时，把 `cinematic 16:9 composition` 替换为对应画幅：4:3、square 或 ultra-wide panoramic。",
);
md.push("## 交付检查");
md.push("");
md.push(
  `- [ ] ${generationAssets.length} 张生图是否按文件名保存到 \`public/tiaocaoma/raw/\`？`,
);
md.push("- [ ] 人物/道具是否在纯色幕布上，主体完整、无裁切？");
md.push("- [ ] 背景板是否没有烤进主角、马匹、官员？");
md.push("- [ ] 所有木牌、幌子、匾额是否留空？");
md.push("- [ ] 草料是否使用洋红幕？");
md.push("- [ ] 是否没有文字、logo、水印（生成水印除外）？");
md.push("");
md.push("## 自动验收");
md.push("");
md.push(
  "交付前先跑一遍自动检查，只有返回码 0 的批次才算通过；缺文件名、尺寸不符、幕布不纯、主体贴边会被直接判 FAIL。",
);
md.push("");
md.push("```powershell");
md.push(
  "powershell -ExecutionPolicy Bypass -File asset-qa/check-assets.ps1 -Root public/tiaocaoma/raw -ListPath public/tiaocaoma/asset-generation-list.json -Sheets",
);
md.push("```");
md.push("");
md.push("Linux / macOS：先 `python3 -m pip install pillow`，再运行");
md.push("");
md.push("```bash");
md.push(
  "python3 asset-qa/check-assets.py --root public/tiaocaoma/raw --list public/tiaocaoma/asset-generation-list.json --priority 1 --sheets",
);
md.push("```");
md.push("");
md.push(
  "只查某几项或某一优先级：追加 `-Only bg-street-west,char-er` 或 `-Priority 1`；加 `-Sheets` 会同时输出接触表，供一次性目检风格与内容。",
);
md.push("");

const mdText = md.join("\n");
fs.writeFileSync(MD_PATH, mdText, "utf8");

// 供 asset-qa 文件夹独立交付：把仓库内路径改成文件夹内的相对路径。
const portableMdText = mdText
  .replaceAll("asset-qa/check-assets.ps1", "check-assets.ps1")
  .replaceAll("asset-qa/check-assets.py", "check-assets.py")
  .replaceAll("public/tiaocaoma/asset-generation-list.json", "asset-list.json")
  .replaceAll("public/tiaocaoma/raw", "raw");
fs.writeFileSync(path.join(QA_DIR, "asset-list.md"), portableMdText, "utf8");

const json = {
  project: "Tiaocao Ma",
  phase: "3",
  outputDirectory: "raw",
  repoOutputDirectory: "public/tiaocaoma/raw",
  filenameRule:
    "asset id with dots replaced by hyphens, extension .png; if the generator only exports .jpg, keep the same basename",
  style: {
    name: PAPER_STYLE.name,
    palette: {
      paper: "#E8DCC3",
      ink: "#1C1A17",
      vermilion: "#B83A2E",
      indigo: "#2E4A5A",
      ochre: "#9A6B3F",
      gold: "#C9A227",
    },
    promptPrefix: PROMPT_PREFIX,
    negativePrompt: NEGATIVE_PROMPT,
  },
  imageSizeMap: {
    landscape_16_9: "2560x1440",
    landscape_4_3: "2240x1680",
    square: "1920x1920",
    "3840x1080": "3840x1080",
  },
  counts: {
    total: assets.length,
    generation: generationAssets.length,
    codeOnly: codeAssets.length,
    byCategory: ASSET_STATS.byCategory,
  },
  assets,
};

fs.writeFileSync(JSON_PATH, JSON.stringify(json, null, 2), "utf8");

fs.mkdirSync(QA_DIR, { recursive: true });
fs.writeFileSync(QA_JSON_PATH, JSON.stringify(json, null, 2), "utf8");

console.log(
  `Wrote ${MD_PATH} and ${JSON_PATH}: ${assets.length} assets, ${generationAssets.length} prompts, ${codeAssets.length} code-only.`,
);
console.log(`Synced handoff snapshot: ${QA_JSON_PATH}`);
