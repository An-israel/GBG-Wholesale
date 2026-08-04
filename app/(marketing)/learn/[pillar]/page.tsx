import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByPillar, getPillarBySlug, getPillars } from "@/lib/data";
import { Section, Eyebrow } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { ArticleCard } from "@/components/content/cards";

export const revalidate = 3600;

export async function generateStaticParams() {
  const pillars = await getPillars();
  return pillars.map((p) => ({ pillar: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pillar: string }> }): Promise<Metadata> {
  const { pillar } = await params;
  const p = await getPillarBySlug(pillar);
  if (!p) return { title: "Pillar not found" };
  return { title: `${p.title} — Learn`, description: p.description };
}

export default async function PillarPage({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar } = await params;
  const p = await getPillarBySlug(pillar);
  if (!p) notFound();
  const articles = await getArticlesByPillar(pillar);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Learn", href: "/learn" }, { label: p.title }]} />
      <Section className="pb-6">
        <Eyebrow>Learning pillar</Eyebrow>
        <h1 className="text-h1 font-display">{p.title}</h1>
        <p className="mt-2 max-w-2xl text-ink-70">{p.description}</p>
      </Section>
      <Section className="pt-0">
        {articles.length === 0 ? (
          <p className="text-ink-70">Guides for this pillar are being written.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </Section>
      <ForwardBlock
        heading="Ready to act on it?"
        body="Turn what you've learned into a first order."
        primary={{ label: "Shop starter stock", href: "/collections/beginner-bundles" }}
        secondary={{ label: "Back to Learn", href: "/learn" }}
      />
    </>
  );
}
