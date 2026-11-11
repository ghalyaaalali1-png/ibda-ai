import type { Question } from "./types";

// Question copy, answer labels and reactions are in the dictionary's `onboarding`
// and `profile` sections; answers are stored as the English values below.

export const locationQuestion: Question = {
  id: "location",
  options: ["Dubai", "Abu Dhabi", "Sharjah", "Another emirate"],
  summaryLabel: "Location",
};

export const budgetQuestion: Question = {
  id: "budget",
  options: ["Under AED 25,000", "AED 25,000–75,000", "AED 75,000–150,000", "AED 150,000+"],
  summaryLabel: "Budget",
  input: "amount",
};

/** Questions for the primary demo scenario: an online abaya brand. */
export const abayaQuestions: Question[] = [
  { id: "abayaType", options: ["Everyday", "Premium", "Luxury", "Modest fashion mix"], summaryLabel: "Type" },
  { id: "priceRange", options: ["Under AED 300", "AED 300–600", "AED 600–1,000", "AED 1,000+"], summaryLabel: "Target price" },
  { id: "designCount", options: ["3–5", "6–10", "10+"], summaryLabel: "Launch designs" },
  {
    id: "production",
    options: ["UAE tailoring", "Overseas manufacturer", "Ready-made / wholesale", "Not sure — help me decide"],
    summaryLabel: "Production",
  },
];

/** Fallback questions for ideas outside the demo scenario. */
export const generalQuestions: Question[] = [
  { id: "channel", options: ["Online only", "Physical location", "Both", "Not sure yet"], summaryLabel: "Sales channel" },
  { id: "stage", options: ["Just an idea", "Researching", "Suppliers lined up", "Ready to launch"], summaryLabel: "Stage" },
];
