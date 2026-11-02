"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { demoIdea } from "@/content/landing";
import {
  demoProfile,
  parseLaunchProfile,
  readLaunchIdea,
  readStoredProfile,
} from "@/features/launch-profile/profile";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import type { AssessmentRequest, InitialAssessment } from "./schema";

export type AssessmentState =
  | { status: "loading" }
  | { status: "ready"; assessment: InitialAssessment }
  | { status: "error"; message: string };

type Stored = {
  key: string;
  /** The language Claude wrote the result in (results saved before languages were added are English). */
  locale?: Locale;
  assessment: InitialAssessment;
  /** The same result translated into another interface language: same figures, other words. */
  translations?: Partial<Record<Locale, InitialAssessment>>;
};

// Versioned so results saved by an older version of the request are never reused.
const STORAGE_KEY = "ibda:assessment:v6";
// English results saved before KHITTA had languages; still valid, read until replaced.
const ENGLISH_ONLY_KEY = "ibda:assessment:v5";
const CHANGE_EVENT = "ibda:assessment-change";
const TIMEOUT_MS = 110_000;

/** The onboarding inputs for this browser session (demo inputs on direct visits). */
export function currentAssessmentInput(): AssessmentRequest {
  return {
    idea: readLaunchIdea() ?? demoIdea,
    profile: parseLaunchProfile(readStoredProfile()) ?? demoProfile,
  };
}

// The same answers find the same result whatever the interface language.
const keyFor = ({ idea, profile }: AssessmentRequest) => JSON.stringify({ idea, profile });

function readRaw() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(ENGLISH_ONLY_KEY);
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

/** The stored result in this language, if Claude wrote it in it or it has been translated. */
const inLocale = (stored: Stored, locale: Locale) =>
  (stored.locale ?? "en") === locale ? stored.assessment : (stored.translations?.[locale] ?? null);

const notify = () => window.dispatchEvent(new Event(CHANGE_EVENT));

function save(stored: Stored) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable — the result still shows on the current screen.
  }
  notify();
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

// One request per job (generating or translating one result), even if a component mounts twice.
const inflight = new Map<string, Promise<unknown>>();
const isPending = () => inflight.size > 0;

function shared<T>(id: string, start: () => Promise<T>): Promise<T> {
  let promise = inflight.get(id) as Promise<T> | undefined;
  if (!promise) {
    promise = start();
    inflight.set(id, promise);
    notify();
    promise
      .catch(() => {})
      .finally(() => {
        inflight.delete(id);
        notify();
      });
  }
  return promise;
}

const noopSubscribe = () => () => {};

export type AssessmentView =
  /** Saved results not read yet (first render), or Claude is still working. */
  | { kind: "checking" }
  | { kind: "live"; assessment: InitialAssessment }
  /** The result exists in the other language and is being translated into this one. */
  | { kind: "translating" }
  | { kind: "translationFailed"; message: string; retry: () => void }
  /** The founder went through onboarding, but there's no result for their answers. */
  | { kind: "unavailable" }
  /** No onboarding in this session: the abaya demo. */
  | { kind: "demo" };

/**
 * What a results screen should show, in the interface language. A result
 * Claude wrote in the other language is translated (same figures, other
 * words) rather than shown as written. Never falls back to the abaya demo for
 * someone who entered their own business, and never renders the demo before
 * this browser's saved results have been read.
 */
export function useAssessmentView(): AssessmentView {
  const { locale } = useI18n();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const pending = useSyncExternalStore(subscribe, isPending, () => false);
  const idea = useSyncExternalStore(subscribe, readLaunchIdea, () => null);
  const [failure, setFailure] = useState<{ locale: Locale; message: string } | null>(null);
  const [attempt, setAttempt] = useState(0);

  const stored = hydrated && raw ? readStored() : null;
  const matches = stored !== null && stored.key === keyFor(currentAssessmentInput());
  const assessment = matches ? inLocale(stored, locale) : null;
  const needsTranslation = matches && !assessment;

  useEffect(() => {
    if (!needsTranslation) return;
    let active = true;
    assessmentIn(currentAssessmentInput(), locale).catch(
      (error: Error) => active && setFailure({ locale, message: error.message }),
    );
    return () => {
      active = false;
    };
  }, [needsTranslation, locale, attempt]);

  if (!hydrated) return { kind: "checking" };
  if (assessment) return { kind: "live", assessment };
  if (needsTranslation) {
    return failure?.locale === locale
      ? {
          kind: "translationFailed",
          message: failure.message,
          retry: () => {
            setFailure(null);
            setAttempt((n) => n + 1);
          },
        }
      : { kind: "translating" };
  }
  if (pending) return { kind: "checking" };
  return idea === null ? { kind: "demo" } : { kind: "unavailable" };
}

async function post<T>(url: string, body: unknown, fallback: string, timeoutMessage: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as {
      assessment?: InitialAssessment;
      error?: string;
      detail?: string;
    };
    // Technical detail (development only) goes to the console, not the screen.
    if (data.detail) console.error(`${url} failed:`, data.detail);
    if (!res.ok || !data.assessment) throw new Error(data.error ?? fallback);
    return data.assessment as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error(timeoutMessage);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The founder's result in this language: generated by Claude in it if there
 * is no result yet, otherwise the saved result (translated once, then kept).
 */
async function assessmentIn(input: AssessmentRequest, locale: Locale): Promise<InitialAssessment> {
  const key = keyFor(input);
  const saved = readStored();
  const generated =
    saved?.key === key
      ? saved
      : await shared(`generate:${key}`, async () => {
          const assessment = await post<InitialAssessment>(
            "/api/assessment",
            { ...input, locale },
            "The assessment couldn't be completed.",
            "The assessment took too long. Please try again.",
          );
          const result: Stored = { key, locale, assessment };
          save(result);
          return result;
        });
  const ready = inLocale(generated, locale);
  if (ready) return ready;

  return shared(`translate:${key}:${locale}`, async () => {
    const translated = await post<InitialAssessment>(
      "/api/translate",
      { assessment: generated.assessment, locale },
      "The translation couldn't be completed. Please try again.",
      "The translation took too long. Please try again.",
    );
    const latest = readStored();
    const base = latest?.key === key ? latest : generated;
    save({ ...base, translations: { ...base.translations, [locale]: translated } });
    return translated;
  });
}

/**
 * Brings Claude's assessment for the current onboarding inputs into the
 * interface language — generating it, or translating a saved one — and
 * reports its progress. Prototype logic for the analysis workspace; the
 * requests themselves run on the server. Returns `retry`, which tries again
 * after a failure.
 */
export function useAssessmentRun(onState: (state: AssessmentState) => void) {
  const { locale } = useI18n();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    // Read inputs straight from storage so the first render's placeholders are never sent.
    const input = currentAssessmentInput();
    const stored = readStored();
    const ready = stored?.key === keyFor(input) ? inLocale(stored, locale) : null;
    if (ready) {
      onState({ status: "ready", assessment: ready });
      return;
    }

    onState({ status: "loading" });
    let active = true;
    assessmentIn(input, locale)
      .then((assessment) => active && onState({ status: "ready", assessment }))
      .catch((error: Error) => active && onState({ status: "error", message: error.message }));
    return () => {
      active = false;
    };
    // Runs once per mount, per retry and per language; onState is expected to be a stable setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, locale]);

  return useCallback(() => setAttempt((n) => n + 1), []);
}
