"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { buildSupplierData } from "@/features/assessment/applyToSuppliers";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { addGuestSupplierItem, removeGuestSupplierGroup, useAssessmentView } from "@/features/assessment/storage";
import { demoFor } from "@/features/demo/localizedDemo";
import { useProject } from "@/features/projects/ProjectProvider";
import { displayProfileLine } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import type { SupplierEditor } from "./AddSupplierItem";
import { SuppliersWorkspace } from "./SuppliersWorkspace";

/** The Suppliers screen for the analysed business, or the abaya demo when there's no onboarding. */
export function LiveSuppliers() {
  const { t, locale } = useI18n();
  const view = useAssessmentView();
  const project = useProject();
  const router = useRouter();
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

  // Supplier groups can be added and removed for a real plan: saved in a project, or in this tab for a guest.
  const editor = useMemo<SupplierEditor | undefined>(() => {
    if (view.kind !== "live") return undefined;
    if (project) {
      const send = async (body: unknown) => {
        const res = await fetch(`/api/projects/${project.id}/suppliers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json().catch(() => ({}))) as { status?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? t.suppliers.addItem.failed);
        router.refresh();
        return data.status;
      };
      return {
        guest: false,
        add: async (item) => ((await send({ action: "add", item })) === "exists" ? "exists" : "added"),
        remove: async (label) => {
          await send({ action: "remove", label });
        },
      };
    }
    return {
      guest: true,
      add: async (item) => {
        const known = assessment?.suppliers.categories.some((c) => c.label.trim().toLowerCase() === item.trim().toLowerCase());
        if (known) return "exists";
        await addGuestSupplierItem(item, locale);
        return "added";
      },
      remove: async (label) => removeGuestSupplierGroup(label, locale),
    };
  }, [view.kind, project, router, t, assessment, locale]);

  if (view.kind !== "live" && view.kind !== "demo") {
    return view.kind === "translationFailed" ? (
      <AnalysisStatus state={view.kind} screen="suppliers" message={view.message} onRetry={view.retry} />
    ) : (
      <AnalysisStatus state={view.kind} screen="suppliers" />
    );
  }
  // Keyed so category, comparison and enquiry state reset when the data source changes.
  return <SuppliersWorkspace key={assessment ? "live" : "demo"} data={data.data} budget={data.budget} editor={editor} />;
}
