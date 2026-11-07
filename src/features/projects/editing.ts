import type { LaunchProfile } from "@/features/launch-profile/profile";
import { budgetQuestion, abayaQuestions, generalQuestions, locationQuestion } from "@/features/onboarding/questions";
import { affectedModules } from "@/features/plan-modules/dependencies";
import type { ModuleKey } from "@/features/plan-modules/types";
import { changedFields, coreInfoFromProfile } from "@/features/project/coreInfo";

/** The plan sections a founder sees; the three marketing modules are one section. */
export const planSections = ["assessment", "financials", "narrative", "setup", "suppliers", "marketing"] as const;
export type PlanSection = (typeof planSections)[number];

const sectionOf: Record<ModuleKey, PlanSection> = {
  assessment: "assessment",
  financials: "financials",
  narrative: "narrative",
  setup: "setup",
  suppliers: "suppliers",
  marketing_strategy: "marketing",
  marketing_execution: "marketing",
  marketing_calendar: "marketing",
};

/** Which plan sections an edit would update, and which stay as they are. */
export function editImpact(before: { idea: string; answers: LaunchProfile }, after: { idea: string; answers: LaunchProfile }) {
  const changed = changedFields(coreInfoFromProfile(before.idea, before.answers), coreInfoFromProfile(after.idea, after.answers));
  const modules = affectedModules(changed);
  const update = planSections.filter((s) => modules.some((m) => sectionOf[m] === s));
  return { changed, update, keep: planSections.filter((s) => !update.includes(s)) };
}

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

/** The choices for an answer that has a fixed list (stored as these English values); null for free text. */
export function choicesFor(id: string): string[] | null {
  if (id === "location") return EMIRATES;
  if (id === "budget") return null;
  const question = [locationQuestion, budgetQuestion, ...abayaQuestions, ...generalQuestions].find((q) => q.id === id);
  return question ? question.options : null;
}

/** A budget typed as a number, stored the way onboarding stores amounts ("AED 50,000"). */
export const budgetValue = (amount: number) => `AED ${Math.round(amount).toLocaleString("en-US")}`;
