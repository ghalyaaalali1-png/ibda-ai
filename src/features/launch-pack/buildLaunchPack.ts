import { leadTimeLabel, moqLabel } from "@/features/suppliers/format";
import { english, type Dictionary } from "@/i18n";
import type { ChecklistItem, LaunchPack, OutstandingItem, PackInputs, Readiness } from "./types";

const HORIZON = 6;

/**
 * Overall readiness from rules over what KHITTA has already generated —
 * never a new judgement. Mirrors the Agent Guide's final status:
 * Ready to Launch / Proceed With Conditions / Needs Work.
 */
function readinessFor(p: PackInputs, contribution: number, overAllocation: number, t: Dictionary): Readiness {
  const { plan, extras } = p;
  const b = t.launchPack.built;
  const labels = t.launchPack.readiness.labels;
  const blockers: string[] = [];
  const conditions: string[] = [];

  if (plan.decision.verdict === "NO-GO") blockers.push(b.assessment(plan.decision.headline));
  if (contribution <= 0) blockers.push(b.priceBelowCost);

  if (plan.decision.verdict === "CAUTION") conditions.push(b.assessmentChanges(plan.decision.headline));
  if (plan.breakEven.month === null) conditions.push(b.noBreakEven(HORIZON));
  if (overAllocation > 0) conditions.push(b.overAllocation(t.fmt.aed(overAllocation)));
  const toConfirm = plan.setup.requirements.filter((r) => r.level === "confirm").length;
  if (toConfirm > 0) conditions.push(b.toConfirm(toConfirm));
  if (extras.questions.length > 0) conditions.push(b.openQuestions(extras.questions.length));
  if (extras.outputStatus === "PARTIAL") conditions.push(b.partial);

  if (blockers.length > 0) return { status: "needs-work", label: labels["needs-work"], reasons: [...blockers, ...conditions] };
  if (conditions.length > 0) return { status: "conditions", label: labels.conditions, reasons: conditions };
  return { status: "ready", label: labels.ready, reasons: [b.noConditions] };
}

/**
 * Consolidates the plan, supplier, requirements and marketing outputs into
 * one launch pack. Pure assembly: every item comes from those outputs. `t`
 * words the text it adds (English by default).
 */
