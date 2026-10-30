"use client";

import { Check, Clock, Copy, ImageIcon, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TypingIndicator } from "@/features/onboarding/components/Messages";
import { cn } from "@/lib/cn";
import type { GeneratedCaptionCopy } from "../captionSchema";
import {
  contentTypes,
  formatPost,
  generatePost,
  type CaptionContext,
  type ContentType,
  type GeneratedPost,
  type Language,
  type Platform,
} from "../captions";

const THINK_MS = 900;
const CHARS_PER_TICK = 5;
const TICK_MS = 16;

type Status = "idle" | "thinking" | "writing" | "done" | "error";

/** Asks the server to write a post with Claude for this business. */
async function requestLivePost(
  context: CaptionContext,
  type: ContentType,
  platform: Platform,
  language: Language,
): Promise<GeneratedPost> {
  const res = await fetch("/api/captions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, platform, language, context }),
  });
  const data = (await res.json().catch(() => ({}))) as { copy?: GeneratedCaptionCopy; error?: string };
  if (!res.ok || !data.copy) throw new Error(data.error ?? "The caption couldn't be written.");
  const { visual, bestTime, ...parts } = data.copy;
  return { text: formatPost(parts, platform, language), visual, bestTime };
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wider text-mist/45 uppercase">{label}</p>
      <div role="radiogroup" aria-label={label} className="mt-2 inline-flex rounded-full border border-white/10 p-0.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs transition-colors",
              value === o.id ? "bg-brand-500/25 text-white" : "text-mist/55 hover:text-white",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ContentGenerator({ context }: { context?: CaptionContext }) {
  const [type, setType] = useState<ContentType>("teaser");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [language, setLanguage] = useState<Language>("en");
  const [status, setStatus] = useState<Status>("idle");
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [shown, setShown] = useState(0);
  const [copied, setCopied] = useState(false);
  const [outputLang, setOutputLang] = useState<Language>("en");
  const [error, setError] = useState("");
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  async function generate() {
    clearTimers();
    setOutputLang(language);
    setShown(0);
    setCopied(false);
    setStatus("thinking");

    // Live businesses get a caption written by Claude; the demo uses its hand-written copy.
    let result: GeneratedPost;
    try {
      result = context
        ? await requestLivePost(context, type, platform, language)
        : generatePost(type, platform, language);
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
      return;
    }
    setPost(result);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timers.current.push(
      window.setTimeout(() => {
        if (reduced) {
          setShown(result.text.length);
          setStatus("done");
          return;
        }
        setStatus("writing");
        // Reveal the text progressively so it reads as it's being written.
        const step = (n: number) => {
          const next = Math.min(n + CHARS_PER_TICK, result.text.length);
          setShown(next);
          if (next < result.text.length) {
            timers.current.push(window.setTimeout(() => step(next), TICK_MS));
          } else {
            setStatus("done");
          }
        };
        step(0);
      }, context ? 0 : THINK_MS),
    );
  }

  async function copy() {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(post.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked — the text remains selectable.
    }
  }

  const busy = status === "thinking" || status === "writing";
  const objective = contentTypes.find((c) => c.id === type)!.objective;

  return (
    <section
      id="generator"
      aria-labelledby="generator-title"
      className="glass relative scroll-mt-24 overflow-hidden rounded-3xl p-5 sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full bg-electric-500/10 blur-[100px]"
      />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        {/* Controls */}
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-300">
            <Sparkles className="size-3.5" />
            AI content generator
          </p>
          <h2 id="generator-title" className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Generate a ready-to-post caption
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mist/55">
            Ibda writes from your positioning, price range and launch timeline — pick what you need.
          </p>

          <p className="mt-6 text-[11px] font-medium tracking-wider text-mist/45 uppercase">Content type</p>
          <div role="radiogroup" aria-label="Content type" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {contentTypes.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={type === c.id}
                onClick={() => setType(c.id)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-left transition-all",
                  type === c.id
                    ? "border-brand-400/50 bg-brand-500/15"
                    : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]",
                )}
              >
                <p className={cn("text-[13px] font-medium", type === c.id ? "text-white" : "text-mist/75")}>{context && c.id === "styling" ? "Product in use" : c.label}</p>
                <p className="text-[11px] text-mist/45">{c.objective}</p>
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-6">
            <Segmented
              label="Platform"
              value={platform}
              onChange={setPlatform}
              options={[
                { id: "instagram", label: "Instagram" },
                { id: "tiktok", label: "TikTok" },
              ]}
            />
            <Segmented
              label="Language"
              value={language}
              onChange={setLanguage}
              options={[
                { id: "en", label: "English" },
                { id: "ar", label: "العربية" },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={busy}
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-6 text-base font-medium text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_10px_40px_-6px_rgb(139_108_255/0.8)] transition-all hover:-translate-y-px disabled:translate-y-0 disabled:opacity-70 sm:w-auto"
          >
            <Wand2 className="size-4" />
            {busy ? "Generating…" : post ? "Generate again" : "Generate Content"}
          </button>
        </div>

        {/* Output */}
        <div className="flex min-h-[22rem] flex-col rounded-2xl border border-white/[0.08] bg-ink-900/70" aria-live="polite">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="size-7 rounded-full bg-gradient-to-br from-brand-400 to-electric-500" aria-hidden />
              <div>
                <p className="text-[13px] font-medium text-white">your.brand</p>
                <p className="text-[11px] text-mist/45">
                  {platform === "instagram" ? "Instagram post" : "TikTok video"} · {objective}
                </p>
              </div>
            </div>
            {status === "done" && (
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-mist/75 hover:bg-white/5 hover:text-white"
              >
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          <div className="flex-1 px-4 py-4">
            {status === "idle" && (
              <div className="grid h-full place-items-center text-center">
                <p className="max-w-xs text-sm text-mist/45">
                  Choose a content type and press <span className="text-mist/75">Generate Content</span>.
                  Your caption will appear here.
                </p>
              </div>
            )}
            {status === "thinking" && <TypingIndicator label="Writing from your strategy…" />}
            {status === "error" && <p className="text-sm text-mist/60">{error} Try again in a moment.</p>}
            {(status === "writing" || status === "done") && post && (
              <p
                dir={outputLang === "ar" ? "rtl" : "ltr"}
                lang={outputLang}
                className={cn(
                  "text-[14px] leading-relaxed whitespace-pre-wrap text-mist/90",
                  outputLang === "ar" && "font-arabic text-[15px] leading-loose",
                )}
              >
                {post.text.slice(0, shown)}
                {status === "writing" && (
                  <span aria-hidden className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-brand-300" />
                )}
              </p>
            )}
          </div>

          {status === "done" && post && (
            <dl className="grid animate-message-in gap-3 border-t border-white/[0.06] px-4 py-3 sm:grid-cols-2">
              <div className="flex gap-2">
                <ImageIcon className="mt-0.5 size-3.5 shrink-0 text-brand-300" />
                <div>
                  <dt className="text-[10px] tracking-wider text-mist/40 uppercase">Suggested visual</dt>
                  <dd className="text-xs leading-snug text-mist/70">{post.visual}</dd>
                </div>
              </div>
              <div className="flex gap-2">
                <Clock className="mt-0.5 size-3.5 shrink-0 text-brand-300" />
                <div>
                  <dt className="text-[10px] tracking-wider text-mist/40 uppercase">Best time to post</dt>
                  <dd className="text-xs leading-snug text-mist/70">
                    {post.bestTime} <span className="text-mist/40">({context ? "estimate" : "demo estimate"})</span>
                  </dd>
                </div>
              </div>
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
