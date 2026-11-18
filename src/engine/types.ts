import type React from "react";

/**
 * Google Flow (Veo 3.1 / Gemini Omni Flash) 原生输出帧率为 24fps 电影帧率。
 * 新建真动画项目默认使用 24fps，可彻底消除 24->30 帧率转换带来的抽帧微顿。
 */
export const DEFAULT_FLOW_FPS = 24;

export type SpeakerId = string;

export type SpeakerMeta = {
  name: string;
  /** 角色专属字幕色标 */
  accent: string;
  /** 是否在字幕前显示角色名（旁白为 false，对话角色为 true） */
  showPrefix: boolean;
};

export type AudioLine = {
  id: string;
  /** 相对 public/ 的路径，例如 "<story-slug>/audio/s01-narr.mp3" */
  file: string;
  text: string;
  speaker: SpeakerId;
  /** 相对本镜头起点的开始秒数 */
  atSec: number;
  /** ffprobe 实测音频秒数 */
  durSec: number;
  /**
   * 可选：由 tts_helper 导出的逐帧归一化语音振幅包络 (0..1)，
   * 用于在 2D 降级或特写叠加层中驱动真实口型张合（Viseme Lip-Sync）。
   */
  envelope?: number[];
  /** envelope 采样帧率（默认与工程 FPS 一致） */
  envelopeFps?: number;
};

export type ShotTone = "night" | "glow" | "warm" | "meadow";

export type ShotCue =
  | "push"
  | "pull"
  | "pan-right"
  | "pan-left"
  | "grow"
  | "pulse"
  | "still";

export type ShotFx =
  | "leaves"
  | "starlight"
  | "petals"
  | "mist"
  | "ripples"
  | "none";

export type ShotTransitionType =
  | "cut"
  | "dissolve"
  | "dip-to-black"
  | "dip-to-warm";

/**
 * Google Flow / AI 动态视频切片配置（真动画主力渲染层）
 */
export type VideoClipSpec = {
  /** 相对 public/ 的视频路径，如 "<story-slug>/video/shot-01.mp4" */
  src: string;
  /** ffprobe 实测原视频总秒数（提供后可自动计算安全微变速比以贴合镜头时长） */
  sourceDurSec?: number;
  /** 裁剪掉片头的秒数（默认 0） */
  trimBeforeSec?: number;
  /** 显式指定播放速率（建议范围 0.85 ~ 1.15；未指定时根据 sourceDurSec 与镜头 durSec 自动微调） */
  playbackRate?: number;
  /**
   * 是否保留 Google Flow 生成的原生环境音/动作拟音（默认 false 静音，避免误混入外语假人声）。
   * 经审片确认环境音干净后设为 true，在对白响起时会自动执行音量闪避（Ducking）。
   */
  keepAmbientAudio?: boolean;
  /** 无对白时的环境音基准音量（默认 0.35） */
  ambientVolume?: number;
  /** 对白期间闪避压低后的环境音音量（默认 0.12） */
  duckedAmbientVolume?: number;
  /** 是否叠加微弱镜头二次运镜（默认 false，优先尊重视频模型原生运镜） */
  applyCameraCue?: boolean;
};

/**
 * Google Flow 制作前/制作中的首尾关键帧动态预览配置（Animatic Leica Reel）
 * 当视频切片尚未生成时，自动平滑过渡展示首尾帧并验证配音节奏；视频落盘后自动无感切换为真视频。
 */
export type KeyframeAnimaticSpec = {
  /** 相对 public/ 的首帧路径，如 "<story-slug>/images/shot-01-start.webp" */
  startSrc: string;
  /** 可选：相对 public/ 的匹配尾帧路径，如 "<story-slug>/images/shot-01-end.webp" */
  endSrc?: string;
  /** 尾帧交叉叠化起始进度比例（0..1，默认 0.55） */
  crossfadeStartRatio?: number;
};

export type LayerMotion =
  | "static"
  | "breathe"
  | "swing"
  | "sway"
  | "nod"
  | "talk"
  | "spin-y"
  | "rotate"
  | "float"
  | "glow-pulse";

/** 关键帧姿态节点：替代单一正弦死循环，支持真实剧情动作编排 */
export type PoseKeyframe = {
  /** 相对镜头起点的秒数 */
  atSec: number;
  x?: number;
  y?: number;
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
};

/** 角色真口型序列帧贴图（按语音能量实时切换） */
export type VisemeSpriteSpec = {
  /** 闭嘴帧 */
  closedSrc: string;
  /** 半张嘴帧 */
  halfSrc: string;
  /** 大张嘴帧 */
  openSrc: string;
  /** 可选：圆唇帧 */
  roundSrc?: string;
};

