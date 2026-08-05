import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { Section, Eyebrow } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { AcademyForm } from "@/components/forms/academy-form";
import { PENDING } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Academy — learn the whole craft",
  description: "A guided programme for people who want to build a real product business. Join the waitlist while doors are closed.",
};

export default async function AcademyPage() {
  const settings = await getSettings();
  const isOpen = settings["academy.status"] === "open";
  const price = settings["academy.price"];
  const duration = settings["academy.duration"];
  const curriculum = settings["academy.curriculum"];
  const priceKnown = !price.includes(PENDING) && curriculum.length > 0;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Academy" }]} />
      <Section>
        <div className="max-w-2xl">
          <Eyebrow>The Academy</Eyebrow>
          <h1 className="text-h1 font-display">From curious to confident seller</h1>
          <p className="mt-3 text-body-lg text-ink-70">
            A step-by-step programme for people who want more than stock — they want to learn the
            whole craft, with guidance the whole way.
          </p>
        </div>
      </Section>

      <Section alt>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-h2 font-display">Who it&apos;s for</h2>
            <ul className="mt-3 space-y-2 text-ink-70">
              <li>· You want a real, repeatable process, not guesswork.</li>
              <li>· You&apos;re ready to put in consistent effort.</li>
              <li>· You want accountability and feedback.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-h2 font-display">Who it&apos;s not for</h2>
            <ul className="mt-3 space-y-2 text-ink-70">
              <li>· Anyone looking for guaranteed results with no work.</li>
              <li>· People who just want stock — the shop is for you.</li>
              <li>· Anyone not ready to start in the next few months.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Curriculum / pricing — PENDING_LAMI: rendered from settings */}
      <Section>
        <Eyebrow>What&apos;s inside</Eyebrow>
        <h2 className="text-h2 font-display">Curriculum &amp; format</h2>
        {priceKnown ? (
          <>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {curriculum.map((c) => (
                <li key={c} className="rounded-[var(--radius-card)] border border-line p-3 text-sm">{c}</li>
              ))}
            </ul>
            <p className="mt-4 text-ink-70">Duration: {duration} · Price: {price}</p>
          </>
        ) : (
          <div className="mt-4 rounded-[var(--radius-card)] border border-gold bg-gold-pale p-6">
            <p className="font-medium text-navy">Doors open soon.</p>
            <p className="mt-1 text-sm text-ink-70">
              The full curriculum, duration and price are being finalised. Join the waitlist and
              you&apos;ll be first to know — we&apos;ll never invent a price.
            </p>
          </div>
        )}
      </Section>

      {/* Application / waitlist */}
      <Section alt>
        <div className="mx-auto max-w-xl">
          <Eyebrow>{isOpen ? "Apply" : "Join the waitlist"}</Eyebrow>
          <h2 className="text-h2 font-display">{isOpen ? "Apply to join" : "Be first in line"}</h2>
          <p className="mt-2 text-ink-70">Tell us a little about you. There&apos;s no commitment.</p>
          <div className="mt-6">
            <AcademyForm />
          </div>
        </div>
      </Section>

      <ForwardBlock
        heading="Not sure yet?"
        body="Start with the free guides and a small first order — you can always come back."
        primary={{ label: "Read the guides", href: "/learn" }}
        secondary={{ label: "Browse the shop", href: "/shop" }}
      />
    </>
  );
}
