"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks, routes } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

export function Navbar() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        open
          ? "border-b border-white/[0.06] bg-ink-950/95 backdrop-blur-xl"
          : scrolled
            ? "border-b border-white/[0.06] bg-ink-950/75 backdrop-blur-xl"
            : "border-b border-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-3">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label={t.nav.main}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-mist/65 transition-colors hover:text-white"
            >
              {t.nav[link.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <ButtonLink href={routes.start} size="sm">
              {t.common.startMyBusiness}
            </ButtonLink>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full text-mist/80 hover:bg-white/5 md:hidden"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      {open && (
        <Container className="pb-6 md:hidden">
          <nav className="flex flex-col gap-1" aria-label={t.nav.mobile}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base text-mist/80 hover:bg-white/5"
              >
                {t.nav[link.key]}
              </Link>
            ))}
            <ButtonLink href={routes.start} onClick={() => setOpen(false)} className="mt-3">
              {t.common.startMyBusiness}
            </ButtonLink>
          </nav>
        </Container>
      )}
    </header>
  );
}
