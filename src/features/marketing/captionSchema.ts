import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

/** What the browser sends to /api/captions. Business facts only — no secrets. */
export const captionRequestSchema = z.object({
  type: z.enum(["teaser", "bts", "countdown", "reveal", "styling", "ugc"]),
  platform: z.enum(["instagram", "tiktok"]),
  language: z.enum(["en", "ar"]),
  context: z.object({
    business: text(160).min(1),
    location: text(60),
    positioning: text(400),
    targetCustomer: text(500),
    priceRange: text(60),
    channels: z.array(text(60)).max(6),
  }),
});

/** Claude's caption parts; the app lays them out per platform. */
export const captionCopySchema = z.object({
  hook: z.string().describe("Opening line, max ~10 words"),
  body: z.string().describe("2-3 short sentences"),
  cta: z.string().describe("One call to action"),
  tags: z.array(z.string()).describe("5-6 relevant hashtags including UAE/location tags, each starting with #"),
  visual: z.string().describe("One sentence describing the suggested visual"),
  bestTime: z.string().describe('Suggested posting time for UAE audiences, e.g. "Thu–Sat, 8–10pm UAE time"'),
});

export type CaptionRequest = z.infer<typeof captionRequestSchema>;
export type GeneratedCaptionCopy = z.infer<typeof captionCopySchema>;
