"use client";

import { ListChecks } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import type { BusinessPlan } from "../types";
import { DashCard } from "./DashCard";

export function NextActionsCard({ plan }: { plan: BusinessPlan }) {
  const { t } = useI18n();
  return (
    <DashCard
      id="next-actions"
      title={t.plan.nextActions.title}
      icon={ListChecks}
      action={<span className="text-xs text-mist/50">{plan.nextActionsLabel}</span>}
    >
      <ol className="relative">
        {plan.nextActions.map((action, i) => (
          <li key={action.title} className="relative flex gap-4 pb-5 last:pb-0">
            {i < plan.nextActions.length - 1 && (
              <span aria-hidden className="absolute top-8 bottom-0 start-[13px] w-px bg-white/10" />
            )}
            <span
              className={cn(
                "relative grid size-7 shrink-0 place-items-center rounded-full border font-mono text-xs",
                i === 0
                  ? "border-brand-400/60 bg-brand-500/25 text-white shadow-[0_0_20px_-4px_rgb(139_108_255/0.8)]"
                  : "border-white/10 bg-ink-900 text-mist/55",
              )}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <p className="text-sm font-medium text-white">{action.title}</p>
                {i === 0 && (
                  <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-brand-300 uppercase">
                    {t.plan.nextActions.startHere}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-mist/50">{action.detail}</p>
            </div>
            <span className="shrink-0 pt-0.5 font-mono text-[11px] text-mist/55">{action.timing}</span>
          </li>
        ))}
      </ol>
    </DashCard>
  );
}
