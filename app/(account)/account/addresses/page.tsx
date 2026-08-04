import type { Metadata } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your addresses" };

type Address = { id: string; label: string | null; line1: string | null; city: string | null; postcode: string | null; is_default_shipping: boolean };

export default async function AddressesPage() {
  let user = null;
  let addresses: Address[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      const { data: rows } = await supabase.from("addresses").select("id,label,line1,city,postcode,is_default_shipping").eq("user_id", user.id);
      addresses = rows ?? [];
    }
  }

  if (!user) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-h1 font-display">Sign in to manage addresses</h1>
        <ButtonLink href="/login" variant="primary" className="mt-4">Sign in</ButtonLink>
      </Container>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "Addresses" }]} />
      <Container className="py-10">
        <Eyebrow>Delivery</Eyebrow>
        <h1 className="text-h1 font-display">Your addresses</h1>
        {addresses.length === 0 ? (
          <p className="mt-4 text-ink-70">No saved addresses yet. Your delivery address is collected at checkout.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-[var(--radius-card)] border border-line p-4 text-sm">
                <p className="font-medium">{a.label ?? "Address"}{a.is_default_shipping && " · Default"}</p>
                <p className="mt-1 text-ink-70">{a.line1}, {a.city}, {a.postcode}</p>
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
