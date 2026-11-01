import type { CoreField } from "@/features/project/coreInfo";
import { moduleDefinitions } from "./registry";
import { moduleKeys, type ModuleKey, type ModuleOutputs } from "./types";

/** Modules that read any of these core fields directly. */
export function directlyAffected(changed: readonly CoreField[]): ModuleKey[] {
  return moduleKeys.filter((key) => moduleDefinitions[key].dependsOnCore.some((field) => changed.includes(field)));
}

/** Modules to regenerate after these core fields change: the direct ones plus everything downstream of them. */
export function affectedModules(changed: readonly CoreField[]): ModuleKey[] {
  const affected = new Set(directlyAffected(changed));
  let grew = true;
  while (grew) {
    grew = false;
    for (const key of moduleKeys) {
      if (!affected.has(key) && moduleDefinitions[key].dependsOn.some((dep) => affected.has(dep))) {
        affected.add(key);
        grew = true;
      }
    }
  }
  return regenerationOrder([...affected]);
}

/**
 * These modules sorted so each comes after the modules it reads (ties keep
 * the registry order). Throws if the dependencies form a cycle.
 */
export function regenerationOrder(keys: readonly ModuleKey[]): ModuleKey[] {
  const wanted = new Set(keys);
  const ordered: ModuleKey[] = [];
  const done = new Set<ModuleKey>();
  const visiting = new Set<ModuleKey>();

  const visit = (key: ModuleKey) => {
    if (done.has(key)) return;
    if (visiting.has(key)) throw new Error(`Plan modules have a dependency cycle at "${key}".`);
    visiting.add(key);
    moduleDefinitions[key].dependsOn.forEach(visit);
    visiting.delete(key);
    done.add(key);
    if (wanted.has(key)) ordered.push(key);
  };
  moduleKeys.forEach(visit);
  return ordered;
}

/** What a change to these core fields would do: which modules update and which stay as they are. */
export function regenerationPreview(changed: readonly CoreField[]) {
  const update = affectedModules(changed);
  return { update, keep: moduleKeys.filter((key) => !update.includes(key)) };
}

export type ModuleRunner = <K extends ModuleKey>(key: K, upstream: Partial<ModuleOutputs>) => Promise<ModuleOutputs[K]>;

/**
 * Runs these modules, each as soon as the modules it reads are ready — so
 * independent modules run in parallel. Upstream modules not being run come
 * from `existing`. Rejects with the first failure.
 */
export async function runInDependencyOrder(
  keys: readonly ModuleKey[],
  run: ModuleRunner,
  existing: Partial<ModuleOutputs> = {},
): Promise<Partial<ModuleOutputs>> {
  const pending = new Map<ModuleKey, Promise<unknown>>();
  for (const key of regenerationOrder(keys)) {
    const deps = moduleDefinitions[key].dependsOn;
    const upstream = Promise.all(
      deps.map(async (dep) => {
        const value = pending.has(dep) ? await pending.get(dep) : existing[dep];
        if (value === undefined) throw new Error(`Module "${key}" needs "${dep}", which is neither being generated nor saved.`);
        return [dep, value] as const;
      }),
    );
    pending.set(key, upstream.then((entries) => run(key, Object.fromEntries(entries) as Partial<ModuleOutputs>)));
  }
  const keysInOrder = [...pending.keys()];
  const outputs = await Promise.all(keysInOrder.map((key) => pending.get(key)));
  return Object.fromEntries(keysInOrder.map((key, i) => [key, outputs[i]])) as Partial<ModuleOutputs>;
}
