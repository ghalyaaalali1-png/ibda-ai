"use client";

import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { useOnboarding } from "../useOnboarding";
import { IdeaComposer } from "./IdeaComposer";
import { AgentMessage, TypingIndicator, UserMessage } from "./Messages";
import { OnboardingHeader } from "./OnboardingHeader";
import { OptionChips } from "./OptionChips";
import { QuestionMessage } from "./QuestionMessage";
import { SummaryCard } from "./SummaryCard";

const GREETING =
  "Hi, I'm Ibda. Tell me what you want to build, and I'll help you figure out whether it makes sense and how to launch it.";

export function OnboardingChat() {
  const flow = useOnboarding();
  const { status, idea, analysis, questions, answers, currentIndex } = flow;
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    if (status === "idle") return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [status, currentIndex]);

  const total = questions.length;
  const inQuestions = status === "asking" || status === "typing";
  const reactionFor = (index: number) =>
    index > 0 ? questions[index - 1].reactions?.[answers[index - 1]] : undefined;

  return (
    <>
      <OnboardingHeader
        progress={inQuestions && total ? currentIndex / total : undefined}
        onReset={status === "idle" ? undefined : flow.reset}
      />

      <main className="mx-auto w-full max-w-2xl px-5 pt-12 pb-32 sm:px-8 sm:pt-20">
        <div role="log" aria-live="polite" className="flex flex-col gap-8">
          <AgentMessage>
            <p className="text-lg leading-relaxed text-white sm:text-xl">{GREETING}</p>
          </AgentMessage>

          {status === "idle" && <IdeaComposer onSubmit={flow.submitIdea} />}

          {idea && <UserMessage>{idea}</UserMessage>}

          {status === "thinking" && <TypingIndicator label="Reading your idea…" />}

          {analysis && (
            <AgentMessage>
              <p className="text-[15px] leading-relaxed text-mist/85 sm:text-base">
                {analysis.acknowledgement}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {analysis.facts.map((fact) => (
                  <li
                    key={fact.id}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-sm"
                  >
                    <Check className="size-3.5 text-emerald-400" />
                    <span className="text-mist/50">{fact.label}</span>
                    <span className="font-medium text-white">{fact.value}</span>
                  </li>
                ))}
              </ul>
            </AgentMessage>
          )}

          {/* Answered questions */}
          {answers.map((answer, i) => (
            <div key={questions[i].id} className="flex flex-col gap-8">
              <QuestionMessage
                question={questions[i]}
                step={i + 1}
                total={total}
                reaction={reactionFor(i)}
              />
              <UserMessage
                onEdit={status === "starting" ? undefined : () => flow.editAnswer(i)}
                editLabel={`Change answer: ${questions[i].summaryLabel}`}
              >
                {answer}
              </UserMessage>
            </div>
          ))}

          {/* Current question */}
          {status === "asking" && questions[currentIndex] && (
            <QuestionMessage
              key={questions[currentIndex].id}
              question={questions[currentIndex]}
              step={currentIndex + 1}
              total={total}
              reaction={reactionFor(currentIndex)}
            >
              <OptionChips
                options={questions[currentIndex].options}
                onSelect={flow.answer}
              />
            </QuestionMessage>
          )}

          {status === "typing" && <TypingIndicator />}

          {(status === "complete" || status === "starting") && (
            <AgentMessage>
              <p className="text-[15px] leading-relaxed text-mist/85 sm:text-base">
                {reactionFor(total) ?? "Thanks — that's everything I need."} Here&apos;s
                a quick summary before I begin. You can change anything that
                isn&apos;t right.
              </p>
              <SummaryCard
                items={flow.summary}
                starting={status === "starting"}
                onEdit={flow.editAnswer}
                onStart={flow.startAnalysis}
              />
            </AgentMessage>
          )}

          {status === "starting" && (
            <AgentMessage>
              <p className="text-[15px] leading-relaxed text-mist/85 sm:text-base">
                Your launch profile is locked in. The analysis workspace
                isn&apos;t connected in this prototype yet — it will pick up
                from here.
              </p>
            </AgentMessage>
          )}
        </div>
        <div ref={endRef} />
      </main>
    </>
  );
}
