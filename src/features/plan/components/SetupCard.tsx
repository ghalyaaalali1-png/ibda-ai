import { Building2, CheckCircle2, CircleAlert, HelpCircle, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { BusinessPlan, RequirementLevel, SetupStage } from "../types";
import { Caption, DashCard } from "./DashCard";
import { SourceLink } from "./SourceLink";

const levels: { id: RequirementLevel; label: string; className: string; icon: LucideIcon }[] = [
  { id: "likely", label: "Likely required", className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", icon: CheckCircle2 },
  { id: "depends", label: "May be required", className: "border-[#fab219]/35 bg-[#fab219]/10 text-[#fcc95a]", icon: CircleAlert },
  { id: "confirm", label: "Needs official confirmation", className: "border-[#ec835a]/40 bg-[#ec835a]/10 text-[#f4a582]", icon: HelpCircle },
];

const stageLabel: Record<SetupStage, string> = {
  activity: "Business activity",
  route: "Setup route",
  authority: "Authority",
  approvals: "Approvals",
  establishment: "Establishment",
  next: "Next action",
};

export function SetupCard({ plan }: { plan: BusinessPlan }) {
  const { setup } = plan;
  return (
    <DashCard
      id="setup"
      title="UAE setup & licensing"
      icon={Building2}
      action={<span className="text-xs text-mist/50">{setup.emirate}</span>}
    >
      <p className="text-[15px] leading-relaxed text-mist/65">{setup.summary}</p>
      <p className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-[13px] text-mist/75">
        <span className="text-mist/45">Likely licence activity: </span>
        {setup.activity}
      </p>

      {/* Step-by-step path */}
      <div className="mt-6">
        <Caption>Your likely setup path</Caption>
        <ol className="relative mt-3">
          {setup.path.map((step, i) => (
            <li key={`${step.stage}-${i}`} className="relative flex gap-4 pb-4 last:pb-0">
              {i < setup.path.length - 1 && (
                <span aria-hidden className="absolute top-8 bottom-0 left-[13px] w-px bg-white/10" />
              )}
              <span className="relative grid size-7 shrink-0 place-items-center rounded-full border border-white/10 bg-ink-900 font-mono text-xs text-mist/55">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="font-mono text-[10px] tracking-wider text-brand-300/80 uppercase">{stageLabel[step.stage]}</p>
                <p className="mt-0.5 text-sm font-medium text-white">{step.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-mist/55">{step.detail}</p>
                <p className="mt-1.5">
                  <SourceLink source={step.authority} viaPortal={step.viaPortal} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Routes */}
      <div className="mt-6">
        <Caption>Setup routes to compare</Caption>
        <ul className="mt-3 space-y-2.5">
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
      </div>

      {/* Requirements by certainty */}
      <div className="mt-6 space-y-5">
        {levels.map((level) => {
          const items = setup.requirements.filter((r) => r.level === level.id);
          if (items.length === 0) return null;
          const Icon = level.icon;
          return (
            <div key={level.id}>
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", level.className)}>
                <Icon className="size-3" />
                {level.label}
              </span>
              <ul className="mt-2.5 space-y-2.5">
                {items.map((r) => (
                  <li key={r.item} className="text-[13px] leading-snug">
                    <p className="text-mist/85">{r.item}</p>
                    <p className="mt-0.5 text-mist/45">{r.why}</p>
                    <p className="mt-1">
                      <SourceLink source={r.authority} viaPortal={r.viaPortal} />
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Where to verify */}
      <div className="mt-6">
        <Caption>Official sources to verify with</Caption>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {setup.sources.map((source) => (
            <li key={source.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <SourceLink source={source} asAuthority={false} />
              <p className="mt-1 text-[11px] leading-snug text-mist/45">
                {source.scope === "Federal" ? "Federal" : source.scope} government · {source.covers}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 flex gap-2 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-mist/40">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Planning guidance only — not legal, tax or regulatory advice. Ibda can&apos;t issue licences,
        submit applications or contact authorities for you. Requirements, eligibility and fees change
        and depend on your situation, so confirm them with the relevant authority before you act.
      </p>
    </DashCard>
  );
}
