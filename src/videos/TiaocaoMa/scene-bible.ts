import type { ShotMeta } from "./shot-meta";

export type SceneKey =
  | "street"
  | "restaurant"
  | "stable"
  | "stableNight"
  | "trough"
  | "hall"
  | "palaceGate"
  | "duskRoad"
  | "battlefield"
  | "map"
  | "table"
  | "diagram";

export type SceneGrade = {
  color: string;
  opacity: number;
  blend: "multiply" | "soft-light" | "overlay";
};

export type SceneDef = {
  key: SceneKey;
  background?: string;
  objectPosition: string;
  grade: SceneGrade;
};

const SCENES: Record<SceneKey, SceneDef> = {
  street: {
    key: "street",
    background: "bg.street.west",
    objectPosition: "center center",
    grade: { color: "#C9A227", opacity: 0.08, blend: "soft-light" },
  },
  restaurant: {
    key: "restaurant",
    background: "bg.restaurant.interior",
    objectPosition: "center center",
    grade: { color: "#C9A227", opacity: 0.08, blend: "soft-light" },
  },
  stable: {
    key: "stable",
    background: "bg.stable",
    objectPosition: "center center",
    grade: { color: "#2E4A5A", opacity: 0.07, blend: "soft-light" },
  },
  stableNight: {
    key: "stableNight",
    background: "bg.stable.night",
    objectPosition: "center center",
    grade: { color: "#1C1A17", opacity: 0.16, blend: "multiply" },
  },
  trough: {
    key: "trough",
    background: "bg.trough.long",
    objectPosition: "center center",
    grade: { color: "#9A6B3F", opacity: 0.06, blend: "soft-light" },
  },
  hall: {
    key: "hall",
    background: "bg.hall",
    objectPosition: "center center",
    grade: { color: "#B83A2E", opacity: 0.08, blend: "soft-light" },
  },
  palaceGate: {
    key: "palaceGate",
    background: "bg.palace.gate",
    objectPosition: "center center",
    grade: { color: "#2E4A5A", opacity: 0.14, blend: "multiply" },
  },
  duskRoad: {
    key: "duskRoad",
    background: "bg.dusk.road",
    objectPosition: "center center",
    grade: { color: "#C9A227", opacity: 0.12, blend: "soft-light" },
  },
  battlefield: {
    key: "battlefield",
    background: "bg.battlefield",
    objectPosition: "center center",
    grade: { color: "#1C1A17", opacity: 0.1, blend: "multiply" },
  },
  map: {
    key: "map",
    background: "bg.map.west-east",
    objectPosition: "center center",
    grade: { color: "#C9A227", opacity: 0.08, blend: "soft-light" },
  },
  table: {
    key: "table",
    background: "bg.table",
    objectPosition: "center center",
    grade: { color: "#C9A227", opacity: 0.08, blend: "soft-light" },
  },
  diagram: {
    key: "diagram",
    background: undefined,
    objectPosition: "center center",
    grade: { color: "#C9A227", opacity: 0.04, blend: "soft-light" },
  },
};

export const getSceneKey = (meta: ShotMeta): SceneKey => {
  const hasCharacters = meta.assets.some((key) =>
    key.startsWith("char."),
  );
  const hasBackground = meta.assets.some((key) => key.startsWith("bg."));
  if (
    !hasCharacters &&
    !hasBackground &&
    (meta.assets.includes("prop.trough.map") ||
      meta.assets.includes("prop.rank.cards"))
  ) {
    return "diagram";
  }

  const location = meta.location;
  if (meta.assets.includes("bg.map.west-east")) return "map";
  if (location.includes("宫门")) return "palaceGate";
  if (location.includes("战场")) return "battlefield";
  if (location.includes("地图")) return "map";
  if (location.includes("桌前") || location.includes("桌上")) {
    return "table";
  }
  if (location.includes("马槽")) return "trough";
  if (location.includes("后院") || location.includes("马厩")) {
    if (location.includes("夜")) return "stableNight";
    if (location.includes("黄昏")) return "duskRoad";
    return "stable";
  }
  if (location.includes("马棚") && location.includes("夜")) {
    return "stableNight";
  }
  if (location.includes("马棚")) return "stable";
  if (
    location.includes("饭馆外") ||
    location.includes("饭馆门口") ||
    location.includes("饭馆 · 后门") ||
    location.includes("街口") ||
    location.includes("西街")
  ) {
    return "street";
  }
  if (
    location.includes("饭馆内") ||
    location.includes("堂内") ||
    location.includes("雅间")
  ) {
    return "restaurant";
  }
  if (
    location.includes("府邸") ||
    location.includes("公堂") ||
    location.includes("堂上") ||
    location.includes("地面")
  ) {
    return "hall";
  }
  if (
    location.includes("后门外") ||
    location.includes("黄昏") ||
    location.includes("城外")
  ) {
    return "duskRoad";
  }
  return "diagram";
};

export const getScene = (meta: ShotMeta): SceneDef => {
  const key = getSceneKey(meta);
  const scene = SCENES[key];
  if (key !== "trough") return scene;

  const location = meta.location;
  const objectPosition = location.includes("东")
    ? "right center"
    : location.includes("西")
      ? "left center"
      : "center center";
  return { ...scene, objectPosition };
};
