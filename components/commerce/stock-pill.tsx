import { cn } from "@/lib/utils/cn";
import type { StockStatus } from "@/types/domain";

const map: Record<StockStatus, { label: string; className: string }> = {
  in_stock: { label: "In Stock", className: "text-profit border-profit/30 bg-profit/5" },
  low_stock: { label: "Low Stock", className: "text-danger border-danger/30 bg-danger/5" },
  sold_out: { label: "Sold Out", className: "text-danger border-danger/30 bg-danger/5" },
  preorder: { label: "Pre-order", className: "text-ink-70 border-line bg-surface-alt" },
  coming_soon: { label: "Coming Soon", className: "text-ink-70 border-line bg-surface-alt" },
};

export function StockPill({ status, className }: { status: StockStatus; className?: string }) {
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-micro leading-none",
        s.className,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {s.label}
    </span>
  );
}
