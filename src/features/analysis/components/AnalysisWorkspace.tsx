"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { routes } from "@/config/site";
import {
  businessPhrase,
  demoProfile,
  isAbayaBusiness,
  parseLaunchProfile,
  profileValue,
  readStoredProfile,
} from "@/features/launch-profile/profile";
import { assessmentLogEntries, withAssessmentResults } from "@/features/assessment/applyToAnalysis";
import { AnalysisStatus } from "@/features/assessment/components/AnalysisStatus";
import { useAssessmentRun, type AssessmentState } from "@/features/assessment/storage";
import { displayError, displayProfileLine, displayValue } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import { analysisStagesFor, STAGE_COUNT } from "../stages";
import type { ActivityLogEntry } from "../types";
import { useAgentRun } from "../useAgentRun";
import { ActivityPanel } from "./ActivityPanel";
import { StageTimeline } from "./StageTimeline";
import { WorkspaceHeader } from "./WorkspaceHeader";

const noopSubscribe = () => () => {};

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

// Stage labels arrive already worded in the interface language.
const asIs = (label: string) => label;

export function AnalysisWorkspace() {
  // Read the onboarding profile before rendering, so the demo profile never flashes first.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return hydrated ? <Workspace /> : <AnalysisStatus state="checking" screen="workspace" />;
}

