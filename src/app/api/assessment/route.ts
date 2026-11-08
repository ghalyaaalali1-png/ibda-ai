import { NextResponse } from "next/server";
import { assessmentRequestSchema } from "@/features/assessment/schema";
import { assembleAssessment } from "@/features/plan-modules/assemble";
import { hasAnthropicKey } from "@/lib/server/anthropic";
import { businessNameIn, fail, generationFailure, plainLabels } from "@/lib/server/assessmentOutput";
import { runAllModules } from "@/lib/server/modules/run";
import { allowRequest, hourlyLimits, LIMIT_MESSAGE, requesterKey } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Sends the founder's onboarding answers to Claude and returns a structured
 * initial assessment plus plan, setup, supplier and marketing inputs, written
 * in the founder's interface language. Each plan module is one request (seven
 * run in parallel, suppliers after the financial plan); their outputs are
 * combined into one assessment. Used by the journey without an account;
 * saved projects use /api/projects/[id]/generate. Runs on the server only;
 * the API key never reaches the browser.
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
  if (!allowRequest(`assessment:${requesterKey(request)}`, hourlyLimits.assessment)) return fail(LIMIT_MESSAGE, 429);

  try {
    const locale = input.data.locale ?? "en";
    const result = assembleAssessment(await runAllModules(input.data));
    const businessName = await businessNameIn(input.data.profile.find((f) => f.id === "business")?.value, locale);
    return NextResponse.json({ assessment: plainLabels(result, locale), ...(businessName ? { businessName } : {}) });
  } catch (error) {
    return generationFailure(error);
  }
}
