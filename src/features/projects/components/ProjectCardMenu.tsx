"use client";

import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { buttonClass } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import { deleteProject, renameProject } from "../actions";

type Dialog = "rename" | "delete" | null;

/** The ⋯ menu on a project card: rename it, or delete it after confirming. */
export function ProjectCardMenu({ id, name }: { id: string; name: string }) {
  const { t } = useI18n();
  const copy = t.auth.projects;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [draft, setDraft] = useState(name);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu on an outside click or Escape.
  useEffect(() => {
    if (!open && !dialog) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), setDialog(null));
    const onClick = (e: MouseEvent) => open && !menuRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, dialog]);

  const run = (action: () => Promise<{ ok: boolean }>) =>
    start(async () => {
      setFailed(false);
      const result = await action().catch(() => ({ ok: false }));
      if (!result.ok) return setFailed(true);
      setDialog(null);
      router.refresh();
    });

  const itemClass = "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-white/5";

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label={copy.menu(name)}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid size-8 place-items-center rounded-full text-mist/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <MoreHorizontal aria-hidden className="size-4" />
        </button>
        {open && (
          <div role="menu" className="absolute end-0 top-9 z-20 w-40 rounded-xl border border-white/10 bg-ink-800 p-1 shadow-xl">
            <button
              type="button"
              role="menuitem"
              className={cn(itemClass, "text-mist/85")}
              onClick={() => {
                setOpen(false);
                setDraft(name);
                setFailed(false);
                setDialog("rename");
              }}
            >
              <Pencil aria-hidden className="size-3.5" />
              {copy.rename}
            </button>
            <button
              type="button"
              role="menuitem"
              className={cn(itemClass, "text-red-300")}
              onClick={() => {
                setOpen(false);
                setFailed(false);
                setDialog("delete");
              }}
            >
              <Trash2 aria-hidden className="size-3.5" />
              {copy.delete}
            </button>
          </div>
        )}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/70 p-4 backdrop-blur-sm" onClick={() => !pending && setDialog(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            className="glass w-full max-w-sm rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="project-dialog-title" className="text-lg font-semibold text-white">
              {dialog === "rename" ? copy.renameTitle : copy.deleteTitle(name)}
            </h2>
            {dialog === "rename" ? (
              <form
                className="mt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) run(() => renameProject(id, draft));
                }}
              >
                <label className="text-sm font-medium text-mist/80">
                  {copy.nameLabel}
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={120}
                    dir="auto"
                    className="mt-1.5 block h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-[15px] text-white focus:border-brand-400/60 focus:outline-none"
                  />
                </label>
                {failed && <p role="alert" className="mt-3 text-sm text-[#fcc95a]">{copy.actionFailed}</p>}
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setDialog(null)} className={buttonClass("ghost", "sm")}>
                    {copy.cancel}
                  </button>
                  <button type="submit" disabled={pending || !draft.trim()} className={buttonClass("primary", "sm")}>
                    {pending && <Loader2 aria-hidden className="size-3.5 animate-spin" />}
                    {copy.save}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="mt-3 text-sm leading-relaxed text-mist/65">{copy.deleteBody}</p>
                {failed && <p role="alert" className="mt-3 text-sm text-[#fcc95a]">{copy.actionFailed}</p>}
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setDialog(null)} className={buttonClass("ghost", "sm")}>
                    {copy.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => deleteProject(id))}
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-red-500/90 px-4 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                  >
                    {pending && <Loader2 aria-hidden className="size-3.5 animate-spin" />}
                    {copy.deleteConfirm}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
