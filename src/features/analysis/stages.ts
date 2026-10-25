import {
  Building2,
  Calculator,
  ClipboardCheck,
  Rocket,
  Search,
  Truck,
} from "lucide-react";
import type { AgentStage } from "./types";

/**
 * The analysis workflow. In the prototype these run on timers; a real agent
 * can stream the same stage/activity ids as it works.
 */
export const analysisStages: AgentStage[] = [
  {
    id: "understand",
    title: "Understanding your business",
    icon: ClipboardCheck,
    result: "Launch profile confirmed",
    activities: [
      { id: "profile", label: "Reviewing your launch profile", action: "Reviewing", durationMs: 700 },
      { id: "choices", label: "Confirming product, price and production choices", action: "Reviewing", durationMs: 700 },
    ],
  },
  {
    id: "market",
    title: "Researching the UAE market",
    icon: Search,
    result: "Market, customer and price benchmarks reviewed",
    activities: [
      { id: "market", label: "Analyzing UAE modest fashion market", action: "Researching" },
      { id: "customer", label: "Reviewing target customer and positioning", action: "Researching" },
      { id: "competitors", label: "Checking competitor price ranges", action: "Comparing" },
    ],
  },
  {
    id: "feasibility",
    title: "Calculating feasibility",
    icon: Calculator,
    result: "Startup costs, unit economics and break-even estimated",
    activities: [
      { id: "costs", label: "Estimating startup costs", action: "Calculating" },
      { id: "budget", label: "Testing {budget} budget", action: "Calculating" },
      { id: "unit", label: "Calculating unit economics", action: "Calculating" },
      { id: "breakeven", label: "Estimating break-even", action: "Calculating" },
    ],
  },
  {
    id: "suppliers",
    title: "Finding supplier options",
    icon: Truck,
    result: "Fabric and tailoring options shortlisted",
    activities: [
      { id: "fabric", label: "Comparing UAE fabric suppliers", action: "Comparing" },
      { id: "tailoring", label: "Reviewing tailoring options", action: "Comparing" },
      { id: "moq", label: "Checking estimated MOQs and lead times", action: "Comparing" },
    ],
  },
  {
    id: "setup",
    title: "Checking UAE setup requirements",
    icon: Building2,
    result: "Setup options and requirements outlined",
    activities: [
      { id: "activity", label: "Reviewing e-commerce activity requirements", action: "Checking sources" },
      { id: "options", label: "Comparing suitable setup options", action: "Checking sources" },
      { id: "official", label: "Checking relevant official-source guidance", action: "Checking sources" },
    ],
  },
  {
    id: "plan",
    title: "Building your launch plan",
    icon: Rocket,
    result: "Budget, timeline and marketing priorities ready",
    activities: [
      { id: "allocation", label: "Creating budget allocation", action: "Planning" },
      { id: "timeline", label: "Building launch timeline", action: "Planning" },
      { id: "marketing", label: "Preparing marketing priorities", action: "Planning" },
    ],
  },
];
