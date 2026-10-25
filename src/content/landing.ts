import {
  Building2,
  Calculator,
  Lightbulb,
  Megaphone,
  Rocket,
  Search,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type AgentStep = {
  label: string;
  detail: string;
  icon: LucideIcon;
};

/** The pipeline shown in the hero visual. */
export const agentSteps: AgentStep[] = [
  { label: "Business Idea", detail: "Online abaya brand · Dubai · AED 30k", icon: Lightbulb },
  { label: "Market Research", detail: "Mapping competitors & price points", icon: Search },
  { label: "Feasibility", detail: "Demand, costs & break-even modelled", icon: ShieldCheck },
  { label: "Suppliers", detail: "Fabric, tailoring & packaging options", icon: Truck },
  { label: "UAE Setup", detail: "E-commerce licensing options outlined", icon: Building2 },
  { label: "Launch Plan", detail: "90-day go-to-market roadmap", icon: Rocket },
];

/** The primary demo scenario used across the prototype. */
export const demoIdea =
  "I want to launch an online abaya brand in Dubai with a budget of AED 30,000.";

export type Capability = {
  /** The agent action this capability represents. */
  verb: string;
  title: string;
  description: string;
  outputs: string[];
  icon: LucideIcon;
};

export const capabilities: Capability[] = [
  {
    verb: "Research & Analyze",
    title: "Feasibility & Market Research",
    description:
      "Ibda researches demand, competition and risk, then analyzes whether your idea holds up — before you spend a dirham.",
    outputs: ["Demand signals", "Competitor map", "Risk check"],
    icon: Search,
  },
  {
    verb: "Calculate",
    title: "Costs, Pricing & Margins",
    description:
      "Ibda calculates startup costs, unit economics and a price that actually leaves you a margin — all in AED.",
    outputs: ["Startup budget", "Unit economics", "Break-even"],
    icon: Calculator,
  },
  {
    verb: "Find",
    title: "Supplier Discovery",
    description:
      "Ibda finds supplier options for what you need to sell or build, and tells you what to ask before you commit.",
    outputs: ["Shortlist", "Price ranges", "MOQs"],
    icon: Truck,
  },
  {
    verb: "Guide",
    title: "UAE Business Setup",
    description:
      "Mainland or free zone, which activity, which documents — guidance based on current requirements and official sources.",
    outputs: ["Setup options", "Licensing steps", "Checklist"],
    icon: Building2,
  },
  {
    verb: "Plan",
    title: "Marketing & Launch Plan",
    description:
      "Ibda plans your positioning, channels and week-by-week actions to win your first customers.",
    outputs: ["Positioning", "Channel mix", "90-day plan"],
    icon: Megaphone,
  },
];

export const howItWorksSteps = [
  {
    title: "Tell Ibda your idea",
    description:
      "Describe what you want to build in a few sentences — in your own words. No business plan template required.",
  },
  {
    title: "Ibda researches and analyzes it",
    description:
      "The agent works through your launch step by step — researching the market, analyzing feasibility, calculating costs, finding suppliers and checking UAE setup requirements.",
  },
  {
    title: "Get your launch-ready action plan",
    description:
      "Clear decisions, cost and pricing calculations, supplier options, UAE setup guidance and the exact next steps to take — in order.",
  },
];

/** The agent's working loop, surfaced across the page. */
export const agentProcess = [
  "Research",
  "Analyze",
  "Calculate",
  "Find",
  "Guide",
  "Plan",
];

export const uaePoints = [
  {
    title: "Mainland or free zone?",
    description:
      "Compare the setup options that may suit your activity, budget and where you want to sell.",
  },
  {
    title: "Priced in AED",
    description:
      "License, visa, rent and inventory estimates in local currency — not generic global averages.",
  },
  {
    title: "Emirate-aware guidance",
    description:
      "Requirements and costs differ across Dubai, Abu Dhabi, Sharjah and beyond — Ibda's guidance reflects that.",
  },
  {
    title: "Local sourcing",
    description:
      "Suppliers within the UAE and wider GCC, so you can move fast and keep lead times short.",
  },
];
