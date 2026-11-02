import type { Metadata } from "next";
import { AnalysisWorkspace } from "@/features/analysis/components/AnalysisWorkspace";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.analysis;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

export default function AnalysisPage() {
  return <AnalysisWorkspace />;
}
