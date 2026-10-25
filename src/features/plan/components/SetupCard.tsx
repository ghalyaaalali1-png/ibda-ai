import { Building2, Check, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import type { BusinessPlan } from "../types";
import { Caption, DashCard } from "./DashCard";

export function SetupCard({ plan }: { plan: BusinessPlan }) {
  const { setup } = plan;
  return (
    <DashCard id="setup" title="UAE setup & licensing" icon={Building2}>
      <p className="text-[15px] leading-relaxed text-mist/65">{setup.summary}</p>

      <ul className="mt-5 space-y-2.5">
        {setup.options.map((option) => (
          <li
            key={option.name}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
              option.recommended
                ? "border-brand-400/35 bg-brand-500/[0.08]"
                : "border-white/[0.06] bg-white/[0.02]",
            )}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-white">{option.name}</p>
                {option.recommended && (
                  <span className="rounded-full bg-brand-500/25 px-2 py-0.5 text-[10px] font-medium tracking-wide text-brand-300 uppercase">
                    Suggested
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[13px] text-mist/50">{option.fit}</p>
            </div>
            <p className="shrink-0 text-[13px] text-mist/75">{option.cost}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Caption>Typically needed</Caption>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {setup.requirements.map((r) => (
            <li key={r} className="flex gap-2 text-[13px] leading-snug text-mist/70">
              <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 flex gap-2 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-mist/40">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Guidance based on current requirements and official sources — not legal
        advice. Confirm costs and requirements with the relevant licensing authority.
      </p>
    </DashCard>
  );
}
