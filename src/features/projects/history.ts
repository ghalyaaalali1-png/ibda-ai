import { moduleKeys, type ModuleKey } from "@/features/plan-modules/types";

type VersionRef = { id: string; version: number };
type RevisionRef = { module_key: ModuleKey; core_version_id: string; created_at: string };

/**
 * The plan as it stood at a version: for each module, its newest revision
 * made for that version or an earlier one (modules an edit didn't touch keep
 * an earlier revision). Null if any module has none.
 */
export function revisionsAtVersion<R extends RevisionRef>(versions: VersionRef[], revisions: R[], version: number) {
  const versionOf = new Map(versions.map((v) => [v.id, v.version]));
  const newestFirst = [...revisions].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const chosen = new Map<ModuleKey, R>();
  for (const r of newestFirst) {
    if (!chosen.has(r.module_key) && (versionOf.get(r.core_version_id) ?? Infinity) <= version) chosen.set(r.module_key, r);
  }
  return moduleKeys.every((k) => chosen.has(k)) ? chosen : null;
}
