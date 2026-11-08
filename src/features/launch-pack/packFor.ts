import { buildMarketing } from "@/features/assessment/applyToMarketing";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { buildSupplierData } from "@/features/assessment/applyToSuppliers";
import type { InitialAssessment } from "@/features/assessment/schema";
import { demoFor } from "@/features/demo/localizedDemo";
import type { LaunchProfile } from "@/features/launch-profile/profile";
import type { Dictionary } from "@/i18n";
import { buildLaunchPack } from "./buildLaunchPack";
import { extrasFromAssessment } from "./extras";

/**
 * The launch pack (with the plan, suppliers and marketing it's built from)
 * for an analysed business, or for the abaya demo when there's none. Shared
 * by the Launch Pack screen and the PDF, so both show the same figures.
 */
export function packFor(assessment: InitialAssessment | null, profile: LaunchProfile | null, t: Dictionary) {
  const demo = demoFor(t.locale);
  if (!assessment || !profile) {
    const suppliers = { ...demo.suppliers, sourceNote: t.suppliers.demo.sourceNote, allocationLabel: t.suppliers.demo.allocationLabel };
    return buildLaunchPack({ plan: demo.plan, suppliers, marketing: demo.marketing, extras: demo.extras }, t);
  }
  const plan = buildPlan(demo.plan, assessment, profile, t);
  return buildLaunchPack(
    {
      plan,
      suppliers: buildSupplierData(assessment, plan, profile, t),
      marketing: buildMarketing(assessment, plan, profile, t).marketing,
      extras: extrasFromAssessment(assessment),
    },
    t,
  );
}
