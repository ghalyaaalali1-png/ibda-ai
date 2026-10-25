export type PhaseId = "prelaunch" | "launch" | "growth";

export type ActionTag = "Content" | "Creators" | "Ads" | "Community" | "Setup" | "Review";

export type WeekPlan = {
  week: number;
  focus: string;
  actions: { text: string; tag: ActionTag }[];
};

export type Phase = {
  id: PhaseId;
  label: string;
  weeks: string;
  goal: string;
  plan: WeekPlan[];
};

export type ContentPillar = {
  id: string;
  title: string;
  format: string;
  cadence: string;
  phase: string;
  idea: string;
};

export type Channel = {
  name: string;
  role: string;
  priority: "Primary" | "Support";
};

export type BudgetLine = { label: string; amount: number; note: string };

export type BudgetSource = {
  /** The business plan cost line this money comes from. */
  planLine: string;
  total: number;
  lines: BudgetLine[];
};

export type Kpi = {
  label: string;
  target: string;
  when: string;
  signal: string;
};

export type MarketingPlan = {
  strategy: {
    objective: string;
    targetCustomer: string;
    positioning: string;
    valueProposition: string;
    channels: Channel[];
  };
  phases: Phase[];
  contentPillars: ContentPillar[];
  postingRhythm: string;
  budget: BudgetSource[];
  kpis: Kpi[];
  nextMove: {
    title: string;
    why: string;
    steps: string[];
  };
};
