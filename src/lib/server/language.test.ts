import { describe, expect, it } from "vitest";
import { inLanguage, translationSystemPrompt } from "./language";

describe("output language", () => {
  it("leaves English prompts exactly as they are", () => {
    expect(inLanguage("You are KHITTA.", "en")).toBe("You are KHITTA.");
    expect(inLanguage("You are KHITTA.")).toBe("You are KHITTA.");
  });

  it("tells Claude to write Arabic while keeping codes and ids as specified", () => {
    const prompt = inLanguage("You are KHITTA.", "ar");
    expect(prompt.startsWith("You are KHITTA.")).toBe(true);
    expect(prompt).toContain("OUTPUT LANGUAGE: ARABIC");
    expect(prompt).toContain("Keep enum values, codes and ids exactly");
  });

  it("names the target language for translations", () => {
    expect(translationSystemPrompt("ar")).toContain("into Arabic");
    expect(translationSystemPrompt("en")).toContain("into English");
  });
});
