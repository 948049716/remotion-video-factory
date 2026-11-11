import { staticFile } from "remotion";

import {
  MUSIC_CUES,
  SFX_FILES,
  VOICE_CAST,
} from "./audio-direction";
import type {
  MusicCue,
  SfxFamily,
  VoiceProfile,
} from "./audio-direction";

export { MUSIC_CUES, SFX_FILES, VOICE_CAST };
export type { MusicCue, SfxFamily, VoiceProfile };

/** BGM cue 对应的静态文件 URL。 */
export const musicSrc = (cue: MusicCue): string => staticFile(cue.file);

/** 音效族对应的静态文件 URL；silence 返回 null。 */
export const sfxSrc = (family: SfxFamily): string | null => {
  const file = SFX_FILES[family];
  return file ? staticFile(file) : null;
};

/** 配音段的静态文件 URL；staticPath 来自 voice-manifest.json。 */
export const voiceSrc = (staticPath: string): string =>
  staticFile(staticPath);
