"use client";

import { useMemo } from "react";
import { buildMarketing } from "@/features/assessment/applyToMarketing";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { currentAssessmentInput, useAssessmentView } from "@/features/assessment/storage";
import { demoPlan } from "@/features/plan/demoPlan";
import { demoMarketing, demoMarketingText } from "../demoMarketing";
import { MarketingPlanView } from "./MarketingPlanView";

/** The Marketing screen for the analysed business, or the abaya demo when there's no onboarding. */
export function LiveMarketing() {
  const view = useAssessmentView();
  const assessment = view.kind === "live" ? view.assessment : null;
  const data = useMemo(() => {
    if (!assessment) return { marketing: demoMarketing, text: demoMarketingText, captionContext: undefined };
    const { profile } = currentAssessmentInput();
    return buildMarketing(assessment, buildPlan(demoPlan, assessment, profile), profile);
  }, [assessment]);

  if (view.kind === "checking" || view.kind === "unavailable") {
    return <AnalysisStatus state={view.kind} screen="Marketing Plan" />;
  }
  // Keyed so calendar and generator state reset when the data source changes.
  return (
    <MarketingPlanView
      key={assessment ? "live" : "demo"}
      plan={data.marketing}
      text={data.text}
      captionContext={data.captionContext}
    />
  );
}
