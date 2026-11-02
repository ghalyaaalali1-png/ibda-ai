"use client";

import { useMemo } from "react";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { currentAssessmentInput, useAssessmentView } from "@/features/assessment/storage";
import { useI18n } from "@/i18n/I18nProvider";
import { demoFor } from "@/features/demo/localizedDemo";
import { PlanDashboard } from "./PlanDashboard";

/** The dashboard with Claude's initial assessment applied, or the abaya demo when there's no onboarding. */
export function LivePlanDashboard() {
  const { t } = useI18n();
  const plan = demoFor(t.locale).plan;
  const view = useAssessmentView();
  const assessment = view.kind === "live" ? view.assessment : null;
  const merged = useMemo(
    () =>
      assessment
        ? buildPlan(plan, assessment, currentAssessmentInput().profile, t)
        : { ...plan, market: { ...plan.market, priceBandsNote: t.plan.demo.priceBandsNote } },
    [plan, assessment, t],
  );

  if (view.kind !== "live" && view.kind !== "demo") {
    return view.kind === "translationFailed" ? (
      <AnalysisStatus state={view.kind} screen="plan" message={view.message} onRetry={view.retry} />
    ) : (
      <AnalysisStatus state={view.kind} screen="plan" />
    );
  }
  return <PlanDashboard plan={merged} sourceNote={assessment ? t.plan.sourceLive : undefined} />;
}
