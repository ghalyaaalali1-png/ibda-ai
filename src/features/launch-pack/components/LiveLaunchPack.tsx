"use client";

import { useMemo } from "react";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { useAssessmentView } from "@/features/assessment/storage";
import { useI18n } from "@/i18n/I18nProvider";
import { packFor } from "../packFor";
import { LaunchPackView } from "./LaunchPackView";

/** The launch pack for the analysed business, or the abaya demo when there's no onboarding. */
export function LiveLaunchPack() {
  const { t } = useI18n();
  const view = useAssessmentView();
  const assessment = view.kind === "live" ? view.assessment : null;
  // The founder's answers, with the business name in the interface language.
  const profile = view.kind === "live" ? view.profile : null;
  const pack = useMemo(() => packFor(assessment, profile, t), [assessment, profile, t]);

  if (view.kind !== "live" && view.kind !== "demo") {
    return view.kind === "translationFailed" ? (
      <AnalysisStatus state={view.kind} screen="launchPack" message={view.message} onRetry={view.retry} />
    ) : (
      <AnalysisStatus state={view.kind} screen="launchPack" />
    );
  }
  return (
    <LaunchPackView
      key={assessment ? "live" : "demo"}
      pack={pack}
      sourceNote={assessment ? t.launchPack.sourceLive : t.launchPack.sourceDemo}
      supplierLabel={assessment ? t.suppliers.built.badgePlural : t.suppliers.demo.badgePlural}
    />
  );
}
