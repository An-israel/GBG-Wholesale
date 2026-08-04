import type { Metadata } from "next";
import Link from "next/link";
import { getBeginnerArticles, getSettings } from "@/lib/data";
import { Section, Eyebrow } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { ReadinessChecklist } from "@/components/content/readiness-checklist";
import { ArticleCard, JourneyCard } from "@/components/content/cards";
import { PENDING } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Start Here — a calm beginner's guide to wholesale",
  description: "New to reselling? Start here. Plain-English explanations, a readiness check and a clear roadmap — no jargon.",
};

const glossary = [
  ["MOQ", "Minimum order quantity — the smallest number of units you can buy."],
  ["Unit cost", "What one item costs you once you divide the pack price."],
  ["Margin", "What's left after you sell — your selling price minus your cost."],
  ["Ready stock", "Items already in the warehouse, ready to ship now."],
];

const roadmap = ["Learn", "Research", "Choose", "Buy", "List", "Sell", "Restock"];

export default async function StartHerePage() {
  const [settings, articles] = await Promise.all([getSettings(), getBeginnerArticles()]);
  const sypb = settings["links.sypb"];
  const sypbHref = sypb.includes(PENDING) ? "/community" : sypb;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Start Here" }]} />

      <Section>
        <div className="max-w-2xl">
          <Eyebrow>Welcome — take your time</Eyebrow>
          <h1 className="text-h1 font-display">You don&apos;t need to know it all to start.</h1>
          <p className="mt-3 text-body-lg text-ink-70">
            This is the calm way in. We&apos;ll explain everything in plain words, help you check
            you&apos;re ready, and show you exactly what to do next.
          </p>
          <ButtonLink href="#roadmap" variant="primary" size="lg" className="mt-5">
            See the roadmap
          </ButtonLink>
        </div>
      </Section>

      {/* Identify your situation */}
      <Section alt>
        <Eyebrow>Where are you?</Eyebrow>
        <h2 className="text-h2 font-display">Pick the one that sounds like you</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <JourneyCard title="I've never sold anything" body="Perfect place to begin. We'll build it up slowly." href="/learn/understanding-product-business" cta="Learn the basics" />
          <JourneyCard title="I've sold a little" body="You know the feeling. Let's make it consistent." href="/learn/selling-successfully" cta="Sell better" />
          <JourneyCard title="I'm ready to buy" body="Skip ahead — let's find your first products." href="/collections/beginner-bundles" cta="See starter stock" />
        </div>
      </Section>

      {/* What wholesale means + glossary */}
      <Section>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Eyebrow>Plain English</Eyebrow>
            <h2 className="text-h2 font-display">What wholesale actually means</h2>
            <p className="mt-3 text-ink-70">
              Wholesale simply means buying stock at a lower price per item so you can sell it on for
              more. No factory, no huge order, no jargon. You buy a small batch, you sell it, and you
              reorder what works.
            </p>
          </div>
          <dl className="grid gap-3 rounded-[var(--radius-card)] border border-line p-5">
            {glossary.map(([term, def]) => (
              <div key={term}>
                <dt className="font-mono text-sm font-medium text-navy">{term}</dt>
                <dd className="text-sm text-ink-70">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* Readiness checklist */}
      <Section alt>
        <div className="mx-auto max-w-2xl">
          <Eyebrow>Two-minute check</Eyebrow>
          <h2 className="text-h2 font-display">Are you ready to start?</h2>
          <p className="mt-2 text-ink-70">Tick what&apos;s true. We&apos;ll point you to the right next step.</p>
          <div className="mt-6">
            <ReadinessChecklist />
          </div>
        </div>
      </Section>

      {/* Roadmap */}
      <Section id="roadmap">
        <Eyebrow>The path</Eyebrow>
        <h2 className="text-h2 font-display">Your roadmap</h2>
        <ol className="mt-6 space-y-3 md:hidden">
          {roadmap.map((step, i) => (
            <li key={step} className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line p-4">
              <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-navy font-mono text-sm text-cream">{i + 1}</span>
              <span className="font-medium">{step}</span>
            </li>
          ))}
        </ol>
        <ol className="mt-6 hidden items-center justify-between md:flex">
          {roadmap.map((step, i) => (
            <li key={step} className="flex flex-1 flex-col items-center text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-navy font-mono text-cream">{i + 1}</span>
              <span className="mt-2 text-sm font-medium">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Recommended lessons */}
      <Section alt>
        <Eyebrow>Start with these</Eyebrow>
        <h2 className="text-h2 font-display">Recommended lessons</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {articles.slice(0, 3).map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </Section>

      {/* SYPB + Academy */}
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-line p-6">
            <h3 className="font-display text-h3">Join SYPB</h3>
            <p className="mt-2 text-sm text-ink-70">A free, supportive community for people learning to sell — open to everyone, before you buy.</p>
            <Link href={sypbHref} className="mt-3 inline-block text-sm font-medium text-navy hover:text-gold">Learn about SYPB →</Link>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line p-6">
            <h3 className="font-display text-h3">Prefer a guided path?</h3>
            <p className="mt-2 text-sm text-ink-70">The Academy is a deeper, step-by-step programme for people who want to learn the whole craft.</p>
            <Link href="/academy" className="mt-3 inline-block text-sm font-medium text-navy hover:text-gold">Explore the Academy →</Link>
          </div>
        </div>
      </Section>

      <ForwardBlock
        heading="Feeling ready?"
        body="You can start with one small, beginner-friendly order today."
        primary={{ label: "See starter stock", href: "/collections/beginner-bundles" }}
        secondary={{ label: "Keep learning", href: "/learn" }}
      />
    </>
  );
}
