"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, useCartSubtotal, lineKey } from "@/lib/cart/store";
import { Container } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { formatPence } from "@/lib/utils/format";
import { CheckoutButton } from "@/components/commerce/checkout-button";

export default function CartPage() {
  const { lines, updateQuantity, removeLine } = useCart();
  const subtotal = useCartSubtotal();
  const freeShippingThreshold = 5000;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  if (lines.length === 0) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-h1 font-display">Your cart is empty</h1>
          <p className="mt-2 text-ink-70">Let&apos;s find your first products.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/shop" variant="primary">Browse the shop</ButtonLink>
            <ButtonLink href="/start-here" variant="outline">Start here</ButtonLink>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="text-h1 font-display">Your cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
          {lines.map((l) => {
            const key = lineKey(l);
            return (
              <li key={key} className="flex gap-4 p-4">
                <Link href={`/products/${l.productSlug}`} className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-surface-alt">
                  {l.imageUrl && <Image src={l.imageUrl} alt={l.productName} fill sizes="80px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${l.productSlug}`} className="font-display text-lg leading-snug hover:text-navy">
                    {l.productName}
                  </Link>
                  {l.variantName && <p className="text-sm text-ink-50">{l.variantName}</p>}
                  <p className="font-mono text-xs text-ink-50">
                    {formatPence(l.unitPricePence)} / {l.packQuantity > 1 ? "pack" : "unit"} · MOQ {l.moq}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-[var(--radius-input)] border border-line">
                      <button className="h-9 w-9 text-navy" aria-label="Decrease" onClick={() => updateQuantity(key, l.quantity - 1)}>−</button>
                      <span className="w-10 text-center text-sm">{l.quantity}</span>
                      <button className="h-9 w-9 text-navy" aria-label="Increase" onClick={() => updateQuantity(key, l.quantity + 1)}>+</button>
                    </div>
                    <button className="text-sm text-ink-50 underline" onClick={() => removeLine(key)}>Remove</button>
                  </div>
                </div>
                <p className="font-medium">{formatPence(l.unitPricePence * l.quantity)}</p>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-[var(--radius-card)] border border-line p-5">
          <h2 className="font-display text-h3">Order summary</h2>
          {remaining > 0 ? (
            <p className="mt-2 text-sm text-ink-70">
              Add <span className="font-medium text-ink">{formatPence(remaining)}</span> more for free UK shipping.
            </p>
          ) : (
            <p className="mt-2 text-sm text-profit">You&apos;ve qualified for free UK shipping.</p>
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-70">Subtotal</dt>
              <dd className="font-medium">{formatPence(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-70">Shipping</dt>
              <dd className="text-ink-50">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4">
            <CheckoutButton />
          </div>
          <p className="mt-2 text-center text-xs text-ink-50">
            Prices and stock are re-checked at checkout — you&apos;re only ever charged the correct amount.
          </p>
          <Link href="/shop" className="mt-4 block text-center text-sm text-ink-50 underline">Continue shopping</Link>
        </aside>
      </div>
    </Container>
  );
}
