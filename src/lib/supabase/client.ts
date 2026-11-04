"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseConfig } from "./config";

/**
 * Supabase from the browser, signed in as the current user (the session
 * lives in cookies). Every query is limited by Row Level Security.
 */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = requireSupabaseConfig();
  return createBrowserClient(url, publishableKey);
}
