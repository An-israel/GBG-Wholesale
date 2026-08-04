import type { Metadata } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PENDING } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wholesale Hub" };

export default async function HubPage() {
  const settings = await getSettings();
  let verified = false;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("profiles").select("is_verified_buyer").eq("id", user.id).single();
      verified = !!data?.is_verified_buyer;
    }
  }

  const hubLink = settings["links.hub"];
  const hubKnown = !hubLink.includes(PENDING);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "Wholesale Hub" }]} />
      <Container className="py-10">
        {verified ? (
          <div className="mx-auto max-w-2xl">
            <Eyebrow>Verified buyer</Eyebrow>
            <h1 className="text-h1 font-display">Welcome to the Wholesale Hub</h1>
            <p className="mt-2 text-ink-70">Your buyer-only space for restock alerts, early drops and direct guidance.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-card)] border border-line p-5">
                <h2 className="font-display text-h3">Restock alerts</h2>
                <p className="mt-1 text-sm text-ink-70">Be first to know when best-sellers come back.</p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-line p-5">
                <h2 className="font-display text-h3">Buyer-only drops</h2>
                <p className="mt-1 text-sm text-ink-70">Early access to new arrivals before they go public.</p>
              </div>
            </div>
            {hubKnown && <ButtonLink href={hubLink} variant="gold" className="mt-6">Open the community</ButtonLink>}
          </div>
        ) : (
          // Never a raw error — a "how to unlock" state (Part 6.3).
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Not unlocked yet</Eyebrow>
            <h1 className="text-h1 font-display">The Hub unlocks with your first order</h1>
            <p className="mt-2 text-ink-70">
              Place any order and you become a verified buyer — the Hub opens automatically, and
              you&apos;ll get the link on your confirmation page.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/shop" variant="primary">Shop to unlock</ButtonLink>
              <ButtonLink href="/community" variant="outline">How the Hub works</ButtonLink>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
