import "server-only";
import type { LaunchProfile } from "@/features/launch-profile/profile";
import { assembleAssessment } from "@/features/plan-modules/assemble";
import { moduleKeys, type ModuleKey, type ModuleOutputs } from "@/features/plan-modules/types";
import { locales, type Locale } from "@/i18n/config";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { localizedAnswers } from "./localize";
import { isProjectId, type ProjectView } from "./types";

type SharedPlanRow = {
  name: string;
  name_translations: Partial<Record<Locale, string>>;
  updated_at: string;
  idea: string;
  answers: LaunchProfile;
  revisions: { id: string; module_key: ModuleKey; output: unknown; source_locale: Locale }[];
  translations: { revision_id: string; locale: Locale; output: unknown }[];
};

/** Every section in one language (as written, or its saved translation), or null if any is missing. */
function modulesFor(row: SharedPlanRow, locale: Locale): ModuleOutputs | null {
  const out: Partial<Record<ModuleKey, unknown>> = {};
  for (const key of moduleKeys) {
    const revision = row.revisions.find((r) => r.module_key === key);
    if (!revision) return null;
    const output =
      revision.source_locale === locale
        ? revision.output
        : row.translations.find((t) => t.revision_id === revision.id && t.locale === locale)?.output;
    if (output === undefined) return null;
    out[key] = output;
  }
  return out as ModuleOutputs;
}

/**
 * The plan behind a share link, for anyone holding it: in the viewer's
 * language when it exists in it, otherwise in a language it's available in
 * (visitors can't start a translation). Null if the link is wrong or off.
 */
export async function sharedPlanView(token: string, preferred: Locale): Promise<{ view: ProjectView; locale: Locale } | null> {
  if (!isProjectId(token) || !hasSupabaseConfig()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("shared_plan", { token });
  const row = data as SharedPlanRow | null;
  if (error || !row) return null;

  for (const locale of [preferred, ...locales.filter((l) => l !== preferred)]) {
    const modules = modulesFor(row, locale);
    const assessment = modules ? assembleAssessment(modules) : null;
    if (!assessment) continue;
    const { profile, nameReady } = localizedAnswers(row.answers, row.name_translations, locale);
    if (!nameReady) continue;
    return {
      locale,
      view: {
        // Not the real project id: a shared view never reveals it, and has no project links.
        id: "shared",
        name: row.name,
        status: "ready",
        idea: row.idea,
        answers: row.answers,
        profile,
        state: "ready",
        assessment,
        updatedAt: row.updated_at,
        shareToken: null,
      },
    };
  }
  return null;
}
