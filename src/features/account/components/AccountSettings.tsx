"use client";

import { Check, KeyRound, Loader2, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { routes } from "@/config/site";
import { buttonClass } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";
import {
  changePassword,
  deleteAccount,
  updateName,
  type AccountErrorKey,
  type AccountFormState,
} from "../actions";
import type { AccountDetails } from "../server";

const inputClass =
  "mt-1.5 block h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-[15px] text-white placeholder:text-mist/30 transition-colors focus:border-brand-400/60 focus:bg-white/[0.05] focus:outline-none";

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-3xl p-6 sm:p-7">
      <h2 className="flex items-center gap-2.5 text-lg font-semibold text-white">
        <span className="grid size-8 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-300">
          <Icon aria-hidden className="size-4" />
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Feedback({
  state,
  saved,
}: {
  state: AccountFormState;
  saved: string;
}) {
  const { t } = useI18n();
  if (state.status === "saved")
    return (
      <p
        role="status"
        className="flex items-center gap-1.5 text-sm text-emerald-300"
      >
        <Check aria-hidden className="size-4" />
        {saved}
      </p>
    );
  if (state.status === "error")
    return (
      <p
        role="alert"
        className="rounded-xl border border-[#fab219]/25 bg-[#fab219]/10 px-3.5 py-2.5 text-sm text-[#fcc95a]"
      >
        {t.auth.account.errors[state.error]}
      </p>
    );
  return null;
}

function NameForm({ account }: { account: AccountDetails }) {
  const { t } = useI18n();
  const copy = t.auth.account;
  const [state, action, pending] = useActionState(updateName, {
    status: "idle",
  } as AccountFormState);
  // Controlled, so the box keeps what was typed after saving (React resets uncontrolled fields).
  const [name, setName] = useState(account.name);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="text-sm font-medium text-mist/80">
        {copy.name}
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          dir="auto"
          autoComplete="name"
          className={inputClass}
        />
      </label>
      <div className="text-sm font-medium text-mist/80">
        {copy.email}
        <p
          dir="ltr"
          className="mt-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-[15px] text-mist/70 rtl:text-right"
        >
          {account.email}
        </p>
        <p className="mt-1.5 text-xs font-normal text-mist/45">
          {copy.emailNote}
        </p>
      </div>
      <Feedback state={state} saved={copy.saved} />
      <button
        type="submit"
        disabled={pending}
        className={buttonClass("primary", "md", "self-start")}
      >
        {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {pending ? copy.saving : copy.save}
      </button>
    </form>
  );
}

function PasswordForm({ account }: { account: AccountDetails }) {
  const { t } = useI18n();
  const copy = t.auth.account;
  const [state, action, pending] = useActionState(changePassword, {
    status: "idle",
  } as AccountFormState);
  const [formKey, setFormKey] = useState(0);
  // Clear the fields once the new password is saved.
  useEffect(() => {
    if (state.status === "saved") setFormKey((k) => k + 1);
  }, [state]);

  if (!account.hasPassword)
    return (
      <p className="text-[15px] leading-relaxed text-mist/65">
        {copy.googleOnly}
      </p>
    );

  return (
    <form key={formKey} action={action} className="flex flex-col gap-4">
      <label className="text-sm font-medium text-mist/80">
        {copy.currentPassword}
        <input
          name="current"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <label className="text-sm font-medium text-mist/80">
        {t.auth.reset.newPassword}
        <span className="font-normal text-mist/40">
          {" "}
          · {t.auth.fields.passwordHint}
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <label className="text-sm font-medium text-mist/80">
        {t.auth.reset.confirm}
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <Feedback state={state} saved={copy.passwordSaved} />
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary", "md")}
        >
          {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
          {pending ? copy.saving : copy.changePassword}
        </button>
        <Link
          href={routes.forgotPassword}
          className="text-sm text-mist/55 hover:text-white"
        >
          {t.auth.forgot.link}
        </Link>
      </div>
    </form>
  );
}

function DeleteAccount({ account }: { account: AccountDetails }) {
  const { t } = useI18n();
  const copy = t.auth.account;
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<AccountErrorKey | null>(null);
  const [pending, start] = useTransition();
  const matches = typed.trim().toLowerCase() === account.email.toLowerCase();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && !pending && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending]);

  return (
    <>
      <p className="text-[15px] leading-relaxed text-mist/65">
        {copy.deleteBody}
      </p>
      <button
        type="button"
        onClick={() => {
          setTyped("");
          setError(null);
          setOpen(true);
        }}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
      >
        <Trash2 aria-hidden className="size-4" />
        {copy.deleteButton}
      </button>

      {/* Rendered at the page root: the card's blur would otherwise trap a fixed overlay inside it. */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/70 p-4 backdrop-blur-sm"
            onClick={() => !pending && setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-title"
              className="glass w-full max-w-md rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                id="delete-account-title"
                className="text-lg font-semibold text-white"
              >
                {copy.confirmTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-mist/65">
                {copy.confirmBody}
              </p>
              <form
                className="mt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!matches) return;
                  start(async () => {
                    setError(null);
                    // On success the action signs out and leaves this page.
                    const result = await deleteAccount(typed).catch(() => ({
                      ok: false as const,
                      error: "generic" as const,
                    }));
                    if (result && !result.ok) setError(result.error);
                  });
                }}
              >
                <label className="text-sm font-medium text-mist/80">
                  {copy.confirmLabel}
                  <span
                    dir="ltr"
                    className="mt-1 block text-xs font-normal text-mist/50 rtl:text-right"
                  >
                    {account.email}
                  </span>
                  <input
                    autoFocus
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    type="email"
                    dir="ltr"
                    autoComplete="off"
                    className={inputClass}
                  />
                </label>
                {error && (
                  <p role="alert" className="mt-3 text-sm text-[#fcc95a]">
                    {copy.errors[error]}
                  </p>
                )}
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setOpen(false)}
                    className={buttonClass("ghost", "sm")}
                  >
                    {copy.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={pending || !matches}
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-red-500/90 px-4 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-40"
                  >
                    {pending && (
                      <Loader2 aria-hidden className="size-3.5 animate-spin" />
                    )}
                    {copy.confirmButton}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/** Account settings: name, password, and deleting the account. */
export function AccountSettings({ account }: { account: AccountDetails }) {
  const { t } = useI18n();
  const copy = t.auth.account;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm text-mist/55">{copy.subtitle}</p>
      </div>
      <Card icon={UserRound} title={copy.detailsTitle}>
        <NameForm account={account} />
      </Card>
      <Card icon={KeyRound} title={copy.passwordTitle}>
        <PasswordForm account={account} />
      </Card>
      <Card icon={Trash2} title={copy.deleteTitle}>
        <DeleteAccount account={account} />
      </Card>
    </div>
  );
}
