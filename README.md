# GBG Wholesale Hub

UK wholesale storefront + education + community + admin, built as a standalone platform.

**Stack:** Next.js 15 (App Router, RSC) · TypeScript (strict) · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage, RLS) · Stripe Checkout (GBP) · Resend · Vercel.

The site runs **with or without** a live backend. When Supabase/Stripe are not
configured it falls back to a seed catalogue so every page renders — useful for
previews and CI. Wire the services (below) to go live.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in what you have; the site runs with blanks too
npm run dev                  # http://localhost:3000
```

Useful scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` (no `any`, strict) |
| `npm run lint` | ESLint (Next core-web-vitals) |
| `npm run seed` | Seed the database (needs service role key) |
| `npm run check:no-guaranteed-profit` | Fails if the phrase "guaranteed profit" appears anywhere |
| `npm run check:no-service-key-leak` | Fails if the service role key is referenced in a client component |

---

## Environment variables

See `.env.example` for the full list with comments. Only `NEXT_PUBLIC_*` keys
and the Stripe **publishable** key are ever exposed to the browser. The Supabase
**service role** key is imported only from `lib/supabase/admin.ts` (which begins
with `import 'server-only'`) and is verified by a CI guard.

---

## Database (Supabase)

Migrations live in `supabase/migrations/` as numbered SQL files and apply
cleanly from an empty database:

```bash
supabase db reset          # applies migrations + supabase/seed.sql
npm run seed               # richer seed: catalogue, users, 40 demo orders
```

Migration order:

1. `0001` extensions, enums, `set_updated_at`
2. `0002` identity (profiles, addresses, memberships, audit log, new-user trigger, role guard)
3. `0003` catalogue (categories, collections, products, variants, images, FAQs, inventory ledger)
4. `0004` commerce (carts, orders, order items, payments, refunds, discounts, shipping, stripe_events)
5. `0005` content (pillars, articles, stories, testimonials, FAQs, pages, settings, submissions, analytics)
6. `0006` indexes + full-text search + `search_all()`
7. `0007` business triggers (order number, inventory apply, on_order_paid, on_order_refunded, audit, view-count)
8. `0008` **Row Level Security** — enabled on every table, role helpers, policy matrix
9. `0009` storage buckets + policies

Generate typed schema after provisioning:

```bash
npx supabase gen types typescript --project-id <ref> --schema public > types/database.ts
```

### Stock is a ledger

Stock is **never** written directly. Every change is an append-only row in
`inventory_movements`; a trigger maintains the cached `stock_quantity` and
`stock_status`. `on_order_paid` writes the negative movements when an order is
marked paid.

---

## Payments (Stripe test mode)

1. Set `STRIPE_SECRET_KEY` (test), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET`.
2. Forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Use test card `4242 4242 4242 4242`.

The checkout server action **re-reads every price, MOQ and stock from the
server** and rebuilds Stripe line items from scratch — a tampered client cart
changes nothing. The webhook verifies the signature against the raw body and is
idempotent via the `stripe_events` table.

---

## Security highlights

- RLS on every table; customers can't read another customer's order or escalate their own role (a `before update` trigger blocks privileged column changes).
- `/admin/*` returns **404** to non-staff (surface not advertised); every admin action re-checks the role server-side.
- Security headers (CSP, HSTS, X-Frame-Options, etc.) in `next.config.ts`.
- Public forms: zod-validated, rate-limited, honeypot + min-time-on-form.
- Guest order lookup requires order number **and** matching email, rate limited, via a `security definer` function.
- Money is always integer pence. The server is the only price authority.

---

## Backups & recovery

- Enable **Point-in-Time Recovery** in the Supabase dashboard (Database → Backups).
- Schedule a weekly logical export:
  ```bash
  supabase db dump --data-only > backups/gbg-$(date +%F).sql
  ```
- Keep the migration files and lock file committed so the schema is reproducible.

---

## Deployment (Vercel)

- Import the repo; set all env vars in the Vercel project.
- Point the Stripe webhook at `https://<prod>/api/stripe/webhook`.
- Apply migrations with the Supabase CLI against the production project.
- `vercel.json` registers two crons: hourly abandoned-cart recovery and a daily low-stock digest.
- Vercel Analytics + Speed Insights can be enabled from the dashboard.

---

## Project structure

See `app/` (route groups: `(marketing)`, `(shop)`, `(account)`, `(legal)`,
`admin`, `api`), `components/` (ui, layout, commerce, content, forms, analytics),
`lib/` (supabase, stripe, email, actions, validation, data, utils), and
`supabase/` (migrations + seed).

## Pending business decisions

Every unresolved business fact is an **editable setting**, never hard-coded copy,
and is findable with a single search for `PENDING_LAMI`. They surface in
**Admin → Settings** with a red "PENDING" flag. See `lib/settings.ts` and
`HANDOVER.md`.
