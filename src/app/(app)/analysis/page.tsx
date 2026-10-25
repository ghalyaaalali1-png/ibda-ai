import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { AnalysisWorkspace } from "@/features/analysis/components/AnalysisWorkspace";

export const metadata: Metadata = {
  title: `Agent Workspace — ${siteConfig.name}`,
  description: "Watch Ibda work through your business launch analysis.",
};

export default function AnalysisPage() {
  return <AnalysisWorkspace />;
}
