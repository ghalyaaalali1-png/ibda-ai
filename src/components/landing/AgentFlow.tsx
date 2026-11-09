"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { agentStepIcons } from "@/content/landing";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

const STEP_MS = 1600;
// Extra ticks to hold on the "plan ready" state before looping.
const HOLD_TICKS = 3;

/** Animated illustration of the KHITTA agent working through a business idea. */
export function AgentFlow() {
  const { t } = useI18n();
  const copy = t.landing.agentFlow;
  const steps = copy.steps;
  const [tick, setTick] = useState(1);

  useEffect(() => {
    const id = setInterval(
      () => setTick((v) => (v + 1) % (steps.length + HOLD_TICKS)),
      STEP_MS,
    );
    return () => clearInterval(id);
  }, [steps.length]);

  const active = Math.min(tick, steps.length);
  const complete = active === steps.length;
  const progress = Math.round((active / steps.length) * 100);

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Halo behind the card */}
      <div
        aria-hidden
        className="absolute inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-500/40 via-brand-600/20 to-electric-500/30 blur-3xl"
      />

      <div
        role="img"
        aria-label={copy.label}
        className="glass relative overflow-hidden rounded-3xl p-5 shadow-2xl shadow-black/40 sm:p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-white">{copy.name}</p>
              <p dir="ltr" className="font-mono text-[11px] text-mist/55">
                launch_plan.run()
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors",
              complete
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-brand-500/10 text-brand-300",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                complete ? "bg-emerald-400" : "animate-pulse bg-brand-400",
              )}
            />
            {complete ? copy.planReady : copy.analyzing}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-electric-400 transition-[width] duration-700 ease-out rtl:bg-gradient-to-l"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <ol className="relative mt-5 space-y-1.5">
          {steps.map((step, i) => {
            const state =
              i < active ? "done" : i === active ? "active" : "pending";
            const Icon = agentStepIcons[i];
            return (
              <li
                key={step.label}
                className={cn(
                  "relative flex items-center gap-3.5 rounded-2xl border px-3 py-2.5 transition-all duration-500",
                  state === "active" &&
                    "border-brand-400/30 bg-brand-500/[0.08] shadow-[0_0_30px_-10px_rgb(139_108_255/0.6)]",
                  state === "done" && "border-transparent",
                  state === "pending" && "border-transparent opacity-40",
                )}
              >
                {/* Connector to next step */}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-[calc(50%+18px)] start-[30px] h-[calc(100%-30px)] w-px overflow-hidden bg-white/10"
                  >
                    {state === "done" && (
                      <span className="absolute inset-0 bg-gradient-to-b from-brand-400 to-electric-400" />
                    )}
                  </span>
                )}

                <span
                  className={cn(
                    "relative grid size-9 shrink-0 place-items-center rounded-xl border transition-colors duration-500",
                    state === "done" &&
                      "border-brand-400/30 bg-gradient-to-br from-brand-500/30 to-electric-500/20 text-brand-300",
                    state === "active" &&
                      "border-brand-400/50 bg-brand-500/20 text-white",
                    state === "pending" &&
                      "border-white/10 bg-white/[0.03] text-mist/60",
                  )}
                >
                  <Icon className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{step.label}</p>
                  <p className="truncate text-xs text-mist/50">{step.detail}</p>
                </div>

                <span className="shrink-0">
                  {state === "done" && (
                    <Check className="size-4 text-emerald-400" />
                  )}
                  {state === "active" && (
                    <Loader2 className="size-4 animate-spin text-brand-300" />
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Floating insight chips */}
      <div className="glass absolute -bottom-10 -start-4 hidden animate-float rounded-2xl px-4 py-3 shadow-xl shadow-black/30 sm:block lg:-start-10">
        <p className="text-[11px] tracking-wide text-mist/50 uppercase">{copy.launchBudget}</p>
        <p className="mt-0.5 text-lg font-semibold text-white">{t.fmt.aed(30000)}</p>
      </div>
      <div className="glass absolute -top-5 -end-3 hidden animate-float rounded-2xl px-4 py-3 shadow-xl shadow-black/30 [animation-delay:-3.5s] sm:block lg:-end-6">
        <p className="text-[11px] tracking-wide text-mist/50 uppercase">{copy.targetMargin}</p>
        <p className="mt-0.5 text-lg font-semibold text-emerald-300">68%</p>
      </div>
    </div>
  );
}
