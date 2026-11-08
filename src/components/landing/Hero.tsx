import { ArrowRight } from "lucide-react";
import { routes } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getServerDictionary } from "@/i18n/server";
import { AgentFlow } from "./AgentFlow";

export async function Hero() {
  const t = await getServerDictionary();
  const { hero } = t.landing;
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pb-32">
      {/* Background glow + grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[140px]" />
        <div className="absolute top-40 end-[-10%] h-[420px] w-[520px] rounded-full bg-electric-500/15 blur-[120px]" />
      </div>

      <Container className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="min-w-0 max-w-xl">
          <Eyebrow>{t.common.tagline}</Eyebrow>

          <h1 className="mt-6 text-[2.5rem] leading-[1.05] font-semibold tracking-tight text-white sm:text-6xl lg:text-[3.6rem] xl:text-[4rem] rtl:leading-[1.25]">
            {hero.titleStart}{" "}
            <span className="text-gradient">
              {hero.titleHighlight}
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-mist/65 sm:text-xl">{hero.subtitle}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.start} size="lg">
              {t.common.startMyBusiness}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href={routes.howItWorks} size="lg" variant="secondary">
              {hero.seeHowItWorks}
            </ButtonLink>
          </div>
        </div>

        <AgentFlow />
      </Container>
    </section>
  );
}
