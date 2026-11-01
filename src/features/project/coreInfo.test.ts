import { describe, expect, it } from "vitest";
import { demoProfile } from "@/features/launch-profile/profile";
import { changedFields, coreInfoFromProfile, parseAedRange } from "./coreInfo";

describe("parseAedRange", () => {
  it.each([
    ["AED 60,000", { minAed: 60000, maxAed: 60000 }],
    ["AED 25,000–75,000", { minAed: 25000, maxAed: 75000 }],
    ["Under AED 25,000", { minAed: null, maxAed: 25000 }],
    ["AED 150,000+", { minAed: 150000, maxAed: null }],
    ["AED 600–1,000", { minAed: 600, maxAed: 1000 }],
    ["AED 1,000+", { minAed: 1000, maxAed: null }],
    ["Under AED 300", { minAed: null, maxAed: 300 }],
    ["30k AED", { minAed: 30000, maxAed: 30000 }],
  ])("%s", (text, expected) => {
    expect(parseAedRange(text)).toEqual(expected);
  });

  it("returns null without an amount", () => {
    expect(parseAedRange("Not sure")).toBeNull();
  });
});

describe("coreInfoFromProfile", () => {
  it("maps the abaya demo, keeping its own questions as extras", () => {
    const core = coreInfoFromProfile("Abaya idea", demoProfile);
    expect(core).toMatchObject({
      offering: "Online abaya brand",
      emirate: "dubai",
      budget: { minAed: 30000, maxAed: 30000 },
      targetPrice: { minAed: 600, maxAed: 1000 },
      salesChannel: null,
    });
    expect(core.extras.map((e) => e.id)).toEqual(["abayaType", "designCount", "production"]);
  });

  it("maps a general idea's answers to codes", () => {
    const core = coreInfoFromProfile("Coffee kiosk", [
      { id: "business", label: "Business", value: "Specialty coffee kiosk" },
      { id: "location", label: "Location", value: "Abu Dhabi" },
      { id: "budget", label: "Budget", value: "AED 60,000" },
      { id: "channel", label: "Sales channel", value: "Physical location" },
      { id: "stage", label: "Stage", value: "Just an idea" },
    ]);
    expect(core).toEqual({
      idea: "Coffee kiosk",
      offering: "Specialty coffee kiosk",
      businessModel: null,
      emirate: "abu_dhabi",
      area: null,
      budget: { minAed: 60000, maxAed: 60000 },
      salesChannel: "physical",
      targetCustomer: null,
      stage: "idea",
      targetPrice: null,
      extras: [],
    });
  });

  it("keeps answers it can't type in extras instead of dropping them", () => {
    const core = coreInfoFromProfile("Idea", [
      { id: "location", label: "Location", value: "Another emirate" },
      { id: "channel", label: "Sales channel", value: "Pop-up markets" },
    ]);
    expect(core.emirate).toBeNull();
    expect(core.salesChannel).toBeNull();
    expect(core.extras).toEqual([
      { id: "location", label: "Location", value: "Another emirate" },
      { id: "channel", label: "Sales channel", value: "Pop-up markets" },
    ]);
  });
});

describe("changedFields", () => {
  const base = coreInfoFromProfile("Abaya idea", demoProfile);

  it("finds a budget change only", () => {
    expect(changedFields(base, { ...base, budget: { minAed: 50000, maxAed: 50000 } })).toEqual(["budget"]);
  });

  it("finds several changes", () => {
    expect(changedFields(base, { ...base, emirate: "sharjah", salesChannel: "both" })).toEqual(["emirate", "salesChannel"]);
  });

  it("ignores the order of extras", () => {
    expect(changedFields(base, { ...base, extras: [...base.extras].reverse() })).toEqual([]);
  });
});
