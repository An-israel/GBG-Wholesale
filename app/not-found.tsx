import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { getFeaturedProducts } from "@/lib/data";
import { ProductCard } from "@/components/commerce/product-card";

export default async function NotFound() {
  const featured = (await getFeaturedProducts()).slice(0, 3);
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>404</Eyebrow>
        <h1 className="text-h1 font-display">This page has wandered off</h1>
        <p className="mt-3 text-ink-70">
          Let&apos;s get you back on track. Try a search, browse the shop, or start from the beginning.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop" variant="primary">
            Browse the shop
          </ButtonLink>
          <ButtonLink href="/start-here" variant="outline">
            Start here
          </ButtonLink>
          <ButtonLink href="/search" variant="ghost">
            Search
          </ButtonLink>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-50">
          <Link href="/collections/best-sellers" className="hover:text-gold">Best sellers</Link>
          <Link href="/faq" className="hover:text-gold">FAQ</Link>
          <Link href="/contact" className="hover:text-gold">Contact</Link>
        </div>
      </div>
      {featured.length > 0 && (
        <div className="mt-12">
          <p className="mb-4 text-center text-micro text-ink-50">Popular right now</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
