"use client";

import { TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { aed, aedShort } from "../format";
import type { BusinessPlan } from "../types";
import { DashCard } from "./DashCard";

const DEFAULT_W = 560;
const H = 240;
const PAD = { top: 20, right: 16, bottom: 28, left: 44 };
const STEP_MULTIPLIERS = [1, 1.5, 2, 2.5, 5, 10];

/** Round axis bounds and ticks that always include zero. */
function yScale(values: number[]) {
  const lo = Math.min(0, ...values);
  const hi = Math.max(0, ...values);
  const raw = Math.max(hi - lo, 1) / 3;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = magnitude * STEP_MULTIPLIERS.find((m) => m * magnitude >= raw)!;
  const min = Math.floor(lo / step) * step;
  const max = Math.max(Math.ceil(hi / step) * step, min + step);
  const ticks: number[] = [];
  for (let t = min; t <= max; t += step) ticks.push(t);
  return { min, max, ticks };
}

export function BreakEvenChart({ plan }: { plan: BusinessPlan }) {
  const { cashflow, month: beMonth, totalSales, monthlyRunningCosts, salesToCoverRunningCosts } =
    plan.breakEven;
  const [hover, setHover] = useState<number | null>(null);

  // Draw at the container's real width so axis text stays legible on phones.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(DEFAULT_W);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { price, costs } = plan.unitEconomics;
  const contributionPerSale = price - costs.reduce((sum, c) => sum + c.amount, 0);

  const lastMonth = cashflow.at(-1)!.month;
  const { min: Y_MIN, max: Y_MAX, ticks: Y_TICKS } = yScale(cashflow.map((p) => p.cumulative));
  const x = (m: number) => PAD.left + (m / lastMonth) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * (H - PAD.top - PAD.bottom);

  const line = cashflow.map((p, i) => `${i ? "L" : "M"}${x(p.month)},${y(p.cumulative)}`).join(" ");
  const area = `${line} L${x(lastMonth)},${y(0)} L${x(0)},${y(0)} Z`;
  const be = beMonth === null ? undefined : cashflow.find((p) => p.month === beMonth);
  const hovered = hover !== null ? cashflow[hover] : null;

  return (
    <DashCard
      id="break-even"
      title="Break-even estimate"
      icon={TrendingUp}
      action={<span className="text-xs text-mist/50">Cumulative cash, AED</span>}
    >
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <p className="text-sm text-mist/55">
          <span className="text-2xl font-semibold text-white">
            {beMonth === null ? `Beyond month ${lastMonth}` : `Month ${beMonth}`}
          </span>
          <span className="ml-2">
            ≈{totalSales.toLocaleString("en-US")} sales{beMonth === null ? ` in ${lastMonth} months` : ""}
          </span>
        </p>
        <p className="self-end text-sm text-mist/55">
          {salesToCoverRunningCosts === null
            ? `Each sale loses money, so no volume covers ${aed(monthlyRunningCosts)} running costs`
            : `${salesToCoverRunningCosts.toLocaleString("en-US")} sales/month cover ${aed(monthlyRunningCosts)} running costs`}
        </p>
      </div>

      <div ref={wrapRef} className="relative mt-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="block w-full"
          role="img"
          aria-label={`Cumulative cash from ${aed(cashflow[0].cumulative)} at launch to ${aed(cashflow.at(-1)!.cumulative)} by month ${lastMonth}, ${beMonth === null ? "not breaking even in that period" : `breaking even in month ${beMonth}`}.`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="cash-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b6cff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#8b6cff" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Grid + y axis */}
          {Y_TICKS.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? "rgb(255 255 255 / 0.35)" : "rgb(255 255 255 / 0.06)"}
                strokeDasharray={t === 0 ? "4 4" : undefined}
              />
              <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" className="fill-mist/40 text-[11px]">
                {aedShort(t)}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {cashflow.map((p) => (
            <text key={p.month} x={x(p.month)} y={H - 8} textAnchor="middle" className="fill-mist/40 text-[11px]">
              {p.month === 0 ? "Launch" : `M${p.month}`}
            </text>
          ))}

          <path d={area} fill="url(#cash-area)" />
          <path d={line} fill="none" stroke="#a48bff" strokeWidth="2" strokeLinejoin="round" />

          {/* Break-even marker */}
          {be && (
            <>
              <line x1={x(be.month)} x2={x(be.month)} y1={PAD.top} y2={H - PAD.bottom} stroke="rgb(52 211 153 / 0.35)" />
              <circle cx={x(be.month)} cy={y(be.cumulative)} r="6" fill="#34d399" stroke="#0d1130" strokeWidth="2" />
              <text x={x(be.month) - 10} y={PAD.top + 4} textAnchor="end" className="fill-emerald-300 text-[11px] font-medium">
                Break-even
              </text>
            </>
          )}

          {/* Hover */}
          {hovered && (
            <g pointerEvents="none">
              <line x1={x(hovered.month)} x2={x(hovered.month)} y1={PAD.top} y2={H - PAD.bottom} stroke="rgb(255 255 255 / 0.25)" />
              <circle cx={x(hovered.month)} cy={y(hovered.cumulative)} r="5" fill="#a48bff" stroke="#0d1130" strokeWidth="2" />
            </g>
          )}
          {cashflow.map((p, i) => (
            <rect
              key={p.month}
              x={x(p.month) - (W - PAD.left - PAD.right) / lastMonth / 2}
              y={PAD.top}
              width={(W - PAD.left - PAD.right) / lastMonth}
              height={H - PAD.top - PAD.bottom}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-40 -translate-x-1/2 rounded-xl border border-white/10 bg-ink-800/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
            style={{ left: `${Math.min(Math.max((x(hovered.month) / W) * 100, 15), 85)}%` }}
          >
            <p className="font-medium text-white">
              {hovered.month === 0 ? "Launch" : `Month ${hovered.month}`}
            </p>
            {hovered.month > 0 && <p className="mt-1 text-mist/55">{hovered.sales} sales</p>}
            <p className="mt-0.5 text-mist/80">{aed(hovered.cumulative)}</p>
          </div>
        )}
      </div>

      {/* Assumptions behind the curve */}
      <dl className="mt-auto grid grid-cols-1 gap-3 pt-6 sm:grid-cols-3">
        {[
          { label: "Startup spend to recover", value: aed(-cashflow[0].cumulative) },
          { label: "Contribution per sale", value: aed(contributionPerSale) },
          { label: "Monthly running costs", value: aed(monthlyRunningCosts) },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
            <dt className="text-[11px] font-medium tracking-wider text-mist/45 uppercase">{item.label}</dt>
            <dd className="mt-1 text-base font-semibold text-white">{item.value}</dd>
          </div>
        ))}
      </dl>
    </DashCard>
  );
}
