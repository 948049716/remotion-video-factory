import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PALETTES, SPRING_CONFIGS } from "../../shared/motion-presets";
import { TERM_META, TERMS, type Segment, type TermKey } from "./timeline";

const C = PALETTES.chromaticNight;
const FONT =
  "'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans', sans-serif";
const MONO = "'SF Mono', Consolas, 'Noto Sans Mono', monospace";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 12-frame in / 12-frame out fade, shared by every scene. */
const fade = (frame: number, frames: number): number => {
  const inn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(frame, [frames - 12, frames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(inn, out);
};

/** Safe stage: HUD occupies top ~88px, captions bottom ~200px. */
const Stage: React.FC<{ frames: number; children: React.ReactNode }> = ({
  frames,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        top: 88,
        width: 1728,
        height: 784,
        opacity: fade(frame, frames),
        fontFamily: FONT,
        color: "#FFFFFF",
      }}
    >
      {children}
    </div>
  );
};

/** Segment headline row: term chip + headline + index. */
const SceneHead: React.FC<{ seg: Segment }> = ({ seg }) => {
  const meta = TERM_META[seg.term];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        marginBottom: 26,
      }}
    >
      <div
        style={{
          backgroundColor: meta.color,
          color: "#06040C",
          fontFamily: MONO,
          fontWeight: 800,
          fontSize: 26,
          padding: "8px 20px",
          borderRadius: 999,
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
        }}
      >
        {meta.en}
      </div>
      <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "0.02em" }}>
        {seg.headline}
      </div>
      <div
        style={{
          marginLeft: "auto",
          fontFamily: MONO,
          fontSize: 22,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.12em",
          whiteSpace: "nowrap",
        }}
      >
        {String(seg.index).padStart(2, "0")} / 37
      </div>
    </div>
  );
};

const Check: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: C.acidLime,
      color: "#06040C",
      fontWeight: 900,
      fontSize: size * 0.62,
      flexShrink: 0,
    }}
  >
    ✓
  </span>
);

const Cross: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: C.neonMagenta,
      color: "#FFFFFF",
      fontWeight: 900,
      fontSize: size * 0.6,
      flexShrink: 0,
    }}
  >
    ✕
  </span>
);

const springIn = (
  frame: number,
  delay: number,
  fps: number,
  config: (typeof SPRING_CONFIGS)[keyof typeof SPRING_CONFIGS] = SPRING_CONFIGS.snappy,
): number =>
  spring({ frame: frame - delay, fps, config, durationInFrames: 45 });

/* ------------------------------------------------------------------ */
/* TermsIntro — seven term chips spring in, one by one.                */
/* ------------------------------------------------------------------ */
const TERM_YEARS: Record<string, string> = {
  AI: "1956",
  Model: "2017",
  Token: "2015",
  Agent: "1995",
  Skill: "2025",
  MCP: "2024",
  Harness: "2025–26",
};

const TermsIntro: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          opacity: titleIn,
          transform: `translateY(${titleY}px)`,
          marginTop: 30,
        }}
      >
        你肯定反复撞到过这串英文词
      </div>
      <div
        style={{
          display: "flex",
          gap: 18,
          marginTop: 56,
        }}
      >
        {TERMS.map((term, i) => {
          const meta = TERM_META[term];
          const s = springIn(frame, 18 + i * 7, fps, SPRING_CONFIGS.elastic);
          return (
            <div
              key={term}
              style={{
                flex: 1,
                border: `2px solid ${meta.color}`,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 20,
                padding: "30px 10px 26px",
                textAlign: "center",
                transform: `scale(${0.6 + 0.4 * s}) translateY(${(1 - s) * 60}px)`,
                opacity: s,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 40,
                  fontWeight: 800,
                  color: meta.color,
                }}
              >
                {meta.en}
              </div>
              <div style={{ fontSize: 26, marginTop: 12 }}>{meta.cn}</div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 22,
                  marginTop: 10,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {TERM_YEARS[term]}
              </div>
            </div>
          );
        })}
      </div>
      {/* Birth-year timeline */}
      <div style={{ marginTop: 74, position: "relative", height: 90 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 34,
            height: 3,
            backgroundColor: "rgba(255,255,255,0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 34,
            height: 3,
            width: `${clamp01(interpolate(frame, [50, frames - 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })) * 100}%`,
            backgroundColor: C.acidLime,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            fontFamily: MONO,
            fontSize: 24,
            color: C.acidLime,
          }}
        >
          1956
        </div>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            fontFamily: MONO,
            fontSize: 24,
            color: C.acidLime,
          }}
        >
          2026
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 58,
            textAlign: "center",
            fontSize: 26,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          按出生时间串起来 · 一部七十年破局史
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* LayerStack — seven layers, lit progressively as the story covers them */
/* ------------------------------------------------------------------ */
const STACK_ORDER: TermKey[] = [
  "AI",
  "Model",
  "Token",
  "Agent",
  "Skill",
  "MCP",
  "Harness",
];

