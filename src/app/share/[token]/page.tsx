import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { directionOf } from "@/i18n/config";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getDictionary } from "@/i18n";
import { getLocale } from "@/i18n/server";
import { PlanDocument } from "@/features/launch-pack/components/PlanDocument";
import { ProjectProvider } from "@/features/projects/ProjectProvider";
import { sharedPlanView } from "@/features/projects/shared";

type Params = Promise<{ token: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { token } = await params;
  const shared = await sharedPlanView(token, await getLocale());
  const t = getDictionary(shared?.locale ?? (await getLocale()));
  const brand = t.locale === "ar" ? t.common.brandArabic : t.common.brand;
  // Shared plans are private to whoever has the link: keep them out of search engines.
  return { title: `${t.pdf.docTitle} — ${brand}`, robots: { index: false, follow: false } };
}

/** A plan shared by its owner: read-only, in one document, for anyone with the link. */
export default async function SharedPlanPage({ params }: { params: Params }) {
  const { token } = await params;
  const shared = await sharedPlanView(token, await getLocale());
  if (!shared) notFound();
  // Shown in the language the plan is available in, which may differ from the visitor's setting.
  return (
    <I18nProvider locale={shared.locale}>
      <div lang={shared.locale} dir={directionOf(shared.locale)}>
        <ProjectProvider view={shared.view}>
          <PlanDocument shared />
        </ProjectProvider>
      </div>
    </I18nProvider>
  );
}
