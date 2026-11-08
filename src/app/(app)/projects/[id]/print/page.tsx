import type { Metadata } from "next";
import { PlanDocument } from "@/features/launch-pack/components/PlanDocument";
import { ProjectPage } from "@/features/projects/ProjectPage";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: `${t.pdf.docTitle} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}` };
}

/** A saved project's full plan as a printable document. */
export default async function ProjectPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProjectPage id={id} path="/print">
      <PlanDocument />
    </ProjectPage>
  );
}
