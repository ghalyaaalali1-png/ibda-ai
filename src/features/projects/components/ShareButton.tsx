"use client";

import { Check, Copy, Link2, Loader2, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { buttonClass } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";
import { setSharing } from "../actions";
import { useProject } from "../ProjectProvider";

/** "Share" in a saved project's tab bar: create, copy or turn off a read-only link to the plan. */
export function ShareButton() {
  const { t } = useI18n();
  const copy = t.share;
  const project = useProject();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(project?.shareToken ?? null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => setToken(project?.shareToken ?? null), [project?.shareToken]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!project) return null;
  const ready = project.status === "ready";
  const link = token && typeof window !== "undefined" ? `${window.location.origin}/share/${token}` : "";

  const change = (on: boolean) =>
    start(async () => {
      setFailed(false);
      setCopied(false);
      const result = await setSharing(project.id, on).catch(() => ({ ok: false, token: null }));
      if (!result.ok) return setFailed(true);
      setToken(result.token);
      router.refresh();
    });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFailed(false);
          setOpen(true);
        }}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm text-brand-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        <Share2 aria-hidden className="size-3.5" />
        {copy.button}
        {token && <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" />}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/70 p-4 backdrop-blur-sm" onClick={() => !pending && setOpen(false)}>
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-title"
              className="glass w-full max-w-md rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="share-title" className="flex items-center gap-2 text-lg font-semibold text-white">
                <Link2 aria-hidden className="size-4 text-brand-300" />
                {copy.title}
              </h2>

              {!ready ? (
                <p className="mt-3 text-sm leading-relaxed text-mist/70">{copy.notReady}</p>
              ) : token ? (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-mist/70">{copy.onBody}</p>
                  <label className="mt-4 block text-sm font-medium text-mist/80">
                    {copy.linkLabel}
                    <input
                      readOnly
                      value={link}
                      dir="ltr"
                      onFocus={(e) => e.currentTarget.select()}
                      className="mt-1.5 block h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm text-white focus:border-brand-400/60 focus:outline-none"
                    />
                  </label>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={copyLink} className={buttonClass("primary", "sm")}>
                      {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
                      {copied ? copy.copied : copy.copy}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => change(false)}
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {pending && <Loader2 aria-hidden className="size-3.5 animate-spin" />}
                      {copy.turnOff}
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-mist/55">{copy.turnOffHint}</p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-mist/70">{copy.offBody}</p>
                  <button type="button" disabled={pending} onClick={() => change(true)} className={buttonClass("primary", "sm", "mt-5")}>
                    {pending ? <Loader2 aria-hidden className="size-3.5 animate-spin" /> : <Link2 aria-hidden className="size-3.5" />}
                    {pending ? copy.working : copy.create}
                  </button>
                </>
              )}

              {failed && (
                <p role="alert" className="mt-3 text-sm text-[#fcc95a]">
                  {copy.failed}
                </p>
              )}
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={() => setOpen(false)} className={buttonClass("ghost", "sm")}>
                  {copy.close}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
