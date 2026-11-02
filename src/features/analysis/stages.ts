import {
  Building2,
  Calculator,
  ClipboardCheck,
  Rocket,
  Search,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary, StageContext } from "@/i18n";
import type { AgentAction, AgentStage } from "./types";

type StageShape = {
  id: string;
  icon: LucideIcon;
  activities: { id: string; action: AgentAction; durationMs?: number }[];
};

// The order, timing and kind of each simulated step; the wording is in the dictionary.
const abayaShape: StageShape[] = [
  {
    id: "understand",
    icon: ClipboardCheck,
    activities: [
      { id: "profile", action: "Reviewing", durationMs: 700 },
      { id: "choices", action: "Reviewing", durationMs: 700 },
    ],
  },
  {
    id: "market",
    icon: Search,
    activities: [
      { id: "market", action: "Researching" },
      { id: "customer", action: "Researching" },
      { id: "competitors", action: "Comparing" },
    ],
  },
  {
    id: "feasibility",
    icon: Calculator,
    activities: [
      { id: "costs", action: "Calculating" },
      { id: "budget", action: "Calculating" },
      { id: "unit", action: "Calculating" },
      { id: "breakeven", action: "Calculating" },
    ],
  },
  {
    id: "suppliers",
    icon: Truck,
    activities: [
      { id: "fabric", action: "Comparing" },
      { id: "tailoring", action: "Comparing" },
      { id: "moq", action: "Comparing" },
    ],
  },
  {
    id: "setup",
    icon: Building2,
    activities: [
      { id: "activity", action: "Checking sources" },
      { id: "options", action: "Checking sources" },
      { id: "official", action: "Checking sources" },
    ],
  },
  {
    id: "plan",
    icon: Rocket,
    activities: [
      { id: "allocation", action: "Planning" },
      { id: "timeline", action: "Planning" },
      { id: "marketing", action: "Planning" },
    ],
  },
];

/** Industry-neutral steps for any other business. */
const genericShape: StageShape[] = abayaShape.map((stage) => {
  if (stage.id === "suppliers") {
    return {
      ...stage,
      activities: [
        { id: "categories", action: "Comparing" },
        { id: "types", action: "Comparing" },
        { id: "moq", action: "Comparing" },
      ],
    };
  }
  if (stage.id === "setup") {
    return {
      ...stage,
      activities: [
        { id: "activity", action: "Checking sources" },
        { id: "options", action: "Checking sources" },
        { id: "approvals", action: "Checking sources" },
      ],
    };
  }
  return stage;
});

/**
 * The six analysis stages in the interface language: abaya copy for the
 * demo scenario, neutral copy (filled in from the founder's answers) for
 * every other business.
 */
export function analysisStagesFor(t: Dictionary, abaya: boolean, context: StageContext): AgentStage[] {
  const copy = abaya ? t.analysis.abayaStages(context) : t.analysis.genericStages(context);
  return (abaya ? abayaShape : genericShape).map((stage) => ({
    id: stage.id,
    icon: stage.icon,
    title: copy[stage.id].title,
    result: copy[stage.id].result,
    activities: stage.activities.map((a) => ({ ...a, label: copy[stage.id].activities[a.id] })),
  }));
}

/** How many stages an analysis has (both variants have six). */
export const STAGE_COUNT = abayaShape.length;
