"use client";

import { useMemo, useSyncExternalStore } from "react";
import { demoIdea } from "@/content/landing";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { currentAssessmentInput, useStoredAssessment } from "@/features/assessment/storage";
import { readLaunchIdea } from "@/features/launch-profile/profile";
import type { BusinessPlan } from "../types";
import { PlanDashboard } from "./PlanDashboard";

/** The dashboard with Claude's initial assessment applied once it's available. */
const noopSubscribe = () => () => {};

export function LivePlanDashboard({ plan }: { plan: BusinessPlan }) {
  const assessment = useStoredAssessment();
  const idea = useSyncExternalStore(noopSubscribe, readLaunchIdea, () => null);
  // Without Claude's result, only the abaya demo has a plan to show — say so for other ideas.
  const otherBusiness = idea !== null && idea !== demoIdea;
  const merged = useMemo(
    () => (assessment ? buildPlan(plan, assessment, currentAssessmentInput().profile) : plan),
    [plan, assessment],
  );
  return (
    <PlanDashboard
      plan={merged}
      sourceNote={
        assessment
          ? "Prepared by Claude from your answers — figures are estimates, not yet verified"
          : otherBusiness
            ? "Live analysis unavailable — showing the abaya demo plan"
            : undefined
      }
    />
  );
}
