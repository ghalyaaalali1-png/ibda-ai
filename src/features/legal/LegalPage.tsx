import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { getLocale, getServerDictionary } from "@/i18n/server";
import { legalDocument, type LegalPageId } from "./content";

export async function legalMetadata(page: LegalPageId): Promise<Metadata> {
  const t = await getServerDictionary();
  const doc = legalDocument(page, await getLocale());
  return { title: `${doc.title} — ${t.locale === "ar" ? t.common.brandArabic : t.common.brand}`, description: doc.intro };
}

/** The privacy policy or terms of use, in the interface language. */
export async function LegalPage({ page }: { page: LegalPageId }) {
  const t = await getServerDictionary();
  const doc = legalDocument(page, await getLocale());
  const other: LegalPageId = page === "privacy" ? "terms" : "privacy";

  return (
    <Container className="max-w-3xl py-28 sm:py-36">
      <p className="text-sm text-mist/55">{doc.updated}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{doc.title}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-mist/70">{doc.intro}</p>

      <div className="mt-10 space-y-9">
        {doc.sections.map((section, i) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-white">
              <span className="me-2 text-brand-300">{i + 1}.</span>
              {section.heading}
            </h2>
            {section.items && (
              <ul className="mt-3 space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="relative ps-5 text-[15px] leading-relaxed text-mist/70">
                    <span aria-hidden className="absolute start-0 top-[0.7em] size-1.5 rounded-full bg-brand-400/70" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {section.paragraphs?.map((p) => (
              <p key={p} className="mt-3 text-[15px] leading-relaxed text-mist/70">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-white/[0.06] pt-6 text-sm text-mist/55">
        <Link href={routes[other]} className="font-medium text-brand-300 hover:text-brand-200">
          {t.nav[other]}
        </Link>
      </p>
    </Container>
  );
}
