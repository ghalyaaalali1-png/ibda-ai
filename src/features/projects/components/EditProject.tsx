"use client";

import { Check, History, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { parseAedRange } from "@/features/project/coreInfo";
import { displayError, displayLabel, displayValue } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import { budgetValue, choicesFor, editImpact } from "../editing";
import { updatedOn } from "../format";
import { useJourneyRoutes, useProject } from "../ProjectProvider";
import type { HistoryEntry } from "../types";

const fieldClass =
  "mt-1.5 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[15px] text-white transition-colors focus:border-brand-400/60 focus:bg-white/[0.05] focus:outline-none";

/**
 * Edit a saved business's answers. Shows which parts of the plan the changes
 * will update before anything runs, then updates only those, and lists the
 * earlier versions.
 */
export function EditProject({ history }: { history: HistoryEntry[] }) {
  const { t, locale } = useI18n();
  const project = useProject()!;
  const journey = useJourneyRoutes();
  const router = useRouter();
  const copy = t.edit;

  const [idea, setIdea] = useState(project.idea);
  const [answers, setAnswers] = useState(project.answers);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const impact = useMemo(
    () => editImpact({ idea: project.idea, answers: project.answers }, { idea, answers }),
    [project.idea, project.answers, idea, answers],
  );
  const set = (id: string, value: string) => setAnswers((all) => all.map((f) => (f.id === id ? { ...f, value } : f)));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, profile: answers }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
      if (data.detail) console.error("Update failed:", data.detail);
      if (!res.ok) throw new Error(data.error ?? t.genericError);
      router.push(journey.plan);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.genericError);
      setSaving(false);
    }
  }

  return (
    <main>
      <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="edit-title">
          <h1 id="edit-title" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-mist/60">{copy.subtitle}</p>

          <fieldset disabled={saving} className="glass mt-8 flex flex-col gap-5 rounded-3xl p-6 sm:p-8">
            <label className="text-sm font-medium text-mist/80">
              {copy.idea}
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={3}
                maxLength={600}
                dir="auto"
                className={cn(fieldClass, "resize-y leading-relaxed")}
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              {answers.map((field) => {
                const label = displayLabel(t, field.id, field.label);
                const choices = choicesFor(field.id);
                if (field.id === "budget") {
                  return (
                    <BudgetField
                      key={field.id}
                      label={copy.budgetAmount}
                      value={field.value}
                      onChange={(value) => set("budget", value)}
                    />
                  );
                }
                return (
                  <label key={field.id} className="text-sm font-medium text-mist/80">
                    {label}
                    {choices ? (
                      <select value={field.value} onChange={(e) => set(field.id, e.target.value)} className={fieldClass}>
                        {!choices.includes(field.value) && <option value={field.value}>{displayValue(t, field.value)}</option>}
                        {choices.map((choice) => (
                          <option key={choice} value={choice} className="bg-ink-900">
                            {displayValue(t, choice)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={field.value}
                        onChange={(e) => set(field.id, e.target.value)}
                        maxLength={120}
                        dir="auto"
                        className={fieldClass}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* What will update, before anything runs. */}
          <div className="glass mt-6 rounded-3xl p-6 sm:p-8" aria-live="polite">
            {impact.update.length === 0 ? (
              <p className="text-sm text-mist/55">{copy.noChanges}</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-300">
                    <RefreshCw aria-hidden className="size-4" />
                    {copy.willUpdate}
                  </h2>
                  <ul className="mt-3 space-y-1.5 text-sm text-mist/80">
                    {impact.update.map((s) => (
                      <li key={s}>{copy.sections[s]}</li>
                    ))}
                  </ul>
                </div>
                {impact.keep.length > 0 && (
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                      <Check aria-hidden className="size-4" />
                      {copy.staysSame}
                    </h2>
                    <ul className="mt-3 space-y-1.5 text-sm text-mist/60">
                      {impact.keep.map((s) => (
                        <li key={s}>{copy.sections[s]}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-[#fab219]/25 bg-[#fab219]/10 px-3.5 py-2.5 text-sm text-[#fcc95a]">
              {displayError(t, error)}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving || impact.update.length === 0 || !idea.trim()}
              className={buttonClass("primary", "md")}
            >
              {saving && <Loader2 aria-hidden className="size-4 animate-spin" />}
              {saving ? copy.saving : copy.save}
            </button>
            {!saving && (
              <Link href={journey.plan} className="px-3 py-2 text-sm text-mist/55 hover:text-white">
                {copy.cancel}
              </Link>
            )}
          </div>
          {saving && <p className="mt-3 text-sm text-mist/50">{copy.savingHint}</p>}
        </section>

        <aside aria-labelledby="history-title" className="lg:pt-24">
          <h2 id="history-title" className="flex items-center gap-2 text-sm font-semibold text-white">
            <History aria-hidden className="size-4 text-mist/60" />
            {copy.history.title}
          </h2>
          <ol className="mt-4 space-y-3">
            {history.map((entry) => (
              <li key={entry.version} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white">{copy.history.version(entry.version)}</span>
                  {entry.current && (
                    <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[11px] text-brand-300">
                      {copy.history.current}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-mist/45">{updatedOn(entry.createdAt, locale, t)}</p>
                <ul className="mt-2 space-y-1 text-xs text-mist/65">
                  {entry.changes.length === 0 ? (
                    <li>{copy.history.first}</li>
                  ) : (
                    entry.changes.map((c) => (
                      <li key={c.id}>
                        <span className="text-mist/45">{c.id === "idea" ? copy.idea : displayLabel(t, c.id, c.label)}: </span>
                        {c.id === "idea" ? displayValue(t, c.to) : copy.history.changedTo(displayValue(t, c.from), displayValue(t, c.to))}
                      </li>
                    ))
                  )}
                </ul>
              </li>
            ))}
          </ol>
        </aside>
      </Container>
    </main>
  );
}

/** The budget as a number in AED; the stored answer only changes once a whole amount is typed. */
function BudgetField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const range = parseAedRange(value);
  const [text, setText] = useState(String(range?.minAed ?? range?.maxAed ?? ""));
  return (
    <label className="text-sm font-medium text-mist/80">
      {label}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1000}
        dir="ltr"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const amount = Number(e.target.value);
          if (e.target.value && amount > 0) onChange(budgetValue(amount));
        }}
        className={cn(fieldClass, "rtl:text-right")}
      />
    </label>
  );
}
