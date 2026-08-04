import Link from "next/link";
import { Container } from "@/components/ui/primitives";

export type Crumb = { label: string; href?: string };

/** Breadcrumbs with BreadcrumbList structured data (Part 10, Part 17). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${siteUrl}${c.href}` } : {}),
    })),
  };

  return (
    <div className="border-b border-line bg-surface">
      <Container>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 py-3 text-sm text-ink-50">
          {items.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-gold">
                  {c.label}
                </Link>
              ) : (
                <span className="text-ink-70" aria-current="page">
                  {c.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
