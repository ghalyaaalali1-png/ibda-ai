import { demoExtras } from "@/features/launch-pack/extras";
import type { PackExtras } from "@/features/launch-pack/types";
import { demoMarketing } from "@/features/marketing/demoMarketing";
import type { MarketingPlan } from "@/features/marketing/types";
import { demoPlan } from "@/features/plan/demoPlan";
import type { BusinessPlan } from "@/features/plan/types";
import { demoSupplierData } from "@/features/suppliers/demoSuppliers";
import type { SupplierScreenData } from "@/features/suppliers/types";
import type { Locale } from "@/i18n/config";
import { arabicDemo } from "./arabicDemo";

/**
 * Replacement text for a value of type T: strings at the same places, arrays
 * aligned by index. Numbers, codes and anything left out keep their value.
 */
export type TextOverlay<T> = T extends string
  ? string
  : T extends number | boolean | null | undefined
    ? never
    : T extends readonly (infer U)[]
      ? TextOverlay<U>[]
      : T extends object
        ? { [K in keyof T]?: TextOverlay<T[K]> }
        : never;

/** The value with the overlay's text written over it. */
export function withText<T>(base: T, overlay: TextOverlay<T> | undefined): T {
  if (overlay === undefined) return base;
  if (typeof base === "string") return overlay as T;
  if (Array.isArray(base)) {
    const items = overlay as unknown[];
    return base.map((item, i) => withText(item, items[i] as never)) as T;
  }
  if (base && typeof base === "object") {
    const fields = overlay as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(base).map(([k, v]) => [k, withText(v, fields[k] as never)]),
    ) as T;
  }
  return base;
}

export type DemoContent = {
  plan: BusinessPlan;
  suppliers: SupplierScreenData;
  marketing: MarketingPlan;
  extras: PackExtras;
};

export type DemoOverlay = {
  plan: TextOverlay<BusinessPlan>;
  suppliers: TextOverlay<SupplierScreenData>;
  marketing: TextOverlay<MarketingPlan>;
  extras: TextOverlay<PackExtras>;
};

const english: DemoContent = { plan: demoPlan, suppliers: demoSupplierData, marketing: demoMarketing, extras: demoExtras };

const arabic: DemoContent = {
  plan: withText(demoPlan, arabicDemo.plan),
  suppliers: withText(demoSupplierData, arabicDemo.suppliers),
  marketing: withText(demoMarketing, arabicDemo.marketing),
  extras: withText(demoExtras, arabicDemo.extras),
};

/**
 * The abaya demo in the interface language. Only the words change; every
 * figure is the English demo's.
 */
export const demoFor = (locale: Locale): DemoContent => (locale === "ar" ? arabic : english);
