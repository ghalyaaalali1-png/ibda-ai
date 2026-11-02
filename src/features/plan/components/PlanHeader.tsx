"use client";

import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/i18n/I18nProvider";

export function PlanHeader({ profileLine }: { profileLine: string }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Logo />
          <span aria-hidden className="hidden h-5 w-px bg-white/10 sm:block" />
          <span className="hidden text-sm font-medium text-mist/80 sm:block">{t.common.businessPlan}</span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden truncate text-sm text-mist/50 lg:block">{profileLine}</span>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/25 sm:inline-flex bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Check className="size-3" />
            {t.plan.planReady}
          </span>
          <Link
            href={routes.analysis}
            aria-label={t.plan.backToWorkspace}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-mist/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="size-3.5 rtl:-scale-x-100" />
            <span aria-hidden className="hidden md:inline">{t.common.workspace}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </Container>
    </header>
  );
}
