import type { Metadata } from "next";
import { PlanDocument } from "@/features/launch-pack/components/PlanDocument";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: `${t.pdf.docTitle} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}` };
}

/** The full plan as a printable document (the journey without an account). */
export default function PrintPage() {
  return <PlanDocument />;
}
