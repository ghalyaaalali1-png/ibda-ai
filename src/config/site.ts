/** Brand names; interface copy in both languages lives in src/i18n/dictionaries. */
export const siteConfig = {
  name: "KHITTA",
  nameArabic: "خِطّة",
} as const;

/** Central route map. Every "Start My Business" button uses `start`. */
export const routes = {
  home: "/",
  start: "/start",
  analysis: "/analysis",
  plan: "/plan",
  suppliers: "/suppliers",
  marketing: "/marketing",
  launchPack: "/launch-pack",
  print: "/print",
  login: "/login",
  signup: "/signup",
  projects: "/projects",
  authCallback: "/auth/callback",
  howItWorks: "#how-it-works",
  capabilities: "#capabilities",
  uae: "#uae",
} as const;

/** Landing-page sections; labels come from the dictionary's `nav`. */
export const navLinks = [
  { key: "howItWorks", href: routes.howItWorks },
  { key: "whatWeDo", href: routes.capabilities },
  { key: "forUae", href: routes.uae },
] as const;
