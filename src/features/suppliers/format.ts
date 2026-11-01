import type { Supplier } from "./types";

export function priceLabel(s: Supplier) {
  const n = (v: number) => v.toLocaleString("en-US");
  return `AED ${n(s.price.min)}–${n(s.price.max)}`;
}

export function moqLabel(s: Supplier) {
  return s.moq ? `${s.moq.value} ${s.moq.unit}` : "No minimum";
}

export function leadTimeLabel(s: Supplier) {
  const { minDays, maxDays } = s.leadTime;
  if (maxDays >= 14) {
    const weeks = (d: number) => Math.round(d / 7);
    return weeks(minDays) === weeks(maxDays)
      ? `${weeks(maxDays)} weeks`
      : `${weeks(minDays)}–${weeks(maxDays)} weeks`;
  }
  return `${minDays}–${maxDays} days`;
}

export function scoreTone(score: number) {
  if (score >= 85) return { text: "text-emerald-300", bar: "bg-emerald-400/80" };
  if (score >= 70) return { text: "text-brand-300", bar: "bg-brand-400" };
  return { text: "text-mist/55", bar: "bg-white/30" };
}
