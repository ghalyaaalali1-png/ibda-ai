import { Activity, Gauge } from "lucide-react";
import { DashCard } from "@/features/plan/components/DashCard";
import type { Kpi } from "../types";

export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <DashCard
      id="kpis"
      title="Launch KPIs"
      icon={Gauge}
      action={<span className="text-xs text-mist/50">Demo targets</span>}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <li key={k.label} className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[11px] font-medium tracking-wider text-mist/45 uppercase">{k.label}</p>
            <p className="mt-1.5 text-xl font-semibold tracking-tight text-white">{k.target}</p>
            <p className="mt-1 font-mono text-[11px] text-brand-300/80">Check: {k.when}</p>
            <p className="mt-3 flex gap-1.5 border-t border-white/[0.06] pt-3 text-[13px] leading-snug text-mist/60">
              <Activity className="mt-0.5 size-3.5 shrink-0 text-mist/40" />
              {k.signal}
            </p>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
