import { describe, expect, it } from "vitest";
import { amountAnswer } from "./amount";

describe("amountAnswer", () => {
  it.each([
    ["40000", "AED 40,000"],
    ["40,000", "AED 40,000"],
    ["AED 40,000", "AED 40,000"],
    ["40k", "AED 40,000"],
    ["٤٠٬٠٠٠", "AED 40,000"],
    ["40 ألف", "AED 40,000"],
    ["٤٠ ألف درهم", "AED 40,000"],
    ["15000.5", "AED 15,001"],
  ])("reads %s", (input, expected) => {
    expect(amountAnswer(input)).toBe(expected);
  });

  it.each(["", "abc", "0", "-500", "forty"])("rejects %s", (input) => {
    expect(amountAnswer(input)).toBeNull();
  });
});
