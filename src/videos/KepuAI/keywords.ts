import { PALETTES } from "../../shared/motion-presets";
import { SPOKEN_AT } from "./timing";

const kitchen = PALETTES.kepuKitchen;

export type KeywordId =
  | "ai"
  | "model"
  | "token"
  | "agent"
  | "skill"
  | "mcp"
  | "harness";

export type KeywordDef = {
  id: KeywordId;
  en: string;
  zh: string;
  color: string;
  /** Cream type on dark fills; ink type on warm fills. */
  text: "cream" | "ink";
  /** List onset in seconds. Null stays a waiting slot for this 10s cut. */
  popAt: number | null;
  pulseAt: number | null;
};

export const KEYWORDS: readonly KeywordDef[] = [
  {
    id: "ai",
    en: "AI",
    zh: "人工智能",
    color: kitchen.keywords.ai,
    text: "cream",
    popAt: SPOKEN_AT.ai,
    pulseAt: SPOKEN_AT.aiMention,
  },
  {
    id: "model",
    en: "Model",
    zh: "模型",
    color: kitchen.keywords.model,
    text: "ink",
    popAt: SPOKEN_AT.model,
    pulseAt: null,
  },
  {
    id: "token",
    en: "Token",
    zh: "文本单位",
    color: kitchen.keywords.token,
    text: "cream",
    popAt: SPOKEN_AT.token,
    pulseAt: null,
  },
  {
    id: "agent",
    en: "Agent",
    zh: "智能体",
    color: kitchen.keywords.agent,
    text: "cream",
    popAt: SPOKEN_AT.agent,
    pulseAt: null,
  },
  {
    id: "skill",
    en: "Skill",
    zh: "技能",
    color: kitchen.keywords.skill,
    text: "cream",
    popAt: null,
    pulseAt: null,
  },
  {
    id: "mcp",
    en: "MCP",
    zh: "连接协议",
    color: kitchen.keywords.mcp,
    text: "cream",
    popAt: null,
    pulseAt: null,
  },
  {
    id: "harness",
    en: "Harness",
    zh: "运行约束",
    color: kitchen.keywords.harness,
    text: "ink",
    popAt: null,
    pulseAt: null,
  },
];

/** Vertical 2 + 3 + 2. The middle row is the three shorter words. */
export const BADGE_ROWS: readonly (readonly KeywordId[])[] = [
  ["ai", "model"],
  ["token", "agent", "skill"],
  ["mcp", "harness"],
];

export const keywordById = (id: KeywordId) => {
  const found = KEYWORDS.find((keyword) => keyword.id === id);
  if (!found) {
    throw new Error(`Missing keyword ${id}`);
  }
  return found;
};
