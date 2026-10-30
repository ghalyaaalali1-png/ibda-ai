import type { ActivityLogEntry, AgentStage } from "@/features/analysis/types";
import { feasibilityLabel, type InitialAssessment } from "./schema";

const evidenceText = {
  USER_PROVIDED: "user provided",
  ESTIMATE: "estimate",
  NOT_YET_CONFIRMED: "not yet confirmed",
} as const;

/** Replaces stage outcome lines with Claude's findings where a stage has a counterpart. */
export function withAssessmentResults(stages: AgentStage[], a: InitialAssessment): AgentStage[] {
  const results: Record<string, string> = {
    understand: a.ideaSummary.headline,
    market: `Target customer: ${a.targetCustomer.headline}`,
    feasibility: `${feasibilityLabel[a.feasibility.status]} — ${a.feasibility.headline}`,
    suppliers: `${a.suppliers.categories.length} supplier categories identified`,
    setup: `Suggested route: ${(a.plan.setup.options.find((o) => o.recommended) ?? a.plan.setup.options[0])?.name ?? "to be confirmed"}`,
    plan: `Next step: ${a.recommendedNextStep.title}`,
  };
  return stages.map((s) => (results[s.id] ? { ...s, result: results[s.id] } : s));
}

/** Activity entries for the assumptions and open questions Claude flagged. */
export function assessmentLogEntries(a: InitialAssessment, startMs: number): ActivityLogEntry[] {
  const entries = [
    ...a.keyAssumptions.slice(0, 6).map((k) => ({
      action: "Assuming" as const,
      label: `${k.assumption} (${evidenceText[k.type]})`,
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
    stageTitle: "Initial assessment",
    atMs: startMs + (i + 1) * 300,
    status: "done",
  }));
}
