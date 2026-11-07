import { NextResponse } from "next/server";
import { assessmentRequestSchema } from "@/features/assessment/schema";
import { profileValue } from "@/features/launch-profile/profile";
import { affectedModules } from "@/features/plan-modules/dependencies";
import { moduleDefinitions } from "@/features/plan-modules/registry";
import type { ModuleKey, ModuleOutputs } from "@/features/plan-modules/types";
import { changedFields, coreInfoFromProfile, coreInfoSchema } from "@/features/project/coreInfo";
import { latestRevisions, loadProject } from "@/features/projects/server";
import { getLocale } from "@/i18n/server";
import { hasAnthropicKey, IBDA_MODEL } from "@/lib/server/anthropic";
import { businessNameIn, fail, generationFailure, plainLabels } from "@/lib/server/assessmentOutput";
import { runModules } from "@/lib/server/modules/run";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const NAME_LIMIT = 120;

/**
 * Saves edited answers as the project's next core version, then regenerates
 * only the plan modules those changes affect (in dependency order), keeping
 * every other module as it was. Earlier versions and revisions stay in the
 * project's history.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasAnthropicKey()) return fail("The AI service isn't configured.", 503);
  if (!hasSupabaseConfig()) return fail("Accounts aren't available right now.", 503);
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("Please log in again.", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }
  const input = assessmentRequestSchema.safeParse(body);
  if (!input.success) return fail("Invalid onboarding answers.", 400);
  const { idea, profile } = input.data;

  const loaded = await loadProject(supabase, (await params).id);
  if (!loaded) return fail("Project not found.", 404);
  const { project, core } = loaded;
  const locale = await getLocale();

  const { data: current } = await supabase
    .from("core_versions")
    .select("version, core_info")
    .eq("id", core.id)
    .single<{ version: number; core_info: unknown }>();
  const previous = coreInfoSchema.safeParse(current?.core_info);
  const next = coreInfoFromProfile(idea, profile);
  const changed = previous.success ? changedFields(previous.data, next) : (Object.keys(next) as (keyof typeof next)[]);
  if (changed.length === 0) return NextResponse.json({ status: "unchanged" });

  const revisions = await latestRevisions(supabase, project.id);
  if (!revisions) return fail("The assessment couldn't be completed.", 409);
  const keys = affectedModules(changed);

  // The new version of the answers becomes the project's current one (numbered after any earlier attempt).
  const { data: latest } = await supabase
    .from("core_versions")
    .select("version")
    .eq("project_id", project.id)
    .order("version", { ascending: false })
    .limit(1)
    .single<{ version: number }>();
  const { data: version, error: versionError } = await supabase
    .from("core_versions")
    .insert({ project_id: project.id, version: (latest?.version ?? current?.version ?? 1) + 1, idea, answers: profile, core_info: next })
    .select("id")
    .single();
  if (versionError || !version) return fail("Something went wrong preparing the assessment.", 500);
  const business = profileValue(profile, "business");
  const renamed = business !== profileValue(core.answers, "business");
  await supabase
    .from("projects")
    .update({
      current_core_version_id: version.id,
      status: "generating",
      ...(renamed && business ? { name: business.trim().slice(0, NAME_LIMIT), name_translations: {} } : {}),
    })
    .eq("id", project.id);

  const { data: run } = await supabase
    .from("generation_runs")
    .insert({ project_id: project.id, core_version_id: version.id, locale, module_keys: keys, model: IBDA_MODEL })
    .select("id")
    .single();

  try {
    // Modules not being regenerated feed the ones that read them, as saved.
    const existing = Object.fromEntries([...revisions.entries()].map(([k, r]) => [k, r.output])) as Partial<ModuleOutputs>;
    const generated = await runModules({ idea, profile, locale }, keys, existing);
    const ids = Object.fromEntries(keys.map((k) => [k, crypto.randomUUID()])) as Partial<Record<ModuleKey, string>>;
    const { error: saveError } = await supabase.from("module_revisions").insert(
      keys.map((k) => ({
        id: ids[k],
        project_id: project.id,
        module_key: k,
        output: plainLabels(generated[k], locale),
        core_version_id: version.id,
        generation_run_id: run?.id ?? null,
        upstream_revision_ids: Object.fromEntries(
          moduleDefinitions[k].dependsOn.map((u) => [u, ids[u] ?? revisions.get(u)!.id]),
        ),
        source_locale: locale,
        model: IBDA_MODEL,
      })),
    );
    if (saveError) throw new Error(`Plan not saved: ${saveError.message}`);

    if (run) await supabase.from("generation_runs").update({ status: "succeeded", finished_at: new Date().toISOString() }).eq("id", run.id);
    const businessName = renamed ? await businessNameIn(business, locale) : undefined;
    await supabase
      .from("projects")
      .update({ status: "ready", ...(businessName ? { name_translations: { [locale]: businessName } } : {}) })
      .eq("id", project.id);
    return NextResponse.json({ status: "updated", updated: keys });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown error";
    if (run) await supabase.from("generation_runs").update({ status: "failed", error: message, finished_at: new Date().toISOString() }).eq("id", run.id);
    // Back to the previous answers: their plan is still complete, and the edit can simply be tried again.
    await supabase
      .from("projects")
      .update({ current_core_version_id: core.id, status: "ready", name: project.name, name_translations: project.name_translations })
      .eq("id", project.id);
    return generationFailure(error);
  }
}
