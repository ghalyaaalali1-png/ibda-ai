import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { initialAssessmentSchema, translationRequestSchema } from "@/features/assessment/schema";
import { assessmentTexts, withTranslations } from "@/features/assessment/translatable";
import { hasAnthropicKey } from "@/lib/server/anthropic";
import { languageNames, translationSystemPrompt } from "@/lib/server/language";
import { AssessmentError, ask } from "@/lib/server/modules/ask";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Small enough batches that each answer comes back quickly and in full.
const BATCH_SIZE = 60;

const translationSchema = z.object({
  items: z.array(z.object({ id: z.string(), text: z.string() })),
});

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Translates a finished assessment's text into another interface language,
 * so a founder who switches language sees the same plan — same figures,
 * codes and structure — in that language, without generating it again.
 * Runs on the server only; the API key never reaches the browser.
 */
export async function POST(request: Request) {
  if (!hasAnthropicKey()) return fail("The AI service isn't configured.", 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }
  const input = translationRequestSchema.safeParse(body);
  if (!input.success) return fail("Invalid translation request.", 400);
  const { assessment, locale } = input.data;

  const texts = assessmentTexts(assessment);
  const batches = Array.from({ length: Math.ceil(texts.length / BATCH_SIZE) }, (_, i) =>
    texts.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE),
  );

  try {
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
    const result = withTranslations(assessment, new Map(translated.flat()));
    // The figures, codes and structure must come back exactly as they went in.
    if (!initialAssessmentSchema.safeParse(result).success) throw new AssessmentError("The translation came back incomplete. Please try again.", 502);
    return NextResponse.json({ assessment: result });
  } catch (error) {
    if (error instanceof AssessmentError) return fail("The translation couldn't be completed. Please try again.", error.status);
    if (error instanceof Anthropic.RateLimitError) return fail("The AI service is busy. Please try again shortly.", 503);
    if (error instanceof Anthropic.APIConnectionError) return fail("Couldn't reach the AI service.", 503);
    if (error instanceof Anthropic.APIError) {
      console.error("Translation API error", error.status, error.message);
      return fail("The AI service returned an error.", 502);
    }
    console.error("Translation failed", error);
    return fail("The translation couldn't be completed. Please try again.", 500);
  }
}
