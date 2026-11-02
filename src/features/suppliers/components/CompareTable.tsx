"use client";

import { Columns3, Send, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import { leadTimeLabel, moqLabel, priceLabel } from "../format";
import type { CategoryInfo, Supplier } from "../types";
import { MatchScore } from "./MatchScore";

function Best() {
  const { t } = useI18n();
  return (
    <span className="ms-1.5 rounded bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
      {t.suppliers.compare.best}
    </span>
  );
}

export function CompareTable({
  items,
  categories,
  onRemove,
  onRequestQuote,
}: {
  items: Supplier[];
  categories: CategoryInfo[];
  onRemove: (id: string) => void;
  onRequestQuote: (id: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.suppliers.compare;
  const sameCategory = items.length > 1 && items.every((s) => s.category === items[0].category);
  const best = (pick: (s: Supplier) => number, dir: "min" | "max") => {
    if (!sameCategory) return null;
    const values = items.map(pick);
    const target = dir === "min" ? Math.min(...values) : Math.max(...values);
    return items.find((s) => pick(s) === target)?.id ?? null;
  };
  const cheapest = best((s) => s.price.min, "min");
  const lowestMoq = best((s) => s.moq?.value ?? 0, "min");
  const fastest = best((s) => s.leadTime.maxDays, "min");
  const bestFit = best((s) => s.matchScore, "max");

  const rows: { label: string; cell: (s: Supplier) => React.ReactNode }[] = [
    { label: copy.category, cell: (s) => categories.find((c) => c.id === s.category)?.shortLabel },
    {
      label: t.suppliers.card.price,
      cell: (s) => (
        <>
          {priceLabel(s, t)} <span className="text-mist/40">{s.price.unit}</span>
          {cheapest === s.id && <Best />}
        </>
      ),
    },
    { label: t.suppliers.card.moq, cell: (s) => <>{moqLabel(s, t)}{lowestMoq === s.id && <Best />}</> },
    { label: t.suppliers.card.leadTime, cell: (s) => <>{leadTimeLabel(s, t)}{fastest === s.id && <Best />}</> },
    {
      label: copy.fit,
      cell: (s) => (
        <div className="flex items-center">
          <MatchScore score={s.matchScore} compact />
          {bestFit === s.id && <Best />}
        </div>
      ),
    },
    { label: copy.bestFor, cell: (s) => <span className="text-mist/70">{s.bestFor}</span> },
    {
      label: copy.watchOut,
      cell: (s) => <span className="text-mist/55">{s.watchOut ?? "—"}</span>,
    },
  ];

  return (
    <section aria-labelledby="compare-title" className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="compare-title" className="flex items-center gap-2.5 text-sm font-semibold text-white">
          <span className="grid size-7 place-items-center rounded-lg border border-brand-400/25 bg-brand-500/15 text-brand-300">
            <Columns3 className="size-3.5" />
          </span>
          {copy.title}
        </h2>
        <p className="text-xs text-mist/45">
          {copy.selected(items.length)}
          {items.length > 1 && !sameCategory && copy.mixed}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-mist/50">
          {copy.emptyStart} <span className="text-mist/80">{copy.emptyButton}</span> {copy.emptyEnd}
        </p>
      ) : (
        <div className="-mx-5 mt-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px] text-start text-[13px]">
            <caption className="sr-only">{copy.caption}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-28 pb-3 text-start align-bottom text-[11px] font-medium tracking-wider text-mist/40 uppercase">
                  {copy.supplier}
                </th>
                {items.map((s) => (
                  <th key={s.id} scope="col" className="pb-3 ps-4 text-start align-bottom font-normal">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{s.name}</p>
                        <p className="text-xs text-mist/45">{s.location}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(s.id)}
                        aria-label={copy.remove(s.name)}
                        className="grid size-6 shrink-0 place-items-center rounded-full text-mist/40 hover:bg-white/5 hover:text-white"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-white/[0.06]">
                  <th scope="row" className="py-3 pe-2 text-start align-top text-xs font-normal text-mist/45">
                    {row.label}
                  </th>
                  {items.map((s) => (
                    <td key={s.id} className={cn("py-3 ps-4 align-top text-mist/90")}>
                      {row.cell(s)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-white/[0.06]">
                <td />
                {items.map((s) => (
                  <td key={s.id} className="pt-4 ps-4">
                    <button
                      type="button"
                      onClick={() => onRequestQuote(s.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-300 hover:text-white"
                    >
                      <Send className="size-3 rtl:-scale-x-100" />
                      {t.common.requestQuote}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
