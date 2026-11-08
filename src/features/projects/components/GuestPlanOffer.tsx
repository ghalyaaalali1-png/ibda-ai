"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { buttonClass } from "@/components/ui/Button";
import { markGuestPlanHandled, readGuestPlan } from "@/features/assessment/storage";
import { profileValue } from "@/features/launch-profile/profile";
import { displayValue } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import { saveGuestPlan } from "../actions";
import { projectRoutes } from "../types";

/**
 * On My projects: offers to save a plan made in this browser before signing
 * in, so it isn't lost. Saving copies the plan as it is — no new AI work.
 */
export function GuestPlanOffer() {
  const { t } = useI18n();
  const copy = t.auth.projects.guest;
  const router = useRouter();
  const [guest, setGuest] = useState<ReturnType<typeof readGuestPlan>>(null);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  // Session storage is only readable in the browser, after the first render.
  useEffect(() => setGuest(readGuestPlan()), []);
  if (!guest) return null;

  const name = displayValue(t, profileValue(guest.input.profile, "business") ?? "");

  function save() {
    start(async () => {
      setFailed(false);
      const { input, stored } = guest!;
      const result = await saveGuestPlan({
        ...input,
        locale: stored.locale,
        assessment: stored.assessment,
        translations: stored.translations,
        businessNames: stored.businessNames,
      }).catch(() => ({ status: "failed" as const }));
      if (result.status !== "saved") return setFailed(true);
      markGuestPlanHandled();
      router.push(projectRoutes(result.id).plan);
    });
  }

  return (
    <section
      aria-labelledby="guest-plan-title"
      className="mt-8 flex flex-col gap-4 rounded-3xl border border-brand-400/25 bg-gradient-to-br from-brand-500/15 to-electric-500/10 p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-3">
        <Sparkles aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-300" />
        <div>
          <h2 id="guest-plan-title" className="font-semibold text-white">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-mist/65">{copy.body(name)}</p>
          {failed && (
            <p role="alert" className="mt-2 text-sm text-[#fcc95a]">
              {t.auth.projects.actionFailed}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => {
            markGuestPlanHandled();
            setGuest(null);
          }}
          className={buttonClass("ghost", "sm")}
        >
          {copy.dismiss}
        </button>
        <button type="button" onClick={save} disabled={pending} className={buttonClass("primary", "sm")}>
          {pending && <Loader2 aria-hidden className="size-3.5 animate-spin" />}
          {pending ? copy.saving : copy.save}
        </button>
      </div>
    </section>
  );
}
