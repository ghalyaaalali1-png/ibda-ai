import { Globe2, Users } from "lucide-react";
import type { BusinessPlan } from "../types";
import { Caption, DashCard } from "./DashCard";

const AXIS_MAX = 3000;
const AXIS_TICKS = [0, 1000, 2000, 3000];

export function MarketCard({ plan }: { plan: BusinessPlan }) {
  const { market, pricing } = plan;
  const pct = (v: number) => `${(v / AXIS_MAX) * 100}%`;

  return (
    <DashCard id="market" title="Market opportunity" icon={Globe2}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-[15px] leading-relaxed text-mist/65">{market.summary}</p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {market.signals.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <dt className="text-[11px] font-medium tracking-wider text-mist/45 uppercase">{s.label}</dt>
                <dd className="mt-1 text-base font-semibold text-white">{s.value}</dd>
                <dd className="mt-1 text-xs leading-snug text-mist/50">{s.detail}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex gap-3 rounded-2xl border border-brand-400/20 bg-brand-500/[0.06] p-4">
            <Users className="mt-0.5 size-4 shrink-0 text-brand-300" />
            <div>
              <Caption>Target customer</Caption>
              <p className="mt-1 text-sm leading-relaxed text-mist/75">{market.targetCustomer}</p>
            </div>
          </div>
        </div>

        {/* Competitor price bands with the recommended range overlaid */}
        <div>
          <div className="flex items-baseline justify-between">
            <Caption>Abaya price bands, AED</Caption>
            <span className="text-[11px] text-mist/35">Demo estimates</span>
          </div>
          <ul className="mt-4 space-y-4 py-2">
            <li>
              <p className="text-xs font-medium text-brand-300">
                Your recommended range{" "}
                <span className="font-normal text-mist/45">
                  {pricing.min}–{pricing.max}
                </span>
              </p>
              <div className="relative mt-1.5 h-2">
                <span
                  className="absolute inset-y-0 rounded bg-gradient-to-r from-brand-500 to-electric-400"
                  style={{ left: pct(pricing.min), width: pct(pricing.max - pricing.min) }}
                />
              </div>
            </li>
            {market.priceBands.map((band) => (
              <li key={band.label}>
                <p className="text-xs text-mist/60">
                  {band.label}{" "}
                  <span className="text-mist/35">
                    {band.min.toLocaleString("en-US")}–{band.max.toLocaleString("en-US")}
                    {band.max >= AXIS_MAX ? "+" : ""}
                  </span>
                </p>
                <div className="relative mt-1.5 h-2">
                  {/* Faint guide showing where the recommended range falls */}
                  <span
                    aria-hidden
                    className="absolute -inset-y-1 bg-brand-500/10"
                    style={{ left: pct(pricing.min), width: pct(pricing.max - pricing.min) }}
                  />
                  <span
                    className="absolute inset-y-0 rounded bg-white/25"
                    style={{ left: pct(band.min), width: pct(band.max - band.min) }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="relative mt-1 h-4 border-t border-white/[0.08]">
            {AXIS_TICKS.map((t) => (
              <span
                key={t}
                className="absolute top-1 -translate-x-1/2 font-mono text-[10px] text-mist/35 first:translate-x-0 last:-translate-x-full"
                style={{ left: pct(t) }}
              >
                {t === 0 ? "0" : `${t / 1000}k`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DashCard>
  );
}
