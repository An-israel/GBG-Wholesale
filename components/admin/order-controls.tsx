"use client";

import { useState } from "react";
import { updateOrder, refundOrder } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/forms/fields";

export function OrderControls({ orderId, totalPence, currentStatus }: { orderId: string; totalPence: number; currentStatus: string }) {
  const [msg, setMsg] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function saveTracking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg(undefined);
    const f = new FormData(e.currentTarget);
    const res = await updateOrder({ id: orderId, status: f.get("status"), tracking_number: f.get("tracking_number"), tracking_url: f.get("tracking_url"), carrier: f.get("carrier") });
    setBusy(false);
    setMsg(res.ok ? "Saved. If tracking was added, the customer was emailed." : (!res.ok ? res.error.message : undefined));
  }

  async function doRefund(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg(undefined);
    const f = new FormData(e.currentTarget);
    const res = await refundOrder({ id: orderId, amount_pence: f.get("amount_pence"), restock: f.get("restock") === "on" });
    setBusy(false);
    setMsg(res.ok ? "Refund processed." : (!res.ok ? res.error.message : undefined));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveTracking} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <h3 className="font-display text-h3">Status &amp; tracking</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue={currentStatus}>
              {["pending", "paid", "processing", "shipped", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div><Label>Carrier</Label><Input name="carrier" placeholder="Royal Mail" /></div>
          <div><Label>Tracking number</Label><Input name="tracking_number" /></div>
          <div><Label>Tracking URL</Label><Input name="tracking_url" type="url" placeholder="https://…" /></div>
        </div>
        <p className="mt-2 text-xs text-ink-50">Adding a tracking number sends the shipped email automatically.</p>
        <Button type="submit" variant="primary" size="sm" className="mt-3" disabled={busy}>Save</Button>
      </form>

      <form onSubmit={doRefund} className="rounded-[var(--radius-card)] border border-danger/30 bg-surface p-4">
        <h3 className="font-display text-h3">Refund</h3>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div><Label>Amount (pence)</Label><Input name="amount_pence" type="number" min={1} max={totalPence} defaultValue={totalPence} /></div>
          <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="restock" className="h-4 w-4 accent-[var(--color-gold)]" /> Restock items</label>
          <Button type="submit" variant="danger" size="sm" disabled={busy}>Process refund</Button>
        </div>
      </form>

      {msg && <p className="text-sm text-ink-70" role="status">{msg}</p>}
    </div>
  );
}
