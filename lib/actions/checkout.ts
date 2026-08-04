"use server";

import { z } from "zod";
import { getProductBySlug } from "@/lib/data";
import { getStripe } from "@/lib/stripe/server";
import { fail, ok, type ActionResult } from "./result";

/**
 * createCheckout (Part 8.1). The server re-reads every line from the source of
 * truth: current price, variant delta, stock, MOQ and active status. A tampered
 * client price changes nothing — Stripe line items are rebuilt from scratch
 * (Part 5 critical rule on prices / acceptance #4).
 */
const lineSchema = z.object({
  productSlug: z.string(),
  variantId: z.string().nullable(),
  quantity: z.number().int().positive(),
});
const inputSchema = z.object({ lines: z.array(lineSchema).min(1) });

export type CheckoutResult = ActionResult<{ url?: string; checkoutDisabled?: boolean }>;

export async function createCheckout(input: unknown): Promise<CheckoutResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Your cart could not be read. Please try again.");

  const rebuilt: { name: string; unitPrice: number; quantity: number }[] = [];
  const changes: string[] = [];

  for (const line of parsed.data.lines) {
    const product = await getProductBySlug(line.productSlug);
    if (!product || product.status !== "active") {
      changes.push(`One item is no longer available and was removed.`);
      continue;
    }
    const variant = line.variantId ? product.variants.find((v) => v.id === line.variantId) ?? null : null;

    // MOQ enforced server-side (mix-and-match satisfied across variants).
    const moq = variant?.moq_override ?? product.moq;
    let quantity = line.quantity;
    if (quantity < moq) {
      quantity = moq;
      changes.push(`${product.name}: quantity raised to the minimum of ${moq}.`);
    }

    // Stock ceiling.
    const stock = variant ? variant.stock_quantity : product.stock_quantity;
    if (!product.mix_and_match_allowed && stock > 0 && quantity > stock) {
      quantity = stock;
      changes.push(`${product.name}: quantity reduced to available stock (${stock}).`);
    }

    // Price is authoritative from the server, never the client.
    const unitPrice = product.wholesale_price_pence + (variant?.price_delta_pence ?? 0);
    rebuilt.push({
      name: variant ? `${product.name} — ${variant.name}` : product.name,
      unitPrice,
      quantity,
    });
  }

  if (rebuilt.length === 0) return fail("empty", "None of your items are available right now.");

  const stripe = getStripe();
  if (!stripe) {
    // Stripe not configured (preview/build). Surface a clear, honest state.
    return ok({ checkoutDisabled: true });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "gbp",
      line_items: rebuilt.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "gbp",
          unit_amount: l.unitPrice,
          product_data: { name: l.name },
        },
      })),
      shipping_address_collection: { allowed_countries: ["GB", "IE", "FR", "DE", "US"] },
      success_url: `${siteUrl}/order/{CHECKOUT_SESSION_ID}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
    });
    return ok({ url: session.url ?? undefined });
  } catch (e) {
    console.error("[createCheckout] stripe error", e);
    return fail("stripe", "We couldn't start checkout. Please try again.");
  }
}