function Workspace() {
  const { t, locale } = useI18n();
  // Profile handed over from onboarding; the demo profile when visited directly.
  const stored = useSyncExternalStore(noopSubscribe, readStoredProfile, () => null);
  const answers = useMemo(() => parseLaunchProfile(stored) ?? demoProfile, [stored]);

  // Claude's initial assessment runs on the server while the workspace plays.
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({ status: "loading" });
  const retryAssessment = useAssessmentRun(setAssessmentState);
  const assessment = assessmentState.status === "ready" ? assessmentState.assessment : null;
  // Once results are in, the business name shows in the interface language.
  const profile = assessmentState.status === "ready" ? assessmentState.profile : answers;
  const failed = assessmentState.status === "error";

  const stages = useMemo(() => {
    const business = profileValue(profile, "business");
    const location = profileValue(profile, "location");
    const budget = profileValue(profile, "budget");
    // Abaya copy only for abaya ideas; neutral copy for every other business.
    const base = analysisStagesFor(t, isAbayaBusiness(profile), {
      business: locale === "en" || !business ? businessPhrase(profile) : displayValue(t, business),
      location: location ? displayValue(t, location) : null,
      budget: budget ? displayValue(t, budget) : null,
    });
    return assessment ? withAssessmentResults(base, assessment, t) : base;
  }, [assessment, profile, t, locale]);
  // The last beat waits for Claude, so "complete" always means real results are in.
  const run = useAgentRun(stages, asIs, { holdFinal: !assessment, paused: failed });

  function retry() {
    retryAssessment();
    run.restart();
  }

  const log = useMemo<ActivityLogEntry[]>(() => {
    const lastAt = run.log.at(-1)?.atMs ?? 0;
    if (failed) {
      return [
        ...run.log,
        {
          key: "assessment.error",
          action: "Reviewing",
          label: t.analysis.logFailed,
          stageTitle: t.analysis.initialAssessment,
          atMs: lastAt + 800,
          status: "done",
        },
      ];
    }
    if (run.waiting) {
      return [
        ...run.log,
        {
          key: "assessment.pending",
          action: "Reviewing",
          label: t.analysis.logPending,
          stageTitle: t.analysis.initialAssessment,
          atMs: lastAt + 800,
          status: "active",
        },
      ];
    }
    if (run.complete && assessment) return [...run.log, ...assessmentLogEntries(assessment, lastAt + 800, t)];
    return run.log;
  }, [run.log, run.waiting, run.complete, assessment, failed, t]);
  const profileLine = displayProfileLine(t, profile);

  // Keep the stage KHITTA is working on in view.
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
      <WorkspaceHeader profileLine={profileLine} complete={run.complete} failed={failed} />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <main className="min-w-0">
            <p className="text-sm text-mist/50 lg:hidden">{profileLine}</p>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:mt-0">
              {run.complete ? (
                <span className="text-gradient">{t.analysis.titleComplete}</span>
              ) : failed ? (
                t.analysis.titleFailed
              ) : (
                t.analysis.titleWorking
              )}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-mist/60 sm:text-lg">
              {run.complete
                ? t.analysis.subtitleComplete
                : failed
                  ? t.analysis.subtitleFailed
                  : t.analysis.subtitleWorking}
            </p>

            {failed && !run.complete && (
              <div
                role="alert"
                className="glass relative mt-6 animate-message-in overflow-hidden rounded-3xl p-6 sm:p-8"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -end-20 size-72 rounded-full bg-[#fab219]/10 blur-3xl"
                />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#fab219]/30 bg-[#fab219]/10 text-[#fcc95a]">
                      <AlertTriangle className="size-5" />
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-white">{t.analysis.errorTitle}</p>
                      <p className="mt-1 text-sm text-mist/55">
                        {failed ? displayError(t, assessmentState.message) : null} {t.analysis.errorNoPlan}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={retry}
                    className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-6 text-base font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_40px_-6px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                  >
                    <RotateCcw className="size-4" />
                    {t.analysis.tryAgain}
                  </button>
                </div>
                <Link
                  href={routes.start}
                  className="relative mt-5 inline-flex items-center gap-1.5 text-xs text-mist/40 transition-colors hover:text-mist"
                >
                  <ArrowLeft className="size-3 rtl:-scale-x-100" />
                  {t.analysis.startOverDifferent}
                </Link>
              </div>
            )}

            {/* Overall progress */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-mist/50">
                <span>
                  {run.complete
                    ? t.analysis.stagesComplete(STAGE_COUNT, STAGE_COUNT)
                    : t.analysis.stageOf(run.activeStageIndex + 1, STAGE_COUNT)}
                </span>
                <span className="font-mono">{Math.round(run.progress * 100)}%</span>
              </div>
              <div
                role="progressbar"
                aria-label={t.analysis.progressLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(run.progress * 100)}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-electric-400 transition-[width] duration-700 ease-out rtl:bg-gradient-to-l"
                  style={{ width: `${run.progress * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-8">
              <StageTimeline
                stages={stages}
                stageStatus={run.stageStatus}
                activityStatus={run.activityStatus}
                format={asIs}
                stopped={failed}
              />
            </div>

            <div ref={doneRef} className="scroll-mb-8">
              {run.complete && (
                <div className="glass relative mt-6 animate-message-in overflow-hidden rounded-3xl p-6 sm:p-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -end-20 size-72 rounded-full bg-brand-500/25 blur-3xl"
                  />
                  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-600 to-electric-500 text-white shadow-[0_0_24px_-6px_rgb(139_108_255/0.8)]">
                        <Sparkles className="size-5" />
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-white">{t.analysis.readyTitle}</p>
                        <p className="mt-1 text-sm text-mist/55">
                          {assessment
                            ? `${t.analysis.feasibility[assessment.feasibility.status]}: ${assessment.feasibility.headline}`
                            : t.analysis.readyFallback}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={routes.plan}
                      className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-6 text-base font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_40px_-6px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                    >
                      {t.analysis.viewPlan}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={run.restart}
                    className="relative mt-5 inline-flex items-center gap-1.5 text-xs text-mist/40 transition-colors hover:text-mist"
                  >
                    <RotateCcw className="size-3" />
                    {t.analysis.replay}
                  </button>
                </div>
              )}
            </div>
          </main>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <ActivityPanel log={log} complete={run.complete} live={stored !== null} />
          </div>
        </div>
      </Container>
    </>
  );
}
