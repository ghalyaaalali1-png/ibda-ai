"use client";

import { Info } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import type { ActivityLogEntry, AgentAction } from "../types";

const actionColor: Record<AgentAction, string> = {
  Reviewing: "bg-mist/60",
  Researching: "bg-brand-400",
  Calculating: "bg-electric-400",
  Comparing: "bg-violet-300",
  "Checking sources": "bg-emerald-400",
  Planning: "bg-amber-300",
  Assuming: "bg-sky-300",
  "Needs input": "bg-orange-300",
};

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function ActivityPanel({
  log,
  complete,
  live = false,
}: {
  log: ActivityLogEntry[];
  complete: boolean;
  /** The founder's own answers are being analysed by Claude (not the demo scenario). */
  live?: boolean;
}) {
  const { t } = useI18n();
  const entries = [...log].reverse();
  const actions = new Set(log.map((e) => e.action)).size;

  return (
    <aside className="glass flex flex-col overflow-hidden rounded-3xl lg:max-h-[calc(100dvh-8rem)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <h2 className="text-sm font-semibold text-white">{t.analysis.activityTitle}</h2>
        <span className="font-mono text-[11px] text-mist/55">
          {t.analysis.activityCounts(log.length, actions)}
        </span>
      </div>

      <ol className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3" aria-label={t.analysis.activityLog}>
        {entries.map((entry) => (
          <li
            key={entry.key}
            className={cn(
              "animate-message-in rounded-xl px-3 py-2.5 transition-colors",
              entry.status === "active" && "bg-white/[0.04]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wide text-mist/70 uppercase">
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full",
                    actionColor[entry.action],
                    entry.status === "active" && "animate-pulse",
                  )}
                />
                {t.analysis.actions[entry.action] ?? entry.action}
              </span>
              <span className="font-mono text-[11px] text-mist/55">
                {formatTime(entry.atMs)}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-snug text-mist/80">{entry.label}</p>
          </li>
        ))}
        {complete && (
          <li className="animate-message-in rounded-xl px-3 py-2.5 text-[13px] text-emerald-300">
            {t.analysis.allComplete}
          </li>
        )}
      </ol>

      <p className="flex items-center gap-2 border-t border-white/[0.06] px-5 py-3 text-[11px] text-mist/55">
        <Info className="size-3.5 shrink-0" />
        {live ? t.analysis.footerLive : t.analysis.footerDemo}
      </p>
    </aside>
  );
}
