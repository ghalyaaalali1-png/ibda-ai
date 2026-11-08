import { ArrowRight } from "lucide-react";
import { routes } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getServerDictionary } from "@/i18n/server";

export async function FinalCta() {
  const t = await getServerDictionary();
  const copy = t.landing.finalCta;
  return (
    <section id="get-started" className="relative py-20 sm:py-24">
      <Container>
        <div className="relative mx-auto max-w-3xl text-center">
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/2 -z-10 mx-auto h-64 max-w-xl -translate-y-1/2 rounded-full bg-brand-600/30 blur-[100px]"
          />
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{copy.title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-mist/60">{copy.description}</p>

          {/* Idea prompt preview */}
          <div className="glass mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl p-2 text-start sm:flex-row sm:items-center sm:rounded-full sm:ps-6">
            <p className="flex-1 px-4 pt-2 text-sm leading-snug text-mist/55 sm:px-0 sm:pt-0">
              &ldquo;{t.landing.demoIdea}&rdquo;
            </p>
            <ButtonLink href={routes.start} className="shrink-0">
              {t.common.startMyBusiness}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
