import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/site";
import { safeNext } from "@/features/auth/redirects";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Where Supabase sends people back to after confirming their email or
 * signing in with Google: swaps the one-time code for a session, then
 * continues to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code && hasSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  // Google sends `error` when sign-in was cancelled or refused.
  const reason = searchParams.has("error") && !code ? "google" : "link";
  return NextResponse.redirect(new URL(`${routes.login}?error=${reason}`, origin));
}
