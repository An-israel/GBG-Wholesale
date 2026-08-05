/**
 * Database seed (Part 20). Run with `npm run seed` after migrations are applied
 * and env vars are set. Idempotent where practical (upserts by natural key).
 *
 * Seeds: settings, shipping, 6 categories, 5 collections, the product catalogue
 * with variants/images/FAQs, 6 pillars + articles, FAQs, unpublished stories &
 * testimonials, policy pages, one super admin + staff + 3 customers, and 40
 * orders spread over 90 days so the admin charts have data.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (server only).
 */
import { createClient } from "@supabase/supabase-js";
import {
  articles,
  categories,
  collections,
  faqCategories,
  faqs,
  pillars,
  policyPages,
  products,
  successStories,
  testimonials,
} from "../lib/data/catalog";
import { DEFAULT_SETTINGS, PUBLIC_SETTING_KEYS, type SettingKey } from "../lib/settings";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Seed requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function seedSettings() {
  const rows = (Object.keys(DEFAULT_SETTINGS) as SettingKey[]).map((k) => ({
    key: k,
    value: DEFAULT_SETTINGS[k] as unknown,
    is_public: PUBLIC_SETTING_KEYS.includes(k),
    description: "Seeded default — confirm before launch if marked PENDING_LAMI.",
  }));
  await db.from("site_settings").upsert(rows, { onConflict: "key" });
  console.log(`✓ ${rows.length} settings`);
}

async function seedShipping() {
  const { data: zone } = await db
    .from("shipping_zones")
    .upsert({ name: "United Kingdom", country_codes: ["GB"], is_active: true }, { onConflict: "name" })
    .select()
    .single();
  const { data: intl } = await db
    .from("shipping_zones")
    .upsert({ name: "International", country_codes: ["IE", "FR", "DE", "US"], is_active: true }, { onConflict: "name" })
    .select()
    .single();
  if (zone) {
    await db.from("shipping_rates").insert([
      { zone_id: zone.id, name: "UK Standard", price_pence: 399, free_over_pence: 5000, estimated_days_min: 3, estimated_days_max: 4 },
    ]);
  }
  if (intl) {
    await db.from("shipping_rates").insert([
      { zone_id: intl.id, name: "International Tracked", price_pence: 1499, estimated_days_min: 7, estimated_days_max: 14, description: "Buyer pays any customs duties." },
    ]);
  }
  console.log("✓ shipping zones & rates");
}

