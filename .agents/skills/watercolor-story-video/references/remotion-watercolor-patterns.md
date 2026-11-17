# Remotion 混合 2D 分层水彩动画代码模板与工程规范

本文档提供 `watercolor-story-video` Skill 在阶段 0（工程初始化）与阶段 6（Remotion **混合 2D 分层关节动画**制作）的标准代码模板。

---

## 1. Remotion 铁律（防止渲染闪烁与报错）

1. **严禁使用 CSS 动画**：所有位移、缩放、旋转、透明度、关节运动与粒子动画必须由 `useCurrentFrame()` + `useVideoConfig()` + `interpolate()` / `spring()` / 确定性三角函数驱动，严禁写 CSS `transition` 或 `@keyframes`。
2. **所有 `interpolate()` 必须加 Clamp**：默认传入 `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }`。
3. **单一数据源（Single Source of Truth）**：所有镜头时长（`durSec`）、台词起始秒数（`atSec`）、音频实测时长以及 2D 分层图层定义（`layers`）统一维护在 `src/videos/<StoryName>/shots.ts`，由 `TIMELINE` 自动累加计算 `fromFrame` 与 `durationInFrames`。
4. **静态资源子目录隔离**：所有图片、分层图层与音频必须放在 `public/<story-slug>/images/`、`public/<story-slug>/images/layers/` 与 `public/<story-slug>/audio/` 下，通过 `staticFile("<story-slug>/...")` 引用。
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

## 3. 分层镜头与配音单一数据源模板：`src/videos/<StoryName>/shots.ts`

