"use client";

import { useMemo } from "react";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { buildSupplierData } from "@/features/assessment/applyToSuppliers";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { currentAssessmentInput, useAssessmentView } from "@/features/assessment/storage";
import { demoPlan } from "@/features/plan/demoPlan";
import { demoSupplierData } from "../demoSuppliers";
import { SuppliersWorkspace } from "./SuppliersWorkspace";

/** The Suppliers screen for the analysed business, or the abaya demo when there's no onboarding. */
export function LiveSuppliers() {
  const view = useAssessmentView();
  const assessment = view.kind === "live" ? view.assessment : null;
  const data = useMemo(() => {
    if (!assessment) return { data: demoSupplierData, budget: demoPlan.budget.total };
    const { profile } = currentAssessmentInput();
    const plan = buildPlan(demoPlan, assessment, profile);
    return { data: buildSupplierData(assessment, plan, profile), budget: plan.budget.total };
  }, [assessment]);

  if (view.kind === "checking" || view.kind === "unavailable") {
    return <AnalysisStatus state={view.kind} screen="Suppliers" />;
  }
  // Keyed so category, comparison and enquiry state reset when the data source changes.
  return <SuppliersWorkspace key={assessment ? "live" : "demo"} data={data.data} budget={data.budget} />;
}
