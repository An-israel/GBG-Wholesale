import type { Metadata } from "next";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Container, Eyebrow, Chip } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { formatPence, formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account" };

const links = [
  { label: "Order history", href: "/account", desc: "View and reorder past orders" },
  { label: "Addresses", href: "/account/addresses", desc: "Manage delivery addresses" },
  { label: "Wholesale Hub", href: "/account/hub", desc: "Verified-buyer perks" },
  { label: "Settings", href: "/account/settings", desc: "Profile & marketing preferences" },
];

export default async function AccountPage() {
  let email: string | null = null;
  let orders: { order_number: string; total_pence: number; status: string; created_at: string }[] = [];
  let verified = false;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      email = user.email ?? null;
      const [{ data: profile }, { data: orderRows }] = await Promise.all([
        supabase.from("profiles").select("is_verified_buyer").eq("id", user.id).single(),
        supabase.from("orders").select("order_number,total_pence,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);
      verified = !!profile?.is_verified_buyer;
      orders = orderRows ?? [];
    }
  }

  if (!email) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-h1 font-display">Sign in to your account</h1>
          <p className="mt-2 text-ink-70">View orders, manage addresses and access the Wholesale Hub.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/login" variant="primary">Sign in</ButtonLink>
            <ButtonLink href="/account/track" variant="outline">Track an order as a guest</ButtonLink>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Account" }]} />
      <Container className="py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>Welcome back</Eyebrow>
            <h1 className="text-h1 font-display">{email}</h1>
          </div>
          {verified && <Chip>Verified buyer</Chip>}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="rounded-[var(--radius-card)] border border-line p-4 hover:border-gold">
              <p className="font-medium">{l.label}</p>
              <p className="mt-1 text-sm text-ink-70">{l.desc}</p>
            </Link>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="font-display text-h2">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-ink-70">No orders yet. <Link href="/shop" className="text-navy underline">Start shopping →</Link></p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-ink-50">
                    <th className="py-2">Order</th><th>Date</th><th>Status</th><th>Total</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_number} className="border-b border-line">
                      <td className="py-3 font-mono">{o.order_number}</td>
                      <td>{formatDate(o.created_at)}</td>
                      <td className="capitalize">{o.status}</td>
                      <td>{formatPence(o.total_pence)}</td>
                      <td><Link href={`/account/orders/${o.order_number}`} className="text-navy underline">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Container>
    </>
  );
}
