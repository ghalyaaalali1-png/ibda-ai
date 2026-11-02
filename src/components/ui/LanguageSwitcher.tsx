"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { directionOf, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

const options: { locale: Locale; label: string; lang: string }[] = [
  { locale: "en", label: "EN", lang: "en" },
  { locale: "ar", label: "عربي", lang: "ar" },
];

/**
 * EN / عربي switch. Saves the choice in a cookie and re-renders the page in
 * that language; the founder's answers and results stay as they are.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    // Flip direction at once; the refresh then re-renders every text in the new language.
    document.documentElement.lang = next;
    document.documentElement.dir = directionOf(next);
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={t.common.languageLabel}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.03] p-0.5 transition-opacity",
        pending && "opacity-60",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.locale}
          type="button"
          lang={o.lang}
          aria-pressed={locale === o.locale}
          onClick={() => choose(o.locale)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            o.locale === "ar" && "font-arabic",
            locale === o.locale ? "bg-brand-500/25 text-white" : "text-mist/55 hover:text-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
