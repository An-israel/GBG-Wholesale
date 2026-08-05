import "server-only";
import Stripe from "stripe";

/** Server-only Stripe client. Returns null when Stripe isn't configured. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;
