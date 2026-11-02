import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { assessmentRequestSchema } from "@/features/assessment/schema";
import { assembleAssessment } from "@/features/plan-modules/assemble";
import type { Locale } from "@/i18n/config";
import { hasAnthropicKey } from "@/lib/server/anthropic";
import { AssessmentError } from "@/lib/server/modules/ask";
import { runAllModules } from "@/lib/server/modules/run";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** `detail` is technical context for development only; the screen shows `message`. */
function fail(message: string, status: number, detail?: string) {
  return NextResponse.json({ error: message, ...(detail ? { detail } : {}) }, { status });
}

const plainWords: Record<Locale, Record<string, string>> = {
  en: { NOT_YET_CONFIRMED: "to be confirmed", USER_PROVIDED: "your figure", ESTIMATE: "estimate" },
  ar: { NOT_YET_CONFIRMED: "بحاجة إلى تأكيد", USER_PROVIDED: "رقمك", ESTIMATE: "تقدير" },
};

/**
 * Rewrites evidence codes that appear inside sentences ("… NOT_YET_CONFIRMED with
 * the authority") as plain words. Values that are exactly a code (the type
 * fields the app reads) are left untouched.
 */
function plainLabels<T>(value: T, locale: Locale): T {
  const words = plainWords[locale];
  if (typeof value === "string") {
    if (value in words) return value;
    return value
      .replace(/\b(NOT_YET_CONFIRMED|USER_PROVIDED|ESTIMATE)\b(:)?/g, (_, code: string, colon?: string) =>
        colon ? `${words[code][0].toUpperCase()}${words[code].slice(1)}:` : words[code],
      ) as T;
  }
  if (Array.isArray(value)) return value.map((v) => plainLabels(v, locale)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plainLabels(v, locale)])) as T;
  }
  return value;
}

/**
 * Sends the founder's onboarding answers to Claude and returns a structured
 * initial assessment plus plan, setup, supplier and marketing inputs, written
 * in the founder's interface language. Each
 * plan module is one request (seven run in parallel, suppliers after the
 * financial plan); their outputs are combined into one assessment. Runs on
 * the server only; the API key never reaches the browser.
 */
export async function POST(request: Request) {
  if (!hasAnthropicKey()) return fail("The AI service isn't configured.", 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }
  const input = assessmentRequestSchema.safeParse(body);
  if (!input.success) return fail("Invalid onboarding answers.", 400);

  try {
    const result = assembleAssessment(await runAllModules(input.data));
    return NextResponse.json({ assessment: plainLabels(result, input.data.locale ?? "en") });
  } catch (error) {
    if (error instanceof AssessmentError) return fail(error.message, error.status);
    if (error instanceof Anthropic.AuthenticationError) {
      return fail("The AI service rejected its credentials.", 502);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail("The AI service is busy. Please try again shortly.", 503);
    }
    if (error instanceof Anthropic.APIConnectionError) {
      return fail("Couldn't reach the AI service.", 503);
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Assessment API error", error.status, error.message);
      // In development, pass Anthropic's message (it never contains the key) along for the console.
      const detail = process.env.NODE_ENV === "production" ? undefined : `${error.status}: ${error.message}`;
      return fail("The AI service returned an error.", 502, detail);
    }
    console.error("Assessment failed", error);
    return fail("Something went wrong preparing the assessment.", 500);
  }
}
