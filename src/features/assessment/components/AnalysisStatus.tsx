"use client";

import { AlertTriangle, ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { routes } from "@/config/site";
import { displayError } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";

export type StatusScreen = "plan" | "suppliers" | "marketing" | "launchPack" | "workspace";

export type StatusState = "checking" | "translating" | "unavailable" | "translationFailed";

/**
 * Stands in for a results screen while saved results are read or translated
 * into the interface language, or when the founder's analysis isn't
 * available — so the abaya demo is never shown as their result.
 */
export function AnalysisStatus({
  state,
  screen,
  message,
  onRetry,
}: {
  state: StatusState;
  screen: StatusScreen;
  /** Why the translation failed (translationFailed only). */
  message?: string;
  onRetry?: () => void;
}) {
  const { t } = useI18n();
  const name = t.status.screens[screen];
  const failedTranslation = state === "translationFailed";
  const buttonClass =
    "group inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 text-sm font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_40px_-6px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo />
            <span aria-hidden className="hidden h-5 w-px bg-white/10 sm:block" />
            <span className="hidden text-sm font-medium text-mist/80 sm:block">{name}</span>
          </div>
          <LanguageSwitcher />
        </Container>
      </header>

      <Container className="py-16 sm:py-24">
        {state === "checking" || state === "translating" ? (
          <div role="status" className="flex flex-col items-center gap-3 text-center">
            <Loader2 aria-hidden className="size-6 animate-spin text-brand-300" />
            <p className="text-sm text-mist/55">
              {state === "translating" ? t.status.translating(name) : t.status.loading(name)}
            </p>
          </div>
        ) : (
          <section
            aria-labelledby="unavailable-title"
            className="glass relative mx-auto max-w-xl overflow-hidden rounded-3xl p-6 text-center sm:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-28 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[#fab219]/10 blur-3xl"
            />
            <span className="relative mx-auto grid size-12 place-items-center rounded-2xl border border-[#fab219]/30 bg-[#fab219]/10 text-[#fcc95a]">
              <AlertTriangle className="size-5" />
            </span>
            <h1 id="unavailable-title" className="relative mt-5 text-2xl font-semibold tracking-tight text-white">
              {failedTranslation ? t.status.translationFailedTitle : t.status.unavailableTitle}
            </h1>
            <p className="relative mt-3 text-[15px] leading-relaxed text-mist/60">
              {failedTranslation ? displayError(t, message ?? t.genericError) : t.status.unavailableBody(name)}
            </p>
            <div className="relative mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {failedTranslation ? (
                <button type="button" onClick={onRetry} className={buttonClass}>
                  <RotateCcw className="size-4" />
                  {t.analysis.tryAgain}
                </button>
              ) : (
                <Link href={routes.analysis} className={buttonClass}>
                  <RotateCcw className="size-4" />
                  {t.analysis.tryAgain}
                </Link>
              )}
              <Link
                href={routes.start}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-mist/55 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-3.5 rtl:-scale-x-100" />
                {t.common.startOver}
              </Link>
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
