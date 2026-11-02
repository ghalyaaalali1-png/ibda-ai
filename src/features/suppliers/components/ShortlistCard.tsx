"use client";

import { Send, Sparkles } from "lucide-react";
import { percent } from "@/features/plan/format";
import { useI18n } from "@/i18n/I18nProvider";
import type { CategoryInfo, ShortlistItem, Supplier } from "../types";
import { MatchScore } from "./MatchScore";

export function ShortlistCard({
  items,
  categories,
  allocationLabel,
  budgetLabel,
  criteria,
  suppliersById,
  allocation,
  onRequestQuote,
  onSelectCategory,
}: {
  items: ShortlistItem[];
  categories: CategoryInfo[];
  allocationLabel: string;
  /** e.g. "AED 30,000" */
  budgetLabel: string;
  /** What the picks were chosen for, e.g. "low minimums, premium finishing". */
  criteria: string;
  suppliersById: Map<string, Supplier>;
  allocation: number;
  onRequestQuote: (id: string) => void;
  onSelectCategory: (supplier: Supplier) => void;
}) {
  const { t } = useI18n();
  const { aed } = t.fmt;
  const copy = t.suppliers.shortlist;
  const total = items.reduce((s, i) => s + i.estimate, 0);
  const fits = total <= allocation;

  return (
    <section aria-labelledby="shortlist-title" className="glass relative overflow-hidden rounded-3xl p-5 sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -end-24 size-96 rounded-full bg-brand-500/15 blur-[100px]"
      />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-300">
            <Sparkles className="size-3.5" />
            {copy.recommendedBy}
          </p>
          <h2 id="shortlist-title" className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mist/55">
            {copy.criteria(criteria, budgetLabel)}
          </p>
        </div>
        <div className="w-full shrink-0 lg:w-80">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-mist/55">{copy.estimate}</span>
            <span className="font-semibold text-white">{aed(total)}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-electric-400 rtl:bg-gradient-to-l"
              style={{ width: `${Math.min(percent(total, allocation), 100)}%` }}
            />
          </div>
          <p className={`mt-2 text-xs ${fits ? "text-emerald-300" : "text-[#fcc95a]"}`}>
            {fits ? copy.within(aed(allocation), allocationLabel) : copy.over(aed(total - allocation))}
          </p>
        </div>
      </div>

      <ul className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const s = suppliersById.get(item.supplierId)!;
          const category = categories.find((c) => c.id === s.category) ?? categories[0];
          return (
            <li key={s.id} className="flex flex-col rounded-2xl border border-white/[0.07] bg-ink-900/60 p-4">
              <button
                type="button"
                onClick={() => onSelectCategory(s)}
                className="self-start text-[11px] font-medium tracking-wider text-mist/45 uppercase hover:text-brand-300"
              >
                {category.shortLabel}
              </button>
              <p className="mt-1.5 text-sm font-semibold text-white">{s.name}</p>
              <p className="mt-0.5 text-xs text-mist/45">{s.location}</p>
              <div className="mt-3">
                <MatchScore score={s.matchScore} compact />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-white/[0.06] pt-3">
                <span className="text-xs text-mist/45">{item.basis}</span>
                <span className="text-sm font-medium whitespace-nowrap text-white">{aed(item.estimate)}</span>
              </div>
              <button
                type="button"
                onClick={() => onRequestQuote(s.id)}
                className="mt-3 inline-flex items-center gap-1.5 self-start text-xs font-medium text-brand-300 transition-colors hover:text-white"
              >
                <Send className="size-3 rtl:-scale-x-100" />
                {t.common.requestQuote}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
