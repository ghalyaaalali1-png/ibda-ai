import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseConfig } from "./config";

/**
 * Supabase in Server Components, Server Actions and route handlers, signed
 * in as the user making the request (read from their session cookies).
 * Uses the publishable key, so Row Level Security applies exactly as it
 * does in the browser.
 */
export async function createSupabaseServerClient() {
  const { url, publishableKey } = requireSupabaseConfig();
  const cookieStore = await cookies();
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components can't set cookies; the session is refreshed by the
          // middleware (added with sign-in) instead.
        }
      },
    },
  });
}
