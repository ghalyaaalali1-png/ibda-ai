import { Capabilities } from "@/components/landing/Capabilities";
import { FinalCta } from "@/components/landing/FinalCta";
import { ForUae } from "@/components/landing/ForUae";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PlanPreview } from "@/components/landing/PlanPreview";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Capabilities />
      <HowItWorks />
      <PlanPreview />
      <ForUae />
      <FinalCta />
    </>
  );
}
