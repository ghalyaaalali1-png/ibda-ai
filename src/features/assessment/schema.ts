import { z } from "zod";

/**
 * Shape of Claude's initial business assessment. Shared by the API route
 * (to constrain and validate Claude's output) and the UI (to render it).
 * Labels follow the Ibda Agent Guide.
 */

export const evidenceLabels = ["USER_PROVIDED", "ESTIMATE", "NOT_YET_CONFIRMED"] as const;
export const feasibilityStatuses = [
  "FEASIBLE",
  "FEASIBLE_WITH_CHANGES",
  "CURRENTLY_NOT_FEASIBLE",
] as const;

export const assessmentSchema = z.object({
  ideaSummary: z.object({
    headline: z.string().describe("One line, max ~10 words"),
    summary: z.string().describe("2-3 sentences restating the idea from the user's inputs"),
  }),
  targetCustomer: z.object({
    headline: z.string().describe("One line, max ~10 words"),
    description: z.string().describe("1-2 sentences: who they are, where, how they buy"),
  }),
  positioning: z.object({
    statement: z.string().describe("One sentence positioning statement"),
    rationale: z.string().describe("1-2 sentences explaining why it fits the inputs"),
  }),
  feasibility: z.object({
    status: z.enum(feasibilityStatuses),
    viabilityScore: z
      .number()
      .int()
      .describe("0-100 judgement of viability from the information provided only"),
    headline: z.string().describe("One line verdict, max ~8 words"),
    reasoning: z.string().describe("2-4 sentences explaining the status"),
    conditions: z
      .array(z.string())
      .describe("Up to 3 short changes or conditions (max ~8 words each); empty if none"),
  }),
  keyAssumptions: z
    .array(
      z.object({
        assumption: z.string(),
        type: z.enum(evidenceLabels),
        reason: z.string().describe("Why this is assumed, or where it came from"),
      }),
    )
    .describe("3-6 assumptions the assessment relies on"),
  missingInformation: z
    .array(
      z.object({
        question: z.string().describe("A question to ask the founder"),
        whyItMatters: z.string(),
      }),
    )
    .describe("At most 3 questions; only information that materially affects the decision"),
  recommendedNextStep: z.object({
    title: z.string().describe("Imperative, max ~8 words"),
    detail: z.string().describe("One sentence on what to do and why"),
  }),
  outputStatus: z
    .enum(["COMPLETE", "PARTIAL"])
    .describe("PARTIAL when important information is missing or unverified"),
});

/*
 * Planning inputs for the dashboard, split into two smaller schemas (a single
 * large schema exceeds the structured-output grammar limit). Claude estimates
 * these; the app does all arithmetic (totals, margins, cash curve, break-even).
 */
const evidence = z.enum(evidenceLabels);

export const planFinancialsSchema = z.object({
  unit: z.object({
    singular: z.string().describe('What one sale is, lowercase, e.g. "meal box", "abaya", "session"'),
    plural: z.string(),
  }),
  budget: z.object({
    amountAed: z.number().describe("Total startup budget to plan with, in AED"),
    type: evidence,
    basis: z
      .string()
      .describe('How the figure was chosen, e.g. "Founder\'s stated budget" or "Mid-point of the founder\'s AED 25,000–75,000 range"'),
  }),
  startupCosts: z
    .array(
      z.object({
        label: z.string().describe("Short category name, max ~4 words"),
        amountAed: z.number(),
        note: z.string().describe("What it covers, max ~8 words"),
        type: evidence,
      }),
    )
    .describe("4-7 one-off startup cost lines. Together with reserveAed they must equal the budget"),
  reserveAed: z.number().describe("Cash reserve kept back from the budget (aim for ~10%)"),
  pricing: z.object({
    minAed: z.number(),
    maxAed: z.number(),
    heroAed: z.number().describe("The typical price used for the unit economics"),
  }),
  unitCosts: z
    .array(
      z.object({
        label: z.string().describe("Max ~4 words"),
        amountAed: z.number().describe("Cost per unit sold, in AED"),
        kind: z.enum(["product", "selling"]).describe('"product" = cost to make or buy; "selling" = payment fees, delivery, platform fees'),
      }),
    )
    .describe("2-5 variable costs per unit sold, all ESTIMATE unless the founder gave them"),
  monthlyRunningCostsAed: z
    .number()
    .describe("Fixed monthly costs after launch (rent, salaries, subscriptions, ongoing marketing)"),
  monthlySales: z
    .array(z.number())
    .describe("Exactly 6 whole numbers: estimated units sold in months 1-6 after launch, a cautious ramp"),
  priceBands: z
    .array(z.object({ label: z.string().describe("Market segment, no brand names"), minAed: z.number(), maxAed: z.number() }))
    .describe("3-4 typical price bands per unit in the UAE, as estimated ranges"),
});

