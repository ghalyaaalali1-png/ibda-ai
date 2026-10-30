"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ActivityLogEntry, AgentStage, StepStatus } from "./types";

const DEFAULT_ACTIVITY_MS = 800;
/** Short beat after a stage's last activity before it's marked complete. */
const STAGE_COMPLETE_MS = 300;

type RunEvent = {
  stageIndex: number;
  /** null marks the stage-complete beat. */
  activityIndex: number | null;
  startMs: number;
  durationMs: number;
};

function buildTimeline(stages: AgentStage[]) {
  const events: RunEvent[] = [];
  let t = 0;
  stages.forEach((stage, stageIndex) => {
    stage.activities.forEach((activity, activityIndex) => {
      const durationMs = activity.durationMs ?? DEFAULT_ACTIVITY_MS;
      events.push({ stageIndex, activityIndex, startMs: t, durationMs });
      t += durationMs;
    });
    events.push({ stageIndex, activityIndex: null, startMs: t, durationMs: STAGE_COMPLETE_MS });
    t += STAGE_COMPLETE_MS;
  });
  return events;
}

function statusAt(eventIndex: number, step: number): StepStatus {
  if (eventIndex < step) return "done";
  return eventIndex === step ? "active" : "pending";
}

/**
 * Simulates the agent working through `stages` with timers. All state is
 * derived from a single cursor into an event timeline, so a real agent can
 * drive the same UI by advancing the cursor as its events arrive.
 */
export function useAgentRun(
  stages: AgentStage[],
  format: (label: string) => string,
  /** Hold on the final beat until real work (e.g. an API call) has finished. */
  { holdFinal = false }: { holdFinal?: boolean } = {},
) {
  const events = useMemo(() => buildTimeline(stages), [stages]);
  const [step, setStep] = useState(0);
  const complete = step >= events.length;
  const waiting = holdFinal && step === events.length - 1;

  useEffect(() => {
    if (complete || waiting) return;
    const t = setTimeout(() => setStep((s) => s + 1), events[step].durationMs);
    return () => clearTimeout(t);
  }, [step, complete, waiting, events]);

  const indexOf = useCallback(
    (stageIndex: number, activityIndex: number | null) =>
      events.findIndex(
        (e) => e.stageIndex === stageIndex && e.activityIndex === activityIndex,
      ),
    [events],
  );

  const stageStatus = useCallback(
    (stageIndex: number): StepStatus => {
      const doneAt = indexOf(stageIndex, null);
      if (doneAt < step) return "done";
      return indexOf(stageIndex, 0) <= step ? "active" : "pending";
    },
    [indexOf, step],
  );

  const activityStatus = useCallback(
    (stageIndex: number, activityIndex: number) =>
      statusAt(indexOf(stageIndex, activityIndex), step),
    [indexOf, step],
  );

  const log = useMemo<ActivityLogEntry[]>(
    () =>
      events
        .slice(0, step + 1)
        .flatMap((e, i) => {
          if (e.activityIndex === null) return [];
          const stage = stages[e.stageIndex];
          const activity = stage.activities[e.activityIndex];
          return [
            {
              key: `${stage.id}.${activity.id}`,
              action: activity.action,
              label: format(activity.label),
              stageTitle: stage.title,
              atMs: e.startMs,
              status: i < step ? ("done" as const) : ("active" as const),
            },
          ];
        }),
    [events, stages, step, format],
  );

  const activeStageIndex = complete ? stages.length - 1 : events[step].stageIndex;
  const completedStages = stages.filter((_, i) => stageStatus(i) === "done").length;

  return {
    complete,
    waiting,
    progress: Math.min(step, events.length) / events.length,
    activeStageIndex,
    completedStages,
    stageStatus,
    activityStatus,
    log,
    restart: useCallback(() => setStep(0), []),
  };
}
