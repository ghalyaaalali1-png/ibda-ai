/** One piece of the user's launch profile, e.g. { id: "budget", label: "Budget", value: "AED 30,000" }. */
export type ProfileField = {
  id: string;
  label: string;
  value: string;
};

export type LaunchProfile = ProfileField[];

/** The primary demo scenario, used when no onboarding profile is available. */
export const demoProfile: LaunchProfile = [
  { id: "business", label: "Business", value: "Online abaya brand" },
  { id: "location", label: "Location", value: "Dubai" },
  { id: "budget", label: "Budget", value: "AED 30,000" },
  { id: "abayaType", label: "Type", value: "Premium" },
  { id: "priceRange", label: "Target price", value: "AED 600–1,000" },
  { id: "designCount", label: "Launch designs", value: "6–10" },
  { id: "production", label: "Production", value: "UAE tailoring" },
];

const STORAGE_KEY = "ibda:launch-profile";

/** Hands the profile from onboarding to the analysis screen for this browser session. */
export function saveLaunchProfile(profile: LaunchProfile) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Storage unavailable (private mode etc.) — analysis falls back to the demo profile.
  }
}

export function readStoredProfile(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function parseLaunchProfile(raw: string | null): LaunchProfile | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    const valid =
      Array.isArray(data) &&
      data.length > 0 &&
      data.every(
        (f) =>
          typeof f?.id === "string" &&
          typeof f?.label === "string" &&
          typeof f?.value === "string",
      );
    return valid ? (data as LaunchProfile) : null;
  } catch {
    return null;
  }
}

const IDEA_KEY = "ibda:launch-idea";

/** The founder's idea in their own words, kept alongside the profile. */
export function saveLaunchIdea(idea: string) {
  try {
    sessionStorage.setItem(IDEA_KEY, idea);
  } catch {
    // Storage unavailable — the demo idea is used instead.
  }
}

export function readLaunchIdea(): string | null {
  try {
    return sessionStorage.getItem(IDEA_KEY);
  } catch {
    return null;
  }
}

export function profileValue(profile: LaunchProfile, id: string) {
  return profile.find((f) => f.id === id)?.value;
}

const EMIRATE_SUFFIX =
  /\s+(?:in|for)\s+(?:dubai|abu dhabi|sharjah|ajman|ras al khaimah|fujairah|umm al quwain|the uae|uae)\b.*$/i;

/** The business as a phrase for running text, e.g. "healthy meal-prep delivery business". */
export function businessPhrase(profile: LaunchProfile) {
  const raw = profileValue(profile, "business")?.replace(EMIRATE_SUFFIX, "").trim();
  if (!raw) return "your business";
  // Lowercase the first letter unless the first word is an acronym.
  return /^[A-Z][a-z]/.test(raw) ? raw.charAt(0).toLowerCase() + raw.slice(1) : raw;
}

/** The abaya demo scenario (or a live abaya idea) uses the demo's industry-specific copy. */
export function isAbayaBusiness(profile: LaunchProfile) {
  return profile.some((f) => f.id === "abayaType") || /\babayas?\b/i.test(profileValue(profile, "business") ?? "");
}
