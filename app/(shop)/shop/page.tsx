import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { Container, Section, Eyebrow, Chip } from "@/components/ui/primitives";
import { TrustStrip } from "@/components/layout/trust-strip";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { ProductCard } from "@/components/commerce/product-card";
import { ShopFilters } from "@/components/commerce/shop-filters";
import { ProductRequestForm } from "@/components/forms/product-request-form";
import type { Product } from "@/types/domain";

export const metadata: Metadata = {
  title: "Shop wholesale — low minimums, clear unit prices",
  description: "Browse the GBG wholesale catalogue: real photos, low MOQs and clear cost-per-unit for every product.",
};

const quickRoutes = [
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Best Sellers", href: "/collections/best-sellers" },
  { label: "Under £10", href: "/collections/under-10" },
  { label: "Beginner Friendly", href: "/shop?suitability=beginner_friendly" },
  { label: "In Stock Now", href: "/shop?availability=in_stock" },
];

type SearchParams = { [key: string]: string | string[] | undefined };

function applyFilters(products: Product[], sp: SearchParams): Product[] {
  let out = [...products];
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;

  const category = get("category");
  if (category) out = out.filter((p) => p.category_slug === category);

  const suitability = get("suitability");
  if (suitability) out = out.filter((p) => p.suitability.includes(suitability as Product["suitability"][number]));

  const availability = get("availability");
  if (availability === "in_stock") out = out.filter((p) => p.stock_status === "in_stock" || p.stock_status === "low_stock");

  const maxPrice = get("price");
  if (maxPrice) out = out.filter((p) => p.wholesale_price_pence <= Number(maxPrice));

  const sort = get("sort");
  switch (sort) {
    case "newest":
      out.sort((a, b) => Number(b.suitability.includes("new_arrival")) - Number(a.suitability.includes("new_arrival")));
      break;
    case "price_asc":
      out.sort((a, b) => a.wholesale_price_pence - b.wholesale_price_pence);
      break;
    case "price_desc":
      out.sort((a, b) => b.wholesale_price_pence - a.wholesale_price_pence);
      break;
    case "best_selling":
      out.sort((a, b) => Number(b.suitability.includes("best_seller")) - Number(a.suitability.includes("best_seller")));
      break;
    default:
      out.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }
  // Sold-out cards sort last and never disappear (Part 11.2).
  out.sort((a, b) => Number(a.stock_status === "sold_out") - Number(b.stock_status === "sold_out"));
  return out;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const [settings, categories, allProducts] = await Promise.all([getSettings(), getCategories(), getProducts()]);
  const products = applyFilters(allProducts, sp);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <Section className="pb-6">
        <Eyebrow>The catalogue</Eyebrow>
        <h1 className="text-h1 font-display">Shop wholesale</h1>
        <p className="mt-2 max-w-2xl text-ink-70">
          Real photos, low minimums, and the cost per unit shown on every product — so ready buyers
          move fast and beginners never feel lost.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {quickRoutes.map((r) => (
            <Link key={r.href} href={r.href} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink hover:border-gold hover:text-navy">
              {r.label}
            </Link>
          ))}
        </div>
      </Section>
      <TrustStrip claims={settings["trust.claims"]} />

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <ShopFilters categories={categories} resultCount={products.length} />
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-ink-50">
                <Chip>{products.length} products</Chip>
              </p>
            </div>
            {products.length === 0 ? (
              <div className="rounded-[var(--radius-card)] border border-line bg-surface-alt p-8 text-center">
                <p className="text-ink-70">No products match those filters yet.</p>
                <Link href="/shop" className="mt-2 inline-block text-sm font-medium text-navy hover:text-gold">
                  Clear filters →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {products.map((p, i) => (
                  <ProductCard key={p.slug} product={p} priority={i < 4} />
                ))}
              </div>
            )}

            <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface-alt p-5 text-center">
              <p className="text-sm text-ink-70">
                Not sure where to start?{" "}
                <Link href="/start-here" className="font-medium text-navy underline">
                  Let us help you choose
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Product request prompt above the footer */}
      <Section alt id="request">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Can&apos;t find it?</Eyebrow>
          <h2 className="text-h2 font-display">Request a product</h2>
          <p className="mt-2 text-ink-70">
            Tell us what you want to sell. Every request is real demand intelligence that shapes what
            we stock next.
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-xl">
          <ProductRequestForm sourcePage="/shop" />
        </div>
      </Section>

      <ForwardBlock
        heading="Found what you need?"
        body="Add to cart and reach checkout in a few taps — or keep exploring the guides."
        primary={{ label: "View your cart", href: "/cart" }}
        secondary={{ label: "Read the guides", href: "/learn" }}
      />
    </>
  );
}
