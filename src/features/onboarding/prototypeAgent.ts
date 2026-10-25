import {
  abayaQuestions,
  budgetQuestion,
  generalQuestions,
  locationQuestion,
} from "./questions";
import type { IdeaAnalysis, KnownFact, OnboardingAgent } from "./types";

const THINKING_MS = 1100;

const EMIRATES: Array<[RegExp, string]> = [
  [/\bdubai\b/i, "Dubai"],
  [/\babu\s*dhabi\b/i, "Abu Dhabi"],
  [/\bsharjah\b/i, "Sharjah"],
  [/\bajman\b/i, "Ajman"],
  [/\b(ras\s*al\s*khaimah|rak)\b/i, "Ras Al Khaimah"],
  [/\bfujairah\b/i, "Fujairah"],
  [/\bumm\s*al\s*quwain\b/i, "Umm Al Quwain"],
];

function findEmirate(idea: string) {
  return EMIRATES.find(([pattern]) => pattern.test(idea))?.[1];
}

function findBudget(idea: string) {
  const match =
    idea.match(/(?:aed|dhs?|dirhams?)\s*([\d,.]+)\s*(k\b)?/i) ??
    idea.match(/([\d,.]+)\s*(k\b)?\s*(?:aed|dhs?|dirhams?)/i);
  if (!match) return undefined;
  const amount =
    Number(match[1].replace(/,/g, "")) * (match[2] ? 1000 : 1);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  return `AED ${amount.toLocaleString("en-US")}`;
}

function findBusiness(idea: string) {
  if (/\babayas?\b/i.test(idea)) {
    return /\bonline\b/i.test(idea) ? "Online abaya brand" : "Abaya brand";
  }
  const phrase = idea
    .match(
      /\b(?:launch|start|open|build|create|run)\s+(?:an?\s+|my\s+own\s+|my\s+)?(.+?)(?=\s+(?:in|with|for|using)\b|[.,!?]|$)/i,
    )?.[1]
    ?.trim();
  const text = phrase || idea.trim();
  const short = text.length > 48 ? `${text.slice(0, 45).trimEnd()}…` : text;
  return short.charAt(0).toUpperCase() + short.slice(1);
}

function joinNatural(parts: string[]) {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

/** Local, rule-based stand-in for the real Ibda agent. */
export const prototypeAgent: OnboardingAgent = {
  async analyzeIdea(idea) {
    await new Promise((resolve) => setTimeout(resolve, THINKING_MS));

    const isAbaya = /\babayas?\b/i.test(idea);
    const location = findEmirate(idea);
    const budget = findBudget(idea);

    const facts: KnownFact[] = [
      { id: "business", label: "Business", value: findBusiness(idea) },
    ];
    if (location) facts.push({ id: "location", label: "Location", value: location });
    if (budget) facts.push({ id: "budget", label: "Budget", value: budget });

    const known = [
      "business type",
      ...(location ? ["location"] : []),
      ...(budget ? ["budget"] : []),
    ];
    const missingBasics = !location || !budget;

    const analysis: IdeaAnalysis = {
      facts,
      acknowledgement: `Great — I already have your ${joinNatural(known)}. I just need ${
        missingBasics ? "a few more details" : "a few details"
      } before I start.`,
      questions: [
        ...(location ? [] : [locationQuestion]),
        ...(budget ? [] : [budgetQuestion]),
        ...(isAbaya ? abayaQuestions : generalQuestions),
      ],
    };
    return analysis;
  },
};
