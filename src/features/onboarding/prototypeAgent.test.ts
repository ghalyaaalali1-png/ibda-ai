import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prototypeAgent } from "./prototypeAgent";

// The agent pauses to feel considered; skip the wait.
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

async function analyze(idea: string) {
  const pending = prototypeAgent.analyzeIdea(idea);
  await vi.runAllTimersAsync();
  const analysis = await pending;
  return {
    facts: Object.fromEntries(analysis.facts.map((f) => [f.id, f.value])),
    questions: analysis.questions.map((q) => q.id),
  };
}

describe("prototypeAgent", () => {
  it("reads an English idea as before", async () => {
    expect(
      await analyze("I want to open a specialty coffee kiosk in a business park in Abu Dhabi with a budget of AED 60,000."),
    ).toEqual({
      facts: { business: "Specialty coffee kiosk", location: "Abu Dhabi", budget: "AED 60,000", channel: "Physical location" },
      questions: [],
    });
  });

  it("reads an Arabic idea, storing what it finds in English", async () => {
    expect(await analyze("أبي أفتح مخبز منزلي في دبي وأبيع عبر انستقرام بميزانية ١٥٬٠٠٠ درهم")).toEqual({
      facts: { business: "مخبز منزلي", location: "Dubai", budget: "AED 15,000", channel: "Online only" },
      questions: [],
    });
  });

  it("understands Arabic thousands and other emirates", async () => {
    const { facts } = await analyze("أريد افتتاح كافيه في الشارقة برأس مال 60 ألف درهم");
    expect(facts).toMatchObject({ business: "كافيه", location: "Sharjah", budget: "AED 60,000", channel: "Physical location" });
  });

  it("recognises the abaya demo in Arabic", async () => {
    const { facts, questions } = await analyze("أريد إطلاق علامة عبايات أونلاين في دبي بميزانية 30,000 درهم.");
    expect(facts).toEqual({ business: "Online abaya brand", location: "Dubai", budget: "AED 30,000" });
    expect(questions).toEqual(["priceRange", "production"]);
  });
});

describe("onboarding stays short", () => {
  it("asks at most two questions, most important first", async () => {
    const { questions } = await analyze("I want to open a flower shop");
    expect(questions).toEqual(["location", "budget"]);
  });

  it("asks nothing more when the idea already says where, how much and how it sells", async () => {
    const { facts, questions } = await analyze("A home bakery in Dubai, selling online, budget AED 15,000");
    expect(questions).toEqual([]);
    expect(facts.business).toBe("Home bakery");
  });

  it("reads the business from ideas that start with it", async () => {
    expect((await analyze("مخبز منزلي في دبي، أبيع أونلاين، بميزانية 15,000 درهم")).facts.business).toBe("مخبز منزلي");
  });
});
