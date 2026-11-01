import { businessPhrase, profileValue, type ProfileField } from "@/features/launch-profile/profile";
import type { CaptionContext } from "@/features/marketing/captions";
import type { MarketingViewText } from "@/features/marketing/components/MarketingPlanView";
import type { InspirationItem, LaunchTheme, MarketingPlan, Phase, PhaseId } from "@/features/marketing/types";
import { aed } from "@/features/plan/format";
import type { BusinessPlan } from "@/features/plan/types";
import type { InitialAssessment } from "./schema";

const phaseLabels: Record<PhaseId, string> = { prelaunch: "Pre-launch", launch: "Launch", growth: "Growth" };

const themeOrder: LaunchTheme[] = ["teaser", "launch", "education", "proof"];
const themeTitles: Record<LaunchTheme, string> = {
  teaser: "Teaser & pre-launch",
  launch: "Launch week",
  education: "Education & value",
  proof: "Reviews & social proof",
};

// Inspiration must describe kinds of competitors, never real accounts or figures.
const NAMES_OR_FIGURES = /@\w|https?:\/\/|www\.|\.(com|ae|net)\b|\d[\d,.]*\s*[km]?\s*(followers|likes|views|subscribers)/i;
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
 * the plan's marketing cost lines so the two screens can't disagree.
 */
export function buildMarketing(a: InitialAssessment, plan: BusinessPlan, profile: ProfileField[]) {
  const m = a.marketing;

  const phases: Phase[] = (["prelaunch", "launch", "growth"] as const).map((id) => {
    const weeks = m.weeks
      .filter((w) => w.phase === id)
      .sort((x, y) => x.week - y.week)
      .map((w) => ({ week: Math.round(w.week), focus: w.focus, actions: w.actions.slice(0, 4) }));
    const first = weeks[0]?.week;
    const last = weeks.at(-1)?.week;
    return {
      id,
      label: phaseLabels[id],
      weeks: first === undefined ? "" : first === last ? `Week ${first}` : `Weeks ${first}–${last}`,
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
      .map((p) => ({ ...p, week: Math.min(4, Math.max(1, Math.round(p.week))) }))
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
            : "Suggested marketing budget (estimate)",
        total,
        lines: split.map((b, i) => ({ label: b.label, amount: amounts[i], note: b.note })),
      },
    ],
    kpis: [
      ...m.kpis.slice(0, 5),
      {
        label: "First-month sales",
        target: `${firstMonth.toLocaleString("en-US")} ${firstMonth === 1 ? unit.singular : unit.plural}`,
        when: "End of month 1",
        signal: "Matches the business plan's month-1 estimate",
      },
    ],
    nextMove: { title: m.nextMove.title, why: m.nextMove.why, steps: m.nextMove.steps.slice(0, 3) },
    launchMonth,
    inspiration: m.inspiration.filter(isPatternOnly).slice(0, 4),
  };

  const text: MarketingViewText = {
    profileLine: ["business", "location", "budget"]
      .map((id) => profileValue(profile, id))
      .filter(Boolean)
      .join(" · "),
    intro: `Built from your business plan: your ${phrase} in ${location}, priced at ${priceRange} per ${unit.singular}${
      launchWeek ? `, a launch in week ${launchWeek}` : ""
    } and the marketing budget already in your plan.`,
    sourceNote: "Prototype plan — targets are estimates",
    budgetFootnote: `From month 2, marketing is funded from sales within your ${aed(
      plan.breakEven.monthlyRunningCosts,
    )} monthly running costs. Estimates.`,
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
