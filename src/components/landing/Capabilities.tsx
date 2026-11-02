import { capabilityIcons } from "@/content/landing";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getServerDictionary } from "@/i18n/server";
import { cn } from "@/lib/cn";

// Bento layout on large screens: two wide cards, then three.
const spans = [
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
];

export async function Capabilities() {
  const t = await getServerDictionary();
  const copy = t.landing.capabilities;
  return (
    <section id="capabilities" className="relative py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={
            <>
              {copy.titleStart} <span className="text-gradient">{copy.titleHighlight}</span>
            </>
          }
          description={copy.description}
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {copy.items.map((cap, i) => {
            const Icon = capabilityIcons[i];
            return (
              <article
                key={cap.title}
                className={cn(
                  "group glass relative overflow-hidden rounded-3xl p-7 transition-colors duration-300 hover:border-brand-400/25",
                  spans[i],
                  i === copy.items.length - 1 && "sm:col-span-2 lg:col-span-2",
                )}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -end-24 size-56 rounded-full bg-brand-500/0 blur-3xl transition-colors duration-500 group-hover:bg-brand-500/20"
                />
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl border border-brand-400/25 bg-gradient-to-br from-brand-500/25 to-electric-500/10 text-brand-300">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-[11px] tracking-wider text-brand-300/70 uppercase">
                    {cap.verb}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">
                  {cap.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-mist/55">
                  {cap.description}
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {cap.outputs.map((o) => (
                    <li
                      key={o}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-mist/65"
                    >
                      {o}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
