import type { Metadata } from "next";
import { LiveSuppliers } from "@/features/suppliers/components/LiveSuppliers";
import { ProjectPage } from "@/features/projects/ProjectPage";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.suppliers;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

export default async function ProjectSuppliersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProjectPage id={id} path="/suppliers">
      <LiveSuppliers />
    </ProjectPage>
  );
}
