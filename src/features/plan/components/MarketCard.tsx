"use client";

import { Globe2, Users } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { BusinessPlan } from "../types";
import { Caption, DashCard } from "./DashCard";

const STEP_MULTIPLIERS = [1, 1.5, 2, 2.5, 5, 10];

/** A round axis maximum split into three equal steps, e.g. 0–3,000 or 0–60. */
function priceAxis(maxValue: number) {
  const raw = Math.max(maxValue, 1) / 3;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = magnitude * STEP_MULTIPLIERS.find((m) => m * magnitude >= raw)!;
  return { max: step * 3, ticks: [0, step, step * 2, step * 3] };
}

const tickLabel = (t: number) => (t === 0 ? "0" : t >= 1000 ? `${t / 1000}k` : `${t}`);

export function MarketCard({ plan }: { plan: BusinessPlan }) {
  const { t } = useI18n();
  const { market, pricing, unit } = plan;
  const { max: AXIS_MAX, ticks: AXIS_TICKS } = priceAxis(
    Math.max(pricing.max, ...market.priceBands.map((b) => b.max)),
  );
  const pct = (v: number) => `${(v / AXIS_MAX) * 100}%`;
  const unitTitle = unit.singular.charAt(0).toUpperCase() + unit.singular.slice(1);

  return (
    <DashCard id="market" title={t.plan.market.title} icon={Globe2}>
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
              <Caption>{t.common.targetCustomer}</Caption>
              <p className="mt-1 text-sm leading-relaxed text-mist/75">{market.targetCustomer}</p>
            </div>
          </div>
        </div>

        {/* Competitor price bands with the recommended range overlaid (a number line, so always left to right) */}
        <div dir="ltr">
          <div className="flex items-baseline justify-between">
            <Caption>{t.plan.market.bands(unitTitle)}</Caption>
            <span className="text-[11px] text-mist/35">{market.priceBandsNote}</span>
          </div>
          <ul className="mt-4 space-y-4 py-2">
            <li>
              <p className="text-xs font-medium text-brand-300">
                {t.plan.market.yourRange}{" "}
                <span className="font-normal text-mist/45">
                  {pricing.min.toLocaleString("en-US")}–{pricing.max.toLocaleString("en-US")}
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
                {tickLabel(t)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DashCard>
  );
}
