"use client";

import Link from "next/link";
import { routes, siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";
import { KhittaMark } from "./KhittaMark";

/** The KHITTA logo: the K mark, then "KHITTA | خِطّة". Links home. */
export function Logo() {
  const { t } = useI18n();
  return (
    <Link href={routes.home} className="group flex shrink-0 items-center gap-2.5" aria-label={t.common.homeLabel}>
      <KhittaMark className="size-9 drop-shadow-[0_0_14px_rgb(122_108_255/0.45)] transition-transform group-hover:scale-105" />
      <span className="flex items-center gap-2" dir="ltr">
        <span lang="en" className="text-lg font-semibold tracking-[0.04em] text-white">
          {siteConfig.name}
        </span>
        <span aria-hidden className="h-4 w-px bg-white/30" />
        <span lang="ar" className="font-arabic text-base font-semibold text-white/90">
          {siteConfig.nameArabic}
        </span>
      </span>
    </Link>
  );
}
