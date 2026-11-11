import { NextResponse } from "next/server";
import { z } from "zod";
import type { planFinancialsSchema } from "@/features/assessment/schema";
import { latestRevisions, loadProject, translationsOf } from "@/features/projects/server";
import { withinGenerationLimit } from "@/features/projects/limits";
import {
  cleanItem,
  existingCategoryFor,
  MAX_CATEGORIES,
  withoutSupplierCategory,
  withSupplierItem,
  type SuppliersOutput,
} from "@/features/suppliers/items";
import { getLocale } from "@/i18n/server";
import { hasAnthropicKey, IBDA_MODEL } from "@/lib/server/anthropic";
import { fail, generationFailure, plainLabels } from "@/lib/server/assessmentOutput";
import { generateSupplierItem } from "@/lib/server/modules/generators";
import { LIMIT_MESSAGE } from "@/lib/server/rateLimit";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("add"), item: z.string().min(1).max(200) }),
  z.object({ action: z.literal("remove"), label: z.string().min(1).max(300) }),
]);

/**
 * Adds a supplier category for an item the founder names ("cups"), or removes
 * one, in a saved project. Either way the supplier section is saved as a new
 * revision in the interface language, so the rest of the plan, its history,
 * the other language (translated when next opened) and share links follow.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseConfig()) return fail("Accounts aren't available right now.", 503);
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("Please log in again.", 401);

  let body: z.infer<typeof bodySchema>;
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return fail("Invalid request.", 400);
    body = parsed.data;
  } catch {
    return fail("Invalid request.", 400);
  }

  const loaded = await loadProject(supabase, (await params).id);
  if (!loaded) return fail("Project not found.", 404);
  const { project, core } = loaded;
  if (project.status !== "ready") return fail("The plan is still being prepared. Please try again shortly.", 409);
  const revisions = await latestRevisions(supabase, project.id);
  const current = revisions?.get("suppliers");
  if (!revisions || !current) return fail("The assessment couldn't be completed.", 409);
  const locale = await getLocale();

  // The supplier section in the interface language (as written, or its saved translation).
  let suppliers = current.output as SuppliersOutput;
  if (current.source_locale !== locale) {
    const translated = (await translationsOf(supabase, [current.id], locale)).get(current.id) as SuppliersOutput | undefined;
    if (!translated) return fail("Please wait for the plan to finish translating, then try again.", 409);
    // Translations keep the text and the order; requested items are carried over, renamed to the translated categories.
    const source = current.output as SuppliersOutput;
    const requested = source.requested?.map((r) => {
      const index = source.categories.findIndex((c) => c.label === r.label);
      return { ...r, label: translated.categories[index]?.label ?? r.label };
    });
    suppliers = { ...translated, ...(requested ? { requested } : {}) };
  }

  let next: SuppliersOutput;
  let runId: string | null = null;
  if (body.action === "remove") {
    next = withoutSupplierCategory(suppliers, body.label);
    if (next === suppliers) return NextResponse.json({ status: "unchanged" });
    if (next.categories.length === 0) return fail("Keep at least one supplier group.", 400);
  } else {
    const item = cleanItem(body.item);
    if (!item) return fail("Invalid request.", 400);
    if (existingCategoryFor(suppliers, item)) return NextResponse.json({ status: "exists" });
    if (suppliers.categories.length >= MAX_CATEGORIES) return fail("You've reached the limit of supplier groups for this plan.", 400);
    if (!hasAnthropicKey()) return fail("The AI service isn't configured.", 503);
    if (!(await withinGenerationLimit(supabase))) return fail(LIMIT_MESSAGE, 429);

    const { data: run } = await supabase
      .from("generation_runs")
      .insert({ project_id: project.id, core_version_id: core.id, locale, module_keys: ["suppliers"], model: IBDA_MODEL })
      .select("id")
      .single();
    runId = run?.id ?? null;
    try {
      const financials = revisions.get("financials")?.output as z.infer<typeof planFinancialsSchema> | undefined;
      const generated = await generateSupplierItem(
        { idea: core.idea, profile: core.answers, locale },
        item,
        suppliers.categories.map((c) => c.label),
        financials,
      );
      next = withSupplierItem(suppliers, item, plainLabels(generated, locale));
    } catch (error) {
      if (runId) {
        const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown error";
        await supabase.from("generation_runs").update({ status: "failed", error: message, finished_at: new Date().toISOString() }).eq("id", runId);
      }
      return generationFailure(error);
    }
  }

  const { error } = await supabase.from("module_revisions").insert({
    project_id: project.id,
    module_key: "suppliers",
    output: next,
    core_version_id: core.id,
    generation_run_id: runId,
    upstream_revision_ids: { financials: revisions.get("financials")!.id },
    source_locale: locale,
    model: IBDA_MODEL,
  });
  if (runId) {
    await supabase
      .from("generation_runs")
      .update({ status: error ? "failed" : "succeeded", ...(error ? { error: error.message.slice(0, 500) } : {}), finished_at: new Date().toISOString() })
      .eq("id", runId);
  }
  if (error) return fail("Something went wrong saving your suppliers.", 500);
  return NextResponse.json({ status: body.action === "add" ? "added" : "removed" });
}
