import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { OnboardingChat } from "@/features/onboarding/components/OnboardingChat";

export const metadata: Metadata = {
  title: `Start My Business — ${siteConfig.name}`,
  description: "Tell Ibda your business idea and it will prepare your analysis.",
};

export default function StartPage() {
  return <OnboardingChat />;
}
