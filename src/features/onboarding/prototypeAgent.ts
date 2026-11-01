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

const ONLINE = /\b(online|instagram|tiktok|whats\s?app|website|web\s?shop|e-?commerce|social media|delivery apps?)\b/i;
// "online store" and similar are online channels, not premises.
const ONLINE_STORE = /\b(online|web|e-?)\s*(store|shop)\b/gi;
const PHYSICAL = /\b(shop|store|storefront|outlet|caf[eé]|restaurant|salon|showroom|kiosk|branch|premises|walk-in|physical location)\b/i;

/** The sales channel, when the idea already says it — so onboarding doesn't ask again. */
function findChannel(idea: string) {
  const online = ONLINE.test(idea);
  const physical = PHYSICAL.test(idea.replace(ONLINE_STORE, ""));
  if (online && physical) return "Both";
  if (online) return "Online only";
  if (physical) return "Physical location";
  return undefined;
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
    // The abaya scenario asks its own questions; for other ideas, a stated channel isn't asked again.
    const channel = isAbaya ? undefined : findChannel(idea);

    const facts: KnownFact[] = [
      { id: "business", label: "Business", value: findBusiness(idea) },
    ];
    if (location) facts.push({ id: "location", label: "Location", value: location });
    if (budget) facts.push({ id: "budget", label: "Budget", value: budget });
    if (channel) facts.push({ id: "channel", label: "Sales channel", value: channel });

    const known = [
      "business type",
      ...(location ? ["location"] : []),
      ...(budget ? ["budget"] : []),
      ...(channel ? ["sales channel"] : []),
    ];

    const questions = [
      ...(location ? [] : [locationQuestion]),
      ...(budget ? [] : [budgetQuestion]),
      ...(isAbaya ? abayaQuestions : generalQuestions.filter((q) => !(channel && q.id === "channel"))),
    ];
    const analysis: IdeaAnalysis = {
      facts,
      acknowledgement: `Great — I already have your ${joinNatural(known)}. I just need ${
        questions.length === 1 ? "one more detail" : "a few more details"
      } before I start.`,
      questions,
    };
    return analysis;
  },
};
