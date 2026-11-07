"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Header for the account screens: logo, back to home, language. `actions`
 * adds controls (log out, say); `tabs` adds a second row (a project's tab bar).
 */
export function AuthHeader({ actions, tabs }: { actions?: React.ReactNode; tabs?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-1">
          {actions}
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
      {tabs}
    </header>
  );
}
