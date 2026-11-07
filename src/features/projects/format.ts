import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

// Dates are shown on the UAE calendar, wherever the server runs.
const TIME_ZONE = "Asia/Dubai";

const dayKey = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

/** "today", "yesterday" or "20 October" (with the year when it isn't this year), in the interface language. */
export function updatedOn(iso: string, locale: Locale, t: Dictionary, now = new Date()) {
  const date = new Date(iso);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (dayKey(date) === dayKey(now)) return t.auth.projects.today;
  if (dayKey(date) === dayKey(yesterday)) return t.auth.projects.yesterday;
  const sameYear = date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE, year: "numeric" }) ===
    now.toLocaleDateString("en-CA", { timeZone: TIME_ZONE, year: "numeric" });
  return date.toLocaleDateString(locale === "ar" ? "ar-AE-u-nu-latn" : "en-GB", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}
