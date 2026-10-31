import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LiveLaunchPack } from "@/features/launch-pack/components/LiveLaunchPack";

export const metadata: Metadata = {
  title: `Launch Pack — ${siteConfig.name}`,
  description: "Your business launch pack, consolidated by Ibda from your plan, suppliers, requirements and marketing.",
};

export default function LaunchPackPage() {
  // Live launch pack when an assessment exists; the abaya demo otherwise.
  return <LiveLaunchPack />;
}
