"use client";

import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { routes } from "@/config/site";
import { buttonClass } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";
import { continueWithGoogle, logIn, signUp, type AuthErrorKey, type AuthFormState } from "../actions";
import { GoogleButton } from "./GoogleButton";

const inputClass =
  "mt-1.5 block h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-[15px] text-white placeholder:text-mist/50 transition-colors focus:border-brand-400/60 focus:bg-white/[0.05] focus:outline-none rtl:text-right";

/**
 * Log-in or sign-up form. `next` is where to go once signed in;
 * `initialError` shows a problem from an earlier step (an expired link, say).
 */
export function AuthForm({
  mode,
  next,
  initialError,
}: {
  mode: "login" | "signup";
  next?: string;
  initialError?: AuthErrorKey | "linkInvalid";
}) {
  const { t } = useI18n();
  const copy = mode === "login" ? t.auth.login : t.auth.signup;
  const [state, action, pending] = useActionState<AuthFormState, FormData>(mode === "login" ? logIn : signUp, {
    status: "idle",
  });
  const error = state.status === "error" ? state.error : state.status === "idle" ? initialError : undefined;
  const other = mode === "login" ? routes.signup : routes.login;
  const otherHref = next ? `${other}?next=${encodeURIComponent(next)}` : other;

  if (state.status === "checkEmail") {
    return (
      <section aria-labelledby="auth-title" role="status" className="glass rounded-3xl p-6 text-center sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-brand-400/30 bg-brand-500/10 text-brand-300">
          <MailCheck className="size-5" />
        </span>
        <h1 id="auth-title" className="mt-5 text-2xl font-semibold tracking-tight text-white">
          {t.auth.signup.checkEmailTitle}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mist/65">{t.auth.signup.checkEmailBody(state.email)}</p>
        <p className="mt-2 text-sm text-mist/55">{t.auth.signup.checkEmailHint}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="auth-title" className="glass rounded-3xl p-6 sm:p-8">
      <h1 id="auth-title" className="text-2xl font-semibold tracking-tight text-white">
        {copy.title}
      </h1>
      <p className="mt-2 text-[15px] text-mist/60">{copy.subtitle}</p>

      <form action={continueWithGoogle} className="mt-7">
        {next && <input type="hidden" name="next" value={next} />}
        <GoogleButton label={t.auth.continueWithGoogle} />
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-mist/55" aria-hidden>
        <span className="h-px flex-1 bg-white/10" />
        {t.auth.or}
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form action={action} className="flex flex-col gap-4" noValidate>
        {next && <input type="hidden" name="next" value={next} />}
        {mode === "signup" && (
          <label className="text-sm font-medium text-mist/80">
            {t.auth.fields.name} <span className="font-normal text-mist/55">({t.auth.fields.nameHint})</span>
            <input name="name" type="text" autoComplete="name" maxLength={120} className={inputClass} />
          </label>
        )}
        <label className="text-sm font-medium text-mist/80">
          {t.auth.fields.email}
          <input
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            required
            defaultValue={state.status === "error" ? state.email : undefined}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium text-mist/80">
          <span className="flex items-baseline justify-between gap-2">
            <span>
              {t.auth.fields.password}
              {mode === "signup" && <span className="font-normal text-mist/55"> · {t.auth.fields.passwordHint}</span>}
            </span>
            {mode === "login" && (
              <Link href={routes.forgotPassword} className="text-xs font-normal text-brand-300 hover:text-brand-200">
                {t.auth.forgot.link}
              </Link>
            )}
          </span>
          <input
            name="password"
            type="password"
            dir="ltr"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={mode === "signup" ? 8 : undefined}
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl border border-[#fab219]/25 bg-[#fab219]/10 px-3.5 py-2.5 text-sm text-[#fcc95a]">
            {t.auth.errors[error]}
          </p>
        )}

        <button type="submit" disabled={pending} className={buttonClass("primary", "md", "mt-1 w-full")}>
          {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
          {pending ? copy.submitting : copy.submit}
        </button>
      </form>

      {mode === "signup" && (
        <p className="mt-4 text-center text-xs leading-relaxed text-mist/55">
          {t.auth.signup.agreeStart}{" "}
          <Link href={routes.terms} className="text-mist/70 underline underline-offset-2 hover:text-white">
            {t.nav.terms}
          </Link>
          {t.auth.signup.agreeAnd}
          <Link href={routes.privacy} className="text-mist/70 underline underline-offset-2 hover:text-white">
            {t.nav.privacy}
          </Link>
          {t.auth.signup.agreeEnd}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-mist/55">
        {mode === "login" ? t.auth.login.noAccount : t.auth.signup.haveAccount}{" "}
        <Link href={otherHref} className="font-medium text-brand-300 hover:text-brand-200">
          {mode === "login" ? t.auth.login.toSignup : t.auth.signup.toLogin}
        </Link>
      </p>
    </section>
  );
}
