import { describe, expect, it } from "vitest";
import { moduleKeys, type ModuleKey } from "@/features/plan-modules/types";
import { revisionsAtVersion } from "./history";

const versions = [
  { id: "v1", version: 1 },
  { id: "v2", version: 2 },
  { id: "v3", version: 3 },
];
// Version 1 made every module; version 2 (a budget edit) remade four; version 3 remade financials again.
const revisions = [
  ...moduleKeys.map((k) => ({ id: `${k}@1`, module_key: k, core_version_id: "v1", created_at: "2026-11-01T10:00:00Z" })),
  ...(["assessment", "financials", "narrative", "suppliers"] as ModuleKey[]).map((k) => ({
    id: `${k}@2`,
    module_key: k,
    core_version_id: "v2",
    created_at: "2026-11-02T10:00:00Z",
  })),
  { id: "financials@3", module_key: "financials" as ModuleKey, core_version_id: "v3", created_at: "2026-11-03T10:00:00Z" },
];

describe("the plan at an earlier version", () => {
  it("takes the version's own revisions, and earlier ones for modules it didn't remake", () => {
    const at2 = revisionsAtVersion(versions, revisions, 2)!;
    expect(at2.get("financials")!.id).toBe("financials@2");
    expect(at2.get("setup")!.id).toBe("setup@1");
    expect(at2.get("marketing_strategy")!.id).toBe("marketing_strategy@1");
  });

  it("never uses a revision made after that version", () => {
    expect(revisionsAtVersion(versions, revisions, 1)!.get("financials")!.id).toBe("financials@1");
    expect(revisionsAtVersion(versions, revisions, 3)!.get("financials")!.id).toBe("financials@3");
  });

  it("gives nothing when a module is missing", () => {
    expect(revisionsAtVersion(versions, revisions.filter((r) => r.module_key !== "setup"), 2)).toBeNull();
  });
});
