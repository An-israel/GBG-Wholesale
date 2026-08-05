# Deployment guide — GBG Wholesale Hub

End-to-end setup: Supabase (database + auth + storage), Stripe (payments),
Resend (email), then Vercel (hosting). Follow the parts in order. Anything in
`ALL_CAPS` or `<angle brackets>` is a value you paste in.

Your Supabase project: **`lnhieoutyyisgjsuksol`**
→ URL: `https://lnhieoutyyisgjsuksol.supabase.co`
→ Dashboard: https://supabase.com/dashboard/project/lnhieoutyyisgjsuksol

> **Secrets stay out of git.** Never commit `.env.local`, the service-role key,
> the Stripe secret key, or the database password. Put secrets only in Vercel's
> Environment Variables and your local `.env.local`.

---

## Part A — Supabase

### A1. Create the database schema

Pick **one** of these. Option 1 is the simplest.

**Option 1 — SQL Editor (copy-paste, no tools to install)**
1. Open the dashboard → **SQL Editor** → **New query**.
2. Open the file [`supabase/full_setup.sql`](supabase/full_setup.sql) in this repo, copy the whole thing.
3. Paste into the editor and click **Run**.
   This creates every table, enum, trigger, function, all Row-Level-Security
   policies, the storage buckets, and the essential settings + shipping seed.
   On a fresh project it runs top-to-bottom with no errors.

**Option 2 — Supabase CLI (repeatable, recommended for teams)**
```bash
npm i -g supabase           # or: brew install supabase/tap/supabase
supabase login              # opens a browser to authorise
supabase link --project-ref lnhieoutyyisgjsuksol
supabase db push            # applies supabase/migrations/*.sql in order
```
The CLI reads `supabase/config.toml` (already committed with your project ref).

### A2. Get your API keys

Dashboard → **Project Settings → API**. Copy these:

| Value on the page | Env var it becomes | Exposed to browser? |
| --- | --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` (already `https://lnhieoutyyisgjsuksol.supabase.co`) | yes |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` | **NO — server only** |

The service-role key bypasses all security. It is used only in server code
(`lib/supabase/admin.ts`, which starts with `import 'server-only'`) and there is
a CI guard that fails the build if it ever leaks into a browser bundle.

### A3. Configure Auth

Dashboard → **Authentication → URL Configuration**:
- **Site URL:** your production URL (set after Vercel deploy, Part D5). For now `http://localhost:3000`.
- **Redirect URLs:** add `http://localhost:3000/**` and later `https://<your-domain>/**`.

Dashboard → **Authentication → Providers**: Email is on by default. Enable
**Google** later if you want OAuth (optional).

### A4. Create the super admin

The first admin account. Two ways:

- **Easiest:** in Part D you'll set `SEED_SUPER_ADMIN_EMAIL` and run `npm run seed`
  (A5) — that creates a `super_admin` for that email (password `GbgSeed!2026`,
  change it after first login).
- **Manual:** sign up normally at `/signup`, then in the SQL Editor run:
  ```sql
  update profiles set role = 'super_admin' where email = 'you@example.com';
  ```

### A5. (Optional) Seed realistic demo data

Loads the product catalogue, demo users, and 40 sample orders so the storefront
and admin charts look real. Needs the service-role key locally:

```bash
cp .env.example .env.local     # fill in the three Supabase values + SEED_SUPER_ADMIN_EMAIL
npm install
npm run seed
```

Skip this if you'd rather start empty and add products by hand in the admin.

### A6. Backups

Dashboard → **Database → Backups**: enable **Point-in-Time Recovery**. For a
weekly logical export: `supabase db dump --data-only > backups/gbg-$(date +%F).sql`.

---

## Part B — Stripe (payments)

