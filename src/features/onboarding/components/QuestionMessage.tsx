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
  /** Ibda's reaction to the previous answer. */
  reaction?: string;
  children?: React.ReactNode;
}) {
  return (
    <AgentMessage>
      <p className="font-mono text-[11px] tracking-wider text-brand-300/70 uppercase">
        Step {step} of {total}
      </p>
      {reaction && <p className="mt-2 text-[15px] text-mist/60">{reaction}</p>}
      <p className="mt-1.5 text-base font-medium text-white sm:text-lg">
        {question.prompt}
      </p>
      {question.helper && (
        <p className="mt-1 text-sm text-mist/45">{question.helper}</p>
      )}
      {children}
    </AgentMessage>
  );
}
