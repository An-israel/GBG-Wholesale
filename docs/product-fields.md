# Adding a product

Most of a GBG product page fills itself in from two things: the product's tags
and its price. Three fields are optional extras, and they need a one-off setup
before they appear on the product form.

## The tags do the work

Type these into the Tags box when adding a product. Each one changes the whole
site, not just one page.

| Tag | What it does |
| --- | --- |
| `moq-6` | Sells in sixes. Quantity box starts at 6, cards and the product page say so, and checkout is blocked below 6. Any number works. |
| `dropship` | Sells as single units. Amber badge on the card, appears on the Dropshipping page, and the minimum drops to 1. |
| `preorder` | Says the pack comes in on a batch and the date will be emailed. Shown before anyone pays. |
| `uk-stock` | Appears under the UK stock filter. |
| `platform-vinted` | Appears in Best for Vinted, and Vinted is listed under "where it tends to sell" on the product page. |
| `platform-ebay` | Same, for eBay. |
| `platform-tiktok` | Same, for TikTok Shop. |
| `platform-marketplace` | Same, for Facebook Marketplace. |
| `low-moq` | Appears in the Low MOQ collection. |
| `higher-margin` | Appears in the Higher Margin collection. |
| A category tag such as `bags` | Puts the product in that category. |
| A subcategory tag such as `handbags` | Puts it in that subcategory too. Use both. |

Also set the **product type** to the category name (Bags, Clothing, and so
on). That is what powers the "filter by category" option inside collections
like Best Sellers, and it saves tagging anything extra.

Price bands need nothing: Under £50 and Under £100 fill themselves from the
price.

## The three optional fields

These give the product page its "What is included", "Key features" and "Who
this may suit" blocks. Each one is hidden when empty, so a product without
them still looks finished.

They are Shopify **metafields**, and each needs defining once. After that they
appear as ordinary labelled boxes at the bottom of every product form.

Go to **Settings > Custom data > Products > Add definition** and create these
three, exactly as written:

| Name | Namespace and key | Type |
| --- | --- | --- |
| What is included | `custom.whats_included` | Multi-line text |
| Key features | `custom.key_features` | Single line text, **List of values** |
| Who this may suit | `custom.who_it_suits` | Multi-line text |

There is a fourth, only worth adding if stock is ever held somewhere other than
the usual warehouse:

| Name | Namespace and key | Type |
| --- | --- | --- |
| Stock location | `custom.stock_location` | Single line text |

Leave it empty and the page uses the warehouse location from theme settings.

**Namespace and key must match exactly.** `custom.whats_included` with an
underscore, not `custom.whatsIncluded` or `custom.whats-included`. If a block
does not appear on the product page, this is almost always why.

## What each field should say

**What is included** is the pack contents in plain words. "12 pairs of hoop
earrings, mixed designs, gold and silver tone." A buyer is deciding whether
this is one item or twelve, and the description usually does not say.

**Key features** is three to five short lines, one per entry. Materials,
sizing, packaging, anything that changes whether it sells. Not marketing.

**Who this may suit** is one or two sentences about the reseller, not the
product. "Good first pack if you are selling on Vinted and want something that
posts as a large letter." It is the sentence that stops the wrong person
buying, which is worth more than one extra sale.

## Recommendations

The product page carries three bands underneath: what other resellers buy
alongside this, what completes the order, and current best sellers.

The first needs no setup. It uses Shopify's own recommendations, based on real
order history, and shows best sellers instead while the shop is still new.

The second, "Goes well with this", is worth setting by hand. In the free
**Search & Discovery** app, open a product and set its **complementary
products**. That is what turns a single-pack order into a fuller one.
