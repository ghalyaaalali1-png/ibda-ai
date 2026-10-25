import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function DashCard({
  title,
  icon: Icon,
  action,
  children,
  className,
  id,
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={cn("glass flex h-full flex-col rounded-3xl p-5 sm:p-6", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id={id ? `${id}-title` : undefined}
          className="flex items-center gap-2.5 text-sm font-semibold text-white"
        >
          {Icon && (
            <span className="grid size-7 place-items-center rounded-lg border border-brand-400/25 bg-brand-500/15 text-brand-300">
              <Icon className="size-3.5" />
            </span>
          )}
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-5 flex flex-1 flex-col">{children}</div>
    </section>
  );
}

/** Small uppercase caption used above figures. */
export function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium tracking-wider text-mist/45 uppercase">
      {children}
    </p>
  );
}
