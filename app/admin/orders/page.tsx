import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatPence, formatDate } from "@/lib/utils/format";

type OrderRow = { id: string; order_number: string; email: string; status: string; payment_status: string; total_pence: number; created_at: string };

export default async function AdminOrders() {
  let orders: OrderRow[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.from("orders").select("id,order_number,email,status,payment_status,total_pence,created_at").order("created_at", { ascending: false }).limit(50);
    orders = data ?? [];
  }

  return (
    <div>
      <h1 className="font-display text-h1">Orders</h1>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-ink-70">
          {isSupabaseConfigured ? "No orders yet." : "Connect Supabase and run the seed to see orders here."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line text-left text-ink-50">
              <tr><th className="p-3">Order</th><th>Email</th><th>Status</th><th>Payment</th><th>Total</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.order_number} className="border-b border-line last:border-0">
                  <td className="p-3 font-mono"><Link href={`/admin/orders/${o.id}`} className="text-navy underline">{o.order_number}</Link></td>
                  <td>{o.email}</td>
                  <td className="capitalize">{o.status}</td>
                  <td className="capitalize">{o.payment_status}</td>
                  <td>{formatPence(o.total_pence)}</td>
                  <td>{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
