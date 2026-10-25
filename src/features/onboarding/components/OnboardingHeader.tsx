import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Logo } from "@/components/ui/Logo";

export function OnboardingHeader({
  progress,
  onReset,
}: {
  /** 0–1 while questions are in progress; hidden when undefined. */
  progress?: number;
  onReset?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="hidden sm:block">
            <Eyebrow>AI Business Launch Agent</Eyebrow>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Start over"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-mist/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <RotateCcw className="size-3.5" />
              <span aria-hidden className="hidden sm:inline">Start over</span>
            </button>
          )}
          <Link
            href={routes.home}
            aria-label="Back to home"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-mist/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            <span aria-hidden className="hidden sm:inline">Back to home</span>
          </Link>
        </div>
      </Container>
      {progress !== undefined && (
        <div
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="absolute inset-x-0 -bottom-px h-px bg-white/5"
        >
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-electric-400 transition-[width] duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </header>
  );
}
