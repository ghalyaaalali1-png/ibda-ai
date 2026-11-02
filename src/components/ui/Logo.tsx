"use client";

import Link from "next/link";
import { routes, siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";

/** Placeholder mark until the KHITTA visual identity is designed; the two names are the brand. */
export function Logo() {
  const { t } = useI18n();
  return (
    <Link href={routes.home} className="group flex items-center gap-2.5" aria-label={t.common.homeLabel}>
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-400 via-brand-600 to-electric-500 shadow-[0_0_24px_-4px_rgb(139_108_255/0.7)]">
        {/* Upward "launch" mark */}
        <svg viewBox="0 0 24 24" className="size-5 text-white" aria-hidden>
          <path
            d="M5 17 L12 6 L19 17"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="17" r="1.8" fill="currentColor" />
        </svg>
      </span>
      <span className="flex items-baseline gap-2">
        <span lang="en" className="text-lg font-semibold tracking-tight text-white">
          {siteConfig.name}
        </span>
        <span lang="ar" className="font-arabic text-sm font-semibold text-brand-300/80">
          {siteConfig.nameArabic}
        </span>
      </span>
    </Link>
  );
}
