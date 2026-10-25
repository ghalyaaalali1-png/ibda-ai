import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/25 bg-brand-500/10 px-3 py-1 text-xs font-medium tracking-wide text-brand-300">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-brand-400" />
        <span className="relative inline-flex size-1.5 rounded-full bg-brand-400" />
      </span>
      {children}
    </span>
  );
}
