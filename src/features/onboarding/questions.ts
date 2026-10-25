import type { Question } from "./types";

export const locationQuestion: Question = {
  id: "location",
  prompt: "Which emirate are you planning to launch in?",
  helper: "Setup options and costs differ between emirates.",
  options: ["Dubai", "Abu Dhabi", "Sharjah", "Another emirate"],
  summaryLabel: "Location",
};

export const budgetQuestion: Question = {
  id: "budget",
  prompt: "Roughly what budget are you starting with?",
  helper: "I'll use this to check what's realistic for your launch.",
  options: [
    "Under AED 25,000",
    "AED 25,000–75,000",
    "AED 75,000–150,000",
    "AED 150,000+",
  ],
  summaryLabel: "Budget",
};

/** Questions for the primary demo scenario: an online abaya brand. */
export const abayaQuestions: Question[] = [
  {
    id: "abayaType",
    prompt: "What type of abayas are you planning to sell?",
    helper: "This shapes your fabric costs, suppliers and who you're selling to.",
    options: ["Everyday", "Premium", "Luxury", "Modest fashion mix"],
    summaryLabel: "Type",
    reactions: {
      Everyday: "Everyday abayas — volume and repeat customers will matter.",
      Premium: "Premium — a strong position for an online-first brand.",
      Luxury: "Luxury — fabric quality and presentation will carry the brand.",
      "Modest fashion mix": "A modest fashion mix — that widens your audience.",
    },
  },
  {
    id: "priceRange",
    prompt: "What price range are you targeting?",
    helper: "I'll use this to check your margins against your budget.",
    options: ["Under AED 300", "AED 300–600", "AED 600–1,000", "AED 1,000+"],
    summaryLabel: "Target price",
    reactions: {
      "Under AED 300": "Accessible pricing — margins will need careful costing.",
      "AED 300–600": "That range leaves room for both quality and margin.",
      "AED 600–1,000": "That gives healthy room for premium fabric and margin.",
      "AED 1,000+": "At that level, exclusivity and presentation become essential.",
    },
  },
  {
    id: "designCount",
    prompt: "How many designs do you want to launch with?",
    helper: "More designs means more upfront stock — I'll factor this into your costs.",
    options: ["3–5", "6–10", "10+"],
    summaryLabel: "Launch designs",
    reactions: {
      "3–5": "A focused first collection keeps inventory risk low.",
      "6–10": "A solid range — I'll check it fits your budget.",
      "10+": "Ambitious — I'll check how far your budget stretches.",
    },
  },
  {
    id: "production",
    prompt: "How do you plan to produce them?",
    helper: "Production is usually the biggest cost decision for a new abaya brand.",
    options: [
      "UAE tailoring",
      "Overseas manufacturer",
      "Ready-made / wholesale",
      "Not sure — help me decide",
    ],
    summaryLabel: "Production",
  },
];

/** Fallback questions for ideas outside the demo scenario. */
export const generalQuestions: Question[] = [
  {
    id: "channel",
    prompt: "How do you plan to sell?",
    helper: "This changes your setup, costs and marketing approach.",
    options: ["Online only", "Physical location", "Both", "Not sure yet"],
    summaryLabel: "Sales channel",
  },
  {
    id: "stage",
    prompt: "Where are you right now?",
    helper: "So I know where your plan should start.",
    options: [
      "Just an idea",
      "Researching",
      "Suppliers lined up",
      "Ready to launch",
    ],
    summaryLabel: "Stage",
  },
];
