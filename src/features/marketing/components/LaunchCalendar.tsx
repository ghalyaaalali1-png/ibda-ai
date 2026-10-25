"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { DashCard } from "@/features/plan/components/DashCard";
import type { ActionTag, Phase, PhaseId } from "../types";

const tagStyle: Record<ActionTag, string> = {
  Content: "text-brand-300 bg-brand-500/15",
  Creators: "text-[#f09ac0] bg-[#d55181]/15",
  Ads: "text-electric-400 bg-electric-500/15",
  Community: "text-emerald-300 bg-emerald-400/10",
  Setup: "text-mist/70 bg-white/[0.07]",
  Review: "text-[#fcc95a] bg-[#fab219]/10",
};

const phaseBar: Record<PhaseId, string> = {
  prelaunch: "bg-brand-500/50",
  launch: "bg-gradient-to-r from-brand-500 to-electric-400",
  growth: "bg-emerald-400/50",
};

export function LaunchCalendar({ phases }: { phases: Phase[] }) {
  const [active, setActive] = useState<PhaseId>("prelaunch");
  const phase = phases.find((p) => p.id === active)!;
  const totalWeeks = phases.reduce((n, p) => n + p.plan.length, 0);

  return (
    <DashCard
      id="calendar"
      title="90-day marketing calendar"
      icon={CalendarDays}
      action={<span className="text-xs text-mist/50">{totalWeeks} weeks · launch in week 8</span>}
    >
      {/* Overview strip — one segment per week, grouped by phase */}
      <div className="flex gap-0.5" aria-hidden>
        {phases.flatMap((p) =>
          p.plan.map((w) => (
            <button
              key={w.week}
              type="button"
              tabIndex={-1}
              onClick={() => setActive(p.id)}
              className={cn(
                "h-2 flex-1 transition-opacity first:rounded-l last:rounded-r",
                phaseBar[p.id],
                active !== p.id && "opacity-30 hover:opacity-60",
              )}
            />
          )),
        )}
      </div>

      <div role="tablist" aria-label="Campaign phases" className="mt-4 grid grid-cols-3 gap-2">
        {phases.map((p) => (
          <button
            key={p.id}
            role="tab"
            type="button"
            aria-selected={active === p.id}
            aria-controls="phase-panel"
            onClick={() => setActive(p.id)}
            className={cn(
              "rounded-2xl border px-3 py-2.5 text-left transition-all",
              active === p.id
                ? "border-brand-400/45 bg-brand-500/15 shadow-[0_0_30px_-12px_rgb(139_108_255/0.8)]"
                : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05]",
            )}
          >
            <p className={cn("text-sm font-medium", active === p.id ? "text-white" : "text-mist/70")}>{p.label}</p>
            <p className="font-mono text-[11px] text-mist/45">{p.weeks}</p>
          </button>
        ))}
      </div>

      <div id="phase-panel" role="tabpanel" className="mt-5">
        <p className="text-sm text-mist/60">
          <span className="font-medium text-white">Goal: </span>
          {phase.goal}
        </p>
        <ol key={phase.id} className="mt-4 space-y-3">
          {phase.plan.map((w) => (
            <li
              key={w.week}
              className="flex animate-message-in gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="w-14 shrink-0">
                <p className="font-mono text-[11px] text-mist/40 uppercase">Week</p>
                <p className="text-xl font-semibold text-white">{w.week}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{w.focus}</p>
                <ul className="mt-2 space-y-2">
                  {w.actions.map((a) => (
                    <li key={a.text} className="flex flex-col gap-1 text-[13px] leading-snug text-mist/70 sm:flex-row sm:items-start sm:gap-2.5">
                      <span className={cn("w-fit shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium", tagStyle[a.tag])}>
                        {a.tag}
                      </span>
                      {a.text}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </DashCard>
  );
}
