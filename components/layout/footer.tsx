import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { NewsletterBlock } from "@/components/forms/newsletter-block";
import type { SiteSettings } from "@/lib/settings";

const groups = [
  {
    title: "Shop",
    links: [
      { label: "All Categories", href: "/shop" },
      { label: "New Arrivals", href: "/collections/new-arrivals" },
      { label: "Best Sellers", href: "/collections/best-sellers" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Start & Learn",
    links: [
      { label: "Start Here", href: "/start-here" },
      { label: "Learn", href: "/learn" },
      { label: "Academy", href: "/academy" },
      { label: "The Roadmap", href: "/start-here#roadmap" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Track Order", href: "/account/track" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About GBG", href: "/about" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Community", href: "/community" },
      { label: "Product Requests", href: "/shop#request" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy & Cookies", href: "/privacy" },
      { label: "Clearance Policy", href: "/clearance-policy" },
    ],
  },
];

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-16 bg-navy text-cream">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div>
            <p className="font-display text-2xl font-bold">GBG Wholesale</p>
            <p className="mt-2 max-w-xs text-sm text-cream/70">
              Global Biz Gateway — UK wholesale with real photos, low minimums and the
              guidance to actually sell.
            </p>
            <NewsletterBlock variant="footer" />
          </div>
          {groups.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <p className="text-micro text-gold">{g.title}</p>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-cream/80 hover:text-cream">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-cream/15 pt-6 text-sm text-cream/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} GBG Wholesale. All rights reserved.</p>
          <div className="flex items-center gap-3" aria-label="Payment methods">
            <span className="rounded bg-cream/10 px-2 py-1 text-xs">Visa</span>
            <span className="rounded bg-cream/10 px-2 py-1 text-xs">Mastercard</span>
            <span className="rounded bg-cream/10 px-2 py-1 text-xs">Amex</span>
            <span className="rounded bg-cream/10 px-2 py-1 text-xs">Apple&nbsp;Pay</span>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-xs text-cream/50">{settings["retail.disclaimer"]}</p>
      </Container>
    </footer>
  );
}
