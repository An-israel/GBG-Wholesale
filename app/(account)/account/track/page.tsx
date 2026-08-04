import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TrackOrderForm } from "@/components/forms/track-order-form";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackOrderPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
      <Container className="py-10">
        <div className="mx-auto max-w-md">
          <Eyebrow>No account needed</Eyebrow>
          <h1 className="text-h1 font-display">Track your order</h1>
          <p className="mt-2 text-ink-70">Enter your order number and the email you used to order.</p>
          <div className="mt-6">
            <TrackOrderForm />
          </div>
        </div>
      </Container>
    </>
  );
}
