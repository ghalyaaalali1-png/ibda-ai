"use client";

import { ExternalLink } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { sourceText, uaePortal, type OfficialSource } from "../officialSources";

/**
 * A labelled link to a verified official source, opening the authority's own
 * site. Without a verified authority it points to the federal UAE portal and
 * says so, rather than naming a body KHITTA isn't sure of.
 */
export function SourceLink({
  source,
  viaPortal,
  asAuthority = true,
}: {
  source?: OfficialSource;
  viaPortal?: boolean;
  /** In steps and requirements, u.ae is where to verify — not the authority itself. */
  asAuthority?: boolean;
}) {
  const { t, locale } = useI18n();
  const portal = viaPortal || !source || (asAuthority && source.id === uaePortal.id);
  const target = portal ? uaePortal : source;
  return (
    <a
      href={target.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-brand-300 underline-offset-2 hover:text-white hover:underline"
    >
      {portal ? t.sources.verifyPortal : t.sources.officialSource(sourceText(target, locale).name)}
      <ExternalLink aria-hidden className="size-3" />
      <span className="sr-only">{t.common.opensInNewTab}</span>
    </a>
  );
}
