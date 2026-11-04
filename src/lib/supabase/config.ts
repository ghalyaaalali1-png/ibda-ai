/**
 * Supabase connection settings. Both values are public by design: the
 * publishable key only reaches what Row Level Security allows each signed-in
 * user. They live in .env.local (development) or the host's settings
 * (production). The secret key is never used by the app.
 */
export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && publishableKey ? { url, publishableKey } : null;
}

/** True when the Supabase URL and publishable key are set. */
export const hasSupabaseConfig = () => supabaseConfig() !== null;

export function requireSupabaseConfig() {
  const config = supabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase isn't configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local (see .env.example) and restart the dev server.",
    );
  }
  return config;
}
