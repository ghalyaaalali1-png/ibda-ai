/**
 * Interface languages. The language only changes how KHITTA is shown; the
 * founder's business data is stored and sent the same way in either.
 */
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Remembers the chosen interface language for a year. */
export const LOCALE_COOKIE = "khitta-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export const directionOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");
