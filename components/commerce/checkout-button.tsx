"use client";

import { ButtonLink } from "@/components/ui/button";

/** Proceeds to the in-app checkout step (Part 13), which then hands to Stripe. */
export function CheckoutButton() {
  return (
    <ButtonLink href="/checkout" variant="gold" size="full">
      Checkout securely
    </ButtonLink>
  );
}
