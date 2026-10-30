import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import type { z } from "zod";
import {
  assessmentRequestSchema,
  assessmentSchema,
  marketingCalendarSchema,
  marketingExecutionSchema,
  marketingStrategySchema,
  planFinancialsSchema,
  planNarrativeSchema,
  setupSchema,
  suppliersSchema,
  type InitialAssessment,
} from "@/features/assessment/schema";
import {
  assessmentSystemPrompt,
  marketingCalendarSystemPrompt,
  marketingSystemPrompt,
  planInputsSystemPrompt,
  setupSystemPrompt,
  suppliersSystemPrompt,
} from "@/lib/server/ibda-agent-guide";
import { IBDA_MODEL, getAnthropic, hasAnthropicKey } from "@/lib/server/anthropic";
import { emirateFrom, licensingSourcesFor, sourcesFor } from "@/features/plan/officialSources";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const plainWords: Record<string, string> = {
  NOT_YET_CONFIRMED: "to be confirmed",
  USER_PROVIDED: "your figure",
  ESTIMATE: "estimate",
};

/**
 * Rewrites evidence codes that appear inside sentences ("… NOT_YET_CONFIRMED with
 * the authority") as plain words. Values that are exactly a code (the type
 * fields the app reads) are left untouched.
 */
function plainLabels<T>(value: T): T {
  if (typeof value === "string") {
    if (value in plainWords) return value;
    return value
      .replace(/\b(NOT_YET_CONFIRMED|USER_PROVIDED|ESTIMATE)\b(:)?/g, (_, code: string, colon?: string) =>
        colon ? `${plainWords[code][0].toUpperCase()}${plainWords[code].slice(1)}:` : plainWords[code],
      ) as T;
  }
  if (Array.isArray(value)) return value.map(plainLabels) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plainLabels(v)])) as T;
  }
  return value;
}

class AssessmentError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type Completeness<T> = (output: T) => string[];

/** Lists required parts that came back empty, e.g. ["setup.options", "nextActions"]. */
function emptyParts(checks: Record<string, unknown>) {
  return Object.entries(checks)
    .filter(([, v]) => (Array.isArray(v) ? v.length === 0 : typeof v === "string" ? !v.trim() : !v))
    .map(([k]) => k);
}

/**
 * One structured request to Claude; returns the parsed, schema-valid output.
 * A schema-valid answer can still leave sections empty, so `missing` checks
 * the parts the screens need and the request is retried once if any are empty.
 */
async function ask<T extends z.ZodType>(
  system: string,
  schema: T,
  founderInput: string,
  task: string,
  missing: Completeness<z.infer<T>>,
  effort: "low" | "medium" = "medium",
) {
  let reminder = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await getAnthropic().beta.messages.parse({
      model: IBDA_MODEL,
      max_tokens: 16000,
      // If the model declines, the API retries on a fallback model automatically.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      output_config: { effort, format: betaZodOutputFormat(schema) },
      messages: [{ role: "user", content: `${task}${reminder}\n\n${founderInput}` }],
    });
    if (response.stop_reason === "refusal") {
      throw new AssessmentError("The assessment couldn't be completed for this idea.", 422);
    }
    const output = response.parsed_output as z.infer<T> | null;
    const gaps = output ? missing(output) : ["the whole response"];
    if (output && gaps.length === 0) return output;
    console.warn("Incomplete structured output", { task: task.slice(0, 40), stop: response.stop_reason, gaps });
    reminder = `\n\nIMPORTANT: fill in every field with real content. A previous answer left these empty: ${gaps.join(", ")}.`;
  }
  throw new AssessmentError("The assessment came back incomplete. Please try again.", 502);
}

