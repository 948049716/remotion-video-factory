/**
 * 用本地 Edge TTS 按角色声线生成《跳槽马》逐段配音。
 * 依赖：npm install --no-save msedge-tts
 * 运行：node scripts/generate_tiaocao_edge_tts.js
 */

const fs = require("fs");
const path = require("path");
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

const ROOT = path.resolve(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "public", "tiaocaoma", "audio");
const LINES_PATH = path.join(AUDIO_DIR, "audio-lines.json");
const OUT_DIR = path.join(AUDIO_DIR, "voice");
const TMP_ROOT = path.join(AUDIO_DIR, "tmp-edge");
const MANIFEST_PATH = path.join(AUDIO_DIR, "voice-manifest.json");

const FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3;
const TAIL_SECONDS = 0.25;
const MIN_GAP_SECONDS = 0.12;

function readMetadataEnd(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return 0;
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const items = json.Metadata || [];
  let maxEnd = 0;
  for (const item of items) {
    const data = item.Data || {};
    const end = (data.Offset || 0) + (data.Duration || 0);
    if (end > maxEnd) maxEnd = end;
  }
  return maxEnd / 1e7;
}

async function createTts(voice) {
  const tts = new MsEdgeTTS({
    connectionTimeoutMs: 20000,
    synthesisTimeoutMs: 90000,
  });
  await tts.setMetadata(voice, FORMAT, { wordBoundaryEnabled: true });
  return tts;
}

async function synthSegment(tts, segment) {
  const tmpDir = path.join(TMP_ROOT, segment.id);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  const result = await tts.toFile(tmpDir, segment.ttsText || segment.text, {
    rate: segment.rate,
    pitch: segment.pitch,
    volume: segment.volume,
  });

  const finalPath = path.join(OUT_DIR, segment.id + ".mp3");
  fs.copyFileSync(result.audioFilePath, finalPath);

  const speechEnd = readMetadataEnd(result.metadataFilePath);
  const actualSeconds = Number((speechEnd + TAIL_SECONDS).toFixed(2));

  fs.rmSync(tmpDir, { recursive: true, force: true });

  return {
    file: path.relative(ROOT, finalPath).replace(/\\/g, "/"),
    staticPath: path
      .relative(path.join(ROOT, "public"), finalPath)
      .replace(/\\/g, "/"),
    actualSeconds,
  };
}

function applyTimeline(shot) {
  const segments = shot.segments;
  if (!segments.length) {
    shot.actualSeconds = 0;
    shot.slackSeconds = shot.targetSeconds;
    shot.overflow = false;
    shot.compressedGaps = false;
    return;
  }

  const gaps = segments
    .slice(0, -1)
    .map((segment) => segment.gapAfterSeconds ?? 0);
  const plannedGapTotal = gaps.reduce((sum, gap) => sum + gap, 0);

  const layout = (gapTotal) => {
    const gapCount = gaps.length;
    const uniformGap = gapCount > 0 ? gapTotal / gapCount : 0;
    let cursor = 0;
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      segment.startSeconds = Number(cursor.toFixed(3));
      cursor += segment.actualSeconds;
      if (index < segments.length - 1) cursor += uniformGap;
    }
    return cursor;
  };

  let total = layout(plannedGapTotal);
  let slack = Number((shot.targetSeconds - total).toFixed(2));
  let compressedGaps = false;

  if (slack < 0 && gaps.length > 0) {
    const overflow = -slack;
    const minGapTotal = MIN_GAP_SECONDS * gaps.length;
    const reducedGapTotal = Math.max(
      minGapTotal,
      plannedGapTotal - overflow,
    );
    if (reducedGapTotal < plannedGapTotal) {
      total = layout(reducedGapTotal);
      slack = Number((shot.targetSeconds - total).toFixed(2));
      compressedGaps = true;
    }
  }

  shot.actualSeconds = Number(total.toFixed(2));
  shot.slackSeconds = slack;
  shot.overflow = slack < 0;
  shot.compressedGaps = compressedGaps;

  for (const segment of segments) {
    segment.relativeStartFrame = Math.round(segment.startSeconds * 24);
    segment.absoluteStartFrame = shot.startFrame + segment.relativeStartFrame;
    segment.durationInFrames = Math.max(
      1,
      Math.ceil(segment.actualSeconds * 24),
    );
  }
}

