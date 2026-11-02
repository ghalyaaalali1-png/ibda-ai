import { english, type Dictionary } from "@/i18n";
import type { Supplier } from "./types";

// Labels in the interface language (English by default); units come from the supplier data as written.

export function priceLabel(s: Supplier, t: Dictionary = english) {
  return t.fmt.aedRange(s.price.min, s.price.max);
}

export function moqLabel(s: Supplier, t: Dictionary = english) {
  return s.moq ? `${s.moq.value} ${s.moq.unit}` : t.suppliers.format.noMinimum;
}

export function leadTimeLabel(s: Supplier, t: Dictionary = english) {
  const { minDays, maxDays } = s.leadTime;
  if (maxDays >= 14) {
    const weeks = (d: number) => Math.round(d / 7);
    return t.suppliers.format.weeks(weeks(minDays), weeks(maxDays));
  }
  return t.suppliers.format.days(minDays, maxDays);
}

export function scoreTone(score: number) {
  if (score >= 85) return { text: "text-emerald-300", bar: "bg-emerald-400/80" };
  if (score >= 70) return { text: "text-brand-300", bar: "bg-brand-400" };
  return { text: "text-mist/55", bar: "bg-white/30" };
}
