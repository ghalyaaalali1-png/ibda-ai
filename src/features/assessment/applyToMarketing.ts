import { businessPhrase, profileValue, type ProfileField } from "@/features/launch-profile/profile";
import type { CaptionContext } from "@/features/marketing/captions";
import type { MarketingViewText } from "@/features/marketing/components/MarketingPlanView";
import type { InspirationItem, LaunchTheme, MarketingPlan, Phase } from "@/features/marketing/types";
import type { BusinessPlan } from "@/features/plan/types";
import { displayProfileLine, displayValue, english, type Dictionary } from "@/i18n";
import type { InitialAssessment } from "./schema";

const themeOrder: LaunchTheme[] = ["teaser", "launch", "education", "proof"];

// Inspiration must describe kinds of competitors, never real accounts or figures.
const NAMES_OR_FIGURES =
  /@\w|https?:\/\/|www\.|\.(com|ae|net)\b|\d[\d,.]*\s*[km]?\s*(followers|likes|views|subscribers)|\d[\d,.]*\s*(ألف|مليون)?\s*(متابع|إعجاب|مشاهدة|مشترك)/i;
const isPatternOnly = (i: InspirationItem) =>
  !NAMES_OR_FIGURES.test([i.competitorType, i.whatWorks, i.howToAdapt, i.avoid].join(" "));

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Splits a total by percentage shares, rounding to AED 50 with the last line absorbing rounding. */
function splitByShares(total: number, shares: number[]) {
  const sumShares = shares.reduce((a, b) => a + b, 0) || 1;
  const amounts = shares.map((s) => Math.round((total * s) / sumShares / 50) * 50);
  amounts[amounts.length - 1] += total - amounts.reduce((a, b) => a + b, 0);
  return amounts;
}

/**
 * Builds the Marketing screen for any business from Claude's marketing
 * planning and the plan built from the assessment. Budget totals come from
 * the plan's marketing cost lines so the two screens can't disagree. `t`
 * words the screen text (English by default); what's sent to Claude for
 * captions stays as entered.
 */
export function buildMarketing(
  a: InitialAssessment,
  plan: BusinessPlan,
  profile: ProfileField[],
  t: Dictionary = english,
) {
  const m = a.marketing;
  const built = t.marketing.built;
  const themeTitles: Record<LaunchTheme, string> = built.themes;
  const postLabel = (label: string) => built.postLabels[label.trim()] ?? label;

  const phases: Phase[] = (["prelaunch", "launch", "growth"] as const).map((id) => {
    const weeks = m.weeks
      .filter((w) => w.phase === id)
      .sort((x, y) => x.week - y.week)
      .map((w) => ({ week: Math.round(w.week), focus: w.focus, actions: w.actions.slice(0, 4) }));
    const first = weeks[0]?.week;
    const last = weeks.at(-1)?.week;
    return {
      id,
      label: t.marketing.calendar.phases[id],
      weeks: first === undefined || last === undefined ? "" : t.marketing.calendar.weeks(first, last),
      goal: m.phaseGoals.find((g) => g.phase === id)?.goal ?? "",
      plan: weeks,
    };
  });

  // Budget: the plan's marketing lines, split the way Claude suggests.
  const marketingLines = plan.costs.filter((c) => c.group === "marketing");
  const marketingTotal = marketingLines.reduce((sum, c) => sum + c.amount, 0);
  const spend = plan.budget.total - plan.budget.reserve;
  const total = marketingTotal > 0 ? marketingTotal : Math.round((spend * 0.1) / 100) * 100;
  const split = m.budgetSplit.slice(0, 5);
  const amounts = splitByShares(total, split.map((b) => Math.max(0, b.sharePercent)));

  const firstMonth = plan.breakEven.cashflow.find((p) => p.month === 1)?.sales ?? 0;
  const { pricing, unit } = plan;
  const priceRange = `AED ${pricing.min.toLocaleString("en-US")}–${pricing.max.toLocaleString("en-US")}`;
  const location = profileValue(profile, "location") ?? "the UAE";
  const phrase = businessPhrase(profile);
  const launchWeek = phases.find((p) => p.id === "launch")?.plan[0]?.week;

  // Launch month: teaser the week before launch, then launch, education and proof.
  const launchMonth = {
    weeks: themeOrder.map((theme, i) => {
      const goal = m.weekGoals.find((g) => g.theme === theme);
      return {
        week: i + 1,
        theme,
        title: goal?.title || themeTitles[theme],
        goal: goal?.goal ?? "",
        planWeek: launchWeek ? launchWeek - 1 + i : undefined,
      };
    }),
    posts: m.posts
      .map((p) => ({
        ...p,
        week: Math.min(4, Math.max(1, Math.round(p.week))),
        day: postLabel(p.day),
        contentType: postLabel(p.contentType),
      }))
      .sort((a, b) => a.week - b.week)
      .slice(0, 16),
  };

  const marketing: MarketingPlan = {
    strategy: {
      objective: m.objective,
      targetCustomer: a.targetCustomer.description,
      // The assessment's statement, so every screen shows the same positioning.
      positioning: a.positioning.statement,
      valueProposition: m.valueProposition,
      channels: m.channels.slice(0, 5).map((c) => ({ name: c.name, role: c.role, priority: c.primary ? "Primary" : "Support" })),
    },
    phases,
    contentPillars: m.contentPillars.slice(0, 8).map((p, i) => ({ id: `${slug(p.title)}-${i}`, ...p })),
    postingRhythm: m.postingRhythm,
    budget: [
      {
        planLine:
          marketingTotal > 0
            ? marketingLines.map((c) => c.label).join(" + ")
            : built.suggestedBudget,
        total,
        lines: split.map((b, i) => ({ label: b.label, amount: amounts[i], note: b.note })),
      },
    ],
    kpis: [
      ...m.kpis.slice(0, 5),
      {
        label: built.firstMonth.label,
        target: `${firstMonth.toLocaleString("en-US")} ${firstMonth === 1 ? unit.singular : unit.plural}`,
        when: built.firstMonth.when,
        signal: built.firstMonth.signal,
      },
    ],
    nextMove: { title: m.nextMove.title, why: m.nextMove.why, steps: m.nextMove.steps.slice(0, 3) },
    launchMonth,
    inspiration: m.inspiration.filter(isPatternOnly).slice(0, 4),
  };

  const text: MarketingViewText = {
    profileLine: displayProfileLine(t, profile),
    intro: built.intro(
      t.locale === "en" ? phrase : displayValue(t, profileValue(profile, "business") ?? phrase),
      displayValue(t, location),
      t.fmt.aedRange(pricing.min, pricing.max),
      unit.singular,
      launchWeek,
    ),
    sourceNote: built.sourceNote,
    budgetFootnote: built.footnote(t.fmt.aed(plan.breakEven.monthlyRunningCosts)),
  };

  const captionContext: CaptionContext = {
    business: profileValue(profile, "business") ?? phrase,
    location,
    positioning: a.positioning.statement,
    targetCustomer: a.targetCustomer.description,
    priceRange: `${priceRange} per ${unit.singular}`,
    channels: marketing.strategy.channels.map((c) => c.name),
  };

  return { marketing, text, captionContext };
}
