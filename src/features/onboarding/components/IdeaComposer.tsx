"use client";

import { ArrowUp, Lightbulb } from "lucide-react";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

const MAX_LENGTH = 600;

export function IdeaComposer({ onSubmit }: { onSubmit: (idea: string) => void }) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0;
  const demoIdea = t.landing.demoIdea;

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (canSend) onSubmit(value.trim());
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  function fillDemo() {
    setValue(demoIdea);
    inputRef.current?.focus();
  }

  return (
    <div className="animate-message-in [animation-delay:150ms]">
      <form
        onSubmit={submit}
        className="glass group relative rounded-3xl p-2 transition-colors focus-within:border-brand-400/40 focus-within:shadow-[0_0_50px_-15px_rgb(139_108_255/0.6)]"
      >
        <label htmlFor="idea" className="sr-only">
          {t.onboarding.composerLabel}
        </label>
        <textarea
          id="idea"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={4}
          maxLength={MAX_LENGTH}
          autoFocus
          dir="auto"
          placeholder={t.onboarding.composerPlaceholder}
          className="block w-full resize-none bg-transparent px-4 pt-3 pb-14 text-base leading-relaxed text-white placeholder:text-mist/35 focus:outline-none sm:text-lg"
        />
        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between gap-3">
          <span className="hidden text-xs text-mist/35 sm:block">{t.onboarding.composerHint}</span>
          <button
            type="submit"
            disabled={!canSend}
            aria-label={t.onboarding.send}
            className={cn(
              "ms-auto grid size-10 place-items-center rounded-full transition-all",
              canSend
                ? "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_8px_24px_-6px_rgb(139_108_255/0.8)] hover:-translate-y-px"
                : "bg-white/5 text-mist/30",
            )}
          >
            <ArrowUp className="size-5" />
          </button>
        </div>
      </form>

      <div className="mt-5">
        <p className="text-xs font-medium tracking-wide text-mist/40 uppercase">{t.onboarding.tryDemo}</p>
        <button
          type="button"
          onClick={fillDemo}
          className="mt-2.5 flex w-full items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-start text-sm leading-relaxed text-mist/70 transition-colors hover:border-brand-400/30 hover:bg-brand-500/[0.06] hover:text-white"
        >
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand-300" />
          {demoIdea}
        </button>
      </div>
    </div>
  );
}
