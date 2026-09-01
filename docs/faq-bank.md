# The FAQ bank

Lami's Extended FAQ Bank is built into the theme. All 86 questions live in one
file and every page pulls the ones it needs by name. A question is written
once, so the answer a shopper reads on a category page, on a product page and
on the main FAQ page can never drift apart.

Nothing has to be typed into the theme editor, and nothing is stored per page.

## Where the wording lives

`snippets/faq-bank.liquid`

Each question is one `render` call with a question, an HTML answer, a
plain-text copy of that answer for Google, and optionally a link.

To change the wording of a question, edit it there once. It updates everywhere
it appears.

## The 20 sets

| Set | Questions | Where it appears |
| --- | --- | --- |
| `shopping` | 10 | Product pages, main FAQ |
| `choosing` | 4 | Demand collections, main FAQ |
| `pricing` | 5 | Price band collections, Learn Hub, main FAQ |
| `listings` | 4 | Learn Hub, Listings Guide, main FAQ |
| `dropshipping` | 6 | Dropshipping collection, main FAQ |
| `starter-boxes` | 4 | Starter Boxes category, main FAQ |
| `jewellery` | 5 | Jewellery category and subcategories |
| `bags` | 4 | Bags category and subcategories |
| `clothing` | 3 | Clothing category and subcategories |
| `beauty` | 4 | Beauty and Fragrance category |
| `electronics` | 3 | Electronics category |
| `home` | 4 | Home and Lifestyle category |
| `kids` | 3 | Kids and School category |
| `drinkware` | 3 | Drinkware category |
| `vinted` | 4 | Best for Vinted, Platform Guide |
| `ebay` | 3 | Best for eBay, Platform Guide |
| `tiktok` | 3 | Best for TikTok Shop, Platform Guide |
| `business` | 4 | Platform Safety Guide, main FAQ |
| `community` | 7 | Academy page, main FAQ |
| `support` | 3 | Main FAQ |

## Automatic sets

The category page template serves all nine categories and around forty-five
subcategories from one file. Its FAQ block is set to **Automatic**, which reads
the collection being viewed and picks the matching set. So the Bags page shows
the bags questions and the Drinkware page shows the drinkware questions, with
one template and nothing configured per category.

All 68 collections are mapped. A collection created later that is not yet in
the map falls back to the ordering questions, which is a sensible default
rather than an empty section. To map a new collection, add its handle to the
matching list at the top of `snippets/faq-bank.liquid`.

## Adding a set to a page

In the theme editor, add the **FAQ bank** section, then add a **Question set**
block and choose which set you want. Add more blocks for more sets.

Three switches matter:

- **Show a heading above each set.** On for the main FAQ page, off anywhere
  showing a single set.
- **Show a jump list at the top.** On for the main FAQ page only. Eighty-odd
  collapsed rows is a scroll rather than a page.
- **Let Google show these answers in search results.** On for the main FAQ page
  only. Two FAQPage blocks on one page is invalid and Google ignores both.

## Deep links

Each set has a stable anchor named after the set, so you can link straight to
one from anywhere on the site or from an email:

```
/pages/faq#faq-dropshipping
/pages/faq#faq-pricing
/pages/faq#faq-business
```

The anchor is the set name from the table above, prefixed with `faq-`.

## One-off questions

The older **FAQ accordion** section is still there and still works. Use it for
questions that belong to one page only, such as the four on the home page. Use
the FAQ bank for anything that should read the same in more than one place.

## Changes made to the source document

Two things were corrected while importing:

- The HMRC record-keeping answer was missing a verb ("HMRC keeping accurate
  records"). It now reads "HMRC expects accurate records even for side-hustle
  activity."
- Curly apostrophes were converted to straight ones, to match the rest of the
  site.

Internal links were added to answers where they pointed at a collection or a
guide that exists, so no answer is a dead end.
