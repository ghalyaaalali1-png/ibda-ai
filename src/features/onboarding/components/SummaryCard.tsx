import { ArrowRight, Check, Loader2, Pencil } from "lucide-react";
import type { SummaryItem } from "../types";

export function SummaryCard({
  items,
  starting,
  onEdit,
  onStart,
}: {
  items: SummaryItem[];
  starting: boolean;
  onEdit: (questionIndex: number) => void;
  onStart: () => void;
}) {
  return (
    <div className="glass mt-4 overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-white">
          Here&apos;s what I understand
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 font-mono text-[11px] text-emerald-300">
          <Check className="size-3" />
          Ready
        </span>
      </div>

      <dl className="divide-y divide-white/[0.05] px-5 sm:px-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 py-3"
          >
            <dt className="text-sm text-mist/50">{item.label}</dt>
            <dd className="flex items-center gap-1 text-right text-sm font-medium text-white">
              {item.value}
              {(item.questionIndex === undefined || starting) && (
                <span aria-hidden className="size-7" />
              )}
              {item.questionIndex !== undefined && !starting && (
                <button
                  type="button"
                  onClick={() => onEdit(item.questionIndex!)}
                  aria-label={`Change ${item.label.toLowerCase()}`}
                  className="grid size-7 place-items-center rounded-full text-mist/35 transition-colors hover:bg-white/5 hover:text-mist"
                >
                  <Pencil className="size-3.5" />
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 py-6 sm:px-6">
        <button
          type="button"
          onClick={onStart}
          disabled={starting}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 text-base font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_40px_-6px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px hover:shadow-[0_0_0_1px_rgb(255_255_255/0.2)_inset,0_12px_48px_-4px_rgb(139_108_255/0.9)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:translate-y-0 disabled:opacity-80"
        >
          {starting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Starting analysis…
            </>
          ) : (
            <>
              Start Analysis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
        <p className="mt-4 text-center text-sm leading-relaxed text-mist/50">
          Ibda will research the market, calculate feasibility, find supplier
          options, review UAE setup requirements and build your launch plan.
        </p>
      </div>
    </div>
  );
}
