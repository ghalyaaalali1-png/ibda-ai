"use client";

import { CheckCircle2, CircleAlert, CircleX } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import type { BusinessPlan, Decision } from "../types";

const verdicts: Record<Decision, { tone: string; icon: typeof CheckCircle2 }> = {
  GO: { tone: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10", icon: CheckCircle2 },
  CAUTION: { tone: "text-amber-300 border-amber-400/40 bg-amber-400/10", icon: CircleAlert },
  "NO-GO": { tone: "text-red-300 border-red-400/40 bg-red-400/10", icon: CircleX },
};

function ScoreRing({ score }: { score: number }) {
  const { t } = useI18n();
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-36 shrink-0 place-items-center">
      <svg viewBox="0 0 128 128" className="absolute inset-0 -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a48bff" />
            <stop offset="100%" stopColor="#6aa8ff" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="url(#score-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <div className="text-center">
        <p className="text-4xl font-semibold tracking-tight text-white">{score}</p>
        <p className="text-[11px] text-mist/45">{t.plan.decision.viability}</p>
      </div>
    </div>
  );
}

export function DecisionCard({ decision }: { decision: BusinessPlan["decision"] }) {
  const { t } = useI18n();
  const labels = t.plan.decision.verdicts;
  const v = verdicts[decision.verdict];
  const Icon = v.icon;
  return (
    <section
      aria-label={t.plan.decision.label}
      className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -start-24 size-96 rounded-full bg-emerald-400/10 blur-[100px]"
      />
      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center">
        <ScoreRing score={decision.score} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-sm font-semibold tracking-wide",
                v.tone,
              )}
            >
              <Icon className="size-4" />
              {labels[decision.verdict]}
            </span>
            {/* Where this verdict sits on the scale */}
            <ol className="flex items-center gap-1 font-mono text-[10px] text-mist/40" aria-label={t.plan.decision.scale}>
              {(Object.keys(verdicts) as Decision[]).map((d) => (
                <li
                  key={d}
                  aria-current={d === decision.verdict ? "true" : undefined}
                  className={cn(
                    "rounded-full px-2 py-0.5",
                    d === decision.verdict ? "bg-white/10 text-mist" : "bg-white/[0.03]",
                  )}
                >
                  {labels[d]}
                </li>
              ))}
            </ol>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-[1.7rem]">
            {decision.headline}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-mist/60">{decision.explanation}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {decision.conditions.map((c) => (
              <li
                key={c}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-mist/75"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
