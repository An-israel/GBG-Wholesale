import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { ForwardBlock } from "@/components/layout/forward-block";
import { ClearCartOnMount } from "@/components/commerce/clear-cart-on-mount";
import { PENDING } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

const steps = [
  ["We're preparing your order", "Processed in 1–2 working days (draft estimate)."],
  ["Dispatch", "You'll get a tracking link by email the moment it ships."],
  ["Delivery", "Typically 3–4 days in the UK (draft estimate)."],
];

export default async function ConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const settings = await getSettings();
  const hubLink = settings["links.hub"];
  const hubKnown = !hubLink.includes(PENDING);

  return (
    <>
      <ClearCartOnMount />
      <Container className="py-10">
        <div className="mx-auto max-w-2xl">
          <Eyebrow>Thank you</Eyebrow>
          <h1 className="text-h1 font-display">Your order is confirmed</h1>
          <p className="mt-2 text-ink-70">
            Order <span className="font-mono">{orderNumber}</span>. A confirmation email is on its way.
          </p>

          {/* What happens next — dated expectations */}
          <section className="mt-8">
            <h2 className="font-display text-h3">What happens next</h2>
            <ol className="mt-3 space-y-3">
              {steps.map(([title, body], i) => (
                <li key={title} className="flex gap-4 rounded-[var(--radius-card)] border border-line p-4">
                  <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-navy font-mono text-sm text-cream">{i + 1}</span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-ink-70">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Hub unlock */}
          <section className="mt-8 rounded-[var(--radius-card)] border border-gold bg-gold-pale p-6">
            <h2 className="font-display text-h3">Your Wholesale Hub is unlocked</h2>
            <p className="mt-1 text-sm text-ink-70">
              As a verified buyer you now have Hub access — restock alerts, buyer-only drops and direct
              guidance.
            </p>
            {hubKnown ? (
              <ButtonLink href={hubLink} variant="gold" className="mt-3">Open the Hub</ButtonLink>
            ) : (
              <ButtonLink href="/account/hub" variant="gold" className="mt-3">Go to your Hub</ButtonLink>
            )}
          </section>

          {/* What to do while you wait */}
          <section className="mt-8">
            <h2 className="font-display text-h3">While you wait</h2>
            <p className="mt-1 text-sm text-ink-70">Get your listings ready with these two quick guides.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Link href="/learn/selling-successfully/photos-that-sell" className="rounded-[var(--radius-card)] border border-line p-4 hover:border-gold">
                <p className="font-medium">Photos that sell on a phone</p>
              </Link>
              <Link href="/learn/selling-successfully/pricing-for-margin" className="rounded-[var(--radius-card)] border border-line p-4 hover:border-gold">
                <p className="font-medium">Pricing for margin</p>
              </Link>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link href="/account/track" className="text-navy underline">Track this order</Link>
            <Link href="/contact" className="text-navy underline">Need help?</Link>
          </div>
        </div>
      </Container>

      <ForwardBlock
        heading="Ready for the next order?"
        body="Reorder in one tap from your account whenever stock runs low."
        primary={{ label: "Back to the shop", href: "/shop" }}
        secondary={{ label: "Your account", href: "/account" }}
      />
    </>
  );
}