/**
 * Sends the founder's onboarding answers to Claude and returns a structured
 * initial assessment plus plan, setup, supplier and marketing inputs
 * (eight smaller requests run in parallel). Runs on the server only; the API key never reaches the browser.
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
  // Only sources for this emirate (plus federal ones) are offered, so guidance can't mix emirates.
  const emirate = emirateFrom(profile.find((f) => f.id === "location")?.value);
  const allowedSources = sourcesFor(emirate)
    .map((src) => `- ${src.id}: ${src.name} — ${src.covers}`)
    .join("\n");
  // Tell Claude plainly when there's no verified licensing authority for this emirate.
  const licensingNote =
    licensingSourcesFor(emirate).length > 0
      ? ""
      : `\n\nNo verified licensing authority is available for ${emirate ?? "this emirate"}. Do not name one. Where the licensing authority matters, say to verify through the official UAE government portal (u.ae) and use the "uae-portal" source.`;
  const answers = profile.map((f) => `- ${f.label}: ${f.value} (USER_PROVIDED)`).join("\n");
  const founderInput = `<founder_input>
Idea in their own words:
${idea}

Onboarding answers:
${answers}
</founder_input>`;

  try {
    // Smaller structured requests in parallel; one combined schema exceeds the grammar limit.
    const [assessment, financials, narrative, setup, suppliers, strategy, execution, calendar] = await Promise.all([
      ask(assessmentSystemPrompt, assessmentSchema, founderInput, "Prepare the initial business assessment for this founder.", (o) =>
        emptyParts({ "ideaSummary.headline": o.ideaSummary.headline, "feasibility.reasoning": o.feasibility.reasoning, keyAssumptions: o.keyAssumptions, "recommendedNextStep.title": o.recommendedNextStep.title }),
      ),
      ask(planInputsSystemPrompt, planFinancialsSchema, founderInput, "Prepare the FINANCIAL planning inputs (unit, budget, costs, pricing, sales, price bands) for this founder's business.", (o) =>
        emptyParts({ "unit.singular": o.unit.singular, "budget.amountAed": o.budget.amountAed, startupCosts: o.startupCosts, "pricing.heroAed": o.pricing.heroAed, unitCosts: o.unitCosts, monthlySales: o.monthlySales, priceBands: o.priceBands }),
      ),
      ask(planInputsSystemPrompt, planNarrativeSchema, founderInput, "Prepare the NARRATIVE planning inputs (market, risks, UAE setup, next actions, suppliers, marketing) for this founder's business.", (o) =>
        emptyParts({ "market.summary": o.market.summary, risks: o.risks, nextActions: o.nextActions, launchPathLabel: o.launchPathLabel, "suppliers.categories": o.suppliers.categories, "marketing.focusAreas": o.marketing.focusAreas }),
      ),
      ask(
        setupSystemPrompt,
        setupSchema,
        founderInput,
        `Prepare the UAE setup guidance for this founder's business${emirate ? ` in ${emirate}` : ""}.\n\nAllowed official sources (use these ids only):\n${allowedSources}${licensingNote}`,
        (o) => emptyParts({ summary: o.summary, activity: o.activity, routes: o.routes, path: o.path, requirements: o.requirements }),
      ),
      ask(suppliersSystemPrompt, suppliersSchema, founderInput, "Prepare the supplier categories, supplier types and enquiry details for this founder's first launch.", (o) =>
        emptyParts({ categories: o.categories, options: o.options }),
        "low",
      ),
      ask(marketingSystemPrompt, marketingStrategySchema, founderInput, "Prepare the launch marketing strategy and 13-week calendar for this founder's business.", (o) =>
        emptyParts({ objective: o.objective, channels: o.channels, phaseGoals: o.phaseGoals, weeks: o.weeks }),
        "low",
      ),
      ask(marketingSystemPrompt, marketingExecutionSchema, founderInput, "Prepare the content plan, marketing budget split, launch KPIs and recommended next move for this founder's business.", (o) =>
        emptyParts({ contentPillars: o.contentPillars, budgetSplit: o.budgetSplit, kpis: o.kpis, "nextMove.title": o.nextMove.title, "nextMove.steps": o.nextMove.steps }),
        "low",
      ),
      ask(
        marketingCalendarSystemPrompt,
        marketingCalendarSchema,
        founderInput,
        "Prepare the launch-month content calendar and competitor inspiration for this founder's business.",
        (o) => {
          const weeksCovered = new Set(o.posts.map((p) => Math.round(p.week)));
          return emptyParts({
            weekGoals: o.weekGoals.length >= 4 ? o.weekGoals : [],
            posts: o.posts.length >= 8 && [1, 2, 3, 4].every((w) => weeksCovered.has(w)) ? o.posts : [],
            inspiration: o.inspiration,
          });
        },
        "low",
      ),
    ]);
    const result: InitialAssessment = {
      ...assessment,
      plan: { ...financials, ...narrative },
      setup,
      suppliers,
      marketing: { ...strategy, ...execution, ...calendar },
    };
    return NextResponse.json({ assessment: plainLabels(result) });
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
