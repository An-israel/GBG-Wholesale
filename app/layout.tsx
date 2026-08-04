import type { Metadata } from "next";
import "./globals.css";
import { cormorant, dmSans, dmMono } from "@/lib/fonts";
import { getCategories, getSettings } from "@/lib/data";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { CookieConsent } from "@/components/analytics/cookie-consent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GBG Wholesale — UK wholesale with real photos & low minimums",
    template: "%s · GBG Wholesale",
  },
  description:
    "Global Biz Gateway: UK wholesale ready-stock at low minimum orders, with the education and community to help you actually sell.",
  openGraph: {
    type: "website",
    siteName: "GBG Wholesale",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GBG Wholesale",
    url: siteUrl,
    description: "UK wholesale ready-stock at low minimum orders.",
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GBG Wholesale",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en-GB" className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {settings["announcement.enabled"] && (
          <AnnouncementBar text={settings["announcement.text"]} link={settings["announcement.link"]} />
        )}
        <Header categories={categories} />
        <main id="main">{children}</main>
        <Footer settings={settings} />
        <WhatsAppFloat number={settings["support.whatsapp_number"]} />
        <CartDrawer />
        <CookieConsent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </body>
    </html>
  );
}
