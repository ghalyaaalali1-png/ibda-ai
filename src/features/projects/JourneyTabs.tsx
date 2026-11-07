"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { routes } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import { useJourneyRoutes, useProject } from "./ProjectProvider";

/**
 * The second row of every journey header: one click to any part of the
 * business (Workspace, Plan, Suppliers, Marketing, Launch Pack), and back to
 * My projects inside a saved project. Scrolls sideways on narrow phones.
 */
export function JourneyTabs() {
  const { t } = useI18n();
  const journey = useJourneyRoutes();
  const project = useProject();
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);
  // On narrow screens, slide the bar so the current tab is in view.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);
  const tabs = [
    { href: journey.analysis, label: t.common.workspace },
    { href: journey.plan, label: t.common.businessPlan },
    { href: journey.suppliers, label: t.common.suppliers },
    { href: journey.marketing, label: t.common.marketing },
    { href: journey.launchPack, label: t.common.launchPack },
  ];

  return (
    <nav aria-label={t.common.sections} className="border-t border-white/[0.05]">
      <Container className="flex items-center gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {project && (
          <>
            <Link
              href={routes.projects}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-mist/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft aria-hidden className="size-3.5 rtl:-scale-x-100" />
              {t.auth.myProjects}
            </Link>
            <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-white/10" />
          </>
        )}
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              ref={active ? activeRef : undefined}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors",
                active
                  ? "bg-brand-500/20 font-medium text-white shadow-[0_0_0_1px_rgb(164_139_255/0.35)_inset]"
                  : "text-mist/60 hover:bg-white/5 hover:text-white",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
        {project && (
          <>
            <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-white/10" />
            <Link
              href={journey.edit}
              ref={pathname === journey.edit ? activeRef : undefined}
              aria-current={pathname === journey.edit ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors",
                pathname === journey.edit
                  ? "bg-brand-500/20 font-medium text-white shadow-[0_0_0_1px_rgb(164_139_255/0.35)_inset]"
                  : "text-brand-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Pencil aria-hidden className="size-3.5" />
              {t.edit.tab}
            </Link>
          </>
        )}
      </Container>
    </nav>
  );
}
