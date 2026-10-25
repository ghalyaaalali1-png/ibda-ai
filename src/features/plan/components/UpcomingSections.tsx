import { ArrowRight, Megaphone, Truck, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { BusinessPlan } from "../types";

const icons: Record<string, LucideIcon> = { suppliers: Truck, marketing: Megaphone };

export function UpcomingSections({ plan }: { plan: BusinessPlan }) {
  return (
    <section aria-labelledby="upcoming-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-wider text-brand-300/80 uppercase">
            Continue your plan
          </p>
          <h2 id="upcoming-title" className="mt-1.5 text-xl font-semibold tracking-tight text-white">
            Next parts of your launch plan
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {plan.upcoming.map((section) => {
          const Icon = icons[section.id] ?? ArrowRight;
          return (
            <article
              key={section.id}
              className="group glass relative overflow-hidden rounded-3xl p-6 transition-colors focus-within:border-brand-400/40 hover:border-brand-400/30"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -bottom-24 size-64 rounded-full bg-brand-500/10 blur-3xl transition-colors group-hover:bg-brand-500/20"
              />
              <div className="relative flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-xl border border-brand-400/25 bg-gradient-to-br from-brand-500/25 to-electric-500/10 text-brand-300">
                  <Icon className="size-5" />
                </span>
                {section.href ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-brand-400/30 bg-brand-500/15 px-2.5 py-1 text-[11px] text-brand-300">
                    Ready
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-mist/60">
                    Up next
                  </span>
                )}
              </div>
              <h3 className={`mt-5 text-lg font-semibold text-white ${section.href ? "" : "relative"}`}>
                {section.href ? (
                  // Stretched link: the whole card is clickable.
                  <Link
                    href={section.href}
                    className="after:absolute after:inset-0 after:z-10 after:rounded-3xl focus-visible:outline-none"
                  >
                    {section.title}
                  </Link>
                ) : (
                  section.title
                )}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-mist/55">{section.description}</p>
              <ul className="relative mt-5 flex flex-wrap gap-2">
                {section.includes.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-mist/65"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
