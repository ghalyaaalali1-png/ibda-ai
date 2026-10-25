export const siteConfig = {
  name: "Ibda",
  nameArabic: "ابدأ",
  tagline: "AI Business Launch Agent",
  description:
    "Ibda turns your business idea into a launch-ready plan — feasibility, pricing, suppliers, UAE setup and marketing.",
} as const;

/**
 * Central route map. When the onboarding / app screens are built,
 * point `start` at the real route (e.g. "/start") and every
 * "Start My Business" button across the site updates with it.
 */
export const routes = {
  home: "/",
  start: "#get-started",
  howItWorks: "#how-it-works",
  capabilities: "#capabilities",
  uae: "#uae",
} as const;

export const navLinks = [
  { label: "How it Works", href: routes.howItWorks },
  { label: "What Ibda Does", href: routes.capabilities },
  { label: "For UAE Entrepreneurs", href: routes.uae },
] as const;
