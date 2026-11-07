import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { mapTexts } from "@/features/assessment/translatable";
import { profileValue } from "@/features/launch-profile/profile";
import { moduleDefinitions } from "@/features/plan-modules/registry";
import { localizedAnswers } from "@/features/projects/localize";
import { latestRevisions, loadProject, translationsOf } from "@/features/projects/server";
import { getLocale } from "@/i18n/server";
import { hasAnthropicKey, IBDA_MODEL } from "@/lib/server/anthropic";
import { fail } from "@/lib/server/assessmentOutput";
import { translateTexts } from "@/lib/server/translate";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Every piece of text in a module's output. */
function textsOf(schema: Parameters<typeof mapTexts>[0], output: unknown) {
  const texts: string[] = [];
  mapTexts(schema, output, (text) => {
    if (text.trim()) texts.push(text);
    return text;
  });
  return texts;
}

/**
 * Translates a saved project's plan (and business name, if typed in the other
 * language) into the interface language, once, and saves each module's
 * translation beside its revision. Only modules written in the other language
 * and not yet translated are sent; figures, codes and structure stay identical.
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
  const revisions = await latestRevisions(supabase, project.id);
  if (!revisions) return fail("The assessment couldn't be completed.", 409);

  const foreign = [...revisions.entries()].filter(([, r]) => r.source_locale !== locale);
  const existing = await translationsOf(supabase, foreign.map(([, r]) => r.id), locale);
  const missing = foreign.filter(([, r]) => !existing.has(r.id));
  const business = profileValue(core.answers, "business");
  const nameMissing = !localizedAnswers(core.answers, project.name_translations, locale).nameReady;
  if (missing.length === 0 && !nameMissing) return NextResponse.json({ status: "ready" });

  try {
    const translations = await translateTexts(
      [
        ...missing.flatMap(([key, r]) => textsOf(moduleDefinitions[key].schema, r.output)),
        ...(nameMissing && business ? [business] : []),
      ],
      locale,
    );
    if (missing.length) {
      const rows = missing.map(([key, r]) => ({
        revision_id: r.id,
        locale,
        output: mapTexts(moduleDefinitions[key].schema, r.output, (text) => translations.get(text) ?? text),
        model: IBDA_MODEL,
      }));
      // A translation saved meanwhile by another request is fine to keep.
      const { error } = await supabase.from("module_translations").insert(rows);
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
