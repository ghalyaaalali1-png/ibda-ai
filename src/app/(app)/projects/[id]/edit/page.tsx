import type { Metadata } from "next";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { EditProject } from "@/features/projects/components/EditProject";
import { JourneyTabs } from "@/features/projects/JourneyTabs";
import { ProjectPage } from "@/features/projects/ProjectPage";
import { projectHistory } from "@/features/projects/server";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: `${t.edit.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}` };
}

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const history = await projectHistory(id);
  return (
    <ProjectPage id={id} path="/edit">
      <AuthHeader tabs={<JourneyTabs />} />
      <EditProject history={history} />
    </ProjectPage>
  );
}
