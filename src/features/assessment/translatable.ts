import { z } from "zod";
import { initialAssessmentSchema, type InitialAssessment } from "./schema";

/** String fields that hold ids, never text shown to the founder. */
const NOT_TEXT = new Set(["sourceId", "sourceIds"]);

/**
 * Rewrites every piece of written text in a value, found by walking its
 * schema: free-text strings only. Enum codes, ids, numbers and booleans are
 * kept exactly, so a translated result has the same figures and structure.
 */
export function mapTexts<T>(schema: z.ZodType, value: T, fn: (text: string) => string): T {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault || schema instanceof z.ZodNullable) {
    return value === undefined || value === null ? value : mapTexts(schema.unwrap() as z.ZodType, value, fn);
  }
  if (schema instanceof z.ZodString) return (typeof value === "string" ? fn(value) : value) as T;
  if (schema instanceof z.ZodArray) {
    return (Array.isArray(value) ? value.map((v) => mapTexts(schema.element as z.ZodType, v, fn)) : value) as T;
  }
  if (schema instanceof z.ZodObject) {
    if (!value || typeof value !== "object") return value;
    const shape = schema.shape as Record<string, z.ZodType>;
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, shape[k] && !NOT_TEXT.has(k) ? mapTexts(shape[k], v, fn) : v]),
    ) as T;
  }
  return value;
}

/** The distinct pieces of text in an assessment, in order of first appearance. */
export function assessmentTexts(a: InitialAssessment) {
  const texts = new Set<string>();
  mapTexts(initialAssessmentSchema, a, (text) => {
    if (text.trim()) texts.add(text);
    return text;
  });
  return [...texts];
}

/**
 * The assessment with each text replaced by its translation. The same text
 * always gets the same translation, so labels that must match (a supplier
 * option's category and the category itself) still match.
 */
export function withTranslations(a: InitialAssessment, translations: ReadonlyMap<string, string>): InitialAssessment {
  return mapTexts(initialAssessmentSchema, a, (text) => translations.get(text) ?? text);
}
