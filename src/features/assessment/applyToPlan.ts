import type { ProfileField } from "@/features/launch-profile/profile";
import { english, type Dictionary } from "@/i18n";
import {
  emirateFrom,
  licensingSourcesFor,
  sourceById,
  sourcesFor,
  uaePortal,
  type OfficialSource,
} from "@/features/plan/officialSources";
import type { BusinessPlan, CashflowPoint, Decision } from "@/features/plan/types";
import type { InitialAssessment } from "./schema";

type Evidence = InitialAssessment["plan"]["budget"]["type"];

const verdictFor: Record<InitialAssessment["feasibility"]["status"], Decision> = {
  FEASIBLE: "GO",
  FEASIBLE_WITH_CHANGES: "CAUTION",
  CURRENTLY_NOT_FEASIBLE: "NO-GO",
};

const HORIZON_MONTHS = 6;
const roundTo = (n: number, step: number) => Math.round(n / step) * step;
const sum = (ns: number[]) => ns.reduce((total, n) => total + n, 0);

/** Startup costs that always add up to the budget: the reserve absorbs any gap. */
function fitCostsToBudget(budget: number, costs: InitialAssessment["plan"]["startupCosts"]) {
  const amounts = costs.map((c) => Math.max(0, Math.round(c.amountAed)));
  const total = sum(amounts);
  if (total <= budget) return { amounts, reserve: budget - total, scaled: false };
  // Over budget: scale costs to 90% of the budget and keep 10% in reserve.
  const factor = (budget * 0.9) / total;
  const scaledAmounts = amounts.map((a) => roundTo(a * factor, 100));
  return { amounts: scaledAmounts, reserve: budget - sum(scaledAmounts), scaled: true };
}

/**
 * The startup cost lines that buy stock, equipment, materials and packaging,
 * at the amounts the plan shows. The Suppliers screen measures its shortlist
 * against this total, and the supplier request is sized to it.
 */
export function sourcingBudget(p: Pick<InitialAssessment["plan"], "budget" | "startupCosts">) {
  const fitted = fitCostsToBudget(Math.max(0, Math.round(p.budget.amountAed)), p.startupCosts);
  const lines = p.startupCosts.flatMap((c, i) =>
    c.group === "sourcing" ? [{ label: c.label, note: c.note, amount: fitted.amounts[i] }] : [],
  );
  return { lines, total: sum(lines.map((l) => l.amount)) };
}

/** Cumulative cash from launch, starting at minus the startup spend. */
function cashflowFor(spend: number, sales: number[], contribution: number, running: number) {
  const points: CashflowPoint[] = [{ month: 0, sales: 0, cumulative: -spend }];
  sales.forEach((units, i) => {
    const previous = points[i].cumulative;
    points.push({ month: i + 1, sales: units, cumulative: Math.round(previous + units * contribution - running) });
  });
  return points;
}

/**
 * Requirements & licences for this business and emirate. Claude's source ids
 * are resolved against the verified list; anything unknown or from another
 * emirate is dropped, and the emirate's licensing authority is always added.
 */
function buildSetup(a: InitialAssessment, profile: ProfileField[], t: Dictionary): BusinessPlan["setup"] {
  const location = profile.find((f) => f.id === "location")?.value;
  const emirate = emirateFrom(location);
  const allowed = new Set(sourcesFor(emirate).map((x) => x.id));
  const resolve = (id: string) => (allowed.has(id.trim()) ? sourceById(id) : undefined);
  // Never guess an authority: without a verified one, point to the federal UAE portal instead.
  const authorityOrPortal = (id: string) => {
    const authority = resolve(id);
    return authority ? { authority, viaPortal: false } : { authority: uaePortal, viaPortal: true };
  };

  const path = a.setup.path.slice(0, 6).map((step) => ({
    stage: step.stage,
    title: step.title,
    detail: step.detail,
    ...authorityOrPortal(step.sourceId),
  }));
  const requirements = a.setup.requirements.slice(0, 9).map((r) => ({
    item: r.item,
    level: r.level,
    why: r.why,
    ...authorityOrPortal(r.sourceId),
  }));
  const options = a.setup.routes.slice(0, 3).map((o) => ({
    name: o.name,
    fit: o.fit,
    cost: t.plan.built.feeToConfirm,
    recommended: o.recommended,
    authority: resolve(o.sourceId),
  }));

  // Every source referenced anywhere, plus the emirate's licensing authority and the essentials.
  const sources: OfficialSource[] = [];
  const add = (x?: OfficialSource) => x && !sources.some((s) => s.id === x.id) && sources.push(x);
  licensingSourcesFor(emirate).forEach(add);
  a.setup.sourceIds.forEach((id) => add(resolve(id)));
  [...path, ...requirements, ...options].forEach((x) => add(x.authority));
  add(sourceById("fta"));
  add(sourceById("uae-portal"));

  return {
    summary: a.setup.summary,
    activity: a.setup.activity,
    emirate: emirate ?? location ?? "the UAE",
    options,
    path,
    requirements,
    sources: sources.slice(0, 8),
  };
}

