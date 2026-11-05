import { describe, expect, it } from "vitest";
import { safeNext } from "./redirects";

describe("where to go after signing in", () => {
  it("keeps paths inside KHITTA", () => {
    expect(safeNext("/projects")).toBe("/projects");
    expect(safeNext("/plan?x=1")).toBe("/plan?x=1");
  });

  it("never sends people to another site", () => {
    for (const next of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "", null, undefined]) {
      expect(safeNext(next)).toBe("/projects");
    }
  });
});
