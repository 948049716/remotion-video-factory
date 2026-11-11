/**
 * 校验《跳槽马》全部音频素材是否齐全。
 * 运行：node scripts/verify_tiaocao_audio.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "public", "tiaocaoma", "audio");
const VOICE_MANIFEST_PATH = path.join(AUDIO_DIR, "voice-manifest.json");
const AUDIO_MANIFEST_PATH = path.join(AUDIO_DIR, "audio-manifest.json");
const AUDIO_LINES_PATH = path.join(AUDIO_DIR, "audio-lines.json");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

const voiceManifest = readJson(VOICE_MANIFEST_PATH);
const audioManifest = readJson(AUDIO_MANIFEST_PATH);
const audioLines = readJson(AUDIO_LINES_PATH);

const voiceFiles = fs
  .readdirSync(path.join(AUDIO_DIR, "voice"))
  .filter((file) => file.endsWith(".mp3"));
const musicFiles = fs
  .readdirSync(path.join(AUDIO_DIR, "music"))
  .filter((file) => file.endsWith(".wav"));
const sfxFiles = fs
  .readdirSync(path.join(AUDIO_DIR, "sfx"))
  .filter((file) => file.endsWith(".wav"));

const voiceSegments = voiceManifest.shots.flatMap((shot) => shot.segments);
const missingVoice = voiceSegments
  .filter((segment) => segment.audio)
  .filter((segment) => !fs.existsSync(path.join(ROOT, segment.audio)))
  .map((segment) => segment.id);
const failedVoice = voiceSegments
  .filter((segment) => segment.error)
  .map((segment) => ({ id: segment.id, error: segment.error }));

const musicCues = audioManifest.musicCues || [];
const missingMusic = musicCues
  .filter((cue) => !fs.existsSync(path.join(ROOT, "public", cue.file)))
  .map((cue) => cue.id);

const sfxFileEntries = audioManifest.sfxFiles || [];
const missingSfx = sfxFileEntries
  .filter((entry) => !fs.existsSync(path.join(ROOT, "public", entry.file)))
  .map((entry) => entry.family);

const sfxCues = audioLines.flatMap((shot) =>
  shot.sfx.map((cue) => ({ shot: shot.shotId, ...cue })),
);
const uniqueSfxNames = [...new Set(sfxCues.map((cue) => cue.name))];
const familiesUsed = [...new Set(sfxCues.map((cue) => cue.family))];
const silenceCues = sfxCues.filter((cue) => cue.family === "silence");
const unmappedSfx = sfxCues
  .filter((cue) => cue.family !== "silence" && !cue.file)
  .map((cue) => ({ shot: cue.shot, name: cue.name, family: cue.family }));

const totalBytes =
  voiceFiles.reduce(
    (sum, file) => sum + fs.statSync(path.join(AUDIO_DIR, "voice", file)).size,
    0,
  ) +
  musicFiles.reduce(
    (sum, file) => sum + fs.statSync(path.join(AUDIO_DIR, "music", file)).size,
    0,
  ) +
  sfxFiles.reduce(
    (sum, file) => sum + fs.statSync(path.join(AUDIO_DIR, "sfx", file)).size,
    0,
  );

const report = {
  voice: {
    manifestSegments: voiceSegments.length,
    mp3Files: voiceFiles.length,
    missingFiles: missingVoice,
    failedSegments: failedVoice,
    errorCount: voiceManifest.errorCount,
    rawOverflowCount: voiceManifest.overflowCount,
    totalActualSeconds: voiceManifest.totalActualSeconds,
  },
  music: {
    cues: musicCues.length,
    wavFiles: musicFiles.length,
    missingFiles: missingMusic,
    durations: musicCues.map((cue) => ({
      id: cue.id,
      actId: cue.actId,
      seconds: cue.durationSeconds,
    })),
  },
  sfx: {
    files: sfxFiles.length,
    familiesUsed,
    missingFiles: missingSfx,
    scriptCueCount: sfxCues.length,
    uniqueNames: uniqueSfxNames.length,
    silenceCues: silenceCues.length,
    silenceNote: "silence 是停音乐/留白指令，按设计不生成音频文件。",
    unmappedCues: unmappedSfx,
  },
  retimed: audioManifest.retimedSummary,
  totalBytes,
  totalMB: Number((totalBytes / 1024 / 1024).toFixed(1)),
};

console.log(JSON.stringify(report, null, 2));

const ok =
  missingVoice.length === 0 &&
  failedVoice.length === 0 &&
  missingMusic.length === 0 &&
  missingSfx.length === 0 &&
  unmappedSfx.length === 0 &&
  voiceFiles.length === voiceSegments.length &&
  musicFiles.length === musicCues.length &&
  sfxFiles.length === sfxFileEntries.length;

console.log(ok ? "AUDIO COMPLETE" : "AUDIO INCOMPLETE");
process.exit(ok ? 0 : 1);
