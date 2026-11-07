import type { Metadata } from "next";
import { AnalysisWorkspace } from "@/features/analysis/components/AnalysisWorkspace";
import { ProjectPage } from "@/features/projects/ProjectPage";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.analysis;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

export default async function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProjectPage id={id} path="">
      <AnalysisWorkspace />
    </ProjectPage>
  );
}
