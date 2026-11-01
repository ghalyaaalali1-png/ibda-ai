"use client";

import { useMemo } from "react";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { currentAssessmentInput, useAssessmentView } from "@/features/assessment/storage";
import type { BusinessPlan } from "../types";
import { PlanDashboard } from "./PlanDashboard";

/** The dashboard with Claude's initial assessment applied, or the abaya demo when there's no onboarding. */
export function LivePlanDashboard({ plan }: { plan: BusinessPlan }) {
  const view = useAssessmentView();
  const assessment = view.kind === "live" ? view.assessment : null;
  const merged = useMemo(
    () => (assessment ? buildPlan(plan, assessment, currentAssessmentInput().profile) : plan),
    [plan, assessment],
  );

  if (view.kind === "checking" || view.kind === "unavailable") {
    return <AnalysisStatus state={view.kind} screen="Business Plan" />;
  }
  return (
    <PlanDashboard
      plan={merged}
      sourceNote={assessment ? "Prepared by Claude from your answers — figures are estimates, not yet verified" : undefined}
    />
  );
}
