import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug, getArticles, getPillarBySlug, getProductsBySlugs } from "@/lib/data";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { ProductCard } from "@/components/commerce/product-card";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ pillar: a.pillar_slug, slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pillar: string; slug: string }> }): Promise<Metadata> {
  const { pillar, slug } = await params;
  const a = await getArticleBySlug(pillar, slug);
  if (!a) return { title: "Guide not found" };
  return { title: a.title, description: a.excerpt };
}

export default async function ArticlePage({ params }: { params: Promise<{ pillar: string; slug: string }> }) {
  const { pillar, slug } = await params;
  const [article, pillarObj] = await Promise.all([getArticleBySlug(pillar, slug), getPillarBySlug(pillar)]);
  if (!article || !pillarObj) notFound();
  const mentioned = await getProductsBySlugs(article.product_slugs);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Person", name: article.author_name },
    url: `${siteUrl}/learn/${pillar}/${slug}`,
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Learn", href: "/learn" },
          { label: pillarObj.title, href: `/learn/${pillar}` },
          { label: article.title },
        ]}
      />
      <Container className="py-8">
        <article className="mx-auto max-w-2xl">
          <Eyebrow>{article.reading_minutes} min read · {pillarObj.title}</Eyebrow>
          <h1 className="text-h1 font-display">{article.title}</h1>

          {/* Key takeaway box — the highest-value element for a skimmer */}
          <div className="mt-6 rounded-[var(--radius-card)] border border-gold bg-gold-pale p-5">
            <p className="text-micro text-gold">Key takeaway</p>
            <p className="mt-1 font-display text-h3 leading-snug">{article.key_takeaway}</p>
          </div>

          <div className="prose-measure mt-8 space-y-4 text-ink-70 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-h3 [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed" dangerouslySetInnerHTML={{ __html: article.body_html }} />

          {/* Next action — enforced by schema */}
          <div className="mt-10 rounded-[var(--radius-card)] bg-navy p-6 text-cream">
            <p className="text-micro text-gold">Your next step</p>
            <Link href={article.next_action_href} className="mt-1 inline-flex items-center gap-2 font-display text-h3 text-cream hover:text-gold">
              {article.next_action_label} →
            </Link>
          </div>

          {mentioned.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-h3">Products mentioned in this guide</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {mentioned.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}
        </article>
      </Container>

      <ForwardBlock
        heading="Keep the momentum"
        body="One guide down. Put it into practice, or read the next one."
        primary={{ label: article.next_action_label, href: article.next_action_href }}
        secondary={{ label: "More guides", href: `/learn/${pillar}` }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
