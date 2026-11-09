"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { routes } from "@/config/site";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Keys of `auth.account.errors` in the dictionaries. */
export type AccountErrorKey =
  | "nameTooLong"
  | "wrongPassword"
  | "passwordTooShort"
  | "mismatch"
  | "samePassword"
  | "weakPassword"
  | "rateLimit"
  | "signedOut"
  | "generic";

export type AccountFormState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; error: AccountErrorKey };

const MIN_PASSWORD = 8;
const MAX_NAME = 120;

async function signedInClient() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, user: data.user } : null;
}

/** Saves the name shown on the account (it may be left empty). */
export async function updateName(
  _previous: AccountFormState,
  form: FormData,
): Promise<AccountFormState> {
  const name = String(form.get("name") ?? "").trim();
  if (name.length > MAX_NAME) return { status: "error", error: "nameTooLong" };
  const session = await signedInClient();
  if (!session) return { status: "error", error: "signedOut" };
  // `select` returns the updated row, so "Saved." only shows when it really changed.
  const { data, error } = await session.supabase
    .from("profiles")
    .update({ display_name: name || null })
    .eq("id", session.user.id)
    .select("id");
  if (error || !data?.length) return { status: "error", error: "generic" };
  revalidatePath(routes.account);
  return { status: "saved" };
}

/** Changes the password after checking the current one. */
export async function changePassword(
  _previous: AccountFormState,
  form: FormData,
): Promise<AccountFormState> {
  const current = String(form.get("current") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < MIN_PASSWORD)
    return { status: "error", error: "passwordTooShort" };
  if (password !== confirm) return { status: "error", error: "mismatch" };
  if (password === current) return { status: "error", error: "samePassword" };

  const session = await signedInClient();
  if (!session?.user.email) return { status: "error", error: "signedOut" };
  // Someone at an unlocked computer shouldn't be able to change the password.
  const check = await session.supabase.auth.signInWithPassword({
    email: session.user.email,
    password: current,
  });
  if (check.error) {
    const limited = check.error.code === "over_request_rate_limit";
    return { status: "error", error: limited ? "rateLimit" : "wrongPassword" };
  }
  const { error } = await session.supabase.auth.updateUser({ password });
  if (!error) return { status: "saved" };
  if (error.code === "same_password")
    return { status: "error", error: "samePassword" };
  if (error.code === "weak_password")
    return { status: "error", error: "weakPassword" };
  return { status: "error", error: "generic" };
}

/**
 * Permanently deletes the signed-in account and everything it owns, after
 * the founder retypes their email. Signs out and returns home.
 */
export async function deleteAccount(
  confirmEmail: string,
): Promise<{ ok: false; error: AccountErrorKey }> {
  const session = await signedInClient();
  if (!session) return { ok: false, error: "signedOut" };
  const email = session.user.email ?? "";
  if (confirmEmail.trim().toLowerCase() !== email.toLowerCase())
    return { ok: false, error: "generic" };
  const { error } = await session.supabase.rpc("delete_my_account");
  if (error) return { ok: false, error: "generic" };
  await session.supabase.auth.signOut();
  redirect(routes.home);
}
