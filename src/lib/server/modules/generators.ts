import "server-only";
import type { z } from "zod";
import { sourcingBudget } from "@/features/assessment/applyToPlan";
import {
  assessmentSchema,
  marketingCalendarSchema,
  marketingExecutionSchema,
  marketingStrategySchema,
  planFinancialsSchema,
  planNarrativeSchema,
  setupSchema,
  supplierItemSchema,
  suppliersSchema,
  type AssessmentRequest,
} from "@/features/assessment/schema";
import { emirateFrom, licensingSourcesFor, sourcesFor } from "@/features/plan/officialSources";
import type { ModuleKey, ModuleOutputs } from "@/features/plan-modules/types";
import {
  assessmentSystemPrompt,
  marketingCalendarSystemPrompt,
  marketingSystemPrompt,
  planInputsSystemPrompt,
  setupSystemPrompt,
  suppliersSystemPrompt,
} from "@/lib/server/ibda-agent-guide";
import { inLanguage } from "@/lib/server/language";
import { relinkRequested } from "@/features/suppliers/items";
import type { Locale } from "@/i18n/config";
import { ask, emptyParts } from "./ask";

/**
 * What every module generator is given: the founder's answers, their text as
 * sent to Claude, the language to write in, and any items the founder asked
 * suppliers for by name (kept when the supplier section is rebuilt).
 */
export type GenerationContext = AssessmentRequest & { founderInput: string; supplierItems?: string[] };

type Generator<K extends ModuleKey> = (ctx: GenerationContext, upstream: Partial<ModuleOutputs>) => Promise<ModuleOutputs[K]>;

/** The founder's idea and answers as one block of the user message. */
export function founderInputFor({ idea, profile }: AssessmentRequest) {
  const answers = profile.map((f) => `- ${f.label}: ${f.value} (USER_PROVIDED)`).join("\n");
  return `<founder_input>
Idea in their own words:
${idea}

Onboarding answers:
${answers}
</founder_input>`;
}

const aedText = (n: number) => `AED ${Math.round(n).toLocaleString("en-US")}`;

/**
 * The plan's sourcing budget, for the supplier request — so the shortlist's
 * first orders match the quantities and amounts the plan already set.
 */
function supplierBudgetBrief(f: z.infer<typeof planFinancialsSchema>) {
  const { lines, total } = sourcingBudget(f);
  const firstMonth = Math.round(f.monthlySales[0] ?? 0);
  const volume = firstMonth > 0 ? ` The plan expects about ${firstMonth} ${f.unit.plural} sold in the first month.` : "";
  if (lines.length === 0) {
    return `\n\nThe founder's total startup budget is ${aedText(f.budget.amountAed)}. Keep every first order small and realistic for it.${volume}`;
  }
  return `\n\nThe founder's business plan already budgets these one-off sourcing costs:
${lines.map((l) => `- ${l.label}: ${aedText(l.amount)} (${l.note})`).join("\n")}
Sourcing total: ${aedText(total)}.${volume}
Size every first order to this plan: the firstOrderEstimateAed values of the recommended options must add up to no more than ${aedText(total)}, and their quantities must match what these lines buy. Do not plan bigger first orders than the plan pays for.`;
}

/** The setup task, limited to this emirate's verified sources (plus federal ones) so guidance can't mix emirates. */
function setupTask(profile: AssessmentRequest["profile"]) {
  const emirate = emirateFrom(profile.find((f) => f.id === "location")?.value);
  const allowedSources = sourcesFor(emirate)
    .map((src) => `- ${src.id}: ${src.name} — ${src.covers}`)
    .join("\n");
  // Tell Claude plainly when there's no verified licensing authority for this emirate.
  const licensingNote =
    licensingSourcesFor(emirate).length > 0
      ? ""
      : `\n\nNo verified licensing authority is available for ${emirate ?? "this emirate"}. Do not name one. Where the licensing authority matters, say to verify through the official UAE government portal (u.ae) and use the "uae-portal" source.`;
  return `Prepare the UAE setup guidance for this founder's business${emirate ? ` in ${emirate}` : ""}.\n\nAllowed official sources (use these ids only):\n${allowedSources}${licensingNote}`;
}

