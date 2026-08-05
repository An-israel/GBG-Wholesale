import type { MetadataRoute } from "next";
import { getAllProductSlugs, getArticles, getCollections, getCategories } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [products, collections, categories, articles] = await Promise.all([
    getAllProductSlugs(),
    getCollections(),
    getCategories(),
    getArticles(),
  ]);

  const staticPages = [
    "", "/shop", "/start-here", "/learn", "/community", "/academy", "/about",
    "/success-stories", "/faq", "/contact", "/shipping", "/returns", "/terms",
    "/privacy", "/cookies", "/clearance-policy",
  ];

  return [
    ...staticPages.map((p) => ({ url: `${base}${p}`, lastModified: new Date() })),
    ...categories.map((c) => ({ url: `${base}/shop?category=${c.slug}`, lastModified: new Date() })),
    ...collections.map((c) => ({ url: `${base}/collections/${c.slug}`, lastModified: new Date() })),
    ...products.map((slug) => ({ url: `${base}/products/${slug}`, lastModified: new Date() })),
    ...articles.map((a) => ({ url: `${base}/learn/${a.pillar_slug}/${a.slug}`, lastModified: new Date() })),
  ];
}
