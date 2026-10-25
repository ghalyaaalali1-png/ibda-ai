import Link from "next/link";
import { navLinks, siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <Container className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo />
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-mist/50 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-mist/35">
          © {new Date().getFullYear()} {siteConfig.name}. Made in the UAE.
        </p>
      </Container>
    </footer>
  );
}
