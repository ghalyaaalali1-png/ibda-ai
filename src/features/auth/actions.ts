"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/config/site";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNext } from "./redirects";

/** Keys of `auth.errors` in the dictionaries; the form shows them in the interface language. */
export type AuthErrorKey =
  | "missingFields"
  | "passwordTooShort"
  | "invalidEmail"
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "userExists"
  | "weakPassword"
  | "rateLimit"
  | "notConfigured"
  | "generic";

export type AuthFormState =
  | { status: "idle" }
  | { status: "error"; error: AuthErrorKey; email: string }
  | { status: "checkEmail"; email: string };

const MIN_PASSWORD = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A Supabase error code as a message key; unknown codes get the generic message. */
function errorKey(code: string | undefined): AuthErrorKey {
  switch (code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "user_already_exists":
    case "email_exists":
      return "userExists";
    case "weak_password":
      return "weakPassword";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rateLimit";
    case "email_address_invalid":
      return "invalidEmail";
    default:
      return "generic";
  }
}

function read(form: FormData) {
  return {
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
    name: String(form.get("name") ?? "").trim().slice(0, 120),
    next: safeNext(String(form.get("next") ?? "")),
  };
}

/** Logs in with email and password, then continues to `next` (My projects by default). */
export async function logIn(_previous: AuthFormState, form: FormData): Promise<AuthFormState> {
  const { email, password, next } = read(form);
  if (!hasSupabaseConfig()) return { status: "error", error: "notConfigured", email };
  if (!email || !password) return { status: "error", error: "missingFields", email };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", error: errorKey(error.code), email };
  redirect(next);
}

/**
 * Creates an account. Supabase emails a confirmation link that returns to
 * /auth/callback; until then the form asks the founder to check their email.
 */
export async function signUp(_previous: AuthFormState, form: FormData): Promise<AuthFormState> {
  const { email, password, name, next } = read(form);
  if (!hasSupabaseConfig()) return { status: "error", error: "notConfigured", email };
  if (!email || !password) return { status: "error", error: "missingFields", email };
  if (!EMAIL.test(email)) return { status: "error", error: "invalidEmail", email };
  if (password.length < MIN_PASSWORD) return { status: "error", error: "passwordTooShort", email };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { full_name: name } : {},
      emailRedirectTo: `${origin}${routes.authCallback}?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { status: "error", error: errorKey(error.code), email };
  // Supabase answers a sign-up for an existing, confirmed email with a user that has no identities.
  if (data.user && data.user.identities?.length === 0) return { status: "error", error: "userExists", email };
  // Signed in straight away when email confirmation is turned off in Supabase.
  if (data.session) redirect(next);
  return { status: "checkEmail", email };
}

/** Logs out and returns to the home page. */
export async function logOut() {
  if (hasSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect(routes.home);
}
