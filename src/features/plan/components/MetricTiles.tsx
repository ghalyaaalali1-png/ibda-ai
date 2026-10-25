import { aed, percent } from "../format";
import type { BusinessPlan } from "../types";
import { Caption } from "./DashCard";

function Tile({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="glass flex flex-col rounded-3xl p-5">
      <Caption>{label}</Caption>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">{value}</p>
      <div className="mt-auto pt-4">{children}</div>
    </div>
  );
}

export function MetricTiles({ plan }: { plan: BusinessPlan }) {
  const allocated = plan.budget.total - plan.budget.reserve;
  const productCost = plan.unitEconomics.costs
    .filter((c) => c.label !== "Payment & delivery")
    .reduce((sum, c) => sum + c.amount, 0);
  const margin = percent(plan.unitEconomics.price - productCost, plan.unitEconomics.price);
  const { breakEven, pricing } = plan;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Tile label="Startup budget" value={aed(plan.budget.total)}>
        <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
          <span className="rounded-l-full bg-gradient-to-r from-brand-500 to-electric-400" style={{ width: `${percent(allocated, plan.budget.total)}%` }} />
          <span className="flex-1 rounded-r-full bg-white/15" />
        </div>
        <p className="mt-2 text-xs text-mist/50">
          {aed(allocated)} allocated · {aed(plan.budget.reserve)} reserve
        </p>
      </Tile>

      <Tile label="Recommended price" value={`AED ${pricing.min}–${pricing.max}`}>
        <p className="text-xs text-mist/50">
          Hero price <span className="font-medium text-mist">AED {pricing.hero}</span> per abaya
        </p>
      </Tile>

      <Tile label="Est. gross margin" value={`${margin}%`}>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
          <div className="h-full rounded-full bg-emerald-400/80" style={{ width: `${margin}%` }} />
        </div>
        <p className="mt-2 text-xs text-mist/50">
          {aed(plan.unitEconomics.price - productCost)} gross profit per piece
        </p>
      </Tile>

      <Tile label="Break-even" value={`Month ${breakEven.month}`}>
        <p className="text-xs text-mist/50">
          ≈{breakEven.totalSales} sales · {breakEven.salesToCoverRunningCosts}/month covers running costs
        </p>
      </Tile>
    </div>
  );
}