/** One Claude request per plan module. */
export const moduleGenerators: { [K in ModuleKey]: Generator<K> } = {
  assessment: ({ founderInput, locale }) =>
    ask(inLanguage(assessmentSystemPrompt, locale), assessmentSchema, founderInput, "Prepare the initial business assessment for this founder.", (o) =>
      emptyParts({ "ideaSummary.headline": o.ideaSummary.headline, "feasibility.reasoning": o.feasibility.reasoning, keyAssumptions: o.keyAssumptions, "recommendedNextStep.title": o.recommendedNextStep.title }),
    ),

  financials: ({ founderInput, locale }) =>
    ask(inLanguage(planInputsSystemPrompt, locale), planFinancialsSchema, founderInput, "Prepare the FINANCIAL planning inputs (unit, budget, costs, pricing, sales, price bands) for this founder's business.", (o) =>
      emptyParts({ "unit.singular": o.unit.singular, "budget.amountAed": o.budget.amountAed, startupCosts: o.startupCosts, "pricing.heroAed": o.pricing.heroAed, unitCosts: o.unitCosts, monthlySales: o.monthlySales, priceBands: o.priceBands }),
    ),

  narrative: ({ founderInput, locale }) =>
    ask(inLanguage(planInputsSystemPrompt, locale), planNarrativeSchema, founderInput, "Prepare the NARRATIVE planning inputs (market, risks, UAE setup, next actions, suppliers, marketing) for this founder's business.", (o) =>
      emptyParts({ "market.summary": o.market.summary, risks: o.risks, nextActions: o.nextActions, launchPathLabel: o.launchPathLabel, "suppliers.categories": o.suppliers.categories, "marketing.focusAreas": o.marketing.focusAreas }),
    ),

  setup: ({ founderInput, profile, locale }) =>
    ask(inLanguage(setupSystemPrompt, locale), setupSchema, founderInput, setupTask(profile), (o) =>
      emptyParts({ summary: o.summary, activity: o.activity, routes: o.routes, path: o.path, requirements: o.requirements }),
    ),

  // Reads the financial plan so its first orders fit the plan's sourcing budget.
  suppliers: async ({ founderInput, locale, supplierItems = [] }, upstream) => {
    const asked = supplierItems.length
      ? `\n\nThe founder also asked for suppliers for these items by name: ${supplierItems.map((i) => `"${i}"`).join(", ")}. In addition to the categories you choose, include one category for each of these items, named after it, with 3 options each.`
      : "";
    const output = await ask(inLanguage(suppliersSystemPrompt, locale), suppliersSchema, founderInput, `Prepare the supplier categories, supplier types and enquiry details for this founder's first launch.${supplierBudgetBrief(upstream.financials!)}${asked}`, (o) =>
      emptyParts({ categories: o.categories, options: o.options }),
      "low",
    );
    return relinkRequested(output, supplierItems);
  },

  marketing_strategy: ({ founderInput, locale }) =>
    ask(inLanguage(marketingSystemPrompt, locale), marketingStrategySchema, founderInput, "Prepare the launch marketing strategy and 13-week calendar for this founder's business.", (o) =>
      emptyParts({ objective: o.objective, channels: o.channels, phaseGoals: o.phaseGoals, weeks: o.weeks }),
      "low",
    ),

  marketing_execution: ({ founderInput, locale }) =>
    ask(inLanguage(marketingSystemPrompt, locale), marketingExecutionSchema, founderInput, "Prepare the content plan, marketing budget split, launch KPIs and recommended next move for this founder's business.", (o) =>
      emptyParts({ contentPillars: o.contentPillars, budgetSplit: o.budgetSplit, kpis: o.kpis, "nextMove.title": o.nextMove.title, "nextMove.steps": o.nextMove.steps }),
      "low",
    ),

  marketing_calendar: ({ founderInput, locale }) =>
    ask(
      inLanguage(marketingCalendarSystemPrompt, locale),
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
};

/**
 * One supplier category for an item the founder asked for by name ("cups",
 * "staff shirts"), with 3 supplier types, sized to their startup budget and
 * different from the categories they already have.
 */
export function generateSupplierItem(
  input: AssessmentRequest & { locale: Locale },
  item: string,
  existingLabels: string[],
  financials?: z.infer<typeof planFinancialsSchema>,
) {
  const budget = financials ? aedText(financials.budget.amountAed) : "their stated budget";
  const have = existingLabels.length ? ` They already have supplier categories for: ${existingLabels.join("; ")}. Don't repeat those.` : "";
  const task = `The founder asked for suppliers for one more item: "${item}". Prepare ONE supplier category for exactly this item (name the category after it), with 3 supplier-type options in that category. Their total startup budget is ${budget}; keep the first order small and realistic for a cautious launch.${have} If the item doesn't fit this business, still answer for the item as asked.`;
  return ask(inLanguage(suppliersSystemPrompt, input.locale), supplierItemSchema, founderInputFor(input), task, (o) =>
    emptyParts({ "category.label": o.category.label, options: o.options }),
    "low",
  );
}
