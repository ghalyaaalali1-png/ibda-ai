/*
 * Test helper: finds English words left in text a founder would read in the
 * Arabic interface. Codes the screens translate on display, ids, links and
 * the stored English answers are skipped; brand and platform names, "AED"
 * and the like are allowed.
 */

/** Fields that hold codes, ids or links, never text shown as it is. */
const CODE_FIELDS = new Set([
  "id", "href", "url", "supplierId", "category", "theme", "status", "verdict", "kind", "group", "level",
  "stage", "priority", "region", "tag", "from", "phase", "severity", "outputStatus", "type", "locale", "defaultCompare",
  // Stored in English and shown through the dictionary (displayValue).
  "emirate",
]);
/** Parts of the screen data that aren't shown as text: the stored answers, and what's sent to Claude. */
const NOT_SHOWN = new Set(["profile", "captionContext", "inputs"]);

const ALLOWED = new Set(["AED", "KHITTA", "Instagram", "TikTok", "WhatsApp", "Meta", "Google", "UAE", "GCC", "VAT", "QR", "u.ae"]);

/** `allowed` adds names that may stay as written (for example brand names). */
export function englishLeftovers(value: unknown, allowed: Iterable<string> = [], path = "$"): string[] {
  const allow = [...ALLOWED, ...allowed].sort((a, b) => b.length - a.length);
  if (typeof value === "string") {
    let text = value.replace(/https?:\/\/\S+|\bu\.ae\b/g, "");
    for (const name of allow) text = text.split(name).join(" ");
    return /[A-Za-z]{2,}/.test(text) ? [`${path}: ${value}`] : [];
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => englishLeftovers(v, allow, `${path}[${i}]`));
  if (value && typeof value === "object") {
    // Official sources are shown through their Arabic name (sourceText).
    if ("nameAr" in value) return [];
    return Object.entries(value).flatMap(([k, v]) =>
      CODE_FIELDS.has(k) || NOT_SHOWN.has(k) ? [] : englishLeftovers(v, allow, `${path}.${k}`),
    );
  }
  return [];
}
