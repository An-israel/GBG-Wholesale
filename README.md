# GBG Wholesale Hub - Shopify Theme

A custom Shopify Online Store 2.0 theme for **GBG Wholesale Hub**, built from
Shopify's Skeleton theme. Every page, section, and interactive feature in the
build brief is implemented as a real, schema-driven Liquid section - fully
editable from the theme editor, nothing hardcoded that a merchant would
reasonably want to change.

## Structure

Standard OS2 layout:

- `layout/theme.liquid` - global HTML shell, fonts, header/footer groups, cart drawer, search overlay, waitlist modal, WhatsApp float.
- `sections/` - every visual block (global: header, footer, announcement bar; reusable: hero, rich-text, routing-cards, numbered-steps, category-tiles, faq-accordion, testimonial-blocks, etc.; page-specific: contact-form, pricing-calculator, main-product, main-collection).
- `snippets/` - shared partials (icons, product-card, price, cart items, FAQ item, DM-keyword note, social/payment icons).
- `templates/` - one JSON template per page in the brief (`page.about.json`, `page.start-here.json`, `page.community.json`, `page.faq.json`, `page.contact.json`, `page.learn*.json`, legal pages, etc.) plus `index.json`, `product.json`, `collection.json`, `cart.json`, `search.json`, `404.json`, and classic `templates/customers/*.liquid`.
- `assets/theme.css` + `assets/theme.js` - the shared design system (palette tokens, type scale, buttons, accordion, forms) and shared behaviour (reveal-on-scroll, accordions, focus trapping). Each feature also has its own small, focused JS module (`cart.js`, `predictive-search.js`, `product.js`, `collection.js`, `contact-form.js`, `pricing-calculator.js`, `header.js`, `waitlist-modal.js`).
- `config/settings_schema.json` - every editable theme setting (colors, WhatsApp/SYPB/Wholesale Hub links, trust stats, dispatch/warehouse/pricing info, founder's note, legal page bodies, social links).
- `seed-data/` - a demo product CSV + instructions for the one manual admin step (see below).

## Local development

```bash
npm install -g @shopify/cli   # already installed in this environment
shopify theme dev --store=<your-store>.myshopify.com
```

## Checks

```bash
shopify theme check
```

Runs clean with **zero errors** (only expected `RemoteAsset` warnings for the
intentional Google Fonts links, and a handful of `ValidScopedCSSClass`/
`UndefinedObject` false positives from styles/objects that are always present
via the globally-rendered header/cart-drawer sections or customer-account
context - see the handoff notes for details).

## One remaining manual step

Product and collection creation requires Shopify Admin access beyond what a
theme push can do. See **`seed-data/README.md`** for the two-step process
(CSV import + 7 collections) that makes the whole site - cart, search,
filtering, featured products - genuinely testable with demo data.

## Full documentation

See the handoff summary delivered with this build for: the complete
`[[TBC]]` punch-list, flagged content inconsistencies, and the Shopify Flow
automation that still needs configuring in Admin for the Wholesale Hub
auto-unlock.
