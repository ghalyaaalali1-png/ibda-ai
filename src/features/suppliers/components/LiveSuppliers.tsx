"use client";

import { useMemo } from "react";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { buildSupplierData } from "@/features/assessment/applyToSuppliers";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { useAssessmentView } from "@/features/assessment/storage";
import { demoFor } from "@/features/demo/localizedDemo";
import { displayProfileLine } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import { SuppliersWorkspace } from "./SuppliersWorkspace";

/** The Suppliers screen for the analysed business, or the abaya demo when there's no onboarding. */
export function LiveSuppliers() {
  const { t } = useI18n();
  const view = useAssessmentView();
  const assessment = view.kind === "live" ? view.assessment : null;
  // The founder's answers, with the business name in the interface language.
  const profile = view.kind === "live" ? view.profile : null;
  const data = useMemo(() => {
    const { plan: demoPlan, suppliers: demoSupplierData } = demoFor(t.locale);
    if (!assessment || !profile) {
      const demo = t.suppliers.demo;
      return {
        data: {
          ...demoSupplierData,
          profileLine: displayProfileLine(t, demoPlan.profile),
          intro: demo.intro(demoSupplierData.suppliers.length),
          sourceNote: demo.sourceNote,
          supplierBadge: demo.badge,
          contactNote: demo.contactNote,
          shortlistCriteria: demo.criteria,
          allocationLabel: demo.allocationLabel,
          brief: { ...demoSupplierData.brief, highlights: demo.highlights },
        },
        budget: demoPlan.budget.total,
      };
    }
    const plan = buildPlan(demoPlan, assessment, profile, t);
    return { data: buildSupplierData(assessment, plan, profile, t), budget: plan.budget.total };
  }, [assessment, profile, t]);

  if (view.kind !== "live" && view.kind !== "demo") {
    return view.kind === "translationFailed" ? (
      <AnalysisStatus state={view.kind} screen="suppliers" message={view.message} onRetry={view.retry} />
    ) : (
      <AnalysisStatus state={view.kind} screen="suppliers" />
    );
  }
  // Keyed so category, comparison and enquiry state reset when the data source changes.
  return <SuppliersWorkspace key={assessment ? "live" : "demo"} data={data.data} budget={data.budget} />;
}
