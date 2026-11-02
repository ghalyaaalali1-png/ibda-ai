"use client";

import { displayValue } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";

/** Answer buttons: shown in the interface language, answered with the stored (English) value. */
export function OptionChips({
  options,
  onSelect,
}: {
  options: string[];
  onSelect: (option: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t.onboarding.chooseAnswer}>
      {options.map((option, i) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          style={{ animationDelay: `${120 + i * 60}ms` }}
          className="animate-message-in rounded-full border border-brand-400/25 bg-brand-500/[0.08] px-4 py-2 text-sm text-mist transition-all hover:-translate-y-px hover:border-brand-400/60 hover:bg-brand-500/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
        >
          {displayValue(t, option)}
        </button>
      ))}
    </div>
  );
}
