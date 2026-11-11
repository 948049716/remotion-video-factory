/**
 * 《跳槽马》声音方向表。
 * 配音、BGM、音效都以这张表为准，避免“一嗓到底”和通用配乐。
 */

export type VoiceProfile = {
  speaker: string;
  voice: string;
  rate: string;
  pitch: string;
  volume: string;
  characterNote: string;
};

export const NARRATOR = "旁白";

export const VOICE_CAST: Record<string, VoiceProfile> = {
  [NARRATOR]: {
    speaker: NARRATOR,
    voice: "zh-CN-YunjianNeural",
    rate: "-8%",
    pitch: "-5Hz",
    volume: "0%",
    characterNote:
      "说书人：更慢、更低，关键句留白；旁观者，不煽情。",
  },
  店小二: {
    speaker: "店小二",
    voice: "zh-CN-YunxiNeural",
    rate: "+9%",
    pitch: "+6Hz",
    volume: "+5%",
    characterNote:
      "二十出头，更快更高、更油滑；嘴上赔笑，挨训时立刻发虚。",
  },
  刀疤脸: {
    speaker: "刀疤脸",
    voice: "zh-CN-YunyangNeural",
    rate: "-20%",
    pitch: "-12Hz",
    volume: "-12%",
    characterNote:
      "四十多岁独臂老兵，极慢、极低、轻声；像压着旧伤说话，不怒吼。",
  },
  赵大人: {
    speaker: "赵大人",
    voice: "zh-CN-YunjianNeural",
    rate: "+2%",
    pitch: "+2Hz",
    volume: "+5%",
    characterNote:
      "五十岁圆脸官员，略高略快、阴阳怪气；端架子，句尾下沉。",
  },
  一品大员: {
    speaker: "一品大员",
    voice: "zh-CN-YunjianNeural",
    rate: "-18%",
    pitch: "-10Hz",
    volume: "-6%",
    characterNote:
      "六十岁高瘦权臣，极慢极低、轻声但压场；停顿就是威压。",
  },
};

export type CharacterMotif = {
  notes: string[];
  instrument: string;
  rhythm: string;
  feel: string;
};

/** 人物/马匹动机，供 BGM 与音效设计使用。 */
export const CHARACTER_MOTIFS: Record<string, CharacterMotif> = {
  店小二: {
    notes: ["D4", "F4", "A4"],
    instrument: "琵琶拨弦 + 小木鱼",
    rhythm: "短-短-长",
    feel: "机灵、讨好、带一点滑稽",
  },
  刀疤脸: {
    notes: ["D3", "C3", "Bb2", "A2"],
    instrument: "低音拨弦 + 旧铜铃",
    rhythm: "慢-慢-慢-长",
    feel: "旧伤、克制、被遗忘",
  },
  瘸马: {
    notes: ["A3", "C4", "E4"],
    instrument: "铜铃 + 高音弱弦",
    rhythm: "一瘸一拐的三拍",
    feel: "孤独、倔强、不肯低头",
  },
  赵大人: {
    notes: ["F3", "D3"],
    instrument: "低音拨弦 + 小锣",
    rhythm: "官步两步",
    feel: "端架子、色厉内荏",
  },
  一品大员: {
    notes: ["D2", "D2"],
    instrument: "大锣 + 低音持续音",
    rhythm: "一声一顿",
    feel: "冷酷权势、压场",
  },
  马王: {
    notes: ["D4", "F#4", "A4", "D5"],
    instrument: "温暖拨弦 + 铜铃",
    rhythm: "上行琶音",
    feel: "金色回忆、战功、尊严",
  },
};

export type MusicCue = {
  id: string;
  actId: string;
  startFrame: number;
  endFrame: number;
  title: string;
  tempoBpm: number;
  key: string;
  mood: string;
  instrumentation: string[];
  motif: string;
  duckUnderVoice: boolean;
  file: string;
};

