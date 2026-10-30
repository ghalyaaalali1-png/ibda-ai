import { Boxes, Gem, Package, Scissors, Shirt, Store, Truck, type LucideIcon } from "lucide-react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import type { CategoryInfo, SupplierCategory } from "../types";

// Demo categories keep their own icons; other categories cycle through neutral ones.
const demoIcons: Record<string, LucideIcon> = {
  fabric: Shirt,
  tailoring: Scissors,
  embellishment: Gem,
  packaging: Package,
};
const neutralIcons: LucideIcon[] = [Boxes, Package, Truck, Store];

export function CategoryTabs({
  categories,
  counts,
  active,
  onChange,
}: {
  categories: CategoryInfo[];
  counts: Record<SupplierCategory, number>;
  active: SupplierCategory;
  onChange: (id: SupplierCategory) => void;
}) {
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = categories[(index + delta + categories.length) % categories.length];
    onChange(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Supplier categories"
      className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {categories.map((c, i) => {
        const Icon = demoIcons[c.id] ?? neutralIcons[i % neutralIcons.length];
        const selected = c.id === active;
        return (
          <button
            key={c.id}
            id={`tab-${c.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls="supplier-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(c.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
              selected
                ? "border-brand-400/50 bg-brand-500/20 text-white shadow-[0_0_30px_-10px_rgb(139_108_255/0.8)]"
                : "border-white/10 bg-white/[0.02] text-mist/65 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="size-4" />
            {c.label}
            <span
              className={cn(
                "rounded-full px-1.5 font-mono text-[11px]",
                selected ? "bg-white/15 text-white" : "bg-white/[0.06] text-mist/50",
              )}
            >
              {counts[c.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
