"use client";

import { ArrowRight, Check, Loader2, Pencil } from "lucide-react";
import { displayLabel, displayValue } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import type { SummaryItem } from "../types";

export function SummaryCard({
  items,
  starting,
  onEdit,
  onStart,
}: {
  items: SummaryItem[];
  starting: boolean;
  onEdit: (questionIndex: number) => void;
  onStart: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="glass mt-4 overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-white">{t.onboarding.summaryTitle}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 font-mono text-[11px] text-emerald-300">
          <Check className="size-3" />
          {t.onboarding.ready}
        </span>
      </div>

      <dl className="divide-y divide-white/[0.05] px-5 sm:px-6">
        {items.map((item) => {
          const label = displayLabel(t, item.id, item.label);
          return (
            <div key={item.id} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-mist/50">{label}</dt>
              <dd className="flex items-center gap-1 text-end text-sm font-medium text-white">
                {displayValue(t, item.value)}
                {(item.questionIndex === undefined || starting) && (
                  <span aria-hidden className="size-7" />
                )}
                {item.questionIndex !== undefined && !starting && (
                  <button
                    type="button"
                    onClick={() => onEdit(item.questionIndex!)}
                    aria-label={t.onboarding.changeField(label)}
                    className="grid size-7 place-items-center rounded-full text-mist/35 transition-colors hover:bg-white/5 hover:text-mist"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 py-6 sm:px-6">
        <button
          type="button"
          onClick={onStart}
          disabled={starting}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-brand-500 rtl:bg-gradient-to-l text-base font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_40px_-6px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px hover:shadow-[0_0_0_1px_rgb(255_255_255/0.2)_inset,0_12px_48px_-4px_rgb(139_108_255/0.9)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:translate-y-0 disabled:opacity-80"
        >
          {starting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t.onboarding.starting}
            </>
          ) : (
            <>
              {t.onboarding.startAnalysis}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </>
          )}
        </button>
        <p className="mt-4 text-center text-sm leading-relaxed text-mist/50">{t.onboarding.startFootnote}</p>
      </div>
    </div>
  );
}
