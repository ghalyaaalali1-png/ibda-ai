"use client";

import { ArrowLeft, ArrowRight, Info, Megaphone, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/i18n/I18nProvider";
import { JourneyTabs } from "@/features/projects/JourneyTabs";
import { useJourneyRoutes } from "@/features/projects/ProjectProvider";
import type { SupplierCategory, SupplierScreenData } from "../types";
import { CategoryTabs } from "./CategoryTabs";
import { CompareTable } from "./CompareTable";
import { RfqDrawer, type RfqStatus } from "./RfqDrawer";
import { ShortlistCard } from "./ShortlistCard";
import { SupplierCard } from "./SupplierCard";

const MAX_COMPARE = 4;

export function SuppliersWorkspace({
  data,
  budget,
}: {
  data: SupplierScreenData;
  /** Startup budget from the plan, for the shortlist summary. */
  budget: number;
}) {
  const { t } = useI18n();
  const journey = useJourneyRoutes();
  const { categories, suppliers, shortlist, brief, profileLine } = data;
  const [category, setCategory] = useState<SupplierCategory>(categories[0]?.id ?? "");
  const [compareIds, setCompareIds] = useState<string[]>(data.defaultCompare);
  const [rfqFor, setRfqFor] = useState<string | null>(null);
  const [rfqStatus, setRfqStatus] = useState<Record<string, RfqStatus>>({});

  const byId = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        categories.map((c) => [c.id, suppliers.filter((s) => s.category === c.id).length]),
      ) as Record<SupplierCategory, number>,
    [categories, suppliers],
  );
  const visible = suppliers
    .filter((s) => s.category === category)
    .sort((a, b) => b.matchScore - a.matchScore);
  const activeCategory = categories.find((c) => c.id === category) ?? categories[0];
  const rfqSupplier = rfqFor ? byId.get(rfqFor) : undefined;

  const toggleCompare = (id: string) =>
    setCompareIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < MAX_COMPARE ? [...ids, id] : ids,
    );

  const closeRfq = useCallback(() => setRfqFor(null), []);
  const markDrafted = useCallback(() => {
    if (!rfqFor) return;
    setRfqStatus((s) => (s[rfqFor] ? s : { ...s, [rfqFor]: "drafted" }));
  }, [rfqFor]);

  const rfqCounts = Object.values(rfqStatus);
  const sentCount = rfqCounts.filter((s) => s === "sent").length;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Logo />
            <span aria-hidden className="hidden h-5 w-px bg-white/10 sm:block" />
            <span className="hidden text-sm font-medium text-mist/80 sm:block">{t.common.suppliers}</span>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-sm text-mist/50 lg:block">{profileLine}</span>
            {rfqCounts.length > 0 && (
              <span className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-mist/70 sm:inline">
                {t.suppliers.rfqCount(rfqCounts.length, sentCount)}
              </span>
            )}
            <LanguageSwitcher />
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
              {t.suppliers.sourcedBy}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t.suppliers.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-mist/60">
              {data.intro}
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-mist/50 sm:self-auto">
            <Info className="size-3.5 shrink-0" />
            {data.sourceNote}
          </p>
        </div>

        <ShortlistCard
          items={shortlist}
          categories={categories}
          allocationLabel={data.allocationLabel}
          budgetLabel={t.fmt.aed(budget)}
          criteria={data.shortlistCriteria}
          suppliersById={byId}
          allocation={data.allocation}
          onRequestQuote={setRfqFor}
          onSelectCategory={(s) => {
            setCategory(s.category);
            document.getElementById("all-suppliers")?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* Browse by category */}
        <section id="all-suppliers" aria-labelledby="browse-title" className="scroll-mt-24 pt-4">
          <div className="flex flex-col gap-1">
            <h2 id="browse-title" className="text-xl font-semibold tracking-tight text-white">
              {t.suppliers.browseTitle}
            </h2>
            <p className="text-sm text-mist/50">{activeCategory.summary}</p>
          </div>
          <div className="mt-5">
            <CategoryTabs categories={categories} counts={counts} active={category} onChange={setCategory} />
          </div>
          <div
            id="supplier-panel"
            role="tabpanel"
            aria-labelledby={`tab-${category}`}
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            {visible.map((s) => (
              <SupplierCard
                key={s.id}
                supplier={s}
                categoryLabel={activeCategory.shortLabel}
                badge={data.supplierBadge}
                inCompare={compareIds.includes(s.id)}
                compareFull={compareIds.length >= MAX_COMPARE}
                rfqStatus={rfqStatus[s.id]}
                onToggleCompare={() => toggleCompare(s.id)}
                onRequestQuote={() => setRfqFor(s.id)}
              />
            ))}
          </div>
        </section>

        <CompareTable
          categories={categories}
          items={compareIds.map((id) => byId.get(id)!).filter(Boolean)}
          onRemove={toggleCompare}
          onRequestQuote={setRfqFor}
        />

        {/* Continue */}
        <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -start-20 size-80 rounded-full bg-brand-500/15 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-brand-400/25 bg-gradient-to-br from-brand-500/25 to-electric-500/10 text-brand-300">
                <Megaphone className="size-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium tracking-wider text-brand-300/80 uppercase">{t.common.nextStep}</p>
                <p className="mt-1 text-lg font-semibold text-white">{t.common.marketingPlan}</p>
                <p className="mt-1 text-sm text-mist/55">{t.suppliers.continueDescription}</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Link
                href={journey.marketing}
                className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-brand-500 rtl:bg-gradient-to-l px-5 text-sm font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_40px_-6px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                {t.suppliers.continueTo}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        <Link
          href={journey.plan}
          className="inline-flex items-center gap-1.5 text-sm text-mist/55 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5 rtl:-scale-x-100" />
          {t.common.backToBusinessPlan}
        </Link>
      </Container>

      {rfqSupplier && (
        <RfqDrawer
          key={rfqSupplier.id}
          supplier={rfqSupplier}
          category={categories.find((c) => c.id === rfqSupplier.category) ?? categories[0]}
          brief={brief}
          contactNote={data.contactNote}
          status={rfqStatus[rfqSupplier.id]}
          onDrafted={markDrafted}
          onMarkSent={() => setRfqStatus((s) => ({ ...s, [rfqSupplier.id]: "sent" }))}
          onClose={closeRfq}
        />
      )}
    </>
  );
}
