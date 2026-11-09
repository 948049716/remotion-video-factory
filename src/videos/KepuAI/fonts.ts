import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const interFamily = "Inter";
export const notoFamily = "Noto Sans SC";

void Promise.all([
  loadFont({
    family: interFamily,
    url: staticFile("kepu-ai/fonts/Inter-600.ttf"),
    weight: "600",
    format: "truetype",
  }),
  loadFont({
    family: interFamily,
    url: staticFile("kepu-ai/fonts/Inter-700.ttf"),
    weight: "700",
    format: "truetype",
  }),
  loadFont({
    family: notoFamily,
    url: staticFile("kepu-ai/fonts/NotoSansSC-500.ttf"),
    weight: "500",
    format: "truetype",
  }),
  loadFont({
    family: notoFamily,
    url: staticFile("kepu-ai/fonts/NotoSansSC-700.ttf"),
    weight: "700",
    format: "truetype",
  }),
]);