1. Create/log in at https://dashboard.stripe.com. Start in **Test mode** (toggle top-right).
2. **Developers → API keys**, copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`
3. The **webhook** needs your deployed URL, so you'll add it in **Part D4** after Vercel is live.
4. Currency is GBP; test card `4242 4242 4242 4242`, any future expiry/CVC.

---

## Part C — Resend (transactional email)

1. Sign up at https://resend.com, verify your sending domain (or use their test domain to start).
2. **API Keys** → create one → `RESEND_API_KEY`.
3. Set `EMAIL_FROM` (e.g. `GBG Wholesale <hello@yourdomain.com>`) and
   `ADMIN_NOTIFICATION_EMAIL` (where new-order/low-stock alerts go).

> Email is optional for launch — without `RESEND_API_KEY` the app logs emails
> instead of sending, and nothing breaks.

---

## Part D — Vercel (hosting)

### D1. Import the project
1. https://vercel.com → **Add New → Project** → import `An-israel/GBG-Wholesale`.
2. Framework preset: **Next.js** (auto-detected). Build command `next build`,
   output auto. Don't deploy yet — set env vars first.

### D2. Environment variables

**Settings → Environment Variables** (set for Production, and Preview if you
want branch previews). Paste each value from Parts A–C:

| Variable | Value / where from | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | your Vercel URL, e.g. `https://gbg-wholesale.vercel.app` (or custom domain) | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lnhieoutyyisgjsuksol.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → anon key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → service_role key (secret) | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → API keys | ✅ (for checkout) |
| `STRIPE_SECRET_KEY` | Stripe → API keys (secret) | ✅ (for checkout) |
| `STRIPE_WEBHOOK_SECRET` | from Part D4 (add after first deploy) | ✅ (for checkout) |
| `RESEND_API_KEY` | Resend | optional |
| `EMAIL_FROM` | e.g. `GBG Wholesale <hello@yourdomain.com>` | optional |
| `ADMIN_NOTIFICATION_EMAIL` | your inbox | optional |
| `SEED_SUPER_ADMIN_EMAIL` | your admin email | for seeding |
| `REVALIDATE_SECRET` | any long random string | ✅ |
| `CRON_SECRET` | any long random string (secures the cron routes) | ✅ |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | fallback WhatsApp number (live value lives in admin settings) | optional |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Upstash (better rate limiting) | optional |
| `TURNSTILE_SITE_KEY` / `_SECRET_KEY` | Cloudflare Turnstile (bot protection) | optional |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 | optional |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | TikTok Pixel | optional |

Generate a random secret: `openssl rand -hex 32`.

### D3. Deploy
Click **Deploy**. First build takes ~1–2 minutes. When it's live you'll get a
URL like `https://gbg-wholesale.vercel.app`.

### D4. Point the Stripe webhook at your site
1. Stripe → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://<your-vercel-url>/api/stripe/webhook`
3. Events to send: `checkout.session.completed`, `payment_intent.payment_failed`,
   `charge.refunded`, `checkout.session.expired`.
4. Create it, then copy the **Signing secret** (`whsec_…`) into Vercel as
   `STRIPE_WEBHOOK_SECRET` and **redeploy** (Deployments → ⋯ → Redeploy).

### D5. Finalise URLs
- Set `NEXT_PUBLIC_SITE_URL` in Vercel to your real URL and redeploy.
- In Supabase → Authentication → URL Configuration, set **Site URL** to the same
  and add `https://<your-domain>/**` to redirect URLs.

### D6. Cron jobs (automatic)
`vercel.json` already declares two crons — hourly abandoned-cart recovery and a
daily low-stock digest. Vercel picks these up automatically and sends the
`CRON_SECRET` you set. Nothing else to configure. (Cron requires a Vercel Pro
plan; on Hobby they simply won't run — harmless.)

### D7. Custom domain (optional)
Vercel → **Settings → Domains** → add your domain and follow the DNS steps. Then
update `NEXT_PUBLIC_SITE_URL` and the Supabase Site URL to match, and redeploy.

---

## Part E — Go-live checklist

1. Sign in to `/admin` with your super-admin account.
2. **Admin → Settings**: work through every row flagged red **PENDING** — WhatsApp
   number, support email/hours, delivery & returns wording, SYPB/Hub links,
   Academy details, free-shipping threshold, retail disclaimer. Nothing is
   hard-coded; this screen is how the site goes live.
3. **Admin → Products**: add real products with real photos (drag-drop upload;
   alt text is required). Anything flagged ⚠ trademark stays draft until you
   decide.
4. Place a **test-mode** order end to end; confirm the order appears in admin,
   stock decremented, and the confirmation email arrived.
5. Flip Stripe to **Live mode**, swap in the live keys + a live webhook, redeploy.
6. Confirm `robots.txt` and `sitemap.xml` load, and that `/admin` returns 404
   when signed out.

---

## Troubleshooting

- **Pages render but data looks like the demo catalogue** → `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` aren't set in Vercel, so the app is using its offline fallback. Add them and redeploy.
- **Checkout says "not connected"** → Stripe keys missing; add `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- **Orders don't flip to paid** → the webhook isn't reaching you or `STRIPE_WEBHOOK_SECRET` is wrong. Check Stripe → Webhooks → your endpoint → recent deliveries.
- **Can't see `/admin`** → your profile isn't staff/admin. Run the A4 SQL to set your role.
- **Seed fails on shipping zones** → make sure migration `0010_shipping_zone_unique.sql` was applied (it's included in `full_setup.sql`).
- **`npm audit` shows highs** → 3 transitive `sharp`/`postcss` advisories remain; only `next@16` (a breaking upgrade) moves them. The critical Next advisories are already fixed on 15.5.

See `HANDOVER.md` for day-to-day running (adding products, fulfilling orders,
editing policies) and `README.md` for local development.
