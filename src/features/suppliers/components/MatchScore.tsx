"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import { scoreTone } from "../format";

export function MatchScore({ score, compact }: { score: number; compact?: boolean }) {
  const { t } = useI18n();
  const tone = scoreTone(score);
  return (
    <div className={cn("flex items-center gap-2", compact ? "w-24" : "w-28")}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
        <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn("font-mono text-xs font-medium", tone.text)}>
        {score}
        <span className="sr-only">{t.suppliers.matchSr}</span>
      </span>
    </div>
  );
}
