import { z } from "zod";

export const HomepageVideoSchema = z.object({
  youtubeUrl: z.string().trim().optional().default(""),
  tagline: z.string().trim().optional().default("Showcase Studio"),
  title: z.string().trim().optional().default("Intensional. Tenang. Abadi."),
  description1: z.string().trim().optional().default(""),
  description2: z.string().trim().optional().default(""),
  aspectRatio: z.enum(["PORTRAIT", "LANDSCAPE", "SQUARE"]).default("PORTRAIT"),
});

export type HomepageVideoInput = z.infer<typeof HomepageVideoSchema>;
