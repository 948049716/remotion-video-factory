/**
 * 根据 B 版配音的实际时长，在每一幕内部重排镜头时长。
 * 原则：
 * - 超时镜头加时，并留 0.15s 缓冲；
 * - 从同幕余量大的镜头借时，至少保留 0.08s 语音余量；
 * - 每幕总帧数不变，全片仍为 12960 帧 / 9:00；
 * - 不改动任何图片素材。
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const VOICE_MANIFEST_PATH = path.join(
  ROOT,
  "public",
  "tiaocaoma",
  "audio",
  "voice-manifest.json",
);
const OUT_JSON = path.join(
  ROOT,
  "public",
  "tiaocaoma",
  "audio",
  "retimed-timeline.json",
);
const OUT_TS = path.join(
  ROOT,
  "src",
  "videos",
  "TiaocaoMa",
  "retimed-timeline.ts",
);

const FPS = 24;
const BUFFER_SECONDS = 0.15;
const MIN_SLACK_SECONDS = 0.08;
const MIN_FRAMES = 96; // 最短镜头 4 秒

const manifest = JSON.parse(fs.readFileSync(VOICE_MANIFEST_PATH, "utf8"));
const shots = manifest.shots.map((shot) => ({ ...shot }));

// voice-manifest 可能来自旧版本，actId 缺失时用镜头前缀兜底。
for (const shot of shots) {
  shot.actId = shot.actId || shot.shotId.split("-")[0];
}

const acts = [];
for (const shot of shots) {
  let act = acts.find((item) => item.actId === shot.actId);
  if (!act) {
    act = {
      actId: shot.actId,
      startFrame: shot.startFrame,
      endFrame: shot.endFrame,
      shots: [],
    };
    acts.push(act);
  }
  act.shots.push(shot);
  act.endFrame = shot.endFrame;
}

const resultShots = [];

for (const act of acts) {
  const actShots = act.shots;
  const actFrames = act.endFrame - act.startFrame;

  for (const shot of actShots) {
    shot.deltaSeconds = 0;
    shot.needSeconds = 0;
    shot.availableSeconds = 0;
  }

  let required = 0;
  for (const shot of actShots) {
    const overflow = shot.actualSeconds - shot.targetSeconds;
    if (overflow > 0) {
      shot.needSeconds = Math.min(overflow + BUFFER_SECONDS, 2.5);
      required += shot.needSeconds;
    }
  }

  const donors = actShots
    .filter(
      (shot) =>
        shot.targetSeconds - shot.actualSeconds > MIN_SLACK_SECONDS,
    )
    .map((shot) => ({
      shot,
      available:
        shot.targetSeconds - shot.actualSeconds - MIN_SLACK_SECONDS,
    }))
    .sort((a, b) => b.available - a.available);

  const totalAvailable = donors.reduce(
    (sum, donor) => sum + donor.available,
    0,
  );

  let remaining = required;
  for (const donor of donors) {
    if (remaining <= 0) break;
    const give = Math.min(remaining, donor.available);
    donor.shot.deltaSeconds -= give;
    donor.shot.availableSeconds = give;
    remaining -= give;
  }

  if (remaining > 0.001) {
    // 同幕余量不足时，按比例削减加时，并标记。
    const scale = totalAvailable / required;
    for (const shot of actShots) {
      if (shot.needSeconds > 0) shot.needSeconds *= scale;
    }
    for (const donor of donors) {
      donor.shot.deltaSeconds = -donor.available;
      donor.shot.availableSeconds = donor.available;
    }
  }

  for (const shot of actShots) {
    if (shot.needSeconds > 0) shot.deltaSeconds += shot.needSeconds;
  }

  let newFrames = actShots.map((shot) =>
    Math.max(
      MIN_FRAMES,
      Math.round((shot.targetSeconds + shot.deltaSeconds) * FPS),
    ),
  );

  let diff = actFrames - newFrames.reduce((sum, frames) => sum + frames, 0);

  if (diff > 0) {
    // 多出的帧给最长镜头，视觉上最安全。
    const index = newFrames.indexOf(Math.max(...newFrames));
    newFrames[index] += diff;
  } else if (diff < 0) {
    let remainingFrames = -diff;
    const order = actShots
      .map((shot, index) => ({
        index,
        slackFrames:
          newFrames[index] - Math.ceil(shot.actualSeconds * FPS) - 2,
      }))
      .filter((item) => item.slackFrames > 0)
      .sort((a, b) => b.slackFrames - a.slackFrames);

    for (const item of order) {
      if (remainingFrames <= 0) break;
      const take = Math.min(remainingFrames, item.slackFrames);
      newFrames[item.index] -= take;
      remainingFrames -= take;
    }
  }

  let cursor = act.startFrame;
  actShots.forEach((shot, index) => {
    const durationFrames = newFrames[index];
    const segments = (shot.segments || []).map((segment) => ({
      id: segment.id,
      speaker: segment.speaker,
      staticPath: segment.staticPath,
      text: segment.text,
      relativeStartFrame: segment.relativeStartFrame,
      absoluteStartFrame: cursor + segment.relativeStartFrame,
      durationInFrames: segment.durationInFrames,
    }));
    const voiceEndFrame = segments.length
      ? Math.max(
          ...segments.map(
            (segment) =>
              segment.relativeStartFrame + segment.durationInFrames,
          ),
        )
      : 0;

    const result = {
      id: shot.shotId,
      actId: shot.actId,
      oldStartFrame: shot.startFrame,
      oldEndFrame: shot.endFrame,
      startFrame: cursor,
      endFrame: cursor + durationFrames,
      durationFrames,
      targetSeconds: shot.targetSeconds,
      actualSeconds: shot.actualSeconds,
      deltaSeconds: Number(
        (durationFrames / FPS - shot.targetSeconds).toFixed(2),
      ),
      voiceEndFrame,
      voiceFits: voiceEndFrame <= durationFrames,
      segments,
    };

    resultShots.push(result);
    cursor += durationFrames;
  });

  const newActFrames = cursor - act.startFrame;
  if (newActFrames !== actFrames) {
    throw new Error(
      `Act ${act.actId} frame mismatch: ${newActFrames} vs ${actFrames}`,
    );
  }
}

const totalFrames = resultShots.reduce(
  (sum, shot) => sum + shot.durationFrames,
  0,
);
const overflowBefore = shots.filter(
  (shot) => shot.actualSeconds > shot.targetSeconds,
).length;
const overflowAfter = resultShots.filter(
  (shot) => !shot.voiceFits,
).length;

const payload = {
  generatedAt: new Date().toISOString(),
  fps: FPS,
  totalFrames,
  bufferSeconds: BUFFER_SECONDS,
  minSlackSeconds: MIN_SLACK_SECONDS,
  overflowBefore,
  overflowAfter,
  shots: resultShots,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), "utf8");

const tsLines = [];
tsLines.push("// 由 scripts/retime_tiaocao_from_voice.js 自动生成，请勿手改。");
tsLines.push("");
tsLines.push("export type RetimedVoiceSegment = {");
tsLines.push("  id: string;");
tsLines.push("  speaker: string;");
tsLines.push("  staticPath: string;");
tsLines.push("  text: string;");
tsLines.push("  relativeStartFrame: number;");
tsLines.push("  absoluteStartFrame: number;");
tsLines.push("  durationInFrames: number;");
tsLines.push("};");
tsLines.push("");
tsLines.push("export type RetimedShot = {");
tsLines.push("  id: string;");
tsLines.push("  actId: string;");
tsLines.push("  oldStartFrame: number;");
tsLines.push("  oldEndFrame: number;");
tsLines.push("  startFrame: number;");
tsLines.push("  endFrame: number;");
tsLines.push("  durationFrames: number;");
tsLines.push("  targetSeconds: number;");
tsLines.push("  actualSeconds: number;");
tsLines.push("  deltaSeconds: number;");
tsLines.push("  voiceEndFrame: number;");
tsLines.push("  voiceFits: boolean;");
tsLines.push("  segments: RetimedVoiceSegment[];");
tsLines.push("};");
tsLines.push("");
tsLines.push(
  `export const RETIMED_SHOTS: RetimedShot[] = ${JSON.stringify(
    resultShots,
    null,
    2,
  )};`,
);
tsLines.push("");

fs.writeFileSync(OUT_TS, tsLines.join("\n"), "utf8");

console.log(`Wrote ${OUT_JSON}`);
console.log(`Wrote ${OUT_TS}`);
console.log(
  `Total frames: ${totalFrames} (${(totalFrames / FPS).toFixed(1)}s) | overflow before: ${overflowBefore} | after: ${overflowAfter}`,
);

for (const act of acts) {
  const actShots = resultShots.filter((shot) => shot.actId === act.actId);
  const oldSeconds = actShots.reduce(
    (sum, shot) => sum + (shot.oldEndFrame - shot.oldStartFrame) / FPS,
    0,
  );
  const newSeconds = actShots.reduce(
    (sum, shot) => sum + shot.durationFrames / FPS,
    0,
  );
  console.log(
    `${act.actId.padEnd(10)} ${oldSeconds.toFixed(1)}s -> ${newSeconds.toFixed(1)}s | ${actShots.length} shots`,
  );
  for (const shot of actShots) {
    if (Math.abs(shot.deltaSeconds) >= 0.05) {
      console.log(
        `  ${shot.id.padEnd(16)} ${shot.targetSeconds}s -> ${(shot.durationFrames / FPS).toFixed(2)}s (${shot.deltaSeconds > 0 ? "+" : ""}${shot.deltaSeconds}s) voiceEnd ${shot.voiceEndFrame} / ${shot.durationFrames}${shot.voiceFits ? "" : " | VOICE DOES NOT FIT"}`,
      );
    }
  }
}
