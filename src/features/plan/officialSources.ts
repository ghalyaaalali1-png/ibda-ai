/**
 * Official UAE government sources Ibda may point founders to. Claude can only
 * reference these by id — it never writes URLs — so every link shown is one
 * of these. Each address was opened and checked on 2026-10-30; a source is
 * only used while `verified` is true. When no verified emirate-specific
 * authority applies, Ibda points to the federal UAE government portal.
 */
export type Emirate =
  | "Dubai"
  | "Abu Dhabi"
  | "Sharjah"
  | "Ajman"
  | "Ras Al Khaimah"
  | "Fujairah"
  | "Umm Al Quwain";

export type OfficialSource = {
  id: string;
  name: string;
  url: string;
  /** "Federal" sources apply in every emirate. */
  scope: Emirate | "Federal";
  covers: string;
  /** Only verified sources are linked or offered to Claude. */
  verified: boolean;
};

const VERIFIED = true;

export const officialSources: OfficialSource[] = [
  // Federal
  { id: "uae-portal", name: "The Official Portal of the UAE Government (u.ae)", url: "https://u.ae", scope: "Federal", covers: "Starting a business, licence types and links to every emirate's authorities", verified: VERIFIED },
  { id: "moet", name: "Ministry of Economy and Tourism", url: "https://www.moet.gov.ae", scope: "Federal", covers: "Commercial activities, trade names and trademark registration", verified: VERIFIED },
  { id: "fta", name: "Federal Tax Authority", url: "https://tax.gov.ae", scope: "Federal", covers: "VAT and corporate tax registration", verified: VERIFIED },
  { id: "mohre", name: "Ministry of Human Resources and Emiratisation", url: "https://www.mohre.gov.ae", scope: "Federal", covers: "Hiring staff, work permits and labour rules", verified: VERIFIED },
  { id: "icp", name: "Federal Authority for Identity, Citizenship, Customs and Port Security", url: "https://icp.gov.ae", scope: "Federal", covers: "Residency, Emirates ID and visas (outside Dubai)", verified: VERIFIED },
  { id: "nma", name: "National Media Authority", url: "https://www.nma.gov.ae", scope: "Federal", covers: "Media, advertising and influencer marketing rules", verified: VERIFIED },
  { id: "mohap", name: "Ministry of Health and Prevention", url: "https://mohap.gov.ae", scope: "Federal", covers: "Health-related licensing in the northern emirates", verified: VERIFIED },

  // Dubai
  { id: "dubai-det", name: "Dubai Department of Economy and Tourism", url: "https://www.dubaidet.gov.ae", scope: "Dubai", covers: "Mainland business licensing in Dubai", verified: VERIFIED },
  { id: "invest-dubai", name: "Invest in Dubai", url: "https://www.investindubai.gov.ae", scope: "Dubai", covers: "Dubai's online business licensing portal", verified: VERIFIED },
  { id: "dubai-municipality", name: "Dubai Municipality", url: "https://www.dm.gov.ae", scope: "Dubai", covers: "Food safety, premises and public health approvals", verified: VERIFIED },
  { id: "khda", name: "Knowledge and Human Development Authority (KHDA)", url: "https://web.khda.gov.ae", scope: "Dubai", covers: "Private education and training activities in Dubai", verified: VERIFIED },
  { id: "dha", name: "Dubai Health Authority", url: "https://www.dha.gov.ae", scope: "Dubai", covers: "Health and wellness licensing in Dubai", verified: VERIFIED },
  { id: "rta", name: "Roads and Transport Authority (RTA)", url: "https://www.rta.ae", scope: "Dubai", covers: "Transport, delivery and commercial vehicle permits in Dubai", verified: VERIFIED },
  { id: "gdrfa", name: "General Directorate of Residency and Foreigners Affairs – Dubai", url: "https://gdrfad.gov.ae", scope: "Dubai", covers: "Residency and visas in Dubai", verified: VERIFIED },
  { id: "dubai-customs", name: "Dubai Customs", url: "https://www.dubaicustoms.gov.ae", scope: "Dubai", covers: "Importing goods through Dubai", verified: VERIFIED },

  // Abu Dhabi
  { id: "added", name: "Abu Dhabi Department of Economic Development", url: "https://www.added.gov.ae", scope: "Abu Dhabi", covers: "Mainland business licensing in Abu Dhabi", verified: VERIFIED },
  { id: "tamm", name: "TAMM – Abu Dhabi Government Services", url: "https://www.tamm.abudhabi", scope: "Abu Dhabi", covers: "Abu Dhabi's portal for licences and government services", verified: VERIFIED },
  { id: "adafsa", name: "Abu Dhabi Agriculture and Food Safety Authority", url: "https://www.adafsa.gov.ae", scope: "Abu Dhabi", covers: "Food safety approvals in Abu Dhabi", verified: VERIFIED },
  { id: "adek", name: "Abu Dhabi Department of Education and Knowledge", url: "https://www.adek.gov.ae", scope: "Abu Dhabi", covers: "Education and training activities in Abu Dhabi", verified: VERIFIED },
  { id: "doh-ad", name: "Department of Health – Abu Dhabi", url: "https://www.doh.gov.ae", scope: "Abu Dhabi", covers: "Health and wellness licensing in Abu Dhabi", verified: VERIFIED },
  { id: "ad-mobility", name: "Abu Dhabi Mobility", url: "https://admobility.gov.ae", scope: "Abu Dhabi", covers: "Transport and commercial vehicle permits in Abu Dhabi", verified: VERIFIED },

  // Sharjah
  { id: "sedd", name: "Sharjah Economic Development Department", url: "https://www.sedd.ae", scope: "Sharjah", covers: "Mainland business licensing in Sharjah", verified: VERIFIED },
  { id: "sharjah-municipality", name: "Sharjah City Municipality", url: "https://www.shjmun.gov.ae", scope: "Sharjah", covers: "Food safety, premises and public health approvals in Sharjah", verified: VERIFIED },
  { id: "spea", name: "Sharjah Private Education Authority", url: "https://spea.shj.ae", scope: "Sharjah", covers: "Private education and training activities in Sharjah", verified: VERIFIED },

  // Northern emirates
  { id: "ajman-ded", name: "Ajman Department of Economic Development", url: "https://www.ajmanded.ae", scope: "Ajman", covers: "Mainland business licensing in Ajman", verified: VERIFIED },
  { id: "rak-ded", name: "Ras Al Khaimah Department of Economic Development", url: "https://ded.rak.ae", scope: "Ras Al Khaimah", covers: "Mainland business licensing in Ras Al Khaimah", verified: VERIFIED },
];

