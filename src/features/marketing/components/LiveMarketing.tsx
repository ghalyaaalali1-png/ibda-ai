"use client";

import { useMemo } from "react";
import { buildMarketing } from "@/features/assessment/applyToMarketing";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { currentAssessmentInput, useStoredAssessment } from "@/features/assessment/storage";
import { demoPlan } from "@/features/plan/demoPlan";
import { demoMarketing, demoMarketingText } from "../demoMarketing";
import { MarketingPlanView } from "./MarketingPlanView";

/** The Marketing screen for the analysed business, or the abaya demo when there's no live assessment. */
export function LiveMarketing() {
  const assessment = useStoredAssessment();
  const view = useMemo(() => {
    if (!assessment) return { marketing: demoMarketing, text: demoMarketingText, captionContext: undefined };
    const { profile } = currentAssessmentInput();
    return buildMarketing(assessment, buildPlan(demoPlan, assessment, profile), profile);
  }, [assessment]);

  // Keyed so calendar and generator state reset when the data source changes.
  return (
    <MarketingPlanView
      key={assessment ? "live" : "demo"}
      plan={view.marketing}
      text={view.text}
      captionContext={view.captionContext}
    />
  );
}