export function buildLaunchPack(p: PackInputs, t: Dictionary = english): LaunchPack {
  const { plan, suppliers, marketing, extras } = p;
  const b = t.launchPack.built;

  const contribution = plan.unitEconomics.price - plan.unitEconomics.costs.reduce((s, c) => s + c.amount, 0);

  // Supplier shortlist with the details a founder needs to act on it.
  const byId = new Map(suppliers.suppliers.map((s) => [s.id, s]));
  const rows = suppliers.shortlist.flatMap((item) => {
    const s = byId.get(item.supplierId);
    if (!s) return [];
    const category = suppliers.categories.find((c) => c.id === s.category);
    return [{
      category: category?.label ?? s.category,
      supplier: s.name,
      location: s.location,
      estimate: item.estimate,
      basis: item.basis,
      moq: moqLabel(s, t),
      leadTime: leadTimeLabel(s, t),
    }];
  });
  const shortlistTotal = rows.reduce((sum, r) => sum + r.estimate, 0);
  const overAllocation = Math.max(0, shortlistTotal - suppliers.allocation);

  const marketingWeeks = marketing.launchMonth.weeks.map((w) => {
    const posts = marketing.launchMonth.posts.filter((post) => post.week === w.week);
    return { week: w.week, title: w.title, goal: w.goal, posts: posts.length, platforms: [...new Set(posts.map((x) => x.platform))], planWeek: w.planWeek };
  });
  const week = (n: number) => marketing.launchMonth.weeks.find((w) => w.week === n);
  const postsIn = (n: number) => marketing.launchMonth.posts.filter((x) => x.week === n);
  const phase = (id: "launch" | "growth") => marketing.phases.find((x) => x.id === id);

  const reqs = plan.setup.requirements;
  const actions = plan.nextActions;

  // Final checklist, assembled only from earlier outputs.
  const before: ChecklistItem[] = [
    ...actions.slice(0, Math.max(0, actions.length - 1)).slice(0, 5).map((a) => ({ text: a.title, detail: a.timing, from: "Plan" as const })),
    ...(rows.length
      ? [{ text: b.requestQuotes, detail: rows.map((r) => r.category).join(", "), from: "Suppliers" as const }]
      : []),
    ...reqs.filter((r) => r.level === "likely").slice(0, 4).map((r) => ({ text: b.arrange(r.item), from: "Requirements" as const, link: r.authority, viaPortal: r.viaPortal })),
    ...(week(1) ? [{ text: b.teaserWeek(week(1)!.goal), from: "Marketing" as const }] : []),
  ];
  const launch: ChecklistItem[] = [
    ...(actions.length ? [{ text: actions[actions.length - 1].title, detail: actions[actions.length - 1].timing, from: "Plan" as const }] : []),
    ...(phase("launch")?.plan[0]?.actions.slice(0, 3).map((a) => ({ text: a.text, from: "Marketing" as const })) ?? []),
    ...postsIn(2).slice(0, 3).map((x) => ({ text: `${x.day}: ${x.topic}`, detail: `${x.platform} · ${x.contentType}`, from: "Marketing" as const })),
    ...marketing.kpis.slice(0, 3).map((k) => ({ text: `${k.label}: ${k.target}`, detail: k.when, from: "Marketing" as const })),
  ];
  const after: ChecklistItem[] = [
    ...[3, 4].flatMap((n) => (week(n) ? [{ text: `${week(n)!.title}: ${week(n)!.goal}`, from: "Marketing" as const }] : [])),
    ...(phase("growth")?.plan.flatMap((w) => w.actions).slice(0, 2).map((a) => ({ text: a.text, from: "Marketing" as const })) ?? []),
    ...reqs.filter((r) => r.level === "depends").slice(0, 3).map((r) => ({ text: b.checkIfNeeded(r.item), detail: r.why, from: "Requirements" as const, link: r.authority, viaPortal: r.viaPortal })),
  ];

  // Everything still to answer, verify or replace with real figures.
  const outstanding: OutstandingItem[] = [
    ...extras.questions.map((q) => ({ kind: "Question for you" as const, text: q.question, why: q.why, from: "Assessment" as const })),
    ...reqs.filter((r) => r.level === "confirm").map((r) => ({ kind: "To verify" as const, text: r.item, why: r.why, from: "Requirements" as const, link: r.authority, viaPortal: r.viaPortal })),
    ...extras.assumptions.filter((a) => a.label !== "Your figure").map((a) => ({ kind: "Assumption" as const, text: a.text, why: a.label === "Estimate" ? b.estimate : b.notConfirmed, from: "Assessment" as const })),
    { kind: "Assumption", text: b.estimatesNote, why: b.estimatesWhy, from: "Plan" },
    ...(plan.breakEven.month === null
      ? [{ kind: "Assumption" as const, text: b.noBreakEvenNote(HORIZON), why: b.noBreakEvenWhy, from: "Plan" as const }]
      : []),
    { kind: "To verify", text: suppliers.sourceNote, why: b.quotesWhy, from: "Suppliers" },
    ...(overAllocation > 0
      ? [{ kind: "To verify" as const, text: b.overNote(t.fmt.aed(overAllocation)), why: b.overWhy, from: "Suppliers" as const }]
      : []),
  ];

  return {
    inputs: p,
    readiness: readinessFor(p, contribution, overAllocation, t),
    shortlist: { rows, total: shortlistTotal },
    requirements: reqs,
    marketingWeeks,
    checklist: { before, launch, after },
    outstanding,
  };
}
