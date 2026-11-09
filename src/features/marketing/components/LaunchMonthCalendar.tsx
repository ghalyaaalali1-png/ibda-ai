"use client";

import { Check, Copy, Rocket } from "lucide-react";
import { useState } from "react";
import { DashCard } from "@/features/plan/components/DashCard";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import type { CalendarPost, MarketingPlan } from "../types";

function PostCard({ post }: { post: CalendarPost }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(post.caption);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked — the caption remains selectable.
    }
  }

  return (
    <li className="animate-message-in rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <span className="font-mono text-[11px] text-mist/55 uppercase">{post.day}</span>
        <span className="rounded-md bg-brand-500/15 px-1.5 py-0.5 text-[11px] font-medium text-brand-300">
          {post.platform}
        </span>
        <span className="text-[11px] text-mist/55">{post.contentType}</span>
        <span className="ms-auto rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[11px] text-emerald-300">
          {post.objective}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-white">{post.topic}</p>
      <div className="mt-2.5 flex gap-3 rounded-xl border-s-2 border-brand-400/40 bg-ink-900/60 py-2.5 ps-3 pe-2">
        <p className="min-w-0 flex-1 text-[13px] leading-relaxed whitespace-pre-wrap text-mist/75">{post.caption}</p>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? t.marketing.launchMonth.copied : t.marketing.launchMonth.copyCaption(post.topic)}
          className="grid size-7 shrink-0 place-items-center rounded-full text-mist/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </li>
  );
}

/** Four themed weeks of ready-to-review posts around launch. */
export function LaunchMonthCalendar({ launchMonth }: { launchMonth: MarketingPlan["launchMonth"] }) {
  const { t } = useI18n();
  const copy = t.marketing.launchMonth;
  const [active, setActive] = useState(1);
  const week = launchMonth.weeks.find((w) => w.week === active) ?? launchMonth.weeks[0];
  const posts = launchMonth.posts.filter((p) => p.week === week?.week);
  const first = launchMonth.weeks[0]?.planWeek;
  const last = launchMonth.weeks.at(-1)?.planWeek;

  return (
    <DashCard
      id="launch-month"
      title={copy.title}
      icon={Rocket}
      action={<span className="text-xs text-mist/50">{copy.summary(launchMonth.posts.length, first, last)}</span>}
    >
      <div role="tablist" aria-label={copy.weeksLabel} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {launchMonth.weeks.map((w) => (
          <button
            key={w.week}
            role="tab"
            type="button"
            aria-selected={active === w.week}
            aria-controls="launch-month-panel"
            onClick={() => setActive(w.week)}
            className={cn(
              "rounded-2xl border px-3 py-2.5 text-start transition-all",
              active === w.week
                ? "border-brand-400/45 bg-brand-500/15 shadow-[0_0_30px_-12px_rgb(139_108_255/0.8)]"
                : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05]",
            )}
          >
            <p className="font-mono text-[11px] text-mist/55">{t.common.week(w.week)}</p>
            <p className={cn("text-sm font-medium", active === w.week ? "text-white" : "text-mist/70")}>{w.title}</p>
          </button>
        ))}
      </div>

      {week && (
        <div id="launch-month-panel" role="tabpanel" className="mt-5">
          <p className="text-sm text-mist/60">
            <span className="font-medium text-white">{t.common.goal}</span>
            {week.goal}
          </p>
          <ol key={week.week} className="mt-4 grid gap-3 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={`${post.day}-${i}`} post={post} />
            ))}
          </ol>
        </div>
      )}

      <p className="mt-5 text-xs text-mist/55">
        {copy.footnote}
      </p>
    </DashCard>
  );
}
