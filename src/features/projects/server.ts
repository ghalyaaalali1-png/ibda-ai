import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssessmentRequest } from "@/features/assessment/schema";
import { profileValue, type LaunchProfile } from "@/features/launch-profile/profile";
import { assembleAssessment } from "@/features/plan-modules/assemble";
import { moduleKeys, type ModuleKey, type ModuleOutputs } from "@/features/plan-modules/types";
import { coreInfoFromProfile } from "@/features/project/coreInfo";
import type { Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { localizedAnswers } from "./localize";
import { isProjectId, type HistoryEntry, type ProjectStatus, type ProjectSummary, type ProjectView } from "./types";

/*
 * Saved projects, read and written as the signed-in user: Row Level Security
 * limits every query to their own rows, so a project id from someone else
 * simply isn't found.
 */

type Db = SupabaseClient;

type ProjectRow = {
  id: string;
  name: string;
  name_translations: Partial<Record<Locale, string>>;
  status: ProjectStatus;
  current_core_version_id: string | null;
  updated_at: string;
};

export type CoreVersionRow = { id: string; idea: string; answers: LaunchProfile };

export type RevisionRow = {
  id: string;
  module_key: ModuleKey;
  output: unknown;
  source_locale: Locale;
};

const NAME_LIMIT = 120;

/** A new project from the founder's onboarding answers, with its first core version. Returns its id. */
export async function createProject({ idea, profile }: AssessmentRequest): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const name = (profileValue(profile, "business") || idea).trim().slice(0, NAME_LIMIT) || "My business";
  const { data: project, error } = await supabase.from("projects").insert({ name }).select("id").single();
  if (error || !project) throw new Error(`Project not created: ${error?.message}`);

  const { data: core, error: coreError } = await supabase
    .from("core_versions")
    .insert({ project_id: project.id, version: 1, idea, answers: profile, core_info: coreInfoFromProfile(idea, profile) })
    .select("id")
    .single();
  if (coreError || !core) throw new Error(`Core version not saved: ${coreError?.message}`);

  await supabase.from("projects").update({ current_core_version_id: core.id }).eq("id", project.id);
  return project.id as string;
}

/** The signed-in user's projects, most recently updated first. */
export async function listProjects(): Promise<ProjectSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name, name_translations, status, updated_at, core:core_versions!projects_current_core_version_fkey(answers)")
    .neq("status", "archived")
    .order("updated_at", { ascending: false });
  return (data ?? []).map((row) => {
    const core = (Array.isArray(row.core) ? row.core[0] : row.core) as { answers: LaunchProfile } | null;
    return {
      id: row.id,
      name: row.name,
      nameTranslations: row.name_translations,
      status: row.status,
      answers: core?.answers ?? [],
      updatedAt: row.updated_at,
    } as ProjectSummary;
  });
}

/** The project and its current core version, or null if it isn't this user's (or doesn't exist). */
export async function loadProject(supabase: Db, id: string) {
  if (!isProjectId(id)) return null;
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, name_translations, status, current_core_version_id, updated_at")
    .eq("id", id)
    .maybeSingle<ProjectRow>();
  if (!project?.current_core_version_id) return null;
  const { data: core } = await supabase
    .from("core_versions")
    .select("id, idea, answers")
    .eq("id", project.current_core_version_id)
    .maybeSingle<CoreVersionRow>();
  return core ? { project, core } : null;
}

/**
 * The newest revision of every module, or null while any module has none.
 * After an edit, modules that didn't need updating keep their earlier
 * revision; the ones that did have a newer one.
 */
export async function latestRevisions(supabase: Db, projectId: string) {
  const { data } = await supabase
    .from("module_revisions")
    .select("id, module_key, output, source_locale")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .returns<RevisionRow[]>();
  const latest = new Map<ModuleKey, RevisionRow>();
  for (const row of data ?? []) if (!latest.has(row.module_key)) latest.set(row.module_key, row);
  return moduleKeys.every((k) => latest.has(k)) ? latest : null;
}

/** Saved translations of these revisions into a language, by revision id. */
export async function translationsOf(supabase: Db, revisionIds: string[], locale: Locale) {
  const { data } = await supabase
    .from("module_translations")
    .select("revision_id, output")
    .in("revision_id", revisionIds)
    .eq("locale", locale)
    .returns<{ revision_id: string; output: unknown }[]>();
  return new Map((data ?? []).map((row) => [row.revision_id, row.output]));
}

/**
 * The module outputs in a language: each as written if it was written in it,
 * otherwise its saved translation; null while any translation is missing.
 */
export async function modulesIn(supabase: Db, revisions: Map<ModuleKey, RevisionRow>, locale: Locale) {
  const entries = [...revisions.entries()];
  const foreign = entries.filter(([, r]) => r.source_locale !== locale).map(([, r]) => r.id);
  const translated = foreign.length ? await translationsOf(supabase, foreign, locale) : new Map<string, unknown>();
  if (!foreign.every((id) => translated.has(id))) return null;
  return Object.fromEntries(
    entries.map(([k, r]) => [k, r.source_locale === locale ? r.output : translated.get(r.id)]),
  ) as ModuleOutputs;
}

/** Everything a project screen shows, in the interface language; null if not found. */
export async function projectView(id: string, locale: Locale): Promise<ProjectView | null> {
  const supabase = await createSupabaseServerClient();
  const loaded = await loadProject(supabase, id);
  if (!loaded) return null;
  const { project, core } = loaded;
  const { profile, nameReady } = localizedAnswers(core.answers, project.name_translations, locale);
  const revisions = await latestRevisions(supabase, project.id);
  const modules = revisions ? await modulesIn(supabase, revisions, locale) : null;
  const assessment = modules ? assembleAssessment(modules) : null;
  return {
    id: project.id,
    name: project.name,
    status: project.status,
    idea: core.idea,
    answers: core.answers,
    profile,
    state: !revisions ? "notGenerated" : assessment && nameReady ? "ready" : "needsTranslation",
    assessment: assessment && nameReady ? assessment : null,
    updatedAt: project.updated_at,
  };
}

/**
 * The project's answer history, newest first: every version a plan was made
 * from (an edit that failed to update the plan isn't listed).
 */
export async function projectHistory(id: string): Promise<HistoryEntry[]> {
  const supabase = await createSupabaseServerClient();
  const loaded = await loadProject(supabase, id);
  if (!loaded) return [];
  const [{ data: versions }, { data: used }] = await Promise.all([
    supabase
      .from("core_versions")
      .select("id, version, idea, answers, created_at")
      .eq("project_id", id)
      .order("version", { ascending: true })
      .returns<(CoreVersionRow & { version: number; created_at: string })[]>(),
    supabase.from("module_revisions").select("core_version_id").eq("project_id", id).returns<{ core_version_id: string }[]>(),
  ]);
  const madePlans = new Set((used ?? []).map((r) => r.core_version_id));
  const applied = (versions ?? []).filter((v) => v.version === 1 || madePlans.has(v.id));

  return applied
    .map((v, i) => {
      const before = applied[i - 1];
      const changes: HistoryEntry["changes"] = [];
      if (before) {
        if (before.idea.trim() !== v.idea.trim()) changes.push({ id: "idea", label: "Idea", from: before.idea, to: v.idea });
        for (const field of v.answers) {
          const old = profileValue(before.answers, field.id);
          if (old !== field.value) changes.push({ id: field.id, label: field.label, from: old ?? "", to: field.value });
        }
      }
      return { version: v.version, createdAt: v.created_at, current: v.id === loaded.core.id, changes };
    })
    .reverse();
}
