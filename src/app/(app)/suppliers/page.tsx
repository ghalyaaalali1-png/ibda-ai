import type { Metadata } from "next";
import { LiveSuppliers } from "@/features/suppliers/components/LiveSuppliers";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.suppliers;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

export default function SuppliersPage() {
  // Live supplier planning when an assessment exists; the abaya demo otherwise.
  return <LiveSuppliers />;
}
