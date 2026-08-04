import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { OrderControls } from "@/components/admin/order-controls";
import { formatPence, formatDate } from "@/lib/utils/format";

type Item = { product_name_snapshot: string; variant_name_snapshot: string | null; quantity: number; line_total_pence: number };
type Order = {
  id: string; order_number: string; email: string; status: string; payment_status: string;
  subtotal_pence: number; shipping_pence: number; total_pence: number; created_at: string;
  shipping_address: Record<string, string> | null; stripe_payment_intent_id: string | null;
  admin_note: string | null; order_items: Item[];
};

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured) {
    return (
      <div>
        <Link href="/admin/orders" className="text-sm text-navy underline">← Orders</Link>
        <h1 className="mt-2 font-display text-h1">Order detail</h1>
        <p className="mt-3 text-sm text-ink-70">Connect Supabase and run the seed to manage live orders here.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id,order_number,email,status,payment_status,subtotal_pence,shipping_pence,total_pence,created_at,shipping_address,stripe_payment_intent_id,admin_note,order_items(product_name_snapshot,variant_name_snapshot,quantity,line_total_pence)")
    .eq("id", id)
    .single();
  const order = data as Order | null;
  if (!order) notFound();

  const addr = order.shipping_address;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-navy underline">← Orders</Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-display text-h1">{order.order_number}</h1>
        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs capitalize">{order.status}</span>
      </div>
      <p className="mt-1 text-sm text-ink-50">{order.email} · {formatDate(order.created_at)}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
          <h3 className="font-display text-h3">Items</h3>
          <ul className="mt-2 divide-y divide-line text-sm">
            {order.order_items.map((it, i) => (
              <li key={i} className="flex justify-between py-2">
                <span>{it.quantity} × {it.product_name_snapshot}{it.variant_name_snapshot ? ` (${it.variant_name_snapshot})` : ""}</span>
                <span>{formatPence(it.line_total_pence)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1 border-t border-line pt-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-70">Subtotal</dt><dd>{formatPence(order.subtotal_pence)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-70">Shipping</dt><dd>{formatPence(order.shipping_pence)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatPence(order.total_pence)}</dd></div>
          </dl>
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm">
          <h3 className="font-display text-h3">Shipping address</h3>
          {addr ? (
            <p className="mt-2 text-ink-70">{[addr.first_name, addr.last_name, addr.line1, addr.city, addr.postcode, addr.country].filter(Boolean).join(", ")}</p>
          ) : (
            <p className="mt-2 text-ink-50">Collected at Stripe checkout.</p>
          )}
          {order.stripe_payment_intent_id && (
            <a href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-navy underline">
              View payment in Stripe →
            </a>
          )}
        </div>
      </div>

      <div className="mt-6">
        <OrderControls orderId={order.id} totalPence={order.total_pence} currentStatus={order.status} />
      </div>
    </div>
  );
}
