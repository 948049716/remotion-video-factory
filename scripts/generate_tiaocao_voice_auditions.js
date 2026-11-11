/**
 * 生成 5 个角色的 A/B 音色试听，供选择后再批量重生成。
 * 运行：node scripts/generate_tiaocao_voice_auditions.js
 */

const fs = require("fs");
const path = require("path");
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "tiaocaoma", "audio", "audition");
const TMP_ROOT = path.join(OUT_DIR, "tmp");
const MANIFEST_PATH = path.join(OUT_DIR, "audition-manifest.json");

const FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3;

const CANDIDATES = [
  {
    id: "narrator-a",
    character: "旁白",
    label: "A · 当前版",
    voice: "zh-CN-YunjianNeural",
    rate: "-4%",
    pitch: "-2Hz",
    volume: "0%",
    note: "稳、中性、说书人；不抢戏。",
    text: "话说京城城西，新开了一家饭馆。开张才一个月，生意就火得不得了。",
  },
  {
    id: "narrator-b",
    character: "旁白",
    label: "B · 更慢更低",
    voice: "zh-CN-YunjianNeural",
    rate: "-8%",
    pitch: "-5Hz",
    volume: "0%",
    note: "更沉、更慢，关键句更有停顿感；适合悲剧底色。",
    text: "话说京城城西，新开了一家饭馆。开张才一个月，生意就火得不得了。",
  },
  {
    id: "waiter-a",
    character: "店小二",
    label: "A · 当前版",
    voice: "zh-CN-YunxiNeural",
    rate: "+3%",
    pitch: "+3Hz",
    volume: "0%",
    note: "年轻、机灵、略快。",
    text: "客官里面请，我给马添些草料。",
  },
  {
    id: "waiter-b",
    character: "店小二",
    label: "B · 更油滑",
    voice: "zh-CN-YunxiNeural",
    rate: "+9%",
    pitch: "+6Hz",
    volume: "+5%",
    note: "更快、更高、更亮，带一点讨好和油滑；挨训时更容易发虚。",
    text: "客官里面请——我给马添些草料！",
  },
  {
    id: "scarface-a",
    character: "刀疤脸",
    label: "A · 当前版",
    voice: "zh-CN-YunyangNeural",
    rate: "-12%",
    pitch: "-8Hz",
    volume: "-5%",
    note: "低沉、克制、一字一顿。",
    text: "好好伺候，可别欺负它啊！",
  },
  {
    id: "scarface-b",
    character: "刀疤脸",
    label: "B · 更苍老克制",
    voice: "zh-CN-YunyangNeural",
    rate: "-20%",
    pitch: "-12Hz",
    volume: "-12%",
    note: "更慢、更低、更轻；加入停顿，像压着旧伤说话。",
    text: "好好伺候……可别欺负它啊。",
  },
  {
    id: "zhao-a",
    character: "赵大人",
    label: "A · 当前版",
    voice: "zh-CN-YunyangNeural",
    rate: "-2%",
    pitch: "-2Hz",
    volume: "+3%",
    note: "官腔、端架子；和刀疤脸共用声线但更快更响。",
    text: "不知这瘸马是哪位大人的宝驹？难道今日店里还有一品大员，我竟没瞧见？",
  },
  {
    id: "zhao-b",
    character: "赵大人",
    label: "B · 更尖更飘",
    voice: "zh-CN-YunjianNeural",
    rate: "+2%",
    pitch: "+2Hz",
    volume: "+5%",
    note: "换 Yunjian 声线，更高更飘，带一点阴阳怪气；和旁白拉开。",
    text: "不知这瘸马，是哪位大人的宝驹？难道今日店里，还有一品大员，我竟没瞧见？",
  },
  {
    id: "yipin-a",
    character: "一品大员",
    label: "A · 当前版",
    voice: "zh-CN-YunyangNeural",
    rate: "-10%",
    pitch: "-6Hz",
    volume: "0%",
    note: "冷、慢、轻蔑。",
    text: "下次再看到这破马扫本大人的兴……",
  },
  {
    id: "yipin-b",
    character: "一品大员",
    label: "B · 更冷更压场",
    voice: "zh-CN-YunjianNeural",
    rate: "-18%",
    pitch: "-10Hz",
    volume: "-6%",
    note: "换 Yunjian 声线，极慢极低，用停顿压人；和刀疤脸彻底分开。",
    text: "下次……再看到这破马……扫本大人的兴。",
  },
];

async function createTts(voice) {
  const tts = new MsEdgeTTS({
    connectionTimeoutMs: 20000,
    synthesisTimeoutMs: 90000,
  });
  await tts.setMetadata(voice, FORMAT, { wordBoundaryEnabled: true });
  return tts;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });

  const cache = new Map();
  const results = [];

  for (const candidate of CANDIDATES) {
    const tmpDir = path.join(TMP_ROOT, candidate.id);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });

    try {
      let tts = cache.get(candidate.voice);
      if (!tts) {
        tts = await createTts(candidate.voice);
        cache.set(candidate.voice, tts);
      }

      const result = await tts.toFile(tmpDir, candidate.text, {
        rate: candidate.rate,
        pitch: candidate.pitch,
        volume: candidate.volume,
      });

      const finalPath = path.join(OUT_DIR, candidate.id + ".mp3");
      fs.copyFileSync(result.audioFilePath, finalPath);

      results.push({
        ...candidate,
        file: path
          .relative(path.join(ROOT, "public"), finalPath)
          .replace(/\\/g, "/"),
        ok: true,
      });
      console.log(`OK ${candidate.id}`);
    } catch (error) {
      results.push({
        ...candidate,
        file: null,
        ok: false,
        error: String(error.message || error),
      });
      console.log(`ERR ${candidate.id}: ${error.message}`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  for (const tts of cache.values()) {
    try {
      tts.close();
    } catch {}
  }
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });

  fs.writeFileSync(
    MANIFEST_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
    "utf8",
  );

  console.log(`Manifest: ${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
