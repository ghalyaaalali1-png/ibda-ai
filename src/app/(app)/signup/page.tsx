import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/components/AuthPage";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.signup;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

export default function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  return <AuthPage mode="signup" searchParams={searchParams} />;
}
