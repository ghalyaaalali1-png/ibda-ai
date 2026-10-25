import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentStage, StepStatus } from "../types";

type StageTimelineProps = {
  stages: AgentStage[];
  stageStatus: (stageIndex: number) => StepStatus;
  activityStatus: (stageIndex: number, activityIndex: number) => StepStatus;
  format: (label: string) => string;
};

export function StageTimeline({
  stages,
  stageStatus,
  activityStatus,
  format,
}: StageTimelineProps) {
  return (
    <ol className="relative space-y-3" aria-label="Analysis stages">
      {stages.map((stage, i) => {
        const status = stageStatus(i);
        const Icon = stage.icon;
        return (
          <li
            key={stage.id}
            aria-current={status === "active" ? "step" : undefined}
            className={cn(
              "relative rounded-2xl border p-4 transition-all duration-500 sm:p-5",
              status === "active" &&
                "border-brand-400/30 bg-brand-500/[0.07] shadow-[0_0_50px_-20px_rgb(139_108_255/0.7)]",
              status === "done" && "border-white/[0.06] bg-white/[0.02]",
              status === "pending" && "border-white/[0.04] opacity-50",
            )}
          >
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "relative grid size-10 shrink-0 place-items-center rounded-xl border transition-colors duration-500",
                  status === "done" && "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
                  status === "active" && "border-brand-400/50 bg-brand-500/20 text-white",
                  status === "pending" && "border-white/10 bg-white/[0.03] text-mist/50",
                )}
              >
                {status === "done" ? <Check className="size-5" /> : <Icon className="size-[18px]" />}
                {status === "active" && (
                  <span
                    aria-hidden
                    className="absolute -inset-1 animate-pulse rounded-[14px] border border-brand-400/40"
                  />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] tracking-wider text-mist/40 uppercase">
                  Stage {i + 1}
                </p>
                <h3 className="mt-0.5 text-[15px] font-semibold text-white sm:text-base">
                  {stage.title}
                </h3>
              </div>

              <span
                className={cn(
                  "shrink-0 text-xs font-medium",
                  status === "done" && "text-emerald-300",
                  status === "active" && "text-brand-300",
                  status === "pending" && "text-mist/40",
                )}
              >
                {status === "done" ? "Done" : status === "active" ? "Working" : "Queued"}
              </span>
            </div>

            {status === "active" && (
              <ul className="mt-4 space-y-2 pl-14" aria-live="polite">
                {stage.activities.map((activity, a) => {
                  const s = activityStatus(i, a);
                  if (s === "pending") return null;
                  return (
                    <li
                      key={activity.id}
                      className="flex animate-message-in items-center gap-2.5 text-sm"
                    >
                      {s === "done" ? (
                        <Check className="size-3.5 shrink-0 text-emerald-400" />
                      ) : (
                        <Loader2 className="size-3.5 shrink-0 animate-spin text-brand-300" />
                      )}
                      <span className={s === "done" ? "text-mist/50" : "text-white"}>
                        {format(activity.label)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {status === "done" && (
              <p className="mt-2 animate-message-in pl-14 text-sm text-mist/50">
                {stage.result}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
