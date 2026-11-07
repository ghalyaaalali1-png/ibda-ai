import { describe, expect, it } from "vitest";
import type { LaunchProfile } from "@/features/launch-profile/profile";
import { dictionaries } from "@/i18n";
import { updatedOn } from "./format";
import { localizedAnswers } from "./localize";
import { isProjectId, projectRoutes } from "./types";

const answers: LaunchProfile = [
  { id: "business", label: "Business", value: "Specialty coffee kiosk" },
  { id: "location", label: "Location", value: "Abu Dhabi" },
];

describe("a saved project's business name", () => {
  it("shows the typed name in its own language", () => {
    const r = localizedAnswers(answers, {}, "en");
    expect(r).toEqual({ profile: answers, nameReady: true });
  });

  it("waits for a translation in the other language, then uses it", () => {
    expect(localizedAnswers(answers, {}, "ar").nameReady).toBe(false);
    const r = localizedAnswers(answers, { ar: "كشك قهوة مختصة" }, "ar");
    expect(r.nameReady).toBe(true);
    expect(r.profile[0].value).toBe("كشك قهوة مختصة");
    expect(r.profile[1].value).toBe("Abu Dhabi");
  });
});

describe("last updated", () => {
  const now = new Date("2026-11-05T10:00:00Z");
  it("says today and yesterday in each language", () => {
    expect(updatedOn("2026-11-05T06:00:00Z", "en", dictionaries.en, now)).toBe("today");
    expect(updatedOn("2026-11-04T06:00:00Z", "ar", dictionaries.ar, now)).toBe("أمس");
  });

  it("gives older dates as day and month, on the UAE calendar", () => {
    expect(updatedOn("2026-10-20T06:00:00Z", "en", dictionaries.en, now)).toBe("20 October");
    expect(updatedOn("2026-10-20T06:00:00Z", "ar", dictionaries.ar, now)).toMatch(/20 أكتوبر/);
    // 22:30 UTC on 19 October is already 20 October in Dubai.
    expect(updatedOn("2026-10-19T22:30:00Z", "en", dictionaries.en, now)).toBe("20 October");
    expect(updatedOn("2025-10-20T06:00:00Z", "en", dictionaries.en, now)).toBe("20 October 2025");
  });
});

describe("project links", () => {
  it("keeps every page of the journey inside the project", () => {
    const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
    expect(isProjectId(id)).toBe(true);
    expect(isProjectId("../plan")).toBe(false);
    expect(Object.values(projectRoutes(id)).every((path) => path.startsWith(`/projects/${id}`))).toBe(true);
  });
});
