import Link from "next/link";
import { navLinks, routes } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { getServerDictionary } from "@/i18n/server";

const linkClass = "text-sm text-mist/55 transition-colors hover:text-white";

/** Logo and tagline, product and account links, and the copyright line. */
export async function Footer() {
  const t = await getServerDictionary();
  return (
    <footer className="border-t border-white/[0.06] bg-ink-950/60">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-[11px] tracking-[0.22em] text-mist/45 uppercase rtl:tracking-normal">{t.pdf.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-mist/55">{t.nav.footerTagline}</p>
        </div>
        <nav aria-label={t.nav.footer}>
          <h2 className="text-xs font-semibold tracking-wider text-mist/80 uppercase rtl:tracking-normal">{t.nav.product}</h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {t.nav[link.key]}
                </Link>
              </li>
            ))}
            <li>
              <Link href={routes.start} className={linkClass}>
                {t.common.startMyBusiness}
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label={t.nav.account}>
          <h2 className="text-xs font-semibold tracking-wider text-mist/80 uppercase rtl:tracking-normal">{t.nav.account}</h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            <li>
              <Link href={routes.login} className={linkClass}>
                {t.auth.logIn}
              </Link>
            </li>
            <li>
              <Link href={routes.signup} className={linkClass}>
                {t.auth.signUp}
              </Link>
            </li>
            <li>
              <Link href={routes.projects} className={linkClass}>
                {t.auth.myProjects}
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
      <div className="border-t border-white/[0.05]">
        <Container className="flex flex-col gap-2 py-6 text-xs text-mist/40 sm:flex-row sm:items-center sm:justify-between">
          <p>{t.nav.copyright(new Date().getFullYear())}</p>
          <p>{t.nav.disclaimer}</p>
        </Container>
      </div>
    </footer>
  );
}
