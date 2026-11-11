/**
 * 把逐镜旁白/台词拆成独立音频段，并按角色绑定 Edge TTS 声线。
 * 运行前编译 script.ts 与 audio-direction.ts 到 .tmp-tiaocao。
 */

const fs = require("fs");
const path = require("path");

const { SHOTS } = require("../.tmp-tiaocao/script.js");
const {
  VOICE_CAST,
  NARRATOR,
  resolveSfxFamily,
  SFX_FILES,
} = require("../.tmp-tiaocao/audio-direction.js");

const ROOT = path.resolve(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "public", "tiaocaoma", "audio");
const OUT_PATH = path.join(AUDIO_DIR, "audio-lines.json");

fs.mkdirSync(AUDIO_DIR, { recursive: true });

/** 只用于 TTS 的停顿/语气标点；字幕仍使用原始 text。 */
const TTS_TEXT_OVERRIDES = {
  "rules-09-dlg-01":
    "哎哎——三品马，怎么把嘴伸到二品槽里了？五品马，放着青草不吃，干吗吃枯草？",
  "exception-03-dlg-01": "客官里面请——我给马添些草料！",
  "exception-04-dlg-01": "好好伺候……可别欺负它啊。",
  "exception-09-dlg-01":
    "不知这瘸马，是哪位大人的宝驹？难道今日店里，还有一品大员，我竟没瞧见？",
  "contest-08-dlg-01":
    "怎么？……难道当今圣上，今日不在宫中用膳，……跑来你这饭馆寻乐？",
  "contest-09-dlg-01": "下次……再看到这破马……扫本大人的兴。",
  "contest-10-dlg-02": "一派胡言！……我与赛赤兔感情深厚，人在马在！",
  "truth-02-dlg-01": "大人明鉴……在下只是骑马来吃饭。马不吃草，这有何罪？",
  "truth-09-dlg-02": "朝廷忘了我……我也不记得自己姓甚名谁。",
};

const shots = SHOTS.map((shot, index) => {
  const segments = [];

  if (shot.narration) {
    const profile = VOICE_CAST[NARRATOR];
    segments.push({
      id: `${shot.id}-narr`,
      kind: "narration",
      speaker: NARRATOR,
      text: shot.narration,
      ttsText: shot.narration,
      voice: profile.voice,
      rate: profile.rate,
      pitch: profile.pitch,
      volume: profile.volume,
      gapAfterSeconds: shot.dialogue.length > 0 ? 0.35 : 0,
    });
  }

  shot.dialogue.forEach((dialogue, dialogueIndex) => {
    const profile = VOICE_CAST[dialogue.speaker] || VOICE_CAST[NARRATOR];
    const segmentId = `${shot.id}-dlg-${String(dialogueIndex + 1).padStart(2, "0")}`;
    segments.push({
      id: segmentId,
      kind: "dialogue",
      speaker: dialogue.speaker,
      text: dialogue.line,
      ttsText: TTS_TEXT_OVERRIDES[segmentId] || dialogue.line,
      voice: profile.voice,
      rate: profile.rate,
      pitch: profile.pitch,
      volume: profile.volume,
      gapAfterSeconds:
        dialogueIndex < shot.dialogue.length - 1 ? 0.2 : 0,
    });
  });

  return {
    index: index + 1,
    shotId: shot.id,
    actId: shot.act,
    title: shot.title,
    startFrame: shot.startFrame,
    endFrame: shot.endFrame,
    targetSeconds: Number(((shot.endFrame - shot.startFrame) / 24).toFixed(2)),
    segments,
    sfx: shot.sfx.map((name) => {
      const family = resolveSfxFamily(name);
      return { name, family, file: SFX_FILES[family] };
    }),
  };
});

fs.writeFileSync(OUT_PATH, JSON.stringify(shots, null, 2), "utf8");

const allSegments = shots.flatMap((shot) => shot.segments);
const bySpeaker = allSegments.reduce((acc, segment) => {
  acc[segment.speaker] = (acc[segment.speaker] || 0) + 1;
  return acc;
}, {});

console.log(
  `Wrote ${OUT_PATH}: ${shots.length} shots, ${allSegments.length} voice segments.`,
);
console.log(
  `By speaker: ${Object.entries(bySpeaker)
    .map(([speaker, count]) => `${speaker} ${count}`)
    .join(" | ")}`,
);
