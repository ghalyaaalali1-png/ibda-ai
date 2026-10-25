import type { ProfileField } from "@/features/launch-profile/profile";

export type Decision = "GO" | "CAUTION" | "NO-GO";
export type Severity = "High" | "Medium" | "Low";

export type CostItem = {
  id: string;
  label: string;
  amount: number;
  note: string;
};

export type UnitCostItem = { label: string; amount: number };

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
};

/** Everything the dashboard renders. A real agent/API would return this shape. */
export type BusinessPlan = {
  profile: ProfileField[];
  decision: {
    verdict: Decision;
    score: number;
    headline: string;
    explanation: string;
    conditions: string[];
  };
  budget: { total: number; reserve: number };
  costs: CostItem[];
  pricing: { min: number; max: number; hero: number; rationale: string };
  unitEconomics: { price: number; costs: UnitCostItem[] };
  breakEven: {
    month: number;
    totalSales: number;
    monthlyRunningCosts: number;
    salesToCoverRunningCosts: number;
    cashflow: CashflowPoint[];
  };
  market: {
    summary: string;
    signals: { label: string; value: string; detail: string }[];
    targetCustomer: string;
    priceBands: PriceBand[];
  };
  risks: Risk[];
  nextActions: NextAction[];
  setup: {
    summary: string;
    options: SetupOption[];
    requirements: string[];
  };
  upcoming: UpcomingSection[];
};
