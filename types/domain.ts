/**
 * Storefront domain types. These mirror the columns the public site reads from
 * Supabase (see supabase/migrations). The full generated types live in
 * types/database.ts once `supabase gen types` has run against the project.
 */

export type StockStatus = "in_stock" | "low_stock" | "sold_out" | "preorder" | "coming_soon";
export type ProductStatus = "draft" | "active" | "archived";
export type Suitability =
  | "beginner_friendly"
  | "reseller"
  | "personal_use"
  | "clearance"
  | "new_arrival"
  | "best_seller";

export type ProductImage = {
  storage_path: string;
  alt_text: string;
  position: number;
  is_primary: boolean;
  blur_data_url?: string | null;
};

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  hex_or_swatch_url: string | null;
  price_delta_pence: number;
  stock_quantity: number;
  moq_override: number | null;
  is_active: boolean;
};

export type ProductFaq = { question: string; answer: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_slug: string;
  status: ProductStatus;
  short_description: string;
  description_html: string;
  what_you_receive: string;
  who_it_suits: string;
  why_buy: string;
  materials?: string;
  dimensions?: string;
  weight_grams?: number;
  care_instructions?: string;
  box_contents?: string;
  wholesale_price_pence: number;
  compare_at_price_pence: number | null;
  suggested_retail_price_pence: number | null;
  moq: number;
  pack_quantity: number;
  mix_and_match_allowed: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status: StockStatus;
  suitability: Suitability[];
  processing_days_min?: number;
  processing_days_max?: number;
  video_url?: string | null;
  is_featured: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  faqs: ProductFaq[];
  related_slugs: string[];
  related_article_slug?: string | null;
  /** Set when the product name matches the trademark watchlist (Part 24). */
  trademark_flag?: boolean;
  seo_title?: string;
  seo_description?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  intro_copy: string;
  who_it_suits: string;
  icon: string;
  sort_order: number;
};

export type Collection = {
  id: string;
  title: string;
  slug: string;
  description: string;
  rule_type: "manual" | "automatic";
  product_slugs: string[];
  sort_order: number;
};

export type LearningPillar = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
};

export type Article = {
  id: string;
  pillar_slug: string;
  title: string;
  slug: string;
  excerpt: string;
  key_takeaway: string;
  body_html: string;
  reading_minutes: number;
  author_name: string;
  next_action_label: string;
  next_action_href: string;
  is_recommended_for_beginners: boolean;
  status: "draft" | "published" | "archived";
  product_slugs: string[];
  related_slugs: string[];
};

export type SuccessStory = {
  id: string;
  customer_name: string;
  headline: string;
  starting_point: string;
  action_taken: string;
  result: string;
  lesson: string;
  platform: string;
  is_published: boolean;
  is_featured: boolean;
};

export type Testimonial = {
  id: string;
  author_name: string;
  quote: string;
  platform: string;
  rating: number;
  is_published: boolean;
};

export type Faq = {
  id: string;
  category_slug: string;
  question: string;
  answer_html: string;
  next_link_label: string | null;
  next_link_href: string | null;
  is_published: boolean;
};

export type FaqCategory = { id: string; name: string; slug: string; sort_order: number };

export type PolicyPage = {
  slug: string;
  title: string;
  body_html: string;
  last_reviewed_at: string | null;
  is_published: boolean;
};
