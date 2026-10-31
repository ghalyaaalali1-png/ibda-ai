import { aed } from "@/features/plan/format";
import { leadTimeLabel, moqLabel } from "@/features/suppliers/format";
import type { ChecklistItem, LaunchPack, OutstandingItem, PackInputs, Readiness } from "./types";

const HORIZON = 6;

/**
 * Overall readiness from rules over what Ibda has already generated —
 * never a new judgement. Mirrors the Agent Guide's final status:
 * Ready to Launch / Proceed With Conditions / Needs Work.
 */
function readinessFor(p: PackInputs, contribution: number, overAllocation: number): Readiness {
  const { plan, extras } = p;
  const blockers: string[] = [];
  const conditions: string[] = [];

  if (plan.decision.verdict === "NO-GO") blockers.push(`Ibda's assessment: ${plan.decision.headline}`);
  if (contribution <= 0) blockers.push("The planned price doesn't cover the estimated cost per sale");

  if (plan.decision.verdict === "CAUTION") conditions.push(`Ibda's assessment: feasible with changes — ${plan.decision.headline}`);
  if (plan.breakEven.month === null) conditions.push(`No break-even within ${HORIZON} months on current estimates`);
  if (overAllocation > 0) conditions.push(`Supplier estimates are ${aed(overAllocation)} over the plan's sourcing allocation`);
  const toConfirm = plan.setup.requirements.filter((r) => r.level === "confirm").length;
  if (toConfirm > 0) conditions.push(`${toConfirm} setup requirement${toConfirm > 1 ? "s need" : " needs"} official confirmation`);
  if (extras.questions.length > 0) conditions.push(`${extras.questions.length} open question${extras.questions.length > 1 ? "s" : ""} for you`);
  if (extras.outputStatus === "PARTIAL") conditions.push("Some information is still missing or unverified");

  if (blockers.length > 0) return { status: "needs-work", label: "Needs work", reasons: [...blockers, ...conditions] };
  if (conditions.length > 0) return { status: "conditions", label: "Proceed with conditions", reasons: conditions };
  return { status: "ready", label: "Ready to launch", reasons: ["No open conditions in Ibda's analysis"] };
}

/**
 * Consolidates the plan, supplier, requirements and marketing outputs into
 * one launch pack. Pure assembly: every item comes from those outputs.
 */
export function buildLaunchPack(p: PackInputs): LaunchPack {
  const { plan, suppliers, marketing, extras } = p;

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
      moq: moqLabel(s),
      leadTime: leadTimeLabel(s),
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
      ? [{ text: "Request quotes from your shortlisted suppliers", detail: rows.map((r) => r.category).join(", "), from: "Suppliers" as const }]
      : []),
    ...reqs.filter((r) => r.level === "likely").slice(0, 4).map((r) => ({ text: `Arrange: ${r.item}`, from: "Requirements" as const, link: r.authority, viaPortal: r.viaPortal })),
    ...(week(1) ? [{ text: `Run your teaser week: ${week(1)!.goal}`, from: "Marketing" as const }] : []),
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
    ...reqs.filter((r) => r.level === "depends").slice(0, 3).map((r) => ({ text: `Check if needed: ${r.item}`, detail: r.why, from: "Requirements" as const, link: r.authority, viaPortal: r.viaPortal })),
  ];

  // Everything still to answer, verify or replace with real figures.
  const outstanding: OutstandingItem[] = [
    ...extras.questions.map((q) => ({ kind: "Question for you" as const, text: q.question, why: q.why, from: "Assessment" as const })),
    ...reqs.filter((r) => r.level === "confirm").map((r) => ({ kind: "To verify" as const, text: r.item, why: r.why, from: "Requirements" as const, link: r.authority, viaPortal: r.viaPortal })),
    ...extras.assumptions.filter((a) => a.label !== "Your figure").map((a) => ({ kind: "Assumption" as const, text: a.text, why: a.label === "Estimate" ? "Estimate" : "Not yet confirmed", from: "Assessment" as const })),
    { kind: "Assumption", text: "Startup costs, prices, unit costs and monthly sales are estimates", why: "Replace them with real quotes and early sales data", from: "Plan" },
    ...(plan.breakEven.month === null
      ? [{ kind: "Assumption" as const, text: `On current estimates the business doesn't break even within ${HORIZON} months`, why: "Revisit pricing, costs or sales once you have real figures", from: "Plan" as const }]
      : []),
    { kind: "To verify", text: suppliers.sourceNote, why: "Get real quotes, samples and terms before ordering", from: "Suppliers" },
    ...(overAllocation > 0
      ? [{ kind: "To verify" as const, text: `Supplier estimates exceed the sourcing allocation by ${aed(overAllocation)}`, why: "Adjust quantities or the budget split", from: "Suppliers" as const }]
      : []),
  ];

  return {
    inputs: p,
    readiness: readinessFor(p, contribution, overAllocation),
    shortlist: { rows, total: shortlistTotal },
    requirements: reqs,
    marketingWeeks,
    checklist: { before, launch, after },
    outstanding,
  };
}
