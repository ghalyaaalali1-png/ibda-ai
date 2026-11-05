import { z } from "zod";
import { locales } from "@/i18n/config";

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
        group: z
          .enum(["sourcing", "marketing", "other"])
          .describe('"sourcing" = stock, equipment, materials, packaging; "marketing" = launch marketing, ads, content; "other" = licence, website, deposits etc.'),
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

/*
 * Suppliers screen inputs. Options are supplier TYPES (e.g. "Wholesale produce
 * trader"), never named businesses — no research has been done yet (Agent
 * Guide Step 2). Kept flat to stay within the structured-output grammar limit.
 */
export const suppliersSchema = z.object({
  intro: z.string().describe("One sentence in KHITTA's voice on how it organised sourcing for this business"),
  categories: z
    .array(
      z.object({
        label: z.string().describe('Category name, e.g. "Fresh produce"'),
        summary: z.string().describe("One sentence on what this business needs from it"),
        rfqNeed: z.string().describe('What the enquiry asks for, completing "We are looking for …", with realistic first-order quantities'),
        rfqQuestions: z.array(z.string()).describe("4 questions to ask suppliers in this category"),
      }),
    )
    .describe("3-4 supplier categories this business needs"),
  options: z
    .array(
      z.object({
        category: z.string().describe("Exactly one of the category labels above"),
        name: z.string().describe('A supplier TYPE, e.g. "Wholesale produce trader" — never a business name'),
        location: z.string().describe('Where to find this type in the UAE, as a general area or channel, e.g. "Al Aweer market area · Dubai" or "Online B2B marketplaces"'),
        overseas: z.boolean(),
        offering: z.string().describe("Max ~8 words"),
        priceMinAed: z.number(),
        priceMaxAed: z.number(),
        priceUnit: z.string().describe('e.g. "per kg", "per unit", "per month"'),
        moqValue: z.number().describe("Typical minimum order; 0 if none"),
        moqUnit: z.string(),
        leadMinDays: z.number(),
        leadMaxDays: z.number(),
        bestFor: z.string().describe("Max ~8 words"),
        matchScore: z.number().describe("0-100 fit with this business's budget, quantities and positioning"),
        matchReasons: z.array(z.string()).describe("1-2 short reasons"),
        watchOut: z.string().describe('One short caution, or "" if none'),
        recommended: z.boolean().describe("true for exactly one option per category"),
        firstOrderEstimateAed: z.number().describe("Estimated cost of the first order from this option"),
        firstOrderBasis: z.string().describe('What that estimate covers, max ~6 words, e.g. "2 weeks of ingredients"'),
      }),
    )
    .describe("3 options per category"),
});

/* Marketing screen inputs (Agent Guide Step 4), split in two to stay within the grammar limit. */
export const marketingStrategySchema = z.object({
  objective: z.string().describe("One sentence launch objective with a measurable pre-launch goal"),
  positioning: z.string(),
  valueProposition: z.string(),
  channels: z
    .array(z.object({ name: z.string(), role: z.string().describe("Max ~10 words"), primary: z.boolean() }))
    .describe("4-5 channels; 1-2 primary"),
  phaseGoals: z
    .array(z.object({ phase: z.enum(["prelaunch", "launch", "growth"]), goal: z.string() }))
    .describe("Exactly 3, one per phase"),
  weeks: z
    .array(
      z.object({
        week: z.number().describe("1-13"),
        phase: z.enum(["prelaunch", "launch", "growth"]),
        focus: z.string().describe("Max ~3 words"),
        actions: z
          .array(z.object({ text: z.string(), tag: z.enum(["Content", "Creators", "Ads", "Community", "Setup", "Review"]) }))
          .describe("2-3 specific actions"),
      }),
    )
    .describe("13 weeks in order: pre-launch weeks 1-7, launch weeks 8-9, growth weeks 10-13"),
});

export const marketingExecutionSchema = z.object({
  postingRhythm: z.string().describe("One sentence"),
  contentPillars: z
    .array(
      z.object({
        title: z.string(),
        format: z.string(),
        cadence: z.string(),
        phase: z.string().describe('e.g. "Weeks 3–7"'),
        idea: z.string().describe("One concrete post idea for this business"),
      }),
    )
    .describe("6-8 content types fitting this business (teasers, behind the scenes, product reveals, customer content, etc.)"),
  budgetSplit: z
    .array(z.object({ label: z.string(), sharePercent: z.number(), note: z.string() }))
    .describe("3-5 lines splitting the launch marketing budget; shares add up to 100"),
  kpis: z
    .array(z.object({ label: z.string(), target: z.string(), when: z.string(), signal: z.string() }))
    .describe("5 launch KPIs with estimated targets (do not include first-month sales; the app adds it)"),
  nextMove: z.object({
    title: z.string().describe("Imperative, max ~8 words"),
    why: z.string(),
    steps: z.array(z.string()).describe("Exactly 3 steps; the last can mention KHITTA drafting the first post"),
  }),
});

/*
 * UAE setup guidance (Agent Guide, Step 3). Sources are referenced only by
 * id from the app's verified list, so Claude never writes URLs.
 */
