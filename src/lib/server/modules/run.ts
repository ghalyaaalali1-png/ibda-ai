import "server-only";
import type { AssessmentRequest } from "@/features/assessment/schema";
import { runInDependencyOrder, type ModuleRunner } from "@/features/plan-modules/dependencies";
import { moduleKeys, type ModuleKey, type ModuleOutputs } from "@/features/plan-modules/types";
import { founderInputFor, moduleGenerators, type GenerationContext } from "./generators";

/**
 * Generates these plan modules for the founder's answers, each as soon as
 * the modules it reads are ready (today: seven in parallel, suppliers after
 * financials). Modules not being generated can be supplied in `existing`.
 */
export function runModules(
  input: AssessmentRequest,
  keys: readonly ModuleKey[] = moduleKeys,
  existing: Partial<ModuleOutputs> = {},
  supplierItems: string[] = [],
) {
  const ctx: GenerationContext = { ...input, founderInput: founderInputFor(input), supplierItems };
  const run = ((key: ModuleKey, upstream: Partial<ModuleOutputs>) =>
    (moduleGenerators[key] as (c: GenerationContext, u: Partial<ModuleOutputs>) => Promise<unknown>)(ctx, upstream)) as ModuleRunner;
  return runInDependencyOrder(keys, run, existing);
}

/** Generates every plan module. */
export async function runAllModules(input: AssessmentRequest): Promise<ModuleOutputs> {
  return (await runModules(input)) as ModuleOutputs;
}
