import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** The page's centred, padded column. `as="main"` marks a screen's main content for screen readers. */
export function Container({ className, as: Tag = "div", ...props }: ComponentProps<"div"> & { as?: "div" | "main" }) {
  return <Tag className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)} {...props} />;
}
