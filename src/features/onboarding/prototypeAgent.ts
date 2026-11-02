import {
  abayaQuestions,
  budgetQuestion,
  generalQuestions,
  locationQuestion,
} from "./questions";
import type { IdeaAnalysis, KnownFact, OnboardingAgent } from "./types";

const THINKING_MS = 1100;

// Ideas can be written in English or Arabic; what's found is stored in English either way.
// (\b only works with Latin letters, so the Arabic patterns match plain text.)

const EMIRATES: Array<[RegExp, string]> = [
  [/\bdubai\b|دبي/i, "Dubai"],
  [/\babu\s*dhabi\b|[أا]بو\s?ظبي/i, "Abu Dhabi"],
  [/\bsharjah\b|الشارقة|شارقة/i, "Sharjah"],
  [/\bajman\b|عجمان/i, "Ajman"],
  [/\b(ras\s*al\s*khaimah|rak)\b|ر[أا]س\s?الخيمة/i, "Ras Al Khaimah"],
  [/\bfujairah\b|الفجيرة|فجيرة/i, "Fujairah"],
  [/\bumm\s*al\s*quwain\b|[أا]م\s?القيوين/i, "Umm Al Quwain"],
];

function findEmirate(idea: string) {
  return EMIRATES.find(([pattern]) => pattern.test(idea))?.[1];
}

/** Arabic-Indic digits and separators as ASCII, so amounts parse the same way. */
const toAsciiDigits = (text: string) =>
  text
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٬/g, ",")
    .replace(/٫/g, ".");

const CURRENCY = "(?:aed|dhs?|dirhams?|درهم|دراهم|د\\.إ)";
const THOUSAND = "(k\\b|[أا]لف)?";

function findBudget(idea: string) {
  const text = toAsciiDigits(idea);
  const match =
    // The amount must start with a digit, so "AED." at the end of a sentence isn't read as one.
    text.match(new RegExp(`${CURRENCY}\\s*(\\d[\\d,.]*)\\s*${THOUSAND}`, "i")) ??
    text.match(new RegExp(`(\\d[\\d,.]*)\\s*${THOUSAND}\\s*${CURRENCY}`, "i"));
  if (!match) return undefined;
  const amount =
    Number(match[1].replace(/,/g, "")) * (match[2] ? 1000 : 1);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  return `AED ${amount.toLocaleString("en-US")}`;
}

const ONLINE =
  /\b(online|instagram|tiktok|whats\s?app|website|web\s?shop|e-?commerce|social media|delivery apps?)\b|[أا]ونلاين|[إا]نستقرام|[إا]نستغرام|تيك\s?توك|واتساب|واتس\s?اب|موقع\s?[إا]لكتروني|متجر\s?[إا]لكتروني|تطبيقات\s?التوصيل|التواصل\s?الاجتماعي/i;
// "online store" and similar are online channels, not premises.
const ONLINE_STORE = /\b(online|web|e-?)\s*(store|shop)\b|متجر\s?[إا]لكتروني|متجر\s?[أا]ونلاين/gi;
const PHYSICAL =
  /\b(shop|store|storefront|outlet|caf[eé]|restaurant|salon|showroom|kiosk|branch|premises|walk-in|physical location)\b|محل|متجر|كشك|مقهى|كافيه|كوفي|مطعم|صالون|معرض|فرع/i;

/** The sales channel, when the idea already says it — so onboarding doesn't ask again. */
function findChannel(idea: string) {
  const online = ONLINE.test(idea);
  const physical = PHYSICAL.test(idea.replace(ONLINE_STORE, ""));
  if (online && physical) return "Both";
  if (online) return "Online only";
  if (physical) return "Physical location";
  return undefined;
}

const ABAYA = /\babayas?\b|عباي/i;
const ONLINE_WORD = /\bonline\b|[أا]ونلاين/i;

// "I want to open a kiosk in…" / "أبي أفتح كشك في…": the business is what follows the verb.
const ENGLISH_BUSINESS =
  /\b(?:launch|start|open|build|create|run)\s+(?:an?\s+|my\s+own\s+|my\s+)?(.+?)(?=\s+(?:in|with|for|using)\b|[.,!?]|$)/i;
const ARABIC_BUSINESS =
  /(?:[أا]فتح|فتح|افتتاح|[أا]طلق|[إا]طلاق|[أا]بد[أا]|بدء|[أا]نشئ|[إا]نشاء|[أا]ؤسس|تأسيس)\s+(.+?)(?=\s+(?:في|بميزانية|برأس|مع|من خلال|عن طريق)\s|[.،,!؟]|$)/;

function findBusiness(idea: string) {
  if (ABAYA.test(idea)) {
    return ONLINE_WORD.test(idea) ? "Online abaya brand" : "Abaya brand";
  }
  const phrase = (idea.match(ENGLISH_BUSINESS)?.[1] ?? idea.match(ARABIC_BUSINESS)?.[1])?.trim();
  const text = phrase || idea.trim();
  const short = text.length > 48 ? `${text.slice(0, 45).trimEnd()}…` : text;
  return short.charAt(0).toUpperCase() + short.slice(1);
}

/** Local, rule-based stand-in for the real KHITTA agent. */
export const prototypeAgent: OnboardingAgent = {
  async analyzeIdea(idea) {
    await new Promise((resolve) => setTimeout(resolve, THINKING_MS));

    const isAbaya = ABAYA.test(idea);
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

    const questions = [
      ...(location ? [] : [locationQuestion]),
      ...(budget ? [] : [budgetQuestion]),
      ...(isAbaya ? abayaQuestions : generalQuestions.filter((q) => !(channel && q.id === "channel"))),
    ];
    const analysis: IdeaAnalysis = { facts, questions };
    return analysis;
  },
};
