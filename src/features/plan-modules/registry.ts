import {
  assessmentSchema,
  marketingCalendarSchema,
  marketingExecutionSchema,
  marketingStrategySchema,
  planFinancialsSchema,
  planNarrativeSchema,
  setupSchema,
  suppliersSchema,
} from "@/features/assessment/schema";
import type { CoreField } from "@/features/project/coreInfo";
import type { ModuleDefinition, ModuleKey } from "./types";

// What the business is: a change here affects every module.
const BUSINESS: CoreField[] = ["idea", "offering", "businessModel", "extras"];
const LOCATION: CoreField[] = ["emirate", "area"];

/**
 * Every plan module, the schema of its output and what it depends on.
 * The dependency map is recorded in docs/khitta-v2/decisions.md.
 */
export const moduleDefinitions: { [K in ModuleKey]: ModuleDefinition<K> } = {
  assessment: {
    key: "assessment",
    schema: assessmentSchema,
    dependsOnCore: [...BUSINESS, ...LOCATION, "budget", "targetCustomer", "salesChannel", "targetPrice", "stage"],
    dependsOn: [],
  },
  financials: {
    key: "financials",
    schema: planFinancialsSchema,
    dependsOnCore: [...BUSINESS, ...LOCATION, "budget", "targetCustomer", "salesChannel", "targetPrice"],
    dependsOn: [],
  },
  narrative: {
    key: "narrative",
    schema: planNarrativeSchema,
    dependsOnCore: [...BUSINESS, ...LOCATION, "budget", "targetCustomer", "salesChannel", "stage"],
    dependsOn: [],
  },
  setup: {
    key: "setup",
    schema: setupSchema,
    dependsOnCore: [...BUSINESS, ...LOCATION, "salesChannel"],
    dependsOn: [],
  },
  suppliers: {
    key: "suppliers",
    schema: suppliersSchema,
    dependsOnCore: [...BUSINESS, ...LOCATION, "salesChannel"],
    // First orders are sized to the financial plan's sourcing budget.
    dependsOn: ["financials"],
  },
  marketing_strategy: {
    key: "marketing_strategy",
    schema: marketingStrategySchema,
    dependsOnCore: [...BUSINESS, ...LOCATION, "targetCustomer", "salesChannel"],
    dependsOn: [],
  },
  marketing_execution: {
    key: "marketing_execution",
    schema: marketingExecutionSchema,
    dependsOnCore: [...BUSINESS, "targetCustomer", "salesChannel", "targetPrice"],
    dependsOn: [],
  },
  marketing_calendar: {
    key: "marketing_calendar",
    schema: marketingCalendarSchema,
    dependsOnCore: [...BUSINESS, ...LOCATION, "targetCustomer", "salesChannel"],
    dependsOn: [],
  },
};
