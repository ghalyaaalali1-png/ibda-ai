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

/** Icons for the hero pipeline; the labels are in the dictionary's `landing.agentFlow.steps`, in order. */
export const agentStepIcons: LucideIcon[] = [Lightbulb, Search, ShieldCheck, Truck, Building2, Rocket];

/** Icons for the capability cards; the text is in the dictionary's `landing.capabilities.items`, in order. */
export const capabilityIcons: LucideIcon[] = [Search, Calculator, Truck, Building2, Megaphone];

/**
 * The primary demo scenario used across the prototype, as sent for analysis.
 * Kept in English so the demo's analysis input doesn't depend on the interface
 * language; the dictionary's `landing.demoIdea` is what's shown.
 */
export const demoIdea =
  "I want to launch an online abaya brand in Dubai with a budget of AED 30,000.";
