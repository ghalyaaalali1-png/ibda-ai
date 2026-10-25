import { uaePoints } from "@/content/landing";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ForUae() {
  return (
    <section id="uae" className="relative py-24 sm:py-32">
      <Container>
        <div className="glass relative overflow-hidden rounded-[2rem] p-8 sm:p-12 lg:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-brand-600/20 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -bottom-40 size-96 rounded-full bg-electric-500/15 blur-[100px]"
          />

          <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <SectionHeading
                align="left"
                eyebrow="For UAE Entrepreneurs"
                title={
                  <>
                    Built for founders <span className="text-gradient">launching in the UAE.</span>
                  </>
                }
                description="Generic business advice doesn't know the difference between a mainland license and a free zone. Ibda guides you through it — step by step, in AED."
              />
              <p
                lang="ar"
                dir="rtl"
                className="font-arabic mt-10 text-right text-4xl font-bold text-white/[0.08] sm:text-5xl lg:text-left"
              >
                ابدأ مشروعك
              </p>
            </div>

            <div className="lg:pt-12">
              <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
                {uaePoints.map((point) => (
                  <div key={point.title} className="border-l border-brand-400/30 pl-5">
                    <dt className="text-base font-semibold text-white">
                      {point.title}
                    </dt>
                    <dd className="mt-2 text-[15px] leading-relaxed text-mist/55">
                      {point.description}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-10 border-t border-white/[0.06] pt-6 text-xs leading-relaxed text-mist/40">
                Ibda&apos;s UAE setup information is guidance based on current
                requirements and official sources — not legal advice. Confirm
                final requirements with the relevant licensing authority.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
