import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

export function StatusPill({ complete, failed = false }: { complete: boolean; failed?: boolean }) {
  const working = !complete && !failed;
  return (
    <span
      role="status"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-500",
        complete
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : failed
            ? "border-[#fab219]/35 bg-[#fab219]/10 text-[#fcc95a]"
            : "border-brand-400/25 bg-brand-500/10 text-brand-300",
      )}
    >
      <span className="relative flex size-1.5">
        {working && (
          <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-brand-400" />
        )}
        <span
          className={cn(
            "relative inline-flex size-1.5 rounded-full",
            complete ? "bg-emerald-400" : failed ? "bg-[#fab219]" : "bg-brand-400",
          )}
        />
      </span>
      {complete ? "Analysis complete" : failed ? "Analysis stopped" : "Analysis in progress"}
    </span>
  );
}

export function WorkspaceHeader({
  profileLine,
  complete,
  failed,
}: {
  profileLine: string;
  complete: boolean;
  failed?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Logo />
          <span aria-hidden className="hidden h-5 w-px bg-white/10 sm:block" />
          <span className="hidden text-sm font-medium text-mist/80 sm:block">
            Agent Workspace
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-4">
          <span className="hidden truncate text-sm text-mist/50 lg:block">
            {profileLine}
          </span>
          <StatusPill complete={complete} failed={failed} />
        </div>
      </Container>
    </header>
  );
}