/** 角色自然眨眼序列帧贴图 */
export type BlinkSpriteSpec = {
  openSrc: string;
  halfSrc?: string;
  closedSrc: string;
  /** 平均眨眼间隔秒数（默认 3.4s） */
  intervalSec?: number;
};

export type LayerSpec = {
  id: string;
  src: string;
  zIndex?: number;
  origin?: [number, number];
  parallax?: number;
  motion?: LayerMotion;
  amplitude?: number;
  speed?: number;
  phase?: number;
  activeSpeaker?: SpeakerId;
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  /** 可选：事件动作关键帧序列 */
  keyframes?: PoseKeyframe[];
  /** 可选：真口型张合序列帧（配置了 activeSpeaker 时随真实语音包络切换） */
  visemes?: VisemeSpriteSpec;
  /** 可选：周期性自然眨眼序列帧 */
  blink?: BlinkSpriteSpec;
  /** 可选：子图层（建立父子骨骼层级，如 躯干 -> 上臂 -> 前臂，子层自动继承父层关节变换） */
  children?: LayerSpec[];
};

export type ShotRenderMode = "auto" | "flow-clip" | "layered-2d" | "animatic";

export type StoryShot = {
  id: string;
  label: string;
  note?: string;
  /** 镜头持续秒数（建议真动画镜头 3.5s ~ 8.0s） */
  durSec: number;
  tone: ShotTone;
  cue: ShotCue;
  fx: ShotFx;
  /**
   * 渲染模式（默认 "auto"）：
   *  - 若存在 clip 或 public/<slug>/video/shot-<id>.mp4，优先渲染 Google Flow 真动画视频；
   *  - 否则若存在 layers，渲染 2D 骨骼/口型分层舞台；
   *  - 否则渲染首尾关键帧动态故事板（Animatic）。
   */
  mode?: ShotRenderMode;
  clip?: VideoClipSpec;
  animatic?: KeyframeAnimaticSpec;
  layers?: LayerSpec[];
  /** 入场转场方式（默认 "dissolve"） */
  transitionIn?: ShotTransitionType;
  /** 转场持续帧数（默认 6 帧，约 0.25s @ 24fps） */
  transitionFrames?: number;
  /** 是否开启 12fps 手绘赛璐珞沸腾线质感微颤（默认 false） */
  celLineBoil?: boolean;
  lines: AudioLine[];
};

export type StoryShotTiming = StoryShot & {
  fromFrame: number;
  durationInFrames: number;
};

export type SfxCue = {
  id: string;
  /** 相对 public/ 的音效路径 */
  src: string;
  /** 归属镜头 ID（若省略则按全局秒数 atSec 定位） */
  shotId?: string;
  /** 相对镜头起点（或全局起点）的触发秒数 */
  atSec: number;
  durSec?: number;
  volume?: number;
};

export type BgmSpec = {
  /** 相对 public/ 的背景音乐路径 */
  src: string;
  /** 无人说话时的基准音量（默认 0.26） */
  volume?: number;
  /** 有人说话时自动闪避压低后的音量（默认 0.10） */
  duckVolume?: number;
  fadeInSec?: number;
  fadeOutSec?: number;
};

export type SoundscapeSpec = {
  bgm?: BgmSpec;
  sfx?: SfxCue[];
};

export type StoryProjectConfig = {
  storySlug: string;
  fps?: number;
  speakers: Record<SpeakerId, SpeakerMeta>;
  shots: StoryShot[];
  soundscape?: SoundscapeSpec;
  /** 是否在右上角显示分镜序号水印（默认 false，保持成片纯净电影感） */
  showShotHud?: boolean;
  /** 当镜头仍处于未导入视频的 Animatic 阶段时，是否在左上角显示轻量状态角标（默认 false） */
  showAnimaticBadge?: boolean;
};

/**
 * 将声明式镜头数组累加转换为帧级精确时间轴
 */
export const buildStoryTimeline = (
  shots: StoryShot[],
  fps: number = DEFAULT_FLOW_FPS,
): { timeline: StoryShotTiming[]; totalFrames: number } => {
  const timeline = shots.reduce<StoryShotTiming[]>((acc, shot) => {
    const prev = acc[acc.length - 1];
    const fromFrame = prev ? prev.fromFrame + prev.durationInFrames : 0;
    acc.push({
      ...shot,
      fromFrame,
      durationInFrames: Math.max(1, Math.round(shot.durSec * fps)),
    });
    return acc;
  }, []);

  const totalFrames = Math.max(
    1,
    timeline.reduce((sum, s) => sum + s.durationInFrames, 0),
  );

  return { timeline, totalFrames };
};
