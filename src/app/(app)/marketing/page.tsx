import type { Metadata } from "next";
import { LiveMarketing } from "@/features/marketing/components/LiveMarketing";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.marketing;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

export default function MarketingPage() {
  // Live marketing plan when an assessment exists; the abaya demo otherwise.
  return <LiveMarketing />;
}
