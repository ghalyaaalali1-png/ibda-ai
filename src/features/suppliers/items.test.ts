import { describe, expect, it } from "vitest";
import { cleanItem, relinkRequested, withSupplierItem, withoutSupplierCategory, type SuppliersOutput, type SupplierItemOutput } from "./items";

const option = (category: string, name: string, score: number, recommended = false) => ({
  category, name, location: "Dubai", overseas: false, offering: "x", priceMinAed: 1, priceMaxAed: 2, priceUnit: "per unit",
  moqValue: 10, moqUnit: "units", leadMinDays: 1, leadMaxDays: 3, bestFor: "x", matchScore: score, matchReasons: ["x"],
  watchOut: "", recommended, firstOrderEstimateAed: 100, firstOrderBasis: "x",
});
const category = (label: string) => ({ label, summary: "s", rfqNeed: "n", rfqQuestions: ["q"] });
const base: SuppliersOutput = {
  intro: "i",
  categories: [category("Coffee beans")],
  options: [option("Coffee beans", "Roaster", 80, true)],
};
const cups: SupplierItemOutput = {
  category: category("Disposable cups"),
  options: [option("whatever", "Packaging wholesaler", 70), option("whatever", "Online marketplace", 90)],
};

describe("supplier items", () => {
  it("adds a category for the item, files its options under it and keeps the rest", () => {
    const next = withSupplierItem(base, "cups", cups);
    expect(next.categories.map((c) => c.label)).toEqual(["Coffee beans", "Disposable cups"]);
    expect(next.options.filter((o) => o.category === "Disposable cups")).toHaveLength(2);
    expect(next.options[0]).toEqual(base.options[0]);
    expect(next.requested).toEqual([{ item: "cups", label: "Disposable cups" }]);
  });

  it("recommends the best match when Claude marked none", () => {
    const next = withSupplierItem(base, "cups", cups);
    const picked = next.options.filter((o) => o.category === "Disposable cups" && o.recommended);
    expect(picked.map((o) => o.name)).toEqual(["Online marketplace"]);
  });

  it("never duplicates a category name", () => {
    const next = withSupplierItem(base, "beans", { ...cups, category: category("Coffee beans") });
    expect(next.categories.map((c) => c.label)).toEqual(["Coffee beans", "Coffee beans (beans)"]);
  });

  it("removes a category, its options and its request", () => {
    const next = withoutSupplierCategory(withSupplierItem(base, "cups", cups), "Disposable cups");
    expect(next.categories.map((c) => c.label)).toEqual(["Coffee beans"]);
    expect(next.options).toEqual(base.options);
    expect(next.requested).toEqual([]);
  });

  it("relinks requested items after the section is rebuilt", () => {
    const rebuilt = { ...base, categories: [category("Coffee beans"), category("Paper cups and lids")] };
    expect(relinkRequested(rebuilt, ["cups", "aprons"]).requested).toEqual([
      { item: "cups", label: "Paper cups and lids" },
      { item: "aprons", label: "aprons" },
    ]);
  });

  it("cleans typed items", () => {
    expect(cleanItem("  staff   shirts ")).toBe("staff shirts");
    expect(cleanItem("x".repeat(80))).toHaveLength(60);
  });
});
