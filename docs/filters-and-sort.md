# Filters and sort

Two systems are at work here, and it is worth knowing which does what before
changing anything.

## What the theme provides

**Quick filter pills**, above the products on every collection page. These are
plain links to Shopify's own tag filtering, so they work without JavaScript
and can be shared as URLs.

| Pill | Fills from |
| --- | --- |
| All | clears the filters |
| Dropship, order 1 | tag `dropship` |
| Low MOQ | tag `low-moq` |
| UK stock | tag `uk-stock` |
| Vinted / eBay / TikTok Shop / Facebook Marketplace | tags `platform-*` |
| Under £50 / Under £100 | their own collections, driven by price |

**Sort** comes from Shopify itself and needs no setup. The dropdown already
offers Featured, Best selling, Alphabetical, Price low to high, Price high to
low, and Date. That covers every option in the brief.

## What has to be switched on in the admin

The full filter panel, the one with checkboxes and result counts, is powered
by Shopify's free **Search & Discovery** app. The theme renders whatever is
configured there. Install it, then open **Filters**.

Add these:

| Filter to add | Gives you |
| --- | --- |
| Availability | In stock / Out of stock |
| Price | The price range slider |
| Product type | Filter by category inside a demand collection: Jewellery, Bags, Clothing and so on |
| Product tag | Everything else: MOQ, dropship, platform, UK stock |

**Product type is the one that matters most.** It is what lets someone inside
Best Sellers narrow to just the bags, which the brief asks for as a "Category"
filter. It works because every product carries its category as its product
type, so there is nothing extra to tag.

## Why price bands are collections rather than tags

Under £50 and Under £100 are their own collections, built on Shopify's price
rule. A tag would have to be added and removed by hand every time a price
changed, and it would be wrong the moment somebody forgot. The price rule is
never wrong.

## If a filter shows nothing

A filter only appears when products match it. An empty filter panel means the
products have not been tagged yet, not that the filter is broken. The tag for
each one is in the table above, and in `docs/navigation-menu.md`.
