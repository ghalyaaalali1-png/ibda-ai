import type { z } from "zod";
import type {
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

/** One module per Claude request; together they make up the business plan. */
export const moduleKeys = [
  "assessment",
  "financials",
  "narrative",
  "setup",
  "suppliers",
  "marketing_strategy",
  "marketing_execution",
  "marketing_calendar",
] as const;

export type ModuleKey = (typeof moduleKeys)[number];

/** What each module stores: Claude's structured output, validated by its schema. */
export type ModuleOutputs = {
  assessment: z.infer<typeof assessmentSchema>;
  financials: z.infer<typeof planFinancialsSchema>;
  narrative: z.infer<typeof planNarrativeSchema>;
  setup: z.infer<typeof setupSchema>;
  suppliers: z.infer<typeof suppliersSchema>;
  marketing_strategy: z.infer<typeof marketingStrategySchema>;
  marketing_execution: z.infer<typeof marketingExecutionSchema>;
  marketing_calendar: z.infer<typeof marketingCalendarSchema>;
};

export type ModuleDefinition<K extends ModuleKey = ModuleKey> = {
  key: K;
  /** Validates the module's output. */
  schema: z.ZodType<ModuleOutputs[K]>;
  /** Core fields that, when changed, mean this module must be regenerated. */
  dependsOnCore: readonly CoreField[];
  /** Modules whose output this module reads when it is generated. */
  dependsOn: readonly ModuleKey[];
};

export type ModuleStatus = "ready" | "stale" | "generating" | "failed" | "edited";

/**
 * One saved version of a module (mirrors the future `module_revisions`
 * table). Revisions are never edited; a change creates a new revision.
 */
export type ModuleRevision<K extends ModuleKey = ModuleKey> = {
  id: string;
  projectId: string;
  moduleKey: K;
  output: ModuleOutputs[K];
  /** The core-information version this revision was generated from. */
  coreVersionId: string;
  /** The revisions of the upstream modules it read, by module key. */
  upstreamRevisionIds: Partial<Record<ModuleKey, string>>;
  /** Language of the written text in `output`; translations attach to this revision. */
  sourceLocale: "en" | "ar";
  schemaVersion: number;
  promptVersion: number;
  model: string;
  source: "ai" | "user";
  createdAt: string;
};
