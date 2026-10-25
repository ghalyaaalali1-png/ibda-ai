import { routes } from "@/config/site";
import { demoProfile } from "@/features/launch-profile/profile";
import type { BusinessPlan } from "./types";

/**
 * Prototype plan for the demo scenario: a premium online abaya brand in Dubai,
 * AED 30,000 budget, AED 600–1,000 pricing, 6–10 designs, UAE tailoring.
 * Figures are illustrative estimates, kept internally consistent.
 */
export const demoPlan: BusinessPlan = {
  profile: demoProfile,

  decision: {
    verdict: "GO",
    score: 74,
    headline: "Launch — with a lean first collection",
    explanation:
      "A premium online abaya brand is viable on AED 30,000 if you start with 6 designs in small runs. Margins are healthy at AED 750 per piece; the main constraint is a thin cash buffer, so restocks should be funded from early sales.",
    conditions: [
      "Start with 6 designs, 6 pieces each",
      "Hero price around AED 750",
      "Keep AED 3,000 in reserve",
    ],
  },

  budget: { total: 30000, reserve: 3000 },

  costs: [
    { id: "production", label: "First collection", amount: 10900, note: "6 designs · samples + 36 pieces" },
    { id: "license", label: "Trade license & setup", amount: 7500, note: "Cost-efficient e-commerce license" },
    { id: "branding", label: "Branding & packaging", amount: 2400, note: "Identity, labels, gift boxes" },
    { id: "website", label: "Online store", amount: 1600, note: "Store platform, theme, domain" },
    { id: "content", label: "Photography & content", amount: 2000, note: "Product shoot + launch reels" },
    { id: "marketing", label: "Launch marketing", amount: 2600, note: "Paid social + creator seeding" },
  ],

  pricing: {
    min: 690,
    max: 850,
    hero: 750,
    rationale:
      "Above boutique Instagram labels, well below designer houses — premium quality without designer pricing.",
  },

  unitEconomics: {
    price: 750,
    costs: [
      { label: "Fabric", amount: 110 },
      { label: "Tailoring & finishing", amount: 150 },
      { label: "Packaging", amount: 35 },
      { label: "Payment & delivery", amount: 50 },
    ],
  },

  breakEven: {
    month: 5,
    totalSales: 98,
    monthlyRunningCosts: 2500,
    salesToCoverRunningCosts: 7,
    cashflow: [
      { month: 0, sales: 0, cumulative: -27000 },
      { month: 1, sales: 12, cumulative: -24640 },
      { month: 2, sales: 16, cumulative: -20660 },
      { month: 3, sales: 20, cumulative: -15060 },
      { month: 4, sales: 24, cumulative: -7840 },
      { month: 5, sales: 26, cumulative: 190 },
      { month: 6, sales: 28, cumulative: 9030 },
    ],
  },

  market: {
    summary:
      "Modest fashion is an everyday category in the UAE, and online discovery is led by Instagram. The space is crowded at the low end and the very top, with room for a clearly positioned premium mid-range label.",
    signals: [
      { label: "Demand", value: "Strong", detail: "Year-round, peaking before Ramadan and Eid" },
      { label: "Competition", value: "High", detail: "Many Instagram-led labels, few clear premium mid-range brands" },
      { label: "Positioning gap", value: "Open", detail: "AED 600–1,000 sits between boutique and designer" },
    ],
    targetCustomer:
      "Women aged 22–40 in Dubai and Abu Dhabi who shop fashion on Instagram and want premium fabric and fit without designer prices.",
    priceBands: [
      { label: "Mass-market online", min: 150, max: 400 },
      { label: "Boutique Instagram labels", min: 350, max: 750 },
      { label: "Premium designer labels", min: 900, max: 2000 },
      { label: "Luxury designer houses", min: 2500, max: 3000 },
    ],
  },

  risks: [
    {
      title: "Customer acquisition cost",
      severity: "High",
      detail: "Paid Instagram reach for fashion is competitive; ads alone can eat your margin.",
      mitigation: "Lead with creator seeding and a pre-launch waitlist before scaling ads.",
    },
    {
      title: "Thin cash buffer",
      severity: "Medium",
      detail: "AED 3,000 leaves little room for reorders or a slow first month.",
      mitigation: "Fund restocks from sales; take pre-orders on best-selling designs.",
    },
    {
      title: "Tailoring quality & lead times",
      severity: "Medium",
      detail: "Inconsistent finishing or delays would hurt a premium brand early.",
      mitigation: "Sample with two tailors and agree quality checks before the first run.",
    },
    {
      title: "Unsold inventory",
      severity: "Low",
      detail: "Some designs will sell slower than others.",
      mitigation: "Small runs of 6 pieces per design; reorder only proven styles.",
    },
  ],

  nextActions: [
    { title: "Choose your license option and apply", detail: "Compare free zone e-commerce packages and confirm the activity.", timing: "Week 1–2" },
    { title: "Finalize 6 designs and order samples", detail: "Brief two UAE tailors with the same tech pack.", timing: "Week 1–3" },
    { title: "Approve samples and place the first run", detail: "36 pieces total, with agreed quality checks.", timing: "Week 4–5" },
    { title: "Build the store and shoot the collection", detail: "Product photos, launch reels and size guide.", timing: "Week 5–6" },
    { title: "Open a pre-launch waitlist on Instagram", detail: "Seed 5–8 creators and collect early sign-ups.", timing: "Week 6–7" },
    { title: "Launch the collection", detail: "Ideally timed ahead of Ramadan or Eid demand.", timing: "Week 8" },
  ],

  setup: {
    summary:
      "For an online-only abaya brand, an e-commerce license is the usual starting point. A free zone package tends to suit founders who want low setup costs and full ownership; a mainland license matters if you plan a Dubai store later.",
    options: [
      {
        name: "Free zone e-commerce license",
        cost: "Est. AED 6,000–15,000 / yr",
        fit: "Online-first, low setup cost, full ownership",
        recommended: true,
      },
      {
        name: "Dubai mainland e-commerce license",
        cost: "Typically higher",
        fit: "Needed for a physical Dubai store later",
      },
      {
        name: "Home-based online trading permit",
        cost: "Lower cost",
        fit: "Eligibility restrictions apply",
      },
    ],
    requirements: [
      "Trade name reservation",
      "E-commerce / ready-made garments trading activity",
      "Passport and residency documents",
      "Business bank account",
      "VAT registration once taxable sales exceed AED 375,000 / yr",
    ],
  },

  upcoming: [
    {
      id: "suppliers",
      title: "Suppliers",
      description: "Fabric suppliers, tailoring workshops and packaging options matched to your premium positioning.",
      includes: ["Fabric suppliers", "Tailoring workshops", "Packaging", "MOQs & lead times"],
      href: routes.suppliers,
    },
    {
      id: "marketing",
      title: "Marketing Plan",
      description: "Positioning, Instagram launch strategy and a 90-day calendar to win your first customers.",
      includes: ["Positioning", "Instagram launch", "Creator seeding", "90-day calendar"],
      href: routes.marketing,
    },
  ],
};
