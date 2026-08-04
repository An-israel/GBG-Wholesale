import type { Metadata } from "next";
import { getFaqCategories, getFaqs } from "@/lib/data";
import { Section, Eyebrow } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { FaqAccordion } from "@/components/content/faq-accordion";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "FAQ — everything you need to know",
  description: "Answers on ordering, delivery, returns and Hub access. Searchable, categorised, and always with a next step.",
};

export default async function FaqPage() {
  const [categories, faqs] = await Promise.all([getFaqCategories(), getFaqs()]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer_html.replace(/<[^>]+>/g, "") },
    })),
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      <Section className="pb-6">
        <Eyebrow>Help centre</Eyebrow>
        <h1 className="text-h1 font-display">Frequently asked questions</h1>
        <p className="mt-2 max-w-2xl text-ink-70">Search or browse by topic. Every answer points you to the next step.</p>
      </Section>

      <Section className="pt-0">
        <div className="mx-auto max-w-3xl">
          <FaqAccordion faqs={faqs} searchable />

          <div className="mt-10 space-y-8">
            {categories.map((cat) => {
              const items = faqs.filter((f) => f.category_slug === cat.slug);
              if (items.length === 0) return null;
              return (
                <div key={cat.slug}>
                  <h2 className="mb-3 font-display text-h3">{cat.name}</h2>
                  <FaqAccordion faqs={items} />
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-[var(--radius-card)] border border-line bg-surface-alt p-6 text-center">
            <p className="font-medium text-ink">Still stuck?</p>
            <p className="mt-1 text-sm text-ink-70">We&apos;re happy to help directly.</p>
            <ButtonLink href="/contact" variant="primary" className="mt-3">Contact us</ButtonLink>
          </div>
        </div>
      </Section>

      <ForwardBlock
        heading="Got what you needed?"
        body="Jump back in — browse the catalogue or start with the guides."
        primary={{ label: "Browse the shop", href: "/shop" }}
        secondary={{ label: "Read the guides", href: "/learn" }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </>
  );
}