const LayerStack: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Which layers are already covered, and which is active now.
  let lit: TermKey[] = [];
  let active: TermKey | null = null;
  if (seg.index === 34) {
    lit = ["AI", "Model", "Token"];
    active = "Token";
  } else if (seg.index === 35) {
    lit = ["AI", "Model", "Token", "Agent", "Skill", "MCP"];
    active = "Skill";
  } else if (seg.index === 36) {
    lit = [...STACK_ORDER];
    active = "Harness";
  }
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {STACK_ORDER.map((term, i) => {
          const meta = TERM_META[term];
          const isLit = lit.includes(term);
          const isActive = active === term;
          const intro = seg.index === 2; // seg 2 reveals the whole stack, nothing lit yet
          const s = springIn(frame, 8 + i * 6, fps, SPRING_CONFIGS.heavy);
          const opacity = intro ? 0.35 + 0.65 * s : isLit ? 1 : 0.28;
          return (
            <div
              key={term}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                height: 76,
                padding: "0 28px",
                borderRadius: 16,
                border: isActive
                  ? `2px solid ${meta.color}`
                  : "2px solid rgba(255,255,255,0.14)",
                backgroundColor: isLit
                  ? `${meta.color}22`
                  : "rgba(255,255,255,0.04)",
                transform: `translateX(${(1 - s) * -50}px) scale(${
                  isActive ? 1.03 : 1
                })`,
                opacity,
                boxShadow: isActive ? `0 0 34px ${meta.color}55` : "none",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 44,
                  borderRadius: 7,
                  backgroundColor: meta.color,
                  opacity: isLit || intro ? 1 : 0.35,
                }}
              />
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 38,
                  fontWeight: 800,
                  color: isLit || intro ? meta.color : "rgba(255,255,255,0.6)",
                  width: 220,
                }}
              >
                {meta.en}
              </div>
              <div style={{ fontSize: 28 }}>{meta.cn}</div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 24,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {TERM_YEARS[term]}
              </div>
              <div style={{ marginLeft: "auto", fontSize: 26 }}>
                {isActive ? (
                  <span style={{ color: meta.color, fontWeight: 800 }}>
                    ● 当前
                  </span>
                ) : isLit ? (
                  <span style={{ color: C.acidLime }}>✓ 已讲</span>
                ) : (
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>待讲</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* YearHero — giant year + event facts.                                 */
/* ------------------------------------------------------------------ */
const YearHero: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  const yearScale = spring({
    frame,
    fps,
    config: SPRING_CONFIGS.elastic,
    durationInFrames: 50,
  });
  const ghost = interpolate(frame, [0, frames], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lines = seg.lines ?? [];
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ position: "relative", height: 640 }}>
        {/* Ghost year drifting behind */}
        <div
          style={{
            position: "absolute",
            left: -20,
            top: -30,
            fontFamily: MONO,
            fontSize: 430,
            fontWeight: 900,
            color: "transparent",
            WebkitTextStroke: `2px ${meta.color}30`,
            transform: `scale(${ghost})`,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {seg.year}
        </div>
        <div style={{ display: "flex", gap: 60, position: "relative" }}>
          <div style={{ width: 820 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 260,
                fontWeight: 900,
                lineHeight: 1,
                color: meta.color,
                transform: `scale(${0.7 + 0.3 * yearScale})`,
                transformOrigin: "left center",
                textShadow: `0 0 60px ${meta.color}66`,
              }}
            >
              {seg.year}
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 34,
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {seg.term === "AI" && seg.index === 3
                ? "计算机还只是大型电子算盘"
                : seg.index === 7
                  ? "不用硬教语法，规模带来涌现"
                  : seg.index === 10
                    ? "切词机制，从此成为行业标配"
                    : seg.index === 15
                      ? "智能体，第一次有了正式定义"
                      : seg.index === 16
                        ? "大模型 Agent 浪潮就此引爆"
                        : seg.index === 21
                          ? "做事说明书，变成开放标准"
                          : seg.index === 25
                            ? "AI 应用的连接，从此有了标准"
                            : "运行与约束环境，成为工程共识"}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              paddingTop: 20,
            }}
          >
            {lines.map((line, i) => {
              const s = springIn(frame, 22 + i * 9, fps);
              return (
                <div
                  key={line}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "20px 24px",
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: `1px solid ${meta.color}44`,
                    fontSize: 30,
                    transform: `translateX(${(1 - s) * 80}px)`,
                    opacity: s,
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: meta.color,
                      flexShrink: 0,
                    }}
                  />
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* Definition — giant term + definition + capability chips.             */
/* ------------------------------------------------------------------ */
const Definition: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  const s = spring({
    frame,
    fps,
    config: SPRING_CONFIGS.elastic,
    durationInFrames: 55,
  });
  const defs: Record<number, string> = {
    4: "让计算机完成过去需要人类智能才能干成的事",
    30: "包在模型外面的那层运行环境",
  };
  const def = defs[seg.index] ?? "";
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      {seg.index === 30 ? (
        <div style={{ display: "flex", gap: 28, marginTop: 40 }}>
          {[
            {
              title: "evaluation harness",
              cn: "评测脚手架",
              body: "批量跑测试 · 打分 · 汇总结果",
              color: C.cyberCyan,
            },
            {
              title: "agent harness",
              cn: "智能体运行环境",
              body: "包在模型外面 · 管上下文、工具、权限与刹车",
              color: meta.color,
            },
          ].map((card, i) => {
            const cs = springIn(frame, 10 + i * 12, fps, SPRING_CONFIGS.heavy);
            return (
              <div
                key={card.title}
                style={{
                  flex: 1,
                  border: `2px solid ${card.color}`,
                  borderRadius: 22,
                  padding: "44px 36px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  transform: `translateY(${(1 - cs) * 60}px)`,
                  opacity: cs,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 46,
                    fontWeight: 800,
                    color: card.color,
                  }}
                >
                  {card.title}
                </div>
                <div style={{ fontSize: 34, marginTop: 18 }}>{card.cn}</div>
                <div
                  style={{
                    fontSize: 28,
                    marginTop: 22,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.6,
                  }}
                >
                  {card.body}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 190,
              fontWeight: 900,
              lineHeight: 1,
              color: meta.color,
              transform: `scale(${0.75 + 0.25 * s})`,
              transformOrigin: "left center",
              textShadow: `0 0 70px ${meta.color}55`,
              marginTop: 20,
            }}
          >
            {meta.en}
            <span style={{ fontSize: 64, color: "#FFFFFF", marginLeft: 28 }}>
              {meta.cn}
            </span>
          </div>
          <div
            style={{
              fontSize: 40,
              marginTop: 40,
              opacity: interpolate(frame, [18, 34], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {def}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 48 }}>
            {(seg.lines ?? []).map((chip, i) => {
              const cs = springIn(frame, 30 + i * 10, fps);
              return (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 26px",
                    borderRadius: 999,
                    border: `2px solid ${meta.color}`,
                    fontSize: 30,
                    transform: `scale(${0.7 + 0.3 * cs})`,
                    opacity: cs,
                  }}
                >
                  <Check size={30} />
                  {chip}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* PhoneFlow — phone mock: say "导航回家", AI plans the route.          */
/* ------------------------------------------------------------------ */
const PhoneFlow: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  const phoneIn = spring({ frame, fps, config: SPRING_CONFIGS.heavy });
  const steps = seg.lines ?? [];
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ display: "flex", gap: 80, marginTop: 8 }}>
        {/* Phone */}
        <div
          style={{
            width: 360,
            height: 620,
            borderRadius: 44,
            border: "3px solid rgba(255,255,255,0.35)",
            backgroundColor: "#0B0B12",
            padding: "26px 22px",
            transform: `translateY(${(1 - phoneIn) * 80}px) rotate(${
              (1 - phoneIn) * -4
            }deg)`,
            opacity: phoneIn,
            flexShrink: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 120,
              height: 22,
              borderRadius: 11,
              backgroundColor: "rgba(255,255,255,0.2)",
              margin: "0 auto 22px",
            }}
          />
          <div
            style={{
              alignSelf: "flex-end",
              marginLeft: "auto",
              width: "fit-content",
              maxWidth: "86%",
              backgroundColor: meta.color,
              color: "#06040C",
              fontSize: 28,
              fontWeight: 700,
              padding: "14px 20px",
              borderRadius: "20px 20px 6px 20px",
            }}
          >
            导航回家
          </div>
          {steps.map((step, i) => {
            const s = springIn(frame, 30 + i * 26, fps);
            return (
              <div
                key={step}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginTop: 18,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: "14px 18px",
                  fontSize: 26,
                  transform: `translateX(${(1 - s) * -40}px)`,
                  opacity: s,
                }}
              >
                <Check size={28} />
                {step}
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 22,
              right: 22,
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 20,
              color: meta.color,
              opacity: interpolate(frame, [110, 130], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            ✓ 已到达 · 全程 AI
          </div>
        </div>
        {/* Right: what counts as AI */}
        <div style={{ flex: 1, paddingTop: 30 }}>
          <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.5 }}>
            听懂目的地 → 规划路线 → 避开拥堵
            <br />
            <span style={{ color: meta.color }}>这整件事，都属于 AI</span>
          </div>
          <div
            style={{
              marginTop: 44,
              padding: "26px 30px",
              borderRadius: 18,
              border: `2px dashed ${C.cyberCyan}`,
              backgroundColor: "rgba(0,240,255,0.06)",
              opacity: interpolate(frame, [100, 130], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.85)" }}>
              只不过今天口语里的 AI，往往已经缩小到
            </div>
            <div
              style={{ fontSize: 34, fontWeight: 800, marginTop: 10 }}
            >
              生成式 AI
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
              {["聊天", "写代码", "写文章"].map((c, i) => {
                const cs = springIn(frame, 120 + i * 8, fps);
                return (
                  <div
                    key={c}
                    style={{
                      padding: "10px 22px",
                      borderRadius: 999,
                      backgroundColor: C.cyberCyan,
                      color: "#06040C",
                      fontSize: 26,
                      fontWeight: 700,
                      transform: `scale(${0.7 + 0.3 * cs})`,
                      opacity: cs,
                    }}
                  >
                    {c}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* FailCascade — rule cards stamped with red crosses, then toppling.    */
/* ------------------------------------------------------------------ */
const FailCascade: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = seg.lines ?? [];
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ display: "flex", gap: 26, marginTop: 30 }}>
        {cards.map((card, i) => {
          const inS = springIn(frame, 8 + i * 14, fps, SPRING_CONFIGS.heavy);
          const stampAt = 34 + i * 22;
          const stamp = spring({
            frame: frame - stampAt,
            fps,
            config: SPRING_CONFIGS.elastic,
            durationInFrames: 30,
          });
          const fall = interpolate(frame, [stampAt + 26, stampAt + 60], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={card}
              style={{
                flex: 1,
                height: 300,
                borderRadius: 20,
                border: "2px solid rgba(255,255,255,0.25)",
                backgroundColor: "#12121C",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
                position: "relative",
                transform: `translateY(${(1 - inS) * 70}px) rotate(${
                  (i - 1) * 2 + fall * (i - 1) * 9
                }deg) translateY(${fall * 46}px)`,
                opacity: inS * (1 - fall * 0.45),
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 26, color: "rgba(255,255,255,0.55)" }}>
                RULE BOOK
              </div>
              <div style={{ fontSize: 40, fontWeight: 800 }}>{card}</div>
              <div
                style={{
                  fontSize: 120,
                  fontWeight: 900,
                  color: C.neonMagenta,
                  lineHeight: 1,
                  transform: `scale(${stamp}) rotate(-12deg)`,
                  opacity: stamp,
                }}
              >
                ✕
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 56,
          textAlign: "center",
          fontSize: 44,
          fontWeight: 800,
          opacity: interpolate(frame, [110, 140], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        面对真实世界的复杂语言 ·{" "}
        <span style={{ color: C.neonMagenta }}>全面翻车</span>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* ScaleBar — two opposing extremes, settling on the compromise.        */
/* ------------------------------------------------------------------ */
const ScaleBar: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  const p = clamp01(frame / frames);
  const fillLeft = interpolate(frame, [20, frames * 0.45], [0, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fillRight = interpolate(frame, [30, frames * 0.55], [0, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const markerIn = spring({
    frame: frame - Math.round(frames * 0.55),
    fps,
    config: SPRING_CONFIGS.elastic,
    durationInFrames: 40,
  });
  const bar = (
    label: string,
    fill: number,
    color: string,
    note: string,
  ) => (
    <div style={{ marginBottom: 34 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 30,
          marginBottom: 12,
        }}
      >
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: MONO, color }}>{note}</span>
      </div>
      <div
        style={{
          height: 34,
          borderRadius: 17,
          backgroundColor: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${fill * 100}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 17,
          }}
        />
      </div>
    </div>
  );
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ marginTop: 34 }}>
        {bar(seg.left ?? "", fillLeft, C.neonMagenta, (seg.lines ?? [])[0] ?? "")}
        {bar(seg.right ?? "", fillRight, C.cyberCyan, (seg.lines ?? [])[1] ?? "")}
      </div>
      <div
        style={{
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          opacity: markerIn,
          transform: `scale(${0.7 + 0.3 * markerIn})`,
        }}
      >
        <div
          style={{
            backgroundColor: meta.color,
            color: "#06040C",
            fontSize: 38,
            fontWeight: 900,
            padding: "18px 40px",
            borderRadius: 999,
          }}
        >
          {seg.index === 11
            ? "折中：Token"
            : seg.index === 13
              ? "Token 决定装多少、花多少"
              : "别再重发了"}
        </div>
      </div>
      <div
        style={{
          marginTop: 34,
          textAlign: "center",
          fontSize: 28,
          color: "rgba(255,255,255,0.75)",
          opacity: interpolate(frame, [frames * 0.7, frames * 0.8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {seg.index === 11
          ? "Token，就是模型处理文本的基本单位"
          : seg.index === 13
            ? `进度 ${Math.round(p * 100)}% · 模型决定能想什么`
            : "几千字规范 × 每次新对话 = 白白烧掉的 Token"}
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* ChefScene — the model is the chef: decides the dish, never shops.    */
/* ------------------------------------------------------------------ */
const ChefScene: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  const isThink = seg.index === 8;
  const chefIn = spring({ frame, fps, config: SPRING_CONFIGS.elastic });
  const bob = Math.sin(frame / 14) * 6;
  const canDo = isThink ? seg.lines ?? [] : ["决定做什么菜", "决定怎么搭配"];
  const cantDo = isThink
    ? ["打开你的日历", "帮你点提交按钮"]
    : seg.lines ?? [];
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ display: "flex", gap: 56, marginTop: 6 }}>
        {/* Chef */}
        <div
          style={{
            width: 460,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `translateY(${(1 - chefIn) * 70 + bob}px)`,
            opacity: chefIn,
          }}
        >
          {/* Chef hat */}
          <div style={{ position: "relative", width: 260, height: 150 }}>
            <div
              style={{
                position: "absolute",
                left: 30,
                top: 30,
                width: 90,
                height: 90,
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 85,
                top: 0,
                width: 100,
                height: 110,
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 26,
                top: 30,
                width: 90,
                height: 90,
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 10,
                bottom: 0,
                right: 10,
                height: 34,
                borderRadius: 12,
                backgroundColor: "#FFFFFF",
              }}
            />
          </div>
          {/* Brain */}
          <div
            style={{
              marginTop: 18,
              width: 230,
              height: 230,
              borderRadius: "50%",
              backgroundColor: meta.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO,
              fontSize: 44,
              fontWeight: 900,
              color: "#06040C",
              boxShadow: `0 0 60px ${meta.color}88`,
            }}
          >
            Model
          </div>
          <div style={{ marginTop: 20, fontSize: 30, fontWeight: 700 }}>
            饭店后厨里的厨师
          </div>
        </div>
        {/* Do / Don't */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              border: `2px solid ${C.acidLime}`,
              borderRadius: 18,
              padding: "24px 28px",
              backgroundColor: "rgba(204,255,0,0.07)",
              opacity: isThink ? 1 : 0.45,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: C.acidLime, marginBottom: 14 }}>
              厨师会做的 · 只管动脑
            </div>
            {canDo.map((line, i) => {
              const s = springIn(frame, 20 + i * 12, fps);
              return (
                <div
                  key={line}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontSize: 30,
                    marginTop: 10,
                    transform: `translateX(${(1 - s) * 40}px)`,
                    opacity: s,
                  }}
                >
                  <Check size={30} />
                  {line}
                </div>
              );
            })}
          </div>
          <div
            style={{
              border: `2px solid ${C.neonMagenta}`,
              borderRadius: 18,
              padding: "24px 28px",
              backgroundColor: "rgba(255,0,85,0.07)",
              opacity: isThink ? 0.45 : 1,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: C.neonMagenta, marginBottom: 14 }}>
              厨师不会做的
            </div>
            {cantDo.map((line, i) => {
              const s = springIn(frame, (isThink ? 70 : 20) + i * 12, fps);
              return (
                <div
                  key={line}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontSize: 30,
                    marginTop: 10,
                    transform: `translateX(${(1 - s) * 40}px)`,
                    opacity: s,
                  }}
                >
                  <Cross size={30} />
                  {line}
                </div>
              );
            })}
            {!isThink && (
              <div
                style={{
                  marginTop: 16,
                  fontSize: 26,
                  color: "rgba(255,255,255,0.75)",
                  opacity: interpolate(frame, [90, 110], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                那是外面整套软件流程的事
              </div>
            )}
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* TokenSplit — a sentence shatters into Token chips, boxed for shipping */
/* ------------------------------------------------------------------ */
const TokenSplit: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  const chips = seg.lines ?? [];
  const fill = interpolate(frame, [frames * 0.45, frames * 0.85], [0, 0.82], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ fontSize: 32, color: "rgba(255,255,255,0.8)", marginTop: 10 }}>
        “预测接下来最可能出现的内容” —— 先切开，再装箱
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 36 }}>
        {chips.map((chip, i) => {
          const s = spring({
            frame: frame - (10 + i * 9),
            fps,
            config: SPRING_CONFIGS.elastic,
            durationInFrames: 40,
          });
          return (
            <div
              key={chip}
              style={{
                padding: "18px 26px",
                borderRadius: 14,
                border: `2px solid ${meta.color}`,
                backgroundColor: `${meta.color}1E`,
                fontSize: 36,
                fontWeight: 800,
                transform: `translateY(${(1 - s) * -70}px) scale(${0.6 + 0.4 * s})`,
                opacity: s,
              }}
            >
              {chip}
            </div>
          );
        })}
        <div
          style={{
            padding: "18px 26px",
            borderRadius: 14,
            backgroundColor: meta.color,
            color: "#06040C",
            fontSize: 36,
            fontWeight: 900,
            transform: `scale(${springIn(frame, 10 + chips.length * 9, fps, SPRING_CONFIGS.elastic)})`,
            opacity: springIn(frame, 10 + chips.length * 9, fps),
          }}
        >
          Token × {chips.length}
        </div>
      </div>
      <div style={{ display: "flex", gap: 60, marginTop: 60, alignItems: "flex-end" }}>
        {/* Cardboard box */}
        <div
          style={{
            width: 620,
            height: 260,
            border: "3px solid #C98A3D",
            borderBottom: "none",
            borderRadius: "8px 8px 0 0",
            backgroundColor: "rgba(201,138,61,0.12)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${fill * 100}%`,
              backgroundColor: `${meta.color}55`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            快递箱 · 容量 {Math.round(fill * 100)}%
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {[
            "一个英文单词 ≈ 1–2 个 Token",
            "一个汉字 ≈ 1 个或多个 Token",
            "箱子有容量上限 · 装得越多，运费越高",
          ].map((line, i) => {
            const s = springIn(frame, 60 + i * 14, fps);
            return (
              <div
                key={line}
                style={{
                  fontSize: 30,
                  marginTop: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transform: `translateX(${(1 - s) * 50}px)`,
                  opacity: s,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: meta.color,
                  }}
                />
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* GlassBrain — a brain in a glass tank: talks, cannot act.             */
/* ------------------------------------------------------------------ */
const GlassBrain: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  const pulse = 1 + Math.sin(frame / 18) * 0.04;
  const bubbles = seg.lines ?? [];
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ display: "flex", gap: 70, marginTop: 6 }}>
        {/* Tank */}
        <div
          style={{
            width: 560,
            height: 560,
            borderRadius: 40,
            border: "4px solid rgba(255,255,255,0.4)",
            backgroundColor: "rgba(0,240,255,0.05)",
            position: "relative",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "46%",
              width: 260,
              height: 260,
              marginLeft: -130,
              marginTop: -130,
              borderRadius: "50%",
              backgroundColor: meta.color,
              transform: `scale(${pulse})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO,
              fontSize: 52,
              fontWeight: 900,
              color: "#06040C",
              boxShadow: `0 0 80px ${meta.color}99`,
            }}
          >
            BRAIN
          </div>
          {/* Bubbles rising */}
          {[0, 1, 2, 3].map((i) => {
            const y = ((frame * (1.2 + i * 0.35) + i * 130) % 560) as number;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 60 + i * 130,
                  bottom: y,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.5)",
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 8,
              backgroundColor: C.neonMagenta,
            }}
          />
        </div>
        {/* Speech + barrier */}
        <div style={{ flex: 1, paddingTop: 20 }}>
          {bubbles.map((b, i) => {
            const s = springIn(frame, 16 + i * 30, fps);
            return (
              <div
                key={b}
                style={{
                  width: "fit-content",
                  backgroundColor: "#FFFFFF",
                  color: "#06040C",
                  fontSize: 32,
                  fontWeight: 700,
                  padding: "16px 28px",
                  borderRadius: "24px 24px 24px 6px",
                  marginTop: i === 0 ? 0 : 20,
                  transform: `translateY(${(1 - s) * 30}px) scale(${0.8 + 0.2 * s})`,
                  opacity: s,
                }}
              >
                {b}
              </div>
            );
          })}
          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 32,
              fontWeight: 800,
              color: C.neonMagenta,
              opacity: interpolate(frame, [110, 140], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <Cross size={36} />
            光会动嘴给建议，不会动手干实事
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 44,
              fontWeight: 900,
              color: C.acidLime,
              opacity: interpolate(frame, [frames - 90, frames - 60], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            怎么让它真正自动办事？
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* LoopDiagram — think → act → observe, a glowing dot travels the loop. */
/* ------------------------------------------------------------------ */
const LoopDiagram: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  // Triangle vertices (SVG 1000x520 space)
  const A = { x: 500, y: 60 };
  const B = { x: 130, y: 440 };
  const Cc = { x: 870, y: 440 };
  const cycle = 180; // frames per loop
  const t = ((frame % cycle) / cycle) as number;
  // Point along triangle perimeter A -> B -> C -> A
  const per = (tt: number) => {
    if (tt < 1 / 3) {
      const k = tt * 3;
      return { x: A.x + (B.x - A.x) * k, y: A.y + (B.y - A.y) * k };
    }
    if (tt < 2 / 3) {
      const k = (tt - 1 / 3) * 3;
      return { x: B.x + (Cc.x - B.x) * k, y: B.y + (Cc.y - B.y) * k };
    }
    const k = (tt - 2 / 3) * 3;
    return { x: Cc.x + (A.x - Cc.x) * k, y: Cc.y + (A.y - Cc.y) * k };
  };
  const dot = per(t);
  const activeNode = t < 1 / 3 ? 0 : t < 2 / 3 ? 1 : 2;
  const nodes =
    seg.index === 17
      ? ["思考", "行动", "观察"]
      : ["思考", "行动", "观察"];
  const nodeSub =
    seg.index === 17
      ? ["判断下一步做什么", "软件把判断变动作", "根据反馈继续推进"]
      : ["模型发出请求", "系统去执行", "结果送回来"];
  const tools = seg.index === 19 ? seg.lines ?? [] : [];
  const nodePos = [A, B, Cc];
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ position: "relative", height: 620 }}>
        <svg
          width={1728}
          height={560}
          viewBox="0 0 1000 560"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <polygon
            points={`${A.x},${A.y} ${B.x},${B.y} ${Cc.x},${Cc.y}`}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={3}
            strokeDasharray="14 10"
          />
          <circle cx={dot.x} cy={dot.y} r={16} fill={meta.color} />
          <circle cx={dot.x} cy={dot.y} r={30} fill={`${meta.color}33`} />
        </svg>
        {nodePos.map((pos, i) => {
          const s = springIn(frame, 8 + i * 10, fps, SPRING_CONFIGS.heavy);
          const isActive = activeNode === i;
          return (
            <div
              key={nodes[i]}
              style={{
                position: "absolute",
                left: (pos.x / 1000) * 1728 - 150,
                top: pos.y - 75,
                width: 300,
                textAlign: "center",
                transform: `scale(${0.7 + 0.3 * s})`,
                opacity: s,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  border: `4px solid ${isActive ? meta.color : "rgba(255,255,255,0.3)"}`,
                  backgroundColor: isActive ? `${meta.color}33` : "#101018",
                  fontSize: 44,
                  fontWeight: 900,
                  color: isActive ? meta.color : "#FFFFFF",
                  boxShadow: isActive ? `0 0 40px ${meta.color}77` : "none",
                }}
              >
                {nodes[i]}
              </div>
              <div style={{ marginTop: 12, fontSize: 26, color: "rgba(255,255,255,0.85)" }}>
                {nodeSub[i]}
              </div>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 240,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 30,
            fontWeight: 800,
            color: meta.color,
            letterSpacing: "0.2em",
          }}
        >
          AGENT LOOP
        </div>
        {tools.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 16,
            }}
          >
            {tools.map((tool, i) => {
              const s = springIn(frame, 40 + i * 16, fps);
              return (
                <div
                  key={tool}
                  style={{
                    padding: "14px 28px",
                    borderRadius: 999,
                    border: `2px solid ${meta.color}`,
                    fontSize: 28,
                    transform: `scale(${0.7 + 0.3 * s})`,
                    opacity: s,
                  }}
                >
                  {tool} · 不是模型伸手做
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* StepsFlow — horizontal steps, checked off one by one.                */
/* ------------------------------------------------------------------ */
const StepsFlow: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  const steps = seg.lines ?? [];
  const n = steps.length;
  const progress = clamp01(interpolate(frame, [10, frames * 0.85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const isConfirm = seg.index === 32;
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ position: "relative", marginTop: 90 }}>
        {/* Track */}
        <div
          style={{
            position: "absolute",
            left: "4%",
            right: "4%",
            top: 34,
            height: 6,
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "4%",
            top: 34,
            height: 6,
            borderRadius: 3,
            width: `${progress * 92}%`,
            backgroundColor: meta.color,
          }}
        />
        <div style={{ display: "flex", gap: 22, position: "relative" }}>
          {steps.map((step, i) => {
            const threshold = (i + 0.6) / n;
            const done = progress >= threshold;
            const s = springIn(frame, 10 + i * 14, fps, SPRING_CONFIGS.heavy);
            const isLastConfirm = isConfirm && i === n - 1;
            return (
              <div
                key={step}
                style={{
                  flex: 1,
                  transform: `translateY(${(1 - s) * 50}px)`,
                  opacity: s,
                }}
              >
                <div
                  style={{
                    width: 74,
                    height: 74,
                    margin: "0 auto",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: done ? meta.color : "#14141E",
                    border: `3px solid ${done ? meta.color : "rgba(255,255,255,0.3)"}`,
                    color: done ? "#06040C" : "#FFFFFF",
                    fontSize: 34,
                    fontWeight: 900,
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <div
                  style={{
                    marginTop: 26,
                    padding: "22px 16px",
                    minHeight: 150,
                    borderRadius: 16,
                    border: isLastConfirm
                      ? `3px solid ${C.neonMagenta}`
                      : "2px solid rgba(255,255,255,0.18)",
                    backgroundColor: isLastConfirm
                      ? "rgba(255,0,85,0.10)"
                      : "rgba(255,255,255,0.05)",
                    textAlign: "center",
                    fontSize: 29,
                    fontWeight: 700,
                    lineHeight: 1.45,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {step}
                </div>
                {isLastConfirm && (
                  <div
                    style={{
                      marginTop: 16,
                      textAlign: "center",
                      fontSize: 26,
                      fontWeight: 800,
                      color: C.neonMagenta,
                      opacity: done ? 1 : 0,
                    }}
                  >
                    停下来 · 等人确认
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {seg.index === 31 && (
        <div
          style={{
            marginTop: 70,
            textAlign: "center",
            fontSize: 34,
            opacity: interpolate(frame, [frames * 0.8, frames * 0.9], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          厨房里的操作台和安全规程 · <span style={{ color: meta.color }}>Harness</span>
        </div>
      )}
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* Cookbook — SKILL.md folder + recipe steps; prompt vs Skill.          */
/* ------------------------------------------------------------------ */
const Cookbook: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  const isCompare = seg.index === 23;
  const folderIn = spring({ frame, fps, config: SPRING_CONFIGS.heavy });
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ display: "flex", gap: 60, marginTop: 20 }}>
        {/* Folder */}
        <div
          style={{
            width: 620,
            flexShrink: 0,
            transform: `translateY(${(1 - folderIn) * 60}px)`,
            opacity: folderIn,
          }}
        >
          <div
            style={{
              width: 220,
              height: 44,
              backgroundColor: meta.color,
              borderRadius: "12px 12px 0 0",
              marginLeft: 20,
            }}
          />
          <div
            style={{
              border: `3px solid ${meta.color}`,
              borderRadius: "0 18px 18px 18px",
              backgroundColor: "#101019",
              padding: "30px 32px",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 30, color: "rgba(255,255,255,0.6)" }}>
              Skill/
            </div>
            <div
              style={{
                marginTop: 18,
                backgroundColor: "#FFFFFF",
                color: "#06040C",
                borderRadius: 12,
                padding: "20px 24px",
                fontFamily: MONO,
                fontSize: 40,
                fontWeight: 900,
              }}
            >
              SKILL.md
            </div>
            <div style={{ marginTop: 22, fontSize: 26, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
              什么时候用 · 按什么步骤做
              <br />
              附带脚本、模板和参考资料
            </div>
          </div>
        </div>
        {/* Right card */}
        <div style={{ flex: 1 }}>
          {isCompare ? (
            <>
              <div
                style={{
                  border: "2px dashed rgba(255,255,255,0.35)",
                  borderRadius: 18,
                  padding: "26px 30px",
                  opacity: interpolate(frame, [10, 60, frames - 40, frames - 10], [1, 0.35, 0.35, 0.12], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  transform: `translateY(${interpolate(frame, [60, frames], [0, 26], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })}px)`,
                }}
              >
                <div style={{ fontSize: 30, fontWeight: 800 }}>随口一句提示词</div>
                <div style={{ fontSize: 27, marginTop: 10, color: "rgba(255,255,255,0.75)" }}>
                  临时口头交代 · 用完就散了
                </div>
              </div>
              <div
                style={{
                  marginTop: 28,
                  border: `2px solid ${meta.color}`,
                  borderRadius: 18,
                  padding: "26px 30px",
                  backgroundColor: `${meta.color}14`,
                }}
              >
                <div style={{ fontSize: 30, fontWeight: 800, color: meta.color }}>
                  Skill · 可以保存、分享、做版本管理
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
                  {(seg.lines ?? []).map((line, i) => {
                    const s = springIn(frame, 30 + i * 10, fps);
                    return (
                      <div
                        key={line}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 22px",
                          borderRadius: 999,
                          backgroundColor: meta.color,
                          color: "#06040C",
                          fontSize: 27,
                          fontWeight: 700,
                          transform: `scale(${0.7 + 0.3 * s})`,
                          opacity: s,
                        }}
                      >
                        <Check size={26} />
                        {line}
                      </div>
                    );
                  })}
                </div>
                <div
                  style={{
                    marginTop: 22,
                    fontFamily: MONO,
                    fontSize: 24,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  v1.0 → v1.1 → v2.0 · 同一种工作流反复稳定跑出来
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, fontWeight: 800 }}>
                就像家里的菜谱 · 做红烧肉
              </div>
              <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
                {(seg.lines ?? []).map((line, i) => {
                  const s = springIn(frame, 24 + i * 12, fps);
                  return (
                    <div
                      key={line}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        fontSize: 31,
                        padding: "18px 24px",
                        borderRadius: 14,
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        transform: `translateX(${(1 - s) * 60}px)`,
                        opacity: s,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: MONO,
                          fontWeight: 800,
                          color: meta.color,
                          fontSize: 28,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {line}
                    </div>
                  );
                })}
                <div
                  style={{
                    fontSize: 30,
                    marginTop: 8,
                    color: C.acidLime,
                    opacity: interpolate(frame, [90, 120], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  不用每次重新琢磨放多少糖、煮多久
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* SocketScene — one standard socket, every plug fits.                  */
/* ------------------------------------------------------------------ */
const SocketScene: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = TERM_META[seg.term];
  const isDuo = seg.index === 27;
  const socketIn = spring({ frame, fps, config: SPRING_CONFIGS.heavy });
  const plugs = isDuo ? [] : seg.lines ?? [];
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      {isDuo ? (
        <div style={{ display: "flex", gap: 40, marginTop: 60, alignItems: "stretch" }}>
          {[
            {
              title: "MCP",
              body: "连得上、说得通",
              sub: "读取资料 · 调用工具 · 执行动作",
              color: meta.color,
            },
            {
              title: "Skill",
              body: "按什么流程做",
              sub: "查询顺序 · 输出格式 · 注意事项",
              color: TERM_META.Skill.color,
            },
          ].map((card, i) => {
            const s = springIn(frame, 10 + i * 16, fps, SPRING_CONFIGS.heavy);
            return (
              <React.Fragment key={card.title}>
                <div
                  style={{
                    flex: 1,
                    border: `3px solid ${card.color}`,
                    borderRadius: 22,
                    padding: "40px 36px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    transform: `translateY(${(1 - s) * 60}px)`,
                    opacity: s,
                  }}
                >
                  <div style={{ fontFamily: MONO, fontSize: 56, fontWeight: 900, color: card.color }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 800, marginTop: 16 }}>{card.body}</div>
                  <div style={{ fontSize: 28, marginTop: 14, color: "rgba(255,255,255,0.8)" }}>
                    {card.sub}
                  </div>
                </div>
                {i === 0 && (
                  <div
                    style={{
                      alignSelf: "center",
                      fontSize: 60,
                      fontWeight: 900,
                      color: C.acidLime,
                    }}
                  >
                    +
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 70, marginTop: 10 }}>
          {/* Chaos before */}
          <div style={{ width: 420, flexShrink: 0, paddingTop: 40 }}>
            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.6)", marginBottom: 22 }}>
              以前 · 每种电器插头都不一样
            </div>
            {["插头 A", "插头 B", "插头 C"].map((p, i) => {
              const s = springIn(frame, 8 + i * 10, fps);
              return (
                <div
                  key={p}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 24px",
                    marginTop: 14,
                    borderRadius: 14,
                    border: "2px solid rgba(255,255,255,0.2)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    fontSize: 28,
                    transform: `translateX(${(1 - s) * -50}px)`,
                    opacity: s * 0.75,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 30,
                      height: 22,
                      border: "3px solid rgba(255,255,255,0.7)",
                      borderBottom: "none",
                      borderRadius: "6px 6px 0 0",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 5,
                        top: -12,
                        width: 4,
                        height: 12,
                        backgroundColor: "rgba(255,255,255,0.7)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: 5,
                        top: -12,
                        width: 4,
                        height: 12,
                        backgroundColor: "rgba(255,255,255,0.7)",
                      }}
                    />
                  </span>
                  {p} · 处处要转接头
                </div>
              );
            })}
          </div>
          {/* Socket */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: `scale(${0.8 + 0.2 * socketIn})`,
              opacity: socketIn,
            }}
          >
            <div
              style={{
                width: 420,
                height: 300,
                borderRadius: 36,
                border: `4px solid ${meta.color}`,
                backgroundColor: "#0C0C14",
                position: "relative",
                boxShadow: `0 0 60px ${meta.color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 200,
                  height: 70,
                  borderRadius: 35,
                  border: `4px solid ${meta.color}`,
                  backgroundColor: "#06040C",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -18,
                  fontFamily: MONO,
                  fontSize: 26,
                  fontWeight: 800,
                  color: meta.color,
                  backgroundColor: C.void,
                  padding: "4px 16px",
                }}
              >
                USB-C · 统一标准
              </div>
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 56 }}>
              {plugs.map((plug, i) => {
                const s = spring({
                  frame: frame - (40 + i * 18),
                  fps,
                  config: SPRING_CONFIGS.elastic,
                  durationInFrames: 40,
                });
                return (
                  <div
                    key={plug}
                    style={{
                      padding: "16px 30px",
                      borderRadius: 999,
                      backgroundColor: meta.color,
                      color: "#06040C",
                      fontSize: 30,
                      fontWeight: 800,
                      transform: `translateY(${(1 - s) * -50}px) scale(${0.7 + 0.3 * s})`,
                      opacity: s,
                    }}
                  >
                    {plug} ✓ 已接入
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 30,
                fontSize: 28,
                color: "rgba(255,255,255,0.75)",
                opacity: interpolate(frame, [110, 140], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              同一套接口，就能接台灯、插充电器、连风扇
            </div>
          </div>
        </div>
      )}
      {isDuo && (
        <div style={{ display: "flex", gap: 16, marginTop: 54, justifyContent: "center" }}>
          {["邮箱", "日历", "代码仓库"].map((tool, i) => {
            const s = springIn(frame, 50 + i * 10, fps);
            return (
              <div
                key={tool}
                style={{
                  padding: "14px 28px",
                  borderRadius: 999,
                  border: "2px solid rgba(255,255,255,0.3)",
                  fontSize: 28,
                  transform: `scale(${0.7 + 0.3 * s})`,
                  opacity: s,
                }}
              >
                {tool}
              </div>
            );
          })}
          <div style={{ alignSelf: "center", fontSize: 28, color: "rgba(255,255,255,0.7)", marginLeft: 10 }}>
            一边接上，一边按 Skill 的流程走
          </div>
        </div>
      )}
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* Spaghetti — tangled integrations / runaway loop.                     */
/* ------------------------------------------------------------------ */
const SPAGHETTI_PATHS = [
  "M60,90 C220,20 300,260 470,130 S760,60 900,180",
  "M40,200 C260,300 420,80 620,220 S860,300 940,140",
  "M80,320 C300,180 520,360 700,240 S900,340 960,260",
];

const Spaghetti: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isRunaway = seg.index === 28;
  const spin = interpolate(frame, [0, frames], [0, isRunaway ? 200 : 24], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dash = interpolate(frame, [0, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ position: "relative", height: 640 }}>
        <svg width={1728} height={420} viewBox="0 0 1000 420" style={{ width: "100%", height: 420 }}>
          {SPAGHETTI_PATHS.map((d, i) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={isRunaway ? C.neonMagenta : "rgba(255,255,255,0.55)"}
              strokeWidth={isRunaway ? 5 : 4}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - dash * (0.55 + i * 0.15)}
              opacity={0.85}
            />
          ))}
          <g transform={`translate(500 210) rotate(${spin})`}>
            <circle r={86} fill="none" stroke={isRunaway ? C.neonMagenta : C.cyberCyan} strokeWidth={6} strokeDasharray="20 14" />
          </g>
          <circle cx={500} cy={210} r={52} fill={isRunaway ? C.neonMagenta : C.cyberCyan} opacity={0.9} />
          <text
            x={500}
            y={220}
            textAnchor="middle"
            fontSize={34}
            fontWeight={900}
            fill="#06040C"
            fontFamily={MONO}
          >
            {isRunaway ? "!" : "?"}
          </text>
        </svg>
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          {(seg.lines ?? []).map((line, i) => {
            const s = springIn(frame, 20 + i * 14, fps, SPRING_CONFIGS.elastic);
            return (
              <div
                key={line}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px 26px",
                  borderRadius: 14,
                  backgroundColor: "rgba(255,0,85,0.12)",
                  border: `2px solid ${C.neonMagenta}`,
                  fontSize: 30,
                  transform: `scale(${0.7 + 0.3 * s})`,
                  opacity: s,
                }}
              >
                <Cross size={28} />
                {line}
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 36,
            textAlign: "center",
            fontSize: 44,
            fontWeight: 900,
            color: isRunaway ? C.neonMagenta : "rgba(255,255,255,0.9)",
            opacity: interpolate(frame, [frames * 0.62, frames * 0.75], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {isRunaway ? "场面根本收不住" : "整个行业被折腾得苦不堪言"}
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* CompareBars — same model, with vs without Harness.                   */
/* ------------------------------------------------------------------ */
const CompareBars: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const h1 = interpolate(frame, [20, frames * 0.5], [0, 0.52], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const h2 = interpolate(frame, [40, frames * 0.62], [0, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labels = seg.lines ?? ["只看模型", "模型 + Harness"];
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ display: "flex", gap: 90, marginTop: 20, height: 560, alignItems: "flex-end", justifyContent: "center" }}>
        {[
          { label: labels[0], h: h1, color: "rgba(255,255,255,0.35)", pct: "52" },
          { label: labels[1], h: h2, color: C.acidLime, pct: "92" },
        ].map((bar) => (
          <div key={bar.label} style={{ width: 420, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 64,
                fontWeight: 900,
                color: bar.color,
                marginBottom: 12,
              }}
            >
              {bar.pct}
            </div>
            <div
              style={{
                width: "100%",
                height: `${bar.h * 380}px`,
                borderRadius: "18px 18px 0 0",
                backgroundColor: bar.color,
                boxShadow: bar.color === C.acidLime ? `0 0 50px ${C.acidLime}66` : "none",
              }}
            />
            <div style={{ marginTop: 18, fontSize: 32, fontWeight: 800 }}>{bar.label}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 26,
          textAlign: "center",
          fontSize: 32,
          opacity: interpolate(frame, [frames * 0.7, frames * 0.82], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        同一个模型 · 换一套工具、权限和循环规则 ·{" "}
        <span style={{ color: C.acidLime, fontWeight: 800 }}>表现天差地别</span>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* ClosingStack — full lit stack + six questions.                       */
/* ------------------------------------------------------------------ */
const ClosingStack: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const questions = seg.lines ?? [];
  return (
    <Stage frames={frames}>
      <SceneHead seg={seg} />
      <div style={{ display: "flex", gap: 64, marginTop: 4 }}>
        <div style={{ width: 660, flexShrink: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {STACK_ORDER.map((term, i) => {
            const meta = TERM_META[term];
            const s = springIn(frame, 6 + i * 5, fps, SPRING_CONFIGS.snappy);
            return (
              <div
                key={term}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  height: 62,
                  padding: "0 22px",
                  borderRadius: 12,
                  backgroundColor: `${meta.color}22`,
                  border: `2px solid ${meta.color}`,
                  transform: `translateX(${(1 - s) * -40}px)`,
                  opacity: s,
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 800, color: meta.color, width: 150 }}>
                  {meta.en}
                </span>
                <span style={{ fontSize: 24 }}>{meta.cn}</span>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1 }}>
          {questions.map((q, i) => {
            const s = springIn(frame, 30 + i * 16, fps);
            return (
              <div
                key={q}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  fontSize: 36,
                  fontWeight: 700,
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                  transform: `translateX(${(1 - s) * 50}px)`,
                  opacity: s,
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 26, color: C.acidLime }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {q}
              </div>
            );
          })}
          <div
            style={{
              marginTop: 30,
              fontSize: 42,
              fontWeight: 900,
              color: C.acidLime,
              opacity: interpolate(frame, [frames - 100, frames - 70], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            同一套系统，从上到下
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* SceneRenderer — dispatch by segment.scene.                           */
/* ------------------------------------------------------------------ */
export const SceneRenderer: React.FC<{ seg: Segment; frames: number }> = ({
  seg,
  frames,
}) => {
  switch (seg.scene) {
    case "terms":
      return <TermsIntro seg={seg} frames={frames} />;
    case "stack":
      return <LayerStack seg={seg} frames={frames} />;
    case "year":
      return <YearHero seg={seg} frames={frames} />;
    case "define":
      return <Definition seg={seg} frames={frames} />;
    case "phone":
      return <PhoneFlow seg={seg} frames={frames} />;
    case "fail":
      return <FailCascade seg={seg} frames={frames} />;
    case "scale":
      return <ScaleBar seg={seg} frames={frames} />;
    case "chef":
      return <ChefScene seg={seg} frames={frames} />;
    case "token":
      return <TokenSplit seg={seg} frames={frames} />;
    case "glass":
      return <GlassBrain seg={seg} frames={frames} />;
    case "loop":
      return <LoopDiagram seg={seg} frames={frames} />;
    case "steps":
      return <StepsFlow seg={seg} frames={frames} />;
    case "cookbook":
      return <Cookbook seg={seg} frames={frames} />;
    case "socket":
      return <SocketScene seg={seg} frames={frames} />;
    case "spaghetti":
      return <Spaghetti seg={seg} frames={frames} />;
    case "compare":
      return <CompareBars seg={seg} frames={frames} />;
    case "closing":
      return <ClosingStack seg={seg} frames={frames} />;
    default:
      return null;
  }
};
