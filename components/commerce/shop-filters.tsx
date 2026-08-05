"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types/domain";

/**
 * Filters are URL state so results are shareable and indexable (Part 11.2).
 * Desktop: left sidebar. Mobile: bottom sheet with a sticky "Show N results".
 */
export function ShopFilters({ categories, resultCount }: { categories: Category[]; resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const activeCount = ["category", "suitability", "availability", "price"].filter((k) => params.get(k)).length;

  const Body = (
    <div className="space-y-6">
      <FilterGroup title="Category">
        {categories.map((c) => (
          <FilterButton key={c.slug} active={params.get("category") === c.slug} onClick={() => setParam("category", c.slug)}>
            {c.name}
          </FilterButton>
        ))}
      </FilterGroup>

      <FilterGroup title="Suitability">
        {[
          ["beginner_friendly", "Beginner friendly"],
          ["reseller", "Good for resale"],
          ["personal_use", "Buying for myself"],
        ].map(([val, label]) => (
          <FilterButton key={val} active={params.get("suitability") === val} onClick={() => setParam("suitability", val)}>
            {label}
          </FilterButton>
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <FilterButton active={params.get("availability") === "in_stock"} onClick={() => setParam("availability", "in_stock")}>
          In stock now
        </FilterButton>
      </FilterGroup>

      <FilterGroup title="Max price">
        {[
          ["1000", "Under £10"],
          ["2000", "Under £20"],
          ["5000", "Under £50"],
        ].map(([val, label]) => (
          <FilterButton key={val} active={params.get("price") === val} onClick={() => setParam("price", val)}>
            {label}
          </FilterButton>
        ))}
      </FilterGroup>

      <FilterGroup title="Sort by">
        {[
          ["featured", "Featured"],
          ["newest", "Newest"],
          ["price_asc", "Price: low to high"],
          ["price_desc", "Price: high to low"],
          ["best_selling", "Best selling"],
        ].map(([val, label]) => (
          <FilterButton key={val} active={(params.get("sort") ?? "featured") === val} onClick={() => setParam("sort", val)}>
            {label}
          </FilterButton>
        ))}
      </FilterGroup>

      {activeCount > 0 && (
        <button
          onClick={() => router.push(pathname, { scroll: false })}
          className="text-sm text-ink-50 underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <h2 className="mb-4 font-display text-lg">Filters</h2>
        {Body}
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="w-full">
          Filters {activeCount > 0 && <span className="ml-1 rounded-full bg-gold px-1.5 text-xs text-navy">{activeCount}</span>}
        </Button>
      </div>

      {/* Mobile bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[var(--radius-modal)] bg-surface p-5 pb-24 shadow-[var(--shadow-overlay)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Filters</h2>
              <button aria-label="Close filters" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center text-navy">
                ✕
              </button>
            </div>
            {Body}
          </div>
          <div className="absolute inset-x-0 bottom-0 border-t border-line bg-surface p-4">
            <Button variant="gold" size="full" onClick={() => setOpen(false)}>
              Show {resultCount} results
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-micro text-ink-50">{title}</p>
      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">{children}</div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-colors",
        active ? "border-gold bg-gold-pale text-navy" : "border-line bg-surface text-ink-70 hover:border-gold"
      )}
    >
      {children}
    </button>
  );
}
