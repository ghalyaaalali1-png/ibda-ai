import { describe, expect, it } from "vitest";
import type { LaunchProfile } from "@/features/launch-profile/profile";
import { budgetValue, choicesFor, editImpact } from "./editing";

const answers: LaunchProfile = [
  { id: "business", label: "Business", value: "Home bakery" },
  { id: "location", label: "Location", value: "Dubai" },
  { id: "budget", label: "Budget", value: "AED 15,000" },
  { id: "channel", label: "Sales channel", value: "Online only" },
  { id: "stage", label: "Stage", value: "Just an idea" },
];
const idea = "A home bakery in Dubai";
const withAnswer = (id: string, value: string) => answers.map((f) => (f.id === id ? { ...f, value } : f));

describe("what an edit updates", () => {
  it("updates nothing when nothing changed", () => {
    expect(editImpact({ idea, answers }, { idea, answers }).update).toEqual([]);
  });

  it("keeps licences, suppliers and marketing when only the budget changes", () => {
    const impact = editImpact({ idea, answers }, { idea, answers: withAnswer("budget", "AED 40,000") });
    expect(impact.update).toEqual(["assessment", "financials", "narrative", "suppliers"]);
    expect(impact.keep).toEqual(["setup", "marketing"]);
  });

  it("updates only the assessment and the market section when the stage changes", () => {
    const impact = editImpact({ idea, answers }, { idea, answers: withAnswer("stage", "Researching") });
    expect(impact.update).toEqual(["assessment", "narrative"]);
  });

  it("updates every section when the business itself changes", () => {
    const impact = editImpact({ idea, answers }, { idea, answers: withAnswer("business", "Cupcake truck") });
    expect(impact.keep).toEqual([]);
  });
});

describe("edit form choices", () => {
  it("offers fixed choices where onboarding has them, free text otherwise", () => {
    expect(choicesFor("location")).toContain("Ras Al Khaimah");
    expect(choicesFor("channel")).toEqual(["Online only", "Physical location", "Both", "Not sure yet"]);
    expect(choicesFor("business")).toBeNull();
    expect(choicesFor("budget")).toBeNull();
  });

  it("stores a typed budget like onboarding does", () => {
    expect(budgetValue(40000)).toBe("AED 40,000");
  });
});
