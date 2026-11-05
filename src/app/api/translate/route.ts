import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { initialAssessmentSchema, translationRequestSchema } from "@/features/assessment/schema";
import { assessmentTexts, withTranslations } from "@/features/assessment/translatable";
import { hasAnthropicKey } from "@/lib/server/anthropic";
import { AssessmentError } from "@/lib/server/modules/ask";
import { translateTexts } from "@/lib/server/translate";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Translates a finished assessment's text, and the founder's business name,
 * into another interface language, so a founder who switches language sees
 * the same plan — same figures, codes and structure — in that language,
 * without generating it again. Runs on the server only; the API key never
 * reaches the browser.
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
  const { assessment, businessName, locale } = input.data;

  try {
    const translations = await translateTexts(
      [...(assessment ? assessmentTexts(assessment) : []), ...(businessName ? [businessName] : [])],
      locale,
    );
    const result = assessment ? withTranslations(assessment, translations) : undefined;
    // The figures, codes and structure must come back exactly as they went in.
    if (result && !initialAssessmentSchema.safeParse(result).success) {
      throw new AssessmentError("The translation came back incomplete. Please try again.", 502);
    }
    return NextResponse.json({
      ...(result ? { assessment: result } : {}),
      ...(businessName ? { businessName: translations.get(businessName) } : {}),
    });
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
