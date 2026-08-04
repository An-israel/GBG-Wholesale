"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart, useCartSubtotal } from "@/lib/cart/store";
import { createCheckout } from "@/lib/actions/checkout";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Label, Select, FieldError } from "@/components/forms/fields";
import { formatPence } from "@/lib/utils/format";

const countries = [
  ["GB", "United Kingdom"],
  ["IE", "Ireland"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["US", "United States"],
] as const;

export function CheckoutFlow() {
  const { lines } = useCart();
  const subtotal = useCartSubtotal();
  const [state, setState] = useState<"idle" | "loading" | "disabled">("idle");
  const [error, setError] = useState<string>();
  const [country, setCountry] = useState("GB");

  if (lines.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-surface-alt p-8 text-center">
        <p className="text-ink-70">Your cart is empty.</p>
        <ButtonLink href="/shop" variant="primary" className="mt-3">Browse the shop</ButtonLink>
      </div>
    );
  }

  const international = country !== "GB";
  const freeShipping = subtotal >= 5000 && !international;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const res = await createCheckout({
      lines: lines.map((l) => ({ productSlug: l.productSlug, variantId: l.variantId, quantity: l.quantity })),
      email: String(form.get("email")),
      shippingCountry: country,
      customerNote: String(form.get("note") ?? ""),
    });
    if (res.ok) {
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      setState("disabled");
      setError("Payment isn't connected in this environment. Add Stripe keys to complete checkout.");
    } else {
      setState("idle");
      setError(res.error.message);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={onSubmit} className="space-y-5">
        <fieldset className="space-y-4 rounded-[var(--radius-card)] border border-line p-5">
          <legend className="px-1 font-display text-h3">Contact</legend>
          <div>
            <Label htmlFor="co-email">Email</Label>
            <Input id="co-email" name="email" type="email" inputMode="email" autoComplete="email" required />
            <p className="mt-1 text-xs text-ink-50">We&apos;ll send your confirmation and tracking here.</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-70">
            <input type="checkbox" name="create_account" className="h-4 w-4 accent-[var(--color-gold)]" />
            Create an account to track orders (optional)
          </label>
        </fieldset>

        <fieldset className="space-y-4 rounded-[var(--radius-card)] border border-line p-5">
          <legend className="px-1 font-display text-h3">Shipping</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="co-first">First name</Label>
              <Input id="co-first" name="first_name" autoComplete="given-name" required />
            </div>
            <div>
              <Label htmlFor="co-last">Last name</Label>
              <Input id="co-last" name="last_name" autoComplete="family-name" required />
            </div>
          </div>
          <div>
            <Label htmlFor="co-line1">Address</Label>
            <Input id="co-line1" name="line1" autoComplete="address-line1" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="co-city">City</Label>
              <Input id="co-city" name="city" autoComplete="address-level2" required />
            </div>
            <div>
              <Label htmlFor="co-postcode">Postcode</Label>
              <Input id="co-postcode" name="postcode" autoComplete="postal-code" required />
            </div>
          </div>
          <div>
            <Label htmlFor="co-country">Country</Label>
            <Select id="co-country" value={country} onChange={(e) => setCountry(e.target.value)}>
              {countries.map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </Select>
          </div>
          {international && (
            <p className="rounded-[var(--radius-card)] bg-surface-alt p-3 text-sm text-ink-70">
              International orders: you may be charged customs duties on delivery.
            </p>
          )}
        </fieldset>

        <fieldset className="rounded-[var(--radius-card)] border border-line p-5">
          <legend className="px-1 font-display text-h3">Note (optional)</legend>
          <textarea name="note" rows={2} className="w-full rounded-[var(--radius-input)] border border-line px-3 py-2" placeholder="Anything we should know?" />
        </fieldset>

        <FieldError message={error} />
        <Button type="submit" variant="gold" size="lg" disabled={state === "loading"}>
          {state === "loading" ? "Starting secure payment…" : "Continue to payment"}
        </Button>
      </form>

      <aside className="h-fit rounded-[var(--radius-card)] border border-line p-5">
        <h2 className="font-display text-h3">Order summary</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={`${l.productSlug}-${l.variantId}`} className="flex justify-between gap-2">
              <span className="text-ink-70">{l.quantity} × {l.productName}{l.variantName ? ` (${l.variantName})` : ""}</span>
              <span>{formatPence(l.unitPricePence * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><dt className="text-ink-70">Subtotal</dt><dd>{formatPence(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-70">Shipping</dt><dd>{freeShipping ? "Free" : "Calculated at payment"}</dd></div>
        </dl>
        <Link href="/cart" className="mt-4 block text-center text-sm text-ink-50 underline">Back to cart</Link>
      </aside>
    </div>
  );
}
