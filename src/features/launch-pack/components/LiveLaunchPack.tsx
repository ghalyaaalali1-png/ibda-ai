"use client";

import { useMemo } from "react";
import { buildMarketing } from "@/features/assessment/applyToMarketing";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { buildSupplierData } from "@/features/assessment/applyToSuppliers";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { useAssessmentView } from "@/features/assessment/storage";
import { demoFor } from "@/features/demo/localizedDemo";
import { useI18n } from "@/i18n/I18nProvider";
import { buildLaunchPack } from "../buildLaunchPack";
import { extrasFromAssessment } from "../extras";
import { LaunchPackView } from "./LaunchPackView";

/** The launch pack for the analysed business, or the abaya demo when there's no onboarding. */
export function LiveLaunchPack() {
  const { t } = useI18n();
  const view = useAssessmentView();
  const assessment = view.kind === "live" ? view.assessment : null;
  // The founder's answers, with the business name in the interface language.
  const profile = view.kind === "live" ? view.profile : null;
  const pack = useMemo(() => {
    const { plan: demoPlan, suppliers: demoSupplierData, marketing: demoMarketing, extras: demoExtras } = demoFor(t.locale);
    if (!assessment || !profile) {
      const demo = t.suppliers.demo;
      const suppliers = {
        ...demoSupplierData,
        sourceNote: demo.sourceNote,
        allocationLabel: demo.allocationLabel,
      };
      return buildLaunchPack({ plan: demoPlan, suppliers, marketing: demoMarketing, extras: demoExtras }, t);
    }
    const plan = buildPlan(demoPlan, assessment, profile, t);
    return buildLaunchPack(
      {
        plan,
        suppliers: buildSupplierData(assessment, plan, profile, t),
        marketing: buildMarketing(assessment, plan, profile, t).marketing,
        extras: extrasFromAssessment(assessment),
      },
      t,
    );
  }, [assessment, profile, t]);

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
