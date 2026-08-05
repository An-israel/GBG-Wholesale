import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { CheckoutFlow } from "@/components/commerce/checkout-flow";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

/**
 * In-app step before Stripe (Part 13). Collects email, shipping details and
 * method with a visible order summary, then hands off to Stripe Checkout. Guest
 * checkout is allowed; the server re-prices everything before charging.
 */
export default function CheckoutPage() {
  return (
    <Container className="py-8">
      <h1 className="text-h1 font-display">Checkout</h1>
      <p className="mt-1 text-sm text-ink-70">Step 1 of 2 — your details. Payment is handled securely by Stripe.</p>
      <div className="mt-6">
        <CheckoutFlow />
      </div>
    </Container>
  );
}
