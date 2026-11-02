import { describe, expect, it } from "vitest";
import { buildMarketing } from "@/features/assessment/applyToMarketing";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { buildSupplierData } from "@/features/assessment/applyToSuppliers";
import fixture from "@/features/assessment/__fixtures__/home-bakery.json";
import type { InitialAssessment } from "@/features/assessment/schema";
import { buildLaunchPack } from "@/features/launch-pack/buildLaunchPack";
import { extrasFromAssessment } from "@/features/launch-pack/extras";
import type { LaunchProfile } from "@/features/launch-profile/profile";
import { dictionaries, type Dictionary } from "@/i18n";
import { demoPlan } from "@/features/plan/demoPlan";
import { assembleAssessment, splitAssessment } from "./assemble";
import { moduleDefinitions } from "./registry";
import { moduleKeys } from "./types";

// A real result from /api/assessment (home bakery, Dubai, AED 15,000).
const assessment = fixture as unknown as InitialAssessment;
const profile: LaunchProfile = [
  { id: "business", label: "Business", value: "Home bakery" },
  { id: "location", label: "Location", value: "Dubai" },
  { id: "budget", label: "Budget", value: "AED 15,000" },
  { id: "channel", label: "Sales channel", value: "Online only" },
  { id: "stage", label: "Stage", value: "Just an idea" },
];

/** Everything the screens build from an assessment. */
function screens(a: InitialAssessment, t?: Dictionary) {
  const plan = buildPlan(demoPlan, a, profile, t);
  const suppliers = buildSupplierData(a, plan, profile, t);
  const marketing = buildMarketing(a, plan, profile, t);
  const pack = buildLaunchPack({ plan, suppliers, marketing: marketing.marketing, extras: extrasFromAssessment(a) }, t);
  return { plan, suppliers, marketing, pack };
}

describe("splitAssessment / assembleAssessment", () => {
  const modules = splitAssessment(assessment);

  it("splits a real result into modules that each pass their schema", () => {
    for (const key of moduleKeys) {
      const parsed = moduleDefinitions[key].schema.safeParse(modules[key]);
      expect(parsed.success, `${key}: ${parsed.success ? "" : parsed.error.message}`).toBe(true);
    }
  });

  it("gives every field to exactly one module", () => {
    const shapes = [
      ["assessment", Object.keys(modules.assessment)],
      ["plan", [...Object.keys(modules.financials), ...Object.keys(modules.narrative)]],
      ["marketing", [...Object.keys(modules.marketing_strategy), ...Object.keys(modules.marketing_execution), ...Object.keys(modules.marketing_calendar)]],
    ] as const;
    for (const [, keys] of shapes) expect(new Set(keys).size).toBe(keys.length);
  });

  it("reassembles to exactly the original result", () => {
    const reassembled = assembleAssessment(modules);
    expect(reassembled).toEqual(assessment);
    expect(JSON.stringify(reassembled)).toBe(JSON.stringify(assessment));
  });

  it("gives the screens identical data after the round trip", () => {
    expect(JSON.stringify(screens(assembleAssessment(modules)))).toBe(JSON.stringify(screens(assessment)));
  });
});

describe("interface language", () => {
  it("changes the words around the plan, never its figures or Claude's content", () => {
    // Claude's content is the same here because both builds read the same (English) result.
    const en = screens(assessment, dictionaries.en);
    const ar = screens(assessment, dictionaries.ar);
    expect(ar.plan.costs.map((c) => c.amount)).toEqual(en.plan.costs.map((c) => c.amount));
    expect(ar.plan.breakEven).toEqual(en.plan.breakEven);
    expect(ar.plan.pricing).toEqual(en.plan.pricing);
    expect(ar.plan.decision.headline).toBe(en.plan.decision.headline);
    expect(ar.suppliers.allocation).toBe(en.suppliers.allocation);
    expect(ar.suppliers.shortlist).toEqual(en.suppliers.shortlist);
    expect(ar.marketing.marketing.budget[0].lines.map((l) => l.amount)).toEqual(
      en.marketing.marketing.budget[0].lines.map((l) => l.amount),
    );
    expect(ar.marketing.captionContext).toEqual(en.marketing.captionContext);
    expect(ar.pack.readiness.status).toBe(en.pack.readiness.status);
    expect(ar.pack.shortlist.total).toBe(en.pack.shortlist.total);
    // …while the screen text is in Arabic.
    expect(ar.suppliers.sourceNote).toMatch(/[\u0600-\u06FF]/);
    expect(ar.pack.readiness.reasons.join(" ")).toMatch(/[\u0600-\u06FF]/);
    expect(ar.suppliers.brief.positioningSentence).toMatch(/[\u0600-\u06FF]/);
  });
});
