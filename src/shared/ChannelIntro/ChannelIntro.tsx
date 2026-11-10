import type { FC } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CLAMP, EASING_CURVES, hexToRgba, seg } from "./motion";
import { DEFAULT_BRAND, resolveTheme } from "./theme";
import { getIntroPreset } from "./registry";
import type {
  ChannelIntroProps,
  IdentSceneProps,
  IntroPreset,
  ResolvedIntroConfig,
} from "./types";

const resolveConfig = (
  props: ChannelIntroProps,
  preset: IntroPreset,
): ResolvedIntroConfig => ({
  displayName: props.displayName ?? DEFAULT_BRAND.displayName,
  latinName: props.latinName ?? DEFAULT_BRAND.latinName,
  tagline: props.tagline ?? DEFAULT_BRAND.tagline,
  accent: props.accent ?? DEFAULT_BRAND.accent,
  variant: preset.id,
  durationInFrames: Math.max(
    1,
    Math.round(props.durationInFrames ?? preset.defaultDurationInFrames),
  ),
  startFrame: Math.round(props.startFrame ?? 0),
  background: props.background ?? "#06080E",
  transitionOut: props.transitionOut ?? true,
  showHud: props.showHud ?? true,
  audioSrc: props.audioSrc,
  zIndex: props.zIndex ?? 40,
});

/**
 * Drop-in channel ident. Add ONE line at the root of any video:
 *
 *   <ChannelIntro />                              // default PRISM ident
 *   <ChannelIntro variant="pulse" />              // short-form alternative
 *   <ChannelIntro displayName="新频道名" />        // rebrand in one place
 *
 * It renders from `startFrame`, is invisible outside its own window, and ends
 * with a dip-to-white iris that reveals whatever video sits underneath.
 * Replace the design by adding a variant in `registry.ts` — call sites stay.
 */
export const ChannelIntro: FC<ChannelIntroProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const preset = getIntroPreset(props.variant ?? "prism");
  const cfg = resolveConfig(props, preset);
  const local = frame - cfg.startFrame;

  if (local < 0 || local >= cfg.durationInFrames) return null;

  const canonical = preset.canonicalFrames;
  const f = (local / cfg.durationInFrames) * canonical;
  const irisStart = canonical * 0.9;
  const irisFull = canonical * 0.945;

  const theme = resolveTheme(cfg);
  const maxR = Math.sqrt(width * width + height * height) * 0.72;
  const irisProgress = seg(f, irisStart, irisFull, 0, 1, EASING_CURVES.expoOut);
  const whiteOpacity = cfg.transitionOut
    ? seg(f, irisFull, canonical, 1, 0, EASING_CURVES.expoOut)
    : 0;
  const contentOpacity = cfg.transitionOut
    ? f >= irisFull
      ? 0
      : 1
    : seg(f, canonical - 10, canonical, 1, 0);

  const PresetComponent = preset.component;
  const sceneProps: IdentSceneProps = {
    f,
    frame: local,
    fps,
    width,
    height,
    canonicalFrames: canonical,
    durationInFrames: cfg.durationInFrames,
    theme,
    cfg,
    presetLabel: preset.label,
  };

  return (
    <AbsoluteFill
      style={{
        zIndex: cfg.zIndex,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ opacity: contentOpacity }}>
        {cfg.background === "transparent" ? null : (
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 47%, ${hexToRgba(
                "#16203C",
                0.72,
              )} 0%, ${cfg.background} 58%, ${theme.void} 100%)`,
            }}
          />
        )}
        <PresetComponent {...sceneProps} />
      </AbsoluteFill>

      {cfg.transitionOut ? (
        <AbsoluteFill
          style={{
            backgroundColor: "#FFFFFF",
            opacity: whiteOpacity,
            clipPath: `circle(${maxR * irisProgress}px at 50% 50%)`,
          }}
        />
      ) : null}

      {cfg.audioSrc ? (
        <Sequence from={cfg.startFrame} durationInFrames={cfg.durationInFrames}>
          <Audio
            src={cfg.audioSrc}
            volume={(af) =>
              interpolate(
                af,
                [0, 5, cfg.durationInFrames - 14, cfg.durationInFrames],
                [0, 1, 1, 0],
                CLAMP,
              )
            }
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

