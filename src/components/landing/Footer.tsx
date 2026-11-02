import Link from "next/link";
import { navLinks } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { getServerDictionary } from "@/i18n/server";

export async function Footer() {
  const t = await getServerDictionary();
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <Container className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo />
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label={t.nav.footer}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-mist/50 transition-colors hover:text-white"
            >
              {t.nav[link.key]}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-mist/35">{t.nav.copyright(new Date().getFullYear())}</p>
      </Container>
    </footer>
  );
}
