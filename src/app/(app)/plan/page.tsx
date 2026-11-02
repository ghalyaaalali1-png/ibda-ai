import type { Metadata } from "next";
import { LivePlanDashboard } from "@/features/plan/components/LivePlanDashboard";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.plan;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

export default function PlanPage() {
  // Claude's assessment applied in the browser when available; otherwise the abaya demo.
  return <LivePlanDashboard />;
}
