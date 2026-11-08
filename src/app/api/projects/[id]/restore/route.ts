import { NextResponse } from "next/server";
import { z } from "zod";
import { profileValue, type LaunchProfile } from "@/features/launch-profile/profile";
import { moduleDefinitions } from "@/features/plan-modules/registry";
import { moduleKeys, type ModuleKey } from "@/features/plan-modules/types";
import { revisionsAtVersion } from "@/features/projects/history";
import { loadProject } from "@/features/projects/server";
import { fail } from "@/lib/server/assessmentOutput";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ version: z.number().int().min(1) });

type Version = { id: string; version: number; idea: string; answers: LaunchProfile; core_info: unknown };
type Revision = { id: string; module_key: ModuleKey; output: unknown; source_locale: string; core_version_id: string; created_at: string };

/**
 * Restores an earlier version of a project: its answers and the plan as it
 * stood then, copied into a new current version (no new AI work). The
 * version being replaced stays in the history.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseConfig()) return fail("Accounts aren't available right now.", 503);
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("Please log in again.", 401);
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return fail("Invalid request.", 400);

  const loaded = await loadProject(supabase, (await params).id);
  if (!loaded) return fail("Project not found.", 404);
  const { project } = loaded;

  const [{ data: versions }, { data: revisions }] = await Promise.all([
    supabase.from("core_versions").select("id, version, idea, answers, core_info").eq("project_id", project.id).returns<Version[]>(),
    supabase
      .from("module_revisions")
      .select("id, module_key, output, source_locale, core_version_id, created_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
      .returns<Revision[]>(),
  ]);
  const target = versions?.find((v) => v.version === body.data.version);
  if (!target) return fail("Project not found.", 404);

  const chosen = revisionsAtVersion(versions ?? [], revisions ?? [], target.version);
  if (!chosen) return fail("Something went wrong preparing the assessment.", 409);

  const next = Math.max(...(versions ?? []).map((v) => v.version)) + 1;
  const { data: restored, error: versionError } = await supabase
    .from("core_versions")
    .insert({ project_id: project.id, version: next, idea: target.idea, answers: target.answers, core_info: target.core_info })
    .select("id")
    .single();
  if (versionError || !restored) return fail("Something went wrong preparing the assessment.", 500);

  const ids = Object.fromEntries(moduleKeys.map((k) => [k, crypto.randomUUID()])) as Record<ModuleKey, string>;
  const { error: copyError } = await supabase.from("module_revisions").insert(
    moduleKeys.map((k) => ({
      id: ids[k],
      project_id: project.id,
      module_key: k,
      output: chosen.get(k)!.output,
      core_version_id: restored.id,
      upstream_revision_ids: Object.fromEntries(moduleDefinitions[k].dependsOn.map((u) => [u, ids[u]])),
      source_locale: chosen.get(k)!.source_locale,
    })),
  );
  if (copyError) return fail("Something went wrong preparing the assessment.", 500);

  // Keep the saved translations of the restored plan, so both languages open instantly.
  const sourceIds = moduleKeys.map((k) => chosen.get(k)!.id);
  const { data: translations } = await supabase
    .from("module_translations")
    .select("revision_id, locale, output")
    .in("revision_id", sourceIds)
    .returns<{ revision_id: string; locale: string; output: unknown }[]>();
  const newIdFor = new Map(moduleKeys.map((k) => [chosen.get(k)!.id, ids[k]]));
  if (translations?.length) {
    await supabase
      .from("module_translations")
      .insert(translations.map((tr) => ({ revision_id: newIdFor.get(tr.revision_id), locale: tr.locale, output: tr.output })));
  }

  const business = profileValue(target.answers, "business");
  await supabase
    .from("projects")
    .update({
      current_core_version_id: restored.id,
      status: "ready",
      ...(business && business !== project.name ? { name: business.slice(0, 120), name_translations: {} } : {}),
    })
    .eq("id", project.id);
  return NextResponse.json({ status: "restored", version: next });
}
