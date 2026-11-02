"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { percent } from "../format";
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
  const { t } = useI18n();
  const { aed, aedRange } = t.fmt;
  const tiles = t.plan.tiles;
  const allocated = plan.budget.total - plan.budget.reserve;
  const productCost = plan.unitEconomics.costs
    .filter((c) => c.kind === "product")
    .reduce((sum, c) => sum + c.amount, 0);
  const margin = percent(plan.unitEconomics.price - productCost, plan.unitEconomics.price);
  const { breakEven, pricing, unit } = plan;
  const horizon = breakEven.cashflow.at(-1)?.month ?? 0;
  const coverText =
    breakEven.salesToCoverRunningCosts === null ? tiles.loses : tiles.covers(breakEven.salesToCoverRunningCosts);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Tile label={tiles.budget} value={aed(plan.budget.total)}>
        <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
          <span className="rounded-s-full bg-gradient-to-r from-brand-500 to-electric-400 rtl:bg-gradient-to-l" style={{ width: `${percent(allocated, plan.budget.total)}%` }} />
          <span className="flex-1 rounded-e-full bg-white/15" />
        </div>
        <p className="mt-2 text-xs text-mist/50">
          {tiles.allocated(aed(allocated), aed(plan.budget.reserve))}
        </p>
        {plan.budget.basis && <p className="mt-1 text-xs text-mist/40">{plan.budget.basis}</p>}
      </Tile>

      <Tile label={tiles.price} value={aedRange(pricing.min, pricing.max)}>
        <p className="text-xs text-mist/50">{tiles.heroPrice(aed(pricing.hero), unit.singular)}</p>
      </Tile>

      <Tile label={tiles.margin} value={`${margin}%`}>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
          <div className="h-full rounded-full bg-emerald-400/80" style={{ width: `${Math.min(100, Math.max(0, margin))}%` }} />
        </div>
        <p className="mt-2 text-xs text-mist/50">
          {tiles.grossProfit(aed(plan.unitEconomics.price - productCost), unit.singular)}
        </p>
      </Tile>

      <Tile
        label={tiles.breakEven}
        value={breakEven.month === null ? t.plan.beyondMonth(horizon) : t.plan.month(breakEven.month)}
      >
        <p className="text-xs text-mist/50">
          {tiles.sales(breakEven.totalSales, breakEven.month === null ? horizon : null)} · {coverText}
        </p>
      </Tile>
    </div>
  );
}
