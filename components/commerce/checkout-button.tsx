"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";
import { createCheckout } from "@/lib/actions/checkout";

export function CheckoutButton() {
  const lines = useCart((s) => s.lines);
  const [state, setState] = useState<"idle" | "loading" | "disabled">("idle");
  const [message, setMessage] = useState<string>();

  async function checkout() {
    setState("loading");
    setMessage(undefined);
    const res = await createCheckout({
      lines: lines.map((l) => ({ productSlug: l.productSlug, variantId: l.variantId, quantity: l.quantity })),
    });
    if (res.ok) {
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      // Stripe not configured — honest fallback state.
      setState("disabled");
      setMessage("Checkout isn't connected in this environment. Add your Stripe keys to enable payments.");
    } else {
      setState("idle");
      setMessage(res.error.message);
    }
  }

  return (
    <div>
      <Button variant="gold" size="full" onClick={checkout} disabled={state === "loading"}>
        {state === "loading" ? "Starting checkout…" : "Checkout securely"}
      </Button>
      {message && <p className="mt-2 text-sm text-ink-70" role="status">{message}</p>}
    </div>
  );
}
