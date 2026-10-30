import { PieChart } from "lucide-react";
import { DashCard } from "@/features/plan/components/DashCard";
import { aed, percent, seriesColors } from "@/features/plan/format";
import type { BudgetSource } from "../types";

export function MarketingBudget({
  sources,
  footnote,
}: {
  sources: BudgetSource[];
  /** Line under the budget, e.g. how marketing is funded after launch. */
  footnote: string;
}) {
  const total = sources.reduce((s, src) => s + src.total, 0);

  return (
    <DashCard
      id="budget"
      title="Marketing budget allocation"
      icon={PieChart}
      action={<span className="font-mono text-xs text-mist/50">{aed(total)} total</span>}
    >
      <p className="text-sm leading-relaxed text-mist/60">
        No new spend — this splits the two marketing lines already in your business plan.
      </p>

      <div className="mt-5 space-y-7">
        {sources.map((src, si) => {
          // Offset colour slots so the two bars don't reuse the same hues.
          const offset = si === 0 ? 0 : 5;
          return (
            <div key={src.planLine}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-white">{src.planLine}</p>
                <p className="text-xs text-mist/50">
                  <span className="font-medium text-white">{aed(src.total)}</span> from plan
                </p>
              </div>
              <div className="mt-3 flex h-3 gap-0.5" role="img" aria-label={`${src.planLine} split`}>
                {src.lines.map((l, i) => (
                  <span
                    key={l.label}
                    className="h-full first:rounded-l last:rounded-r"
                    style={{
                      width: `${percent(l.amount, src.total)}%`,
                      background: seriesColors[(i + offset) % seriesColors.length],
                    }}
                  />
                ))}
              </div>
              <table className="mt-3 w-full text-[13px]">
                <caption className="sr-only">{src.planLine} breakdown</caption>
                <tbody>
                  {src.lines.map((l, i) => (
                    <tr key={l.label} className="border-t border-white/[0.05] first:border-t-0">
                      <td className="py-2 pr-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            aria-hidden
                            className="mt-1 size-2.5 shrink-0 rounded-sm"
                            style={{ background: seriesColors[(i + offset) % seriesColors.length] }}
                          />
                          <div>
                            <p className="text-mist/90">{l.label}</p>
                            <p className="text-xs text-mist/40">{l.note}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 text-right font-medium whitespace-nowrap text-white">{aed(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <p className="mt-auto pt-5 text-xs leading-relaxed text-mist/40">
        {footnote}
      </p>
    </DashCard>
  );
}
