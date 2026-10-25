export const siteConfig = {
  name: "Ibda",
  nameArabic: "ابدأ",
  tagline: "AI Business Launch Agent",
  description:
    "Ibda turns your business idea into a launch-ready plan — feasibility, pricing, suppliers, UAE setup and marketing.",
} as const;

/** Central route map. Every "Start My Business" button uses `start`. */
export const routes = {
  home: "/",
  start: "/start",
  howItWorks: "#how-it-works",
  capabilities: "#capabilities",
  uae: "#uae",
} as const;

export const navLinks = [
  { label: "How it Works", href: routes.howItWorks },
  { label: "What Ibda Does", href: routes.capabilities },
  { label: "For UAE Entrepreneurs", href: routes.uae },
] as const;
