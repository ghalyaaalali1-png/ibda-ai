import type { Metadata } from "next";
import { LiveLaunchPack } from "@/features/launch-pack/components/LiveLaunchPack";
import { getServerDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  const page = t.meta.pages.launchPack;
  return { title: `${page.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: page.description };
}

export default function LaunchPackPage() {
  // Live launch pack when an assessment exists; the abaya demo otherwise.
  return <LiveLaunchPack />;
}
