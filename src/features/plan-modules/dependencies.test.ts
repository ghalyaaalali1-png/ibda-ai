import { describe, expect, it } from "vitest";
import { coreFields } from "@/features/project/coreInfo";
import {
  affectedModules,
  regenerationOrder,
  regenerationPreview,
  runInDependencyOrder,
  type ModuleRunner,
} from "./dependencies";
import { moduleDefinitions } from "./registry";
import { moduleKeys, type ModuleKey, type ModuleOutputs } from "./types";

describe("registry", () => {
  it("defines every module under its own key with valid dependencies", () => {
    for (const key of moduleKeys) {
      const def = moduleDefinitions[key];
      expect(def.key).toBe(key);
      def.dependsOnCore.forEach((field) => expect(coreFields).toContain(field));
      def.dependsOn.forEach((dep) => expect(moduleKeys).toContain(dep));
    }
  });

  it("has no dependency cycles", () => {
    expect(regenerationOrder(moduleKeys)).toHaveLength(moduleKeys.length);
  });
});

describe("affectedModules", () => {
  it("budget: the financial plan and what reads it, nothing else", () => {
    expect(regenerationPreview(["budget"])).toEqual({
      update: ["assessment", "financials", "narrative", "suppliers"],
      keep: ["setup", "marketing_strategy", "marketing_execution", "marketing_calendar"],
    });
  });

  it("stage: only the assessment and narrative", () => {
    expect(affectedModules(["stage"])).toEqual(["assessment", "narrative"]);
  });

  it("location", () => {
    expect(affectedModules(["emirate"])).toEqual([
      "assessment",
      "financials",
      "narrative",
      "setup",
      "suppliers",
      "marketing_strategy",
      "marketing_calendar",
    ]);
  });

  it("target price", () => {
    expect(affectedModules(["targetPrice"])).toEqual(["assessment", "financials", "suppliers", "marketing_execution"]);
  });

  it("product/service: everything", () => {
    expect(affectedModules(["offering"])).toEqual([...moduleKeys]);
  });

  it("no change: nothing", () => {
    expect(affectedModules([])).toEqual([]);
  });
});

describe("regenerationOrder", () => {
  it("puts a module after the modules it reads", () => {
    expect(regenerationOrder(["suppliers", "financials"])).toEqual(["financials", "suppliers"]);
  });
});

describe("runInDependencyOrder", () => {
  const fakeOutput = (key: ModuleKey) => ({ key }) as unknown as ModuleOutputs[ModuleKey];

  it("runs independent modules at once and suppliers after financials, with its output", async () => {
    const started: ModuleKey[] = [];
    let releaseFinancials!: () => void;
    const financialsGate = new Promise<void>((resolve) => (releaseFinancials = resolve));
    let suppliersUpstream: Partial<ModuleOutputs> | undefined;

    const run = (async (key: ModuleKey, upstream: Partial<ModuleOutputs>) => {
      started.push(key);
      if (key === "financials") await financialsGate;
      if (key === "suppliers") suppliersUpstream = upstream;
      return fakeOutput(key);
    }) as ModuleRunner;

    const result = runInDependencyOrder(moduleKeys, run);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(started).toHaveLength(7);
    expect(started).not.toContain("suppliers");

    releaseFinancials();
    const outputs = await result;
    expect(Object.keys(outputs).sort()).toEqual([...moduleKeys].sort());
    expect(suppliersUpstream).toEqual({ financials: fakeOutput("financials") });
  });

  it("uses a saved upstream module when it isn't being regenerated", async () => {
    let upstreamSeen: Partial<ModuleOutputs> | undefined;
    const run = (async (key: ModuleKey, upstream: Partial<ModuleOutputs>) => {
      upstreamSeen = upstream;
      return fakeOutput(key);
    }) as ModuleRunner;
    const saved = fakeOutput("financials") as ModuleOutputs["financials"];
    await runInDependencyOrder(["suppliers"], run, { financials: saved });
    expect(upstreamSeen).toEqual({ financials: saved });
  });

  it("fails when a required upstream module is missing", async () => {
    const run = (async (key: ModuleKey) => fakeOutput(key)) as ModuleRunner;
    await expect(runInDependencyOrder(["suppliers"], run)).rejects.toThrow(/needs "financials"/);
  });

  it("rejects with the first failure, and suppliers doesn't run when financials fails", async () => {
    const started: ModuleKey[] = [];
    const run = (async (key: ModuleKey) => {
      started.push(key);
      if (key === "financials") throw new Error("financials failed");
      return fakeOutput(key);
    }) as ModuleRunner;
    await expect(runInDependencyOrder(moduleKeys, run)).rejects.toThrow("financials failed");
    expect(started).not.toContain("suppliers");
  });
});
