import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PlanDashboard } from "@/features/plan/components/PlanDashboard";
import { demoPlan } from "@/features/plan/demoPlan";

export const metadata: Metadata = {
  title: `Business Plan — ${siteConfig.name}`,
  description: "Your launch-ready business plan, prepared by Ibda.",
};

export default function PlanPage() {
  // Prototype: the demo plan. Later this comes from the agent's analysis result.
  return <PlanDashboard plan={demoPlan} />;
}
