import type { z } from "zod";
import type { supplierItemSchema, suppliersSchema } from "@/features/assessment/schema";

export type SuppliersOutput = z.infer<typeof suppliersSchema> & {
  /**
   * Items the founder asked for by name ("cups", "staff shirts") and the
   * category each became; kept when the section is rebuilt after an edit.
   */
  requested?: RequestedItem[];
};
export type RequestedItem = { item: string; label: string };
export type SupplierItemOutput = z.infer<typeof supplierItemSchema>;

export const MAX_ITEM_LENGTH = 60;
export const MAX_CATEGORIES = 12;

/** A typed item as it's stored: trimmed, single spaces, at most 60 characters. */
export const cleanItem = (item: string) => item.replace(/\s+/g, " ").trim().slice(0, MAX_ITEM_LENGTH);

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The category for a requested item, if the section already has one with that name. */
export function existingCategoryFor(suppliers: SuppliersOutput, item: string) {
  return suppliers.categories.find((c) => same(c.label, item));
}

/**
 * The supplier section with one more category, generated for an item the
 * founder asked for. Its label must not clash with an existing one, and its
 * options are filed under it; one option is marked recommended.
 */
export function withSupplierItem(suppliers: SuppliersOutput, item: string, generated: SupplierItemOutput): SuppliersOutput {
  let label = generated.category.label.trim() || cleanItem(item);
  if (suppliers.categories.some((c) => same(c.label, label))) label = `${label} (${cleanItem(item)})`;
  const options = generated.options.map((o) => ({ ...o, category: label }));
  if (options.length && !options.some((o) => o.recommended)) {
    const best = options.reduce((a, b) => (b.matchScore > a.matchScore ? b : a));
    best.recommended = true;
  }
  return {
    ...suppliers,
    categories: [...suppliers.categories, { ...generated.category, label }],
    options: [...suppliers.options, ...options],
    requested: [...(suppliers.requested ?? []).filter((r) => !same(r.item, item)), { item: cleanItem(item), label }],
  };
}

/** The supplier section without one category (and its options); a requested item with that name is forgotten too. */
export function withoutSupplierCategory(suppliers: SuppliersOutput, label: string): SuppliersOutput {
  const removed = suppliers.categories.find((c) => same(c.label, label));
  if (!removed) return suppliers;
  const requested = (suppliers.requested ?? []).filter((r) => !same(r.label, removed.label) && !same(r.item, removed.label));
  return {
    ...suppliers,
    categories: suppliers.categories.filter((c) => c !== removed),
    options: suppliers.options.filter((o) => !same(o.category, removed.label)),
    ...(suppliers.requested ? { requested } : {}),
  };
}

/**
 * After the whole section was rebuilt with the requested items included,
 * links each item to the new category that covers it (by name), so it can
 * still be removed; an item with no clear match keeps its own name.
 */
export function relinkRequested(suppliers: SuppliersOutput, items: string[]): SuppliersOutput {
  if (!items.length) return suppliers;
  const requested = items.map((item) => {
    const match =
      suppliers.categories.find((c) => same(c.label, item)) ??
      suppliers.categories.find((c) => c.label.toLowerCase().includes(item.toLowerCase()));
    return { item, label: match?.label ?? item };
  });
  return { ...suppliers, requested };
}