```ts
import type React from "react";

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
    accent: "rgba(255, 248, 231, 0.45)",
    showPrefix: false,
  },
  chen: {
    name: "老陈",
    accent: "#F4B860",
    showPrefix: true,
  },
};

export type AudioLine = {
  id: string;
  /** 相对 public/ 的路径，如 "story-slug/audio/s01-narr.mp3" */
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

export type LayerMotion =
  | "static"      // 干净背景层
  | "breathe"     // 角色躯干呼吸起伏
  | "swing"       // 绕关节锚点周期摆动（手臂拧螺丝、挂钟钟摆）
  | "sway"        // 风中轻柔不对称摇曳（门帘、木牌、树枝）
  | "nod"         // 倾听或微点头
  | "talk"        // 绑定说话人音频：仅在该角色说话时触发讲话律动与微点头
  | "spin-y"      // 优雅绕纵轴自转（如八音盒芭蕾舞者旋转）
  | "rotate"      // 绕锚点平面连续旋转（齿轮、风车）
  | "float"       // 轻柔悬浮飘动
  | "glow-pulse"; // 台灯/魔法微光呼吸闪烁

export type LayerSpec = {
  id: string;
  /** 相对 public/ 的图层路径（同画布对齐的 WebP 背景或带 Alpha 透明通道的 RGBA WebP/PNG 部件） */
  src: string;
  /** 叠放层级（数值越大越靠前） */
  zIndex?: number;
  /** 关节旋转/缩放锚点百分比 [x%, y%]，例如 [62, 48] */
  origin?: [number, number];
  /** 景深视差系数：远景 0.85、中景 1.0、前景 1.15 */
  parallax?: number;
  /** 动作预设 */
  motion?: LayerMotion;
  /** 运动幅度（角度 deg 或像素 px，依 motion 类型而定） */
  amplitude?: number;
  /** 运动频率倍率（默认 1.0） */
  speed?: number;
  /** 相位偏移（秒） */
  phase?: number;
  /** 绑定说话人 ID：当该角色说话时激活 talk 律动 */
  activeSpeaker?: SpeakerId;
  /** 基础透明度（默认 1.0） */
  opacity?: number;
  /** 混合模式（光晕呼吸层可用 "screen"） */
  blendMode?: React.CSSProperties["mixBlendMode"];
};

export type Shot = {
  id: string;
  label: string;
  note: string;
  durSec: number;
  tone: ShotTone;
  cue: ShotCue;
  fx: ShotFx;
  /** 可选：2D 分层关节动画图层；配置后自动启用分层舞台渲染，未配置则自动使用整图 shot-XX.webp */
  layers?: LayerSpec[];
  lines: AudioLine[];
};

export const STORY_SLUG = "story-slug";
export const FPS = 30;

export const SHOTS: Shot[] = [];

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

## 4. 混合 2D 分层手绘水彩动画主组件模板：`src/videos/<StoryName>/StoryVideo.tsx`

该组件同时支持 **2D 分层关节动画（`LayeredShotStage`）** 与 **单图运镜回退**，包含：
- **视差景深相机**（`parallax` 系数按远中前景缩放位移）
- **关节锚点动作驱动器**（呼吸 `breathe`、摆臂/钟摆 `swing`、风动 `sway`、语音同步说话微动 `talk`、舞者旋转 `spin-y`、柔光呼吸 `glow-pulse`）
- **水彩纸张肌理与绘本柔边暗角**
- **程序化水彩氛围粒子与角色色标字幕**

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
  LayerSpec,
  SPEAKERS,
  STORY_SLUG,
  ShotCue,
  ShotFx,
  ShotTiming,
  ShotTone,
  SpeakerId,
  TIMELINE,
} from "./shots";

const TONES: Record<
  ShotTone,
  { bg: string; glow: string; ink: string; vignette: string }
> = {
  night: {
    bg: "linear-gradient(180deg, #16242D 0%, #223540 58%, #2B3B3A 100%)",
    glow: "rgba(244, 184, 96, 0.38)",
    ink: "#EDF3F5",
    vignette: "rgba(12, 20, 26, 0.36)",
  },
  glow: {
    bg: "linear-gradient(180deg, #241C16 0%, #382B20 55%, #4A3828 100%)",
    glow: "rgba(255, 208, 122, 0.62)",
    ink: "#FFF4DC",
    vignette: "rgba(22, 14, 10, 0.34)",
  },
  warm: {
    bg: "linear-gradient(180deg, #2D2118 0%, #4E3824 52%, #6B4D2E 100%)",
    glow: "rgba(255, 218, 136, 0.78)",
    ink: "#FFF8EA",
    vignette: "rgba(28, 18, 10, 0.28)",
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
      return { scale: 1 + 0.05 * eased, x: 0, y: -14 * eased };
    case "pulse":
      return {
        scale: 1 + 0.02 * Math.sin(p * Math.PI),
        x: 0,
        y: 0,
      };
    case "still":
    default:
      return { scale: 1 + 0.015 * eased, x: 0, y: 0 };
  }
};

/**
 * 计算单个 2D 图层在当前帧的两级变换：
 *  1) camStyle: 以画布中心 (50%, 50%) 为基准的相机运镜与景深视差
 *  2) jointStyle: 以关节锚点 layer.origin 为基准的局部旋转/呼吸/摆动/说话微动
 * （拆成两层可彻底防止运镜缩放时头部/手臂相对身体发生坐标漂移）
 */
const computeLayerStyle = (
  layer: LayerSpec,
  localFrame: number,
  fps: number,
  cam: { scale: number; x: number; y: number },
  currentSpeaker: SpeakerId | null,
): { camStyle: React.CSSProperties; jointStyle: React.CSSProperties } => {
  const t = localFrame / fps + (layer.phase ?? 0);
  const spd = layer.speed ?? 1.0;
  const amp = layer.amplitude ?? 1.0;
  const parallax = layer.parallax ?? 1.0;
  const motion = layer.motion ?? "static";

  // 1. 相机视差映射（严格围绕画面中心缩放，保证相同 parallax 图层严丝合缝）
  const camScale = 1 + (cam.scale - 1) * parallax;
  const camX = cam.x * parallax;
  const camY = cam.y * parallax;

  // 2. 局部关节动效映射
  let tx = 0;
  let ty = 0;
  let rot = 0;
  let sx = 1;
  let sy = 1;
  let extraOpacity = layer.opacity ?? 1;

  const isSpeaking =
    Boolean(layer.activeSpeaker) && currentSpeaker === layer.activeSpeaker;

  switch (motion) {
    case "breathe": {
      const b = Math.sin(t * 1.9 * spd);
      sy = 1 + 0.008 * amp * b;
      ty += -2.5 * amp * b;
      break;
    }
    case "swing": {
      rot = Math.sin(t * 2.6 * spd) * (3.5 * amp);
      break;
    }
    case "sway": {
      rot =
        (Math.sin(t * 1.4 * spd) * 0.7 + Math.sin(t * 2.3 * spd) * 0.3) *
        (2.2 * amp);
      tx += Math.sin(t * 1.4 * spd) * (2.5 * amp);
      break;
    }
    case "nod": {
      const factor = isSpeaking ? 2.2 : 0.7;
      rot = Math.sin(t * 2.4 * spd) * (1.5 * amp * factor);
      ty += Math.sin(t * 4.8 * spd) * (1.2 * amp * factor);
      break;
    }
    case "talk": {
      if (isSpeaking) {
        // 说话期间叠加多频柔和语调点头与呼吸弹性微动
        const cadence =
          Math.sin(t * 7.5 * spd) * 0.6 + Math.sin(t * 11.2 * spd) * 0.4;
        rot = cadence * (1.8 * amp);
        ty += -Math.abs(cadence) * (2.8 * amp);
        sy = 1 + 0.009 * amp * Math.abs(cadence);
      } else {
        // 未说话时保持轻柔待机呼吸
        const idle = Math.sin(t * 1.6);
        ty += -1.4 * idle;
        rot = idle * 0.4;
      }
      break;
    }
    case "spin-y": {
      // 伪 3D 连续绕纵轴旋转（芭蕾舞者、旋转木马、花灯）
      const angle = t * 1.8 * spd;
      const cosA = Math.cos(angle);
      // 保留最小 0.14 宽度防止完全消失成零像素线
      const dir = cosA >= 0 ? 1 : -1;
      sx = dir * Math.max(0.14, Math.abs(cosA));
      ty += Math.sin(angle * 2) * (-4.5 * amp);
      break;
    }
    case "rotate": {
      rot = (t * 45 * spd) % 360;
      break;
    }
    case "float": {
      ty += Math.sin(t * 1.7 * spd) * (6 * amp);
      tx += Math.cos(t * 1.1 * spd) * (4 * amp);
      rot = Math.sin(t * 1.3 * spd) * (2 * amp);
      break;
    }
    case "glow-pulse": {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.1 * spd);
      extraOpacity = (layer.opacity ?? 0.65) * (0.6 + 0.4 * pulse);
      sx = 1 + 0.03 * amp * pulse;
      sy = 1 + 0.03 * amp * pulse;
      break;
    }
    case "static":
    default:
      break;
  }

  const origin = layer.origin ?? [50, 50];

  return {
    camStyle: {
      zIndex: layer.zIndex ?? 1,
      opacity: extraOpacity,
      mixBlendMode: layer.blendMode,
      transformOrigin: "50% 50%",
      transform: `translate(${camX.toFixed(2)}px, ${camY.toFixed(2)}px) scale(${camScale.toFixed(4)})`,
    },
    jointStyle: {
      transformOrigin: `${origin[0]}% ${origin[1]}%`,
      transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`,
    },
  };
};

