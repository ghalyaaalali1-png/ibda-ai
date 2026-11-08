"use client";

import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { routes } from "@/config/site";
import { buttonClass } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";
import { requestPasswordReset, setNewPassword, type NewPasswordState, type ResetRequestState } from "../actions";

const inputClass =
  "mt-1.5 block h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-[15px] text-white placeholder:text-mist/30 transition-colors focus:border-brand-400/60 focus:bg-white/[0.05] focus:outline-none rtl:text-right";

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-xl border border-[#fab219]/25 bg-[#fab219]/10 px-3.5 py-2.5 text-sm text-[#fcc95a]">
      {children}
    </p>
  );
}

/** Asks for the account email and sends a reset link. */
export function ForgotPasswordForm() {
  const { t } = useI18n();
  const copy = t.auth.forgot;
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(requestPasswordReset, { status: "idle" });

  if (state.status === "sent") {
    return (
      <section role="status" aria-labelledby="forgot-title" className="glass rounded-3xl p-6 text-center sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-brand-400/30 bg-brand-500/10 text-brand-300">
          <MailCheck className="size-5" />
        </span>
        <h1 id="forgot-title" className="mt-5 text-2xl font-semibold tracking-tight text-white">
          {copy.sentTitle}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mist/65">{copy.sentBody(state.email)}</p>
        <p className="mt-2 text-sm text-mist/45">{t.auth.signup.checkEmailHint}</p>
        <Link href={routes.login} className="mt-6 inline-block text-sm font-medium text-brand-300 hover:text-brand-200">
          {copy.back}
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="forgot-title" className="glass rounded-3xl p-6 sm:p-8">
      <h1 id="forgot-title" className="text-2xl font-semibold tracking-tight text-white">
        {copy.title}
      </h1>
      <p className="mt-2 text-[15px] text-mist/60">{copy.subtitle}</p>
      <form action={action} className="mt-7 flex flex-col gap-4" noValidate>
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
        {state.status === "error" && <Alert>{t.auth.errors[state.error]}</Alert>}
        <button type="submit" disabled={pending} className={buttonClass("primary", "md", "w-full")}>
          {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
          {pending ? copy.submitting : copy.submit}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href={routes.login} className="font-medium text-brand-300 hover:text-brand-200">
          {copy.back}
        </Link>
      </p>
    </section>
  );
}

/** Sets a new password for the user signed in by the reset link. */
export function ResetPasswordForm({ expired }: { expired: boolean }) {
  const { t } = useI18n();
  const copy = t.auth.reset;
  const [state, action, pending] = useActionState<NewPasswordState, FormData>(setNewPassword, { status: "idle" });
  const error = state.status === "error" ? state.error : expired ? "expired" : null;
  const message =
    error === "mismatch" ? copy.mismatch : error === "expired" ? copy.expired : error ? t.auth.errors[error] : null;

  return (
    <section aria-labelledby="reset-title" className="glass rounded-3xl p-6 sm:p-8">
      <h1 id="reset-title" className="text-2xl font-semibold tracking-tight text-white">
        {copy.title}
      </h1>
      <p className="mt-2 text-[15px] text-mist/60">{copy.subtitle}</p>
      {error === "expired" ? (
        <div className="mt-7 flex flex-col gap-4">
          <Alert>{message}</Alert>
          <Link href={routes.forgotPassword} className={buttonClass("primary", "md", "w-full")}>
            {copy.requestNew}
          </Link>
        </div>
      ) : (
        <form action={action} className="mt-7 flex flex-col gap-4" noValidate>
          <label className="text-sm font-medium text-mist/80">
            {copy.newPassword}
            <input name="password" type="password" dir="ltr" autoComplete="new-password" required minLength={8} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-mist/80">
            {copy.confirm}
            <input name="confirm" type="password" dir="ltr" autoComplete="new-password" required minLength={8} className={inputClass} />
          </label>
          {message && <Alert>{message}</Alert>}
          <button type="submit" disabled={pending} className={buttonClass("primary", "md", "w-full")}>
            {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
            {pending ? copy.submitting : copy.submit}
          </button>
        </form>
      )}
    </section>
  );
}
