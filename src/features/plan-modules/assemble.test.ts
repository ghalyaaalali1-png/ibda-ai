import { describe, expect, it } from "vitest";
import { buildMarketing } from "@/features/assessment/applyToMarketing";
import { buildPlan } from "@/features/assessment/applyToPlan";
import { buildSupplierData } from "@/features/assessment/applyToSuppliers";
import fixture from "@/features/assessment/__fixtures__/home-bakery.json";
import type { InitialAssessment } from "@/features/assessment/schema";
import { buildLaunchPack } from "@/features/launch-pack/buildLaunchPack";
import { extrasFromAssessment } from "@/features/launch-pack/extras";
import type { LaunchProfile } from "@/features/launch-profile/profile";
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
function screens(a: InitialAssessment) {
  const plan = buildPlan(demoPlan, a, profile);
  const suppliers = buildSupplierData(a, plan, profile);
  const marketing = buildMarketing(a, plan, profile);
  const pack = buildLaunchPack({ plan, suppliers, marketing: marketing.marketing, extras: extrasFromAssessment(a) });
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