const byId = new Map(officialSources.filter((s) => s.verified).map((s) => [s.id, s]));

/** A verified source by id, or undefined — unverified or unknown ids never resolve. */
export function sourceById(id: string | undefined | null) {
  return id ? byId.get(id.trim()) : undefined;
}

/** The federal UAE government portal: where to verify anything Ibda can't attribute confidently. */
export const uaePortal = byId.get("uae-portal")!;

/** Normalises the onboarding location to an emirate, or null for "Another emirate" / unknown. */
export function emirateFrom(location: string | undefined): Emirate | null {
  const l = (location ?? "").toLowerCase();
  const emirates: Emirate[] = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
  return emirates.find((e) => l.includes(e.toLowerCase())) ?? null;
}

/** Sources that apply in this emirate: its own plus all federal ones. */
export function sourcesFor(emirate: Emirate | null) {
  return officialSources.filter((s) => s.verified && (s.scope === "Federal" || s.scope === emirate));
}

/** The emirate's main licensing sources, always shown so results differ by emirate. */
export function licensingSourcesFor(emirate: Emirate | null): OfficialSource[] {
  const ids: Record<Emirate, string[]> = {
    Dubai: ["dubai-det", "invest-dubai"],
    "Abu Dhabi": ["added", "tamm"],
    Sharjah: ["sedd"],
    Ajman: ["ajman-ded"],
    "Ras Al Khaimah": ["rak-ded"],
    Fujairah: [],
    "Umm Al Quwain": [],
  };
  return (emirate ? ids[emirate] : []).map((id) => byId.get(id)).filter((x): x is OfficialSource => Boolean(x));
}