export const planNarrativeSchema = z.object({
  market: z.object({
    summary: z.string().describe("2-3 sentences on the UAE market for this business, without statistics or brand names"),
    signals: z
      .array(z.object({ label: z.string(), value: z.string().describe("One or two words"), detail: z.string() }))
      .describe('Exactly 3, labelled "Demand", "Competition", "Positioning gap"'),
  }),
  risks: z
    .array(
      z.object({
        title: z.string().describe("Max ~5 words"),
        severity: z.enum(["High", "Medium", "Low"]),
        detail: z.string(),
        mitigation: z.string(),
      }),
    )
    .describe("3-4 risks specific to this business, highest first"),
  setup: z.object({
    summary: z.string().describe("2 sentences on the likely setup approach; no fees or regulations stated as fact"),
    options: z
      .array(
        z.object({
          name: z.string().describe("A general setup route, e.g. free zone or mainland licence; do not invent official licence names"),
          fit: z.string().describe("Who or what it suits, max ~10 words"),
          recommended: z.boolean().describe("true for exactly one option"),
        }),
      )
      .describe("2-3 options"),
    requirements: z
      .array(z.string())
      .describe("4-6 items typically needed, including any activity-specific approvals that may apply (marked as to be confirmed)"),
  }),
  nextActions: z
    .array(z.object({ title: z.string().describe("Imperative, max ~8 words"), detail: z.string(), timing: z.string().describe('e.g. "Week 1–2"') }))
    .describe("5-6 ordered actions to reach launch; the first is the most urgent"),
  launchPathLabel: z.string().describe('e.g. "8-week launch path"'),
  suppliers: z.object({
    description: z.string().describe("One sentence on what to source"),
    categories: z.array(z.string()).describe("3-5 supplier categories this business needs"),
  }),
  marketing: z.object({
    description: z.string().describe("One sentence on the launch marketing focus"),
    focusAreas: z.array(z.string()).describe("3-5 short focus areas, max ~3 words each"),
  }),
});

export type PlanInputs = z.infer<typeof planFinancialsSchema> & z.infer<typeof planNarrativeSchema>;

/** Claude's assessment plus the planning inputs from the parallel request. */
export type InitialAssessment = z.infer<typeof assessmentSchema> & { plan: PlanInputs };

/** What the browser sends: the founder's own words plus their onboarding answers. */
export const assessmentRequestSchema = z.object({
  idea: z.string().trim().min(1).max(600),
  profile: z
    .array(
      z.object({
        id: z.string().max(40),
        label: z.string().max(40),
        value: z.string().max(120),
      }),
    )
    .min(1)
    .max(12),
});

export type AssessmentRequest = z.infer<typeof assessmentRequestSchema>;

export const feasibilityLabel: Record<InitialAssessment["feasibility"]["status"], string> = {
  FEASIBLE: "Feasible",
  FEASIBLE_WITH_CHANGES: "Feasible with changes",
  CURRENTLY_NOT_FEASIBLE: "Currently not feasible",
};
