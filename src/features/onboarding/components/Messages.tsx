"use client";

import { Pencil, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

export function AgentAvatar() {
  return (
    <span
      aria-hidden
      className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-600 to-electric-500 text-white shadow-[0_0_24px_-6px_rgb(139_108_255/0.8)]"
    >
      <Sparkles className="size-4" />
    </span>
  );
}

export function AgentMessage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="flex animate-message-in gap-3 sm:gap-4">
      <AgentAvatar />
      <div className={cn("min-w-0 flex-1 pt-1.5", className)}>
        <p className="sr-only">{t.common.agentSpeaker}</p>
        {children}
      </div>
    </div>
  );
}

export function UserMessage({
  children,
  onEdit,
  editLabel,
}: {
  children: ReactNode;
  onEdit?: () => void;
  editLabel?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="group flex animate-message-in items-center justify-end gap-2">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={editLabel}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-mist/45 transition-colors hover:bg-white/5 hover:text-mist focus-visible:outline-2 focus-visible:outline-brand-400 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <Pencil className="size-3" />
          {t.onboarding.change}
        </button>
      )}
      <div className="max-w-[85%] rounded-2xl rounded-ee-md bg-gradient-to-br from-brand-500/90 to-brand-600/90 px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-[0_8px_30px_-12px_rgb(139_108_255/0.7)]">
        <p className="sr-only">{t.common.userSpeaker}</p>
        <p>{children}</p>
      </div>
    </div>
  );
}

export function TypingIndicator({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <AgentMessage>
      <div className="flex items-center gap-3 pt-1">
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-typing-dot rounded-full bg-brand-300"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
        <span className="text-sm text-mist/50">{label ?? t.common.typing}</span>
      </div>
    </AgentMessage>
  );
}