/**
 * Builds the dashboard plan for any business from Claude's assessment and
 * the founder's answers. Claude supplies estimated inputs; every total,
 * margin and break-even figure is calculated here. `t` words the text added
 * around Claude's output (English by default).
 */
export function buildPlan(
  base: BusinessPlan,
  a: InitialAssessment,
  profile: ProfileField[],
  t: Dictionary = english,
): BusinessPlan {
  const p = a.plan;
  const built = t.plan.built;
  const evidenceTag: Record<Evidence, string> = built.evidence;

  const budget = Math.max(0, Math.round(p.budget.amountAed));
  const fitted = fitCostsToBudget(budget, p.startupCosts);
  const costs = p.startupCosts.map((c, i) => ({
    id: `cost-${i}`,
    label: c.label,
    amount: fitted.amounts[i],
    note: `${c.note} · ${evidenceTag[c.type]}`,
    group: c.group,
  }));
  const spend = sum(costs.map((c) => c.amount));
  const budgetBasis = [
    `${p.budget.basis} (${evidenceTag[p.budget.type].toLowerCase()})`,
    fitted.scaled ? built.scaled : null,
  ]
    .filter(Boolean)
    .join(". ");

  const price = Math.round(p.pricing.heroAed);
  const unitCosts = p.unitCosts.map((c) => ({ label: c.label, amount: Math.round(c.amountAed), kind: c.kind }));
  const contribution = price - sum(unitCosts.map((c) => c.amount));
  const running = Math.max(0, Math.round(p.monthlyRunningCostsAed));

  // Exactly six months of sales; pad with the last value if Claude returned fewer.
  const sales = Array.from({ length: HORIZON_MONTHS }, (_, i) =>
    Math.max(0, Math.round(p.monthlySales[i] ?? p.monthlySales.at(-1) ?? 0)),
  );
  const cashflow = cashflowFor(spend, sales, contribution, running);
  const breakEvenPoint = cashflow.find((pt) => pt.month > 0 && pt.cumulative >= 0);
  const breakEvenMonth = breakEvenPoint?.month ?? null;
  const salesUntil = breakEvenMonth ?? HORIZON_MONTHS;

  // The verdict and the numbers come from parallel requests; flag (don't hide) any disagreement.
  const verdict = verdictFor[a.feasibility.status];
  const consistencyNotes =
    verdict === "NO-GO"
      ? []
      : contribution <= 0
        ? [built.priceBelowCost]
        : breakEvenMonth === null
          ? [built.noBreakEven(HORIZON_MONTHS)]
          : [];
  const conditions = [
    ...a.feasibility.conditions.slice(0, 3 - consistencyNotes.length),
    ...consistencyNotes,
  ];

  return {
    ...base,
    profile,
    unit: p.unit,
    decision: {
      verdict,
      score: Math.min(100, Math.max(0, Math.round(a.feasibility.viabilityScore))),
      headline: a.feasibility.headline,
      explanation: a.feasibility.reasoning,
      conditions,
    },
    budget: { total: budget, reserve: fitted.reserve, basis: budgetBasis },
    costs,
    pricing: {
      min: Math.round(p.pricing.minAed),
      max: Math.round(p.pricing.maxAed),
      hero: price,
      rationale: a.positioning.statement,
    },
    unitEconomics: { price, costs: unitCosts },
    breakEven: {
      month: breakEvenMonth,
      totalSales: sum(sales.slice(0, salesUntil)),
      monthlyRunningCosts: running,
      salesToCoverRunningCosts: contribution > 0 ? Math.ceil(running / contribution) : null,
      cashflow,
    },
    market: {
      summary: p.market.summary,
      signals: p.market.signals.slice(0, 3),
      targetCustomer: a.targetCustomer.description,
      priceBands: p.priceBands.slice(0, 4).map((b) => ({
        label: b.label,
        min: Math.round(b.minAed),
        max: Math.round(b.maxAed),
      })),
      priceBandsNote: built.priceBandsNote,
    },
    risks: p.risks.slice(0, 4),
    nextActions: p.nextActions.slice(0, 6),
    nextActionsLabel: p.launchPathLabel,
    setup: buildSetup(a, profile, t),
    upcoming: base.upcoming.map((section) => {
      if (section.id === "suppliers") {
        return { ...section, description: p.suppliers.description, includes: p.suppliers.categories.slice(0, 5) };
      }
      if (section.id === "marketing") {
        return { ...section, description: p.marketing.description, includes: p.marketing.focusAreas.slice(0, 5) };
      }
      return section;
    }),
  };
}