async function seedCatalogue() {
  const catMap = new Map<string, string>();
  for (const c of categories) {
    const { data } = await db
      .from("categories")
      .upsert({ name: c.name, slug: c.slug, description: c.description, intro_copy: c.intro_copy, who_it_suits: c.who_it_suits, icon: c.icon, sort_order: c.sort_order, is_active: true }, { onConflict: "slug" })
      .select()
      .single();
    if (data) catMap.set(c.slug, data.id);
  }
  console.log(`✓ ${categories.length} categories`);

  const prodMap = new Map<string, string>();
  for (const p of products) {
    const { data } = await db
      .from("products")
      .upsert(
        {
          name: p.name, slug: p.slug, sku: p.sku, category_id: catMap.get(p.category_slug) ?? null,
          status: p.status, short_description: p.short_description, description_html: p.description_html,
          what_you_receive: p.what_you_receive, who_it_suits: p.who_it_suits, why_buy: p.why_buy,
          materials: p.materials, dimensions: p.dimensions, weight_grams: p.weight_grams,
          care_instructions: p.care_instructions, box_contents: p.box_contents,
          wholesale_price_pence: p.wholesale_price_pence, compare_at_price_pence: p.compare_at_price_pence,
          suggested_retail_price_pence: p.suggested_retail_price_pence, moq: p.moq, pack_quantity: p.pack_quantity,
          mix_and_match_allowed: p.mix_and_match_allowed, low_stock_threshold: p.low_stock_threshold,
          suitability: p.suitability, is_featured: p.is_featured, video_url: p.video_url ?? null,
          processing_days_min: p.processing_days_min, processing_days_max: p.processing_days_max,
          published_at: p.status === "active" ? new Date().toISOString() : null,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();
    if (!data) continue;
    prodMap.set(p.slug, data.id);

    // Initial stock via the ledger (never a direct write).
    await db.from("inventory_movements").insert({ product_id: data.id, delta: p.stock_quantity, reason: "restock", note: "seed" });

    for (const [i, im] of p.images.entries()) {
      await db.from("product_images").insert({ product_id: data.id, storage_path: im.storage_path, alt_text: im.alt_text, position: i, is_primary: im.is_primary });
    }
    for (const v of p.variants) {
      const { data: vr } = await db.from("product_variants").insert({ product_id: data.id, name: v.name, sku: v.sku, hex_or_swatch_url: v.hex_or_swatch_url, price_delta_pence: v.price_delta_pence, moq_override: v.moq_override, is_active: v.is_active }).select().single();
      if (vr) await db.from("inventory_movements").insert({ product_id: data.id, variant_id: vr.id, delta: v.stock_quantity, reason: "restock", note: "seed variant" });
    }
    for (const [i, f] of p.faqs.entries()) {
      await db.from("product_faqs").insert({ product_id: data.id, question: f.question, answer: f.answer, position: i });
    }
  }
  console.log(`✓ ${products.length} products (with variants, images, FAQs, stock ledger)`);

  for (const col of collections) {
    const { data } = await db.from("collections").upsert({ title: col.title, slug: col.slug, description: col.description, rule_type: col.rule_type, sort_order: col.sort_order, is_active: true }, { onConflict: "slug" }).select().single();
    if (!data) continue;
    for (const [i, slug] of col.product_slugs.entries()) {
      const pid = prodMap.get(slug);
      if (pid) await db.from("collection_products").upsert({ collection_id: data.id, product_id: pid, position: i });
    }
  }
  console.log(`✓ ${collections.length} collections`);

  return { prodMap };
}

async function seedContent() {
  const pillarMap = new Map<string, string>();
  for (const p of pillars) {
    const { data } = await db.from("learning_pillars").upsert({ title: p.title, slug: p.slug, description: p.description, icon: p.icon, sort_order: p.sort_order }, { onConflict: "slug" }).select().single();
    if (data) pillarMap.set(p.slug, data.id);
  }
  for (const a of articles) {
    await db.from("articles").upsert({ pillar_id: pillarMap.get(a.pillar_slug) ?? null, title: a.title, slug: a.slug, excerpt: a.excerpt, key_takeaway: a.key_takeaway, body_html: a.body_html, reading_minutes: a.reading_minutes, author_name: a.author_name, status: a.status, next_action_label: a.next_action_label, next_action_href: a.next_action_href, is_recommended_for_beginners: a.is_recommended_for_beginners, published_at: new Date().toISOString() }, { onConflict: "slug" });
  }
  console.log(`✓ ${pillars.length} pillars, ${articles.length} articles`);

  const fcMap = new Map<string, string>();
  for (const fc of faqCategories) {
    const { data } = await db.from("faq_categories").upsert({ name: fc.name, slug: fc.slug, sort_order: fc.sort_order }, { onConflict: "slug" }).select().single();
    if (data) fcMap.set(fc.slug, data.id);
  }
  for (const f of faqs) {
    await db.from("faqs").insert({ category_id: fcMap.get(f.category_slug) ?? null, question: f.question, answer_html: f.answer_html, next_link_label: f.next_link_label, next_link_href: f.next_link_href, is_published: f.is_published });
  }
  console.log(`✓ ${faqCategories.length} FAQ categories, ${faqs.length} FAQs`);

  for (const s of successStories) {
    await db.from("success_stories").insert({ customer_name: s.customer_name, headline: s.headline, starting_point: s.starting_point, action_taken: s.action_taken, result: s.result, lesson: s.lesson, platform: s.platform, is_published: s.is_published, consent_given: true });
  }
  for (const t of testimonials) {
    await db.from("testimonials").insert({ author_name: t.author_name, quote: t.quote, platform: t.platform, rating: t.rating, is_published: t.is_published });
  }
  for (const pg of policyPages) {
    await db.from("pages").upsert({ slug: pg.slug, title: pg.title, body_html: pg.body_html, is_published: pg.is_published }, { onConflict: "slug" });
  }
  console.log(`✓ ${successStories.length} stories, ${testimonials.length} testimonials (unpublished), ${policyPages.length} policy pages`);
}

async function seedUsers() {
  const superEmail = process.env.SEED_SUPER_ADMIN_EMAIL;
  const users: { email: string; role: string }[] = [
    ...(superEmail ? [{ email: superEmail, role: "super_admin" }] : []),
    { email: "staff@gbgwholesale.com", role: "staff" },
    { email: "amara@example.com", role: "customer" },
    { email: "bola@example.com", role: "customer" },
    { email: "chi@example.com", role: "customer" },
  ];
  const created: { id: string; email: string; role: string }[] = [];
  for (const u of users) {
    const { data } = await db.auth.admin.createUser({ email: u.email, email_confirm: true, password: "GbgSeed!2026" });
    const id = data.user?.id;
    if (id) {
      await db.from("profiles").update({ role: u.role }).eq("id", id);
      created.push({ id, email: u.email, role: u.role });
    }
  }
  console.log(`✓ ${created.length} users (super admin, staff, customers)`);
  return created.filter((u) => u.role === "customer");
}

async function seedOrders(customers: { id: string; email: string }[], prodMap: Map<string, string>) {
  const activeProducts = products.filter((p) => p.status === "active" && p.wholesale_price_pence > 0);
  const now = Date.now();
  let count = 0;
  for (let i = 0; i < 40; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const created = new Date(now - daysAgo * 86400000).toISOString();
    const cust = customers[i % Math.max(customers.length, 1)];
    const product = activeProducts[i % activeProducts.length];
    const pid = prodMap.get(product.slug);
    if (!pid || !cust) continue;
    const qty = product.moq;
    const subtotal = product.wholesale_price_pence * qty;
    const shipping = subtotal >= 5000 ? 0 : 399;
    const total = subtotal + shipping;

    const { data: order } = await db
      .from("orders")
      .insert({ user_id: cust.id, email: cust.email, status: "delivered", payment_status: "paid", fulfilment_status: "fulfilled", subtotal_pence: subtotal, shipping_pence: shipping, total_pence: total, created_at: created, attribution: { source: i % 3 === 0 ? "tiktok" : "direct", ttclid: i % 3 === 0 ? `seed-ttclid-${i}` : null } })
      .select()
      .single();
    if (!order) continue;
    await db.from("order_items").insert({ order_id: order.id, product_id: pid, product_name_snapshot: product.name, sku_snapshot: product.sku, unit_price_pence: product.wholesale_price_pence, quantity: qty, line_total_pence: subtotal });
    count++;
  }
  console.log(`✓ ${count} orders over 90 days`);
}

async function main() {
  console.log("Seeding GBG Wholesale Hub…");
  await seedSettings();
  await seedShipping();
  const { prodMap } = await seedCatalogue();
  await seedContent();
  const customers = await seedUsers();
  await seedOrders(customers, prodMap);
  console.log("Done. The storefront and admin dashboard now have realistic data.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
