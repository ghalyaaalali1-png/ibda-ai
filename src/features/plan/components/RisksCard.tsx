"use client";

import { AlertTriangle, ArrowRight, CircleAlert, Info, ShieldAlert } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import type { BusinessPlan, Severity } from "../types";
import { DashCard } from "./DashCard";

const severityStyle: Record<Severity, { className: string; icon: typeof Info }> = {
  High: { className: "border-[#ec835a]/40 bg-[#ec835a]/10 text-[#f4a582]", icon: AlertTriangle },
  Medium: { className: "border-[#fab219]/35 bg-[#fab219]/10 text-[#fcc95a]", icon: CircleAlert },
  Low: { className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", icon: Info },
};

export function RisksCard({ plan }: { plan: BusinessPlan }) {
  const { t } = useI18n();
  return (
    <DashCard id="risks" title={t.plan.risks.title} icon={ShieldAlert}>
      <ul className="space-y-3">
        {plan.risks.map((risk) => {
          const s = severityStyle[risk.severity];
          const Icon = s.icon;
          return (
            <li key={risk.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-white">{risk.title}</p>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    s.className,
                  )}
                >
                  <Icon className="size-3" />
                  {t.plan.risks.severity[risk.severity]}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-mist/55">{risk.detail}</p>
              <p className="mt-2 flex gap-1.5 text-[13px] leading-relaxed text-mist/80">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-brand-300 rtl:-scale-x-100" />
                {risk.mitigation}
              </p>
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}
