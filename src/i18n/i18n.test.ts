import { describe, expect, it } from "vitest";
import { ar } from "./dictionaries/ar";
import { en } from "./dictionaries/en";
import { displayError, displayLabel, displayProfileLine, displayValue } from "./index";

/** Every key path in a dictionary, with arrays compared by length. */
function shape(value: unknown, path = ""): string[] {
  if (typeof value === "function") return [`${path}()`];
  if (Array.isArray(value)) return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k));
  }
  return [path];
}

// Maps of stored values to labels may differ between languages (English shows values as stored).
const ARBITRARY_MAPS = ["profile.values", "errors", "onboarding.reactions", "marketing.built.postLabels"];
const fixed = (paths: string[]) => paths.filter((p) => !ARBITRARY_MAPS.some((m) => p.startsWith(m)));

describe("dictionaries", () => {
  it("Arabic has exactly the same keys, lists and functions as English", () => {
    expect(fixed(shape(ar))).toEqual(fixed(shape(en)));
  });

  it("has Arabic reactions for every English reaction", () => {
    for (const [question, reactions] of Object.entries(en.onboarding.reactions)) {
      expect(Object.keys(ar.onboarding.reactions[question] ?? {})).toEqual(Object.keys(reactions));
    }
  });

  it("names the product KHITTA, not Ibda", () => {
    const text = JSON.stringify([en, ar], (_, v) => (typeof v === "function" ? v.toString() : v));
    expect(text).not.toMatch(/\bIbda\b/);
    expect(en.common.brand).toBe("KHITTA");
    expect(ar.common.brandArabic).toBe("خِطّة");
  });
});

describe("formatting", () => {
  it("formats AED for each language, keeping numbers left to right in Arabic", () => {
    expect(en.fmt.aed(30000)).toBe("AED 30,000");
    expect(en.fmt.aed(-1500)).toBe("−AED 1,500");
    expect(en.fmt.aedRange(600, 1000)).toBe("AED 600–1,000");
    expect(ar.fmt.aed(30000)).toBe("⁦30,000⁩ درهم");
    expect(ar.fmt.aedRange(600, 1000)).toBe("⁦600–1,000⁩ درهم");
  });

  it("joins lists naturally in each language", () => {
    expect(en.fmt.list(["a", "b", "c"])).toBe("a, b and c");
    expect(ar.fmt.list(["الموقع", "الميزانية"])).toBe("الموقع والميزانية");
    expect(ar.fmt.list(["baking tools", "packaging"])).toBe("baking tools و packaging");
  });
});

describe("display helpers", () => {
  it("shows stored English answers in Arabic, and free text as entered", () => {
    expect(displayValue(ar, "Online only")).toBe("أونلاين فقط");
    expect(displayValue(ar, "Dubai")).toBe("دبي");
    expect(displayValue(ar, "AED 15,000")).toBe(ar.fmt.aed(15000));
    expect(displayValue(ar, "Home bakery")).toBe("Home bakery");
    expect(displayValue(en, "Online only")).toBe("Online only");
    expect(displayValue(en, "AED 15,000")).toBe("AED 15,000");
  });

  it("labels profile fields and builds the profile line", () => {
    const profile = [
      { id: "business", value: "Home bakery" },
      { id: "location", value: "Dubai" },
      { id: "budget", value: "AED 15,000" },
    ];
    expect(displayLabel(ar, "channel", "Sales channel")).toBe("قناة البيع");
    expect(displayLabel(ar, "unknown", "Fallback")).toBe("Fallback");
    expect(displayProfileLine(en, profile)).toBe("Home bakery · Dubai · AED 15,000");
    expect(displayProfileLine(ar, profile)).toBe(`Home bakery · دبي · ${ar.fmt.aed(15000)}`);
  });

  it("translates known API errors and passes unknown ones through", () => {
    expect(displayError(ar, "Invalid onboarding answers.")).toBe("إجابات الإعداد غير صالحة.");
    expect(displayError(ar, "Something unexpected")).toBe("Something unexpected");
    expect(displayError(en, "Invalid onboarding answers.")).toBe("Invalid onboarding answers.");
  });
});
