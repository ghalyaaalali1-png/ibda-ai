import { profileValue, type LaunchProfile } from "@/features/launch-profile/profile";
import { nameNeedsTranslation } from "@/i18n";
import type { Locale } from "@/i18n/config";

/** The answers with the business name in this language, and whether that name is known yet. */
export function localizedAnswers(answers: LaunchProfile, names: Partial<Record<Locale, string>>, locale: Locale) {
  const business = profileValue(answers, "business");
  if (!business || !nameNeedsTranslation(business, locale)) return { profile: answers, nameReady: true };
  const name = names[locale];
  if (!name) return { profile: answers, nameReady: false };
  return { profile: answers.map((f) => (f.id === "business" ? { ...f, value: name } : f)), nameReady: true };
}