/** 五幕 BGM cue 表。每幕一个主题，人物动机在幕内穿插。 */
export const MUSIC_CUES: MusicCue[] = [
  {
    id: "music.act1",
    actId: "rules",
    startFrame: 0,
    endFrame: 2760,
    title: "规矩",
    tempoBpm: 96,
    key: "D 小调五声",
    mood: "市井、精明、轻微讽刺；热闹但不喜庆",
    instrumentation: ["琵琶拨弦", "小木鱼", "低音鼓", "纸声", "远处街市"],
    motif: "店小二三音动机 D-F-A；马槽等级用下行五声",
    duckUnderVoice: true,
    file: "tiaocaoma/audio/music/act1-rules.wav",
  },
  {
    id: "music.act2",
    actId: "exception",
    startFrame: 2760,
    endFrame: 5400,
    title: "破例",
    tempoBpm: 72,
    key: "D 小调",
    mood: "好奇、暗流、轻微不安；瘸马登场后变薄",
    instrumentation: ["低音持续音", "旧铜铃", "低音拨弦", "稀疏木鱼", "纸风声"],
    motif: "刀疤脸四音下行 D-C-Bb-A；瘸马三拍铃铛",
    duckUnderVoice: true,
    file: "tiaocaoma/audio/music/act2-exception.wav",
  },
  {
    id: "music.act3",
    actId: "contest",
    startFrame: 5400,
    endFrame: 7920,
    title: "较劲",
    tempoBpm: 108,
    key: "D 小调",
    mood: "对峙、咄咄逼人；一品大员出场后压低、变冷",
    instrumentation: ["堂鼓", "低音拨弦", "大锣", "铜铃", "紧绷弦音"],
    motif: "赵大人两步动机 F-D；一品大员单音大锣",
    duckUnderVoice: true,
    file: "tiaocaoma/audio/music/act3-contest.wav",
  },
  {
    id: "music.act4",
    actId: "hunger",
    startFrame: 7920,
    endFrame: 10200,
    title: "绝食",
    tempoBpm: 48,
    key: "D 小调挂四度",
    mood: "冷、空、饿；几乎安静，只剩铃铛和呼吸",
    instrumentation: ["高音弱弦", "旧铜铃", "纸风", "极低持续音", "远处马嚼"],
    motif: "瘸马三拍铃铛放慢；刀疤脸动机只剩两个音",
    duckUnderVoice: true,
    file: "tiaocaoma/audio/music/act4-hunger.wav",
  },
  {
    id: "music.act5",
    actId: "truth",
    startFrame: 10200,
    endFrame: 12960,
    title: "真相",
    tempoBpm: 60,
    key: "D 小调转 D 大调回忆",
    mood: "悲、克制、金色回忆后转冷；结尾不煽情",
    instrumentation: ["温暖拨弦", "铜铃", "低音弦", "堂鼓", "大锣", "雨声"],
    motif: "马王上行琶音 D-F#-A-D；公堂回到单音 D；结尾只留低音",
    duckUnderVoice: true,
    file: "tiaocaoma/audio/music/act5-truth.wav",
  },
];

export type SfxFamily =
  | "silence"
  | "paper"
  | "abacus"
  | "sword"
  | "bell"
  | "horse"
  | "gong"
  | "door"
  | "stamp"
  | "weather"
  | "wood"
  | "metal"
  | "cloth"
  | "body"
  | "crowd";

/** 把脚本里的具体音效名归并到可复用的音效族。顺序即优先级。 */
export const SFX_FAMILY_KEYWORDS: Array<[SfxFamily, string[]]> = [
  ["silence", ["静默", "安静"]],
  ["paper", ["撕", "纸", "翻纸", "屑"]],
  ["abacus", ["算盘"]],
  ["sword", ["剑", "破风", "箭"]],
  ["bell", ["铃铛", "灯笼", "马铃"]],
  ["horse", ["马", "蹄", "嘶", "嚼", "鼻息", "刨地"]],
  ["gong", ["锣", "鼓", "音乐", "堂威"]],
  ["door", ["宫门", "门帘"]],
  ["stamp", ["木牌", "压下"]],
  ["weather", ["风", "雨", "灯焰"]],
  ["wood", ["木", "桌", "椅", "拍案", "槽", "桩", "凳", "酒盅"]],
  ["metal", ["杯", "盏", "筷子", "酒", "兵器", "茶"]],
  ["cloth", ["衣", "袖", "袍", "汗", "抹布", "绳", "缰绳"]],
  ["body", ["咬牙", "倒吸气", "牙齿", "磕头", "手指", "长啸"]],
  ["crowd", ["街市", "交谈", "招呼", "笑", "脚步", "质问", "冷声", "回声", "小童", "整齐"]],
];

export function resolveSfxFamily(name: string): SfxFamily {
  for (const [family, keywords] of SFX_FAMILY_KEYWORDS) {
    if (keywords.some((keyword) => name.includes(keyword))) return family;
  }
  return "wood";
}

/** 音效族对应的生成文件；silence 不生成文件，作为“停音乐/留白”指令。 */
export const SFX_FILES: Record<SfxFamily, string | null> = {
  silence: null,
  paper: "tiaocaoma/audio/sfx/paper.wav",
  abacus: "tiaocaoma/audio/sfx/abacus.wav",
  sword: "tiaocaoma/audio/sfx/sword.wav",
  bell: "tiaocaoma/audio/sfx/bell.wav",
  horse: "tiaocaoma/audio/sfx/horse.wav",
  gong: "tiaocaoma/audio/sfx/gong.wav",
  door: "tiaocaoma/audio/sfx/door.wav",
  stamp: "tiaocaoma/audio/sfx/stamp.wav",
  weather: "tiaocaoma/audio/sfx/weather.wav",
  wood: "tiaocaoma/audio/sfx/wood.wav",
  metal: "tiaocaoma/audio/sfx/metal.wav",
  cloth: "tiaocaoma/audio/sfx/cloth.wav",
  body: "tiaocaoma/audio/sfx/body.wav",
  crowd: "tiaocaoma/audio/sfx/crowd.wav",
};
