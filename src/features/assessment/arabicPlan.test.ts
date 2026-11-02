import { describe, expect, it } from "vitest";
import { buildLaunchPack } from "@/features/launch-pack/buildLaunchPack";
import { extrasFromAssessment } from "@/features/launch-pack/extras";
import type { LaunchProfile } from "@/features/launch-profile/profile";
import { demoFor } from "@/features/demo/localizedDemo";
import { dictionaries } from "@/i18n";
import { englishLeftovers } from "@/test/englishLeftovers";
import fixture from "./__fixtures__/flower-shop.ar.json";
import { buildMarketing } from "./applyToMarketing";
import { buildPlan } from "./applyToPlan";
import { buildSupplierData } from "./applyToSuppliers";
import { initialAssessmentSchema, type InitialAssessment } from "./schema";

// A real result from /api/assessment with locale "ar" (flower shop, Abu Dhabi, AED 40,000).
const assessment = fixture as unknown as InitialAssessment;
// As Arabic onboarding stores it: the business in the founder's words, the other answers as English codes.
const profile: LaunchProfile = [
  { id: "business", label: "Business", value: "محل ورد" },
  { id: "location", label: "Location", value: "Abu Dhabi" },
  { id: "budget", label: "Budget", value: "AED 40,000" },
  { id: "channel", label: "Sales channel", value: "Physical location" },
  { id: "stage", label: "Stage", value: "Just an idea" },
];

// Names Claude may keep as written: official bodies, platforms and common trade terms.
const NAMES = ["Abu Dhabi", "ADDED", "TAMM", "Google Business Profile", "Google Maps", "WhatsApp Business", "Instagram Reels", "Reels", "Stories", "Snapchat", "Facebook", "Talabat", "Deliveroo", "Noon", "Amazon", "Careem"];

describe("a plan generated in Arabic", () => {
  const t = dictionaries.ar;
  const base = demoFor("ar").plan;
  const plan = buildPlan(base, assessment, profile, t);
  const suppliers = buildSupplierData(assessment, plan, profile, t);
  const marketing = buildMarketing(assessment, plan, profile, t);
  const pack = buildLaunchPack({ plan, suppliers, marketing: marketing.marketing, extras: extrasFromAssessment(assessment) }, t);

  it("is a valid assessment with its codes kept in English", () => {
    expect(initialAssessmentSchema.safeParse(assessment).success).toBe(true);
    expect(["FEASIBLE", "FEASIBLE_WITH_CHANGES", "CURRENTLY_NOT_FEASIBLE"]).toContain(assessment.feasibility.status);
    expect(assessment.setup.path.map((p) => p.stage)).toEqual(["activity", "route", "authority", "approvals", "establishment", "next"]);
  });

  it("shows no English text on any screen", () => {
    const leftovers = [
      ...englishLeftovers(plan, NAMES, "plan"),
      ...englishLeftovers(suppliers, NAMES, "suppliers"),
      ...englishLeftovers({ ...marketing.marketing, text: marketing.text }, NAMES, "marketing"),
      ...englishLeftovers(pack, NAMES, "pack"),
    ];
    expect(leftovers).toEqual([]);
  });

  it("keeps supplier options matched to their Arabic categories, with distinct ids", () => {
    const ids = suppliers.categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(suppliers.suppliers.every((s) => ids.includes(s.category))).toBe(true);
    for (const id of ids) expect(suppliers.suppliers.some((s) => s.category === id)).toBe(true);
    expect(suppliers.shortlist.length).toBe(ids.length);
  });

  it("reads the launch length from an Arabic launch path label", () => {
    expect(suppliers.brief.launchWindow).toMatch(/\d+/);
  });
});
