"use client";

import Image from "next/image";
import { useCart, useCartSubtotal, lineKey } from "@/lib/cart/store";
import { formatPence } from "@/lib/utils/format";
import { Button, ButtonLink } from "@/components/ui/button";

/** Slide-over cart drawer, opened on add-to-cart (Part 13). */
export function CartDrawer() {
  const { lines, drawerOpen, setDrawer, updateQuantity, removeLine } = useCart();
  const subtotal = useCartSubtotal();

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Cart">
      <div className="absolute inset-0 bg-navy/40" onClick={() => setDrawer(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-[var(--shadow-overlay)]">
        <div className="flex items-center justify-between border-b border-line p-4">
          <p className="font-display text-xl font-bold text-navy">Your cart</p>
          <button aria-label="Close cart" onClick={() => setDrawer(false)} className="grid h-11 w-11 place-items-center text-navy">
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-ink-70">Your cart is empty.</p>
            <ButtonLink href="/shop" variant="primary" onClick={() => setDrawer(false)}>
              Browse the shop
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto p-4">
              {lines.map((l) => {
                const key = lineKey(l);
                return (
                  <li key={key} className="flex gap-3 py-3">
                    <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-surface-alt">
                      <Image src={l.imageUrl} alt={l.productName} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{l.productName}</p>
                      {l.variantName && <p className="text-xs text-ink-50">{l.variantName}</p>}
                      <p className="font-mono text-xs text-ink-50">{formatPence(l.unitPricePence)} / pack</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex items-center rounded-[4px] border border-line">
                          <button className="h-8 w-8 text-navy" aria-label="Decrease" onClick={() => updateQuantity(key, l.quantity - 1)}>
                            −
                          </button>
                          <span className="w-8 text-center text-sm">{l.quantity}</span>
                          <button className="h-8 w-8 text-navy" aria-label="Increase" onClick={() => updateQuantity(key, l.quantity + 1)}>
                            +
                          </button>
                        </div>
                        <button className="text-xs text-ink-50 underline" onClick={() => removeLine(key)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-ink">{formatPence(l.unitPricePence * l.quantity)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-70">Subtotal</span>
                <span className="font-medium text-ink">{formatPence(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-50">Shipping and any discounts are calculated at checkout.</p>
              <div className="mt-3 grid gap-2">
                <Button variant="gold" size="full" onClick={() => (window.location.href = "/cart")}>
                  View cart & checkout
                </Button>
                <button className="text-sm text-ink-50 underline" onClick={() => setDrawer(false)}>
                  Continue shopping
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
