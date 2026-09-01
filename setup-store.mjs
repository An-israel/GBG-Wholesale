#!/usr/bin/env node
/**
 * GBG Wholesale Hub - one-time store setup.
 *
 * Creates every Shopify record the theme's links point at:
 *   · 14 Pages, each bound to the matching theme template
 *   · 68 Collections (automated, by product tag or price)
 *   ·  4 Navigation menus, built from those collections
 *   ·  8 demo products across those collections
 *
 * The theme is only a set of layouts - Shopify still needs a real Page record
 * before /pages/about resolves instead of 404ing. This script creates them
 * with exactly the handles the navigation expects, so nothing can be mistyped.
 *
 * Safe to run more than once: anything that already exists is skipped, never
 * duplicated and never overwritten.
 *
 * Usage:
 *   node setup-store.mjs <store>.myshopify.com shpat_xxxxxxxxxxxx
 *
 * Add --replace-menus to rebuild the navigation menus from scratch. Without
 * it, a menu that already exists is left alone, because a setup script should
 * not quietly throw away navigation someone has hand-edited.
 */

const [, , SHOP_ARG, TOKEN_ARG] = process.argv;

if (!SHOP_ARG || !TOKEN_ARG) {
  console.error(`
Usage:  node setup-store.mjs <store>.myshopify.com <admin-api-token> [--replace-menus]

Example:
  node setup-store.mjs gbg-wholesale-hub-d8b9mivj.myshopify.com shpat_abc123...

Scopes the app needs:
  write_content   write_products   write_online_store_navigation
`);
  process.exit(1);
}

const SHOP = SHOP_ARG.replace(/^https?:\/\//, '').replace(/\/$/, '');
const REPLACE_MENUS = process.argv.includes('--replace-menus');
const TOKEN = TOKEN_ARG.trim();
const API = `https://${SHOP}/admin/api/2024-10`;

if (!TOKEN.startsWith('shpat_')) {
  console.error(
    `\n✗ That token doesn't look like an Admin API token.\n` +
      `  It should begin with "shpat_". A "shptka_" token is a Theme Access\n` +
      `  password - that one can only touch theme files, not pages or products.\n`
  );
  process.exit(1);
}

/* ------------------------------------------------------------------ */

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON error page */
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `Shopify rejected the token (HTTP ${res.status}).\n` +
        `  Check the app has these scopes ticked: write_content, write_products,\n` +
        `  write_online_store_navigation.\n` +
        `  Also make sure you clicked "Install app" after saving the scopes.`
    );
  }

  // Shopify rate limit - wait and let the caller retry.
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    return api(method, path, body);
  }

  if (!res.ok) {
    const detail = json?.errors ? JSON.stringify(json.errors) : text.slice(0, 300);
    throw new Error(`HTTP ${res.status} on ${method} ${path}\n  ${detail}`);
  }

  return json;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Navigation menus exist only in the GraphQL Admin API. There is no REST
 * endpoint for them, which is why this one helper sits beside the REST one
 * rather than replacing it.
 */
