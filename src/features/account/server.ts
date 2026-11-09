import "server-only";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AccountDetails = {
  email: string;
  name: string;
  /** False for accounts that only sign in with Google (no KHITTA password). */
  hasPassword: boolean;
};

/** The signed-in founder's account details, or null when signed out. */
export async function accountDetails(): Promise<AccountDetails | null> {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const providers = (user.identities ?? []).map((i) => i.provider);
  return {
    email: user.email ?? "",
    name: profile?.display_name ?? "",
    hasPassword: providers.length === 0 || providers.includes("email"),
  };
}
