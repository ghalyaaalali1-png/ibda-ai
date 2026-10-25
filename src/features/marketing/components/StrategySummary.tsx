import { Crosshair, Gem, Megaphone, Target, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import type { MarketingPlan } from "../types";
import { Caption } from "@/features/plan/components/DashCard";

export function StrategySummary({ strategy }: { strategy: MarketingPlan["strategy"] }) {
  const blocks = [
    { icon: Users, label: "Target customer", text: strategy.targetCustomer },
    { icon: Crosshair, label: "Brand positioning", text: strategy.positioning },
    { icon: Gem, label: "Value proposition", text: strategy.valueProposition },
  ];

  return (
    <section aria-labelledby="strategy-title" className="glass relative overflow-hidden rounded-3xl p-5 sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-brand-500/15 blur-[100px]"
      />
      <h2 id="strategy-title" className="sr-only">Marketing strategy summary</h2>

      {/* Launch objective */}
      <div className="relative flex gap-4 rounded-2xl border border-brand-400/30 bg-brand-500/[0.08] p-4 sm:p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-600 to-electric-500 text-white shadow-[0_0_24px_-6px_rgb(139_108_255/0.8)]">
          <Target className="size-5" />
        </span>
        <div>
          <Caption>Launch objective</Caption>
          <p className="mt-1 text-base leading-relaxed font-medium text-white sm:text-lg">{strategy.objective}</p>
        </div>
      </div>

      <div className="relative mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <dl className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {blocks.map((b) => (
            <div key={b.label}>
              <dt className="flex items-center gap-2 text-[11px] font-medium tracking-wider text-mist/45 uppercase">
                <b.icon className="size-3.5 text-brand-300" />
                {b.label}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-mist/75">{b.text}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="flex items-center gap-2 text-[11px] font-medium tracking-wider text-mist/45 uppercase">
            <Megaphone className="size-3.5 text-brand-300" />
            Recommended channels
          </p>
          <ul className="mt-3 space-y-2">
            {strategy.channels.map((c) => (
              <li key={c.name} className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs leading-snug text-mist/50">{c.role}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
                    c.priority === "Primary" ? "bg-brand-500/20 text-brand-300" : "bg-white/[0.06] text-mist/55",
                  )}
                >
                  {c.priority}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
