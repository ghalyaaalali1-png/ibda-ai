import { Clapperboard } from "lucide-react";
import { DashCard } from "@/features/plan/components/DashCard";
import type { MarketingPlan } from "../types";

export function ContentPlan({ plan }: { plan: MarketingPlan }) {
  return (
    <DashCard id="content-plan" title="Content plan · Instagram & TikTok" icon={Clapperboard}>
      <p className="text-sm text-mist/60">
        <span className="font-medium text-white">Rhythm: </span>
        {plan.postingRhythm}
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {plan.contentPillars.map((p) => (
          <li key={p.id} className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-white">{p.title}</p>
              <span className="shrink-0 font-mono text-[10px] text-mist/40">{p.phase}</span>
            </div>
            <p className="mt-1 text-xs text-brand-300/90">
              {p.format} · {p.cadence}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-mist/60">{p.idea}</p>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
