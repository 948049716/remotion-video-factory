import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { PALETTES } from "../../shared/motion-presets";
import { Captions } from "./Captions";
import { HistoryTimeline } from "./HistoryTimeline";
import { KeywordBadge } from "./KeywordBadge";
import { BADGE_ROWS, keywordById } from "./keywords";

const kitchen = PALETTES.kepuKitchen;

/**
 * 镜 01, truncated to the first 10.0s of the Yunxi voiceover.
 * Seven keyword seats are laid out immediately; each spoken word
 * springs in on its own onset. Skill, MCP and Harness stay faded.
 */
export const KepuAIDraft10: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: kitchen.plateDark,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(ellipse 78% 52% at 50% 40%, ${kitchen.plateLift} 0%, ${kitchen.plateDark} 72%)`,
        }}
      />
      <Audio
        src={staticFile("kepu-ai/koubo_10s.wav")}
        name="口播"
        premountFor={fps}
      />
      <div style={{ position: "absolute", top: 390, left: 0 }}>
        <HistoryTimeline />
      </div>
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 0,
          right: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
          }}
        >
          {BADGE_ROWS.map((row) => {
            const englishSize = row.length === 3 ? 56 : 64;
            return (
              <div
                key={row.join("-")}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: row.length === 3 ? 20 : 32,
                }}
              >
                {row.map((id) => (
                  <KeywordBadge
                    key={id}
                    keyword={keywordById(id)}
                    englishSize={englishSize}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <Captions />
    </AbsoluteFill>
  );
};
