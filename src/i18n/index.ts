import type { Locale } from "./config";
import { ar } from "./dictionaries/ar";
import { en, type Dictionary } from "./dictionaries/en";

export type { Dictionary, StageContext } from "./dictionaries/en";

export const dictionaries: Record<Locale, Dictionary> = { en, ar };

export const getDictionary = (locale: Locale) => dictionaries[locale];

/** The English dictionary: the default for code that runs without an interface language (e.g. tests). */
export const english = en;

/**
 * A stored profile answer for display. Answers are stored in English so the
 * analysis input never depends on the interface language; this shows them in
 * the current one. Free text (and Claude's output) is shown as entered.
 */
export function displayValue(t: Dictionary, value: string) {
  const mapped = t.profile.values[value];
  if (mapped) return mapped;
  const amount = value.match(/^AED\s*([\d,]+)$/)?.[1];
  return amount ? t.fmt.aed(Number(amount.replace(/,/g, ""))) : value;
}

/** A profile field's label for display, by field id. */
export const displayLabel = (t: Dictionary, id: string, fallback: string) => t.profile.labels[id] ?? fallback;

/** "Business · Location · Budget" in the interface language. */
export function displayProfileLine(t: Dictionary, profile: { id: string; value: string }[]) {
  return ["business", "location", "budget"]
    .map((id) => profile.find((f) => f.id === id)?.value)
    .filter((v): v is string => Boolean(v))
    .map((v) => displayValue(t, v))
    .join(" · ");
}

/** An error message from the API in the interface language, when there's a translation for it. */
export const displayError = (t: Dictionary, message: string) => t.errors[message] ?? message;

/**
 * True when a name the founder typed (their business, say) is written in the
 * other language's script and the dictionary has no wording for it, so it is
 * translated for this interface language.
 */
export function nameNeedsTranslation(name: string | null | undefined, locale: Locale) {
  if (!name?.trim() || dictionaries[locale].profile.values[name]) return false;
  const arabic = /[\u0600-\u06FF]/.test(name);
  return locale === "ar" ? !arabic : arabic;
}
