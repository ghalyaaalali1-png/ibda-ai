import { describe, expect, it } from "vitest";
import { buildLaunchPack } from "@/features/launch-pack/buildLaunchPack";
import { dictionaries } from "@/i18n";
import { englishLeftovers } from "@/test/englishLeftovers";
import { demoFor } from "./localizedDemo";

// Fictional supplier brand names stay as they are.
const brandWords = demoFor("en").suppliers.suppliers.map((s) => s.name);

/** Collects every string and number in a value, in order. */
const numbersIn = (value: unknown): number[] =>
  typeof value === "number"
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(numbersIn)
      : value && typeof value === "object"
        ? Object.values(value).flatMap(numbersIn)
        : [];

describe("Arabic demo", () => {
  const en = demoFor("en");
  const ar = demoFor("ar");

  it("has no English text left in any screen", () => {
    const t = dictionaries.ar;
    const pack = buildLaunchPack({ ...ar, suppliers: { ...ar.suppliers, sourceNote: t.suppliers.demo.sourceNote } }, t);
    const leftovers = [
      ...englishLeftovers(ar.plan, brandWords, "plan"),
      // The screen text the Suppliers screen takes from the dictionary for the demo.
      ...englishLeftovers(
        { ...ar.suppliers, intro: "", sourceNote: "", supplierBadge: "", contactNote: "", shortlistCriteria: "", allocationLabel: "", profileLine: "", brief: { ...ar.suppliers.brief, highlights: t.suppliers.demo.highlights } },
        brandWords,
        "suppliers",
      ),
      ...englishLeftovers(ar.marketing, brandWords, "marketing"),
      // Assumption labels are codes; the launch pack words them from the dictionary.
      ...englishLeftovers({ ...ar.extras, assumptions: ar.extras.assumptions.map((a) => a.text) }, brandWords, "extras"),
      ...englishLeftovers(pack, brandWords, "pack"),
    ];
    expect(leftovers).toEqual([]);
  });

  it("keeps every figure of the English demo", () => {
    expect(numbersIn(ar)).toEqual(numbersIn(en));
  });
});
