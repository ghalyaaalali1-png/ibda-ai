import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LivePlanDashboard } from "@/features/plan/components/LivePlanDashboard";
import { demoPlan } from "@/features/plan/demoPlan";

export const metadata: Metadata = {
  title: `Business Plan — ${siteConfig.name}`,
  description: "Your launch-ready business plan, prepared by Ibda.",
};

export default function PlanPage() {
  // Demo plan, with Claude's initial assessment applied in the browser when available.
  return <LivePlanDashboard plan={demoPlan} />;
}
