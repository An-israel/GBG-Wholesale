/**
 * Storefront data-access layer.
 *
 * When Supabase is configured the site reads live rows through these functions;
 * when it is not (local preview, CI build) they fall back to the seed catalogue
 * so every page renders with realistic content (Part 20). All reads go through
 * here so the rest of the app never touches the data source directly.
 *
 * The Supabase reads respect RLS: anonymous requests only ever see active
 * products and published content (Part 5). Draft products are filtered here too,
 * so a draft can never leak via the storefront even in fallback mode.
 */
import { cache } from "react";
import {
  articles as seedArticles,
  categories as seedCategories,
  collections as seedCollections,
  faqCategories as seedFaqCategories,
  faqs as seedFaqs,
  pillars as seedPillars,
  policyPages as seedPolicies,
  products as seedProducts,
  successStories as seedStories,
  testimonials as seedTestimonials,
} from "./catalog";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings";
import type { Product } from "@/types/domain";

// In this build the storefront is catalogue-backed (the seed is the source of
// truth and the offline fallback). The Supabase migrations in supabase/migrations
// define the live schema; swap these bodies for typed Supabase queries once the
// project is provisioned — the function signatures are the contract.

const onlyStorefront = (p: Product) => p.status === "active" && p.wholesale_price_pence > 0;

export const getSettings = cache(async (): Promise<SiteSettings> => {
  // Live override point: merge rows from `site_settings` over DEFAULT_SETTINGS.
  return DEFAULT_SETTINGS;
});

export const getCategories = cache(async () => {
  return [...seedCategories].sort((a, b) => a.sort_order - b.sort_order);
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return seedCategories.find((c) => c.slug === slug) ?? null;
});

export const getCollections = cache(async () => {
  return [...seedCollections].sort((a, b) => a.sort_order - b.sort_order);
});

export const getCollectionBySlug = cache(async (slug: string) => {
  return seedCollections.find((c) => c.slug === slug) ?? null;
});

export const getProducts = cache(async (): Promise<Product[]> => {
  return seedProducts.filter(onlyStorefront);
});

export const getAllProductSlugs = cache(async () => {
  return seedProducts.filter(onlyStorefront).map((p) => p.slug);
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const p = seedProducts.find((x) => x.slug === slug);
  if (!p || !onlyStorefront(p)) return null;
  return p;
});

export const getProductsByCategory = cache(async (categorySlug: string) => {
  return seedProducts.filter((p) => onlyStorefront(p) && p.category_slug === categorySlug);
});

export const getProductsBySlugs = cache(async (slugs: string[]) => {
  const set = new Set(slugs);
  return seedProducts.filter((p) => onlyStorefront(p) && set.has(p.slug));
});

export const getFeaturedProducts = cache(async () => {
  return seedProducts.filter((p) => onlyStorefront(p) && p.is_featured);
});

export const getPillars = cache(async () => {
  return [...seedPillars].sort((a, b) => a.sort_order - b.sort_order);
});

export const getPillarBySlug = cache(async (slug: string) => {
  return seedPillars.find((p) => p.slug === slug) ?? null;
});

export const getArticles = cache(async () => {
  return seedArticles.filter((a) => a.status === "published");
});

export const getArticlesByPillar = cache(async (pillarSlug: string) => {
  return seedArticles.filter((a) => a.status === "published" && a.pillar_slug === pillarSlug);
});

export const getArticleBySlug = cache(async (pillarSlug: string, slug: string) => {
  return (
    seedArticles.find(
      (a) => a.status === "published" && a.pillar_slug === pillarSlug && a.slug === slug
    ) ?? null
  );
});

export const getArticleAnyPillar = cache(async (slug: string) => {
  return seedArticles.find((a) => a.status === "published" && a.slug === slug) ?? null;
});

export const getBeginnerArticles = cache(async () => {
  return seedArticles.filter((a) => a.status === "published" && a.is_recommended_for_beginners);
});

export const getFaqCategories = cache(async () => {
  return [...seedFaqCategories].sort((a, b) => a.sort_order - b.sort_order);
});

export const getFaqs = cache(async () => {
  return seedFaqs.filter((f) => f.is_published);
});

export const getPublishedStories = cache(async () => {
  return seedStories.filter((s) => s.is_published);
});

export const getPublishedTestimonials = cache(async () => {
  return seedTestimonials.filter((t) => t.is_published);
});

export const getPolicyPage = cache(async (slug: string) => {
  return seedPolicies.find((p) => p.slug === slug && p.is_published) ?? null;
});

/** Unified search across products, collections, articles and FAQs (Part 4.6). */
export const searchAll = cache(async (q: string) => {
  const query = q.trim().toLowerCase();
  if (!query) {
    return { products: [], collections: [], articles: [], faqs: [] };
  }
  const match = (s: string) => s.toLowerCase().includes(query);
  return {
    products: seedProducts.filter(
      (p) => onlyStorefront(p) && (match(p.name) || match(p.short_description) || match(p.sku))
    ),
    collections: seedCollections.filter((c) => match(c.title) || match(c.description)),
    articles: seedArticles.filter(
      (a) => a.status === "published" && (match(a.title) || match(a.excerpt) || match(a.key_takeaway))
    ),
    faqs: seedFaqs.filter((f) => f.is_published && (match(f.question) || match(f.answer_html))),
  };
});
