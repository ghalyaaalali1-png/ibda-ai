"use client";

import { useEffect, useSyncExternalStore } from "react";
import { demoIdea } from "@/content/landing";
import {
  demoProfile,
  parseLaunchProfile,
  readLaunchIdea,
  readStoredProfile,
} from "@/features/launch-profile/profile";
import type { AssessmentRequest, InitialAssessment } from "./schema";

export type AssessmentState =
  | { status: "loading" }
  | { status: "ready"; assessment: InitialAssessment }
  | { status: "error"; message: string };

type Stored = { key: string; assessment: InitialAssessment };

// Versioned so results saved before the plan inputs existed are never reused.
const STORAGE_KEY = "ibda:assessment:v2";
const CHANGE_EVENT = "ibda:assessment-change";
const TIMEOUT_MS = 110_000;

/** The onboarding inputs for this browser session (demo inputs on direct visits). */
export function currentAssessmentInput(): AssessmentRequest {
  return {
    idea: readLaunchIdea() ?? demoIdea,
    profile: parseLaunchProfile(readStoredProfile()) ?? demoProfile,
  };
}

const keyFor = (input: AssessmentRequest) => JSON.stringify(input);

function readRaw() {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function readStored(): Stored | null {
  const raw = readRaw();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Stored;
  } catch {
    return null;
  }
}

function save(stored: Stored) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable — the result still shows on the current screen.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** Saved assessment for the current onboarding inputs, if Claude has finished. */
export function useStoredAssessment(): InitialAssessment | null {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  if (!raw) return null;
  const stored = readStored();
  return stored && stored.key === keyFor(currentAssessmentInput()) ? stored.assessment : null;
}

// One request per set of inputs, even if a component mounts twice.
const inflight = new Map<string, Promise<InitialAssessment>>();

async function request(input: AssessmentRequest): Promise<InitialAssessment> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("/api/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as {
      assessment?: InitialAssessment;
      error?: string;
    };
    if (!res.ok || !data.assessment) throw new Error(data.error ?? "The assessment couldn't be completed.");
    return data.assessment;
  } catch (error) {
    if (controller.signal.aborted) throw new Error("The assessment took too long. Please try again.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Starts Claude's assessment for the current onboarding inputs (unless one is
 * already saved) and reports its progress. Prototype logic for the analysis
 * workspace; the request itself runs on the server.
 */
export function useAssessmentRun(onState: (state: AssessmentState) => void) {
  useEffect(() => {
    // Read inputs straight from storage so the first render's placeholders are never sent.
    const input = currentAssessmentInput();
    const key = keyFor(input);
    const stored = readStored();
    if (stored?.key === key) {
      onState({ status: "ready", assessment: stored.assessment });
      return;
    }

    onState({ status: "loading" });
    let active = true;
    let promise = inflight.get(key);
    if (!promise) {
      promise = request(input);
      inflight.set(key, promise);
      promise
        .then((assessment) => save({ key, assessment }))
        .catch(() => {})
        .finally(() => inflight.delete(key));
    }
    promise
      .then((assessment) => active && onState({ status: "ready", assessment }))
      .catch((error: Error) => active && onState({ status: "error", message: error.message }));
    return () => {
      active = false;
    };
    // Runs once per mount; onState is expected to be a stable setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
