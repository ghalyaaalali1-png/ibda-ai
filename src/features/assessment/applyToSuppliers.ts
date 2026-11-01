import { businessPhrase, profileValue, type ProfileField } from "@/features/launch-profile/profile";
import { aed } from "@/features/plan/format";
import type { BusinessPlan } from "@/features/plan/types";
import type { CategoryInfo, ShortlistItem, Supplier, SupplierScreenData } from "@/features/suppliers/types";
import type { InitialAssessment } from "./schema";

const slug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "category";

const clampScore = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

// Words that stay capitalised mid-sentence.
const PROPER = /^(Arabic|English|French|Hindi|Urdu|Emirati|Islamic|Halal|UAE|GCC|Dubai|Abu Dhabi|Sharjah|Ajman|Fujairah)\b/;

/** A label for running text: lowercase its first letter unless it starts with a proper noun or acronym. */
const inSentence = (label: string) =>
  PROPER.test(label) || /^[A-Z]{2}/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1);

/** "a, b and c" — or "a, b, and c" when an item already contains "and", so the list stays readable. */
function naturalList(items: string[]) {
  if (items.length <= 1) return items.join("");
  const last = items.length > 2 && items.some((x) => / and /.test(x)) ? ", and " : " and ";
  return `${items.slice(0, -1).join(", ")}${last}${items.at(-1)}`;
}

/** "10-week launch path" → "within the next 10 weeks". */
function launchWindowFrom(label: string) {
  const weeks = label.match(/(\d+)\s*-?\s*week/i)?.[1];
  return weeks ? `within the next ${weeks} weeks` : "in the coming weeks";
}

/**
 * Builds the Suppliers screen for any business from Claude's supplier
 * planning, the plan built from the assessment and the founder's answers.
 * Options are supplier types, not named businesses.
 */
export function buildSupplierData(
  a: InitialAssessment,
  plan: BusinessPlan,
  profile: ProfileField[],
): SupplierScreenData {
  const categories: CategoryInfo[] = a.suppliers.categories.map((c) => ({
    id: slug(c.label),
    label: c.label,
    shortLabel: c.label,
    summary: c.summary,
    rfq: { need: c.rfqNeed.replace(/\.$/, ""), questions: c.rfqQuestions.slice(0, 5) },
  }));
  const categoryIdFor = (label: string) =>
    categories.find((c) => c.label.toLowerCase() === label.trim().toLowerCase())?.id ?? categories[0]?.id ?? "category";

  const options = a.suppliers.options.map((o, i) => ({ o, categoryId: categoryIdFor(o.category), id: `${slug(o.name)}-${i}` }));
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
  const firstCategory = categories[0]?.id;
  const { pricing, unit } = plan;
  const priceRange = `AED ${pricing.min.toLocaleString("en-US")}–${pricing.max.toLocaleString("en-US")}`;
  const launchWindow = launchWindowFrom(plan.nextActionsLabel);

  return {
    profileLine: ["business", "location", "budget"]
      .map((id) => profileValue(profile, id))
      .filter(Boolean)
      .join(" · "),
    intro: `I compared ${suppliers.length} supplier types across ${naturalList(
      categories.map((c) => inSentence(c.label)),
    )}, then ranked them for the first launch of your ${phrase} on your budget.`,
    sourceNote: "Supplier types, not specific businesses — prices are estimates",
    supplierBadge: "Supplier type",
    contactNote:
      "This is a supplier type, not a specific business — find suppliers of this type, then copy the message to send it to them.",
    categories,
    suppliers,
    shortlist,
    allocation: sourcingTotal > 0 ? sourcingTotal : spend,
    shortlistCriteria: "low minimums, lead time",
    allocationLabel: sourcingTotal > 0 ? naturalList(sourcingLines.map((c) => inSentence(c.label))) : "startup spend",
    brief: {
      brand: `a new ${phrase}`,
      location,
      positioningSentence: `We are preparing to launch, with a planned price of ${priceRange} per ${unit.singular}.`,
      launchWindow,
      highlights: [
        `Budget ${aed(plan.budget.total)}`,
        `Price ${priceRange} per ${unit.singular}`,
        `Based in ${location}`,
        `Launch ${launchWindow.replace("within the next ", "in ")}`,
      ],
    },
    defaultCompare: firstCategory
      ? suppliers.filter((s) => s.category === firstCategory).slice(0, 3).map((s) => s.id)
      : [],
  };
}
