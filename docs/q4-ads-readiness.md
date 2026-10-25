# Q4 ads readiness

Against the brief *GBG WH Website Optimization for Q4 Marketing*.

Three columns matter: what is already built, what I have just built, and what
only someone with the Shopify admin can do. The last column is most of the
tracking, and none of it is optional before spend starts.

## The one decision that has to be made first

**Do not run the theme pixels and the sales channel apps at the same time.**

The brief asks for Meta Conversions API and TikTok Events API. Those are
server-to-server; a theme cannot send them. They come from the official sales
channel apps, which also cover the checkout and so are the only way to get a
**Purchase** event at all.

But those apps load their own pixel. If the theme is also loading one, every
event fires twice and the platforms count two purchases per order. That is
exactly the "duplicate purchase data" the brief's QA section warns about, and
it quietly ruins the numbers the Q4 test is meant to produce.

So, pick one, and it should be the apps:

| Platform | Install | Then, in Theme settings > Analytics |
| --- | --- | --- |
| Meta | Facebook & Instagram sales channel | **Clear** Meta pixel ID |
| TikTok | TikTok for Business sales channel | **Clear** TikTok pixel ID |
| GA4 | Google & YouTube sales channel | **Clear** GA4 measurement ID |

The theme's own pixels stay in the code as the fallback for a store with no
apps installed. The settings now say this next to each field.

## 1. Conversion structure and ad landing routes

| Brief task | State |
| --- | --- |
| Build and confirm the ad landing routes | **Already built.** `under-100`, `best-for-vinted`, `best-sellers`, `new-arrivals` all exist as collections, and Start Here is `/pages/start-here`. Run `setup-store.mjs` if they are not in the store yet |
| Clean navigation and filtering | **Partly.** The collection template already renders Shopify's filters and sort. They do not appear until the **Search & Discovery** app is installed and configured: see `filters-and-sort.md` |
| Do not surface empty collections | **Done now.** The category grid, the subcategory tiles and the related links skip a collection with no products. Theme settings > Layout > Catalogue turns it off while stock is being loaded |
| Reusable conversion sections | **Already built.** Trust strip, product facts, shipping and MOQ panels, related products, complementary products, review blocks. A deal page needs no new template: it is a collection with its own copy |

## 2. Mobile UX, cart and checkout

| Brief task | State |
| --- | --- |
| Mobile-first journey | **Needs real devices.** I can only drive a simulated viewport. See the QA list below |
| Cart and checkout end to end | **Blocked.** Needs payments live and a real test order. Store owner only |
| Sticky Add to cart | **Done now.** Appears on phones once the real button scrolls past the top. Its button clicks the real one, so quantity, variant and the minimum order check stay in one place. Off on desktop |
| Related products / cross-sell | **Already built.** `related-products` and `complementary-products` |

## 3. Tracking, analytics and consent

| Brief task | State |
| --- | --- |
| PageView, ViewContent, AddToCart | **Already built**, all three platforms |
| InitiateCheckout / begin_checkout | **Done now**, all three platforms, with the real cart value |
| **Purchase** | **Cannot come from the theme.** Shopify serves its own checkout and blocks theme scripts there. Sales channel app, or a custom pixel under Settings > Customer events |
| Meta CAPI, TikTok Events API | **App only.** Server to server, out of a theme's reach |
| GA4 ecommerce | Theme covers view and cart. Purchase comes from the Google channel |
| UTMs preserved | **Done now** for the questionnaire, which dropped them on redirect so every lead looked like direct traffic. Shopify preserves them elsewhere by itself |
| Cookie and consent | **Store side.** Shopify's own consent banner plus Customer Privacy API. A pixel installed through a sales channel app respects consent automatically; one hard-coded in a theme does not, which is a second reason to prefer the apps |

## 4. Speed, trust, clean-up

| Brief task | State |
| --- | --- |
| Performance | **Mostly fine.** 23 of 25 image tags already lazy-load. The real risk is apps: Judge.me and Omnisend both add scripts. Measure on the live store with PageSpeed Insights once stock is in, because an empty catalogue tells you nothing |
| Trust components | **Already built.** Trust strip, testimonials, founder note, Judge.me carousel and all-reviews blocks. Every one needs Lami's content, and Judge.me needs its app embed switched on |
| Technical clean-up | **Clean.** No TODO, FIXME, lorem or REPLACE_WITH_ placeholders anywhere in the theme. Dead routes can only be found against the live store |

## 5. Pre-ads QA

This is the Done/Pending checklist the brief asks to be returned. Nothing in
it can be ticked from here: it all needs the live store.

| Check | Who | Done |
| --- | --- | --- |
| Start Here route: ad link -> page -> product -> cart -> checkout -> purchase | Israel | ☐ |
| Under £100 route, same journey | Israel | ☐ |
| Best for Vinted route, same journey | Israel | ☐ |
| Best Sellers / New Arrivals route, same journey | Israel | ☐ |
| Approved deal route, same journey | Israel | ☐ |
| Each route tested on a real phone first, then desktop | Israel | ☐ |
| Meta Events Manager: each event once, correct GBP value, through to Purchase | Israel | ☐ |
| TikTok Events Manager: same | Israel | ☐ |
| GA4 DebugView: same | Israel | ☐ |
| No event firing twice (the table at the top of this file) | Israel | ☐ |
| Payments live | Lami | ☐ |
| Shipping rates set | Lami | ☐ |
| Currency is GBP | Lami | ☐ |
| Demo products deleted | Lami | ☐ |
| Real stock in and tagged | Lami | ☐ |
| Password page off | Lami | ☐ |
| Search & Discovery installed and filters configured | Lami | ☐ |
| Judge.me and Omnisend app embeds on | Lami | ☐ |

**The first five rows cannot be done until Lami's six are.** There is no test
purchase to make while payments are off and the catalogue is nine demo
products. That ordering is the single biggest risk to the Q4 date, and it is
worth saying to her plainly.

## What I changed

| File | Why |
| --- | --- |
| `sections/list-collections.liquid`, `collection-subcategories.liquid`, `collection-related.liquid` | Skip empty collections |
| `config/settings_schema.json` | The two new settings, and the double-counting warning |
| `snippets/analytics.liquid` | Checkout event on all three platforms |
| `assets/cart.js` | Keeps a live cart snapshot so that event carries a real value |
| `assets/lead-form.js` | Campaign carried through to the thank you page |
| `snippets/sticky-atc.liquid`, `assets/product.js`, `assets/theme.css` | Sticky Add to cart |
| `assets/product.js` | Sold out variants no longer offer Add to cart |

Push with `node push.mjs`. Code only: no images, templates or theme editor
settings are touched.
