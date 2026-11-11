import { toAsciiDigits } from "./prototypeAgent";

const MAX = 1_000_000_000;

/**
 * A typed budget ("40000", "40,000", "40k", "٤٠٬٠٠٠", "40 ألف", "AED 40,000")
 * as the stored answer "AED 40,000", or null if it isn't a usable amount.
 */
export function amountAnswer(text: string): string | null {
  let s = toAsciiDigits(text).toLowerCase().replace(/aed|dhs?|dirhams?|درهم|دراهم|د\.إ/g, "").trim();
  let factor = 1;
  if (/(k|ألف|الف)$/.test(s)) {
    factor = 1000;
    s = s.replace(/(k|ألف|الف)$/, "").trim();
  }
  s = s.replace(/[,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const amount = Math.round(Number(s) * factor);
  if (!Number.isFinite(amount) || amount < 1 || amount > MAX) return null;
  return `AED ${amount.toLocaleString("en-US")}`;
}
