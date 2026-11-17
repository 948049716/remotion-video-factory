# Remotion 手绘水彩故事动画代码模板与工程规范

本文档提供 `watercolor-story-video` Skill 在阶段 0（工程初始化）与阶段 6（Remotion 动画制作）的标准代码模板。

---

## 1. Remotion 铁律（防止渲染闪烁与报错）

1. **严禁使用 CSS 动画**：所有位移、缩放、透明度、粒子运动必须由 `useCurrentFrame()` + `useVideoConfig()` + `interpolate()` / `spring()` 驱动，严禁写 CSS `transition` 或 `@keyframes`。
2. **所有 `interpolate()` 必须加 Clamp**：默认传入 `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }`。
3. **单一数据源（Single Source of Truth）**：所有镜头时长（`durSec`）、台词起始秒数（`atSec`）与音频实测时长统一维护在 `src/videos/<StoryName>/shots.ts`，由 `TIMELINE` 自动累加计算 `fromFrame` 与 `durationInFrames`，禁止在组件里手写硬编码帧号。
4. **静态资源子目录隔离**：所有图片与音频必须放在 `public/<story-slug>/images/` 与 `public/<story-slug>/audio/` 下，通过 `staticFile("<story-slug>/...")` 引用。
5. **严禁主动渲染 MP4**：除非用户明确要求导出 MP4 视频文件，否则制作完成后只做 `npx tsc --noEmit` 类型检查（及可选单帧 `remotion still` 校验），引导用户在 Remotion Studio 中预览。

---

## 2. 空仓库/新项目最小初始化模板（若项目尚未初始化）

如果当前工作区没有 `package.json` 或 `src/Root.tsx`，按以下最小结构初始化：

### `package.json`
```json
{
  "name": "remotion-watercolor-stories",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "remotion studio",
    "build": "remotion bundle",
    "check": "tsc --noEmit"
  },
  "dependencies": {
    "@remotion/cli": "^4.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "remotion": "^4.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "typescript": "^5.8.0"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

### `remotion.config.ts`
```ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
```

### `src/index.ts`
```ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

---

## 3. 镜头与配音单一数据源模板：`src/videos/<StoryName>/shots.ts`

根据阶段 3 `tts_helper.py` 实测得到的音频时长，生成 `shots.ts`：

```ts
export type SpeakerId = "narrator" | string;

export type SpeakerMeta = {
  name: string;
  /** 角色专属字幕色标 */
  accent: string;
  /** 是否在字幕前显示角色名（旁白一般为 false，角色对话为 true） */
  showPrefix: boolean;
};

export const SPEAKERS: Record<string, SpeakerMeta> = {
  narrator: {
    name: "旁白",
    accent: "rgba(255, 248, 231, 0.42)",
    showPrefix: false,
  },
  fox: {
    name: "阿狸",
    accent: "#FFC978",
    showPrefix: true,
  },
};

export type AudioLine = {
  id: string;
  /** 相对 public/ 的路径，如 "fox-story/audio/s01-narr.mp3" */
  file: string;
  text: string;
  speaker: SpeakerId;
  /** 相对本镜头起点的开始秒数 */
  atSec: number;
  /** ffprobe 实测音频秒数 */
  durSec: number;
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
export type ShotFx = "leaves" | "starlight" | "petals" | "mist" | "ripples" | "none";

export type Shot = {
  id: string;
  label: string;
  note: string;
  durSec: number;
  tone: ShotTone;
  cue: ShotCue;
  fx: ShotFx;
  lines: AudioLine[];
};

export const STORY_SLUG = "fox-starlight-seed";
export const FPS = 30;

export const SHOTS: Shot[] = [
  // 由分镜与 tts-manifest.json 实测时长填充
];

export type ShotTiming = Shot & {
  fromFrame: number;
  durationInFrames: number;
};

export const TIMELINE: ShotTiming[] = SHOTS.reduce<ShotTiming[]>((acc, shot) => {
  const prev = acc[acc.length - 1];
  const fromFrame = prev ? prev.fromFrame + prev.durationInFrames : 0;
  acc.push({
    ...shot,
    fromFrame,
    durationInFrames: Math.max(1, Math.round(shot.durSec * FPS)),
  });
  return acc;
}, []);

export const TOTAL_FRAMES = Math.max(
  1,
  TIMELINE.reduce((sum, s) => sum + s.durationInFrames, 0),
);
```

