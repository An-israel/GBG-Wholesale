# Demo catalogue — one-time setup in Shopify admin

The theme code is fully wired for a real catalogue (cart, filtering, search,
featured products, related products all work against live data). Creating
products and collections requires access to Shopify's Admin API/UI, which is
outside what a theme-file push can do — so this is the one manual step left
before the site is fully testable end to end. It's quick:

## 1. Import the demo products (2 minutes)

1. In Shopify admin: **Products → Import**.
2. Upload `gbg-demo-products.csv` from this folder.
3. Shopify will show a preview (8 products, a couple with variants) — click **Import products**.
4. Wait for the import to finish (Shopify emails you when done, usually under a minute).

This seeds 8 realistic placeholder products (branded stone-and-ink placeholder
images, real prices, some with variants) across every category the theme
expects, tagged so the collections below populate automatically. Swap in real
product photos/names/prices any time — no theme code changes needed.

## 2. Create the 7 collections (5 minutes)

Go to **Products → Collections → Create collection** and create each of the
following as an **Automated** collection with the condition **Product tag is
equal to** the tag shown. Using automated (smart) collections means every
future product just needs the right tag — no manual re-adding.

| Collection title | Handle (check this after saving — see note below) | Condition: tag equals |
|---|---|---|
| Jewellery & Accessories | `jewellery-accessories` | `jewellery-accessories` |
| Electronics | `electronics` | `electronics` |
| Fashion | `fashion` | `fashion` |
| Home & Lifestyle | `home-lifestyle` | `home-lifestyle` |
| Starter Boxes | `starter-boxes` | `starter-boxes` |
| New Arrivals | `new-arrivals` | `new-arrivals` |
| Best Sellers | `best-sellers` | `best-sellers` |

**Important — check the handle:** Shopify auto-generates a URL handle from
the title. For most of these it will already match the table above. After
saving each collection, scroll to **Search engine listing → Edit** and
confirm the handle matches exactly (especially for "Jewellery & Accessories"
and "Home & Lifestyle", where the `&` needs to become a plain hyphen). The
theme's navigation, footer, and homepage category tiles all link to these
exact URLs (`/collections/jewellery-accessories`, etc.) — if a handle doesn't
match, either edit it to match, or open the relevant section in the theme
editor and repoint that block's link.

## 3. Add a homepage image per collection (optional, 2 minutes)

Each collection's own settings page has an image field — add one and it will
automatically show on the homepage "Shop By Category" tiles and the
`/collections` list page.

## That's it

Once both steps are done: the homepage, header mega-menu, footer links, Shop
By Category tiles, Featured Products, search, and every "Shop" CTA across the
site will show real (placeholder) products and work exactly as they will with
final inventory — swapping in real products later is copy-and-photo work
only, never a code change.
