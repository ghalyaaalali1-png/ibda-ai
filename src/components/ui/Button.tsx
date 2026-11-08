import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Calm blue to violet, mirrored in Arabic so it always runs with the reading direction.
  primary:
    "bg-gradient-to-r from-electric-500 to-brand-500 text-white rtl:bg-gradient-to-l shadow-[0_0_0_1px_rgb(255_255_255/0.14)_inset,0_8px_24px_-8px_rgb(107_92_219/0.55)] hover:shadow-[0_0_0_1px_rgb(255_255_255/0.22)_inset,0_10px_32px_-6px_rgb(107_92_219/0.7)] hover:-translate-y-px",
  secondary:
    "glass text-mist hover:bg-white/10 hover:border-white/15",
  ghost: "text-mist/70 hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

/** The button look, for a <button> (a form submit, say). */
export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cn(base, variants[variant], sizes[size], className);

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
