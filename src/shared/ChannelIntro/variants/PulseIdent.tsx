import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import {
  CentreGlow,
  Grain,
  HudFrame,
  KineticWord,
  OpticsRing,
  RippleRings,
  Starfield,
  Waveform,
} from "../primitives";
import {
  EASING_CURVES,
  fadeWindow,
  hexToRgba,
  impactShake,
  pzoom,
  seg,
} from "../motion";
import type { IdentSceneProps } from "../types";

/**
 * PULSE — compact alternative ident (canonical 72f / 60fps).
 * One heartbeat on an oscilloscope, concentric signal rings, snap-in wordmark.
 * Registered as a second variant to prove the opener is replaceable.
 */
export const PulseIdent: FC<IdentSceneProps> = ({
  f,
  frame,
  fps,
  width,
  height,
  canonicalFrames,
  durationInFrames,
  theme,
  cfg,
  presetLabel,
}) => {
  const irisStart = canonicalFrames * 0.9;
  const shake = impactShake(f, 10, 7);
  const cameraZoom = pzoom(f, 0, canonicalFrames, 1, 1.035);
  const slit = seg(f, 24, 38, -width * 0.6, width * 0.6, EASING_CURVES.whipInOut);
  const slitOpacity = fadeWindow(f, 24, 42, 3, 6);
  const lockScale =
    pzoom(f, 16, 36, 0.8, 1) *
    seg(f, irisStart, irisStart + 8, 1, 0.965, EASING_CURVES.whipInOut);
  const taglineOpacity = fadeWindow(f, 30, canonicalFrames - 3, 6, 6);
  const baselineGrow = seg(f, 8, 24, 0, 1, EASING_CURVES.expoOut);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `translate(${shake.x}px, ${shake.y}px) scale(${cameraZoom})` }}
      >
        <CentreGlow f={f} theme={theme} hit={10} intensity={1.4} />
        <Starfield f={f} width={width} height={height} accent={theme.accent} hit={10} count={70} />
        <RippleRings
          f={f}
          width={width}
          height={height}
          theme={theme}
          hit={10}
          implodeAt={44}
        />
        <OpticsRing
          f={f}
          width={width}
          height={height}
          theme={theme}
          start={20}
          end={canonicalFrames - 2}
        />
        <Waveform f={f} width={width} height={height} theme={theme} start={8} />

        {/* Baseline draw-on */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: width * 0.62 * baselineGrow,
            height: 2,
            transform: "translate(-50%, -50%)",
            background: `linear-gradient(90deg, transparent, ${hexToRgba(theme.accent, 0.9)}, transparent)`,
            boxShadow: `0 0 20px ${hexToRgba(theme.accent, 0.6)}`,
          }}
        />

        {/* Whip-pan slit: secondary action that wipes the mark in */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: 90,
            height: "100%",
            opacity: slitOpacity,
            transform: `translateX(calc(-50% + ${slit}px)) skewX(-12deg)`,
            background: `linear-gradient(90deg, transparent, ${hexToRgba(theme.accent, 0.18)}, ${hexToRgba("#FFFFFF", 0.28)}, transparent)`,
            mixBlendMode: "screen",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "100%",
            transform: `translate(-50%, -50%) scale(${lockScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: theme.monoFont,
              fontSize: 15,
              letterSpacing: "0.42em",
              color: hexToRgba(theme.accent, 0.85),
              marginBottom: 22,
              opacity: fadeWindow(f, 16, canonicalFrames - 2, 6, 6),
              whiteSpace: "nowrap",
            }}
          >
            {cfg.latinName}
          </div>
          <KineticWord
            text={cfg.displayName}
            f={f}
            fps={fps}
            start={16}
            stagger={2.2}
            theme={theme}
            fontSize={Math.min(146, width * 0.078)}
            letterSpacing={0}
          />
          <div
            style={{
              marginTop: 26,
              fontFamily: theme.cnFont,
              fontSize: 21,
              letterSpacing: "0.24em",
              color: hexToRgba(theme.ink, 0.78),
              opacity: taglineOpacity,
              whiteSpace: "nowrap",
            }}
          >
            {cfg.tagline}
          </div>
        </div>

        <Grain f={f} id="pulse" />
      </AbsoluteFill>

      {cfg.showHud ? (
        <HudFrame
          f={f}
          frame={frame}
          fps={fps}
          durationInFrames={durationInFrames}
          canonicalFrames={canonicalFrames}
          theme={theme}
          cfg={cfg}
          presetLabel={presetLabel}
          end={irisStart}
        />
      ) : null}
    </AbsoluteFill>
  );
};
