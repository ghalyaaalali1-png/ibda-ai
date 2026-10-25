"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { prototypeAgent } from "./prototypeAgent";
import type { IdeaAnalysis, OnboardingAgent, SummaryItem } from "./types";

/** Pause before Ibda's next message appears, so replies feel considered. */
const REPLY_DELAY_MS = 650;

export type OnboardingStatus =
  | "idle" // waiting for the idea
  | "thinking" // agent is reading the idea
  | "asking" // a question is on screen
  | "typing" // short pause before the next message
  | "complete" // all answers in, summary shown
  | "starting"; // user pressed Start Analysis

type State = {
  status: OnboardingStatus;
  idea: string;
  analysis: IdeaAnalysis | null;
  answers: string[];
};

type Action =
  | { type: "submit"; idea: string }
  | { type: "analyzed"; analysis: IdeaAnalysis }
  | { type: "answer"; value: string }
  | { type: "reveal" }
  | { type: "edit"; index: number }
  | { type: "start" }
  | { type: "reset" };

const initialState: State = {
  status: "idle",
  idea: "",
  analysis: null,
  answers: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "submit":
      return { ...initialState, status: "thinking", idea: action.idea };
    case "analyzed":
      return {
        ...state,
        analysis: action.analysis,
        status: action.analysis.questions.length ? "asking" : "complete",
      };
    case "answer":
      if (state.status !== "asking") return state;
      return { ...state, answers: [...state.answers, action.value], status: "typing" };
    case "reveal": {
      const total = state.analysis?.questions.length ?? 0;
      return { ...state, status: state.answers.length >= total ? "complete" : "asking" };
    }
    case "edit":
      return { ...state, answers: state.answers.slice(0, action.index), status: "asking" };
    case "start":
      return { ...state, status: "starting" };
    case "reset":
      return initialState;
  }
}

export function useOnboarding(agent: OnboardingAgent = prototypeAgent) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Ignores agent responses that arrive after a reset or resubmit.
  const requestId = useRef(0);

  useEffect(() => {
    if (state.status !== "typing") return;
    const t = setTimeout(() => dispatch({ type: "reveal" }), REPLY_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.status]);

  const submitIdea = useCallback(
    async (idea: string) => {
      const id = ++requestId.current;
      dispatch({ type: "submit", idea });
      const analysis = await agent.analyzeIdea(idea);
      if (id === requestId.current) dispatch({ type: "analyzed", analysis });
    },
    [agent],
  );

  const reset = useCallback(() => {
    requestId.current++;
    dispatch({ type: "reset" });
  }, []);

  const questions = state.analysis?.questions ?? [];

  const summary = useMemo<SummaryItem[]>(() => {
    if (!state.analysis) return [];
    return [
      ...state.analysis.facts.map(({ id, label, value }) => ({ id, label, value })),
      ...state.analysis.questions.map((q, i) => ({
        id: q.id,
        label: q.summaryLabel,
        value: state.answers[i] ?? "",
        questionIndex: i,
      })),
    ];
  }, [state.analysis, state.answers]);

  return {
    ...state,
    questions,
    currentIndex: state.answers.length,
    summary,
    submitIdea,
    answer: useCallback((value: string) => dispatch({ type: "answer", value }), []),
    editAnswer: useCallback((index: number) => dispatch({ type: "edit", index }), []),
    startAnalysis: useCallback(() => dispatch({ type: "start" }), []),
    reset,
  };
}
