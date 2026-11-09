"use client";

import { PieChart } from "lucide-react";
import { DashCard } from "@/features/plan/components/DashCard";
import { percent, seriesColors } from "@/features/plan/format";
import { useI18n } from "@/i18n/I18nProvider";
import type { BudgetSource } from "../types";

export function MarketingBudget({
  sources,
  footnote,
}: {
  sources: BudgetSource[];
  /** Line under the budget, e.g. how marketing is funded after launch. */
  footnote: string;
}) {
  const { t } = useI18n();
  const { aed } = t.fmt;
  const copy = t.marketing.budget;
  const total = sources.reduce((s, src) => s + src.total, 0);

  return (
    <DashCard
      id="budget"
      title={copy.title}
      icon={PieChart}
      action={<span className="font-mono text-xs text-mist/50">{copy.total(aed(total))}</span>}
    >
      <p className="text-sm leading-relaxed text-mist/60">{copy.noNewSpend(sources.length)}</p>

      <div className="mt-5 space-y-7">
        {sources.map((src, si) => {
          // Offset colour slots so the two bars don't reuse the same hues.
          const offset = si === 0 ? 0 : 5;
          return (
            <div key={src.planLine}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-white">{src.planLine}</p>
                <p className="text-xs text-mist/50">
                  <span className="font-medium text-white">{aed(src.total)}</span> {copy.fromPlan}
                </p>
              </div>
              <div className="mt-3 flex h-3 gap-0.5" role="img" aria-label={copy.split(src.planLine)}>
                {src.lines.map((l, i) => (
                  <span
                    key={l.label}
                    className="h-full first:rounded-s last:rounded-e"
                    style={{
                      width: `${percent(l.amount, src.total)}%`,
                      background: seriesColors[(i + offset) % seriesColors.length],
                    }}
                  />
                ))}
              </div>
              <table className="mt-3 w-full text-[13px]">
                <caption className="sr-only">{copy.breakdown(src.planLine)}</caption>
                <tbody>
                  {src.lines.map((l, i) => (
                    <tr key={l.label} className="border-t border-white/[0.05] first:border-t-0">
                      <td className="py-2 pe-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            aria-hidden
                            className="mt-1 size-2.5 shrink-0 rounded-sm"
                            style={{ background: seriesColors[(i + offset) % seriesColors.length] }}
                          />
                          <div>
                            <p className="text-mist/90">{l.label}</p>
                            <p className="text-xs text-mist/55">{l.note}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 text-end font-medium whitespace-nowrap text-white">{aed(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <p className="mt-auto pt-5 text-xs leading-relaxed text-mist/55">
        {footnote}
      </p>
    </DashCard>
  );
}
