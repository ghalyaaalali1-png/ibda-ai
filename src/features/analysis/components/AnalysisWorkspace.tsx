"use client";

import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { routes } from "@/config/site";
import {
  demoProfile,
  parseLaunchProfile,
  profileValue,
  readStoredProfile,
} from "@/features/launch-profile/profile";
import { assessmentLogEntries, withAssessmentResults } from "@/features/assessment/applyToAnalysis";
import { feasibilityLabel } from "@/features/assessment/schema";
import { useAssessmentRun, type AssessmentState } from "@/features/assessment/storage";
import { analysisStages } from "../stages";
import type { ActivityLogEntry } from "../types";
import { useAgentRun } from "../useAgentRun";
import { ActivityPanel } from "./ActivityPanel";
import { StageTimeline } from "./StageTimeline";
import { WorkspaceHeader } from "./WorkspaceHeader";

const noopSubscribe = () => () => {};

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export function AnalysisWorkspace() {
  // Profile handed over from onboarding; the demo profile when visited directly.
  const stored = useSyncExternalStore(noopSubscribe, readStoredProfile, () => null);
  const profile = useMemo(() => parseLaunchProfile(stored) ?? demoProfile, [stored]);

  const format = useCallback(
    (label: string) =>
      label.replace(/\{(\w+)\}/g, (_, id: string) => profileValue(profile, id) ?? "your"),
    [profile],
  );

  // Claude's initial assessment runs on the server while the workspace plays.
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({ status: "loading" });
  useAssessmentRun(setAssessmentState);
  const assessment = assessmentState.status === "ready" ? assessmentState.assessment : null;

  const stages = useMemo(
    () => (assessment ? withAssessmentResults(analysisStages, assessment) : analysisStages),
    [assessment],
  );
  // The last beat waits for Claude, so "complete" always means real results are in.
  const run = useAgentRun(stages, format, { holdFinal: assessmentState.status === "loading" });

  const log = useMemo<ActivityLogEntry[]>(() => {
    const lastAt = run.log.at(-1)?.atMs ?? 0;
    if (run.waiting) {
      return [
        ...run.log,
        {
          key: "assessment.pending",
          action: "Reviewing",
          label: "Finalising your assessment with Claude",
          stageTitle: "Initial assessment",
          atMs: lastAt + 800,
          status: "active",
        },
      ];
    }
    if (!run.complete) return run.log;
    if (assessment) return [...run.log, ...assessmentLogEntries(assessment, lastAt + 800)];
    if (assessmentState.status === "error") {
      return [
        ...run.log,
        {
          key: "assessment.error",
          action: "Reviewing",
          label: `Live assessment unavailable — showing demo results. ${assessmentState.message}`,
          stageTitle: "Initial assessment",
          atMs: lastAt + 800,
          status: "done",
        },
      ];
    }
    return run.log;
  }, [run.log, run.waiting, run.complete, assessment, assessmentState]);
  const profileLine = ["business", "location", "budget"]
    .map((id) => profileValue(profile, id))
    .filter(Boolean)
    .join(" · ");

  // Keep the stage Ibda is working on in view.
  useEffect(() => {
    document
      .querySelector('[aria-current="step"]')
      ?.scrollIntoView({ behavior: scrollBehavior(), block: "nearest" });
  }, [run.activeStageIndex]);

  // Bring the finished state into view when the run completes.
  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (run.complete) doneRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "nearest" });
  }, [run.complete]);

  return (
    <>
      <WorkspaceHeader profileLine={profileLine} complete={run.complete} />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <main className="min-w-0">
            <p className="text-sm text-mist/50 lg:hidden">{profileLine}</p>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:mt-0">
              {run.complete ? (
                <span className="text-gradient">Your launch plan is ready.</span>
              ) : (
                "Ibda is building your launch plan"
              )}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-mist/60 sm:text-lg">
              {run.complete
                ? "I've worked through your market, numbers, suppliers and UAE setup. Here's what I found."
                : "I'm researching your market, testing the numbers, finding options and checking what you'll need to launch."}
            </p>

            {/* Overall progress */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-mist/50">
                <span>
                  {run.complete
                    ? "6 of 6 stages complete"
                    : `Stage ${run.activeStageIndex + 1} of ${analysisStages.length}`}
                </span>
                <span className="font-mono">{Math.round(run.progress * 100)}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Analysis progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(run.progress * 100)}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-electric-400 transition-[width] duration-700 ease-out"
                  style={{ width: `${run.progress * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-8">
              <StageTimeline
                stages={stages}
                stageStatus={run.stageStatus}
                activityStatus={run.activityStatus}
                format={format}
              />
            </div>

            <div ref={doneRef} className="scroll-mb-8">
              {run.complete && (
                <div className="glass relative mt-6 animate-message-in overflow-hidden rounded-3xl p-6 sm:p-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-brand-500/25 blur-3xl"
                  />
                  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-600 to-electric-500 text-white shadow-[0_0_24px_-6px_rgb(139_108_255/0.8)]">
                        <Sparkles className="size-5" />
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-white">
                          Everything is ready to review
                        </p>
                        <p className="mt-1 text-sm text-mist/55">
                          {assessment
                            ? `${feasibilityLabel[assessment.feasibility.status]}: ${assessment.feasibility.headline}`
                            : "Costs, pricing, suppliers, UAE setup and a launch timeline."}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={routes.plan}
                      className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-6 text-base font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_40px_-6px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                    >
                      View My Business Plan
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={run.restart}
                    className="relative mt-5 inline-flex items-center gap-1.5 text-xs text-mist/40 transition-colors hover:text-mist"
                  >
                    <RotateCcw className="size-3" />
                    Replay analysis
                  </button>
                </div>
              )}
            </div>
          </main>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <ActivityPanel log={log} complete={run.complete} />
          </div>
        </div>
      </Container>
    </>
  );
}
