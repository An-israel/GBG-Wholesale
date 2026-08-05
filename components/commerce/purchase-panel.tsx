"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/primitives";
import { StockPill } from "./stock-pill";
import { costPerUnitPence, formatPence } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Product, ProductVariant } from "@/types/domain";

/**
 * Product purchase panel + sticky mobile buy bar (Part 12.2 / 3.4). Selecting a
 * variant updates images, price and stock without a page reload. Quantity starts
 * at MOQ; below-MOQ is impossible. Sold-out converts the button to notify-me.
 */
export function PurchasePanel({ product }: { product: Product }) {
  const addLine = useCart((s) => s.addLine);
  const [variant, setVariant] = useState<ProductVariant | null>(product.variants[0] ?? null);
  const moq = variant?.moq_override ?? product.moq;
  const [qty, setQty] = useState(moq);
  const [notified, setNotified] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQty((q) => Math.max(moq, q));
  }, [moq]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const unitPrice = product.wholesale_price_pence + (variant?.price_delta_pence ?? 0);
  const perUnit = costPerUnitPence(unitPrice, product.pack_quantity);
  const lineTotal = unitPrice * qty;
  const variantStock = variant ? variant.stock_quantity : product.stock_quantity;
  const soldOut = product.stock_status === "sold_out" || (variant ? variant.stock_quantity <= 0 : false);
  const primary = product.images.find((i) => i.is_primary) ?? product.images[0];

  function add(buyNow = false) {
    addLine({
      productSlug: product.slug,
      productName: product.name,
      sku: variant?.sku ?? product.sku,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? null,
      imageUrl: primary?.storage_path ?? "",
      unitPricePence: unitPrice,
      packQuantity: product.pack_quantity,
      moq,
      quantity: qty,
    });
    if (buyNow) window.location.href = "/cart";
  }

  return (
    <div ref={boxRef} className="space-y-5">
      {/* Price block */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold text-ink">{formatPence(unitPrice)}</span>
          <span className="text-sm text-ink-50">/ {product.pack_quantity > 1 ? `pack of ${product.pack_quantity}` : "each"}</span>
          {product.compare_at_price_pence && product.compare_at_price_pence > unitPrice && (
            <span className="text-sm text-ink-50 line-through">{formatPence(product.compare_at_price_pence)}</span>
          )}
        </div>
        {product.pack_quantity > 1 && (
          <p className="font-display text-2xl font-semibold text-ink">
            {formatPence(perUnit)} <span className="font-body text-sm font-normal text-ink-50">per unit</span>
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Chip>MOQ: {moq} {moq === 1 ? "unit" : "units"}</Chip>
          <StockPill status={soldOut ? "sold_out" : product.stock_status} />
          {product.mix_and_match_allowed && <Chip>Mix &amp; match across colours</Chip>}
        </div>
      </div>

      {/* Suggested retail — Profit Green, with the required disclaimer */}
      {product.suggested_retail_price_pence && (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface-alt p-4">
          <p className="text-sm">
            <span className="text-ink-70">Example retail price: </span>
            <span className="font-display text-xl font-semibold text-profit">
              {formatPence(product.suggested_retail_price_pence)}
            </span>
          </p>
          <p className="mt-1 text-xs text-ink-50">
            An example only, not a promise of earnings. Your results depend on how you price and sell.
          </p>
        </div>
      )}

      {/* Variant swatches */}
      {product.variants.length > 0 && (
        <div>
          <p className="mb-2 text-micro text-ink-50">Colour: {variant?.name}</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariant(v)}
                aria-pressed={variant?.id === v.id}
                aria-label={v.name}
                disabled={v.stock_quantity <= 0}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
                  variant?.id === v.id ? "border-gold bg-gold-pale" : "border-line",
                  v.stock_quantity <= 0 && "opacity-40"
                )}
              >
                {v.hex_or_swatch_url?.startsWith("#") && (
                  <span className="h-4 w-4 rounded-full border border-line" style={{ backgroundColor: v.hex_or_swatch_url }} />
                )}
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!soldOut && (
        <>
          {/* Quantity stepper with helper + live line total */}
          <div>
            <label className="mb-2 block text-micro text-ink-50">Quantity</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-[var(--radius-input)] border border-line">
                <button className="h-11 w-11 text-navy" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(moq, q - 1))}>−</button>
                <span className="w-12 text-center font-medium">{qty}</span>
                <button className="h-11 w-11 text-navy" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(Math.max(variantStock, moq), q + 1))}>+</button>
              </div>
              <p className="text-sm text-ink-50">Minimum order {moq} {moq === 1 ? "unit" : "units"}</p>
            </div>
            <p className="mt-2 text-sm">
              Line total: <span className="font-medium text-ink">{formatPence(lineTotal)}</span>
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="gold" size="full" onClick={() => add(false)}>Add to Cart</Button>
            <Button variant="outline" size="full" onClick={() => add(true)}>Buy Now</Button>
          </div>
        </>
      )}

      {soldOut && (
        <Button variant="outline" size="full" onClick={() => setNotified(true)} aria-live="polite">
          {notified ? "We'll let you know when it's back" : "Notify me when back in stock"}
        </Button>
      )}

      {/* Sticky mobile buy bar */}
      {showSticky && !soldOut && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface p-3 pb-[calc(0.75rem+var(--safe-bottom))] shadow-[var(--shadow-overlay)] md:hidden">
          <div className="mx-auto flex max-w-[1280px] items-center gap-3">
            {primary && (
              <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-surface-alt">
                <Image src={primary.storage_path} alt="" fill sizes="44px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{formatPence(unitPrice)}</p>
              {product.pack_quantity > 1 && <p className="font-mono text-xs text-ink-50">{formatPence(perUnit)}/unit</p>}
            </div>
            <Button variant="gold" size="sm" onClick={() => add(false)}>Add to Cart</Button>
          </div>
        </div>
      )}
    </div>
  );
}
