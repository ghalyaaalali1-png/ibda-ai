import { FileDown, FolderCheck, History, Languages } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { demoFor } from "@/features/demo/localizedDemo";
import { profileValue } from "@/features/launch-profile/profile";
import { displayValue } from "@/i18n";
import { getServerDictionary } from "@/i18n/server";

const featureIcons = [FolderCheck, History, FileDown, Languages];

/** "What you get": a real plan card from the demo, and what saved plans can do. */
export async function PlanPreview() {
  const t = await getServerDictionary();
  const copy = t.landing.preview;
  const plan = demoFor(t.locale).plan;
  const price = plan.unitEconomics.price;
  const productCost = plan.unitEconomics.costs.filter((c) => c.kind === "product").reduce((sum, c) => sum + c.amount, 0);
  const margin = price > 0 ? Math.round(((price - productCost) / price) * 100) : 0;
  const tiles = [
    { label: t.plan.tiles.budget, value: t.fmt.aed(plan.budget.total) },
    { label: t.plan.tiles.price, value: t.fmt.aedRange(plan.pricing.min, plan.pricing.max) },
    { label: t.plan.tiles.margin, value: `${margin}%` },
    { label: t.plan.tiles.breakEven, value: plan.breakEven.month === null ? t.plan.beyondMonth(6) : t.plan.month(plan.breakEven.month) },
  ];

  return (
    <section id="what-you-get" className="relative py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-[380px] max-w-5xl rounded-full bg-electric-500/10 blur-[130px]"
      />
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <SectionHeading align="start" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {copy.features.map((feature, i) => {
              const Icon = featureIcons[i];
              return (
                <li key={feature.title} className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-electric-400/25 bg-gradient-to-br from-electric-500/20 to-brand-500/15 text-electric-300">
                    <Icon aria-hidden className="size-[18px]" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-white">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-mist/55">{feature.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* A real plan card from the demo business. */}
        <figure aria-label={copy.sample} className="glass relative rounded-3xl p-6 shadow-[0_30px_80px_-30px_rgb(61_123_245/0.45)] sm:p-8">
          <figcaption className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium tracking-wide text-mist/50 uppercase rtl:tracking-normal">{copy.sample}</span>
            <span className="text-xs text-mist/45">{displayValue(t, profileValue(plan.profile, "business") ?? "")}</span>
          </figcaption>
          <div className="mt-5 flex items-center gap-5">
            <div
              className="relative grid size-20 shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--color-electric-400) 0%, var(--color-brand-400) ${plan.decision.score}%, rgb(255 255 255 / 0.08) ${plan.decision.score}%)`,
              }}
            >
              <span className="grid size-[68px] place-items-center rounded-full bg-ink-900 text-2xl font-semibold text-white">
                {plan.decision.score}
              </span>
            </div>
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                {t.plan.decision.verdicts[plan.decision.verdict]}
              </span>
              <p className="mt-2 text-lg leading-snug font-semibold text-white">{plan.decision.headline}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            {tiles.map((tile) => (
              <div key={tile.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <dt className="text-[11px] font-medium tracking-wider text-mist/45 uppercase rtl:tracking-normal">{tile.label}</dt>
                <dd className="mt-1.5 text-lg font-semibold text-white">{tile.value}</dd>
              </div>
            ))}
          </dl>
        </figure>
      </Container>
    </section>
  );
}
