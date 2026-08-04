"use client";

import { useState } from "react";
import { trackOrder, type TrackedOrder } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "./fields";
import { formatPence, formatDate } from "@/lib/utils/format";

export function TrackOrderForm() {
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string>();
  const [order, setOrder] = useState<TrackedOrder>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(undefined);
    setOrder(undefined);
    const form = new FormData(e.currentTarget);
    const res = await trackOrder({ order_number: form.get("order_number"), email: form.get("email") });
    setState("idle");
    if (res.ok && res.data) setOrder(res.data);
    else if (!res.ok) setError(res.error.message);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4 rounded-[var(--radius-card)] border border-line p-6">
        <div>
          <Label htmlFor="t-order">Order number</Label>
          <Input id="t-order" name="order_number" placeholder="GBG-123456" required />
        </div>
        <div>
          <Label htmlFor="t-email">Order email</Label>
          <Input id="t-email" name="email" type="email" inputMode="email" required />
        </div>
        <FieldError message={error} />
        <Button type="submit" variant="primary" disabled={state === "loading"}>
          {state === "loading" ? "Looking…" : "Track order"}
        </Button>
      </form>

      {order && (
        <div className="rounded-[var(--radius-card)] border border-gold bg-gold-pale p-6">
          <p className="font-mono text-sm text-ink-50">{order.order_number}</p>
          <p className="mt-1 font-display text-h3 capitalize">{order.status.replace("_", " ")}</p>
          <dl className="mt-3 space-y-1 text-sm text-ink-70">
            <div className="flex justify-between"><dt>Placed</dt><dd>{formatDate(order.created_at)}</dd></div>
            <div className="flex justify-between"><dt>Total</dt><dd>{formatPence(order.total_pence)}</dd></div>
            <div className="flex justify-between"><dt>Fulfilment</dt><dd className="capitalize">{order.fulfilment_status.replace("_", " ")}</dd></div>
          </dl>
          {order.tracking_url && (
            <a href={order.tracking_url} target="_blank" rel="noreferrer" className="mt-3 inline-block font-medium text-navy underline">
              Track with {order.carrier ?? "carrier"} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
