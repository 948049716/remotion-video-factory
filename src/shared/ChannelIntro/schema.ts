import { z } from "zod";

/** Lets the Remotion Studio edit the (undecided) brand name live via props. */
export const channelIntroPropsSchema = z.object({
  displayName: z.string().optional(),
  latinName: z.string().optional(),
  tagline: z.string().optional(),
  accent: z.string().optional(),
  variant: z.enum(["prism", "pulse"]).optional(),
  durationInFrames: z.number().optional(),
  startFrame: z.number().optional(),
  background: z.string().optional(),
  transitionOut: z.boolean().optional(),
  showHud: z.boolean().optional(),
  audioSrc: z.string().optional(),
  zIndex: z.number().optional(),
});
