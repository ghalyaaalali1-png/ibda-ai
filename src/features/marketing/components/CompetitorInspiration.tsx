"use client";

import { Info, Lightbulb } from "lucide-react";
import { DashCard } from "@/features/plan/components/DashCard";
import { useI18n } from "@/i18n/I18nProvider";
import type { InspirationItem } from "../types";

/** Patterns from kinds of competitors — never named accounts, handles or figures. */
export function CompetitorInspiration({ items }: { items: InspirationItem[] }) {
  const { t } = useI18n();
  const copy = t.marketing.inspiration;
  if (items.length === 0) return null;

  return (
    <DashCard id="inspiration" title={copy.title} icon={Lightbulb}>
      <ul className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.competitorType} className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-sm font-semibold text-white">{item.competitorType}</p>
            <dl className="mt-3 space-y-2.5 text-[13px] leading-snug">
              <div>
                <dt className="text-[11px] font-medium tracking-wider text-mist/55 uppercase">{copy.works}</dt>
                <dd className="mt-0.5 text-mist/75">{item.whatWorks}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium tracking-wider text-brand-300/80 uppercase">{copy.adapt}</dt>
                <dd className="mt-0.5 text-mist/75">{item.howToAdapt}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium tracking-wider text-[#fcc95a]/80 uppercase">{copy.avoid}</dt>
                <dd className="mt-0.5 text-mist/60">{item.avoid}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <p className="mt-5 flex gap-2 text-xs leading-relaxed text-mist/55">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        {copy.footnote}
      </p>
    </DashCard>
  );
}