const LayeredShotStage: React.FC<{
  layers: LayerSpec[];
  cam: { scale: number; x: number; y: number };
  currentSpeaker: SpeakerId | null;
}> = ({ layers, cam, currentSpeaker }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sorted = useMemo(
    () => [...layers].sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1)),
    [layers],
  );

  return (
    <AbsoluteFill style={{ isolation: "isolate", zIndex: 0 }}>
      {sorted.map((layer) => {
        const { camStyle, jointStyle } = computeLayerStyle(
          layer,
          frame,
          fps,
          cam,
          currentSpeaker,
        );
        return (
          <AbsoluteFill key={layer.id} style={camStyle}>
            <AbsoluteFill style={jointStyle}>
              <Img
                src={staticFile(layer.src)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

const WatercolorFxLayer: React.FC<{ fx: ShotFx; glowColor: string }> = ({
  fx,
  glowColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  if (fx === "none") return null;

  if (fx === "starlight") {
    const stars = Array.from({ length: 16 }, (_, i) => {
      const baseX = ((i * 137.5) % 88) + 6;
      const baseY = ((i * 73.1) % 72) + 10;
      const driftY = Math.sin(t * 0.9 + i) * 12 - t * 6;
      const alpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.7));
      const size = 7 + (i % 4) * 4;
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
              "radial-gradient(circle, #FFFDF5 0%, #FFD685 48%, rgba(255,214,133,0) 100%)",
            boxShadow: `0 0 ${size * 2.2}px ${glowColor}`,
            opacity: alpha,
          }}
        />
      );
    });
    return <AbsoluteFill style={{ pointerEvents: "none" }}>{stars}</AbsoluteFill>;
  }

  if (fx === "leaves" || fx === "petals") {
    const isPetal = fx === "petals";
    const items = Array.from({ length: 10 }, (_, i) => {
      const startX = (i * 119) % 100;
      const speedY = 14 + (i % 3) * 7;
      const yPct = ((i * 23 + t * speedY) % 112) - 8;
      const swayX = Math.sin(t * 1.3 + i * 1.3) * 26;
      const rot = Math.sin(t * 1.1 + i) * 32 + i * 25;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(${startX}% + ${swayX}px)`,
            top: `${yPct}%`,
            width: isPetal ? 13 : 16,
            height: isPetal ? 9 : 10,
            borderRadius: "70% 30% 70% 30%",
            background: isPetal
              ? "rgba(255, 228, 178, 0.55)"
              : "rgba(232, 168, 92, 0.48)",
            boxShadow: `0 0 10px ${glowColor}`,
            transform: `rotate(${rot}deg)`,
            filter: "blur(0.4px)",
          }}
        />
      );
    });
    return <AbsoluteFill style={{ pointerEvents: "none" }}>{items}</AbsoluteFill>;
  }

  if (fx === "mist") {
    const offset = Math.sin(t * 0.45) * 36;
    const raindrops = Array.from({ length: 18 }, (_, i) => {
      const rx = (i * 97) % 100;
      const ry = ((i * 31 + t * 85) % 115) - 10;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${rx}%`,
            top: `${ry}%`,
            width: 1.5,
            height: 28,
            background:
              "linear-gradient(180deg, rgba(220,235,245,0) 0%, rgba(220,235,245,0.32) 100%)",
            transform: "rotate(6deg)",
          }}
        />
      );
    });
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {raindrops}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 78%, rgba(235, 245, 248, 0.14) 0%, rgba(235, 245, 248, 0) 70%)",
            transform: `translateX(${offset}px)`,
          }}
        />
      </AbsoluteFill>
    );
  }

  return null;
};

