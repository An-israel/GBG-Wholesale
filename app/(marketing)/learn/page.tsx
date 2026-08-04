import type { Metadata } from "next";
import Link from "next/link";
import { getArticles, getBeginnerArticles, getPillars } from "@/lib/data";
import { Section, Eyebrow } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { ArticleCard } from "@/components/content/cards";
import { NewsletterBlock } from "@/components/forms/newsletter-block";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Learn — the wholesale education centre",
  description: "Guides on choosing products, pricing for margin, and selling on Vinted, eBay and TikTok Shop. Organised by pillar, written in plain English.",
};

export default async function LearnPage() {
  const [pillars, articles, beginner] = await Promise.all([getPillars(), getArticles(), getBeginnerArticles()]);
  const featured = articles[0];
  const newest = articles.slice(0, 3);
  const counts = new Map<string, number>();
  for (const a of articles) counts.set(a.pillar_slug, (counts.get(a.pillar_slug) ?? 0) + 1);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Learn" }]} />
      <Section className="pb-6">
        <Eyebrow>The education centre</Eyebrow>
        <h1 className="text-h1 font-display">Learn to sell, not just to buy</h1>
        <p className="mt-2 max-w-2xl text-ink-70">
          Real guides on choosing products, pricing and selling — organised so you always know what
          to read next.
        </p>
        <form action="/search" className="mt-5 flex max-w-md gap-2">
          <input name="q" type="search" placeholder="Search guides…" className="w-full rounded-[var(--radius-input)] border border-line px-3 py-2.5" aria-label="Search guides" />
        </form>
      </Section>

      {/* Pillars */}
      <Section alt>
        <h2 className="text-h2 font-display">Explore by pillar</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <Link key={p.slug} href={`/learn/${p.slug}`} className="group rounded-[var(--radius-card)] border border-line bg-surface p-5 hover:shadow-[var(--shadow-card)]">
              <p className="text-micro text-gold">{counts.get(p.slug) ?? 0} guides</p>
              <h3 className="mt-1 font-display text-h3">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-70">{p.description}</p>
              <span className="mt-3 inline-block text-sm font-medium text-navy group-hover:text-gold">Open pillar →</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Featured + newest */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {featured && (
            <div>
              <Eyebrow>Featured guide</Eyebrow>
              <ArticleCard article={featured} className="h-full" />
            </div>
          )}
          <div>
            <Eyebrow>Newest</Eyebrow>
            <div className="space-y-3">
              {newest.map((a) => (
                <Link key={a.slug} href={`/learn/${a.pillar_slug}/${a.slug}`} className="block rounded-[var(--radius-card)] border border-line p-4 hover:border-gold">
                  <p className="text-micro text-ink-50">{a.reading_minutes} min</p>
                  <p className="font-display text-lg leading-snug">{a.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Start with these three */}
      <Section alt>
        <Eyebrow>New here?</Eyebrow>
        <h2 className="text-h2 font-display">Start with these three</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {beginner.slice(0, 3).map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-md">
          <NewsletterBlock source="learn" />
        </div>
      </Section>

      <ForwardBlock
        heading="Learned enough to begin?"
        body="Put it into practice with a small, beginner-friendly first order."
        primary={{ label: "See starter stock", href: "/collections/beginner-bundles" }}
        secondary={{ label: "Browse the shop", href: "/shop" }}
      />
    </>
  );
}
