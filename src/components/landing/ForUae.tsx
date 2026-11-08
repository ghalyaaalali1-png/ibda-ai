import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getServerDictionary } from "@/i18n/server";

export async function ForUae() {
  const t = await getServerDictionary();
  const copy = t.landing.uae;
  return (
    <section id="uae" className="relative py-20 sm:py-24">
      <Container>
        <div className="glass relative overflow-hidden rounded-[2rem] p-8 sm:p-12 lg:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -start-32 size-96 rounded-full bg-brand-600/20 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -end-20 -bottom-40 size-96 rounded-full bg-electric-500/15 blur-[100px]"
          />

          <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <SectionHeading
                align="start"
                eyebrow={copy.eyebrow}
                title={
                  <>
                    {copy.titleStart} <span className="text-gradient">{copy.titleHighlight}</span>
                  </>
                }
                description={copy.description}
              />
              <p
                lang="ar"
                dir="rtl"
                aria-hidden
                className="font-arabic mt-10 text-right text-4xl font-bold text-white/[0.08] sm:text-5xl lg:text-left"
              >
                خِطّة مشروعك
              </p>
            </div>

            <div className="lg:pt-12">
              <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
                {copy.points.map((point) => (
                  <div key={point.title} className="border-s border-brand-400/30 ps-5">
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
                {copy.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
