import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LiveMarketing } from "@/features/marketing/components/LiveMarketing";

export const metadata: Metadata = {
  title: `Marketing Plan — ${siteConfig.name}`,
  description: "Your launch marketing plan, prepared by Ibda from your business plan.",
};

export default function MarketingPage() {
  // Live marketing plan when an assessment exists; the abaya demo otherwise.
  return <LiveMarketing />;
}
