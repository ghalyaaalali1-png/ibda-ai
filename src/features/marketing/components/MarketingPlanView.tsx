"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Info, PackageCheck, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/i18n/I18nProvider";
import { JourneyTabs } from "@/features/projects/JourneyTabs";
import { useJourneyRoutes } from "@/features/projects/ProjectProvider";
import type { CaptionContext } from "../captions";
import type { MarketingPlan } from "../types";
import { ContentGenerator } from "./ContentGenerator";
import { CompetitorInspiration } from "./CompetitorInspiration";
import { ContentPlan } from "./ContentPlan";
import { KpiGrid } from "./KpiGrid";
import { LaunchCalendar } from "./LaunchCalendar";
import { LaunchMonthCalendar } from "./LaunchMonthCalendar";
import { MarketingBudget } from "./MarketingBudget";
import { StrategySummary } from "./StrategySummary";

export type MarketingViewText = {
  profileLine: string;
  intro: string;
  sourceNote: string;
  budgetFootnote: string;
};

export function MarketingPlanView({
  plan,
  text,
  captionContext,
}: {
  plan: MarketingPlan;
  text: MarketingViewText;
  /** When set, captions are written live by Claude for this business; otherwise the demo captions are used. */
  captionContext?: CaptionContext;
}) {
  const { t } = useI18n();
  const journey = useJourneyRoutes();
  const { profileLine } = text;
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Logo />
            <span aria-hidden className="hidden h-5 w-px bg-white/10 sm:block" />
            <span className="hidden text-sm font-medium text-mist/80 sm:block">{t.common.marketingPlan}</span>
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
              {t.marketing.plannedBy}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t.marketing.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-mist/60">
              {text.intro}
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-mist/50 sm:self-auto">
            <Info className="size-3.5 shrink-0" />
            {text.sourceNote}
          </p>
        </div>

        <StrategySummary strategy={plan.strategy} />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <LaunchCalendar phases={plan.phases} />
          </div>
          <div className="lg:col-span-5">
            <MarketingBudget sources={plan.budget} footnote={text.budgetFootnote} />
          </div>
        </div>

        <ContentPlan plan={plan} />

        <LaunchMonthCalendar launchMonth={plan.launchMonth} />

        <CompetitorInspiration items={plan.inspiration} />

        <ContentGenerator context={captionContext} />

        <KpiGrid kpis={plan.kpis} live={Boolean(captionContext)} />

        {/* Recommended next move */}
        <section
          aria-labelledby="next-move-title"
          className="glass relative overflow-hidden rounded-3xl border-brand-400/30 p-6 sm:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -end-16 size-80 rounded-full bg-brand-500/20 blur-3xl"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-300">
                <Sparkles className="size-3.5" />
                {t.marketing.nextMove.eyebrow}
              </p>
              <h2 id="next-move-title" className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {plan.nextMove.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-mist/60">{plan.nextMove.why}</p>
            </div>
            <div>
              <ol className="space-y-2.5">
                {plan.nextMove.steps.map((step, i) => (
                  <li key={step} className="flex gap-3 rounded-2xl border border-white/[0.07] bg-ink-900/60 px-4 py-3 text-sm text-mist/85">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-300" />
                    <span>
                      <span className="me-1 font-mono text-xs text-mist/55">{i + 1}.</span>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <a
                href="#generator"
                className="group mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-brand-500 rtl:bg-gradient-to-l px-6 text-base font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_40px_-6px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px sm:w-auto"
              >
                <Wand2 className="size-4" />
                {t.marketing.nextMove.draft}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Continue */}
        <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -start-20 size-80 rounded-full bg-brand-500/15 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-brand-400/25 bg-gradient-to-br from-brand-500/25 to-electric-500/10 text-brand-300">
                <PackageCheck className="size-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium tracking-wider text-brand-300/80 uppercase">{t.common.finalStep}</p>
                <p className="mt-1 text-lg font-semibold text-white">{t.common.launchPack}</p>
                <p className="mt-1 text-sm text-mist/55">{t.marketing.continueDescription}</p>
              </div>
            </div>
            <Link
              href={journey.launchPack}
              className="group inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-gradient-to-r from-electric-500 to-brand-500 rtl:bg-gradient-to-l px-5 text-sm font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_40px_-6px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 sm:self-auto"
            >
              {t.marketing.continueTo}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href={journey.suppliers} className="inline-flex items-center gap-1.5 text-sm text-mist/55 transition-colors hover:text-white">
            <ArrowLeft className="size-3.5 rtl:-scale-x-100" />
            {t.common.backToSuppliers}
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
