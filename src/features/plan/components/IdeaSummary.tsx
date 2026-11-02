"use client";

import { Lightbulb } from "lucide-react";
import { displayLabel, displayValue } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import type { BusinessPlan } from "../types";
import { DashCard } from "./DashCard";

export function IdeaSummary({ plan }: { plan: BusinessPlan }) {
  const { t } = useI18n();
  return (
    <DashCard id="idea" title={t.plan.ideaTitle} icon={Lightbulb}>
      <dl className="divide-y divide-white/[0.05]">
        {plan.profile.map((field) => (
          <div key={field.id} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
            <dt className="text-sm text-mist/50">{displayLabel(t, field.id, field.label)}</dt>
            <dd className="text-end text-sm font-medium text-white">{displayValue(t, field.value)}</dd>
          </div>
        ))}
      </dl>
    </DashCard>
  );
}
