import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllProductSlugs,
  getProductBySlug,
  getProductsBySlugs,
  getSettings,
  getArticleAnyPillar,
} from "@/lib/data";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { PurchasePanel } from "@/components/commerce/purchase-panel";
import { ProductCard } from "@/components/commerce/product-card";
import { FaqAccordion } from "@/components/content/faq-accordion";
import { formatPence } from "@/lib/utils/format";
import { categories as allCats } from "@/lib/data/catalog";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.seo_title ?? product.name,
    description: product.seo_description ?? product.short_description,
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: product.images[0] ? [product.images[0].storage_path] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related, guide] = await Promise.all([
    getSettings(),
    getProductsBySlugs(product.related_slugs),
    product.related_article_slug ? getArticleAnyPillar(product.related_article_slug) : Promise.resolve(null),
  ]);
  const category = allCats.find((c) => c.slug === product.category_slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description,
    sku: product.sku,
    image: product.images.map((i) => i.storage_path),
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: (product.wholesale_price_pence / 100).toFixed(2),
      availability: product.stock_status === "sold_out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${siteUrl}/products/${product.slug}`,
    },
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(category ? [{ label: category.name, href: `/shop?category=${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <Container className="py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Above the fold */}
          <ProductGallery images={product.images} />
          <div>
            <h1 className="text-h1 font-display">{product.name}</h1>
            <p className="mt-1 font-mono text-sm text-ink-50">{product.sku}</p>
            <p className="mt-3 text-body-lg text-ink-70">{product.short_description}</p>
            <div className="mt-5">
              <PurchasePanel product={product} />
            </div>
            <p className="mt-4 text-sm text-ink-50">
              {settings["delivery.shipping_estimate"].replace(/PENDING_LAMI.*?\(draft: /, "").replace(/\)$/, "")}
            </p>
          </div>
        </div>

        {/* Below the fold */}
        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <Prose title="What you receive" body={product.what_you_receive} />
            <Prose title="Who it suits" body={product.who_it_suits} />
            <Prose title="Why buy" body={product.why_buy} />

            {/* Resale planning block — every figure labelled an example */}
            {product.suggested_retail_price_pence && (
              <section className="rounded-[var(--radius-card)] border border-gold bg-gold-pale p-5">
                <h2 className="font-display text-h3">Planning your resale (an example)</h2>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-ink-50">Your cost / unit</dt>
                    <dd className="font-display text-lg">{formatPence(Math.round(product.wholesale_price_pence / product.pack_quantity))}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-50">Example retail</dt>
                    <dd className="font-display text-lg text-profit">{formatPence(product.suggested_retail_price_pence)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-50">Example margin</dt>
                    <dd className="font-display text-lg text-profit">
                      {formatPence(product.suggested_retail_price_pence - Math.round(product.wholesale_price_pence / product.pack_quantity))}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-ink-70">{settings["retail.disclaimer"]}</p>
              </section>
            )}

            {/* Full details table */}
            <section>
              <h2 className="font-display text-h3">Full details</h2>
              <dl className="mt-3 divide-y divide-line rounded-[var(--radius-card)] border border-line text-sm">
                {[
                  ["Materials", product.materials],
                  ["Dimensions", product.dimensions],
                  ["Weight", product.weight_grams ? `${product.weight_grams}g` : undefined],
                  ["Care", product.care_instructions],
                  ["Pack contents", product.box_contents],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex gap-4 p-3">
                      <dt className="w-32 flex-shrink-0 text-ink-50">{k}</dt>
                      <dd className="text-ink">{v}</dd>
                    </div>
                  ))}
              </dl>
            </section>

            <p className="text-sm text-ink-50">
              Transparency note: photos are of the real product on a neutral surface. Colours may vary
              slightly on your screen.
            </p>

            {product.faqs.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-h3">Product questions</h2>
                <FaqAccordion faqs={product.faqs.map((f, i) => ({ id: `pf-${i}`, category_slug: "product", question: f.question, answer_html: `<p>${f.answer}</p>`, next_link_label: null, next_link_href: null, is_published: true }))} />
              </section>
            )}
          </div>

          {/* Aside: delivery, returns, guide */}
          <aside className="space-y-4">
            <div className="rounded-[var(--radius-card)] border border-line p-4 text-sm">
              <h3 className="font-medium text-ink">Delivery &amp; returns</h3>
              <p className="mt-1 text-ink-70">{settings["delivery.processing_days"].replace(/PENDING_LAMI.*?\(draft: /, "").replace(/\)$/, "")}</p>
              <div className="mt-2 flex gap-3">
                <Link href="/shipping" className="text-navy underline">Shipping</Link>
                <Link href="/returns" className="text-navy underline">Returns</Link>
              </div>
            </div>
            {guide && (
              <Link href={`/learn/${guide.pillar_slug}/${guide.slug}`} className="block rounded-[var(--radius-card)] border border-line p-4 hover:border-gold">
                <p className="text-micro text-gold-ink">Related guide</p>
                <p className="mt-1 font-display text-lg leading-snug">{guide.title}</p>
                <p className="mt-1 text-sm text-ink-70">{guide.excerpt}</p>
              </Link>
            )}
          </aside>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-h2">You may also like</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </Container>

      <ForwardBlock
        heading="Ready to add this to your order?"
        body="Build your first order, then reach checkout in a few taps."
        primary={{ label: "View your cart", href: "/cart" }}
        secondary={{ label: "Keep shopping", href: "/shop" }}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
    </>
  );
}

function Prose({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <section>
      <h2 className="font-display text-h3">{title}</h2>
      <p className="mt-2 text-ink-70">{body}</p>
    </section>
  );
}
