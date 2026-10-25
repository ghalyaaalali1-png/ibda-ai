export type SupplierCategory = "fabric" | "tailoring" | "embellishment" | "packaging";

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
  brand: string;
  location: string;
  positioning: string;
  designs: number;
  piecesPerDesign: number;
  targetRetail: string;
  launchWindow: string;
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
};
