"use client";

import { Loader2, PackagePlus, Search } from "lucide-react";
import { useState } from "react";
import { displayError } from "@/i18n";
import { useI18n } from "@/i18n/I18nProvider";
import { MAX_ITEM_LENGTH } from "../items";

export type SupplierEditor = {
  /** Adds a group for the item; resolves to "exists" when there already is one. */
  add: (item: string) => Promise<"added" | "exists">;
  remove: (label: string) => Promise<void>;
  /** Added groups only last for this browser tab (no account). */
  guest: boolean;
};

/** "Need another supplier?": the founder names an item and KHITTA adds a group of supplier options for it. */
export function AddSupplierItem({ editor, onAdded }: { editor: SupplierEditor; onAdded: (result: "added" | "exists", item: string) => void }) {
  const { t } = useI18n();
  const copy = t.suppliers.addItem;
  const [item, setItem] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const submit = async () => {
    const value = item.trim();
    if (!value || pending) return;
    setPending(true);
    setMessage(null);
    try {
      const result = await editor.add(value);
      setMessage({ tone: "ok", text: result === "exists" ? copy.exists : copy.added(value) });
      if (result === "added") setItem("");
      onAdded(result, value);
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? displayError(t, error.message) : copy.failed });
    } finally {
      setPending(false);
    }
  };

  return (
    <section aria-labelledby="add-supplier-title" className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-brand-400/25 bg-brand-500/10 text-brand-300">
          <PackagePlus aria-hidden className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 id="add-supplier-title" className="text-lg font-semibold text-white">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-mist/60">{copy.hint}</p>
        </div>
      </div>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label htmlFor="supplier-item" className="sr-only">
          {copy.label}
        </label>
        <input
          id="supplier-item"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          maxLength={MAX_ITEM_LENGTH}
          placeholder={copy.placeholder}
          dir="auto"
          disabled={pending}
          className="h-11 w-full min-w-0 rounded-xl border border-white/10 sm:flex-1 bg-white/[0.03] px-3.5 text-[15px] text-white placeholder:text-mist/50 focus:border-brand-400/60 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending || !item.trim()}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-electric-500 to-brand-500 px-5 text-sm font-medium text-white disabled:opacity-40 rtl:bg-gradient-to-l"
        >
          {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Search aria-hidden className="size-4" />}
          {pending ? copy.working : copy.button}
        </button>
      </form>
      <div aria-live="polite">
        {message && (
          <p className={message.tone === "ok" ? "mt-3 text-sm text-emerald-300" : "mt-3 text-sm text-[#fcc95a]"}>{message.text}</p>
        )}
      </div>
      {editor.guest && <p className="mt-3 text-xs text-mist/55">{copy.guestNote}</p>}
    </section>
  );
}
