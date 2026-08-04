import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { Section, Eyebrow } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { ContactForm } from "@/components/forms/contact-form";
import { PENDING } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact — self-serve first, then reach us",
  description: "Track an order, read shipping and returns, or send us a message. We route your enquiry to the right place.",
};

const selfServe = [
  { label: "Track my order", href: "/account/track" },
  { label: "Shipping info", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Browse the FAQ", href: "/faq" },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const [settings, sp] = await Promise.all([getSettings(), searchParams]);
  const hours = settings["support.hours"].replace(`${PENDING}: `, "");
  const promise = settings["support.response_promise"].replace(`${PENDING}: `, "");

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <Section className="pb-6">
        <Eyebrow>Get in touch</Eyebrow>
        <h1 className="text-h1 font-display">How can we help?</h1>
        <p className="mt-2 max-w-2xl text-ink-70">
          Most answers are one tap away below. If you still need us, the form routes your message to
          the right place.
        </p>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <aside>
            <h2 className="font-display text-h3">Try these first</h2>
            <ul className="mt-3 space-y-2">
              {selfServe.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="flex items-center justify-between rounded-[var(--radius-card)] border border-line p-3 text-sm hover:border-gold">
                    {s.label} <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-[var(--radius-card)] bg-surface-alt p-4 text-sm text-ink-70">
              <p className="font-medium text-ink">Support hours</p>
              <p className="mt-1">{hours}</p>
              <p className="mt-2">{promise}</p>
            </div>
          </aside>

          <div>
            <h2 className="font-display text-h3">Send a message</h2>
            <p className="mt-1 text-sm text-ink-70">The form adapts to what you need.</p>
            <div className="mt-4">
              <ContactForm whatsappNumber={settings["support.whatsapp_number"]} defaultReason={sp.reason} />
            </div>
          </div>
        </div>
      </Section>

      <ForwardBlock
        heading="While you're here"
        body="Have a browse, or read a guide — we're around if you need us."
        primary={{ label: "Browse the shop", href: "/shop" }}
        secondary={{ label: "Read the guides", href: "/learn" }}
      />
    </>
  );
}
