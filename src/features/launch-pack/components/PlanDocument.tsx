"use client";

import { ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { KhittaMark } from "@/components/ui/KhittaMark";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { useAssessmentView } from "@/features/assessment/storage";
import { profileValue } from "@/features/launch-profile/profile";
import { sourceText } from "@/features/plan/officialSources";
import { useJourneyRoutes } from "@/features/projects/ProjectProvider";
import { displayProfileLine, displayValue } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import { packFor } from "../packFor";

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);

function Section({ title, children, newPage = false }: { title: string; children: React.ReactNode; newPage?: boolean }) {
  return (
    <section className={newPage ? "mt-10 print:mt-0 print:break-before-page" : "mt-10"}>
      <h2 className="border-b-2 border-[#7048f5] pb-1.5 text-xl font-semibold text-[#0e1333]">{title}</h2>
      <div className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-neutral-800">{children}</div>
    </section>
  );
}

function Table({ head, rows, foot }: { head: string[]; rows: React.ReactNode[][]; foot?: React.ReactNode[] }) {
  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr className="bg-[#f1effc] text-start text-[#2a2160]">
          {head.map((h, i) => (
            <th key={i} className="border border-neutral-200 px-2.5 py-1.5 text-start font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r} className="break-inside-avoid">
            {row.map((cell, c) => (
              <td key={c} className="border border-neutral-200 px-2.5 py-1.5 align-top">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {foot && (
        <tfoot>
          <tr className="font-semibold">
            {foot.map((cell, c) => (
              <td key={c} className="border border-neutral-200 px-2.5 py-1.5">
                {cell}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  );
}

/**
 * The full plan as one printable document: cover, summary, numbers, market,
 * risks, next steps, licences, suppliers, marketing and the launch checklist.
 * It opens the print window by itself; choosing "Save as PDF" there saves it.
 * The browser draws it, so Arabic shapes and reads right to left correctly.
 */
export function PlanDocument() {
  const { t, locale } = useI18n();
  const view = useAssessmentView();
  const journey = useJourneyRoutes();
  const assessment = view.kind === "live" ? view.assessment : null;
  const profile = view.kind === "live" ? view.profile : null;
  const pack = useMemo(() => packFor(assessment, profile, t), [assessment, profile, t]);
  const ready = view.kind === "live" || view.kind === "demo";
  const printed = useRef(false);

  const { plan, suppliers, marketing } = pack.inputs;
  const business = displayValue(t, profileValue(plan.profile, "business") ?? "");
  const p = t.pdf;

  // Name the file after the business, then open the print window once the document is ready
  // (not with ?preview, which only shows the document).
  useEffect(() => {
    if (!ready || printed.current) return;
    printed.current = true;
    document.title = `${business || t.common.brand} — ${p.docTitle}`;
    if (new URLSearchParams(window.location.search).has("preview")) return;
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, [ready, business, p.docTitle, t.common.brand]);

  if (view.kind === "checking" || view.kind === "translating") {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center gap-3 text-sm text-mist/60">
        <Loader2 aria-hidden className="size-5 animate-spin text-brand-300" />
        {view.kind === "translating" ? t.status.translating(t.common.businessPlan) : t.status.loading(t.common.businessPlan)}
      </div>
    );
  }
  if (!ready) {
    return view.kind === "translationFailed" ? (
      <AnalysisStatus state={view.kind} screen="plan" message={view.message} onRetry={view.retry} />
    ) : (
      <AnalysisStatus state={view.kind} screen="plan" />
    );
  }

  const productCost = sum(plan.unitEconomics.costs.filter((c) => c.kind === "product").map((c) => c.amount));
  const contribution = plan.unitEconomics.price - sum(plan.unitEconomics.costs.map((c) => c.amount));
  const margin = plan.unitEconomics.price > 0 ? Math.round(((plan.unitEconomics.price - productCost) / plan.unitEconomics.price) * 100) : 0;
  const date = new Date().toLocaleDateString(locale === "ar" ? "ar-AE-u-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const unit = plan.unit?.singular ?? "";

  return (
    <div className="min-h-dvh bg-[#e9ebf3] py-8 print:bg-white print:py-0">
      {/* Toolbar: on screen only. */}
      <div data-print="hide" className="mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 print:hidden">
        <Link href={journey.plan} className="inline-flex items-center gap-1.5 text-sm text-[#2a2160] hover:underline">
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          {p.back}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600">{p.toolbarHint}</span>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#7048f5] px-5 text-sm font-medium text-white hover:bg-[#5f3be0]"
          >
            <Download aria-hidden className="size-4" />
            {p.save}
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white px-[14mm] py-[16mm] text-neutral-900 shadow-xl print:max-w-none print:p-0 print:shadow-none">
        {/* Cover */}
        <header className="flex flex-col items-start gap-6 border-b border-neutral-200 pb-10 print:border-0 print:pt-[55mm]">
          <div className="flex items-center gap-3">
            <KhittaMark className="size-14" />
            <div dir="ltr">
              <p className="text-2xl font-semibold tracking-[0.06em] text-[#0e1333]">
                KHITTA <span className="mx-1 text-neutral-300">|</span>
                <span lang="ar" className="font-arabic">خِطّة</span>
              </p>
            </div>
          </div>
          <p className="-mt-3 text-[11px] tracking-[0.2em] text-neutral-500 uppercase rtl:tracking-normal">{p.tagline}</p>
          <div>
            <p className="text-sm font-medium text-[#7048f5]">{p.docTitle}</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight text-[#0e1333]">{business}</h1>
            <p className="mt-2 text-base text-neutral-600">{displayProfileLine(t, plan.profile)}</p>
          </div>
          <p className="text-sm text-neutral-500">
            {p.preparedOn(date)} · {p.estimatesNote}
          </p>
        </header>

        <Section title={p.sections.summary} newPage>
          <p className="text-lg font-semibold text-[#0e1333]">
            {t.plan.decision.verdicts[plan.decision.verdict]} · {plan.decision.score}/100 — {plan.decision.headline}
          </p>
          <p>{plan.decision.explanation}</p>
          {plan.decision.conditions.length > 0 && (
            <ul className="list-disc space-y-1 ps-5">
              {plan.decision.conditions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
          <p className="pt-2 font-semibold">
            {t.launchPack.readiness.caption}: {pack.readiness.label}
          </p>
          <ul className="list-disc space-y-1 ps-5">
            {pack.readiness.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Section>

        <Section title={p.sections.numbers}>
          <Table
            head={[p.columns.item, p.columns.amount]}
            rows={[
              [t.plan.tiles.budget, t.fmt.aed(plan.budget.total)],
              [t.plan.tiles.price, `${t.fmt.aedRange(plan.pricing.min, plan.pricing.max)} · ${t.plan.tiles.heroPrice(t.fmt.aed(plan.pricing.hero), unit)}`],
              [t.plan.tiles.margin, `${margin}%`],
              [p.contribution, t.fmt.aed(contribution)],
              [t.plan.breakEven.runningCosts, t.fmt.aed(plan.breakEven.monthlyRunningCosts)],
              [t.plan.tiles.breakEven, plan.breakEven.month === null ? t.plan.beyondMonth(6) : t.plan.month(plan.breakEven.month)],
            ]}
          />
        </Section>

        <Section title={p.sections.costs}>
          {plan.budget.basis && <p className="text-neutral-600">{plan.budget.basis}</p>}
          <Table
            head={[t.plan.costs.category, p.columns.amount]}
            rows={[
              ...plan.costs.map((c) => [
                <span key="l">
                  <span className="font-medium">{c.label}</span>
                  <span className="block text-[12px] text-neutral-500">{c.note}</span>
                </span>,
                t.fmt.aed(c.amount),
              ]),
              [t.plan.costs.reserve, t.fmt.aed(plan.budget.reserve)],
            ]}
            foot={[p.total, t.fmt.aed(plan.budget.total)]}
          />
        </Section>

        <Section title={p.sections.unit}>
          <Table
            head={[p.columns.item, p.columns.amount]}
            rows={[
              [t.plan.unit.sellingPrice, t.fmt.aed(plan.unitEconomics.price)],
              ...plan.unitEconomics.costs.map((c) => [c.label, `− ${t.fmt.aed(c.amount)}`]),
            ]}
            foot={[t.plan.unit.contribution, t.fmt.aed(contribution)]}
          />
        </Section>

        <Section title={p.sections.breakEven}>
          <Table
            head={[p.columns.month, p.columns.sales, p.columns.cash]}
            rows={plan.breakEven.cashflow.map((pt) => [
              pt.month === 0 ? t.plan.breakEven.launch : t.plan.month(pt.month),
              t.fmt.number(pt.sales),
              t.fmt.aed(pt.cumulative),
            ])}
          />
        </Section>

        <Section title={p.sections.market} newPage>
          <p>{plan.market.summary}</p>
          <ul className="space-y-1.5">
            {plan.market.signals.map((s, i) => (
              <li key={i}>
                <span className="font-semibold">{s.label}: {s.value}</span> — {s.detail}
              </li>
            ))}
          </ul>
          <p>
            <span className="font-semibold">{t.common.targetCustomer}: </span>
            {plan.market.targetCustomer}
          </p>
          <Table
            head={[t.plan.market.bands(unit), p.columns.amount]}
            rows={plan.market.priceBands.map((b) => [b.label, t.fmt.aedRange(b.min, b.max)])}
          />
        </Section>

        <Section title={p.sections.risks}>
          {plan.risks.map((r, i) => (
            <div key={i} className="break-inside-avoid">
              <p className="font-semibold">
                {r.title} <span className="font-normal text-neutral-500">· {t.plan.risks.severity[r.severity]}</span>
              </p>
              <p>{r.detail}</p>
              <p className="text-neutral-600">
                <span className="font-medium">{p.mitigation}</span>
                {r.mitigation}
              </p>
            </div>
          ))}
        </Section>

        <Section title={p.sections.nextActions}>
          <ol className="list-decimal space-y-2 ps-5">
            {plan.nextActions.map((a, i) => (
              <li key={i} className="break-inside-avoid">
                <span className="font-semibold">{a.title}</span> <span className="text-neutral-500">· {a.timing}</span>
                <span className="block">{a.detail}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title={p.sections.setup} newPage>
          <p>
            <span className="font-semibold">{t.plan.setup.activity}</span>
            {plan.setup.activity}
          </p>
          <p>{plan.setup.summary}</p>
          <Table
            head={[t.plan.setup.routes, t.plan.setup.suggested]}
            rows={plan.setup.options.map((o) => [
              <span key="n">
                <span className="font-medium">{o.name}</span>
                <span className="block text-[12px] text-neutral-500">{o.fit} · {o.cost}</span>
              </span>,
              o.recommended ? "✓" : "",
            ])}
          />
          <ol className="list-decimal space-y-1.5 ps-5">
            {plan.setup.path.map((s, i) => (
              <li key={i} className="break-inside-avoid">
                <span className="font-semibold">{t.plan.setup.stages[s.stage]}: {s.title}</span>
                <span className="block">{s.detail}</span>
              </li>
            ))}
          </ol>
          <Table
            head={[p.columns.item, p.columns.level]}
            rows={plan.setup.requirements.map((r) => [
              <span key="i">
                <span className="font-medium">{r.item}</span>
                <span className="block text-[12px] text-neutral-500">{r.why}</span>
              </span>,
              t.plan.setup.levels[r.level],
            ])}
          />
          <p className="text-[12px] text-neutral-500">{t.plan.setup.disclaimer}</p>
        </Section>

        <Section title={p.sections.suppliers}>
          <Table
            head={[t.launchPack.suppliers.category, t.launchPack.suppliers.supplier, t.launchPack.suppliers.minimum, t.launchPack.suppliers.leadTime, t.launchPack.suppliers.firstOrder]}
            rows={pack.shortlist.rows.map((r) => [
              r.category,
              <span key="s">
                {r.supplier}
                <span className="block text-[12px] text-neutral-500">{r.location}</span>
              </span>,
              r.moq,
              r.leadTime,
              <span key="e">
                {t.fmt.aed(r.estimate)}
                <span className="block text-[12px] text-neutral-500">{r.basis}</span>
              </span>,
            ])}
            foot={["", "", "", p.total, t.fmt.aed(pack.shortlist.total)]}
          />
          <p className="text-[12px] text-neutral-500">{suppliers.sourceNote}</p>
        </Section>

        <Section title={p.sections.marketing} newPage>
          <p>
            <span className="font-semibold">{t.marketing.strategy.objective}: </span>
            {marketing.strategy.objective}
          </p>
          <p>
            <span className="font-semibold">{t.marketing.strategy.positioning}: </span>
            {marketing.strategy.positioning}
          </p>
          <p>
            <span className="font-semibold">{t.marketing.strategy.channels}: </span>
            {marketing.strategy.channels.map((c) => `${c.name} (${t.marketing.strategy.priority[c.priority]})`).join(" · ")}
          </p>
          {marketing.phases.map((phase) => (
            <div key={phase.id} className="break-inside-avoid">
              <p className="font-semibold">
                {t.marketing.calendar.phases[phase.id]}
                {phase.plan.length > 0 && ` · ${t.marketing.calendar.weeks(phase.plan[0].week, phase.plan.at(-1)!.week)}`}
              </p>
              <p className="text-neutral-600">{phase.goal}</p>
              <ul className="list-disc space-y-0.5 ps-5">
                {phase.plan.flatMap((w) => w.actions.map((a, i) => <li key={`${w.week}-${i}`}>{a.text}</li>))}
              </ul>
            </div>
          ))}
          <h3 className="pt-2 font-semibold text-[#0e1333]">{p.sections.kpis}</h3>
          <Table
            head={[p.columns.item, p.columns.target, p.columns.when]}
            rows={marketing.kpis.map((k) => [k.label, k.target, k.when])}
          />
          <h3 className="pt-2 font-semibold text-[#0e1333]">{t.marketing.budget.title}</h3>
          <Table
            head={[p.columns.item, p.columns.amount]}
            rows={marketing.budget.flatMap((b) => b.lines.map((l) => [l.label, t.fmt.aed(l.amount)]))}
            foot={[p.total, t.fmt.aed(sum(marketing.budget.map((b) => b.total)))]}
          />
          <h3 className="pt-2 font-semibold text-[#0e1333]">{p.sections.calendar}</h3>
          <Table
            head={[p.columns.week, p.columns.item]}
            rows={marketing.launchMonth.posts.map((post) => [
              t.common.week(post.week),
              <span key="t">
                {post.day} · {post.platform} · {post.contentType}
                <span className="block">{post.topic}</span>
              </span>,
            ])}
          />
        </Section>

        <Section title={p.sections.checklist} newPage>
          {(["before", "launch", "after"] as const).map((key) => (
            <div key={key} className="break-inside-avoid">
              <p className="font-semibold">{t.launchPack.checklist[key]}</p>
              <ul className="space-y-1">
                {pack.checklist[key].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-1 inline-block size-3 shrink-0 rounded-sm border border-neutral-400" />
                    <span>
                      {item.text}
                      {item.detail && <span className="text-neutral-500"> · {item.detail}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        <Section title={p.sections.outstanding}>
          <ul className="space-y-2">
            {pack.outstanding.map((o, i) => (
              <li key={i} className="break-inside-avoid">
                <span className="font-semibold">{t.launchPack.outstanding.kinds[o.kind] ?? o.kind}: </span>
                {o.text}
                {o.why && <span className="block text-neutral-600">{o.why}</span>}
              </li>
            ))}
          </ul>
        </Section>

        {plan.setup.sources.length > 0 && (
          <Section title={p.sections.sources}>
            <ul className="space-y-1 text-[12.5px]">
              {plan.setup.sources.map((s) => (
                <li key={s.id}>
                  {sourceText(s, locale).name} — <span dir="ltr">{s.url}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <p className="mt-10 border-t border-neutral-200 pt-4 text-[11.5px] leading-relaxed text-neutral-500">{t.launchPack.disclaimer}</p>
      </article>
    </div>
  );
}
