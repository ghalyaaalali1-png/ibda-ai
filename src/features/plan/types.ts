import type { ProfileField } from "@/features/launch-profile/profile";

export type Decision = "GO" | "CAUTION" | "NO-GO";
export type Severity = "High" | "Medium" | "Low";

export type CostItem = {
  id: string;
  label: string;
  amount: number;
  note: string;
};

export type UnitCostItem = {
  label: string;
  amount: number;
  /** "product" costs count toward gross margin; "selling" costs (payment, delivery) don't. */
  kind: "product" | "selling";
};

export type CashflowPoint = {
  month: number;
  /** Sales in that month (0 for the launch month). */
  sales: number;
  /** Cumulative cash position vs. startup spend, in AED. */
  cumulative: number;
};

export type PriceBand = { label: string; min: number; max: number };

export type Risk = {
  title: string;
  severity: Severity;
  detail: string;
  mitigation: string;
};

export type NextAction = { title: string; detail: string; timing: string };

export type SetupOption = {
  name: string;
  cost: string;
  fit: string;
  recommended?: boolean;
};

export type UpcomingSection = {
  id: string;
  title: string;
  description: string;
  includes: string[];
  /** Set once the section's screen exists. */
  href?: string;
};

/** Everything the dashboard renders. A real agent/API would return this shape. */
export type BusinessPlan = {
  profile: ProfileField[];
  /** What one sale is, e.g. { singular: "abaya", plural: "abayas" }. */
  unit: { singular: string; plural: string };
  decision: {
    verdict: Decision;
    score: number;
    headline: string;
    explanation: string;
    conditions: string[];
  };
  budget: {
    total: number;
    reserve: number;
    /** Where the total came from when it isn't the founder's exact figure. */
    basis?: string;
  };
  costs: CostItem[];
  pricing: { min: number; max: number; hero: number; rationale: string };
  unitEconomics: { price: number; costs: UnitCostItem[] };
  breakEven: {
    /** null when the cash position doesn't turn positive within the cashflow horizon. */
    month: number | null;
    totalSales: number;
    monthlyRunningCosts: number;
    /** null when each sale loses money, so no volume covers running costs. */
    salesToCoverRunningCosts: number | null;
    cashflow: CashflowPoint[];
  };
  market: {
    summary: string;
    signals: { label: string; value: string; detail: string }[];
    targetCustomer: string;
    priceBands: PriceBand[];
    /** Caption beside the price-band chart, e.g. "Demo estimates". */
    priceBandsNote: string;
  };
  risks: Risk[];
  nextActions: NextAction[];
  /** Caption for the next-actions card, e.g. "8-week launch path". */
  nextActionsLabel: string;
  setup: {
    summary: string;
    options: SetupOption[];
    requirements: string[];
  };
  upcoming: UpcomingSection[];
};
