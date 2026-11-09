import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // =========================================================================
  // PHASE 1: Disney Squash & Stretch Drop Impact (Frames 0 - 36 | 0.0s - 0.6s)
  // Impact happens at exactly frame 24 (0.40s) synced with audio sub-drop!
  // =========================================================================
  const dropY = interpolate(
    frame,
    [0, 24, 38, 52],
    [-620, 160, -40, 0],
    {
      easing: [
        Easing.bezier(0.55, 0.0, 0.9, 0.4),
        Easing.bezier(0.15, 0.85, 0.35, 1.0),
        Easing.spring({ damping: 14 }),
      ],
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Squash & Stretch deformation on X and Y axes
  const ballScaleX = interpolate(
    frame,
    [0, 20, 24, 28, 40, 52],
    [0.8, 0.52, 2.35, 0.72, 1.12, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ballScaleY = interpolate(
    frame,
    [0, 20, 24, 28, 40, 52],
    [1.2, 1.85, 0.32, 1.45, 0.9, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Camera shake on impact at frame 24, 90, 180
  const getShake = (hitFrame: number, amp: number) => {
    const dt = frame - hitFrame;
    if (dt < 0 || dt > 18) return { x: 0, y: 0 };
    const decay = Math.exp(-dt * 0.25);
    return {
      x: Math.sin(dt * 2.8) * amp * decay,
      y: Math.cos(dt * 3.5) * amp * decay,
    };
  };
  const s1 = getShake(24, 24);
  const s2 = getShake(90, 18);
  const s3 = getShake(180, 28);
  const shakeX = s1.x + s2.x + s3.x;
  const shakeY = s1.y + s2.y + s3.y;

  // Floor Shockwave Ring at frame 24
  const shockProgress = interpolate(frame, [24, 58], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // =========================================================================
  // PHASE 2: Gooey Metaball Liquid Mitosis (Frames 45 - 150 | 0.75s - 2.5s)
  // =========================================================================
  const metaballExpand = spring({
    frame: frame - 42,
    fps,
    config: { damping: 11, stiffness: 110, mass: 0.9 },
  });

  const metaballBurst = spring({
    frame: frame - 90,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.7 },
  });

  // =========================================================================
  // PHASE 3: Staggered Kinetic Typography Slam (Frames 90 - 270 | 1.5s - 4.5s)
  // =========================================================================
  const isInvertedFlash = frame >= 180 && frame <= 186;
  const phase3Active = frame >= 180;

  const title1 = "KINETIC";
  const title2 = "ARCHITECT";

  // =========================================================================
  // PHASE 4: Iris Wipe Match-Cut Transition (Frames 248 - 270 | 4.13s - 4.5s)
  // =========================================================================
  const irisScale = interpolate(frame, [246, 270], [0, 140], {
    easing: Easing.bezier(0.7, 0, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: isInvertedFlash ? "#F4F1EA" : "#08080B",
        color: isInvertedFlash ? "#08080B" : "#FFFFFF",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* SVG Filter Definition for True Liquid Gooey Metaballs */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="gooey-metaball">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 32 -13"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Architectural Background Grid & Radial Concentric Guides */}
      <svg
        viewBox="-960 -540 1920 1080"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: frame >= 24 ? 0.22 : 0.05,
        }}
      >
        <line x1="-960" y1="200" x2="960" y2="200" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" />
        <line x1="0" y1="-540" x2="0" y2="540" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" />
        <circle
          cx="0"
          cy="0"
          r={interpolate(metaballBurst, [0, 1], [60, 420])}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="16 12"
          transform={`rotate(${frame * 0.6})`}
        />
        <circle
          cx="0"
          cy="0"
          r={interpolate(metaballBurst, [0, 1], [20, 620])}
          fill="none"
          stroke="#FF3B00"
          strokeWidth="1.5"
          opacity={0.6}
        />
      </svg>

      {/* Impact Floor Shockwave & Particle Sparks (Frames 24 - 60) */}
      {frame >= 24 && frame <= 65 && (
        <svg
          viewBox="-960 -540 1920 1080"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <ellipse
            cx="0"
            cy="200"
            rx={shockProgress * 680}
            ry={shockProgress * 120}
            fill="none"
            stroke="#FF3B00"
            strokeWidth={interpolate(shockProgress, [0, 1], [12, 0.5])}
            opacity={1 - shockProgress}
          />
          <ellipse
            cx="0"
            cy="200"
            rx={shockProgress * 420}
            ry={shockProgress * 70}
            fill="none"
            stroke="#E5FF00"
            strokeWidth={interpolate(shockProgress, [0, 1], [6, 0.5])}
            opacity={1 - shockProgress}
          />
          {/* 14 Impact Sparks */}
          {Array.from({ length: 14 }).map((_, i) => {
            const angle = -Math.PI + (i / 13) * Math.PI;
            const dist = shockProgress * (220 + (i % 3) * 140);
            const px = Math.cos(angle) * dist;
            const py = 200 + Math.sin(angle) * dist * 0.65 + shockProgress * shockProgress * 180;
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={interpolate(shockProgress, [0, 1], [7, 0])}
                fill={i % 2 === 0 ? "#FF3B00" : "#E5FF00"}
              />
            );
          })}
        </svg>
      )}

      {/* Liquid Gooey Metaball Cluster (Frames 0 - 190) */}
      {frame < 210 && (
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            filter: "url(#gooey-metaball)",
            opacity: interpolate(frame, [175, 200], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {/* Core Singularity Sphere with Squash & Stretch */}
          <div
            style={{
              position: "absolute",
              width: 96,
              height: 96,
              borderRadius: "50%",
              backgroundColor: frame >= 90 ? "#FF3B00" : "#FFFFFF",
              transform: `translateY(${dropY}px) scale(${ballScaleX * interpolate(metaballBurst, [0, 1], [1, 0.65])}, ${ballScaleY * interpolate(metaballBurst, [0, 1], [1, 0.65])})`,
            }}
          />

          {/* 6 Orbiting Liquid Droplets splitting out from the core */}
          {Array.from({ length: 6 }).map((_, i) => {
            const baseAngle = (i * Math.PI * 2) / 6 + frame * 0.045;
            const radius =
              metaballExpand * 105 * (1 - metaballBurst * 0.2) +
              metaballBurst * 260 +
              Math.sin(frame * 0.12 + i) * 28;
            const x = Math.cos(baseAngle) * radius;
            const y = Math.sin(baseAngle) * radius;
            const size = 56 + (i % 2) * 18;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  backgroundColor: i % 2 === 0 ? "#FF3B00" : "#FFFFFF",
                  transform: `translate(${x}px, ${y}px) scale(${metaballExpand})`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Staggered Per-Character Typography Reveal (Frames 88 - 270) */}
      {frame >= 86 && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Top Technical Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "6px 20px",
              borderRadius: 999,
              backgroundColor: phase3Active ? "#FF3B00" : "rgba(255, 59, 0, 0.16)",
              border: "1.5px solid #FF3B00",
              marginBottom: 14,
              transform: `scale(${spring({
                frame: frame - 88,
                fps,
                config: { damping: 12, stiffness: 160 },
              })})`,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: phase3Active ? "#FFFFFF" : "#E5FF00",
              }}
            />
            <span
              style={{
                fontFamily: "'SF Mono', Consolas, monospace",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.28em",
                color: "#FFFFFF",
              }}
            >
              {phase3Active ? "ACT I // THE SINGULARITY AWAKENS" : "PHYSICS • ELASTICITY • CRAFT"}
            </span>
          </div>

          {/* Line 1: KINETIC (Per-character masked spring) */}
          <div
            style={{
              display: "flex",
              overflow: "hidden",
              padding: "4px 16px",
            }}
          >
            {title1.split("").map((char, idx) => {
              const charSpring = spring({
                frame: frame - 90 - idx * 3,
                fps,
                config: { damping: 11, stiffness: 180, mass: 0.6 },
              });
              const yOffset = interpolate(charSpring, [0, 1], [140, 0]);
              const rot = interpolate(charSpring, [0, 1], [18, 0]);
              // At frame 180 slam, add a horizontal kinetic slice shift
              const slamShift = phase3Active
                ? interpolate(
                    spring({ frame: frame - 180, fps, config: { damping: 12, stiffness: 200 } }),
                    [0, 0.5, 1],
                    [0, (idx - 3) * 14, (idx - 3) * 4]
                  )
                : 0;

              return (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    fontSize: 138,
                    fontWeight: 950,
                    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                    lineHeight: 0.92,
                    letterSpacing: "-0.03em",
                    transform: `translateY(${yOffset}px) translateX(${slamShift}px) rotate(${rot}deg)`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* Line 2: ARCHITECT (Outlined -> Solid Neon Yellow/Orange on Slam) */}
          <div
            style={{
              display: "flex",
              overflow: "hidden",
              padding: "4px 16px",
            }}
          >
            {title2.split("").map((char, idx) => {
              const charSpring = spring({
                frame: frame - 102 - idx * 3,
                fps,
                config: { damping: 12, stiffness: 170, mass: 0.65 },
              });
              const yOffset = interpolate(charSpring, [0, 1], [-140, 0]);
              return (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    fontSize: 138,
                    fontWeight: 950,
                    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                    lineHeight: 0.92,
                    letterSpacing: "-0.03em",
                    color: phase3Active ? "#E5FF00" : "transparent",
                    WebkitTextStroke: phase3Active
                      ? "none"
                      : isInvertedFlash
                        ? "2.5px #08080B"
                        : "2.5px #FFFFFF",
                    transform: `translateY(${yOffset}px)`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* Bottom Subtitle Bar appearing at Frame 180 Slam */}
          {frame >= 180 && (
            <div
              style={{
                marginTop: 22,
                display: "flex",
                alignItems: "center",
                gap: 24,
                fontFamily: "'SF Mono', Consolas, monospace",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.22em",
                color: isInvertedFlash ? "#08080B" : "rgba(255,255,255,0.8)",
                transform: `scale(${spring({
                  frame: frame - 180,
                  fps,
                  config: { damping: 14, stiffness: 180 },
                })})`,
              }}
            >
              <span style={{ color: "#FF3B00" }}>[ ALEX VANCE ]</span>
              <span>—</span>
              <span>PRINCIPAL MOTION DESIGNER</span>
              <span>—</span>
              <span style={{ color: "#E5FF00" }}>60 FPS NATIVE</span>
            </div>
          )}
        </div>
      )}

      {/* Match-Cut Expanding Iris Circle to Transition to Scene 2 */}
      {frame >= 246 && (
        <div
          style={{
            position: "absolute",
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "#F4F1EA",
            transform: `scale(${irisScale})`,
            zIndex: 50,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
