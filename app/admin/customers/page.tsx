import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatPence } from "@/lib/utils/format";

type CustomerRow = { email: string; total_orders: number; lifetime_value_pence: number; buyer_type: string; is_verified_buyer: boolean };

export default async function AdminCustomers() {
  let customers: CustomerRow[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("email,total_orders,lifetime_value_pence,buyer_type,is_verified_buyer").order("lifetime_value_pence", { ascending: false }).limit(50);
    customers = data ?? [];
  }

  return (
    <div>
      <h1 className="font-display text-h1">Customers</h1>
      {customers.length === 0 ? (
        <p className="mt-3 text-sm text-ink-70">{isSupabaseConfigured ? "No customers yet." : "Connect Supabase to see customers."}</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line text-left text-ink-50">
              <tr><th className="p-3">Email</th><th>Orders</th><th>Lifetime value</th><th>Type</th><th>Verified</th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email} className="border-b border-line last:border-0">
                  <td className="p-3">{c.email}</td>
                  <td>{c.total_orders}</td>
                  <td>{formatPence(c.lifetime_value_pence)}</td>
                  <td className="capitalize">{c.buyer_type}</td>
                  <td>{c.is_verified_buyer ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
