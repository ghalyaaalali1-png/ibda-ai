"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/i18n/I18nProvider";

export function OnboardingHeader({
  progress,
  onReset,
}: {
  /** 0–1 while questions are in progress; hidden when undefined. */
  progress?: number;
  onReset?: () => void;
}) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="hidden lg:block">
            <Eyebrow>{t.common.tagline}</Eyebrow>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              aria-label={t.common.startOver}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-mist/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <RotateCcw className="size-3.5" />
              <span aria-hidden className="hidden sm:inline">{t.common.startOver}</span>
            </button>
          )}
          <Link
            href={routes.home}
            aria-label={t.common.backToHome}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-mist/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="size-3.5 rtl:-scale-x-100" />
            <span aria-hidden className="hidden sm:inline">{t.common.backToHome}</span>
          </Link>
          <LanguageSwitcher className="ms-1" />
        </div>
      </Container>
      {progress !== undefined && (
        <div
          role="progressbar"
          aria-label={t.onboarding.progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="absolute inset-x-0 -bottom-px h-px bg-white/5"
        >
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-electric-400 transition-[width] duration-500 ease-out rtl:bg-gradient-to-l"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </header>
  );
}
