import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

import type { ShotFxKind } from "./choreography";

const seeded = (index: number, salt: number): number => {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const Lantern: React.FC<{ frame: number }> = ({ frame }) => {
  const swing =
    Math.sin(frame * 0.09) * 4 + Math.sin(frame * 0.17) * 2;
  return (
    <div
      style={{
        position: "absolute",
        top: "5%",
        right: "7%",
        width: 90,
        height: 150,
        transformOrigin: "50% 0%",
        transform: `rotate(${swing}deg)`,
        zIndex: 25,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 0,
          width: 30,
          height: 18,
          backgroundColor: "#1C1A17",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 5,
          top: 18,
          width: 80,
          height: 95,
          borderRadius: "50%",
          backgroundColor: "#B83A2E",
          boxShadow: "0 0 40px rgba(184,58,46,0.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 34,
          top: 25,
          width: 22,
          height: 80,
          backgroundColor: "#E8DCC3",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 113,
          width: 30,
          height: 10,
          backgroundColor: "#1C1A17",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 123,
          width: 2,
          height: 24,
          backgroundColor: "#C9A227",
        }}
      />
    </div>
  );
};

const Rain: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill
    style={{ zIndex: 12, pointerEvents: "none", overflow: "hidden" }}
  >
    {Array.from({ length: 36 }, (_, index) => {
      const left = seeded(index, 1) * 100;
      const speed = 10 + seeded(index, 2) * 10;
      const height = 50 + seeded(index, 3) * 80;
      const y = (frame * speed + seeded(index, 4) * 1200) % 1300;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${left}%`,
            top: 0,
            width: 2,
            height,
            backgroundColor: "#2E4A5A",
            opacity: 0.18,
            transform: `translateY(${y}px) rotate(8deg)`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const Dust: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ zIndex: 11, pointerEvents: "none" }}>
    {Array.from({ length: 24 }, (_, index) => {
      const left = seeded(index, 5) * 100;
      const top = seeded(index, 6) * 100;
      const size = 3 + seeded(index, 7) * 6;
      const drift = Math.sin(frame * 0.02 + index) * 18;
      const rise = -((frame * (0.12 + seeded(index, 8) * 0.2)) % 80);
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `calc(${left}% + ${drift}px)`,
            top: `${top}%`,
            width: size,
            height: size,
            backgroundColor: "#9A6B3F",
            opacity: 0.16,
            transform: `translateY(${rise}px) rotate(${frame * 0.5 + index * 20}deg)`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const Confetti: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill
    style={{ zIndex: 14, pointerEvents: "none", overflow: "hidden" }}
  >
    {Array.from({ length: 30 }, (_, index) => {
      const left = seeded(index, 9) * 100;
      const delay = seeded(index, 10) * 100;
      const y =
        ((frame + delay) * (4 + seeded(index, 11) * 5)) % 1200;
      const rotate =
        (frame + index * 40) * (2 + seeded(index, 12) * 4);
      const color = ["#E8DCC3", "#B83A2E", "#1C1A17", "#C9A227"][
        index % 4
      ];
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${left}%`,
            top: 0,
            width: 10 + seeded(index, 13) * 14,
            height: 6 + seeded(index, 14) * 10,
            backgroundColor: color,
            opacity: 0.8,
            transform: `translateY(${y - 100}px) rotate(${rotate}deg)`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const Ash: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill
    style={{ zIndex: 14, pointerEvents: "none", overflow: "hidden" }}
  >
    {Array.from({ length: 22 }, (_, index) => {
      const left = seeded(index, 15) * 100;
      const y =
        (frame * (3 + seeded(index, 16) * 3) +
          seeded(index, 17) * 1000) %
        1200;
      const size = 3 + seeded(index, 18) * 5;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${left}%`,
            top: 0,
            width: size,
            height: size,
            backgroundColor: "#1C1A17",
            opacity: 0.35,
            transform: `translateY(${y}px) rotate(${frame + index * 30}deg)`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const Gold: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill
    style={{
      zIndex: 9,
      pointerEvents: "none",
      background:
        "radial-gradient(circle at 50% 45%, rgba(201,162,39,0.26), rgba(201,162,39,0.06) 45%, transparent 70%)",
      opacity: 0.7 + Math.sin(frame * 0.03) * 0.08,
    }}
  />
);

const Candle: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill
    style={{
      zIndex: 9,
      pointerEvents: "none",
      background:
        "radial-gradient(circle at 18% 20%, rgba(201,162,39,0.16), transparent 35%), radial-gradient(circle at 82% 28%, rgba(184,58,46,0.10), transparent 38%)",
      opacity: 0.7 + Math.sin(frame * 0.7) * 0.08,
    }}
  />
);

export const ShotFx: React.FC<{ kinds: ShotFxKind[] }> = ({ kinds }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {kinds.includes("candle") ? <Candle frame={frame} /> : null}
      {kinds.includes("gold") ? <Gold frame={frame} /> : null}
      {kinds.includes("dust") ? <Dust frame={frame} /> : null}
      {kinds.includes("rain") ? <Rain frame={frame} /> : null}
      {kinds.includes("ash") ? <Ash frame={frame} /> : null}
      {kinds.includes("confetti") ? <Confetti frame={frame} /> : null}
      {kinds.includes("lantern") ? <Lantern frame={frame} /> : null}
    </>
  );
};
