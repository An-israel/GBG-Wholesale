import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Section, Eyebrow } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { CommunityComparison } from "@/components/content/comparison-table";
import { PENDING } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Community & Support — SYPB and the Wholesale Hub",
  description: "Two communities, one journey. SYPB is open to everyone before you buy; the Wholesale Hub unlocks with your first order.",
};

export default async function CommunityPage() {
  const settings = await getSettings();
  const sypb = settings["links.sypb"];
  const sypbHref = sypb.includes(PENDING) ? "/contact?reason=community_access" : sypb;

  // Live personalised Hub state (Part 11.5): show the join link if verified.
  let verified = false;
  let signedIn = false;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    signedIn = !!user;
    if (user) {
      const { data } = await supabase.from("profiles").select("is_verified_buyer").eq("id", user.id).single();
      verified = !!data?.is_verified_buyer;
    }
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Community" }]} />
      <Section className="pb-6">
        <Eyebrow>Community &amp; support</Eyebrow>
        <h1 className="text-h1 font-display">Two communities, one journey</h1>
        <p className="mt-2 max-w-2xl text-ink-70">
          We run two spaces so nobody joins the wrong one. Here&apos;s exactly who each is for.
        </p>
      </Section>

      <Section className="pt-0">
        <CommunityComparison />
      </Section>

      {/* What these are NOT — required, honest */}
      <Section alt>
        <div className="mx-auto max-w-2xl rounded-[var(--radius-card)] border border-line bg-surface p-6">
          <Eyebrow>Being honest</Eyebrow>
          <h2 className="text-h2 font-display">What these communities are not</h2>
          <ul className="mt-3 space-y-2 text-ink-70">
            <li>· Not a get-rich-quick group. Selling takes real work.</li>
            <li>· Not a place we promise earnings — your results are your own.</li>
            <li>· Not a replacement for the guides. They work best together.</li>
          </ul>
        </div>
      </Section>

      {/* How to unlock the Hub — personalised */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>The Wholesale Hub</Eyebrow>
          <h2 className="text-h2 font-display">How to unlock the Hub</h2>
          {verified ? (
            <div className="mt-4 rounded-[var(--radius-card)] border border-gold bg-gold-pale p-6">
              <p className="font-medium text-navy">You&apos;re a verified buyer — the Hub is unlocked.</p>
              <ButtonLink href="/account/hub" variant="gold" className="mt-3">Open the Hub</ButtonLink>
            </div>
          ) : (
            <div className="mt-4 rounded-[var(--radius-card)] border border-line p-6">
              <p className="text-ink-70">
                {signedIn
                  ? "Place your first order and the Hub unlocks automatically."
                  : "Sign in and place your first order — the Hub unlocks automatically at checkout."}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/shop" variant="primary">Shop to unlock</ButtonLink>
                <ButtonLink href={sypbHref} variant="outline">Join SYPB (free)</ButtonLink>
              </div>
            </div>
          )}
        </div>
      </Section>

      <ForwardBlock
        heading="Pick your path"
        body="Join SYPB to learn alongside others, or place an order to unlock the Hub."
        primary={{ label: "Shop to unlock the Hub", href: "/shop" }}
        secondary={{ label: "Learn about SYPB", href: sypbHref }}
      />
    </>
  );
}
