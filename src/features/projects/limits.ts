import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HOUR_MS, hourlyLimits } from "@/lib/server/rateLimit";

/**
 * True while the signed-in user has room for another plan generation or
 * edit this hour. Counted from their own generation runs (Row Level Security
 * limits the count to them), so the limit holds across server instances.
 */
export async function withinGenerationLimit(supabase: SupabaseClient) {
  const { count } = await supabase
    .from("generation_runs")
    .select("id", { count: "exact", head: true })
    .gt("started_at", new Date(Date.now() - HOUR_MS).toISOString());
  return (count ?? 0) < hourlyLimits.projectGeneration;
}
