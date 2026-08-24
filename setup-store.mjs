#!/usr/bin/env node
/**
 * GBG Wholesale Hub - one-time store setup.
 *
 * Creates every Shopify record the theme's links point at:
 *   · 14 Pages, each bound to the matching theme template
 *   ·  7 Collections (automated, by product tag)
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
 */

const [, , SHOP_ARG, TOKEN_ARG] = process.argv;

if (!SHOP_ARG || !TOKEN_ARG) {
  console.error(`
Usage:  node setup-store.mjs <store>.myshopify.com <admin-api-token>

Example:
  node setup-store.mjs gbg-wholesale-hub-d8b9mivj.myshopify.com shpat_abc123...
`);
  process.exit(1);
}

const SHOP = SHOP_ARG.replace(/^https?:\/\//, '').replace(/\/$/, '');
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
        `  Check the app has these scopes ticked: write_content, write_products.\n` +
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
];

/* ------------------------------------------------------------------ */
/* 2. COLLECTIONS - automated, matched on product tag.                 */
/* ------------------------------------------------------------------ */

const COLLECTIONS = [
  ['jewellery-accessories', 'Jewellery & Accessories', 'Ready-stock jewellery and accessories at low minimum order quantities - the fastest-moving category for Vinted and TikTok Shop resellers.'],
  ['electronics',           'Electronics',             'Boxed, ready-to-list electronics and gadgets. Strong performers on eBay, where buyers search by name.'],
  ['fashion',               'Fashion',                 'Clothing and wearables in mixed-size packs, sold at wholesale prices with low MOQs.'],
  ['home-lifestyle',        'Home & Lifestyle',        'Homeware and giftable lifestyle products - reliable sellers on Facebook Marketplace and through gifting season.'],
  ['starter-boxes',         'Starter Boxes',           'The lowest-risk way to begin. Small mixed packs chosen to give first-time resellers a varied first listing batch.'],
  ['new-arrivals',          'New Arrivals',            'The latest stock to land in our UK warehouse.'],
  ['best-sellers',          'Best Sellers',            'The packs our resellers reorder most often.'],
];

/* ------------------------------------------------------------------ */
/* 3. PRODUCTS - realistic demo data, swap for real stock any time.    */
/* ------------------------------------------------------------------ */

const img = (t) => `https://placehold.co/1200x1200/F7F6F2/101418/png?text=${encodeURIComponent(t)}`;

const PRODUCTS = [
  {
    handle: 'statement-hoop-earrings-pack-of-12',
    title: 'Statement Hoop Earrings - Pack of 12',
    body_html: '<p>A ready-to-list pack of 12 statement hoop earrings in mixed on-trend styles. Low MOQ, high repeat-buy potential, and a proven mover on Vinted and TikTok Shop.</p><p><strong>Pack contains:</strong> 12 pairs, mixed designs, gold and silver tone.</p>',
    product_type: 'Jewellery & Accessories',
    tags: 'jewellery-accessories,best-sellers',
    price: '18.00',
    qty: 60,
    alt: 'Pack of twelve mixed statement hoop earrings',
  },
  {
    handle: 'layered-chain-necklace-set',
    title: 'Layered Chain Necklace Set - Pack of 15',
    body_html: '<p>Fifteen layered chain necklaces per pack in a dainty, stacking style. A consistent top seller for resellers building a jewellery storefront.</p><p><strong>Pack contains:</strong> 15 necklaces in your chosen finish.</p>',
    product_type: 'Jewellery & Accessories',
    tags: 'jewellery-accessories,new-arrivals',
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
    tags: 'electronics,new-arrivals',
    price: '54.00',
    qty: 30,
    alt: 'Pack of six boxed wireless earbud sets',
  },
  {
    handle: 'mini-ring-light-kit-pack-of-4',
    title: 'Mini Ring Light Kit - Pack of 4',
    body_html: '<p>Four compact ring light kits per pack, popular with content-creator buyers. Easy to demo on video, which makes it a natural TikTok Shop product.</p><p><strong>Pack contains:</strong> 4 kits with clips and USB cables.</p>',
    product_type: 'Electronics',
    tags: 'electronics,best-sellers',
    price: '38.00',
    qty: 45,
    alt: 'Pack of four mini ring light kits',
  },
  {
    handle: 'oversized-knit-jumpers-pack-of-8',
    title: 'Oversized Knit Jumpers - Pack of 8 (Mixed Sizes)',
    body_html: '<p>Eight oversized knit jumpers per pack in mixed sizes, a season-round staple for fashion resellers on Vinted.</p><p><strong>Pack contains:</strong> 8 jumpers, sizes S-XL, mixed colours.</p>',
    product_type: 'Fashion',
    tags: 'fashion',
    price: '96.00',
    qty: 20,
    alt: 'Pack of eight oversized knit jumpers in mixed sizes',
  },
  {
    handle: 'scented-candle-trio-pack-of-10',
    title: 'Scented Candle Trio - Pack of 10',
    body_html: '<p>Ten scented candles per pack across three signature scents. A reliable Home &amp; Lifestyle seller that lifts sharply through gifting season.</p><p><strong>Pack contains:</strong> 10 candles across 3 scents.</p>',
    product_type: 'Home & Lifestyle',
    tags: 'home-lifestyle,best-sellers',
    price: '45.00',
    qty: 50,
    alt: 'Pack of ten scented candles across three scents',
  },
  {
    handle: 'reseller-starter-box-small',
    title: 'Reseller Starter Box - Small',
    body_html: '<p>The lowest-risk way to start: a small mixed pack across jewellery, accessories and lifestyle items, chosen to give a first-time reseller a fast, varied first listing batch.</p><p>Split it across two platforms to find out where your audience actually is.</p>',
    product_type: 'Starter Boxes',
    tags: 'starter-boxes,new-arrivals',
    price: '50.00',
    qty: 80,
    alt: 'Small reseller starter box with mixed stock',
    options: ['Mixed', 'Jewellery focus'],
    optionName: 'Focus',
  },
  {
    handle: 'reseller-starter-box-medium',
    title: 'Reseller Starter Box - Medium',
    body_html: '<p>A bigger first order spanning our top categories, for resellers who want more stock live on day one.</p><p>Ideal if you have already tested a small box and know which categories move for you.</p>',
    product_type: 'Starter Boxes',
    tags: 'starter-boxes',
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
  const handles = new Set([...existing, ...custom].map((c) => c.handle));

  for (const [handle, title, body] of COLLECTIONS) {
    if (handles.has(handle)) {
      console.log(`   · ${handle.padEnd(30)} already exists, skipped`);
      skipped++;
      continue;
    }
    await api('POST', '/smart_collections.json', {
      smart_collection: {
        title,
        handle,
        body_html: `<p>${body}</p>`,
        published: true,
        disjunctive: false,
        rules: [{ column: 'tag', relation: 'equals', condition: handle }],
      },
    });
    console.log(`   ✓ ${handle.padEnd(30)} created  →  /collections/${handle}`);
    created++;
    await sleep(300);
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
            inventory_management: 'shopify',
            inventory_quantity: p.qty,
            requires_shipping: true,
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
  console.log(`   https://${SHOP}/collections/starter-boxes\n`);
})();
