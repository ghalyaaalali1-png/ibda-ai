"use client";

import { Check, Copy, Info, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TypingIndicator } from "@/features/onboarding/components/Messages";
import { cn } from "@/lib/cn";
import { generateRfq, type RfqTone } from "../rfq";
import type { SourcingBrief, Supplier } from "../types";

export type RfqStatus = "drafted" | "sent";

const DRAFT_MS = 1100;

export function RfqDrawer({
  supplier,
  brief,
  status,
  onDrafted,
  onMarkSent,
  onClose,
}: {
  supplier: Supplier;
  brief: SourcingBrief;
  status?: RfqStatus;
  onDrafted: () => void;
  onMarkSent: () => void;
  onClose: () => void;
}) {
  const [tone, setTone] = useState<RfqTone>("formal");
  const [drafting, setDrafting] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // "Draft" the message whenever the supplier or tone changes.
  useEffect(() => {
    setDrafting(true);
    const t = setTimeout(() => {
      const draft = generateRfq(supplier, brief, tone);
      setSubject(draft.subject);
      setBody(draft.body);
      setDrafting(false);
      onDrafted();
    }, DRAFT_MS);
    return () => clearTimeout(t);
    // onDrafted is stable for a given supplier; re-drafting on its identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier, brief, tone]);

  // Focus, Escape to close, and lock page scroll while open.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked — the text is still selectable in the editor.
    }
  }

  const total = brief.designs * brief.piecesPerDesign;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch">
      <button
        type="button"
        aria-label="Close RFQ"
        onClick={onClose}
        className="absolute inset-0 animate-[message-in_0.2s_ease-out_both] bg-ink-950/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfq-title"
        className="relative flex max-h-[92dvh] w-full animate-message-in flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-900 shadow-2xl sm:max-h-none sm:max-w-lg sm:rounded-none sm:rounded-l-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-300">
              <Sparkles className="size-3.5" />
              Supplier enquiry · drafted by Ibda
            </p>
            <h2 id="rfq-title" className="mt-1 truncate text-lg font-semibold text-white">
              {supplier.name}
            </h2>
            <p className="text-xs text-mist/45">{supplier.location}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full text-mist/60 hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <p className="text-[11px] font-medium tracking-wider text-mist/45 uppercase">
            Using your business plan
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {[
              `${brief.designs} designs × ${brief.piecesPerDesign} pieces = ${total}`,
              `Retail ${brief.targetRetail}`,
              "Premium positioning",
              `Launch ${brief.launchWindow.replace("within the next ", "in ")}`,
            ].map((chip) => (
              <li key={chip} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-mist/70">
                {chip}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium tracking-wider text-mist/45 uppercase">Tone</span>
            <div role="radiogroup" aria-label="Tone" className="inline-flex rounded-full border border-white/10 p-0.5">
              {(["formal", "concise"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={tone === t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs capitalize transition-colors",
                    tone === t ? "bg-brand-500/25 text-white" : "text-mist/55 hover:text-white",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4" aria-live="polite">
            {drafting ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <TypingIndicator label="Drafting your enquiry from the plan…" />
              </div>
            ) : (
              <div className="animate-message-in space-y-3">
                <label className="block">
                  <span className="text-[11px] font-medium tracking-wider text-mist/45 uppercase">Subject</span>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-brand-400/50 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium tracking-wider text-mist/45 uppercase">Message</span>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={14}
                    className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[13px] leading-relaxed text-mist/90 focus:border-brand-400/50 focus:outline-none"
                  />
                </label>
              </div>
            )}
          </div>

          <p className="mt-4 flex gap-2 text-[11px] leading-relaxed text-mist/40">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Demo supplier — contact details aren&apos;t included in prototype data. Copy the message
            to send it to a real supplier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={copy}
            disabled={drafting}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 px-4 text-sm text-mist/80 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy message"}
          </button>
          <button
            type="button"
            onClick={onMarkSent}
            disabled={drafting || status === "sent"}
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px disabled:translate-y-0 disabled:opacity-60"
          >
            {status === "sent" ? <Check className="size-4" /> : <Send className="size-4" />}
            {status === "sent" ? "Marked as sent" : "Mark as sent"}
          </button>
        </div>
      </div>
    </div>
  );
}
