import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import {
  CentreGlow,
  GooeyCore,
  Grain,
  HudFrame,
  KineticWord,
  MorphPrism,
  OpticsRing,
  RippleRings,
  SpectrumRays,
  Starfield,
} from "../primitives";
import {
  CLAMP,
  EASING_CURVES,
  fadeWindow,
  hexToRgba,
  impactShake,
  pzoom,
  seg,
} from "../motion";
import type { IdentSceneProps } from "../types";

/**
 * PRISM — flagship channel ident (canonical 180f / 60fps).
 *
 * Beat sheet
 *   000–016  LEADER      film leader, scan line, anticipation dot
 *   016–040  INCIDENT    white light whips in from frame left
 *   040–048  IMPACT      squash & stretch, camera shake, flash frame
 *   044–100  DISPERSION  vertex-morphed prism, six spectral bands, gooey core
 *   092–158  RETICLE     surveyor's ring closes in (perceptual zoom)
 *   100–124  RECOMBINE   spectrum implodes back into the mark
 *   108–158  LOCKUP      kinetic wordmark, tracking-out tagline, accent rule
 *   158–162  SETTLE      breath, micro-anticipation, hand-off to the iris wipe
 */
export const PrismIdent: FC<IdentSceneProps> = ({
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
  const irisFull = canonicalFrames * 0.945;
  const shake = impactShake(f, 40, 14);
  const cameraZoom = pzoom(f, 0, canonicalFrames, 1, 1.055);

  // ACT I — leader / anticipation
  const scanY = seg(f, 0, 17, 0, 100, EASING_CURVES.whipInOut);
  const scanOpacity = fadeWindow(f, 0, 18, 2, 4);
  const dotPulse = 1 + 0.35 * Math.sin(f * 0.34);
  const dotRing = seg(f, 0, 20, 0.25, 3.4, EASING_CURVES.expoOut);
  const dotOpacity = seg(f, 12, 22, 1, 0, EASING_CURVES.expoOut);

  // ACT II — incident white light
  const beamTravel = seg(f, 15, 40, 0, 1, EASING_CURVES.whipInOut);
  const beamLeft = -width * 0.42 + beamTravel * width * 0.42;
  const beamWidth = seg(f, 15, 40, width * 0.16, width * 0.56, EASING_CURVES.expoOut);
  const beamOpacity = fadeWindow(f, 14, 47, 3, 7);
  const steadyRayGrow = seg(f, 42, 62, 0.15, 1, EASING_CURVES.expoOut);
  const steadyRayOpacity =
    fadeWindow(f, 42, 116, 8, 18) * (0.66 + 0.12 * Math.sin(f * 0.18));

  // ACT II — impact squash & stretch + flash frame
  const ballX = -width * 0.42 * (1 - beamTravel);
  const ballSX = interpolate(f, [34, 40, 43, 48, 58], [1, 1, 2.45, 0.74, 1], CLAMP);
  const ballSY = interpolate(f, [34, 40, 43, 48, 58], [1, 1, 0.28, 1.46, 1], CLAMP);
  const ballOpacity = fadeWindow(f, 33, 60, 3, 8);
  const flash = interpolate(f, [38, 41, 51], [0, 0.92, 0], CLAMP);

  // ACT IV — lockup
  const lockScale =
    pzoom(f, 104, 132, 0.88, 1) *
    (1 + 0.011 * Math.sin((f - 132) * 0.16)) *
    seg(f, irisStart, irisFull, 1, 0.964, EASING_CURVES.whipInOut);
  const lockOpacity = seg(f, 104, 112, 0, 1, EASING_CURVES.expoOut);
  const microOpacity = seg(f, 106, 120, 0, 1, EASING_CURVES.expoOut);
  const microTracking = seg(f, 106, 136, 0.86, 0.32, EASING_CURVES.expoOut);
  const ruleWidth = seg(f, 124, 142, 0, 1, EASING_CURVES.expoOut);
  const taglineTracking = seg(f, 128, 150, 0.52, 0.2, EASING_CURVES.expoOut);
  const footerOpacity = fadeWindow(f, 134, irisStart, 8, 8);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", overflow: "hidden" }}>
      {/* Everything below the HUD lives on the shaking camera plane. */}
      <AbsoluteFill
        style={{
          transform: `translate(${shake.x}px, ${shake.y}px) scale(${cameraZoom})`,
        }}
      >
        <CentreGlow f={f} theme={theme} hit={40} />
        <Starfield f={f} width={width} height={height} accent={theme.accent} hit={40} />
        <RippleRings f={f} width={width} height={height} theme={theme} hit={40} implodeAt={100} />
        <OpticsRing
          f={f}
          width={width}
          height={height}
          theme={theme}
          start={92}
          end={canonicalFrames * 0.88}
        />
        <SpectrumRays
          f={f}
          fps={fps}
          width={width}
          height={height}
          theme={theme}
          start={44}
          collapse={100}
        />
        <GooeyCore f={f} width={width} height={height} theme={theme} hit={40} end={100} />
        <MorphPrism f={f} width={width} height={height} theme={theme} start={44} end={100} />

        {/* Leader: scan line + breathing registration dot */}
        <AbsoluteFill style={{ opacity: scanOpacity, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: `${scanY}%`,
              left: 0,
              width: "100%",
              height: 2,
              background: `linear-gradient(90deg, transparent, ${hexToRgba(theme.accent, 0.85)}, transparent)`,
              boxShadow: `0 0 18px ${hexToRgba(theme.accent, 0.7)}`,
            }}
          />
        </AbsoluteFill>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: dotOpacity }}
        >
          <circle cx={width / 2} cy={height / 2} r={3 * dotPulse} fill={theme.ink} />
          <circle
            cx={width / 2}
            cy={height / 2}
            r={7 * dotRing}
            fill="none"
            stroke={hexToRgba(theme.accent, 0.7)}
            strokeWidth="1"
            opacity={1 / Math.max(1, dotRing)}
          />
        </svg>

        {/* Incident beam: soft halo + razor-sharp core + chromatic edges */}
        <AbsoluteFill style={{ opacity: beamOpacity, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: beamLeft,
              width: beamWidth,
              height: 46,
              transform: "translateY(-50%)",
              background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(theme.accent, 0.12)} 35%, rgba(255,255,255,0.85) 96%, #FFFFFF 100%)`,
              filter: "blur(9px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: beamLeft,
              width: beamWidth,
              height: 2,
              transform: "translateY(-50%)",
              background: "linear-gradient(90deg, transparent, #FFFFFF)",
              boxShadow: `0 -3px 12px ${hexToRgba("#00F0FF", 0.6)}, 0 3px 12px ${hexToRgba("#FF3D8A", 0.5)}`,
            }}
          />
        </AbsoluteFill>

        {/* Steady incident ray: balances the frame while the spectrum fans out */}
        <AbsoluteFill style={{ opacity: steadyRayOpacity, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: "50%",
              height: 36,
              transform: `translateY(-50%) scaleX(${steadyRayGrow})`,
              transformOrigin: "right center",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 55%, rgba(255,255,255,0.55) 100%)",
              filter: "blur(10px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: "50%",
              height: 2,
              transform: `translateY(-50%) scaleX(${steadyRayGrow})`,
              transformOrigin: "right center",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 60%, #FFFFFF 100%)",
              boxShadow: `0 0 16px ${hexToRgba("#FFFFFF", 0.45)}`,
            }}
          />
        </AbsoluteFill>

        {/* Impact projectile: squash & stretch on contact */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 34,
            height: 34,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            boxShadow: `0 0 40px 14px ${hexToRgba(theme.accent, 0.65)}`,
            opacity: ballOpacity,
            transform: `translate(calc(-50% + ${ballX}px), -50%) scale(${ballSX}, ${ballSY})`,
          }}
        />

        {/* Brand lockup */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "100%",
            opacity: lockOpacity,
            transform: `translate(-50%, -50%) scale(${lockScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: theme.monoFont,
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: `${microTracking}em`,
              color: hexToRgba(theme.ink, 0.68),
              opacity: microOpacity,
              marginBottom: 26,
              whiteSpace: "nowrap",
            }}
          >
            {cfg.latinName}
          </div>

          <KineticWord
            text={cfg.displayName}
            f={f}
            fps={fps}
            start={108}
            stagger={2.8}
            theme={theme}
            fontSize={Math.min(170, width * 0.091)}
            letterSpacing={1}
          />

          <div
            style={{
              width: Math.max(0, 470 * ruleWidth),
              height: 3,
              marginTop: 30,
              background: `linear-gradient(90deg, transparent, ${theme.accent} 22%, #FFFFFF 50%, ${theme.accent} 78%, transparent)`,
              boxShadow: `0 0 16px ${hexToRgba(theme.accent, 0.55)}`,
            }}
          />

          <div
            style={{
              marginTop: 28,
              fontFamily: theme.cnFont,
              fontSize: 24,
              fontWeight: 500,
              color: hexToRgba(theme.ink, 0.8),
              letterSpacing: `${taglineTracking}em`,
              whiteSpace: "nowrap",
            }}
          >
            {Array.from(cfg.tagline).map((ch, i) => {
              const t = seg(f, 128 + i * 1.4, 135 + i * 1.4, 0, 1, EASING_CURVES.expoOut);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    whiteSpace: "pre",
                    opacity: t,
                    transform: `translateY(${(1 - t) * 15}px)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 18,
              fontFamily: theme.monoFont,
              fontSize: 13,
              letterSpacing: "0.36em",
              color: hexToRgba(theme.accent, 0.72),
              opacity: footerOpacity,
              whiteSpace: "nowrap",
            }}
          >
            OBSERVE · UNDERSTAND · EXPLAIN
          </div>
        </div>

        <Grain f={f} id="prism" />
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: flash, pointerEvents: "none" }} />
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