(async () => {
  if (!fs.existsSync(LINES_PATH)) {
    throw new Error(
      `Missing ${LINES_PATH}. Run: node scripts/export_tiaocao_audio_lines.js`,
    );
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });

  const shots = JSON.parse(fs.readFileSync(LINES_PATH, "utf8"));
  const ttsCache = new Map();
  const allSegments = shots.flatMap((shot) => shot.segments);

  console.log(`Voices: ${[...new Set(allSegments.map((s) => s.voice))].join(", ")}`);
  console.log(`Segments: ${allSegments.length}`);

  for (const shot of shots) {
    for (const segment of shot.segments) {
      let attempt = 0;
      while (attempt < 2) {
        try {
          let tts = ttsCache.get(segment.voice);
          if (!tts) {
            tts = await createTts(segment.voice);
            ttsCache.set(segment.voice, tts);
          }
          const result = await synthSegment(tts, segment);
          segment.audio = result.file;
          segment.staticPath = result.staticPath;
          segment.actualSeconds = result.actualSeconds;
          segment.error = null;
          break;
        } catch (error) {
          attempt += 1;
          console.warn(
            `[${segment.id}] attempt ${attempt} failed: ${error.message}`,
          );
          const cached = ttsCache.get(segment.voice);
          if (cached) {
            try {
              cached.close();
            } catch {}
            ttsCache.delete(segment.voice);
          }
          if (attempt >= 2) {
            segment.audio = null;
            segment.staticPath = null;
            segment.actualSeconds = 0;
            segment.error = String(error.message || error);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 600));
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    applyTimeline(shot);

    console.log(
      `${shot.shotId.padEnd(16)} target ${String(shot.targetSeconds).padStart(6)}s | actual ${String(shot.actualSeconds).padStart(6)}s | slack ${String(shot.slackSeconds).padStart(6)}s | segs ${shot.segments.length}${shot.compressedGaps ? " | gaps compressed" : ""}${shot.overflow ? " | OVERFLOW" : ""}`,
    );
  }

  for (const tts of ttsCache.values()) {
    try {
      tts.close();
    } catch {}
  }
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });

  const overflowShots = shots.filter((shot) => shot.overflow);
  const errorSegments = allSegments.filter((segment) => segment.error);
  const totalTarget = shots.reduce((sum, shot) => sum + shot.targetSeconds, 0);
  const totalActual = shots.reduce((sum, shot) => sum + shot.actualSeconds, 0);

  const manifest = {
    generatedAt: new Date().toISOString(),
    format: FORMAT,
    tailSeconds: TAIL_SECONDS,
    minGapSeconds: MIN_GAP_SECONDS,
    totalTargetSeconds: Number(totalTarget.toFixed(2)),
    totalActualSeconds: Number(totalActual.toFixed(2)),
    overflowCount: overflowShots.length,
    errorCount: errorSegments.length,
    overflowShots,
    errorSegments,
    shots,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");

  console.log("");
  console.log(`Manifest: ${MANIFEST_PATH}`);
  console.log(
    `Target ${manifest.totalTargetSeconds}s | Actual ${manifest.totalActualSeconds}s | Overflows ${manifest.overflowCount} | Errors ${manifest.errorCount}`,
  );

  if (overflowShots.length) {
    console.log("Overflow shots:");
    for (const shot of overflowShots
      .slice()
      .sort((a, b) => a.slackSeconds - b.slackSeconds)) {
      console.log(
        `  ${shot.shotId}: target ${shot.targetSeconds}s, actual ${shot.actualSeconds}s, slack ${shot.slackSeconds}s`,
      );
    }
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
