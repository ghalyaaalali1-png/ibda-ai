import { Check, Clock, MapPin, Package, Plus, Send, Sparkles, Tag, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { leadTimeLabel, moqLabel, priceLabel } from "../format";
import type { Supplier } from "../types";
import { MatchScore } from "./MatchScore";
import type { RfqStatus } from "./RfqDrawer";

export function SupplierCard({
  supplier,
  categoryLabel,
  badge,
  inCompare,
  compareFull,
  rfqStatus,
  onToggleCompare,
  onRequestQuote,
}: {
  supplier: Supplier;
  categoryLabel: string;
  /** e.g. "Demo supplier" or "Supplier type". */
  badge: string;
  inCompare: boolean;
  compareFull: boolean;
  rfqStatus?: RfqStatus;
  onToggleCompare: () => void;
  onRequestQuote: () => void;
}) {
  const s = supplier;
  return (
    <article
      className={cn(
        "glass relative flex animate-message-in flex-col rounded-3xl p-5 sm:p-6",
        s.recommended && "border-brand-400/35 shadow-[0_0_50px_-24px_rgb(139_108_255/0.8)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {s.recommended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-brand-300 uppercase">
                <Sparkles className="size-3" />
                Ibda pick
              </span>
            )}
            <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] tracking-wide text-mist/45 uppercase">
              {badge}
            </span>
          </div>
          <h3 className="mt-2.5 text-base font-semibold text-white">{s.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-mist/50">
            <MapPin className="size-3 shrink-0" />
            {s.location}
            {s.region === "Overseas" && (
              <span className="rounded bg-white/[0.06] px-1.5 text-[10px] text-mist/60">Overseas</span>
            )}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] tracking-wider text-mist/40 uppercase">Ibda match</p>
          <div className="mt-1.5">
            <MatchScore score={s.matchScore} compact />
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-mist/70">
        <span className="text-mist/40">{categoryLabel} · </span>
        {s.offering}
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        {[
          { icon: Tag, label: "Est. price", value: priceLabel(s), sub: s.price.unit },
          { icon: Package, label: "MOQ", value: moqLabel(s) },
          { icon: Clock, label: "Lead time", value: leadTimeLabel(s) },
        ].map((f) => (
          <div key={f.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
            <dt className="flex items-center gap-1 text-[10px] tracking-wide text-mist/40 uppercase">
              <f.icon className="size-3" />
              {f.label}
            </dt>
            <dd className="mt-1 text-[13px] leading-snug font-medium text-white">{f.value}</dd>
            {f.sub && <dd className="text-[11px] text-mist/40">{f.sub}</dd>}
          </div>
        ))}
      </dl>

      <div className="mt-4 space-y-1.5 text-[13px] leading-snug">
        <p className="text-mist/80">
          <span className="text-mist/40">Best for: </span>
          {s.bestFor}
        </p>
        {s.matchReasons.map((r) => (
          <p key={r} className="flex gap-1.5 text-mist/60">
            <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
            {r}
          </p>
        ))}
        {s.watchOut && (
          <p className="flex gap-1.5 text-[#fcc95a]/85">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            {s.watchOut}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <button
          type="button"
          onClick={onRequestQuote}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-4 text-sm font-medium text-white shadow-[0_6px_20px_-8px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
        >
          <Send className="size-3.5" />
          {rfqStatus ? "Open RFQ" : "Request quote"}
        </button>
        <button
          type="button"
          onClick={onToggleCompare}
          disabled={!inCompare && compareFull}
          aria-pressed={inCompare}
          title={!inCompare && compareFull ? "You can compare up to 4 suppliers" : undefined}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors disabled:opacity-40",
            inCompare
              ? "border-brand-400/40 bg-brand-500/15 text-brand-300"
              : "border-white/10 text-mist/70 hover:bg-white/5 hover:text-white",
          )}
        >
          {inCompare ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
          {inCompare ? "Comparing" : "Compare"}
        </button>
        {rfqStatus && (
          <span
            className={cn(
              "ml-auto rounded-full px-2.5 py-1 text-[11px] font-medium",
              rfqStatus === "sent"
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-white/[0.06] text-mist/60",
            )}
          >
            {rfqStatus === "sent" ? "RFQ marked sent" : "RFQ drafted"}
          </span>
        )}
      </div>
    </article>
  );
}
