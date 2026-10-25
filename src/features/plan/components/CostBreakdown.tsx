"use client";

import { Wallet } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { aed, percent, seriesColors } from "../format";
import type { BusinessPlan } from "../types";
import { DashCard } from "./DashCard";

const RESERVE_ID = "reserve";
const reserveFill =
  "repeating-linear-gradient(45deg, rgb(255 255 255 / 0.22) 0 2px, rgb(255 255 255 / 0.06) 2px 6px)";

export function CostBreakdown({ plan }: { plan: BusinessPlan }) {
  const [active, setActive] = useState<string | null>(null);
  const { total, reserve } = plan.budget;
  const rows = [
    ...plan.costs.map((c, i) => ({ ...c, fill: seriesColors[i] })),
    { id: RESERVE_ID, label: "Cash reserve", amount: reserve, note: "Buffer for reorders and surprises", fill: reserveFill },
  ];
  const spend = total - reserve;

  return (
    <DashCard
      id="costs"
      title="Estimated startup costs"
      icon={Wallet}
      action={<span className="font-mono text-xs text-mist/50">{aed(spend)} of {aed(total)}</span>}
    >
      {/* Stacked bar: one segment per cost, 2px gaps between fills */}
      <div className="flex h-4 gap-0.5" role="img" aria-label="Startup budget split by cost category">
        {rows.map((row, i) => (
          <span
            key={row.id}
            onMouseEnter={() => setActive(row.id)}
            onMouseLeave={() => setActive(null)}
            className={cn(
              "h-full transition-opacity duration-200",
              i === 0 && "rounded-l",
              i === rows.length - 1 && "rounded-r",
              active && active !== row.id && "opacity-35",
            )}
            style={{ width: `${percent(row.amount, total)}%`, background: row.fill }}
          />
        ))}
      </div>

      <table className="mt-5 w-full text-sm">
        <caption className="sr-only">Startup cost breakdown</caption>
        <thead className="sr-only">
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Share of budget</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onMouseEnter={() => setActive(row.id)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                "border-t border-white/[0.05] transition-colors first:border-t-0",
                active === row.id && "bg-white/[0.03]",
              )}
            >
              <td className="py-2.5 pr-3">
                <div className="flex items-start gap-2.5">
                  <span aria-hidden className="mt-1.5 size-2.5 shrink-0 rounded-sm" style={{ background: row.fill }} />
                  <div>
                    <p className="text-mist/90">{row.label}</p>
                    <p className="text-xs text-mist/40">{row.note}</p>
                  </div>
                </div>
              </td>
              <td className="py-2.5 text-right font-medium whitespace-nowrap text-white">
                {aed(row.amount)}
              </td>
              <td className="w-14 py-2.5 text-right font-mono text-xs text-mist/45">
                {percent(row.amount, total)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashCard>
  );
}
