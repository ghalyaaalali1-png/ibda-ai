import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/home-bakery.json";
import { initialAssessmentSchema, type InitialAssessment } from "./schema";
import { assessmentTexts, mapTexts, withTranslations } from "./translatable";

const assessment = fixture as unknown as InitialAssessment;

/** Everything that isn't free text: numbers, booleans, codes and ids, in order. */
function nonText(a: InitialAssessment) {
  const marked = mapTexts(initialAssessmentSchema, a, () => "·");
  return JSON.stringify(marked);
}

describe("translating a stored assessment", () => {
  const texts = assessmentTexts(assessment);

  it("finds the written text and none of the codes, ids or numbers", () => {
    expect(texts.length).toBeGreaterThan(100);
    expect(texts).not.toContain("FEASIBLE");
    expect(texts).not.toContain("ESTIMATE");
    expect(texts).not.toContain("likely");
    expect(texts).not.toContain("prelaunch");
    for (const id of assessment.setup.sourceIds) expect(texts).not.toContain(id);
    expect(texts).toContain(assessment.feasibility.headline);
    expect(texts).toContain(assessment.marketing.posts[0].caption);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it("replaces every text and keeps figures, codes and structure exactly", () => {
    const translated = withTranslations(assessment, new Map(texts.map((text, i) => [text, `نص ${i}`])));
    expect(initialAssessmentSchema.safeParse(translated).success).toBe(true);
    expect(nonText(translated)).toBe(nonText(assessment));
    expect(assessmentTexts(translated).every((text) => text.startsWith("نص "))).toBe(true);
    expect(translated.feasibility.status).toBe(assessment.feasibility.status);
    expect(translated.plan.monthlySales).toEqual(assessment.plan.monthlySales);
    expect(translated.setup.sourceIds).toEqual(assessment.setup.sourceIds);
  });

  it("translates the same text the same way, so supplier options still match their category", () => {
    const translated = withTranslations(assessment, new Map(texts.map((text, i) => [text, `نص ${i}`])));
    const labels = new Set(translated.suppliers.categories.map((c) => c.label));
    expect(translated.suppliers.options.every((o) => labels.has(o.category))).toBe(true);
  });
});
