import { z } from "zod";
import type { LaunchProfile } from "@/features/launch-profile/profile";
import { emirateFrom, type Emirate } from "@/features/plan/officialSources";

/**
 * The founder's core business information as typed, language-neutral data:
 * codes and numbers rather than display text, so the same project can be
 * shown in Arabic or English. Every plan module declares which of these
 * fields it depends on (see plan-modules/registry).
 */

export const emirateCodes = [
  "dubai",
  "abu_dhabi",
  "sharjah",
  "ajman",
  "ras_al_khaimah",
  "fujairah",
  "umm_al_quwain",
] as const;
export const salesChannels = ["online", "physical", "both", "unsure"] as const;
export const launchStages = ["idea", "researching", "suppliers_ready", "ready_to_launch"] as const;

export type EmirateCode = (typeof emirateCodes)[number];
export type SalesChannel = (typeof salesChannels)[number];
export type LaunchStage = (typeof launchStages)[number];

/** An AED amount or range; null on one side means open-ended ("under …", "… +"). */
const aedRangeSchema = z.object({
  minAed: z.number().nonnegative().nullable(),
  maxAed: z.number().nonnegative().nullable(),
});
export type AedRange = z.infer<typeof aedRangeSchema>;

export const coreInfoSchema = z.object({
  /** The idea in the founder's own words. */
  idea: z.string(),
  /** The product or service. */
  offering: z.string().nullable(),
  businessModel: z.string().nullable(),
  emirate: z.enum(emirateCodes).nullable(),
  area: z.string().nullable(),
  budget: aedRangeSchema.nullable(),
  salesChannel: z.enum(salesChannels).nullable(),
  targetCustomer: z.string().nullable(),
  stage: z.enum(launchStages).nullable(),
  targetPrice: aedRangeSchema.nullable(),
  /** Answers with no field of their own (e.g. the abaya demo's questions), kept as given. */
  extras: z.array(z.object({ id: z.string(), label: z.string(), value: z.string() })),
});

export type CoreInfo = z.infer<typeof coreInfoSchema>;
export type CoreField = keyof CoreInfo;
export const coreFields = Object.keys(coreInfoSchema.shape) as CoreField[];

const emirateCode: Record<Emirate, EmirateCode> = {
  Dubai: "dubai",
  "Abu Dhabi": "abu_dhabi",
  Sharjah: "sharjah",
  Ajman: "ajman",
  "Ras Al Khaimah": "ras_al_khaimah",
  Fujairah: "fujairah",
  "Umm Al Quwain": "umm_al_quwain",
};

// The onboarding answers as currently worded.
const channelCode: Record<string, SalesChannel> = {
  "online only": "online",
  "physical location": "physical",
  both: "both",
  "not sure yet": "unsure",
};
const stageCode: Record<string, LaunchStage> = {
  "just an idea": "idea",
  researching: "researching",
  "suppliers lined up": "suppliers_ready",
  "ready to launch": "ready_to_launch",
};

/** "AED 60,000" → 60,000–60,000; "Under AED 25,000" → –25,000; "AED 150,000+" → 150,000–; null if no amount. */
export function parseAedRange(text: string): AedRange | null {
  const amounts = [...text.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k)?\b/gi)]
    .map((m) => Number(m[1].replace(/,/g, "")) * (m[2] ? 1000 : 1))
    .filter((n) => Number.isFinite(n));
  if (amounts.length === 0) return null;
  if (/\b(under|below|up to|less than)\b/i.test(text)) return { minAed: null, maxAed: amounts[0] };
  if (/\+\s*$|\b(over|above|more than)\b/i.test(text)) return { minAed: amounts[0], maxAed: null };
  if (amounts.length >= 2) {
    const [a, b] = amounts;
    return { minAed: Math.min(a, b), maxAed: Math.max(a, b) };
  }
  return { minAed: amounts[0], maxAed: amounts[0] };
}

/**
 * Converts today's onboarding answers ({ id, label, value } text) into
 * CoreInfo. Nothing is dropped: an answer that can't be mapped to a typed
 * field is kept in `extras`.
 */
export function coreInfoFromProfile(idea: string, profile: LaunchProfile): CoreInfo {
  const core: CoreInfo = {
    idea,
    offering: null,
    businessModel: null,
    emirate: null,
    area: null,
    budget: null,
    salesChannel: null,
    targetCustomer: null,
    stage: null,
    targetPrice: null,
    extras: [],
  };

  for (const field of profile) {
    const value = field.value.trim();
    const key = value.toLowerCase();
    const emirate = field.id === "location" ? emirateFrom(value) : null;
    const range = field.id === "budget" || field.id === "priceRange" ? parseAedRange(value) : null;

    if (field.id === "business" && value) core.offering = value;
    else if (emirate) core.emirate = emirateCode[emirate];
    else if (field.id === "budget" && range) core.budget = range;
    else if (field.id === "priceRange" && range) core.targetPrice = range;
    else if (field.id === "channel" && channelCode[key]) core.salesChannel = channelCode[key];
    else if (field.id === "stage" && stageCode[key]) core.stage = stageCode[key];
    else core.extras.push({ id: field.id, label: field.label, value: field.value });
  }
  return core;
}

const comparable = (core: CoreInfo, field: CoreField) =>
  JSON.stringify(field === "extras" ? [...core.extras].sort((a, b) => a.id.localeCompare(b.id)) : core[field]);

/** The fields that differ between two versions of a project's core information. */
export function changedFields(previous: CoreInfo, next: CoreInfo): CoreField[] {
  return coreFields.filter((field) => comparable(previous, field) !== comparable(next, field));
}
