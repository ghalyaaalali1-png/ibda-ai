import { Info, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { profileValue } from "@/features/launch-profile/profile";
import type { BusinessPlan } from "../types";
import { BreakEvenChart } from "./BreakEvenChart";
import { CostBreakdown } from "./CostBreakdown";
import { DecisionCard } from "./DecisionCard";
import { IdeaSummary } from "./IdeaSummary";
import { MarketCard } from "./MarketCard";
import { MetricTiles } from "./MetricTiles";
import { NextActionsCard } from "./NextActionsCard";
import { PlanHeader } from "./PlanHeader";
import { RisksCard } from "./RisksCard";
import { SetupCard } from "./SetupCard";
import { UnitEconomics } from "./UnitEconomics";
import { UpcomingSections } from "./UpcomingSections";

export function PlanDashboard({ plan }: { plan: BusinessPlan }) {
  const profileLine = ["business", "location", "budget"]
    .map((id) => profileValue(plan.profile, id))
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PlanHeader profileLine={profileLine} />

      <Container className="space-y-6 py-10 sm:py-14">
        {/* Intro */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium text-brand-300">
              <Sparkles className="size-3.5" />
              Prepared by Ibda
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your launch plan
            </h1>
            <p className="mt-2 text-base text-mist/55">{profileLine}</p>
          </div>
          <p className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-mist/50 sm:self-auto">
            <Info className="size-3.5" />
            Prototype analysis — demo data
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <DecisionCard decision={plan.decision} />
          </div>
          <div className="lg:col-span-4">
            <IdeaSummary plan={plan} />
          </div>
        </div>

        <MetricTiles plan={plan} />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CostBreakdown plan={plan} />
          </div>
          <div className="lg:col-span-5">
            <UnitEconomics plan={plan} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <BreakEvenChart plan={plan} />
          </div>
          <div className="lg:col-span-5">
            <RisksCard plan={plan} />
          </div>
        </div>

        <MarketCard plan={plan} />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SetupCard plan={plan} />
          </div>
          <div className="lg:col-span-5">
            <NextActionsCard plan={plan} />
          </div>
        </div>

        <div className="pt-6">
          <UpcomingSections plan={plan} />
        </div>
      </Container>
    </>
  );
}
