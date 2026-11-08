import { describe, expect, it } from "vitest";
import { allowRequest, requesterKey } from "./rateLimit";

describe("AI limits", () => {
  it("allows up to the limit in the window, then refuses", () => {
    const key = `test:${Math.random()}`;
    const now = 1_000_000;
    expect([1, 2, 3].map(() => allowRequest(key, 3, 60_000, now))).toEqual([true, true, true]);
    expect(allowRequest(key, 3, 60_000, now + 1)).toBe(false);
  });

  it("allows again once the window has passed", () => {
    const key = `test:${Math.random()}`;
    expect(allowRequest(key, 1, 60_000, 0)).toBe(true);
    expect(allowRequest(key, 1, 60_000, 30_000)).toBe(false);
    expect(allowRequest(key, 1, 60_000, 60_001)).toBe(true);
  });

  it("tells people apart by account, or else by network address", () => {
    const request = new Request("http://localhost/", { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } });
    expect(requesterKey(request, "abc")).toBe("user:abc");
    expect(requesterKey(request)).toBe("ip:203.0.113.7");
  });
});
