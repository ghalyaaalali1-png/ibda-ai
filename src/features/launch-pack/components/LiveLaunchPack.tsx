"use client";

import { useMemo } from "react";
import { buildMarketing } from "@/features/assessment/applyToMarketing";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { buildSupplierData } from "@/features/assessment/applyToSuppliers";
import { currentAssessmentInput, useStoredAssessment } from "@/features/assessment/storage";
import { demoMarketing } from "@/features/marketing/demoMarketing";
import { demoPlan } from "@/features/plan/demoPlan";
import { demoSupplierData } from "@/features/suppliers/demoSuppliers";
import { buildLaunchPack } from "../buildLaunchPack";
import { demoExtras, extrasFromAssessment } from "../extras";
import { LaunchPackView } from "./LaunchPackView";

/** The launch pack for the analysed business, or the abaya demo when there's no live assessment. */
export function LiveLaunchPack() {
  const assessment = useStoredAssessment();
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
