import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { products as seedProducts } from "@/lib/data/catalog";
import { formatPence } from "@/lib/utils/format";

async function getKpis() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const since = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
  const [rev30, orders30, customers] = await Promise.all([
    supabase.from("orders").select("total_pence").eq("payment_status", "paid").gte("created_at", since(30)),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", since(30)),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);
  const revenue = (rev30.data ?? []).reduce((s, o) => s + (o.total_pence ?? 0), 0);
  const orderCount = orders30.count ?? 0;
  return { revenue, orderCount, aov: orderCount ? Math.round(revenue / orderCount) : 0, customers: customers.count ?? 0 };
}

export default async function AdminOverview() {
  const kpis = await getKpis();
  const lowStock = seedProducts.filter((p) => p.stock_status === "low_stock");
  const soldOut = seedProducts.filter((p) => p.stock_status === "sold_out");
  const drafts = seedProducts.filter((p) => p.status === "draft");

  return (
    <div>
      <h1 className="font-display text-h1">Overview</h1>

      {!kpis && (
        <p className="mt-2 rounded-[var(--radius-card)] border border-line bg-surface p-3 text-sm text-ink-70">
          Connect Supabase to see live revenue, orders and customer metrics. Product alerts below are
          computed from the current catalogue.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Revenue (30d)" value={kpis ? formatPence(kpis.revenue) : "—"} />
        <Kpi label="Orders (30d)" value={kpis ? String(kpis.orderCount) : "—"} />
        <Kpi label="Avg order value" value={kpis ? formatPence(kpis.aov) : "—"} />
        <Kpi label="Customers" value={kpis ? String(kpis.customers) : "—"} />
      </div>

      {/* Alert panel (priority order) */}
      <section className="mt-8">
        <h2 className="font-display text-h2">Needs attention</h2>
        <div className="mt-4 space-y-3">
          {soldOut.length > 0 && <Alert tone="danger" title={`${soldOut.length} product(s) sold out`} detail={soldOut.map((p) => p.name).join(", ")} />}
          {lowStock.length > 0 && <Alert tone="warn" title={`${lowStock.length} product(s) low on stock`} detail={lowStock.map((p) => p.name).join(", ")} />}
          {drafts.length > 0 && <Alert tone="info" title={`${drafts.length} draft product(s) awaiting price/MOQ`} detail={drafts.map((p) => p.name).join(", ")} />}
          {soldOut.length === 0 && lowStock.length === 0 && drafts.length === 0 && (
            <p className="text-sm text-ink-70">All clear — nothing needs attention right now.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <p className="text-micro text-ink-50">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}

function Alert({ tone, title, detail }: { tone: "danger" | "warn" | "info"; title: string; detail: string }) {
  const styles = {
    danger: "border-danger/40 bg-danger/5",
    warn: "border-gold bg-gold-pale",
    info: "border-line bg-surface",
  }[tone];
  return (
    <div className={`rounded-[var(--radius-card)] border p-4 ${styles}`}>
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-70">{detail}</p>
    </div>
  );
}
