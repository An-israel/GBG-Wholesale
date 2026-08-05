import type { Metadata } from "next";
import Link from "next/link";
import { searchAll } from "@/lib/data";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductRequestForm } from "@/components/forms/product-request-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

const popular = ["hair clips", "earrings", "candle", "tote", "under 10"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchAll(query) : { products: [], collections: [], articles: [], faqs: [] };
  const total = results.products.length + results.collections.length + results.articles.length + results.faqs.length;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <Container className="py-8">
        <form action="/search" className="flex max-w-xl gap-2">
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search products, guides and help…"
            aria-label="Search"
            className="w-full rounded-[var(--radius-input)] border border-line px-4 py-3"
            autoFocus
          />
        </form>

        {query && (
          <p className="mt-4 text-sm text-ink-50">
            {total} {total === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
          </p>
        )}

        {query && total === 0 && (
          // Zero-result state offers suggestions + the product request form,
          // and the query is logged as a restocking signal (Part 12.4).
          <div className="mt-6 space-y-8">
            <div className="rounded-[var(--radius-card)] border border-line bg-surface-alt p-6">
              <h2 className="font-display text-h3">No matches — but this helps us</h2>
              <p className="mt-1 text-sm text-ink-70">
                Zero-result searches tell us what to stock next. Try a popular search, or request it below.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {popular.map((p) => (
                  <Link key={p} href={`/search?q=${encodeURIComponent(p)}`} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-gold">
                    {p}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Eyebrow>Request it</Eyebrow>
              <h2 className="text-h2 font-display">Ask us to stock it</h2>
              <div className="mt-4 max-w-xl">
                <ProductRequestForm sourcePage={`/search?q=${encodeURIComponent(query)}`} />
              </div>
            </div>
          </div>
        )}

        {results.products.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-h3">Products</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {results.products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}

        {results.collections.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-h3">Collections</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {results.collections.map((c) => (
                <li key={c.slug}>
                  <Link href={`/collections/${c.slug}`} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-gold">{c.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {results.articles.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-h3">Guides</h2>
            <ul className="mt-3 space-y-2">
              {results.articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/learn/${a.pillar_slug}/${a.slug}`} className="block rounded-[var(--radius-card)] border border-line p-3 hover:border-gold">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-ink-70">{a.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {results.faqs.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-h3">Help</h2>
            <ul className="mt-3 space-y-2">
              {results.faqs.map((f) => (
                <li key={f.id} className="rounded-[var(--radius-card)] border border-line p-3">
                  <p className="font-medium">{f.question}</p>
                  <div className="text-sm text-ink-70" dangerouslySetInnerHTML={{ __html: f.answer_html }} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {!query && (
          <div className="mt-8">
            <Eyebrow>Popular searches</Eyebrow>
            <div className="mt-2 flex flex-wrap gap-2">
              {popular.map((p) => (
                <Link key={p} href={`/search?q=${encodeURIComponent(p)}`} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-gold">
                  {p}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
