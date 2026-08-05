import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPolicyPage } from "@/lib/data";
import { policyPages } from "@/lib/data/catalog";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { formatDate } from "@/lib/utils/format";

export const revalidate = 3600;

export async function generateStaticParams() {
  return policyPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPolicyPage(slug);
  if (!page) return { title: "Not found" };
  return { title: page.title };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPolicyPage(slug);
  if (!page) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} />
      <Container className="py-10">
        <article className="prose-measure mx-auto">
          <h1 className="text-h1 font-display">{page.title}</h1>
          <p className="mt-2 text-sm text-ink-50">
            Last reviewed: {page.last_reviewed_at ? formatDate(page.last_reviewed_at) : "draft — pending review"}
          </p>
          <div
            className="mt-6 space-y-4 text-ink-70 [&_em]:text-ink-50 [&_p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.body_html }}
          />
        </article>
      </Container>
      <ForwardBlock
        heading="Need a hand?"
        body="If a policy raises a question, we're happy to help."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "Read the FAQ", href: "/faq" }}
      />
    </>
  );
}
