import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import type { z } from "zod";
import {
  assessmentRequestSchema,
  assessmentSchema,
  planFinancialsSchema,
  planNarrativeSchema,
  type InitialAssessment,
} from "@/features/assessment/schema";
import { assessmentSystemPrompt, planInputsSystemPrompt } from "@/lib/server/ibda-agent-guide";
import { IBDA_MODEL, getAnthropic, hasAnthropicKey } from "@/lib/server/anthropic";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

class AssessmentError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** One structured request to Claude; returns the parsed, schema-valid output. */
async function ask<T extends z.ZodType>(system: string, schema: T, founderInput: string, task: string) {
  const response = await getAnthropic().beta.messages.parse({
    model: IBDA_MODEL,
    max_tokens: 16000,
    // If the model declines, the API retries on a fallback model automatically.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    output_config: { effort: "medium", format: betaZodOutputFormat(schema) },
    messages: [{ role: "user", content: `${task}\n\n${founderInput}` }],
  });
  if (response.stop_reason === "refusal") {
    throw new AssessmentError("The assessment couldn't be completed for this idea.", 422);
  }
  if (!response.parsed_output) {
    throw new AssessmentError("The assessment came back incomplete. Please try again.", 502);
  }
  return response.parsed_output as z.infer<T>;
}

/**
 * Sends the founder's onboarding answers to Claude and returns a structured
 * initial assessment plus planning inputs (three smaller requests run in
 * parallel). Runs on the server only; the API key never reaches the browser.
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

  const { idea, profile } = input.data;
  const answers = profile.map((f) => `- ${f.label}: ${f.value} (USER_PROVIDED)`).join("\n");
  const founderInput = `<founder_input>
Idea in their own words:
${idea}

Onboarding answers:
${answers}
</founder_input>`;

  try {
    // Three smaller structured requests in parallel; one combined schema exceeds the grammar limit.
    const [assessment, financials, narrative] = await Promise.all([
      ask(assessmentSystemPrompt, assessmentSchema, founderInput, "Prepare the initial business assessment for this founder."),
      ask(planInputsSystemPrompt, planFinancialsSchema, founderInput, "Prepare the FINANCIAL planning inputs (unit, budget, costs, pricing, sales, price bands) for this founder's business."),
      ask(planInputsSystemPrompt, planNarrativeSchema, founderInput, "Prepare the NARRATIVE planning inputs (market, risks, UAE setup, next actions, suppliers, marketing) for this founder's business."),
    ]);
    const result: InitialAssessment = { ...assessment, plan: { ...financials, ...narrative } };
    return NextResponse.json({ assessment: result });
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
      // In development, include Anthropic's message (it never contains the key) to aid debugging.
      const detail = process.env.NODE_ENV === "production" ? "" : ` (${error.status}: ${error.message})`;
      return fail(`The AI service returned an error.${detail}`, 502);
    }
    console.error("Assessment failed", error);
    return fail("Something went wrong preparing the assessment.", 500);
  }
}
