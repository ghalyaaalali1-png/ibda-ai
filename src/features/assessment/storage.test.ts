import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/home-bakery.json";
import type { AssessmentRequest, InitialAssessment } from "./schema";
import { localized, type Stored } from "./storage";

const assessment = fixture as unknown as InitialAssessment;
const input: AssessmentRequest = {
  idea: "I want to open a specialty coffee kiosk in Abu Dhabi",
  profile: [
    { id: "business", label: "Business", value: "Specialty coffee kiosk" },
    { id: "location", label: "Location", value: "Abu Dhabi" },
  ],
};
const englishResult: Stored = { key: "k", locale: "en", assessment };
const business = (r: ReturnType<typeof localized>) => r?.profile.find((f) => f.id === "business")?.value;

describe("a saved result in the interface language", () => {
  it("shows an English result with the typed name in English", () => {
    const r = localized(englishResult, input, "en");
    expect(r?.assessment).toBe(assessment);
    expect(business(r)).toBe("Specialty coffee kiosk");
  });

  it("waits for the translation when the plan isn't in Arabic yet", () => {
    expect(localized(englishResult, input, "ar")).toBeNull();
  });

  it("waits for the business name when only the plan is translated", () => {
    expect(localized({ ...englishResult, translations: { ar: assessment } }, input, "ar")).toBeNull();
  });

  it("shows the translated name once both are ready, leaving other answers as stored", () => {
    const r = localized(
      { ...englishResult, translations: { ar: assessment }, businessNames: { ar: "كشك قهوة مختصة" } },
      input,
      "ar",
    );
    expect(business(r)).toBe("كشك قهوة مختصة");
    expect(r?.profile.find((f) => f.id === "location")?.value).toBe("Abu Dhabi");
    expect(input.profile[0].value).toBe("Specialty coffee kiosk");
  });

  it("needs no name translation when the founder typed it in the interface language", () => {
    const arabicInput = { ...input, profile: [{ id: "business", label: "Business", value: "مخبز منزلي" }] };
    const r = localized({ ...englishResult, locale: "ar" }, arabicInput, "ar");
    expect(business(r)).toBe("مخبز منزلي");
  });
});