const WatercolorPaperOverlay: React.FC<{ vignetteColor: string }> = ({
  vignetteColor,
}) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 110px 28px ${vignetteColor}, inset 0 0 18px 4px rgba(250, 244, 232, 0.18)`,
        }}
      />
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
  index: number;
  imageSrc?: string;
  currentSpeaker: SpeakerId | null;
}> = ({ shot, index, imageSrc, currentSpeaker }) => {
  const frame = useCurrentFrame();
  const tone = TONES[shot.tone] ?? TONES.glow;
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

  const hasLayers = Boolean(shot.layers && shot.layers.length > 0);

  return (
    <AbsoluteFill
      style={{
        background: tone.bg,
        opacity: Math.min(fadeIn, fadeOut),
        isolation: "isolate",
      }}
    >
      {hasLayers && shot.layers ? (
        <LayeredShotStage
          layers={shot.layers}
          cam={cam}
          currentSpeaker={currentSpeaker}
        />
      ) : (
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
          ) : null}
        </AbsoluteFill>
      )}

      <WatercolorFxLayer fx={shot.fx} glowColor={tone.glow} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "24%",
          background:
            "linear-gradient(180deg, rgba(10, 14, 18, 0) 0%, rgba(10, 14, 18, 0.52) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: "4%",
          top: "4%",
          fontSize: 30,
          fontWeight: 700,
          color: "#FFFDF9",
          opacity: 0.22,
          letterSpacing: 2,
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          fontFamily: '"Noto Serif SC", "Microsoft YaHei", serif',
        }}
      >
        {String(index + 1).padStart(2, "0")} · {shot.label}
      </div>

      <WatercolorPaperOverlay vignetteColor={tone.vignette} />
    </AbsoluteFill>
  );
};

const StorybookSubtitle: React.FC<{
  text: string;
  speaker: SpeakerId;
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
        bottom: 48,
        display: "flex",
        justifyContent: "center",
        padding: "0 64px",
        fontFamily:
          '"Noto Serif SC", "Source Han Serif SC", "PingFang SC", "Microsoft YaHei", serif',
      }}
    >
      <div
        style={{
          maxWidth: 1420,
          padding: "14px 34px",
          borderRadius: 14,
          background: "rgba(14, 18, 22, 0.62)",
          backdropFilter: "blur(6px)",
          color: "#FFFDF9",
          fontSize: 40,
          lineHeight: 1.48,
          textAlign: "center",
          letterSpacing: 1.1,
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.75)",
          borderLeft: `5px solid ${meta.accent}`,
          boxShadow: "0 8px 28px rgba(0, 0, 0, 0.28)",
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

  const currentSpeaker = activeLine ? activeLine.line.speaker : null;

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
    <AbsoluteFill style={{ backgroundColor: "#0E1418" }}>
      {TIMELINE.map((shot, idx) => (
        <Sequence
          key={shot.id}
          from={shot.fromFrame}
          durationInFrames={shot.durationInFrames}
          name={`Shot ${shot.id} · ${shot.label}`}
        >
          <ShotPanel
            shot={shot}
            index={idx}
            imageSrc={storyboard.get(shot.id)}
            currentSpeaker={currentSpeaker}
          />
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
        <AbsoluteFill style={{ opacity: subtitleOpacity, zIndex: 20 }}>
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
