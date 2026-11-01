import {
  assessmentSchema,
  marketingCalendarSchema,
  marketingExecutionSchema,
  marketingStrategySchema,
  planFinancialsSchema,
  planNarrativeSchema,
  type InitialAssessment,
} from "@/features/assessment/schema";
import type { ModuleOutputs } from "./types";

/** Combines the module outputs into the single assessment the screens read today. */
export function assembleAssessment(m: ModuleOutputs): InitialAssessment {
  return {
    ...m.assessment,
    plan: { ...m.financials, ...m.narrative },
    setup: m.setup,
    suppliers: m.suppliers,
    marketing: { ...m.marketing_strategy, ...m.marketing_execution, ...m.marketing_calendar },
  };
}

/** The fields of `source` that belong to a module's schema. */
function pick<T>(source: object, shape: object): T {
  const fields = new Set(Object.keys(shape));
  return Object.fromEntries(Object.entries(source).filter(([key]) => fields.has(key))) as T;
}

/** Splits a combined assessment back into module outputs (the inverse of assembleAssessment). */
export function splitAssessment(a: InitialAssessment): ModuleOutputs {
  return {
    assessment: pick(a, assessmentSchema.shape),
    financials: pick(a.plan, planFinancialsSchema.shape),
    narrative: pick(a.plan, planNarrativeSchema.shape),
    setup: a.setup,
    suppliers: a.suppliers,
    marketing_strategy: pick(a.marketing, marketingStrategySchema.shape),
    marketing_execution: pick(a.marketing, marketingExecutionSchema.shape),
    marketing_calendar: pick(a.marketing, marketingCalendarSchema.shape),
  };
}
