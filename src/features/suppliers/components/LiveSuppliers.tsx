"use client";

import { useMemo } from "react";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { buildSupplierData } from "@/features/assessment/applyToSuppliers";
import { currentAssessmentInput, useStoredAssessment } from "@/features/assessment/storage";
import { demoPlan } from "@/features/plan/demoPlan";
import { demoSupplierData } from "../demoSuppliers";
import { SuppliersWorkspace } from "./SuppliersWorkspace";

/** The Suppliers screen for the analysed business, or the abaya demo when there's no live assessment. */
export function LiveSuppliers() {
  const assessment = useStoredAssessment();
  const view = useMemo(() => {
    if (!assessment) return { data: demoSupplierData, budget: demoPlan.budget.total };
    const { profile } = currentAssessmentInput();
    const plan = buildPlan(demoPlan, assessment, profile);
    return { data: buildSupplierData(assessment, plan, profile), budget: plan.budget.total };
  }, [assessment]);

  // Keyed so category, comparison and enquiry state reset when the data source changes.
  return <SuppliersWorkspace key={assessment ? "live" : "demo"} data={view.data} budget={view.budget} />;
}
