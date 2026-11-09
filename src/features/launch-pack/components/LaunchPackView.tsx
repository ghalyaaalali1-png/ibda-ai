"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FileText,
  HelpCircle,
  Info,
  ListChecks,
  Megaphone,
  Sparkles,
  Tags,
  Truck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { Caption, DashCard } from "@/features/plan/components/DashCard";
import { MetricTiles } from "@/features/plan/components/MetricTiles";
import { SourceLink } from "@/features/plan/components/SourceLink";
import type { RequirementLevel } from "@/features/plan/types";
import { displayProfileLine, displayValue } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import { JourneyTabs } from "@/features/projects/JourneyTabs";
import { useJourneyRoutes } from "@/features/projects/ProjectProvider";
import { cn } from "@/lib/cn";
import type { ChecklistItem, LaunchPack, OutstandingItem, ReadinessStatus } from "../types";

const readinessStyle: Record<ReadinessStatus, { className: string; glow: string; icon: LucideIcon }> = {
  ready: { className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", glow: "bg-emerald-400/10", icon: CheckCircle2 },
  conditions: { className: "border-[#fab219]/40 bg-[#fab219]/10 text-[#fcc95a]", glow: "bg-[#fab219]/10", icon: CircleAlert },
  "needs-work": { className: "border-[#ec835a]/45 bg-[#ec835a]/10 text-[#f4a582]", glow: "bg-[#ec835a]/10", icon: AlertTriangle },
};

const levelStyle: Record<RequirementLevel, { className: string; icon: LucideIcon }> = {
  likely: { className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", icon: CheckCircle2 },
  depends: { className: "border-[#fab219]/35 bg-[#fab219]/10 text-[#fcc95a]", icon: CircleAlert },
  confirm: { className: "border-[#ec835a]/40 bg-[#ec835a]/10 text-[#f4a582]", icon: HelpCircle },
};

const kindStyle: Record<OutstandingItem["kind"], string> = {
  "Question for you": "bg-brand-500/20 text-brand-300",
  "To verify": "bg-[#ec835a]/15 text-[#f4a582]",
  Assumption: "bg-white/[0.07] text-mist/70",
};

function FromTag({ from }: { from: string }) {
  const { t } = useI18n();
  return (
    <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-mist/50">
      {t.launchPack.from[from] ?? from}
    </span>
  );
}

function ChecklistColumn({ title, items, prefix }: { title: string; items: ChecklistItem[]; prefix: string }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((d) => {
      const next = new Set(d);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className="font-mono text-[11px] text-mist/55">
          {done.size}/{items.length}
        </span>
      </div>
      <ul className="mt-3 space-y-3">
        {items.map((item, i) => (
          <li key={`${prefix}-${i}`} className="flex gap-2.5">
            <input
              id={`${prefix}-${i}`}
              type="checkbox"
              checked={done.has(i)}
              onChange={() => toggle(i)}
              className="mt-0.5 size-4 shrink-0 accent-[#8b6cff]"
            />
            <div className="min-w-0">
              <label htmlFor={`${prefix}-${i}`} className={cn("text-[13px] leading-snug", done.has(i) ? "text-mist/55 line-through" : "text-mist/85")}>
                {item.text}
              </label>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <FromTag from={item.from} />
                {item.detail && <span className="text-[11px] text-mist/55">{item.detail}</span>}
              </div>
              {(item.link || item.viaPortal) && (
                <p className="mt-1">
                  <SourceLink source={item.link} viaPortal={item.viaPortal} />
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LaunchPackView({
  pack,
  sourceNote,
  supplierLabel,
}: {
  pack: LaunchPack;
  sourceNote: string;
  /** What the shortlisted suppliers are, e.g. "Supplier types". */
  supplierLabel: string;
}) {
  const { t } = useI18n();
  const journey = useJourneyRoutes();
  const { aed, aedRange } = t.fmt;
  const copy = t.launchPack;
  const { plan, suppliers, marketing, extras } = pack.inputs;
  const profileLine = displayProfileLine(t, plan.profile);
  const readiness = readinessStyle[pack.readiness.status];
  const ReadinessIcon = readiness.icon;
  const contribution = plan.unitEconomics.price - plan.unitEconomics.costs.reduce((s, c) => s + c.amount, 0);
  const suggestedRoute = plan.setup.options.find((o) => o.recommended) ?? plan.setup.options[0];
  const marketingBudget = marketing.budget.reduce((s, b) => s + b.total, 0);
  const overAllocation = pack.shortlist.total - suppliers.allocation;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Logo />
            <span aria-hidden className="hidden h-5 w-px bg-white/10 sm:block" />
            <span className="hidden text-sm font-medium text-mist/80 sm:block">{t.common.launchPack}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <span className="me-2 hidden truncate text-sm text-mist/50 lg:block">{profileLine}</span>
            <LanguageSwitcher className="ms-1" />
          </div>
        </Container>
        <JourneyTabs />
      </header>

      <Container as="main" className="space-y-6 py-10 sm:py-14">
        {/* Intro */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-medium text-brand-300">
              <Sparkles className="size-3.5" />
              {t.plan.preparedBy}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.title}</h1>
            <p className="mt-2 text-base text-mist/55">{profileLine}</p>
          </div>
          <p className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-mist/50 sm:self-auto">
            <Info className="size-3.5 shrink-0" />
            {sourceNote}
          </p>
        </div>

        {/* Readiness */}
        <section aria-labelledby="readiness-title" className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div aria-hidden className={cn("pointer-events-none absolute -top-32 -start-24 size-96 rounded-full blur-[100px]", readiness.glow)} />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Caption>{copy.readiness.caption}</Caption>
              <h2 id="readiness-title" className="mt-2">
                <span className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-sm font-semibold tracking-wide", readiness.className)}>
                  <ReadinessIcon className="size-4" />
                  {copy.readiness.labels[pack.readiness.status]}
                </span>
              </h2>
              <p className="mt-3 max-w-xl text-sm text-mist/55">
                {copy.readiness.note}
              </p>
            </div>
            <ul className="space-y-2 sm:max-w-md">
              {pack.readiness.reasons.map((r) => (
                <li key={r} className="flex gap-2 text-[13px] leading-snug text-mist/80">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-mist/40" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Summary + pricing */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <DashCard id="summary" title={copy.summary.title} icon={FileText}>
              <p className="text-[15px] leading-relaxed text-mist/75">{extras.ideaSummary}</p>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-medium tracking-wider text-mist/55 uppercase">{t.common.targetCustomer}</dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-mist/70">{plan.market.targetCustomer}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium tracking-wider text-mist/55 uppercase">{copy.summary.positioning}</dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-mist/70">{extras.positioning}</dd>
                </div>
              </dl>
              <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <Caption>{copy.summary.assessment}</Caption>
                <p className="mt-1 text-sm font-medium text-white">{plan.decision.headline}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-mist/60">{plan.decision.explanation}</p>
              </div>
            </DashCard>
          </div>
          <div className="lg:col-span-5">
            <DashCard id="pricing-rec" title={copy.pricing.title} icon={Tags}>
              <Caption>{copy.pricing.price}</Caption>
              <p className="mt-1.5 text-3xl font-semibold tracking-tight text-white">{aedRange(plan.pricing.min, plan.pricing.max)}</p>
              <p className="mt-1 text-sm text-mist/55">
                {copy.pricing.typical(aed(plan.pricing.hero), plan.unit.singular, aed(contribution))}
              </p>
              {/* Live plans reuse the positioning as the rationale — already shown in the summary. */}
              {plan.pricing.rationale !== extras.positioning && (
                <p className="mt-4 text-[13px] leading-relaxed text-mist/65">{plan.pricing.rationale}</p>
              )}
              <p className="mt-auto pt-5 text-xs text-mist/55">{copy.pricing.footnote}</p>
            </DashCard>
          </div>
        </div>

        <MetricTiles plan={plan} />

        {/* Suppliers */}
        <DashCard
          id="pack-suppliers"
          title={copy.suppliers.title}
          icon={Truck}
          action={<span className="text-xs text-mist/50">{supplierLabel}</span>}
        >
          {/* Phones: one card per supplier, so nothing hides off-screen. */}
          <ul className="space-y-3 sm:hidden">
            {pack.shortlist.rows.map((r) => (
              <li
                key={r.supplier + r.category}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 text-[13px]"
              >
                <p className="text-[11px] font-medium tracking-wider text-mist/55 uppercase">{r.category}</p>
                <div className="mt-1 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{r.supplier}</p>
                    <p className="text-xs text-mist/55">{r.location}</p>
                  </div>
                  <div className="shrink-0 text-end">
                    <p className="font-medium whitespace-nowrap text-white">{aed(r.estimate)}</p>
                    <p className="text-xs text-mist/55">{r.basis}</p>
                  </div>
                </div>
                <dl className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-mist/55">{copy.suppliers.minimum}</dt>
                    <dd className="text-mist/75">{r.moq}</dd>
                  </div>
                  <div>
                    <dt className="text-mist/55">{copy.suppliers.leadTime}</dt>
                    <dd className="text-mist/75">{r.leadTime}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[640px] text-start text-[13px]">
              <caption className="sr-only">{copy.suppliers.caption}</caption>
              <thead>
                <tr className="text-[11px] font-medium tracking-wider text-mist/55 uppercase">
                  <th scope="col" className="pb-2 text-start font-medium">{copy.suppliers.category}</th>
                  <th scope="col" className="pb-2 text-start font-medium">{copy.suppliers.supplier}</th>
                  <th scope="col" className="pb-2 text-start font-medium">{copy.suppliers.minimum}</th>
                  <th scope="col" className="pb-2 text-start font-medium">{copy.suppliers.leadTime}</th>
                  <th scope="col" className="pb-2 text-end font-medium">{copy.suppliers.firstOrder}</th>
                </tr>
              </thead>
              <tbody>
                {pack.shortlist.rows.map((r) => (
                  <tr key={r.supplier + r.category} className="border-t border-white/[0.06] align-top">
                    <td className="py-3 pe-3 text-mist/60">{r.category}</td>
                    <td className="py-3 pe-3">
                      <p className="font-medium text-white">{r.supplier}</p>
                      <p className="text-xs text-mist/55">{r.location}</p>
                    </td>
                    <td className="py-3 pe-3 text-mist/75">{r.moq}</td>
                    <td className="py-3 pe-3 text-mist/75">{r.leadTime}</td>
                    <td className="py-3 text-end">
                      <p className="font-medium whitespace-nowrap text-white">{aed(r.estimate)}</p>
                      <p className="text-xs text-mist/55">{r.basis}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-white/[0.06] pt-3 text-sm">
            <span className="text-mist/55">
              {copy.suppliers.total(aed(pack.shortlist.total), aed(suppliers.allocation), suppliers.allocationLabel)}
            </span>
            <span className={overAllocation > 0 ? "text-[#fcc95a]" : "text-emerald-300"}>
              {overAllocation > 0 ? copy.suppliers.over(aed(overAllocation)) : copy.suppliers.within}
            </span>
          </div>
          <p className="mt-3 text-xs text-mist/55">{suppliers.sourceNote}</p>
        </DashCard>

        {/* Requirements + marketing */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <DashCard
              id="pack-requirements"
              title={copy.requirements.title}
              icon={Building2}
              action={<span className="text-xs text-mist/50">{displayValue(t, plan.setup.emirate)}</span>}
            >
              <p className="text-[13px] text-mist/65">
                <span className="text-mist/55">{copy.requirements.activity}</span>
                {plan.setup.activity}
              </p>
              {suggestedRoute && (
                <p className="mt-1 text-[13px] text-mist/65">
                  <span className="text-mist/55">{copy.requirements.route}</span>
                  {suggestedRoute.name}
                  {copy.requirements.fee}
                </p>
              )}
              <div className="mt-5 space-y-5">
                {(["likely", "depends", "confirm"] as const).map((level) => {
                  const items = pack.requirements.filter((r) => r.level === level);
                  if (items.length === 0) return null;
                  const style = levelStyle[level];
                  const Icon = style.icon;
                  return (
                    <div key={level}>
                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", style.className)}>
                        <Icon className="size-3" />
                        {t.plan.setup.levels[level]}
                      </span>
                      <ul className="mt-2.5 space-y-2.5">
                        {items.map((r) => (
                          <li key={r.item} className="text-[13px] leading-snug">
                            <p className="text-mist/85">{r.item}</p>
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
            </DashCard>
          </div>
          <div className="lg:col-span-5">
            <DashCard id="pack-marketing" title={copy.marketing.title} icon={Megaphone}>
              <ol className="space-y-3">
                {pack.marketingWeeks.map((w) => (
                  <li key={w.week} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-white">
                        <span className="me-1.5 font-mono text-[11px] text-mist/55">{t.common.week(w.week)}</span>
                        {w.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-mist/55">
                        {copy.marketing.posts(w.posts, w.planWeek)}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-snug text-mist/60">{w.goal}</p>
                    <p className="mt-1.5 text-[11px] text-brand-300/90">{w.platforms.join(" · ")}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-baseline justify-between border-t border-white/[0.06] pt-3 text-sm">
                <span className="text-mist/55">{copy.marketing.budget}</span>
                <span className="font-medium text-white">{aed(marketingBudget)}</span>
              </div>
              <Link href={journey.marketing} className="mt-3 text-xs text-brand-300 hover:text-white">
                {copy.marketing.open}
              </Link>
            </DashCard>
          </div>
        </div>

        {/* Final checklist */}
        <DashCard id="pack-checklist" title={copy.checklist.title} icon={ListChecks}>
          <div className="grid gap-4 lg:grid-cols-3">
            <ChecklistColumn title={copy.checklist.before} items={pack.checklist.before} prefix="before" />
            <ChecklistColumn title={copy.checklist.launch} items={pack.checklist.launch} prefix="launch" />
            <ChecklistColumn title={copy.checklist.after} items={pack.checklist.after} prefix="after" />
          </div>
          <p className="mt-4 text-xs text-mist/55">{copy.checklist.footnote}</p>
        </DashCard>

        {/* Outstanding */}
        <DashCard
          id="pack-outstanding"
          title={copy.outstanding.title}
          icon={ClipboardList}
          action={<span className="text-xs text-mist/50">{copy.outstanding.count(pack.outstanding.length)}</span>}
        >
          <ul className="grid gap-3 md:grid-cols-2">
            {pack.outstanding.map((o, i) => (
              <li key={`${o.kind}-${i}`} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-medium", kindStyle[o.kind])}>
                    {copy.outstanding.kinds[o.kind] ?? o.kind}
                  </span>
                  <FromTag from={o.from} />
                </div>
                <p className="mt-2 text-[13px] leading-snug text-mist/85">{o.text}</p>
                {o.why && <p className="mt-1 text-xs text-mist/55">{o.why}</p>}
                {(o.link || o.viaPortal) && (
                  <p className="mt-1.5">
                    <SourceLink source={o.link} viaPortal={o.viaPortal} />
                  </p>
                )}
              </li>
            ))}
          </ul>
        </DashCard>

        <p className="flex gap-2 text-xs leading-relaxed text-mist/55">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {copy.disclaimer}
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href={journey.marketing} className="inline-flex items-center gap-1.5 text-sm text-mist/55 transition-colors hover:text-white">
            <ArrowLeft className="size-3.5 rtl:-scale-x-100" />
            {t.common.backToMarketingPlan}
          </Link>
          <Link href={journey.plan} className="inline-flex items-center gap-1.5 text-sm text-mist/55 transition-colors hover:text-white">
            <ArrowLeft className="size-3.5 rtl:-scale-x-100" />
            {t.common.backToBusinessPlan}
          </Link>
        </div>
      </Container>
    </>
  );
}
