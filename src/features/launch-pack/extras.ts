import type { InitialAssessment } from "@/features/assessment/schema";
import { demoMarketing } from "@/features/marketing/demoMarketing";
import type { PackExtras } from "./types";

const labelFor = {
  USER_PROVIDED: "Your figure",
  ESTIMATE: "Estimate",
  NOT_YET_CONFIRMED: "To confirm",
} as const;

/** Pack details taken from Claude's assessment of a live business. */
export function extrasFromAssessment(a: InitialAssessment): PackExtras {
  return {
    ideaSummary: a.ideaSummary.summary,
    positioning: a.positioning.statement,
    outputStatus: a.outputStatus,
    assumptions: a.keyAssumptions.map((k) => ({ text: k.assumption, label: labelFor[k.type] })),
    questions: a.missingInformation.map((m) => ({ question: m.question, why: m.whyItMatters })),
  };
}

/** The abaya demo's equivalents, consistent with its plan, suppliers and marketing. */
export const demoExtras: PackExtras = {
  ideaSummary:
    "A premium online abaya brand in Dubai: six designs in premium crepe, tailored in small runs in the UAE and sold online at AED 690–850, on a AED 30,000 budget.",
  positioning: demoMarketing.strategy.positioning,
  outputStatus: "PARTIAL",
  assumptions: [
    { text: "Total startup budget of AED 30,000", label: "Your figure" },
    { text: "Fabric and tailoring cost about AED 260 per abaya", label: "Estimate" },
    { text: "Sales start at 12 pieces in month 1 and grow to 28 by month 6", label: "Estimate" },
    { text: "A free zone e-commerce licence suits an online-only launch", label: "To confirm" },
  ],
  questions: [
    { question: "What is your UAE residency status, and will you own the business alone?", why: "It decides which licence routes are open to you." },
    { question: "Do you already have a tailor you trust?", why: "An existing partner lowers sampling costs and quality risk." },
  ],
};
