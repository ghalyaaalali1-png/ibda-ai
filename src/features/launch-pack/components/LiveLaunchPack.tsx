"use client";

import { useMemo } from "react";
import { buildMarketing } from "@/features/assessment/applyToMarketing";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { buildSupplierData } from "@/features/assessment/applyToSuppliers";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { currentAssessmentInput, useAssessmentView } from "@/features/assessment/storage";
import { demoMarketing } from "@/features/marketing/demoMarketing";
import { demoPlan } from "@/features/plan/demoPlan";
import { demoSupplierData } from "@/features/suppliers/demoSuppliers";
import { buildLaunchPack } from "../buildLaunchPack";
import { demoExtras, extrasFromAssessment } from "../extras";
import { LaunchPackView } from "./LaunchPackView";

/** The launch pack for the analysed business, or the abaya demo when there's no onboarding. */
export function LiveLaunchPack() {
  const view = useAssessmentView();
  const assessment = view.kind === "live" ? view.assessment : null;
  const pack = useMemo(() => {
    if (!assessment) {
      return buildLaunchPack({ plan: demoPlan, suppliers: demoSupplierData, marketing: demoMarketing, extras: demoExtras });
    }
    const { profile } = currentAssessmentInput();
    const plan = buildPlan(demoPlan, assessment, profile);
    return buildLaunchPack({
      plan,
      suppliers: buildSupplierData(assessment, plan, profile),
      marketing: buildMarketing(assessment, plan, profile).marketing,
      extras: extrasFromAssessment(assessment),
    });
  }, [assessment]);

  if (view.kind === "checking" || view.kind === "unavailable") {
    return <AnalysisStatus state={view.kind} screen="Launch Pack" />;
  }
  return (
    <LaunchPackView
      key={assessment ? "live" : "demo"}
      pack={pack}
      sourceNote={
        assessment
          ? "Built from Ibda's analysis of your answers — figures are estimates, not yet verified"
          : "Prototype launch pack — demo data"
      }
    />
  );
}
