"use client";

import { FolderOpen, Home, RotateCw } from "lucide-react";
import { routes } from "@/config/site";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/i18n/I18nProvider";

/** A branded full-page message: "page not found", or an error with a retry. */
export function StatusScreen({ kind, onRetry }: { kind: "notFound" | "error"; onRetry?: () => void }) {
  const { t } = useI18n();
  const copy = t.statusPage;
  const notFound = kind === "notFound";
  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <header className="border-b border-white/[0.06]">
        <Container className="flex h-16 items-center">
          <Logo />
        </Container>
      </header>
      <main className="flex flex-1 items-center">
        <Container className="flex max-w-xl flex-col items-center py-20 text-center">
          {notFound && (
            <p className="text-gradient text-7xl font-semibold tracking-tight sm:text-8xl" aria-hidden>
              {copy.notFoundCode}
            </p>
          )}
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {notFound ? copy.notFoundTitle : copy.errorTitle}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-mist/65">{notFound ? copy.notFoundBody : copy.errorBody}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {onRetry && (
              <button type="button" onClick={onRetry} className={buttonClass("primary", "md")}>
                <RotateCw aria-hidden className="size-4" />
                {copy.tryAgain}
              </button>
            )}
            <ButtonLink href={routes.home} variant={onRetry ? "secondary" : "primary"}>
              <Home aria-hidden className="size-4" />
              {copy.home}
            </ButtonLink>
            <ButtonLink href={routes.projects} variant="secondary">
              <FolderOpen aria-hidden className="size-4" />
              {copy.myProjects}
            </ButtonLink>
          </div>
        </Container>
      </main>
    </div>
  );
}
