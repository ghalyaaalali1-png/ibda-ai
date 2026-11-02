"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { Question } from "../types";
import { AgentMessage } from "./Messages";

export function QuestionMessage({
  question,
  step,
  total,
  reaction,
  children,
}: {
  question: Question;
  step: number;
  total: number;
  /** KHITTA's reaction to the previous answer. */
  reaction?: string;
  children?: React.ReactNode;
}) {
  const { t } = useI18n();
  const copy = t.onboarding.questions[question.id];
  const prompt = copy?.prompt ?? question.prompt;
  const helper = copy?.helper ?? question.helper;
  return (
    <AgentMessage>
      <p className="font-mono text-[11px] tracking-wider text-brand-300/70 uppercase">
        {t.onboarding.step(step, total)}
      </p>
      {reaction && <p className="mt-2 text-[15px] text-mist/60">{reaction}</p>}
      <p className="mt-1.5 text-base font-medium text-white sm:text-lg">{prompt}</p>
      {helper && <p className="mt-1 text-sm text-mist/45">{helper}</p>}
      {children}
    </AgentMessage>
  );
}
