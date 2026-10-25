export function aed(amount: number) {
  const sign = amount < 0 ? "−" : "";
  return `${sign}AED ${Math.abs(amount).toLocaleString("en-US")}`;
}

/** Compact axis label, e.g. -15000 -> "−15k". */
export function aedShort(amount: number) {
  if (amount === 0) return "0";
  const sign = amount < 0 ? "−" : "+";
  return `${sign}${Math.abs(amount) / 1000}k`;
}

export function percent(part: number, whole: number) {
  return Math.round((part / whole) * 100);
}

/**
 * Categorical slots for chart series, validated for colour-vision
 * deficiency on the dark card surface. Assign in order, never cycle.
 */
export const seriesColors = [
  "#9085e9",
  "#d95926",
  "#199e70",
  "#c98500",
  "#3987e5",
  "#d55181",
];
