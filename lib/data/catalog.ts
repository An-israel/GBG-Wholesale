/**
 * Seed catalogue — the storefront's data model and offline fallback.
 *
 * The live site reads these tables from Supabase; when no Supabase connection
 * is configured (local preview, CI build) the data layer falls back to this
 * catalogue so every page renders with realistic, brand-voiced content on first
 * run (Part 20). Prices are integers in pence. Photography here uses neutral
 * placeholders; real product photos replace them via Admin → Products → Media.
 */
import type {
  Article,
  Category,
  Collection,
  Faq,
  FaqCategory,
  LearningPillar,
  PolicyPage,
  Product,
  ProductImage,
  StockStatus,
  Suitability,
  SuccessStory,
  Testimonial,
} from "@/types/domain";

const img = (id: string, alt: string, position: number, primary = false): ProductImage => ({
  storage_path: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`,
  alt_text: alt,
  position,
  is_primary: primary,
  blur_data_url: null,
});

function stockStatusFor(qty: number, threshold: number): StockStatus {
  if (qty <= 0) return "sold_out";
  if (qty <= threshold) return "low_stock";
  return "in_stock";
}

// --------------------------------------------------------------------------
// Categories (6)
// --------------------------------------------------------------------------
export const categories: Category[] = [
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Hair clips, bag charms and the small pieces that sell fast.",
    intro_copy:
      "Low-cost, high-turnover accessories are the easiest place to start. Small parcels, low minimums, quick to photograph and quick to sell.",
    who_it_suits: "Perfect for a first order — light, affordable and easy to ship.",
    icon: "sparkles",
    sort_order: 1,
  },
  {
    id: "cat-jewellery",
    name: "Jewellery",
    slug: "jewellery",
    description: "Everyday gold-tone and stainless pieces that hold their finish.",
    intro_copy:
      "Jewellery carries strong margins and repeat sales. These are the pieces buyers come back for once they trust the quality.",
    who_it_suits: "Great for resellers who want a higher price point per item.",
    icon: "gem",
    sort_order: 2,
  },
  {
    id: "cat-beauty",
    name: "Beauty",
    slug: "beauty",
    description: "Tools and minis that bundle beautifully.",
    intro_copy:
      "Beauty tools and minis are ideal bundle-builders. Mix and match to hit a price point your customers love.",
    who_it_suits: "Ideal for TikTok Shop sellers building themed sets.",
    icon: "heart",
    sort_order: 3,
  },
  {
    id: "cat-home",
    name: "Home & Living",
    slug: "home-living",
    description: "Small home pieces with a premium feel.",
    intro_copy:
      "Home items photograph well and make strong gift bundles. Slightly larger parcels, but a higher basket value.",
    who_it_suits: "Suits sellers ready for a slightly higher MOQ.",
    icon: "home",
    sort_order: 4,
  },
  {
    id: "cat-bags",
    name: "Bags & Purses",
    slug: "bags-purses",
    description: "Structured bags and purses that anchor a store.",
    intro_copy:
      "A good bag anchors your storefront and lifts your whole basket. Fewer units, higher value, strong repeat interest.",
    who_it_suits: "For sellers ready to carry a hero product.",
    icon: "bag",
    sort_order: 5,
  },
  {
    id: "cat-seasonal",
    name: "Seasonal & Gifting",
    slug: "seasonal-gifting",
    description: "Time-limited pieces that move around key dates.",
    intro_copy:
      "Seasonal stock sells hard in short windows. Buy early, list early, and let the calendar do the marketing.",
    who_it_suits: "For sellers who plan ahead around peak dates.",
    icon: "gift",
    sort_order: 6,
  },
];

// --------------------------------------------------------------------------
// Products
// --------------------------------------------------------------------------
type P = Partial<Product> & {
  name: string;
  slug: string;
  sku: string;
  category_slug: string;
  wholesale_price_pence: number;
  moq: number;
  pack_quantity: number;
  stock_quantity: number;
};

function product(p: P): Product {
  const low = p.low_stock_threshold ?? 5;
  return {
    id: `prod-${p.slug}`,
    status: "active",
    short_description: "",
    description_html: "",
    what_you_receive: "",
    who_it_suits: "",
    why_buy: "",
    compare_at_price_pence: null,
    suggested_retail_price_pence: null,
    mix_and_match_allowed: false,
    low_stock_threshold: low,
    stock_status: stockStatusFor(p.stock_quantity, low),
    suitability: [],
    is_featured: false,
    images: [],
    variants: [],
    faqs: [],
    related_slugs: [],
    related_article_slug: null,
    ...p,
  } as Product;
}

export const products: Product[] = [
  product({
    name: "Pearl Claw Hair Clips",
    slug: "pearl-claw-hair-clips",
    sku: "GBG-AC-001",
    category_slug: "accessories",
    short_description: "Matte claw clips with a pearl inlay. A reliable everyday seller.",
    description_html:
      "<p>These matte claw clips hold thick hair without slipping and photograph beautifully on a neutral background. A dependable first product with low outlay and quick turnover.</p>",
    what_you_receive: "A pack of 10 claw clips in mixed neutral tones, individually poly-bagged.",
    who_it_suits: "Beginners taking a first low-cost order, and resellers building bundles.",
    why_buy: "Light to ship, easy to photograph, and priced to move quickly.",
    materials: "Cellulose acetate with resin pearl detail",
    dimensions: "9cm",
    weight_grams: 220,
    care_instructions: "Wipe clean, keep away from direct heat.",
    box_contents: "10 × claw clips (mixed tones)",
    wholesale_price_pence: 1200,
    compare_at_price_pence: 1800,
    suggested_retail_price_pence: 400,
    moq: 5,
    pack_quantity: 10,
    mix_and_match_allowed: true,
    stock_quantity: 140,
    suitability: ["beginner_friendly", "reseller", "best_seller"] as Suitability[],
    processing_days_min: 1,
    processing_days_max: 2,
    is_featured: true,
    images: [
      img("photo-1522337660859-02fbefca4702", "Neutral pearl claw hair clips on a linen surface", 0, true),
      img("photo-1596462502278-27bfdc403348", "Close-up of a pearl claw clip", 1),
      img("photo-1512203492609-8f0f3f0f0f0f", "Flat lay of mixed-tone claw clips", 2),
    ],
    variants: [
      { id: "v-clip-cream", name: "Cream", sku: "GBG-AC-001-CR", hex_or_swatch_url: "#F3ECE0", price_delta_pence: 0, stock_quantity: 60, moq_override: null, is_active: true },
      { id: "v-clip-mocha", name: "Mocha", sku: "GBG-AC-001-MO", hex_or_swatch_url: "#8B6F52", price_delta_pence: 0, stock_quantity: 50, moq_override: null, is_active: true },
      { id: "v-clip-black", name: "Black", sku: "GBG-AC-001-BK", hex_or_swatch_url: "#1A1A1A", price_delta_pence: 0, stock_quantity: 30, moq_override: null, is_active: true },
    ],
    faqs: [
      { question: "Can I mix the colours across my minimum order?", answer: "Yes — this product allows mix and match, so your minimum can be spread across all three tones." },
      { question: "How are they packaged?", answer: "Each clip is individually poly-bagged, ready to list without extra prep." },
    ],
    related_slugs: ["satin-scrunchie-set", "gold-tone-hoop-earrings"],
    related_article_slug: "first-order-what-to-buy",
    video_url: "https://www.youtube.com/watch?v=placeholder",
  }),
  product({
    name: "Satin Scrunchie Set",
    slug: "satin-scrunchie-set",
    sku: "GBG-AC-002",
    category_slug: "accessories",
    short_description: "Soft satin scrunchies in a six-piece tonal set.",
    description_html: "<p>A gentle satin finish that's kind to hair and easy to bundle with clips for a themed set.</p>",
    what_you_receive: "6 satin scrunchies in a coordinated palette.",
    who_it_suits: "Bundle builders and gift-set sellers.",
    why_buy: "Tiny parcel, strong perceived value in a set.",
    materials: "Polyester satin",
    weight_grams: 90,
    box_contents: "6 × scrunchies",
    wholesale_price_pence: 900,
    suggested_retail_price_pence: 300,
    moq: 5,
    pack_quantity: 6,
    mix_and_match_allowed: true,
    stock_quantity: 4,
    low_stock_threshold: 6,
    suitability: ["beginner_friendly", "reseller"] as Suitability[],
    processing_days_min: 1,
    processing_days_max: 2,
    images: [
      img("photo-1595341888016-a392ef81b7de", "Tonal satin scrunchies arranged in a row", 0, true),
      img("photo-1611591437281-460bfbe1220a", "Close-up of satin scrunchie texture", 1),
      img("photo-1571781926291-c477ebfd024b", "Scrunchies styled with a hairbrush", 2),
    ],
    related_slugs: ["pearl-claw-hair-clips"],
  }),
  product({
    name: "Gold-Tone Hoop Earrings",
    slug: "gold-tone-hoop-earrings",
    sku: "GBG-JW-001",
    category_slug: "jewellery",
    short_description: "Lightweight hoops with a lasting gold-tone finish.",
    description_html: "<p>Everyday hoops that keep their colour. A jewellery staple with strong repeat sales.</p>",
    what_you_receive: "A single pair of gold-tone hoop earrings, boxed.",
    who_it_suits: "Resellers who want a higher price point per item.",
    why_buy: "Holds its finish, photographs bright, and customers reorder.",
    materials: "Stainless steel, gold-tone plating",
    dimensions: "30mm diameter",
    weight_grams: 15,
    care_instructions: "Keep dry, store in the pouch provided.",
    box_contents: "1 × pair hoop earrings, 1 × pouch",
    wholesale_price_pence: 250,
    suggested_retail_price_pence: 900,
    moq: 25,
    pack_quantity: 1,
    stock_quantity: 300,
    suitability: ["reseller", "best_seller"] as Suitability[],
    processing_days_min: 1,
    processing_days_max: 2,
    is_featured: true,
    images: [
      img("photo-1635767798638-3e25273a8236", "Gold-tone hoop earrings on a cream card", 0, true),
      img("photo-1611652022419-a9419f74343d", "Hoop earrings held to the light", 1),
      img("photo-1599643478518-a784e5dc4c8f", "Hoops styled on an ear", 2),
    ],
    related_slugs: ["stainless-pendant-necklace", "pearl-claw-hair-clips"],
    related_article_slug: "pricing-for-margin",
  }),
  product({
    name: "Stainless Pendant Necklace",
    slug: "stainless-pendant-necklace",
    sku: "GBG-JW-002",
    category_slug: "jewellery",
    short_description: "A dainty pendant that layers well and never tarnishes.",
    description_html: "<p>Waterproof stainless steel with a delicate pendant. A quiet best-seller for layering.</p>",
    what_you_receive: "1 × pendant necklace with an adjustable chain.",
    who_it_suits: "Resellers building a considered jewellery edit.",
    why_buy: "Waterproof, hypoallergenic, and reorders itself.",
    materials: "316L stainless steel",
    dimensions: "45cm + 5cm extender",
    weight_grams: 12,
    wholesale_price_pence: 320,
    compare_at_price_pence: 500,
    suggested_retail_price_pence: 1200,
    moq: 25,
    pack_quantity: 1,
    stock_quantity: 90,
    suitability: ["reseller"] as Suitability[],
    images: [
      img("photo-1611085583191-a3b181a88401", "Stainless pendant necklace on a marble surface", 0, true),
      img("photo-1599643477877-530eb83abc8e", "Pendant close-up", 1),
      img("photo-1506630448388-4e683c67ddb0", "Necklace styled on the neck", 2),
    ],
    related_slugs: ["gold-tone-hoop-earrings"],
  }),
  product({
    name: "Vegan Leather Card Holder",
    slug: "vegan-leather-card-holder",
    sku: "GBG-BG-001",
    category_slug: "bags-purses",
    short_description: "Slim card holder in a soft pebbled finish.",
    description_html: "<p>A tidy everyday card holder that makes a great add-on or standalone gift.</p>",
    what_you_receive: "1 × card holder with four card slots.",
    who_it_suits: "Sellers adding a practical, giftable line.",
    why_buy: "Useful, affordable and easy to bundle.",
    materials: "Vegan (PU) leather",
    dimensions: "10 × 7cm",
    weight_grams: 45,
    wholesale_price_pence: 480,
    suggested_retail_price_pence: 1400,
    moq: 10,
    pack_quantity: 1,
    stock_quantity: 60,
    suitability: ["reseller", "personal_use"] as Suitability[],
    images: [
      img("photo-1627123424574-724758594e93", "Pebbled vegan leather card holder", 0, true),
      img("photo-1590874103328-eac38a683ce7", "Card holder held in hand", 1),
      img("photo-1606813907291-d86efa9b94db", "Card holder flat lay", 2),
    ],
    related_slugs: ["structured-mini-tote"],
  }),
  product({
    name: "Structured Mini Tote",
    slug: "structured-mini-tote",
    sku: "GBG-BG-002",
    category_slug: "bags-purses",
    short_description: "A structured mini tote that anchors a storefront.",
    description_html: "<p>A hero bag with a premium feel and a price that still leaves room to sell.</p>",
    what_you_receive: "1 × structured mini tote with a detachable strap.",
    who_it_suits: "Sellers ready to carry a hero product.",
    why_buy: "Lifts your whole basket and draws repeat interest.",
    materials: "Vegan (PU) leather, metal hardware",
    dimensions: "24 × 18 × 10cm",
    weight_grams: 520,
    wholesale_price_pence: 1650,
    compare_at_price_pence: 2400,
    suggested_retail_price_pence: 3800,
    moq: 5,
    pack_quantity: 1,
    stock_quantity: 34,
    suitability: ["reseller", "new_arrival"] as Suitability[],
    is_featured: true,
    images: [
      img("photo-1584917865442-de89df76afd3", "Structured mini tote in taupe", 0, true),
      img("photo-1591561954557-26941169b49e", "Mini tote held on the shoulder", 1),
      img("photo-1548036328-c9fa89d128fa", "Mini tote detail of hardware", 2),
    ],
    variants: [
      { id: "v-tote-taupe", name: "Taupe", sku: "GBG-BG-002-TA", hex_or_swatch_url: "#B7A492", price_delta_pence: 0, stock_quantity: 18, moq_override: null, is_active: true },
      { id: "v-tote-black", name: "Black", sku: "GBG-BG-002-BK", hex_or_swatch_url: "#1A1A1A", price_delta_pence: 0, stock_quantity: 16, moq_override: null, is_active: true },
    ],
    related_slugs: ["vegan-leather-card-holder"],
    related_article_slug: "choosing-a-hero-product",
  }),
  product({
    name: "Facial Roller & Gua Sha Set",
    slug: "facial-roller-gua-sha-set",
    sku: "GBG-BE-001",
    category_slug: "beauty",
    short_description: "A boxed rose-quartz-look roller and gua sha set.",
    description_html: "<p>A giftable beauty tool set that bundles brilliantly and photographs premium.</p>",
    what_you_receive: "1 × facial roller, 1 × gua sha, 1 × gift box.",
    who_it_suits: "TikTok Shop sellers building themed self-care sets.",
    why_buy: "Boxed and gift-ready, with strong perceived value.",
    materials: "Resin stone-look, metal frame",
    weight_grams: 180,
    wholesale_price_pence: 620,
    suggested_retail_price_pence: 1800,
    moq: 10,
    pack_quantity: 1,
    stock_quantity: 75,
    suitability: ["reseller", "new_arrival"] as Suitability[],
    images: [
      img("photo-1570172619644-dfd03ed5d881", "Facial roller and gua sha in a gift box", 0, true),
      img("photo-1608248543803-ba4f8c70ae0b", "Gua sha stone close-up", 1),
      img("photo-1612817288484-6f916006741a", "Roller styled on a vanity", 2),
    ],
    related_slugs: ["mini-makeup-brush-set"],
  }),
  product({
    name: "Mini Makeup Brush Set",
    slug: "mini-makeup-brush-set",
    sku: "GBG-BE-002",
    category_slug: "beauty",
    short_description: "A five-piece travel brush set in a soft pouch.",
    description_html: "<p>Compact brushes with a soft synthetic bristle, ideal for travel bundles.</p>",
    what_you_receive: "5 × mini brushes, 1 × pouch.",
    who_it_suits: "Bundle builders and gift-set sellers.",
    why_buy: "Small, light and easy to combine into sets.",
    materials: "Synthetic bristles, aluminium ferrule",
    weight_grams: 70,
    wholesale_price_pence: 540,
    suggested_retail_price_pence: 1500,
    moq: 10,
    pack_quantity: 1,
    stock_quantity: 0,
    suitability: ["reseller"] as Suitability[],
    images: [
      img("photo-1596462502278-27bfdc403348", "Mini makeup brush set fanned out", 0, true),
      img("photo-1512496015851-a90fb38ba796", "Brush set in a soft pouch", 1),
      img("photo-1583241800698-e8ab01c85b1a", "Brushes held in hand", 2),
    ],
    related_slugs: ["facial-roller-gua-sha-set"],
  }),
  product({
    name: "Ceramic Trinket Dish",
    slug: "ceramic-trinket-dish",
    sku: "GBG-HM-001",
    category_slug: "home-living",
    short_description: "A small ceramic dish for rings and daily bits.",
    description_html: "<p>A tactile little dish that photographs premium and gifts well.</p>",
    what_you_receive: "1 × glazed ceramic trinket dish.",
    who_it_suits: "Sellers ready for a slightly higher MOQ.",
    why_buy: "Photographs beautifully and lifts a gift bundle.",
    materials: "Glazed ceramic",
    dimensions: "10cm",
    weight_grams: 210,
    wholesale_price_pence: 380,
    suggested_retail_price_pence: 1200,
    moq: 12,
    pack_quantity: 1,
    stock_quantity: 48,
    suitability: ["reseller", "personal_use"] as Suitability[],
    images: [
      img("photo-1578500494198-246f612d3b3d", "Glazed ceramic trinket dish with rings", 0, true),
      img("photo-1493663284031-b7e3aefcae8e", "Trinket dish on a bedside table", 1),
      img("photo-1616486338812-3dadae4b4ace", "Trinket dish detail", 2),
    ],
    related_slugs: ["scented-soy-candle"],
  }),
  product({
    name: "Scented Soy Candle",
    slug: "scented-soy-candle",
    sku: "GBG-HM-002",
    category_slug: "home-living",
    short_description: "A hand-poured soy candle in a frosted glass.",
    description_html: "<p>A warm, giftable candle with a clean soy burn. A strong seasonal performer.</p>",
    what_you_receive: "1 × 180g soy candle in frosted glass with lid.",
    who_it_suits: "Sellers building gift and seasonal bundles.",
    why_buy: "Giftable, seasonal, and repeat-friendly.",
    materials: "Soy wax, cotton wick, glass",
    weight_grams: 320,
    wholesale_price_pence: 550,
    suggested_retail_price_pence: 1600,
    moq: 12,
    pack_quantity: 1,
    stock_quantity: 66,
    suitability: ["reseller", "new_arrival"] as Suitability[],
    images: [
      img("photo-1602874801007-bd458bb1b8b6", "Frosted glass soy candle", 0, true),
      img("photo-1603006905003-be475563bc59", "Candle lit on a shelf", 1),
      img("photo-1608181831718-c9ffd8728e5e", "Candle with lid off", 2),
    ],
    related_slugs: ["ceramic-trinket-dish"],
  }),
  product({
    name: "Festive Gift Wrap Bundle",
    slug: "festive-gift-wrap-bundle",
    sku: "GBG-SE-001",
    category_slug: "seasonal-gifting",
    short_description: "A seasonal wrap bundle — buy early, list early.",
    description_html: "<p>A short-window seasonal line. Buy ahead of the date and let the calendar market it for you.</p>",
    what_you_receive: "3 × wrap rolls, 1 × ribbon, 10 × tags.",
    who_it_suits: "Sellers who plan around peak dates.",
    why_buy: "Sells hard in a short window with strong basket value.",
    materials: "Recyclable paper, cotton ribbon",
    weight_grams: 480,
    wholesale_price_pence: 720,
    suggested_retail_price_pence: 2000,
    moq: 6,
    pack_quantity: 1,
    stock_quantity: 3,
    low_stock_threshold: 5,
    suitability: ["reseller", "clearance"] as Suitability[],
    images: [
      img("photo-1512909006721-3d6018887383", "Festive gift wrap bundle with ribbon", 0, true),
      img("photo-1513885535751-8b9238bd345a", "Wrapped gifts styled", 1),
      img("photo-1481833761820-0509d3217039", "Wrap rolls and tags flat lay", 2),
    ],
    related_slugs: ["scented-soy-candle"],
  }),
  // A TBC-priced item shipped as draft with an admin flag, never a £0 storefront price.
  product({
    name: "Limited Beaded Bag Charm",
    slug: "limited-beaded-bag-charm",
    sku: "GBG-AC-003",
    category_slug: "accessories",
    status: "draft",
    short_description: "Pricing to be confirmed — held as a draft until finalised.",
    description_html: "<p>A limited beaded charm. Final price and MOQ are being confirmed, so it is held as a draft and not shown on the storefront.</p>",
    what_you_receive: "1 × beaded bag charm.",
    who_it_suits: "Resellers who want a statement add-on.",
    why_buy: "A distinctive finishing piece for bag listings.",
    wholesale_price_pence: 0,
    moq: 10,
    pack_quantity: 1,
    stock_quantity: 20,
    suitability: ["new_arrival"] as Suitability[],
    images: [img("photo-1602173574767-37ac01994b2a", "Beaded bag charm", 0, true)],
  }),
];

// --------------------------------------------------------------------------
// Collections (5)
// --------------------------------------------------------------------------
export const collections: Collection[] = [
  {
    id: "col-new",
    title: "New Arrivals",
    slug: "new-arrivals",
    description: "The latest pieces to land in the warehouse.",
    rule_type: "automatic",
    product_slugs: products.filter((p) => p.suitability.includes("new_arrival")).map((p) => p.slug),
    sort_order: 1,
  },
  {
    id: "col-best",
    title: "Best Sellers",
    slug: "best-sellers",
    description: "The pieces our buyers reorder most.",
    rule_type: "automatic",
    product_slugs: products.filter((p) => p.suitability.includes("best_seller")).map((p) => p.slug),
    sort_order: 2,
  },
  {
    id: "col-under-10",
    title: "Under £10",
    slug: "under-10",
    description: "Low-outlay pieces to test a listing without risk.",
    rule_type: "automatic",
    product_slugs: products.filter((p) => p.status === "active" && p.wholesale_price_pence > 0 && p.wholesale_price_pence < 1000).map((p) => p.slug),
    sort_order: 3,
  },
  {
    id: "col-beginner",
    title: "Beginner Bundles",
    slug: "beginner-bundles",
    description: "Hand-picked starting points for a first order.",
    rule_type: "automatic",
    product_slugs: products.filter((p) => p.suitability.includes("beginner_friendly")).map((p) => p.slug),
    sort_order: 4,
  },
  {
    id: "col-clearance",
    title: "Clearance",
    slug: "clearance",
    description: "Last-chance stock, sold as-seen.",
    rule_type: "automatic",
    product_slugs: products.filter((p) => p.suitability.includes("clearance")).map((p) => p.slug),
    sort_order: 5,
  },
];

// --------------------------------------------------------------------------
// Learning pillars (6) + a starter set of articles
// --------------------------------------------------------------------------
export const pillars: LearningPillar[] = [
  { id: "pil-1", title: "Understanding Product Business", slug: "understanding-product-business", description: "What a product business really is, and how the money works.", icon: "compass", sort_order: 1 },
  { id: "pil-2", title: "Choosing Products", slug: "choosing-products", description: "How to pick pieces that actually sell.", icon: "search", sort_order: 2 },
  { id: "pil-3", title: "Selling Platforms", slug: "selling-platforms", description: "Vinted, eBay, TikTok Shop and beyond.", icon: "store", sort_order: 3 },
  { id: "pil-4", title: "Selling Successfully", slug: "selling-successfully", description: "Photos, pricing and listings that convert.", icon: "trending-up", sort_order: 4 },
  { id: "pil-5", title: "Business Growth", slug: "business-growth", description: "Reordering, cashflow and scaling with care.", icon: "bar-chart", sort_order: 5 },
  { id: "pil-6", title: "Community and Success", slug: "community-and-success", description: "Learning alongside other sellers.", icon: "users", sort_order: 6 },
];

function article(a: Partial<Article> & { title: string; slug: string; pillar_slug: string; key_takeaway: string; next_action_label: string; next_action_href: string }): Article {
  return {
    id: `art-${a.slug}`,
    excerpt: a.excerpt ?? a.key_takeaway,
    body_html:
      a.body_html ??
      `<p>${a.key_takeaway}</p><p>This guide walks you through it in plain language, with a worked example you can copy. There is no jargon here — if a term is new, we explain it the first time it appears.</p><h2>Common mistakes</h2><ul><li>Buying too much of one thing before testing it.</li><li>Pricing to be the cheapest instead of pricing for margin.</li><li>Skipping good photos — they do most of the selling.</li></ul>`,
    reading_minutes: a.reading_minutes ?? 4,
    author_name: "Lami",
    is_recommended_for_beginners: a.is_recommended_for_beginners ?? false,
    status: "published",
    product_slugs: a.product_slugs ?? [],
    related_slugs: a.related_slugs ?? [],
    ...a,
  } as Article;
}

export const articles: Article[] = [
  article({ title: "What is wholesale, really?", slug: "what-is-wholesale-really", pillar_slug: "understanding-product-business", key_takeaway: "Wholesale means buying ready stock at a lower per-unit price so you can resell at a margin — no factory, no huge order.", next_action_label: "See beginner-friendly products", next_action_href: "/collections/beginner-bundles", is_recommended_for_beginners: true }),
  article({ title: "Margin, MOQ and unit cost in plain English", slug: "margin-moq-unit-cost", pillar_slug: "understanding-product-business", key_takeaway: "Unit cost is what one item costs you; margin is what's left after you sell it; MOQ is the smallest order you can place.", next_action_label: "Read: pricing for margin", next_action_href: "/learn/selling-successfully/pricing-for-margin", is_recommended_for_beginners: true }),
  article({ title: "Cashflow for a tiny product business", slug: "cashflow-basics", pillar_slug: "business-growth", key_takeaway: "Reinvest from sales, not savings. Only reorder what has already proven it sells.", next_action_label: "Browse best sellers", next_action_href: "/collections/best-sellers" }),
  article({ title: "Your first order: what to buy", slug: "first-order-what-to-buy", pillar_slug: "choosing-products", key_takeaway: "Start light and cheap. Accessories with low MOQs let you test demand without risking much.", next_action_label: "Shop accessories", next_action_href: "/collections/beginner-bundles", is_recommended_for_beginners: true, product_slugs: ["pearl-claw-hair-clips", "satin-scrunchie-set"] }),
  article({ title: "Choosing a hero product", slug: "choosing-a-hero-product", pillar_slug: "choosing-products", key_takeaway: "One higher-value hero product anchors your store and lifts your whole basket.", next_action_label: "See the mini tote", next_action_href: "/products/structured-mini-tote", product_slugs: ["structured-mini-tote"] }),
  article({ title: "Pricing for margin, not for cheapest", slug: "pricing-for-margin", pillar_slug: "selling-successfully", key_takeaway: "Being cheapest is a race to the bottom. Price for a healthy margin and sell the value.", next_action_label: "Shop jewellery", next_action_href: "/collections/best-sellers", product_slugs: ["gold-tone-hoop-earrings"] }),
  article({ title: "Photos that sell on a phone", slug: "photos-that-sell", pillar_slug: "selling-successfully", key_takeaway: "Natural light, a clean background and three angles will out-sell any filter.", next_action_label: "Start your first order", next_action_href: "/start-here", is_recommended_for_beginners: true }),
  article({ title: "Selling on TikTok Shop", slug: "selling-on-tiktok-shop", pillar_slug: "selling-platforms", key_takeaway: "Short, honest videos of the product in use convert better than polished ads.", next_action_label: "See new arrivals", next_action_href: "/collections/new-arrivals" }),
  article({ title: "Vinted and eBay basics", slug: "vinted-ebay-basics", pillar_slug: "selling-platforms", key_takeaway: "List consistently, respond fast, and let reviews build your store's trust.", next_action_label: "Browse the shop", next_action_href: "/shop" }),
];

// --------------------------------------------------------------------------
// FAQs
// --------------------------------------------------------------------------
export const faqCategories: FaqCategory[] = [
  { id: "fc-ordering", name: "Ordering", slug: "ordering", sort_order: 1 },
  { id: "fc-delivery", name: "Delivery", slug: "delivery", sort_order: 2 },
  { id: "fc-returns", name: "Returns", slug: "returns", sort_order: 3 },
  { id: "fc-account", name: "Account & Hub", slug: "account", sort_order: 4 },
];

export const faqs: Faq[] = [
  { id: "faq-1", category_slug: "ordering", question: "Do I need a business to buy?", answer_html: "<p>No. Anyone can buy — resellers and personal shoppers alike. There's no application to place an order.</p>", next_link_label: "Browse the shop", next_link_href: "/shop", is_published: true },
  { id: "faq-2", category_slug: "ordering", question: "What is an MOQ?", answer_html: "<p>MOQ is the minimum order quantity — the smallest number of units you can buy for that product. It's shown clearly on every product page.</p>", next_link_label: "Learn the basics", next_link_href: "/learn/understanding-product-business/margin-moq-unit-cost", is_published: true },
  { id: "faq-3", category_slug: "ordering", question: "Can I mix colours to hit the minimum?", answer_html: "<p>On products marked mix and match, yes — your minimum can be spread across variants. The product page tells you which rule applies.</p>", next_link_label: "See mix-and-match products", next_link_href: "/shop", is_published: true },
  { id: "faq-4", category_slug: "delivery", question: "How fast do you dispatch?", answer_html: "<p>Dispatch times are shown on each product and in our shipping policy. See the shipping page for current estimates.</p>", next_link_label: "Read shipping policy", next_link_href: "/shipping", is_published: true },
  { id: "faq-5", category_slug: "delivery", question: "Do you ship internationally?", answer_html: "<p>Yes, to selected countries. International buyers are responsible for any customs duties. Shipping is calculated at checkout.</p>", next_link_label: "Read shipping policy", next_link_href: "/shipping", is_published: true },
  { id: "faq-6", category_slug: "returns", question: "What is your returns policy?", answer_html: "<p>Our returns position is shown on the returns page. Clearance items are sold as-seen.</p>", next_link_label: "Read returns policy", next_link_href: "/returns", is_published: true },
  { id: "faq-7", category_slug: "account", question: "How do I unlock the Wholesale Hub?", answer_html: "<p>The Wholesale Hub unlocks after your first successful order. You'll get the link on your confirmation page and by email.</p>", next_link_label: "See how the Hub works", next_link_href: "/community", is_published: true },
  { id: "faq-8", category_slug: "account", question: "Can I track my order as a guest?", answer_html: "<p>Yes. Use Track Order with your order number and the email on the order.</p>", next_link_label: "Track an order", next_link_href: "/account/track", is_published: true },
];

// --------------------------------------------------------------------------
// Social proof (seeded unpublished so the real empty state ships — Part 20)
// --------------------------------------------------------------------------
export const successStories: SuccessStory[] = [
  { id: "st-1", customer_name: "Amara", headline: "From a first clip order to a steady side income", starting_point: "Had never sold anything online.", action_taken: "Started with one accessories order and listed on Vinted.", result: "Now reorders monthly and has a small repeat customer base.", lesson: "Start small, prove it sells, then reinvest.", platform: "Vinted", is_published: false, is_featured: false },
  { id: "st-2", customer_name: "Bola", headline: "A hero bag that lifted the whole store", starting_point: "Sold low-value items with thin margins.", action_taken: "Added the mini tote as a hero product.", result: "Average basket value rose and the store felt more premium.", lesson: "One hero product changes how customers see you.", platform: "TikTok Shop", is_published: false, is_featured: false },
  { id: "st-3", customer_name: "Chi", headline: "Turned seasonal stock into a peak-week push", starting_point: "Sold year-round with flat sales.", action_taken: "Planned ahead with seasonal gifting stock.", result: "A strong short-window spike around the key date.", lesson: "Buy early, list early, let the calendar sell.", platform: "eBay", is_published: false, is_featured: false },
];

export const testimonials: Testimonial[] = [
  { id: "tm-1", author_name: "Amara", quote: "The photos are so clear I barely had to edit my listings.", platform: "Vinted", rating: 5, is_published: false },
  { id: "tm-2", author_name: "Bola", quote: "Low minimums meant I could test without a big risk.", platform: "TikTok Shop", rating: 5, is_published: false },
  { id: "tm-3", author_name: "Chi", quote: "Fast dispatch, and the pieces held their finish.", platform: "eBay", rating: 5, is_published: false },
  { id: "tm-4", author_name: "Dami", quote: "The Learn guides answered everything I was afraid to ask.", platform: "Instagram", rating: 5, is_published: false },
  { id: "tm-5", author_name: "Efe", quote: "The Hub made me feel like I wasn't doing this alone.", platform: "TikTok Shop", rating: 5, is_published: false },
  { id: "tm-6", author_name: "Funmi", quote: "Reordering is simple and stock is honest about levels.", platform: "Vinted", rating: 5, is_published: false },
];

// --------------------------------------------------------------------------
// Policy pages (draft content, editable from admin)
// --------------------------------------------------------------------------
const draftNote = '<p><em>This is draft policy content, clearly marked for review. Final wording is being confirmed (PENDING_LAMI). Edit it in Admin → Content → Policy pages.</em></p>';

export const policyPages: PolicyPage[] = [
  { slug: "shipping", title: "Shipping", body_html: `${draftNote}<p>Orders are processed in 1–2 working days and dispatched next day, with delivery typically in 3–4 days (draft). International buyers are responsible for any customs duties.</p>`, last_reviewed_at: null, is_published: true },
  { slug: "returns", title: "Returns", body_html: `${draftNote}<p>Our current position (draft) is that we accept returns on faulty items only. Clearance items are non-refundable.</p>`, last_reviewed_at: null, is_published: true },
  { slug: "terms", title: "Terms & Conditions", body_html: `${draftNote}<p>These terms govern your use of the GBG Wholesale Hub. Final legal wording is being confirmed.</p>`, last_reviewed_at: null, is_published: true },
  { slug: "privacy", title: "Privacy & Cookies", body_html: `${draftNote}<p>We collect only the data needed to fulfil orders and provide support. You can request a copy or deletion of your data at any time.</p>`, last_reviewed_at: null, is_published: true },
  { slug: "cookies", title: "Cookies", body_html: `${draftNote}<p>We use necessary cookies to run the site and, with your consent, analytics and marketing cookies. Manage your choices from the cookie banner.</p>`, last_reviewed_at: null, is_published: true },
  { slug: "clearance-policy", title: "Clearance Policy", body_html: `${draftNote}<p>Clearance stock is sold as-seen and is non-refundable (draft).</p>`, last_reviewed_at: null, is_published: true },
];