const sourceId = z.string().describe('One id from the allowed official sources list, or "" if none applies');

export const setupSchema = z.object({
  summary: z.string().describe("2 sentences on the likely setup approach for this business and emirate; nothing stated as guaranteed"),
  activity: z.string().describe("The likely licence activity in plain words, to be confirmed in the licensing portal"),
  routes: z
    .array(
      z.object({
        name: z.string().describe("A general setup route; never invent official licence names"),
        fit: z.string().describe("Who or what it suits, max ~10 words"),
        recommended: z.boolean().describe("true for exactly one route"),
        sourceId,
      }),
    )
    .describe("2-3 routes that plausibly fit this business in this emirate"),
  path: z
    .array(
      z.object({
        stage: z.enum(["activity", "route", "authority", "approvals", "establishment", "next"]),
        title: z.string().describe("Imperative, max ~7 words"),
        detail: z.string().describe("One or two sentences specific to this business and emirate"),
        sourceId,
      }),
    )
    .describe("Exactly 6 steps in this order: activity, route, authority, approvals, establishment, next"),
  requirements: z
    .array(
      z.object({
        item: z.string(),
        level: z
          .enum(["likely", "depends", "confirm"])
          .describe('"likely" = usually needed for this kind of business; "depends" = only if the activity or set-up involves it; "confirm" = uncertain, check with the authority'),
        why: z.string().describe("One short sentence"),
        sourceId,
      }),
    )
    .describe("6-9 requirements covering all three levels where relevant"),
  sourceIds: z.array(z.string()).describe("3-6 allowed source ids the founder should use to verify this guidance"),
});

export type SetupInputs = z.infer<typeof setupSchema>;
/*
 * Launch-month content calendar and competitor inspiration (Agent Guide,
 * Step 4). Inspiration describes kinds of competitors and common patterns
 * only — never named accounts, handles or statistics.
 */
export const marketingCalendarSchema = z.object({
  weekGoals: z
    .array(z.object({ theme: z.enum(["teaser", "launch", "education", "proof"]), title: z.string().describe("Max ~5 words"), goal: z.string() }))
    .describe("Exactly 4, in order: teaser (pre-launch), launch, education (value content), proof (reviews and social proof)"),
  posts: z
    .array(
      z.object({
        week: z.number().describe("1-4"),
        day: z.string().describe('Short day, e.g. "Mon"'),
        platform: z.string().describe("A channel this business actually uses, e.g. Instagram, TikTok, WhatsApp, Google Business Profile"),
        contentType: z.string().describe('e.g. "Reel", "Carousel", "Story", "Broadcast", "Short video"'),
        topic: z.string().describe("The idea for this post, max ~10 words"),
        caption: z.string().describe("Ready-to-review caption or short script for this business; no invented reviews, prices or claims"),
        objective: z.string().describe("Max ~5 words, e.g. Grow waitlist"),
      }),
    )
    .describe("12 posts: 3 per week across the 4 weeks, in week order"),
  inspiration: z
    .array(
      z.object({
        competitorType: z.string().describe('A KIND of competitor, e.g. "Established local home bakeries on Instagram" — never a name or handle'),
        whatWorks: z.string().describe("A common pattern this kind of competitor uses"),
        howToAdapt: z.string().describe("How this founder could adapt it in their own way"),
        avoid: z.string().describe("What not to copy or do"),
      }),
    )
    .describe("3 items"),
});

export type SupplierInputs = z.infer<typeof suppliersSchema>;
export type MarketingInputs = z.infer<typeof marketingStrategySchema> &
  z.infer<typeof marketingExecutionSchema> &
  z.infer<typeof marketingCalendarSchema>;

/** Claude's assessment plus the plan, supplier and marketing inputs from the parallel requests. */
export type InitialAssessment = z.infer<typeof assessmentSchema> & {
  plan: PlanInputs;
  setup: SetupInputs;
  suppliers: SupplierInputs;
  marketing: MarketingInputs;
};

/** The whole assessment as one schema, to validate a stored or translated result. */
export const initialAssessmentSchema = assessmentSchema.extend({
  plan: planFinancialsSchema.extend(planNarrativeSchema.shape),
  setup: setupSchema,
  suppliers: suppliersSchema,
  marketing: marketingStrategySchema.extend(marketingExecutionSchema.shape).extend(marketingCalendarSchema.shape),
});

/**
 * What the browser sends: the founder's own words plus their onboarding
 * answers, and the interface language Claude should write in (English if
 * not given). The answers themselves are always stored in English.
 */
export const assessmentRequestSchema = z.object({
  locale: z.enum(locales).optional(),
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

/**
 * What to translate into another interface language: a stored assessment,
 * the founder's business name as they typed it, or both.
 */
export const translationRequestSchema = z
  .object({
    assessment: initialAssessmentSchema.optional(),
    businessName: z.string().trim().min(1).max(120).optional(),
    locale: z.enum(locales),
  })
  .refine((r) => r.assessment || r.businessName, { message: "Nothing to translate" });
