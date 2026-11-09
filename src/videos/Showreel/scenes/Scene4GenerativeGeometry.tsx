import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene4GenerativeGeometry: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Morph cycles every 60 frames (1.0s = 2 beats at 120BPM)
  const morphIndex = Math.floor(frame / 60) % 4;
  const morphLocal = frame % 60;
  const morphProgress = spring({
    frame: morphLocal,
    fps,
    config: { damping: 11, stiffness: 150, mass: 0.7 },
  });

  // RGB Chromatic Aberration spike on every morph beat
  const rgbSplit = interpolate(morphLocal, [0, 5, 28], [18, 22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sidechain visual pulse synced with 120BPM beat (every 30 frames)
  const beatLocal = frame % 30;
  const beatPump = interpolate(beatLocal, [0, 4, 29], [1.08, 1.12, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // =========================================================================
  // 1. TRUE POLYGON VERTEX MORPHING ENGINE (48 polar vertices)
  // =========================================================================
  const numVertices = 48;
  const getShapeRadius = (shapeType: number, theta: number): number => {
    switch (shapeType % 4) {
      case 0: // Pure Harmonic Circle + subtle ripple
        return 210 + Math.sin(theta * 12) * 8;
      case 1: // 8-Pointed Supernova Starburst
        return 175 + Math.cos(theta * 8) * 95;
      case 2: // Sharp Hexagonal Crystal
        return 210 / Math.cos(((theta + Math.PI / 6) % (Math.PI / 3)) - Math.PI / 6) * 0.85;
      case 3: // 4-Lobe Flower of Life / Harmonic Rose
        return 155 + Math.sin(theta * 4) * 105;
      default:
        return 200;
    }
  };

  const buildMorphedPath = (rotationOffset: number, scaleMult: number) => {
    const pts: string[] = [];
    for (let i = 0; i < numVertices; i++) {
      const theta = (i / numVertices) * Math.PI * 2;
      const rFrom = getShapeRadius(morphIndex, theta);
      const rTo = getShapeRadius(morphIndex + 1, theta);
      const r = interpolate(morphProgress, [0, 1], [rFrom, rTo]) * scaleMult;
      const x = Math.cos(theta + rotationOffset) * r;
      const y = Math.sin(theta + rotationOffset) * r;
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ") + " Z";
  };

  const mainPath = buildMorphedPath(frame * 0.015, 1.0);
  const innerPath = buildMorphedPath(-frame * 0.025, 0.62);

  const shapeNames = [
    "HARMONIC TORUS // STATE 01",
    "OCTA-STARBURST // STATE 02",
    "HEXAGONAL LATTICE // STATE 03",
    "QUAD-ROSE RESONATOR // STATE 04",
  ];

  // =========================================================================
  // 2. 20-LAYER PARAMETRIC MOIRÉ RIBBON WAVES
  // =========================================================================
  const ribbons = Array.from({ length: 20 }).map((_, idx) => {
    const yOffset = (idx - 9.5) * 26;
    const phase = frame * 0.06 + idx * 0.22;
    const y1 = yOffset + Math.sin(phase) * 140;
    const y2 = yOffset + Math.cos(phase * 1.3) * 180;
    const y3 = yOffset + Math.sin(phase * 0.8 + 2) * 140;
    const d = `M -1000,${yOffset} C -350,${y1} 350,${y2} 1000,${y3}`;
    const strokeColor =
      idx % 3 === 0 ? "#CCFF00" : idx % 3 === 1 ? "#00F0FF" : "#FF0055";
    return { d, strokeColor, opacity: 0.18 + (idx / 20) * 0.25 };
  });

  // Diagonal Wipe Transition at end (Frames 275 - 300)
  const wipeProgress = interpolate(frame, [275, 300], [0, 1], {
    easing: Easing.bezier(0.7, 0, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#06040C",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background Parametric Moiré Wave Field */}
      <svg
        viewBox="-960 -540 1920 1080"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {ribbons.map((r, i) => (
          <path
            key={i}
            d={r.d}
            fill="none"
            stroke={r.strokeColor}
            strokeWidth="1.8"
            opacity={r.opacity}
          />
        ))}
      </svg>

      {/* Center Vertex-Morphing Sacred Geometry with RGB Chromatic Aberration */}
      <svg
        viewBox="-450 -450 900 900"
        style={{
          position: "absolute",
          width: 860,
          height: 860,
          transform: `scale(${beatPump})`,
          overflow: "visible",
        }}
      >
        {/* Red/Magenta Channel Left Shift */}
        <path
          d={mainPath}
          fill="none"
          stroke="#FF0055"
          strokeWidth="5"
          transform={`translate(${-rgbSplit}, ${-rgbSplit * 0.4})`}
          style={{ mixBlendMode: "screen" }}
        />

        {/* Cyan Channel Right Shift */}
        <path
          d={mainPath}
          fill="none"
          stroke="#00F0FF"
          strokeWidth="5"
          transform={`translate(${rgbSplit}, ${rgbSplit * 0.4})`}
          style={{ mixBlendMode: "screen" }}
        />

        {/* Acid Lime Core Channel */}
        <path
          d={mainPath}
          fill="rgba(204, 255, 0, 0.06)"
          stroke="#CCFF00"
          strokeWidth="3.5"
        />

        {/* Inner Counter-Rotating Morphed Geometry */}
        <path
          d={innerPath}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeDasharray="10 8"
        />

        {/* Orbiting Vertex Nodes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4 + frame * 0.03;
          const rad = 310 + Math.sin(frame * 0.1 + i) * 20;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * rad}
              cy={Math.sin(a) * rad}
              r="6"
              fill={i % 2 === 0 ? "#CCFF00" : "#00F0FF"}
            />
          );
        })}
      </svg>

      {/* Center Editorial Typography with Chromatic Split */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: "6px 20px",
            borderRadius: 999,
            backgroundColor: "rgba(6, 4, 12, 0.85)",
            border: "1.5px solid #CCFF00",
            fontFamily: "'SF Mono', monospace",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.26em",
            color: "#CCFF00",
            marginBottom: 18,
          }}
        >
          {shapeNames[morphIndex]}
        </div>

        <div style={{ position: "relative" }}>
          {/* RGB Ghost Layer Left */}
          {rgbSplit > 1 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                fontSize: 106,
                fontWeight: 950,
                lineHeight: 0.94,
                letterSpacing: "-0.03em",
                fontFamily: "system-ui, sans-serif",
                color: "#FF0055",
                transform: `translateX(${-rgbSplit * 0.8}px)`,
                opacity: 0.75,
                mixBlendMode: "screen",
              }}
            >
              PROCEDURAL
              <br />
              MORPHOLOGY
            </div>
          )}

          {/* Main Crisp Headline */}
          <div
            style={{
              position: "relative",
              fontSize: 106,
              fontWeight: 950,
              lineHeight: 0.94,
              letterSpacing: "-0.03em",
              fontFamily: "system-ui, sans-serif",
              color: "#FFFFFF",
              textShadow: "0 15px 40px rgba(0,0,0,0.9)",
            }}
          >
            PROCEDURAL
            <br />
            <span style={{ color: "#CCFF00" }}>MORPHOLOGY</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            padding: "8px 24px",
            borderRadius: 12,
            backgroundColor: "rgba(6, 4, 12, 0.8)",
            border: "1px solid rgba(255,255,255,0.2)",
            fontFamily: "'SF Mono', monospace",
            fontSize: 14,
            color: "#00F0FF",
            letterSpacing: "0.2em",
          }}
        >
          48-VERTEX POLAR INTERPOLATION // CHROMATIC SHADER
        </div>
      </div>

      {/* High-Energy Acid Yellow Wipe into Act V Rapid Showcase */}
      {wipeProgress > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#FFE600",
            transform: `translateY(${interpolate(wipeProgress, [0, 1], [1080, 0])}px)`,
            zIndex: 60,
          }}
        />
      )}
    </div>
  );
};
