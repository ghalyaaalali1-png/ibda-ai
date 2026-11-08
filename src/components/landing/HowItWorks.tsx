import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getServerDictionary } from "@/i18n/server";

export async function HowItWorks() {
  const t = await getServerDictionary();
  const copy = t.landing.howItWorks;
  return (
    <section id="how-it-works" className="relative py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-[400px] max-w-4xl -translate-y-1/2 rounded-full bg-brand-600/10 blur-[120px]"
      />
      <Container>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

        <ol className="relative mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
          {/* Connecting line (desktop) */}
          <span
            aria-hidden
            className="absolute top-7 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-brand-500/0 via-brand-400/50 to-electric-400/0 md:block"
          />
          {copy.steps.map((step, i) => (
            <li key={step.title} className="relative text-center">
              <span className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-brand-400/30 bg-ink-900 font-mono text-sm font-medium text-brand-300 shadow-[0_0_40px_-8px_rgb(139_108_255/0.6)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mx-auto mt-2.5 max-w-xs text-[15px] leading-relaxed text-mist/55">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        {/* The agent's working loop */}
        <ol
          aria-label={copy.processLabel}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-2 gap-y-3 font-mono text-xs text-mist/60"
        >
          {copy.process.map((verb, i) => (
            <li key={verb} className="flex items-center gap-2">
              <span className="rounded-full border border-brand-400/20 bg-brand-500/[0.07] px-3 py-1 text-brand-300">
                {verb}
              </span>
              {i < copy.process.length - 1 && (
                <ArrowRight aria-hidden className="size-3.5 text-mist/30 rtl:-scale-x-100" />
              )}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
