"use client";

import { useMemo } from "react";
import { buildMarketing } from "@/features/assessment/applyToMarketing";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { useAssessmentView } from "@/features/assessment/storage";
import { demoFor } from "@/features/demo/localizedDemo";
import { displayProfileLine } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import { MarketingPlanView } from "./MarketingPlanView";

/** The Marketing screen for the analysed business, or the abaya demo when there's no onboarding. */
export function LiveMarketing() {
  const { t } = useI18n();
  const view = useAssessmentView();
  const assessment = view.kind === "live" ? view.assessment : null;
  // The founder's answers, with the business name in the interface language.
  const profile = view.kind === "live" ? view.profile : null;
  const data = useMemo(() => {
    const { plan: demoPlan, marketing: demoMarketing } = demoFor(t.locale);
    if (!assessment || !profile) {
      const demo = t.marketing.demo;
      return {
        marketing: demoMarketing,
        text: {
          profileLine: displayProfileLine(t, demoPlan.profile),
          intro: demo.intro,
          sourceNote: demo.sourceNote,
          budgetFootnote: demo.footnote,
        },
        captionContext: undefined,
      };
    }
    return buildMarketing(assessment, buildPlan(demoPlan, assessment, profile, t), profile, t);
  }, [assessment, profile, t]);

  if (view.kind !== "live" && view.kind !== "demo") {
    return view.kind === "translationFailed" ? (
      <AnalysisStatus state={view.kind} screen="marketing" message={view.message} onRetry={view.retry} />
    ) : (
      <AnalysisStatus state={view.kind} screen="marketing" />
    );
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
