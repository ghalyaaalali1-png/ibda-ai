"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { amountAnswer } from "../amount";
import type { Question } from "../types";
import { OptionChips } from "./OptionChips";

/** How a question is answered: the option chips, plus a number box for an exact budget. */
export function AnswerOptions({ question, onSelect }: { question: Question; onSelect: (value: string) => void }) {
  const { t } = useI18n();
  const copy = t.onboarding.amount;
  const [text, setText] = useState("");
  const [invalid, setInvalid] = useState(false);

  if (question.input !== "amount") return <OptionChips options={question.options} onSelect={onSelect} />;

  const submit = () => {
    const value = amountAnswer(text);
    if (!value) return setInvalid(true);
    onSelect(value);
  };

  return (
    <div className="mt-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex w-full max-w-sm items-center gap-2"
      >
        <label className="sr-only" htmlFor={`amount-${question.id}`}>
          {copy.label}
        </label>
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 focus-within:border-brand-400/60">
          <span className="shrink-0 text-sm text-mist/55">{t.locale === "ar" ? "درهم" : "AED"}</span>
          <input
            id={`amount-${question.id}`}
            autoFocus
            inputMode="numeric"
            dir={t.locale === "ar" ? "rtl" : "ltr"}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setInvalid(false);
            }}
            placeholder={copy.placeholder}
            aria-invalid={invalid}
            aria-describedby={invalid ? `amount-${question.id}-error` : undefined}
            className="h-full w-0 min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-mist/50 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim()}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-electric-500 to-brand-500 px-4 text-sm font-medium text-white disabled:opacity-40 rtl:bg-gradient-to-l"
        >
          {copy.submit}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </button>
      </form>
      {invalid && (
        <p id={`amount-${question.id}-error`} role="alert" className="mt-2 text-sm text-[#fcc95a]">
          {copy.invalid}
        </p>
      )}
      <p className="mt-4 text-sm text-mist/55">{copy.orChoose}</p>
      <OptionChips options={question.options} onSelect={onSelect} />
    </div>
  );
}
