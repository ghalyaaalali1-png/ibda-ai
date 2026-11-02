import { businessPhrase, profileValue, type ProfileField } from "@/features/launch-profile/profile";
import type { BusinessPlan } from "@/features/plan/types";
import type { CategoryInfo, ShortlistItem, Supplier, SupplierScreenData } from "@/features/suppliers/types";
import { displayProfileLine, displayValue, english, type Dictionary } from "@/i18n";
import type { InitialAssessment } from "./schema";

// Empty for text without Latin letters (Arabic labels), so callers add a fallback.
const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const clampScore = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

// Words that stay capitalised mid-sentence.
const PROPER = /^(Arabic|English|French|Hindi|Urdu|Emirati|Islamic|Halal|UAE|GCC|Dubai|Abu Dhabi|Sharjah|Ajman|Fujairah)\b/;

/** A label for running text: lowercase its first letter unless it starts with a proper noun or acronym. */
const inSentence = (label: string) =>
  PROPER.test(label) || /^[A-Z]{2}/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1);

/** "a, b and c" — or "a and b, and c" style when an item already contains "and", so the list stays readable. */
function naturalList(items: string[]) {
  if (items.length <= 1) return items.join("");
  const last = items.some((x) => / and /.test(x)) ? ", and " : " and ";
  return `${items.slice(0, -1).join(", ")}${last}${items.at(-1)}`;
}

/** "10-week launch path" or «مسار إطلاق من 10 أسابيع» → 10 (the label's first number). */
const launchWeeksFrom = (label: string) =>
  Number(label.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).match(/\d+/)?.[0]) || null;

/**
 * Builds the Suppliers screen for any business from Claude's supplier
 * planning, the plan built from the assessment and the founder's answers.
 * Options are supplier types, not named businesses. `t` words the screen
 * text and the supplier enquiry (English by default).
 */
export function buildSupplierData(
  a: InitialAssessment,
  plan: BusinessPlan,
  profile: ProfileField[],
  t: Dictionary = english,
): SupplierScreenData {
  const built = t.suppliers.built;
  const list = t.locale === "en" ? naturalList : t.fmt.list;
  const categories: CategoryInfo[] = a.suppliers.categories.map((c, i) => ({
    id: slug(c.label) || `category-${i + 1}`,
    label: c.label,
    shortLabel: c.label,
    summary: c.summary,
    rfq: { need: c.rfqNeed.replace(/\.$/, ""), questions: c.rfqQuestions.slice(0, 5) },
  }));
  const categoryIdFor = (label: string) =>
    categories.find((c) => c.label.toLowerCase() === label.trim().toLowerCase())?.id ?? categories[0]?.id ?? "category";

  const options = a.suppliers.options.map((o, i) => ({ o, categoryId: categoryIdFor(o.category), id: `${slug(o.name) || "option"}-${i}` }));
  const suppliers: Supplier[] = options.map(({ o, categoryId, id }) => ({
    id,
    name: o.name,
    category: categoryId,
    location: o.location,
    region: o.overseas ? "Overseas" : "UAE",
    offering: o.offering,
    price: { min: Math.round(o.priceMinAed), max: Math.round(o.priceMaxAed), unit: o.priceUnit },
    moq: o.moqValue > 0 ? { value: Math.round(o.moqValue), unit: o.moqUnit } : null,
    leadTime: { minDays: Math.round(o.leadMinDays), maxDays: Math.round(o.leadMaxDays) },
    bestFor: o.bestFor,
    matchScore: clampScore(o.matchScore),
    matchReasons: o.matchReasons.slice(0, 2),
    watchOut: o.watchOut.trim() || undefined,
    recommended: o.recommended,
  }));

  // One pick per category: Claude's recommendation, or the best match if it named none.
  const shortlist: ShortlistItem[] = categories.flatMap((c) => {
    const inCategory = options.filter((x) => x.categoryId === c.id);
    const pick =
      inCategory.find((x) => x.o.recommended) ??
      [...inCategory].sort((p, q) => q.o.matchScore - p.o.matchScore)[0];
    return pick
      ? [{ supplierId: pick.id, estimate: Math.round(pick.o.firstOrderEstimateAed), basis: pick.o.firstOrderBasis }]
      : [];
  });

  const sourcingLines = plan.costs.filter((c) => c.group === "sourcing");
  const sourcingTotal = sourcingLines.reduce((sum, c) => sum + c.amount, 0);
  const spend = plan.budget.total - plan.budget.reserve;

  const location = profileValue(profile, "location") ?? "the UAE";
  const phrase = businessPhrase(profile);
  const business = t.locale === "en" ? phrase : displayValue(t, profileValue(profile, "business") ?? phrase);
  const firstCategory = categories[0]?.id;
  const { pricing, unit } = plan;
  const launchWeeks = launchWeeksFrom(plan.nextActionsLabel);

  return {
    profileLine: displayProfileLine(t, profile),
    intro: built.intro(suppliers.length, list(categories.map((c) => inSentence(c.label))), business),
    sourceNote: built.sourceNote,
    supplierBadge: built.badge,
    contactNote: built.contactNote,
    categories,
    suppliers,
    shortlist,
    allocation: sourcingTotal > 0 ? sourcingTotal : spend,
    shortlistCriteria: built.criteria,
    allocationLabel: sourcingTotal > 0 ? list(sourcingLines.map((c) => inSentence(c.label))) : built.startupSpend,
    brief: {
      brand: built.brief.brand(business),
      location: displayValue(t, location),
      positioningSentence: built.brief.positioning(t.fmt.aedRange(pricing.min, pricing.max), unit.singular),
      launchWindow: built.brief.launchWindow(launchWeeks),
      highlights: [
        built.highlights.budget(t.fmt.aed(plan.budget.total)),
        built.highlights.price(t.fmt.aedRange(pricing.min, pricing.max), unit.singular),
        built.highlights.location(displayValue(t, location)),
        built.highlights.launch(launchWeeks),
      ],
    },
    defaultCompare: firstCategory
      ? suppliers.filter((s) => s.category === firstCategory).slice(0, 3).map((s) => s.id)
      : [],
  };
}
