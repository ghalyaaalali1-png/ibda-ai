import { Tags } from "lucide-react";
import { aed, percent } from "../format";
import type { BusinessPlan } from "../types";
import { Caption, DashCard } from "./DashCard";

export function UnitEconomics({ plan }: { plan: BusinessPlan }) {
  const { price, costs } = plan.unitEconomics;
  const { pricing } = plan;
  const totalCost = costs.reduce((s, c) => s + c.amount, 0);
  const contribution = price - totalCost;

  return (
    <DashCard id="pricing" title="Pricing & unit economics" icon={Tags}>
      <Caption>Recommended selling price</Caption>
      <p className="mt-1.5 text-3xl font-semibold tracking-tight text-white">
        AED {pricing.min}–{pricing.max}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-mist/55">{pricing.rationale}</p>

      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <Caption>Per abaya at {aed(price)}</Caption>
          <span className="text-xs text-emerald-300">
            {percent(contribution, price)}% kept after all costs
          </span>
        </div>
        <div className="mt-3 flex h-3 gap-0.5" role="img" aria-label={`Costs ${aed(totalCost)}, contribution ${aed(contribution)}`}>
          <span className="rounded-l bg-white/25" style={{ width: `${percent(totalCost, price)}%` }} />
          <span className="flex-1 rounded-r bg-gradient-to-r from-brand-500 to-electric-400" />
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          {costs.map((c) => (
            <div key={c.label} className="flex justify-between">
              <dt className="text-mist/55">{c.label}</dt>
              <dd className="text-mist/85">{aed(c.amount)}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-white/[0.08] pt-2.5">
            <dt className="font-medium text-white">Contribution per sale</dt>
            <dd className="font-semibold text-white">{aed(contribution)}</dd>
          </div>
        </dl>
      </div>
    </DashCard>
  );
}
