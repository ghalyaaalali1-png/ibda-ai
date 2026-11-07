import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { assessmentTexts, withTranslations } from "@/features/assessment/translatable";
import { profileValue } from "@/features/launch-profile/profile";
import { assembleAssessment, splitAssessment } from "@/features/plan-modules/assemble";
import { localizedAnswers } from "@/features/projects/localize";
import { latestRevisions, loadProject, modulesIn, translationsOf } from "@/features/projects/server";
import { getLocale } from "@/i18n/server";
import { hasAnthropicKey, IBDA_MODEL } from "@/lib/server/anthropic";
import { fail } from "@/lib/server/assessmentOutput";
import { translateTexts } from "@/lib/server/translate";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Translates a saved project's plan (and business name, if typed in the other
 * language) into the interface language, once, and saves the translation
 * beside each module revision. Figures, codes and structure stay identical.
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
  const revisions = await latestRevisions(supabase, project.id, core.id);
  if (!revisions) return fail("The assessment couldn't be completed.", 409);

  const planReady = (await modulesIn(supabase, revisions, locale)) !== null;
  const business = profileValue(core.answers, "business");
  const nameMissing = !localizedAnswers(core.answers, project.name_translations, locale).nameReady;
  if (planReady && !nameMissing) return NextResponse.json({ status: "ready" });

  try {
    const source = planReady ? null : assembleAssessment((await modulesIn(supabase, revisions, revisions.get("assessment")!.source_locale))!);
    const translations = await translateTexts(
      [...(source ? assessmentTexts(source) : []), ...(nameMissing && business ? [business] : [])],
      locale,
    );

    if (source) {
      const translated = splitAssessment(withTranslations(source, translations));
      const existing = await translationsOf(supabase, [...revisions.values()].map((r) => r.id), locale);
      const rows = [...revisions.entries()]
        .filter(([, r]) => !existing.has(r.id))
        .map(([key, r]) => ({ revision_id: r.id, locale, output: translated[key], model: IBDA_MODEL }));
      // A translation saved meanwhile by another request is fine to keep.
      const { error } = rows.length ? await supabase.from("module_translations").insert(rows) : { error: null };
      if (error && error.code !== "23505") throw new Error(`Translation not saved: ${error.message}`);
    }
    if (nameMissing && business && translations.get(business)) {
      await supabase
        .from("projects")
        .update({ name_translations: { ...project.name_translations, [locale]: translations.get(business) } })
        .eq("id", project.id);
    }
    return NextResponse.json({ status: "ready" });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return fail("The AI service is busy. Please try again shortly.", 503);
    console.error("Project translation failed", error);
    return fail("The translation couldn't be completed. Please try again.", 502);
  }
}
