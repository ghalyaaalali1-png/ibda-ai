import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { MarketingPlanView } from "@/features/marketing/components/MarketingPlanView";
import { demoMarketing } from "@/features/marketing/demoMarketing";

export const metadata: Metadata = {
  title: `Marketing Plan — ${siteConfig.name}`,
  description: "Your launch marketing plan, prepared by Ibda from your business plan.",
};

export default function MarketingPage() {
  // Prototype: the demo plan. Later this comes from the agent's analysis result.
  return <MarketingPlanView plan={demoMarketing} />;
}
