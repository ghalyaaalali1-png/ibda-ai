import { NextResponse } from "next/server";
import { profileValue } from "@/features/launch-profile/profile";
import { assembleAssessment } from "@/features/plan-modules/assemble";
import { moduleDefinitions } from "@/features/plan-modules/registry";
import { moduleKeys, type ModuleKey, type ModuleOutputs } from "@/features/plan-modules/types";
import { latestRevisions, loadProject } from "@/features/projects/server";
import { getLocale } from "@/i18n/server";
import { hasAnthropicKey, IBDA_MODEL } from "@/lib/server/anthropic";
import { businessNameIn, fail, generationFailure, plainLabels } from "@/lib/server/assessmentOutput";
import { runAllModules } from "@/lib/server/modules/run";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withinGenerationLimit } from "@/features/projects/limits";
import { LIMIT_MESSAGE } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// A run older than this is treated as abandoned, so the founder can start again.
const RUN_TIMEOUT_MS = 3 * 60 * 1000;

/**
 * Generates a saved project's plan in the interface language and saves it:
 * one revision per plan module, linked to the core version it was made from
 * and the generation run. Answers "ready" if the plan already exists and
 * "running" while another request is generating it.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasAnthropicKey()) return fail("The AI service isn't configured.", 503);
  if (!hasSupabaseConfig()) return fail("Accounts aren't available right now.", 503);
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("Please log in again.", 401);

  const loaded = await loadProject(supabase, (await params).id);
  if (!loaded) return fail("Project not found.", 404);
  const { project, core } = loaded;
  const locale = await getLocale();

  if (await latestRevisions(supabase, project.id)) return NextResponse.json({ status: "ready" });

  const { data: running } = await supabase
    .from("generation_runs")
    .select("id")
    .eq("project_id", project.id)
    .eq("status", "running")
    .gt("started_at", new Date(Date.now() - RUN_TIMEOUT_MS).toISOString())
    .limit(1);
  if (running?.length) return NextResponse.json({ status: "running" }, { status: 409 });

  if (!(await withinGenerationLimit(supabase))) return fail(LIMIT_MESSAGE, 429);
  const { data: run, error: runError } = await supabase
    .from("generation_runs")
    .insert({ project_id: project.id, core_version_id: core.id, locale, module_keys: [...moduleKeys], model: IBDA_MODEL })
    .select("id")
    .single();
  if (runError || !run) return fail("Something went wrong preparing the assessment.", 500);
  await supabase.from("projects").update({ status: "generating" }).eq("id", project.id);

  try {
    const generated = await runAllModules({ idea: core.idea, profile: core.answers, locale });
    const outputs = Object.fromEntries(
      moduleKeys.map((k) => [k, plainLabels(generated[k], locale)]),
    ) as ModuleOutputs;

    // Ids up front, so each revision can record the revisions it read.
    const ids = Object.fromEntries(moduleKeys.map((k) => [k, crypto.randomUUID()])) as Record<ModuleKey, string>;
    const { error: saveError } = await supabase.from("module_revisions").insert(
      moduleKeys.map((k) => ({
        id: ids[k],
        project_id: project.id,
        module_key: k,
        output: outputs[k],
        core_version_id: core.id,
        generation_run_id: run.id,
        upstream_revision_ids: Object.fromEntries(moduleDefinitions[k].dependsOn.map((u) => [u, ids[u]])),
        source_locale: locale,
        model: IBDA_MODEL,
      })),
    );
    if (saveError) throw new Error(`Plan not saved: ${saveError.message}`);

    await supabase.from("generation_runs").update({ status: "succeeded", finished_at: new Date().toISOString() }).eq("id", run.id);
    const businessName = await businessNameIn(profileValue(core.answers, "business"), locale);
    await supabase
      .from("projects")
      .update({
        status: "ready",
        ...(businessName ? { name_translations: { ...project.name_translations, [locale]: businessName } } : {}),
      })
      .eq("id", project.id);

    return NextResponse.json({
      status: "ready",
      assessment: assembleAssessment(outputs),
      ...(businessName ? { businessName } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown error";
    await supabase.from("generation_runs").update({ status: "failed", error: message, finished_at: new Date().toISOString() }).eq("id", run.id);
    await supabase.from("projects").update({ status: "failed" }).eq("id", project.id);
    return generationFailure(error);
  }
}
