import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollectionBySlug, getCollections, getProductsBySlugs, getSettings } from "@/lib/data";
import { Container, Section, Eyebrow } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TrustStrip } from "@/components/layout/trust-strip";
import { ForwardBlock } from "@/components/layout/forward-block";
import { ProductCard } from "@/components/commerce/product-card";

export const revalidate = 300;

export async function generateStaticParams() {
  const cols = await getCollections();
  return cols.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const col = await getCollectionBySlug(slug);
  if (!col) return { title: "Collection not found" };
  return { title: col.title, description: col.description };
}

const PER_PAGE = 24;

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const col = await getCollectionBySlug(slug);
  if (!col) notFound();

  const [settings, products] = await Promise.all([getSettings(), getProductsBySlugs(col.product_slugs)]);
  const currentPage = Math.max(1, Number(page) || 1);
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const pageProducts = products.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: col.title }]} />
      <Section className="pb-6">
        <Eyebrow>Collection</Eyebrow>
        <h1 className="text-h1 font-display">{col.title}</h1>
        <p className="mt-2 max-w-2xl text-ink-70">{col.description}</p>
      </Section>
      <TrustStrip claims={settings["trust.claims"]} />

      <Container className="py-8">
        {pageProducts.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-surface-alt p-8 text-center">
            <p className="text-ink-70">This collection is being stocked right now.</p>
            <Link href="/shop" className="mt-2 inline-block text-sm font-medium text-navy hover:text-gold">
              Browse the full shop →
            </Link>
          </div>
        ) : (
          <>
            {/* Beginner guidance block */}
            {slug === "beginner-bundles" && (
              <div className="mb-6 rounded-[var(--radius-card)] border border-gold bg-gold-pale p-4 text-sm text-ink">
                New here? These are hand-picked to be light, affordable and quick to sell. Start with
                one, prove it works, then reorder.
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {pageProducts.map((p, i) => (
                <ProductCard key={p.slug} product={p} priority={i < 4} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-8 flex justify-center gap-2" aria-label="Pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Link
                    key={n}
                    href={`/collections/${slug}?page=${n}`}
                    aria-current={n === currentPage}
                    className={`grid h-10 w-10 place-items-center rounded-[var(--radius-input)] border text-sm ${
                      n === currentPage ? "border-gold bg-gold-pale" : "border-line"
                    }`}
                  >
                    {n}
                  </Link>
                ))}
              </nav>
            )}
          </>
        )}
      </Container>

      <ForwardBlock
        heading="Not quite it?"
        body="Browse the whole catalogue, or read a guide on choosing products that sell."
        primary={{ label: "Shop everything", href: "/shop" }}
        secondary={{ label: "How to choose", href: "/learn/choosing-products" }}
      />
    </>
  );
}
