/*
 * Per-person limits on the AI routes, so nobody can run up the Claude bill.
 * Counts are kept in memory for each server instance; saved-project
 * generations are also counted in the database, which holds across instances.
 * Kept free of "server-only" so it can be tested; only server code imports it.
 */

const HOUR = 60 * 60 * 1000;

/** How many requests each kind of AI work allows per person per hour. */
export const hourlyLimits = {
  /** A full plan without an account. */
  assessment: 6,
  /** A full plan, or an edit, in a saved project (counted from its generation runs). */
  projectGeneration: 10,
  /** One more supplier group for an item the founder names, without an account. */
  supplierItem: 20,
  translation: 30,
  caption: 40,
} as const;

const hits = new Map<string, number[]>();

/**
 * Records one request for `key` and says whether it's within `limit` per
 * `windowMs`. Old entries are dropped as it goes, so memory stays small.
 */
export function allowRequest(key: string, limit: number, windowMs = HOUR, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // Forget people who've gone quiet.
  if (hits.size > 5_000) for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k);
  return true;
}

/** Who's asking: the signed-in user's id, else their network address. */
export function requesterKey(request: Request, userId?: string | null) {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `ip:${forwarded || request.headers.get("x-real-ip") || "local"}`;
}

export const LIMIT_MESSAGE = "You've reached the hourly limit for this. Please try again later.";
export const HOUR_MS = HOUR;
