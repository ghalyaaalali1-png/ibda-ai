import type { MarketingPlan } from "@/features/marketing/types";
import type { OfficialSource } from "@/features/plan/officialSources";
import type { BusinessPlan, SetupRequirement } from "@/features/plan/types";
import type { SupplierScreenData } from "@/features/suppliers/types";

/** Which earlier step an item comes from, shown next to it. */
export type PackSource = "Assessment" | "Plan" | "Suppliers" | "Requirements" | "Marketing";

export type ReadinessStatus = "ready" | "conditions" | "needs-work";

export type Readiness = {
  status: ReadinessStatus;
  label: string;
  /** Every rule that fired, so the status is explained rather than asserted. */
  reasons: string[];
};

/** Assessment details the pack uses that aren't part of the business plan. */
export type PackExtras = {
  ideaSummary: string;
  positioning: string;
  outputStatus: "COMPLETE" | "PARTIAL";
  assumptions: { text: string; label: "Your figure" | "Estimate" | "To confirm" }[];
  questions: { question: string; why: string }[];
};

/** The four outputs a launch pack is built from. */
export type PackInputs = {
  plan: BusinessPlan;
  suppliers: SupplierScreenData;
  marketing: MarketingPlan;
  extras: PackExtras;
};

export type ChecklistItem = {
  text: string;
  from: PackSource;
  detail?: string;
  link?: OfficialSource;
  viaPortal?: boolean;
};

export type OutstandingItem = {
  kind: "Question for you" | "Assumption" | "To verify";
  text: string;
  from: PackSource;
  why?: string;
  link?: OfficialSource;
  viaPortal?: boolean;
};

export type ShortlistRow = {
  category: string;
  supplier: string;
  location: string;
  estimate: number;
  basis: string;
  moq: string;
  leadTime: string;
};

export type LaunchPack = {
  inputs: PackInputs;
  readiness: Readiness;
  shortlist: { rows: ShortlistRow[]; total: number };
  requirements: SetupRequirement[];
  marketingWeeks: { week: number; title: string; goal: string; posts: number; platforms: string[]; planWeek?: number }[];
  checklist: { before: ChecklistItem[]; launch: ChecklistItem[]; after: ChecklistItem[] };
  outstanding: OutstandingItem[];
};
