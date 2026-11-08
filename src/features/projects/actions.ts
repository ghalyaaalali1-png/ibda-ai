"use server";

import { revalidatePath } from "next/cache";
import { routes } from "@/config/site";
import { z } from "zod";
import { assessmentRequestSchema, initialAssessmentSchema } from "@/features/assessment/schema";
import { splitAssessment } from "@/features/plan-modules/assemble";
import { moduleDefinitions } from "@/features/plan-modules/registry";
import { moduleKeys, type ModuleKey } from "@/features/plan-modules/types";
import { locales } from "@/i18n/config";
import { IBDA_MODEL } from "@/lib/server/anthropic";
import { currentUser } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createProject } from "./server";
import { isProjectId } from "./types";

export type SaveProjectResult =
  /** Saved: continue inside the project. */
  | { status: "saved"; id: string }
  /** No account: the journey continues in the browser session, as before. */
  | { status: "noAccount" }
  /** Signed in but not saved: the founder is told, and nothing is generated. */
  | { status: "failed" };

/** Saves a finished onboarding as a new project for the signed-in founder. */
export async function saveNewProject(input: {
  idea: string;
  profile: { id: string; label: string; value: string }[];
}): Promise<SaveProjectResult> {
  if (!(await currentUser())) return { status: "noAccount" };
  const parsed = assessmentRequestSchema.safeParse(input);
  if (!parsed.success) return { status: "failed" };
  try {
    return { status: "saved", id: await createProject(parsed.data) };
  } catch (error) {
    console.error("Project not saved", error instanceof Error ? error.message : error);
    return { status: "failed" };
  }
}

const NAME_LIMIT = 120;

/** Renames one of the signed-in founder's projects (as shown on My projects). */
export async function renameProject(id: string, name: string) {
  const trimmed = name.trim().slice(0, NAME_LIMIT);
  if (!isProjectId(id) || !trimmed || !(await currentUser())) return { ok: false };
  const supabase = await createSupabaseServerClient();
  // A name chosen by hand is shown as written, so drop any automatic translation.
  const { data } = await supabase.from("projects").update({ name: trimmed, name_translations: {} }).eq("id", id).select("id");
  revalidatePath(routes.projects);
  return { ok: Boolean(data?.length) };
}

/** Permanently deletes one of the signed-in founder's projects, with its plan and history. */
export async function deleteProject(id: string) {
  if (!isProjectId(id) || !(await currentUser())) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("projects").delete().eq("id", id).select("id");
  revalidatePath(routes.projects);
  return { ok: Boolean(data?.length) };
}

const guestPlanSchema = z.object({
  idea: z.string(),
  profile: z.array(z.object({ id: z.string(), label: z.string(), value: z.string() })),
  locale: z.enum(locales).optional(),
  assessment: initialAssessmentSchema,
  translations: z.object({ en: initialAssessmentSchema.optional(), ar: initialAssessmentSchema.optional() }).optional(),
  businessNames: z.object({ en: z.string().max(120).optional(), ar: z.string().max(120).optional() }).optional(),
});

/**
 * Saves a plan made before signing in to the founder's account, as a new
 * project with the plan (and any translations) already in it — no new AI work.
 */
export async function saveGuestPlan(input: unknown): Promise<SaveProjectResult> {
  if (!(await currentUser())) return { status: "noAccount" };
  const plan = guestPlanSchema.safeParse(input);
  const answers = assessmentRequestSchema.safeParse(input);
  if (!plan.success || !answers.success) return { status: "failed" };
  try {
    const id = await createProject(answers.data);
    const supabase = await createSupabaseServerClient();
    const { data: project } = await supabase.from("projects").select("current_core_version_id").eq("id", id).single();
    const source = plan.data.locale ?? "en";
    const modules = splitAssessment(plan.data.assessment);
    const revisionIds = Object.fromEntries(moduleKeys.map((k) => [k, crypto.randomUUID()])) as Record<ModuleKey, string>;
    const { error } = await supabase.from("module_revisions").insert(
      moduleKeys.map((k) => ({
        id: revisionIds[k],
        project_id: id,
        module_key: k,
        output: modules[k],
        core_version_id: project?.current_core_version_id,
        upstream_revision_ids: Object.fromEntries(moduleDefinitions[k].dependsOn.map((u) => [u, revisionIds[u]])),
        source_locale: source,
        model: IBDA_MODEL,
      })),
    );
    if (error) throw new Error(error.message);
    const translated = Object.entries(plan.data.translations ?? {}).filter(([locale, a]) => a && locale !== source);
    if (translated.length) {
      await supabase.from("module_translations").insert(
        translated.flatMap(([locale, a]) => {
          const parts = splitAssessment(a!);
          return moduleKeys.map((k) => ({ revision_id: revisionIds[k], locale, output: parts[k], model: IBDA_MODEL }));
        }),
      );
    }
    await supabase
      .from("projects")
      .update({ status: "ready", name_translations: plan.data.businessNames ?? {} })
      .eq("id", id);
    revalidatePath(routes.projects);
    return { status: "saved", id };
  } catch (error) {
    console.error("Guest plan not saved", error instanceof Error ? error.message : error);
    return { status: "failed" };
  }
}