---

## 4. 手绘水彩动画主组件模板：`src/videos/<StoryName>/StoryVideo.tsx`

该组件包含：
1. **帧驱动平滑运镜**（`cameraTransform`）
2. **程序化水彩氛围粒子层**（`WatercolorFxLayer`：飘叶、星光、花瓣、流雾、涟漪）
3. **水彩纸张肌理与绘本柔边暗角层**（`WatercolorPaperOverlay`）
4. **绘本风角色字幕系统**（`StorybookSubtitle`）
5. **自动识别 `public/<story-slug>/images/shot-XX.webp` 并带优雅占位回退**

```tsx
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  getStaticFiles,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  FPS,
  SPEAKERS,
  STORY_SLUG,
  ShotCue,
  ShotFx,
  ShotTiming,
  ShotTone,
  TIMELINE,
} from "./shots";

const TONES: Record<
  ShotTone,
  { bg: string; glow: string; ink: string; vignette: string }
> = {
  night: {
    bg: "linear-gradient(180deg, #102029 0%, #19303B 58%, #213732 100%)",
    glow: "rgba(138, 196, 218, 0.35)",
    ink: "#E8F1F2",
    vignette: "rgba(10, 20, 26, 0.42)",
  },
  glow: {
    bg: "linear-gradient(180deg, #13252E 0%, #1E3840 52%, #2F3E34 100%)",
    glow: "rgba(255, 208, 122, 0.65)",
    ink: "#FFF4DC",
    vignette: "rgba(12, 22, 26, 0.38)",
  },
  warm: {
    bg: "linear-gradient(180deg, #1F2E35 0%, #33463F 50%, #4E4532 100%)",
    glow: "rgba(255, 214, 138, 0.78)",
    ink: "#FFF8EA",
    vignette: "rgba(24, 18, 12, 0.32)",
  },
  meadow: {
    bg: "linear-gradient(180deg, #DCECE7 0%, #CFE5D8 55%, #E8DFC5 100%)",
    glow: "rgba(255, 236, 179, 0.65)",
    ink: "#2C3E35",
    vignette: "rgba(38, 52, 44, 0.22)",
  },
};

const cameraTransform = (cue: ShotCue, frame: number, totalFrames: number) => {
  const p = interpolate(frame, [0, Math.max(1, totalFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = p * p * (3 - 2 * p);

  switch (cue) {
    case "push":
      return { scale: 1 + 0.065 * eased, x: 0, y: -6 * eased };
    case "pull":
      return { scale: 1.065 - 0.065 * eased, x: 0, y: 6 * (1 - eased) };
    case "pan-right":
      return { scale: 1.05, x: interpolate(eased, [0, 1], [22, -22]), y: 0 };
    case "pan-left":
      return { scale: 1.05, x: interpolate(eased, [0, 1], [-22, 22]), y: 0 };
    case "grow":
      return { scale: 1 + 0.045 * eased, x: 0, y: -16 * eased };
    case "pulse":
      return {
        scale: 1 + 0.018 * Math.sin(p * Math.PI),
        x: 0,
        y: 0,
      };
    case "still":
    default:
      return { scale: 1 + 0.012 * eased, x: 0, y: 0 };
  }
};

/**
 * 程序化手绘水彩氛围层：所有粒子均由 frame 确定性计算，保证无头渲染完全一致。
 */
const WatercolorFxLayer: React.FC<{ fx: ShotFx; glowColor: string }> = ({
  fx,
  glowColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  if (fx === "none") return null;

  if (fx === "starlight") {
    const stars = Array.from({ length: 14 }, (_, i) => {
      const baseX = (i * 137.5) % 92 + 4;
      const baseY = (i * 73.1) % 76 + 8;
      const driftY = Math.sin(t * 0.9 + i) * 10;
      const alpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.1 + i * 1.7));
      const size = 6 + (i % 4) * 4;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${baseX}%`,
            top: `calc(${baseY}% + ${driftY}px)`,
            width: size,
            height: size,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #FFF9E6 0%, #FFD27D 45%, rgba(255,210,125,0) 100%)",
            boxShadow: `0 0 ${size * 2}px ${glowColor}`,
            opacity: alpha,
          }}
        />
      );
    });
    return <AbsoluteFill style={{ pointerEvents: "none" }}>{stars}</AbsoluteFill>;
  }

  if (fx === "leaves" || fx === "petals") {
    const isPetal = fx === "petals";
    const items = Array.from({ length: 9 }, (_, i) => {
      const startX = (i * 119) % 100;
      const speedY = 18 + (i % 3) * 9;
      const yPct = ((i * 23 + t * speedY) % 110) - 8;
      const swayX = Math.sin(t * 1.4 + i * 1.3) * 28;
      const rot = Math.sin(t * 1.1 + i) * 35 + i * 25;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(${startX}% + ${swayX}px)`,
            top: `${yPct}%`,
            width: isPetal ? 14 : 18,
            height: isPetal ? 10 : 11,
            borderRadius: "70% 30% 70% 30%",
            background: isPetal
              ? "rgba(255, 218, 224, 0.58)"
              : "rgba(216, 142, 78, 0.48)",
            transform: `rotate(${rot}deg)`,
            filter: "blur(0.5px)",
          }}
        />
      );
    });
    return <AbsoluteFill style={{ pointerEvents: "none" }}>{items}</AbsoluteFill>;
  }

  if (fx === "ripples") {
    const rings = [0, 1, 2].map((i) => {
      const cycle = (t * 0.45 + i * 0.33) % 1;
      const scale = 0.3 + cycle * 2.2;
      const opacity = (1 - cycle) * 0.42;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "64%",
            width: 420,
            height: 150,
            marginLeft: -210,
            marginTop: -75,
            borderRadius: "50%",
            border: "2px solid rgba(255, 215, 130, 0.65)",
            boxShadow: `0 0 24px ${glowColor}`,
            transform: `scale(${scale})`,
            opacity,
          }}
        />
      );
    });
    return <AbsoluteFill style={{ pointerEvents: "none" }}>{rings}</AbsoluteFill>;
  }

  if (fx === "mist") {
    const offset = Math.sin(t * 0.4) * 40;
    return (
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 75%, rgba(235, 245, 245, 0.16) 0%, rgba(235, 245, 245, 0) 70%)",
          transform: `translateX(${offset}px)`,
        }}
      />
    );
  }

  return null;
};

/**
 * 水彩纸张纹理与绘本柔边暗角（赋予全片统一的手绘水彩绘本纸感）
 */
const WatercolorPaperOverlay: React.FC<{ vignetteColor: string }> = ({
  vignetteColor,
}) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* 柔和纸边暗角与暖色绘本画框感 */}
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 110px 28px ${vignetteColor}, inset 0 0 18px 4px rgba(250, 244, 232, 0.18)`,
        }}
      />
      {/* SVG 冷压水彩纸微纹理 */}
      <svg
        width="100%"
        height="100%"
        style={{ opacity: 0.055, mixBlendMode: "overlay" }}
      >
        <filter id="watercolor-paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves={3}
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.45 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#watercolor-paper-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const ShotPanel: React.FC<{
  shot: ShotTiming;
  imageSrc?: string;
}> = ({ shot, imageSrc }) => {
  const frame = useCurrentFrame();
  const tone = TONES[shot.tone] ?? TONES.night;
  const cam = cameraTransform(shot.cue, frame, shot.durationInFrames);

  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [Math.max(0, shot.durationInFrames - 8), shot.durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: tone.bg,
        opacity: Math.min(fadeIn, fadeOut),
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${cam.scale}) translate(${cam.x}px, ${cam.y}px)`,
        }}
      >
        {imageSrc ? (
          <Img
            src={staticFile(imageSrc)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: "10%",
              color: tone.ink,
              fontFamily:
                '"Noto Serif SC", "Songti SC", "Microsoft YaHei", serif',
            }}
          >
            <div style={{ fontSize: 26, opacity: 0.65, letterSpacing: 4 }}>
              SHOT {shot.id}
            </div>
            <div style={{ fontSize: 64, fontWeight: 700, marginTop: 12 }}>
              {shot.label}
            </div>
            <div
              style={{
                fontSize: 28,
                opacity: 0.8,
                marginTop: 20,
                maxWidth: 1100,
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              {shot.note}
            </div>
          </AbsoluteFill>
        )}

        <WatercolorFxLayer fx={shot.fx} glowColor={tone.glow} />
      </AbsoluteFill>

      {/* 底部字幕柔化衬底渐变，提升水彩亮部画面的字幕可读性 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "22%",
          background:
            "linear-gradient(180deg, rgba(8, 14, 18, 0) 0%, rgba(8, 14, 18, 0.46) 100%)",
          pointerEvents: "none",
        }}
      />

      <WatercolorPaperOverlay vignetteColor={tone.vignette} />
    </AbsoluteFill>
  );
};

const StorybookSubtitle: React.FC<{
  text: string;
  speaker: string;
}> = ({ text, speaker }) => {
  const meta = SPEAKERS[speaker] ?? {
    name: speaker,
    accent: "#FFC978",
    showPrefix: speaker !== "narrator",
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 52,
        display: "flex",
        justifyContent: "center",
        padding: "0 64px",
        fontFamily:
          '"Noto Serif SC", "Source Han Serif SC", "PingFang SC", "Microsoft YaHei", serif',
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          padding: "14px 34px",
          borderRadius: 14,
          background: "rgba(12, 20, 26, 0.58)",
          backdropFilter: "blur(6px)",
          color: "#FFFDF9",
          fontSize: 42,
          lineHeight: 1.48,
          textAlign: "center",
          letterSpacing: 1.2,
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.72)",
          borderLeft: `5px solid ${meta.accent}`,
          boxShadow: "0 8px 28px rgba(0, 0, 0, 0.25)",
        }}
      >
        {meta.showPrefix ? (
          <span
            style={{
              color: meta.accent,
              fontWeight: 700,
              marginRight: 8,
            }}
          >
            {meta.name}：
          </span>
        ) : null}
        {text}
      </div>
    </div>
  );
};

const useStoryboardImages = (): Map<string, string> =>
  useMemo(() => {
    const map = new Map<string, string>();
    const prefix = `${STORY_SLUG}/images/`;
    for (const file of getStaticFiles()) {
      const name = file.name.replace(/\\/g, "/");
      if (!name.startsWith(prefix)) continue;
      const base = name.slice(prefix.length);
      const match = /^shot-(\d{2,3})\.(webp|png|jpe?g)$/i.exec(base);
      if (match && !map.has(match[1])) {
        map.set(match[1], name);
      }
    }
    return map;
  }, []);

export const WatercolorStoryVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const storyboard = useStoryboardImages();

  const activeLine = TIMELINE.flatMap((shot) =>
    shot.lines.map((line) => {
      const start = shot.fromFrame + Math.round(line.atSec * FPS);
      const end = start + Math.round(line.durSec * FPS);
      return { start, end, line };
    }),
  ).find((item) => frame >= item.start && frame < item.end);

  const subtitleOpacity = activeLine
    ? interpolate(
        frame,
        [
          activeLine.start,
          activeLine.start + 5,
          Math.max(activeLine.start + 5, activeLine.end - 5),
          activeLine.end,
        ],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1419" }}>
      {TIMELINE.map((shot) => (
        <Sequence
          key={shot.id}
          from={shot.fromFrame}
          durationInFrames={shot.durationInFrames}
          name={`Shot ${shot.id} · ${shot.label}`}
        >
          <ShotPanel shot={shot} imageSrc={storyboard.get(shot.id)} />
        </Sequence>
      ))}

      {TIMELINE.flatMap((shot) =>
        shot.lines.map((line) => (
          <Sequence
            key={`${shot.id}-${line.id}`}
            from={shot.fromFrame + Math.round(line.atSec * FPS)}
            durationInFrames={Math.max(1, Math.round(line.durSec * FPS))}
            name={`Audio ${line.id}`}
          >
            <Audio src={staticFile(line.file)} />
          </Sequence>
        )),
      )}

      {activeLine ? (
        <AbsoluteFill style={{ opacity: subtitleOpacity }}>
          <StorybookSubtitle
            text={activeLine.line.text}
            speaker={activeLine.line.speaker}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
```
