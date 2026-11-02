import type { ActivityLogEntry, AgentStage } from "@/features/analysis/types";
import { english, type Dictionary } from "@/i18n";
import type { InitialAssessment } from "./schema";

/** Replaces stage outcome lines with Claude's findings where a stage has a counterpart. */
export function withAssessmentResults(stages: AgentStage[], a: InitialAssessment, t: Dictionary = english): AgentStage[] {
  const r = t.analysis.results;
  const route = a.setup.routes.find((o) => o.recommended) ?? a.setup.routes[0];
  const results: Record<string, string> = {
    understand: a.ideaSummary.headline,
    market: r.targetCustomer(a.targetCustomer.headline),
    feasibility: `${t.analysis.feasibility[a.feasibility.status]} — ${a.feasibility.headline}`,
    suppliers: r.supplierCategories(a.suppliers.categories.length),
    setup: r.route(route?.name ?? null),
    plan: r.nextStep(a.recommendedNextStep.title),
  };
  return stages.map((s) => (results[s.id] ? { ...s, result: results[s.id] } : s));
}

/** Activity entries for the assumptions and open questions Claude flagged. */
export function assessmentLogEntries(a: InitialAssessment, startMs: number, t: Dictionary = english): ActivityLogEntry[] {
  const entries = [
    ...a.keyAssumptions.slice(0, 6).map((k) => ({
      action: "Assuming" as const,
      label: `${k.assumption} (${t.analysis.evidence[k.type]})`,
    })),
    ...a.missingInformation.slice(0, 3).map((m) => ({
      action: "Needs input" as const,
      label: m.question,
    })),
  ];
  return entries.map((e, i) => ({
    key: `assessment.${i}`,
    action: e.action,
    label: e.label,
    stageTitle: t.analysis.initialAssessment,
    atMs: startMs + (i + 1) * 300,
    status: "done",
  }));
}
