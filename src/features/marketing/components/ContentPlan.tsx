"use client";

import { Clapperboard } from "lucide-react";
import { DashCard } from "@/features/plan/components/DashCard";
import type { Dictionary } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import type { MarketingPlan } from "../types";

// Platforms a content plan can name; Reels count as Instagram.
const PLATFORMS: [name: string, pattern: RegExp][] = [
  ["Instagram", /instagram|\breels?\b/i],
  ["TikTok", /tik\s?tok/i],
  ["Snapchat", /snapchat/i],
  ["YouTube", /youtube/i],
  ["Facebook", /facebook/i],
  ["LinkedIn", /linkedin/i],
  ["X", /twitter/i],
  ["Pinterest", /pinterest/i],
  ["WhatsApp", /whatsapp/i],
  ["Google Business Profile", /google business|google maps/i],
];

/** The platforms this content plan uses, in the order they first appear. */
function platformsIn(plan: MarketingPlan) {
  const text = [...plan.contentPillars.map((p) => `${p.format} ${p.cadence}`), plan.postingRhythm].join("\n");
  return PLATFORMS.map(([name, pattern]) => ({ name, at: text.search(pattern) }))
    .filter((p) => p.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((p) => p.name);
}

function contentPlanTitle(plan: MarketingPlan, t: Dictionary) {
  const names = platformsIn(plan);
  const { title, platforms } = t.marketing.content;
  return names.length === 0 ? title : `${title} · ${platforms(names)}`;
}

export function ContentPlan({ plan }: { plan: MarketingPlan }) {
  const { t } = useI18n();
  return (
    <DashCard id="content-plan" title={contentPlanTitle(plan, t)} icon={Clapperboard}>
      <p className="text-sm text-mist/60">
        <span className="font-medium text-white">{t.marketing.content.rhythm}</span>
        {plan.postingRhythm}
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {plan.contentPillars.map((p) => (
          <li key={p.id} className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-white">{p.title}</p>
              <span className="shrink-0 font-mono text-[10px] text-mist/55">{p.phase}</span>
            </div>
            <p className="mt-1 text-xs text-brand-300/90">
              {p.format} · {p.cadence}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-mist/60">{p.idea}</p>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