async function gql(query, variables) {
  const res = await fetch(`${API}/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 429) {
    await sleep(2000);
    return gql(query, variables);
  }

  const json = await res.json().catch(() => null);

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `Shopify rejected the token for navigation (HTTP ${res.status}).\n` +
        `  Menus need the write_online_store_navigation scope, which is separate\n` +
        `  from the ones pages and products use. Tick it on the custom app, save,\n` +
        `  then click "Install app" again to reissue the token.`
    );
  }

  if (!res.ok || json?.errors) {
    const detail = json?.errors ? JSON.stringify(json.errors) : `HTTP ${res.status}`;
    throw new Error(`GraphQL failed\n  ${detail}`);
  }

  return json.data;
}

/* ------------------------------------------------------------------ */
/* 1. PAGES - handle must match what the theme navigation links to.    */
/* ------------------------------------------------------------------ */

const PAGES = [
  ['about',                      'About GBG',            'page.about'],
  ['start-here',                 'Start Here',           'page.start-here'],
  ['community',                  'Community & Support',  'page.community'],
  ['faq',                        'FAQ',                  'page.faq'],
  ['contact',                    'Contact',              'page.contact'],
  ['learn',                      'Learn Hub',            'page.learn'],
  ['learn-platform-guide',       'Platform Guide',       'page.learn-platform-guide'],
  ['learn-platform-safety-guide','Platform Safety Guide','page.learn-platform-safety-guide'],
  ['learn-listings-guide',       'Listings Guide',       'page.learn-listings-guide'],
  ['academy',                    'The GBG Academy',      'page.academy'],
  ['returns-policy',             'Returns Policy',       'page.returns-policy'],
  ['privacy-policy',             'Privacy Policy',       'page.privacy-policy'],
  ['terms-of-service',           'Terms of Service',     'page.terms-of-service'],
  ['track-your-order',           'Track Your Order',     'page.track-your-order'],
  ['reviews',                    'Reviews',              'page.reviews'],
];

/* ------------------------------------------------------------------ */
/* 2. COLLECTIONS - automated, matched on product tag.                 */
/* ------------------------------------------------------------------ */

/* The nine core categories get the richer category template: hero,
   subcategory tiles, buying guide, related collections and a category FAQ.
   Everything else uses the plain collection template, where products start
   immediately.

   They are also sorted by best selling, which is what makes the "Best sellers
   in this category" band on that template truthful rather than decorative:
   Liquid cannot re-sort a collection, so the order has to be set here. */
const CATEGORY_HANDLES = new Set([
  'jewellery-accessories', 'bags', 'clothing', 'beauty-fragrance', 'electronics',
  'home-lifestyle', 'kids-school', 'drinkware', 'starter-boxes',
]);

const COLLECTIONS = [
  { handle: "jewellery-accessories", title: "Wholesale Jewellery & Accessories UK", menuLabel: "Jewellery & Accessories",
    body: "<p>Wholesale jewellery and accessories for UK resellers, sold in small packs rather than by the hundred. Necklaces, earrings, bracelets, rings and sets, held in the UK and dispatched in 3 working days.</p><p>The fastest category to start in. It photographs well on a phone, posts for the price of a large letter, and sits at an impulse price on Vinted and TikTok Shop. Minimum order quantities are kept low so you can test a style before committing to it.</p>",
    rule: "jewellery-accessories" },
  { handle: "bags", title: "Wholesale Bags UK for Resellers", menuLabel: "Bags",
    body: "<p>Wholesale bags for UK resellers. Fashion bags, handbags, school bags, wallets and travel bags at trade prices, shipped from the UK in 3 working days.</p><p>Bags carry a higher price per unit than jewellery, so fewer sales are needed to make a pack worth it. They photograph well on a plain background and sell year round, with school and travel styles peaking seasonally.</p>",
    rule: "bags" },
  { handle: "clothing", title: "Wholesale Clothing UK for Resellers", menuLabel: "Clothing",
    body: "<p>Wholesale clothing for UK resellers, sold in mixed-size packs at genuine trade prices. Womenswear, casualwear, knitwear and seasonal ranges, shipped from the UK.</p><p>Vinted is the fashion platform in Britain and it rewards sellers who list consistently. Packs arrive in mixed sizes so you cover a realistic size curve instead of guessing one.</p>",
    rule: "clothing" },
  { handle: "beauty-fragrance", title: "Wholesale Beauty & Fragrance UK", menuLabel: "Beauty & Fragrance",
    body: "<p>Wholesale beauty and fragrance for UK resellers. Perfumes, mini perfumes, beauty accessories and personal care, held in the UK.</p><p>Fragrance has one of the strongest gifting curves in the shop, climbing sharply from October. Mini perfumes work well as add-ons that lift an order value without lifting postage.</p>",
    rule: "beauty-fragrance" },
  { handle: "electronics", title: "Wholesale Electronics & Gadgets UK", menuLabel: "Electronics & Gadgets",
    body: "<p>Wholesale consumer electronics and gadgets for UK resellers. Fans, speakers, phone accessories, small electronics and home gadgets, boxed and ready to list.</p><p>People search electronics by name rather than browsing, which makes eBay the strongest first platform. Anything you can demonstrate on video does well on TikTok Shop. Description accuracy matters more here than anywhere else in the shop.</p>",
    rule: "electronics" },
  { handle: "home-lifestyle", title: "Wholesale Home & Lifestyle UK", menuLabel: "Home & Lifestyle",
    body: "<p>Wholesale homeware and lifestyle products for UK resellers. Kitchenware, home accessories, humidifiers, storage and lifestyle products, dispatched from the UK.</p><p>Bulkier items do better with local collection on Facebook Marketplace, where postage is not eating your margin. Smaller giftable pieces sell steadily on eBay all year.</p>",
    rule: "home-lifestyle" },
  { handle: "kids-school", title: "Wholesale Kids & School Supplies UK", menuLabel: "Kids & School",
    body: "<p>Wholesale kids and school products for UK resellers. School bags, school shoes, kids accessories, toys and feeding sets, held in the UK.</p><p>This category is the most seasonal in the shop. Demand climbs from July and peaks in the fortnight before term, so buying early is worth more here than anywhere else.</p>",
    rule: "kids-school" },
  { handle: "drinkware", title: "Wholesale Drinkware UK for Resellers", menuLabel: "Drinkware",
    body: "<p>Wholesale drinkware for UK resellers. Tumblers, cups, bottles and travel cups at trade prices, shipped from the UK in 3 working days.</p><p>Drinkware is light for its size and sells on repeat, because people buy a second one as a gift. It photographs cleanly and needs almost no explanation in a listing.</p>",
    rule: "drinkware" },
  { handle: "starter-boxes", title: "Wholesale Starter Boxes UK", menuLabel: "Starter Boxes",
    body: "<p>The cheapest way to start reselling in the UK. Small mixed boxes chosen so a first-time reseller has a varied batch to list rather than fifty of one thing.</p><p>A Starter Box is really an experiment. Split it across two platforms, list everything the same week, and see what sells to your audience before you spend more. That is real data on your own buyers.</p>",
    rule: "starter-boxes" },
  { handle: "necklaces", title: "Wholesale Necklaces UK", menuLabel: "Necklaces",
    body: "<p>Wholesale Necklaces for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/jewellery-accessories\">Jewellery & Accessories</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "necklaces" },
  { handle: "earrings", title: "Wholesale Earrings UK", menuLabel: "Earrings",
    body: "<p>Wholesale Earrings for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/jewellery-accessories\">Jewellery & Accessories</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "earrings" },
  { handle: "bracelets", title: "Wholesale Bracelets UK", menuLabel: "Bracelets",
    body: "<p>Wholesale Bracelets for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/jewellery-accessories\">Jewellery & Accessories</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "bracelets" },
  { handle: "rings", title: "Wholesale Rings UK", menuLabel: "Rings",
    body: "<p>Wholesale Rings for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/jewellery-accessories\">Jewellery & Accessories</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "rings" },
  { handle: "jewellery-sets", title: "Wholesale Jewellery Sets UK", menuLabel: "Jewellery Sets",
    body: "<p>Wholesale Jewellery Sets for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/jewellery-accessories\">Jewellery & Accessories</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "jewellery-sets" },
  { handle: "jewellery-starter-box", title: "Jewellery Starter Box UK", menuLabel: "Jewellery Starter Box",
    body: "<p>Jewellery Starter Box for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/jewellery-accessories\">Jewellery & Accessories</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "jewellery-starter-box" },
  { handle: "fashion-bags", title: "Wholesale Fashion Bags UK", menuLabel: "Fashion Bags",
    body: "<p>Wholesale Fashion Bags for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/bags\">Bags</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "fashion-bags" },
  { handle: "handbags", title: "Wholesale Handbags UK", menuLabel: "Handbags",
    body: "<p>Wholesale Handbags for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/bags\">Bags</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "handbags" },
  { handle: "school-bags", title: "Wholesale School Bags UK", menuLabel: "School Bags",
    body: "<p>Wholesale School Bags for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/bags\">Bags</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "school-bags" },
  { handle: "wallets", title: "Wholesale Wallets UK", menuLabel: "Wallets",
    body: "<p>Wholesale Wallets for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/bags\">Bags</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "wallets" },
  { handle: "travel-bags", title: "Wholesale Travel Bags UK", menuLabel: "Travel Bags",
    body: "<p>Wholesale Travel Bags for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/bags\">Bags</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "travel-bags" },
  { handle: "womens-clothing", title: "Wholesale Women's Clothing UK", menuLabel: "Women's Clothing",
    body: "<p>Wholesale Women's Clothing for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/clothing\">Clothing</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "womens-clothing" },
  { handle: "casualwear", title: "Wholesale Casualwear UK", menuLabel: "Casualwear",
    body: "<p>Wholesale Casualwear for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/clothing\">Clothing</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "casualwear" },
  { handle: "knitwear", title: "Wholesale Knitwear UK", menuLabel: "Knitwear",
    body: "<p>Wholesale Knitwear for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/clothing\">Clothing</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "knitwear" },
  { handle: "seasonal-clothing", title: "Wholesale Seasonal Clothing UK", menuLabel: "Seasonal Clothing",
    body: "<p>Wholesale Seasonal Clothing for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/clothing\">Clothing</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "seasonal-clothing" },
  { handle: "mixed-clothing-packs", title: "Wholesale Mixed Clothing Packs UK", menuLabel: "Mixed Clothing Packs",
    body: "<p>Wholesale Mixed Clothing Packs for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/clothing\">Clothing</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "mixed-clothing-packs" },
  { handle: "perfumes", title: "Wholesale Perfumes UK", menuLabel: "Perfumes",
    body: "<p>Wholesale Perfumes for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/beauty-fragrance\">Beauty & Fragrance</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "perfumes" },
  { handle: "mini-perfumes", title: "Wholesale Mini Perfumes UK", menuLabel: "Mini Perfumes",
    body: "<p>Wholesale Mini Perfumes for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/beauty-fragrance\">Beauty & Fragrance</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "mini-perfumes" },
  { handle: "beauty-accessories", title: "Wholesale Beauty Accessories UK", menuLabel: "Beauty Accessories",
    body: "<p>Wholesale Beauty Accessories for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/beauty-fragrance\">Beauty & Fragrance</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "beauty-accessories" },
  { handle: "personal-care", title: "Wholesale Personal Care Products UK", menuLabel: "Personal Care",
    body: "<p>Wholesale Personal Care Products for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/beauty-fragrance\">Beauty & Fragrance</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "personal-care" },
  { handle: "fans", title: "Wholesale Fans UK", menuLabel: "Fans",
    body: "<p>Wholesale Fans for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/electronics\">Electronics & Gadgets</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "fans" },
  { handle: "speakers", title: "Wholesale Speakers UK", menuLabel: "Speakers",
    body: "<p>Wholesale Speakers for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/electronics\">Electronics & Gadgets</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "speakers" },
  { handle: "phone-accessories", title: "Wholesale Phone Accessories UK", menuLabel: "Phone Accessories",
    body: "<p>Wholesale Phone Accessories for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/electronics\">Electronics & Gadgets</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "phone-accessories" },
  { handle: "small-electronics", title: "Wholesale Small Electronics UK", menuLabel: "Small Electronics",
    body: "<p>Wholesale Small Electronics for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/electronics\">Electronics & Gadgets</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "small-electronics" },
  { handle: "home-gadgets", title: "Wholesale Home Gadgets UK", menuLabel: "Home Gadgets",
    body: "<p>Wholesale Home Gadgets for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/electronics\">Electronics & Gadgets</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "home-gadgets" },
  { handle: "kitchenware", title: "Wholesale Kitchenware UK", menuLabel: "Kitchenware",
    body: "<p>Wholesale Kitchenware for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/home-lifestyle\">Home & Lifestyle</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "kitchenware" },
  { handle: "home-accessories", title: "Wholesale Home Accessories UK", menuLabel: "Home Accessories",
    body: "<p>Wholesale Home Accessories for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/home-lifestyle\">Home & Lifestyle</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "home-accessories" },
  { handle: "humidifiers", title: "Wholesale Humidifiers UK", menuLabel: "Humidifiers",
    body: "<p>Wholesale Humidifiers for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/home-lifestyle\">Home & Lifestyle</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "humidifiers" },
  { handle: "storage", title: "Wholesale Storage Products UK", menuLabel: "Storage",
    body: "<p>Wholesale Storage Products for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/home-lifestyle\">Home & Lifestyle</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "storage" },
  { handle: "lifestyle-products", title: "Wholesale Lifestyle Products UK", menuLabel: "Lifestyle Products",
    body: "<p>Wholesale Lifestyle Products for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/home-lifestyle\">Home & Lifestyle</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "lifestyle-products" },
  { handle: "school-shoes", title: "Wholesale School Shoes UK", menuLabel: "School Shoes",
    body: "<p>Wholesale School Shoes for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/kids-school\">Kids & School</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "school-shoes" },
  { handle: "kids-accessories", title: "Wholesale Kids Accessories UK", menuLabel: "Kids Accessories",
    body: "<p>Wholesale Kids Accessories for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/kids-school\">Kids & School</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "kids-accessories" },
  { handle: "toys-games", title: "Wholesale Toys & Games UK", menuLabel: "Toys & Games",
    body: "<p>Wholesale Toys & Games for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/kids-school\">Kids & School</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "toys-games" },
  { handle: "feeding-sets", title: "Wholesale Feeding Sets UK", menuLabel: "Feeding Sets",
    body: "<p>Wholesale Feeding Sets for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/kids-school\">Kids & School</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "feeding-sets" },
  { handle: "tumblers", title: "Wholesale Tumblers UK", menuLabel: "Tumblers",
    body: "<p>Wholesale Tumblers for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/drinkware\">Drinkware</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "tumblers" },
  { handle: "cups", title: "Wholesale Cups UK", menuLabel: "Cups",
    body: "<p>Wholesale Cups for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/drinkware\">Drinkware</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "cups" },
  { handle: "bottles", title: "Wholesale Bottles UK", menuLabel: "Bottles",
    body: "<p>Wholesale Bottles for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/drinkware\">Drinkware</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "bottles" },
  { handle: "travel-cups", title: "Wholesale Travel Cups UK", menuLabel: "Travel Cups",
    body: "<p>Wholesale Travel Cups for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/drinkware\">Drinkware</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "travel-cups" },
  { handle: "boutique-starter-box", title: "Boutique Starter Box UK", menuLabel: "Boutique Starter Box",
    body: "<p>Boutique Starter Box for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/starter-boxes\">Starter Boxes</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "boutique-starter-box" },
  { handle: "mixed-product-starter-box", title: "Mixed Product Starter Box UK", menuLabel: "Mixed Product Starter Box",
    body: "<p>Mixed Product Starter Box for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/starter-boxes\">Starter Boxes</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "mixed-product-starter-box" },
  { handle: "mixed-branded-jewellery-box", title: "Mixed Branded Jewellery Box UK", menuLabel: "Mixed Branded Jewellery Box",
    body: "<p>Mixed Branded Jewellery Box for UK resellers, sold in small packs and dispatched from the UK in 3 working days.</p><p>Part of our <a href=\"/collections/starter-boxes\">Starter Boxes</a> range. Minimum order quantities are shown on every product.</p>",
    rule: "mixed-branded-jewellery-box" },
  { handle: "best-sellers", title: "Best Selling Wholesale Products UK", menuLabel: "Best Sellers",
    body: "<p>The wholesale packs our resellers reorder most often. If you are not sure what to buy first, buy from this page.</p><p>Reorder rate is the only honest measure of whether stock sells, because it means somebody made money on it and came back.</p>",
    rule: "best-sellers" },
  { handle: "new-arrivals", title: "New Wholesale Stock UK", menuLabel: "New Arrivals",
    body: "<p>The latest wholesale stock to land in our UK warehouse. New packs arrive most weeks and the newest are listed first.</p><p>Restocks are announced in the buyers community before they reach this page, and popular packs often clear the same day.</p>",
    rule: "new-arrivals" },
  { handle: "trending-now", title: "Trending Wholesale Products UK", menuLabel: "Trending Now",
    body: "<p>What is moving fastest across the shop right now, based on what resellers are actually ordering this month.</p><p>Trends move quickly. What is here today may be gone in a fortnight, which is the point of the page.</p>",
    rule: "trending-now" },
  { handle: "back-in-stock", title: "Wholesale Products Back in Stock UK", menuLabel: "Back in Stock",
    body: "<p>Packs that sold out and have now returned. These tend to go quickly the second time.</p><p>A product that sold out once has already proved there is demand for it.</p>",
    rule: "back-in-stock" },
  { handle: "selling-fast", title: "Wholesale Products Selling Fast UK", menuLabel: "Selling Fast",
    body: "<p>Low stock, high reorder rate. These are the packs clearing quickest right now.</p><p>Stock levels here change daily. If something is on this page and you want it, do not wait on it.</p>",
    rule: "selling-fast" },
  { handle: "deal-drops", title: "Wholesale Deal Drops UK", menuLabel: "Deal Drops",
    body: "<p>Reduced packs and clearance lines, while they last. Announced in the buyers community first.</p><p>Deal drops are one-off buys rather than permanent lines, so they are not restocked once they go.</p>",
    rule: "deal-drops" },
  { handle: "under-50", title: "Wholesale Products Under £50 UK", menuLabel: "Under £50",
    body: "<p>Wholesale packs under £50, for testing a category without a big first order.</p><p>The cheapest honest way to find out whether a product sells to your audience before you commit to it.</p>",
    rule: { priceMax: 50 } },
  { handle: "under-100", title: "Wholesale Products Under £100 UK", menuLabel: "Under £100",
    body: "<p>Wholesale packs under £100, shipped from the UK in 3 working days.</p><p>Enough range to fill a small shop without tying up your budget in one line.</p>",
    rule: { priceMax: 100 } },
  { handle: "low-moq", title: "Low MOQ Wholesale UK", menuLabel: "Low MOQ Wholesale",
    body: "<p>Wholesale products with the smallest minimum order quantities in the shop.</p><p>Low minimums exist so you can spread a budget across several products rather than gamble it on one.</p>",
    rule: "low-moq" },
  { handle: "low-cost-to-resell", title: "Low-Cost Wholesale Products to Resell UK", menuLabel: "Low-Cost Products to Resell",
    body: "<p>The lowest cost-per-unit wholesale products we stock, for resellers working to a tight budget.</p><p>A low unit cost means a smaller loss if a product does not move, which matters more than margin when you are starting.</p>",
    rule: "low-cost" },
  { handle: "higher-margin", title: "Higher Margin Wholesale Products UK", menuLabel: "High-Profit-Potential Products",
    body: "<p>Wholesale products with a wider gap between the trade price and typical UK retail.</p><p>A wider gap gives you more room to price competitively and still make something. It is not a promise of profit: what you actually make depends on your listing quality, your pricing and demand on the day. Nothing here is guaranteed.</p>",
    rule: "higher-margin" },
  { handle: "best-for-vinted", title: "Wholesale Products to Sell on Vinted UK", menuLabel: "Best for Vinted",
    body: "<p>Wholesale products suited to Vinted, the UK fashion resale platform.</p><p>Vinted buyers are browsing in a fashion mindset and buying at impulse prices. These products fit that. Results still depend on your listing quality, your pricing and demand.</p>",
    rule: "platform-vinted" },
  { handle: "best-for-ebay", title: "Wholesale Products to Sell on eBay UK", menuLabel: "Best for eBay",
    body: "<p>Wholesale products suited to eBay, where buyers search by product name.</p><p>eBay rewards accurate titles and specifics over styling. These are products people look for by name. Results depend on your listing and pricing.</p>",
    rule: "platform-ebay" },
  { handle: "best-for-tiktok-shop", title: "Wholesale Products to Sell on TikTok Shop UK", menuLabel: "Best for TikTok Shop",
    body: "<p>Wholesale products suited to TikTok Shop, where anything demonstrable sells.</p><p>If you can show it working in fifteen seconds, it belongs here. Results depend on your content, your pricing and demand.</p>",
    rule: "platform-tiktok" },
  { handle: "dropshipping", title: "Dropshipping Products UK, No Minimum Order", menuLabel: "Dropshipping Products",
    body: "<p>Products you can order one at a time. No pack, no minimum order quantity, dispatched from our UK warehouse in 3 working days.</p><p>Dropshipping suits you if you would rather list first and buy once something sells. Everything here ships from us in the UK, so your customer gets the same 3 working day delivery.</p>",
    rule: "dropship" },
  { handle: "back-to-school", title: "Wholesale Back to School Products UK", menuLabel: "Back to School",
    body: "<p>Wholesale school bags, shoes, stationery and kit for the back-to-school run.</p><p>Demand climbs from July and peaks in the fortnight before term. Buy early: this is the one category where late stock is dead stock.</p>",
    rule: "back-to-school" },
  { handle: "winter-essentials", title: "Wholesale Winter Essentials UK", menuLabel: "Winter Essentials",
    body: "<p>Wholesale knitwear, warmers and cold-weather lines for the UK winter.</p><p>Winter lines carry from October to February, with gifting lifting the whole category through December.</p>",
    rule: "winter-essentials" },
  { handle: "summer-essentials", title: "Wholesale Summer Essentials UK", menuLabel: "Summer Essentials",
    body: "<p>Wholesale summer lines: lightweight fashion, drinkware, fans and holiday accessories.</p><p>British summer buying is weather-driven and spiky. Hold a little back rather than listing everything in the first warm week.</p>",
    rule: "summer-essentials" },
];

/* ------------------------------------------------------------------ */
/* 3. NAVIGATION MENUS                                                  */
/*                                                                      */
/* Only the short menu label lives here. The long SEO title is already   */
/* on the collection itself and is what becomes the page's H1, so the    */
/* two never have to be kept in step by hand.                           */
/*                                                                      */
/* The labels are not written out again below either: they come from     */
/* menuLabel on the COLLECTIONS list above, so renaming a category is a  */
/* one-line change that updates the menu with it.                       */
/* ------------------------------------------------------------------ */

const MENUS = [
  {
    handle: 'shop-menu',
    title: 'Shop menu',
    items: [
      { catalog: true, label: 'All Products' },
      { handle: 'new-arrivals' },
      { handle: 'best-sellers' },
      { handle: 'jewellery-accessories', children: ['necklaces', 'earrings', 'bracelets', 'rings', 'jewellery-sets', 'jewellery-starter-box'] },
      { handle: 'bags', children: ['fashion-bags', 'handbags', 'school-bags', 'wallets', 'travel-bags'] },
      { handle: 'clothing', children: ['womens-clothing', 'casualwear', 'knitwear', 'seasonal-clothing', 'mixed-clothing-packs'] },
      { handle: 'beauty-fragrance', children: ['perfumes', 'mini-perfumes', 'beauty-accessories', 'personal-care'] },
      { handle: 'electronics', children: ['fans', 'speakers', 'phone-accessories', 'small-electronics', 'home-gadgets'] },
      { handle: 'home-lifestyle', children: ['kitchenware', 'home-accessories', 'humidifiers', 'storage', 'lifestyle-products'] },
      { handle: 'kids-school', children: ['school-bags', 'school-shoes', 'kids-accessories', 'toys-games', 'feeding-sets'] },
      { handle: 'drinkware', children: ['tumblers', 'cups', 'bottles', 'travel-cups'] },
      { handle: 'starter-boxes', children: ['jewellery-starter-box', 'boutique-starter-box', 'mixed-product-starter-box', 'mixed-branded-jewellery-box'] },
      { handle: 'dropshipping' },
    ],
  },
  {
    handle: 'shop-by-need',
    title: 'Shop by need',
    items: [
      { handle: 'under-50' },
      { handle: 'under-100' },
      { handle: 'low-moq' },
      { handle: 'low-cost-to-resell' },
      { handle: 'higher-margin' },
      { handle: 'best-for-vinted' },
      { handle: 'best-for-ebay' },
      { handle: 'best-for-tiktok-shop' },
    ],
  },
  {
    handle: 'whats-moving',
    title: 'What is moving',
    items: [
      { handle: 'trending-now' },
      { handle: 'back-in-stock' },
      { handle: 'selling-fast' },
      { handle: 'deal-drops' },
    ],
  },
  {
    handle: 'seasonal',
    title: 'Seasonal',
    items: [
      { handle: 'back-to-school' },
      { handle: 'winter-essentials' },
      { handle: 'summer-essentials' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 4. PRODUCTS - realistic demo data, swap for real stock any time.    */
/* ------------------------------------------------------------------ */

const img = (t) => `https://placehold.co/1200x1200/F7F6F2/101418/png?text=${encodeURIComponent(t)}`;

const PRODUCTS = [
  {
    handle: 'statement-hoop-earrings-pack-of-12',
    title: 'Statement Hoop Earrings - Pack of 12',
    body_html: '<p>A ready-to-list pack of 12 statement hoop earrings in mixed on-trend styles. Low MOQ, high repeat-buy potential, and a proven mover on Vinted and TikTok Shop.</p><p><strong>Pack contains:</strong> 12 pairs, mixed designs, gold and silver tone.</p>',
    product_type: 'Jewellery & Accessories',
    tags: 'jewellery-accessories,best-sellers,platform-vinted,platform-tiktok,moq-12',
    price: '18.00',
    qty: 60,
    alt: 'Pack of twelve mixed statement hoop earrings',
  },
  {
    handle: 'layered-chain-necklace-set',
    title: 'Layered Chain Necklace Set - Pack of 15',
    body_html: '<p>Fifteen layered chain necklaces per pack in a dainty, stacking style. A consistent top seller for resellers building a jewellery storefront.</p><p><strong>Pack contains:</strong> 15 necklaces in your chosen finish.</p>',
    product_type: 'Jewellery & Accessories',
    tags: 'jewellery-accessories,new-arrivals,platform-vinted,moq-15',
    price: '22.00',
    qty: 40,
    alt: 'Layered chain necklace set in gold finish',
    options: ['Gold', 'Silver', 'Rose Gold'],
    optionName: 'Finish',
  },
  {
    handle: 'wireless-earbuds-pack-of-6',
    title: 'Wireless Earbuds - Pack of 6',
    body_html: '<p>Six boxed wireless Bluetooth earbud sets per pack, ready to list. A strong eBay and TikTok Shop category with genuine repeat demand.</p><p><strong>Pack contains:</strong> 6 boxed sets with charging cases.</p>',
    product_type: 'Electronics',
    tags: 'electronics,new-arrivals,platform-ebay,platform-tiktok,moq-6',
    price: '54.00',
    qty: 30,
    alt: 'Pack of six boxed wireless earbud sets',
  },
  {
    handle: 'mini-ring-light-kit-pack-of-4',
    title: 'Mini Ring Light Kit - Pack of 4',
    body_html: '<p>Four compact ring light kits per pack, popular with content-creator buyers. Easy to demo on video, which makes it a natural TikTok Shop product.</p><p><strong>Pack contains:</strong> 4 kits with clips and USB cables.</p>',
    product_type: 'Electronics',
    tags: 'electronics,best-sellers,platform-ebay,platform-tiktok,dropship',
    price: '38.00',
    qty: 45,
    alt: 'Pack of four mini ring light kits',
  },
  {
    handle: 'oversized-knit-jumpers-pack-of-8',
    title: 'Oversized Knit Jumpers - Pack of 8 (Mixed Sizes)',
    body_html: '<p>Eight oversized knit jumpers per pack in mixed sizes, a season-round staple for fashion resellers on Vinted.</p><p><strong>Pack contains:</strong> 8 jumpers, sizes S-XL, mixed colours.</p>',
    product_type: 'Fashion',
    tags: 'fashion,platform-vinted,platform-marketplace,moq-8',
    price: '96.00',
    qty: 20,
    alt: 'Pack of eight oversized knit jumpers in mixed sizes',
  },
  {
    handle: 'scented-candle-trio-pack-of-10',
    title: 'Scented Candle Trio - Pack of 10',
    body_html: '<p>Ten scented candles per pack across three signature scents. A reliable Home &amp; Lifestyle seller that lifts sharply through gifting season.</p><p><strong>Pack contains:</strong> 10 candles across 3 scents.</p>',
    product_type: 'Home & Lifestyle',
    tags: 'home-lifestyle,best-sellers,platform-marketplace,platform-ebay,moq-10',
    price: '45.00',
    qty: 50,
    alt: 'Pack of ten scented candles across three scents',
  },
  {
    handle: 'reseller-starter-box-small',
    title: 'Reseller Starter Box - Small',
    body_html: '<p>The lowest-risk way to start: a small mixed pack across jewellery, accessories and lifestyle items, chosen to give a first-time reseller a fast, varied first listing batch.</p><p>Split it across two platforms to find out where your audience actually is.</p>',
    product_type: 'Starter Boxes',
    tags: 'starter-boxes,new-arrivals,platform-vinted,dropship',
    price: '50.00',
    qty: 80,
    alt: 'Small reseller starter box with mixed stock',
    options: ['Mixed', 'Jewellery focus'],
    optionName: 'Focus',
  },
  {
    handle: 'gbg-academy',
    title: 'GBG Academy',
    body_html:
      '<p>Six modules, direct feedback on your own listings and prices, and a private Skool community.</p>' +
      '<p>Your invite arrives by email the moment your payment goes through.</p>' +
      '<p><strong>Set the real price in Shopify admin before going live.</strong></p>',
    product_type: 'Academy',
    tags: 'academy',
    price: '297.00',
    digital: true,
    alt: 'GBG Academy, six modules and a private community',
  },
  {
    handle: 'reseller-starter-box-medium',
    title: 'Reseller Starter Box - Medium',
    body_html: '<p>A bigger first order spanning our top categories, for resellers who want more stock live on day one.</p><p>Ideal if you have already tested a small box and know which categories move for you.</p>',
    product_type: 'Starter Boxes',
    tags: 'starter-boxes,platform-vinted,moq-1',
    price: '85.00',
    qty: 35,
    alt: 'Medium reseller starter box with mixed stock',
  },
];

/* ------------------------------------------------------------------ */

let created = 0;
let skipped = 0;

async function doPages() {
  console.log('\n📄  PAGES');
  const existing = (await api('GET', '/pages.json?limit=250')).pages || [];
  const byHandle = new Map(existing.map((p) => [p.handle, p]));

  for (const [handle, title, template] of PAGES) {
    const found = byHandle.get(handle);
    if (found) {
      if (found.template_suffix !== template.replace(/^page\./, '')) {
        await api('PUT', `/pages/${found.id}.json`, {
          page: { id: found.id, template_suffix: template.replace(/^page\./, '') },
        });
        console.log(`   ↻ ${handle.padEnd(30)} existed - re-pointed at ${template}`);
      } else {
        console.log(`   · ${handle.padEnd(30)} already correct, skipped`);
        skipped++;
      }
      continue;
    }
    await api('POST', '/pages.json', {
      page: {
        title,
        handle,
        published: true,
        template_suffix: template.replace(/^page\./, ''),
        body_html: '',
      },
    });
    console.log(`   ✓ ${handle.padEnd(30)} created  →  /pages/${handle}`);
    created++;
    await sleep(300);
  }
}

async function doCollections() {
  console.log('\n📁  COLLECTIONS');
  const existing = (await api('GET', '/smart_collections.json?limit=250')).smart_collections || [];
  const custom = (await api('GET', '/custom_collections.json?limit=250')).custom_collections || [];
  const all = [...existing, ...custom];
  const handles = new Set(all.map((c) => c.handle));
  const byHandle = new Map(all.map((c) => [c.handle, c]));

  for (const c of COLLECTIONS) {
    const found = byHandle.get(c.handle);
    if (found) {
      const wanted = CATEGORY_HANDLES.has(c.handle) ? 'category' : null;
      if ((found.template_suffix || null) !== wanted) {
        await api('PUT', `/smart_collections/${found.id}.json`, {
          smart_collection: { id: found.id, template_suffix: wanted },
        });
        console.log(`   ↻ ${c.handle.padEnd(30)} existed - re-pointed at ${wanted || 'the default template'}`);
      } else {
        console.log(`   · ${c.handle.padEnd(30)} already exists, skipped`);
      }
      skipped++;
      continue;
    }

    /* Most collections fill themselves from a product tag. The price bands
       use Shopify's own price rule instead, so they stay correct when a price
       changes rather than needing a tag kept in sync by hand. */
    const rules =
      typeof c.rule === 'object' && c.rule.priceMax
        ? [{ column: 'variant_price', relation: 'less_than', condition: String(c.rule.priceMax) }]
        : [{ column: 'tag', relation: 'equals', condition: c.rule }];

    await api('POST', '/smart_collections.json', {
      smart_collection: {
        /* The title is the page's H1, so it carries the explicit SEO wording.
           The short menu label lives in the Navigation menu instead. */
        title: c.title,
        handle: c.handle,
        body_html: c.body,
        published: true,
        disjunctive: false,
        rules,
        sort_order: CATEGORY_HANDLES.has(c.handle) ? 'best-selling' : 'best-selling',
        template_suffix: CATEGORY_HANDLES.has(c.handle) ? 'category' : null,
      },
    });
    console.log(`   ✓ ${c.handle.padEnd(30)} created  →  /collections/${c.handle}`);
    created++;
    await sleep(300);
  }
}

async function doMenus() {
  console.log('\n🧭  NAVIGATION');

  // One lookup rather than one per link: the labels come from COLLECTIONS,
  // the ids from the shop.
  const labelOf = {};
  for (const c of COLLECTIONS) labelOf[c.handle] = c.menuLabel;

  const idOf = {};
  let cursor = null;
  do {
    const data = await gql(
      `query($cursor: String) {
         collections(first: 250, after: $cursor) {
           nodes { id handle }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { cursor }
    );
    for (const n of data.collections.nodes) idOf[n.handle] = n.id;
    cursor = data.collections.pageInfo.hasNextPage ? data.collections.pageInfo.endCursor : null;
  } while (cursor);

  const existing = {};
  const menuData = await gql(`{ menus(first: 50) { nodes { id handle title } } }`);
  for (const m of menuData.menus.nodes) existing[m.handle] = m;

  // Linking by collection id rather than by URL, so a link keeps working if a
  // collection is ever renamed.
  const missing = new Set();
  const toItem = (entry) => {
    if (entry.catalog) return { title: entry.label, type: 'CATALOG' };

    const id = idOf[entry.handle];
    if (!id) {
      missing.add(entry.handle);
      return null;
    }

    const item = {
      title: entry.label || labelOf[entry.handle] || entry.handle,
      type: 'COLLECTION',
      resourceId: id,
    };

    if (entry.children) {
      const kids = entry.children.map((h) => toItem({ handle: h })).filter(Boolean);
      if (kids.length) item.items = kids;
    }

    return item;
  };

  for (const menu of MENUS) {
    const items = menu.items.map(toItem).filter(Boolean);

    if (!items.length) {
      console.log(`   · ${menu.handle.padEnd(38)} skipped   (no collections exist yet)`);
      skipped++;
      continue;
    }

    // A menu the merchant may have hand-edited is never overwritten. Deleting
    // someone's navigation to recreate it is not a thing a setup script should
    // do quietly on a re-run.
    if (existing[menu.handle]) {
      if (!REPLACE_MENUS) {
        console.log(`   · ${menu.handle.padEnd(38)} exists    (run with --replace-menus to rebuild)`);
        skipped++;
        continue;
      }

      const res = await gql(
        `mutation($id: ID!, $title: String!, $handle: String!, $items: [MenuItemUpdateInput!]!) {
           menuUpdate(id: $id, title: $title, handle: $handle, items: $items) {
             menu { handle }
             userErrors { field message }
           }
         }`,
        { id: existing[menu.handle].id, title: menu.title, handle: menu.handle, items }
      );
      const errs = res.menuUpdate.userErrors;
      if (errs.length) throw new Error(`${menu.handle}: ${errs.map((e) => e.message).join('; ')}`);
      console.log(`   ✓ ${menu.handle.padEnd(38)} rebuilt   (${items.length} top-level)`);
      created++;
      await sleep(400);
      continue;
    }

    const res = await gql(
      `mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
         menuCreate(title: $title, handle: $handle, items: $items) {
           menu { handle }
           userErrors { field message }
         }
       }`,
      { title: menu.title, handle: menu.handle, items }
    );
    const errs = res.menuCreate.userErrors;
    if (errs.length) throw new Error(`${menu.handle}: ${errs.map((e) => e.message).join('; ')}`);
    console.log(`   ✓ ${menu.handle.padEnd(38)} created   (${items.length} top-level)`);
    created++;
    await sleep(400);
  }

  if (missing.size) {
    console.log(
      `\n   Left out of the menus, because no such collection exists yet:\n` +
        `   ${[...missing].join(', ')}`
    );
  }
}

async function doProducts() {
  console.log('\n📦  PRODUCTS');
  const existing = (await api('GET', '/products.json?limit=250&fields=handle')).products || [];
  const handles = new Set(existing.map((p) => p.handle));

  for (const p of PRODUCTS) {
    if (handles.has(p.handle)) {
      console.log(`   · ${p.handle.padEnd(38)} already exists, skipped`);
      skipped++;
      continue;
    }

    const variants = p.options
      ? p.options.map((o) => ({
          option1: o,
          price: p.price,
          inventory_management: 'shopify',
          inventory_quantity: Math.round(p.qty / p.options.length),
          requires_shipping: true,
          taxable: true,
        }))
      : [
          {
            option1: 'Default Title',
            price: p.price,
            /* The Academy is access, not a parcel: no stock to count and
               nothing to post, so Shopify must not ask for an address. */
            inventory_management: p.digital ? null : 'shopify',
            inventory_quantity: p.digital ? undefined : p.qty,
            requires_shipping: !p.digital,
            taxable: true,
          },
        ];

    await api('POST', '/products.json', {
      product: {
        title: p.title,
        handle: p.handle,
        body_html: p.body_html,
        vendor: 'GBG Wholesale Hub',
        product_type: p.product_type,
        tags: p.tags,
        status: 'active',
        published: true,
        options: p.options ? [{ name: p.optionName, values: p.options }] : undefined,
        variants,
        images: [{ src: img(p.title.split(' - ')[0].trim()), alt: p.alt }],
      },
    });
    console.log(`   ✓ ${p.handle.padEnd(38)} created  →  /products/${p.handle}`);
    created++;
    await sleep(500);
  }
}

/* ------------------------------------------------------------------ */

(async () => {
  console.log(`\nGBG store setup  →  ${SHOP}`);
  console.log('─'.repeat(64));

  try {
    const shop = await api('GET', '/shop.json?fields=name,myshopify_domain');
    console.log(`Connected to: ${shop.shop.name}`);
  } catch (e) {
    console.error(`\n✗ Could not connect.\n  ${e.message}\n`);
    process.exit(1);
  }

  try {
    await doPages();
    await doCollections();
    await doMenus();
    await doProducts();
  } catch (e) {
    console.error(`\n✗ Stopped early.\n  ${e.message}`);
    console.error(`\n  Nothing already created has been lost - fix the issue and run again.\n`);
    process.exit(1);
  }

  console.log('\n' + '─'.repeat(64));
  console.log(`Done.  ${created} created, ${skipped} already existed.`);
  console.log(`\nEvery link in the site should now resolve. Check a few:`);
  console.log(`   https://${SHOP}/pages/about`);
  console.log(`   https://${SHOP}/pages/academy`);
  console.log(`   https://${SHOP}/collections/starter-boxes`);
  console.log(`\nOne thing still needs doing by hand, because a theme setting`);
  console.log(`cannot be written from here: open the theme editor, click Header,`);
  console.log(`and set "Menu to show" to Shop menu.\n`);
})();
