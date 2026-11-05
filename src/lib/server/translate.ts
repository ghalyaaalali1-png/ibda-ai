import "server-only";
import { z } from "zod";
import type { Locale } from "@/i18n/config";
import { languageNames, translationSystemPrompt } from "./language";
import { ask } from "./modules/ask";

// Small enough batches that each answer comes back quickly and in full.
const BATCH_SIZE = 60;

const translationSchema = z.object({
  items: z.array(z.object({ id: z.string(), text: z.string() })),
});

/**
 * Translates pieces of text into an interface language, in parallel batches.
 * Returns each text's translation; the same text always gets one translation.
 */
export async function translateTexts(texts: readonly string[], locale: Locale): Promise<Map<string, string>> {
  const unique = [...new Set(texts.filter((text) => text.trim()))];
  const batches = Array.from({ length: Math.ceil(unique.length / BATCH_SIZE) }, (_, i) =>
    unique.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE),
  );
  const translated = await Promise.all(
    batches.map(async (batch) => {
      const ids = batch.map((_, i) => `t${i + 1}`);
      const output = await ask(
        translationSystemPrompt(locale),
        translationSchema,
        `<texts>\n${JSON.stringify(batch.map((text, i) => ({ id: ids[i], text })))}\n</texts>`,
        `Translate the text of each item into ${languageNames[locale]}.`,
        (o) => {
          const done = new Map(o.items.map((item) => [item.id, item.text.trim()]));
          return ids.filter((id) => !done.get(id));
        },
        "low",
      );
      const byId = new Map(output.items.map((item) => [item.id, item.text.trim()]));
      return batch.map((text, i) => [text, byId.get(ids[i])!] as const);
    }),
  );
  return new Map(translated.flat());
}
