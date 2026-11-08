"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { routes } from "@/config/site";
import { saveLaunchIdea, saveLaunchProfile } from "@/features/launch-profile/profile";
import { saveNewProject } from "@/features/projects/actions";
import { projectRoutes } from "@/features/projects/types";
import { displayLabel, displayValue } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import { useOnboarding } from "../useOnboarding";
import { IdeaComposer } from "./IdeaComposer";
import { AgentMessage, TypingIndicator, UserMessage } from "./Messages";
import { OnboardingHeader } from "./OnboardingHeader";
import { OptionChips } from "./OptionChips";
import { QuestionMessage } from "./QuestionMessage";
import { SummaryCard } from "./SummaryCard";

export function OnboardingChat() {
  const { t } = useI18n();
  const flow = useOnboarding();
  const { status, idea, analysis, questions, answers, currentIndex, editing } = flow;
  const endRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [saveFailed, setSaveFailed] = useState(false);

  async function startAnalysis() {
    // Stored as given (English values), whatever the interface language.
    const profile = flow.summary.map(({ id, label, value }) => ({ id, label, value }));
    saveLaunchProfile(profile);
    saveLaunchIdea(idea);
    setSaveFailed(false);
    flow.startAnalysis();
    // Signed in: saved as a project in the account. Otherwise: kept in this browser session.
    const saved = await saveNewProject({ idea, profile }).catch(() => ({ status: "failed" }) as const);
    if (saved.status === "failed") {
      // Stop before any analysis runs, so nothing is generated that can't be kept.
      setSaveFailed(true);
      flow.startFailed();
      return;
    }
    router.push(saved.status === "saved" ? projectRoutes(saved.id).analysis : routes.analysis);
  }

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    if (status === "idle" || editing !== null) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [status, currentIndex, editing]);

  // Bring the question being changed into view.
  const editRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editing !== null) editRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [editing]);

  const total = questions.length;
  const inQuestions = status === "asking" || status === "typing";
  const reactionFor = (index: number) => {
    if (index === 0) return undefined;
    const q = questions[index - 1];
    const answer = answers[index - 1];
    return t.onboarding.reactions[q.id]?.[answer] ?? q.reactions?.[answer];
  };
  const known = analysis
    ? t.fmt.list(analysis.facts.map((f) => t.onboarding.known[f.id] ?? displayLabel(t, f.id, f.label).toLowerCase()))
    : "";

  return (
    <>
      <OnboardingHeader
        progress={inQuestions && total ? currentIndex / total : undefined}
        onReset={status === "idle" ? undefined : flow.reset}
      />

      <main className="mx-auto w-full max-w-2xl px-5 pt-12 pb-32 sm:px-8 sm:pt-20">
        <div role="log" aria-live="polite" className="flex flex-col gap-8">
          <AgentMessage>
            <p className="text-lg leading-relaxed text-white sm:text-xl">{t.onboarding.greeting}</p>
          </AgentMessage>

          {status === "idle" && <IdeaComposer onSubmit={flow.submitIdea} />}

          {idea && <UserMessage>{idea}</UserMessage>}

          {status === "thinking" && <TypingIndicator label={t.onboarding.reading} />}

          {analysis && (
            <AgentMessage>
              <p className="text-[15px] leading-relaxed text-mist/85 sm:text-base">
                {t.onboarding.acknowledgement(known, analysis.questions.length)}
              </p>
              {/* With nothing left to ask, the summary below lists these; don't show them twice. */}
              {analysis.questions.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {analysis.facts.map((fact) => (
                    <li
                      key={fact.id}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-sm"
                    >
                      <Check className="size-3.5 text-emerald-400" />
                      <span className="text-mist/50">{displayLabel(t, fact.id, fact.label)}</span>
                      <span className="font-medium text-white">{displayValue(t, fact.value)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </AgentMessage>
          )}

          {/* Answered questions */}
          {answers.map((answer, i) =>
            editing === i ? (
              // Changing this answer: ask again in place, keeping the other answers.
              <div key={questions[i].id} ref={editRef} className="scroll-my-24">
                <QuestionMessage question={questions[i]} step={i + 1} total={total} reaction={reactionFor(i)}>
                  <OptionChips options={questions[i].options} onSelect={flow.answer} />
                </QuestionMessage>
              </div>
            ) : (
              <div key={questions[i].id} className="flex flex-col gap-8">
                <QuestionMessage
                  question={questions[i]}
                  step={i + 1}
                  total={total}
                  reaction={reactionFor(i)}
                />
                <UserMessage
                  onEdit={status === "starting" || editing !== null ? undefined : () => flow.editAnswer(i)}
                  editLabel={t.onboarding.changeAnswer(displayLabel(t, questions[i].id, questions[i].summaryLabel))}
                >
                  {displayValue(t, answer)}
                </UserMessage>
              </div>
            ),
          )}

          {/* Current question */}
          {status === "asking" && editing === null && questions[currentIndex] && (
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
                {total > 0 && `${reactionFor(total) ?? t.onboarding.thanks} `}
                {t.onboarding.summaryIntro}
              </p>
              <SummaryCard
                items={flow.summary}
                starting={status === "starting"}
                onEdit={flow.editAnswer}
                onStart={startAnalysis}
              />
              {saveFailed && (
                <p role="alert" className="mt-3 rounded-xl border border-[#fab219]/25 bg-[#fab219]/10 px-3.5 py-2.5 text-sm text-[#fcc95a]">
                  {t.onboarding.saveFailed}
                </p>
              )}
            </AgentMessage>
          )}

        </div>
        <div ref={endRef} />
      </main>
    </>
  );
}
