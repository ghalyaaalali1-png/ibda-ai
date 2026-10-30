import type { ProfileField } from "@/features/launch-profile/profile";
import type { BusinessPlan, CashflowPoint, Decision } from "@/features/plan/types";
import type { InitialAssessment } from "./schema";

type Evidence = InitialAssessment["plan"]["budget"]["type"];

const verdictFor: Record<InitialAssessment["feasibility"]["status"], Decision> = {
  FEASIBLE: "GO",
  FEASIBLE_WITH_CHANGES: "CAUTION",
  CURRENTLY_NOT_FEASIBLE: "NO-GO",
};

const evidenceTag: Record<Evidence, string> = {
  USER_PROVIDED: "Your figure",
  ESTIMATE: "Estimate",
  NOT_YET_CONFIRMED: "To confirm",
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
 * Builds the dashboard plan for any business from Claude's assessment and
 * the founder's answers. Claude supplies estimated inputs; every total,
 * margin and break-even figure is calculated here.
 */
export function buildPlan(base: BusinessPlan, a: InitialAssessment, profile: ProfileField[]): BusinessPlan {
  const p = a.plan;

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
    fitted.scaled ? "Cost estimates exceeded it and were scaled to fit" : null,
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
        ? ["Estimated price doesn't cover unit costs"]
        : breakEvenMonth === null
          ? [`No break-even within ${HORIZON_MONTHS} months (estimate)`]
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
      priceBandsNote: "Estimates — not yet researched",
    },
    risks: p.risks.slice(0, 4),
    nextActions: p.nextActions.slice(0, 6),
    nextActionsLabel: p.launchPathLabel,
    setup: {
      summary: p.setup.summary,
      options: p.setup.options.slice(0, 3).map((o) => ({
        name: o.name,
        fit: o.fit,
        cost: "Fee requires official confirmation",
        recommended: o.recommended,
      })),
      requirements: p.setup.requirements.slice(0, 6),
    },
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
