/**
 * 汇总配音、配乐、音效为单一 audio-manifest.json。
 * 运行前需先编译 audio-direction.ts 到 .tmp-tiaocao。
 */

const fs = require("fs");
const path = require("path");

const {
  VOICE_CAST,
  MUSIC_CUES,
  SFX_FILES,
} = require("../.tmp-tiaocao/audio-direction.js");

const ROOT = path.resolve(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "public", "tiaocaoma", "audio");
const VOICE_MANIFEST_PATH = path.join(AUDIO_DIR, "voice-manifest.json");
const RETIMED_PATH = path.join(AUDIO_DIR, "retimed-timeline.json");
const OUT_PATH = path.join(AUDIO_DIR, "audio-manifest.json");

function wavDuration(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 12;
  let byteRate = 0;
  let dataSize = 0;
  while (pos + 8 <= buf.length) {
    const id = buf.toString("ascii", pos, pos + 4);
    const size = buf.readUInt32LE(pos + 4);
    if (id === "fmt ") byteRate = buf.readUInt32LE(pos + 16);
    if (id === "data") {
      dataSize = size;
      break;
    }
    pos += 8 + size + (size % 2);
  }
  return byteRate > 0 ? Number((dataSize / byteRate).toFixed(2)) : null;
}

function fileInfo(relativePath) {
  const fullPath = path.join(ROOT, "public", relativePath);
  if (!fs.existsSync(fullPath)) {
    return { file: relativePath, exists: false };
  }
  const stat = fs.statSync(fullPath);
  return {
    file: relativePath,
    exists: true,
    bytes: stat.size,
    durationSeconds: relativePath.endsWith(".wav") ? wavDuration(fullPath) : null,
  };
}

const voiceManifest = JSON.parse(
  fs.readFileSync(VOICE_MANIFEST_PATH, "utf8"),
);

let retimedSummary = null;
if (fs.existsSync(RETIMED_PATH)) {
  const retimed = JSON.parse(fs.readFileSync(RETIMED_PATH, "utf8"));
  retimedSummary = {
    totalFrames: retimed.totalFrames,
    fps: retimed.fps,
    totalSeconds: Number((retimed.totalFrames / retimed.fps).toFixed(1)),
    overflowBefore: retimed.overflowBefore,
    overflowAfter: retimed.overflowAfter,
    timeline: "tiaocaoma/audio/retimed-timeline.json",
    module: "src/videos/TiaocaoMa/retimed-timeline.ts",
  };
}

const speakerCounts = {};
for (const shot of voiceManifest.shots) {
  for (const segment of shot.segments) {
    speakerCounts[segment.speaker] =
      (speakerCounts[segment.speaker] || 0) + 1;
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  sourceOfTruth: "src/videos/TiaocaoMa/audio-direction.ts",
  voiceCast: VOICE_CAST,
  voiceSummary: {
    totalShots: voiceManifest.shots.length,
    totalSegments: voiceManifest.shots.reduce(
      (sum, shot) => sum + shot.segments.length,
      0,
    ),
    speakerCounts,
    totalTargetSeconds: voiceManifest.totalTargetSeconds,
    totalActualSeconds: voiceManifest.totalActualSeconds,
    rawOverflowCount: voiceManifest.overflowCount,
    errorCount: voiceManifest.errorCount,
    manifest: "tiaocaoma/audio/voice-manifest.json",
  },
  retimedSummary,
  musicCues: MUSIC_CUES.map((cue) => ({
    ...cue,
    ...fileInfo(cue.file),
  })),
  sfxFiles: Object.entries(SFX_FILES)
    .filter(([, file]) => Boolean(file))
    .map(([family, file]) => ({
      family,
      ...fileInfo(file),
    })),
};

fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2), "utf8");

console.log(`Wrote ${OUT_PATH}`);
console.log(
  `Voice: ${manifest.voiceSummary.totalSegments} segments, ${manifest.voiceSummary.totalActualSeconds}s, raw overflows ${manifest.voiceSummary.rawOverflowCount}.`,
);
if (manifest.retimedSummary) {
  console.log(
    `Retimed: ${manifest.retimedSummary.totalFrames} frames / ${manifest.retimedSummary.totalSeconds}s, overflows ${manifest.retimedSummary.overflowAfter}.`,
  );
}
console.log(
  `Music: ${manifest.musicCues.length} cues | SFX: ${manifest.sfxFiles.length} files.`,
);
