# GBG Wholesale Hub - Shopify Theme

A custom Shopify Online Store 2.0 theme for **GBG Wholesale Hub**, built from
Shopify's Skeleton theme. Every page, section and interactive feature is a
real, schema-driven Liquid section, editable from the theme editor. Nothing a
merchant would reasonably want to change is hardcoded.

## Brand

Taken from the supplied brand identity, not invented:

| Token | Value | Use |
| --- | --- | --- |
| Navy | `#001A3F` | Primary. Text, dark sections, primary buttons. |
| Amber | `#FFB303` | Secondary. The arrow in the logo, and the pointing here. |
| Amber tint | `#FFEBBC` | Soft highlight backgrounds, preorder flags. |
| Ink | `#121212` | Body copy. |
| Grey | `#565656` | Captions and meta. |
| Aqua | `#60FFEF` | Rare accent, used sparingly. |

Typeface is **Helvetica Neue** (Heavy, Bold, Regular). It ships on macOS and
iOS, so a large share of UK shoppers see the real thing; **Inter** loads from
Google Fonts as the cross-platform stand-in.

House style: British English, hyphens rather than em dashes, sentence case
headings, one reader addressed directly. Every section ends in a next step.

## Structure

- `layout/theme.liquid` - global shell, fonts, header/footer groups, cart drawer, search overlay, waitlist modal, WhatsApp float, analytics.
- `sections/` - every visual block. Global: header, footer, announcement bar. Reusable: hero, rich-text, routing-cards, numbered-steps, category-tiles, content-cards, image-banner, faq-accordion, testimonial-blocks, featured products (GBG best sellers). Page-specific: contact-form, academy-form, pricing-calculator, main-product, main-collection.
- `snippets/` - shared partials: icons, product card, price, cart items, FAQ item, brand lockup, product shipping facts, product guide link, analytics, meta tags.
- `templates/` - one JSON template per page, plus `index.json`, `product.json`, `collection.json`, `cart.json`, `search.json`, `404.json` and classic `templates/customers/*.liquid`.
- `assets/theme.css` + `assets/theme.js` - the design system and shared behaviour. Each feature also has a small focused module (`cart.js`, `predictive-search.js`, `product.js`, `collection.js`, `contact-form.js`, `pricing-calculator.js`, `header.js`, `waitlist-modal.js`).
- `config/settings_schema.json` - every editable theme setting.
- `setup-store.mjs` - one-time creation of the Page, Collection and Product records the theme's links expect.
- `seed-data/` - a demo product CSV, as an alternative to the script.

## How the Academy works

The Academy is an ordinary Shopify product, handle `gbg-academy`.

1. A visitor answers five questions on `/pages/academy` and presses Join.
2. The answers travel as line item properties, so they appear on the order in
   the Shopify admin. No separate form, no app.
3. They pay at Shopify's normal checkout.
4. The order confirmation email carries the Skool invite. Edit that email
   under **Settings > Notifications > Order confirmation**.

The product is tagged `academy` so it stays out of the shop grids: it is
access, not stock. Set the real price in the Shopify admin. If the product is
missing or out of stock, the page shows a waiting list instead of a dead
button.

## Tracking

Theme settings under **Analytics and tracking** hold the GA4 measurement ID,
the Google Search Console verification code, and the TikTok and Meta pixel
IDs. Paste an ID and the tag loads; leave it blank and nothing is requested.

Covered from the theme: page views, product views, add to cart, traffic
source.

**Not** covered from the theme: checkout and purchase. Shopify blocks
third-party scripts on its checkout pages. Add those under **Settings >
Customer events**, or by installing the Google and TikTok sales channels.
Abandoned carts, checkout completion rate and repeat purchase behaviour are
already in Shopify's own analytics with no setup at all.

## Local development

```bash
npm install -g @shopify/cli
shopify theme dev --store=<your-store>.myshopify.com
```

## Checks

```bash
shopify theme check
```

Zero errors. The remaining warnings are expected: `RemoteAsset` on the
deliberate Google Fonts and analytics tags, and `ValidScopedCSSClass` /
`UndefinedObject` false positives for styles and objects that are always
present via globally rendered sections or customer-account context.

## Store records

Pages, collections and products are Shopify records, not theme files, so a
theme push cannot create them. Run `setup-store.mjs` once with an Admin API
token, or follow `seed-data/README.md` to do it by hand.
