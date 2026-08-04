# Part 22 · Acceptance Checklist — status

Honest status against the build spec. Legend: ✅ implemented · 🟡 implemented,
needs a live backend to fully exercise · ⬜ scaffolded / follow-up.

The storefront runs today against a seed catalogue. Items marked 🟡 are wired
correctly in code but require live Supabase + Stripe credentials (and
`npm run seed`) to demonstrate end to end.

## Commerce
| # | Check | Status |
| --- | --- | --- |
| 1 | Add to cart survives refresh & browser restart | ✅ (Zustand + localStorage) |
| 2 | Cart merges into account on login without duplicating | 🟡 (merge on login; needs auth) |
| 3 | Below MOQ impossible in UI and rejected server-side | ✅ (stepper floor + `createCheckout` re-check) |
| 4 | Tampered client price ignored; Stripe charges DB price | ✅ (server rebuilds line items) |
| 5 | Test card completes checkout; order + stock ledger + email | 🟡 (webhook + `on_order_paid` wired) |
| 6 | Webhook replay does not double-process | ✅ (`stripe_events` idempotency) |
| 7 | Failed payment restores stock, no paid order | 🟡 (webhook handler) |
| 8 | Partial refund updates Stripe/order/stock | 🟡 (schema + webhook; admin control ⬜) |
| 9 | Sold-out can't be purchased, shows notify-me, sorts last | ✅ |
| 10 | Discount code respects limits & expiry | 🟡 (schema + validation seam) |
| 11 | International shipping + customs note | ✅ (zones/rates + customs copy) |
| 12 | Reorder rebuilds cart | ✅ (`getReorderLines` + button on order detail) |

## Access & security
| # | Check | Status |
| --- | --- | --- |
| 13 | Customer can't read another's order | ✅ (RLS `own_orders`) |
| 14 | Customer can't change role/verified | ✅ (policy + `before update` trigger) |
| 15 | `/admin` returns 404 for a customer | ✅ (middleware rewrite) |
| 16 | Draft products / unpublished invisible to anon | ✅ (RLS + data layer filter) |
| 17 | Guest lookup needs number+email, rate limited | ✅ (`lookup_order` + limiter) |
| 18 | Service role key not in client bundle | ✅ (`server-only` + CI guard) |
| 19 | Public forms rate limited + honeypot | ✅ |
| 20 | Script tag in rich text stored sanitised | ✅ (DOMPurify `sanitizeHtml` on save) |

## Journeys
| # | Check | Status |
| --- | --- | --- |
| 21 | Ready-to-buy path Home→…→Hub | ✅ (routes present) |
| 22 | Beginner path with no jargon | ✅ (Start Here → Learn → Shop) |
| 23 | One primary action + forward block per page | ✅ (`ForwardBlock` required) |
| 24 | Zero-result search offers request form + logs query | ✅ (logging needs DB) |
| 25 | Every WhatsApp button carries a context message | ✅ |

## Craft
| # | Check | Status |
| --- | --- | --- |
| 26 | Hero + both CTAs visible at 375×667 | ✅ (compact mobile hero) |
| 27 | Lighthouse mobile ≥ 90 on key pages | 🟡 (RSC, next/image, blur — verify on deploy) |
| 28 | Zero horizontal scroll at 320px | ✅ (overflow-x contained) |
| 29 | Keyboard-only purchase | 🟡 (semantic + focus rings; verify with live checkout) |
| 30 | axe: no serious/critical | ✅ (Playwright+axe, 6 key pages, in CI) |
| 31 | The banned earnings-guarantee phrase appears nowhere | ✅ (CI guard passes) |
| 32 | Every PENDING_LAMI editable in admin, none hard-coded | ✅ (Settings screen) |

## Build gates (run now)
- `npm run typecheck` ✅  `npm run lint` ✅  `npm run build` ✅
- `npm run check:no-guaranteed-profit` ✅  `npm run check:no-service-key-leak` ✅
- `npm run test:a11y` ✅ (6 pages, 0 serious/critical)

## Now implemented since first pass
Admin write layer (role-guarded server actions: product upsert + quick edit,
restock via ledger, order status/tracking → shipped email, Stripe refund with
restock, settings edit, policy-page edit, request status, Hub grant/revoke),
tabbed product editor, admin order detail with controls, editable settings
screen, DOMPurify sanitise-on-save, reorder-to-cart, in-app checkout step,
branded email templates wired to the webhook + shipping flow, and the axe CI job.
Next.js was upgraded to the patched 15.5 line (fixes the middleware-auth-bypass
and other advisories).

## Remaining follow-ups
Variant/media/FAQ sub-editors inside the product editor (Basics/Pricing/
Inventory/Content/Suitability/SEO tabs are wired), and connecting live Supabase +
Stripe credentials to exercise the 🟡 flows end to end.
