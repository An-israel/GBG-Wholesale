import type { Metadata } from "next";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Container, Eyebrow, Chip } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { formatPence, formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order details" };

type OrderItem = { product_name_snapshot: string; variant_name_snapshot: string | null; quantity: number; line_total_pence: number; image_url_snapshot: string | null };
type Order = { order_number: string; status: string; total_pence: number; subtotal_pence: number; shipping_pence: number; created_at: string; tracking_url: string | null; order_items: OrderItem[] };

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  let order: Order | null = null;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("order_number,status,total_pence,subtotal_pence,shipping_pence,created_at,tracking_url,order_items(product_name_snapshot,variant_name_snapshot,quantity,line_total_pence,image_url_snapshot)")
      .eq("order_number", orderNumber)
      .single();
    order = (data as Order) ?? null;
  }

  if (!order) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-h1 font-display">Order not found</h1>
        <p className="mt-2 text-ink-70">Sign in to view your orders, or track as a guest.</p>
        <div className="mt-4 flex justify-center gap-3">
          <ButtonLink href="/account" variant="primary">Your account</ButtonLink>
          <ButtonLink href="/account/track" variant="outline">Track an order</ButtonLink>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: order.order_number }]} />
      <Container className="py-10">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow>Order</Eyebrow>
              <h1 className="text-h1 font-display">{order.order_number}</h1>
            </div>
            <Chip>{order.status}</Chip>
          </div>
          <p className="mt-1 text-sm text-ink-50">Placed {formatDate(order.created_at)}</p>

          <ul className="mt-6 divide-y divide-line rounded-[var(--radius-card)] border border-line">
            {order.order_items.map((it, i) => (
              <li key={i} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{it.product_name_snapshot}</p>
                  {it.variant_name_snapshot && <p className="text-sm text-ink-50">{it.variant_name_snapshot}</p>}
                  <p className="text-sm text-ink-50">Qty {it.quantity}</p>
                </div>
                <p className="font-medium">{formatPence(it.line_total_pence)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink-70">Subtotal</dt><dd>{formatPence(order.subtotal_pence)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-70">Shipping</dt><dd>{formatPence(order.shipping_pence)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatPence(order.total_pence)}</dd></div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {order.tracking_url && <ButtonLink href={order.tracking_url} variant="outline">Track shipment</ButtonLink>}
            <Link href="/contact?reason=order_issue" className="self-center text-sm text-navy underline">Problem with this order?</Link>
          </div>
        </div>
      </Container>
    </>
  );
}
