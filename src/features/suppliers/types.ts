/** Category id, e.g. "fabric" in the demo or a slug of a Claude category label. */
export type SupplierCategory = string;

export type Supplier = {
  id: string;
  name: string;
  category: SupplierCategory;
  location: string;
  /** "UAE" suppliers can be visited; "Overseas" adds shipping and customs. */
  region: "UAE" | "Overseas";
  offering: string;
  price: { min: number; max: number; unit: string };
  moq: { value: number; unit: string } | null;
  leadTime: { minDays: number; maxDays: number };
  bestFor: string;
  matchScore: number;
  /** Why Ibda ranked this supplier the way it did. */
  matchReasons: string[];
  watchOut?: string;
  recommended?: boolean;
};

/** The parts of the business plan a supplier enquiry needs. */
export type SourcingBrief = {
  /** Used in running text, e.g. "a new premium online abaya brand". */
  brand: string;
  location: string;
  /** Sentence placing the business in the market, used in formal enquiries. */
  positioningSentence: string;
  launchWindow: string;
  /** Short facts shown above the drafted enquiry. */
  highlights: string[];
};

/** Ibda's recommended pick per category, with its first-run cost estimate. */
export type ShortlistItem = {
  supplierId: string;
  estimate: number;
  basis: string;
};

export type CategoryInfo = {
  id: SupplierCategory;
  label: string;
  shortLabel: string;
  summary: string;
  /** Enquiry content for this category; the demo writes its own. */
  rfq?: { need: string; questions: string[] };
};

/** Everything the Suppliers screen renders, for the demo or a live assessment. */
export type SupplierScreenData = {
  profileLine: string;
  intro: string;
  /** Badge under the title, e.g. "Prototype supplier data — demo, not verified suppliers". */
  sourceNote: string;
  /** Badge on each card, e.g. "Demo supplier" or "Supplier type". */
  supplierBadge: string;
  /** Note inside the enquiry drawer about contact details. */
  contactNote: string;
  categories: CategoryInfo[];
  suppliers: Supplier[];
  shortlist: ShortlistItem[];
  allocation: number;
  /** Completes "chosen for … and fit with your budget". */
  shortlistCriteria: string;
  /** Completes "Within your plan's AED … for …". */
  allocationLabel: string;
  brief: SourcingBrief;
  defaultCompare: string[];
};
