import type { Metadata } from "next";
import { OnboardingChat } from "@/features/onboarding/components/OnboardingChat";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.start;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

export default function StartPage() {
  return <OnboardingChat />;
}
