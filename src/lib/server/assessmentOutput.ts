import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { nameNeedsTranslation } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { AssessmentError } from "./modules/ask";
import { translateTexts } from "./translate";

/*
 * What the plan routes share: tidying Claude's output, the business name in
 * the plan's language, and failures worded for the founder.
 */

/** `detail` is technical context for development only; the screen shows `message`. */
export function fail(message: string, status: number, detail?: string) {
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
export function plainLabels<T>(value: T, locale: Locale): T {
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
 * The business name in the plan's language when the founder typed it in the
 * other one (an English name for an Arabic plan, say). Best effort: if it
 * fails, the plan still returns and the screens ask for the name separately.
 */
export async function businessNameIn(name: string | undefined, locale: Locale) {
  if (!name || !nameNeedsTranslation(name, locale)) return undefined;
  try {
    return (await translateTexts([name], locale)).get(name);
  } catch (error) {
    console.warn("Business name not translated", error instanceof Error ? error.message : error);
    return undefined;
  }
}

/** A generation failure as a response the screen can show. */
export function generationFailure(error: unknown) {
  if (error instanceof AssessmentError) return fail(error.message, error.status);
  if (error instanceof Anthropic.AuthenticationError) return fail("The AI service rejected its credentials.", 502);
  if (error instanceof Anthropic.RateLimitError) return fail("The AI service is busy. Please try again shortly.", 503);
  if (error instanceof Anthropic.APIConnectionError) return fail("Couldn't reach the AI service.", 503);
  if (error instanceof Anthropic.APIError) {
    console.error("Assessment API error", error.status, error.message);
    // In development, pass Anthropic's message (it never contains the key) along for the console.
    const detail = process.env.NODE_ENV === "production" ? undefined : `${error.status}: ${error.message}`;
    return fail("The AI service returned an error.", 502, detail);
  }
  console.error("Assessment failed", error);
  return fail("Something went wrong preparing the assessment.", 500);
}
