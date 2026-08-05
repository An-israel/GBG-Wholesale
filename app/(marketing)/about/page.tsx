import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About GBG — Global Biz Gateway",
  description: "Why GBG exists, what it provides, and the founder's journey from bridal to a business gateway for new sellers.",
};

const timeline = [
  ["2016", "Bridal beginnings", "It started with bridal accessories — learning firsthand what good stock and honest service feel like."],
  ["Then", "GBL Accessories", "A growing accessories business, and a growing frustration with opaque suppliers and high minimums."],
  ["Now", "GBG — Global Biz Gateway", "A gateway for new sellers: real stock, real prices, and the education to actually sell."],
];

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <Section>
        <div className="max-w-2xl">
          <Eyebrow>Global Biz Gateway</Eyebrow>
          <h1 className="text-h1 font-display">A gateway, not just a supplier</h1>
          <p className="mt-3 text-body-lg text-ink-70">
            GBG stands for Global Biz Gateway. We exist to be the doorway we wished existed — where a
            complete beginner can get real stock, real prices, and real guidance without having to DM
            anyone for the basics.
          </p>
        </div>
      </Section>

      <Section alt>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-h2 font-display">Why GBG exists</h2>
            <p className="mt-3 text-ink-70">
              Too many new sellers are blocked by hidden prices, huge minimums, and suppliers who
              vanish after the sale. GBG removes those blocks and adds what&apos;s usually missing:
              education and community.
            </p>
          </div>
          <div>
            <h2 className="text-h2 font-display">What we provide</h2>
            <ul className="mt-3 space-y-2 text-ink-70">
              <li>· Ready stock at low minimums, with clear unit prices</li>
              <li>· Honest photos of every item</li>
              <li>· Guides and a community to help you sell</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Founder timeline */}
      <Section>
        <Eyebrow>The journey</Eyebrow>
        <h2 className="text-h2 font-display">From bridal to a business gateway</h2>
        <ol className="mt-6 space-y-4 border-l-2 border-line pl-6">
          {timeline.map(([year, title, body]) => (
            <li key={year} className="relative">
              <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-gold bg-surface" />
              <p className="font-mono text-sm text-gold">{year}</p>
              <h3 className="font-display text-h3">{title}</h3>
              <p className="mt-1 text-ink-70">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Philosophy + founder image placeholder */}
      <Section alt>
        <div className="grid items-center gap-6 md:grid-cols-[240px_1fr]">
          <div className="mx-auto aspect-square w-48 overflow-hidden rounded-[var(--radius-modal)] md:w-full">
            {/* PENDING_LAMI — replace with a professional photo of Lami */}
            <div className="grid h-full w-full place-items-center bg-gold-pale text-center text-micro text-ink-50">
              Founder photo
              <br />
              PENDING_LAMI
            </div>
          </div>
          <div>
            <Eyebrow>Our philosophy</Eyebrow>
            <h2 className="text-h2 font-display">Input equals output</h2>
            <p className="mt-3 text-ink-70">
              We won&apos;t pretend selling is effortless. What you put in — good photos, fair pricing,
              consistent listing — is what you get out. Our job is to make the inputs as easy and
              honest as possible.
            </p>
          </div>
        </div>
      </Section>

      <ForwardBlock
        heading="Come and build with us"
        body="Start with a small order, or start with a guide — either way, you're not doing it alone."
        primary={{ label: "Browse the shop", href: "/shop" }}
        secondary={{ label: "Start here", href: "/start-here" }}
      />
    </>
  );
}
