# GBG Wholesale Hub — Founder's Handover

This guide is for running the site day to day. No coding needed. Everything here
happens in the **Admin dashboard** at `yourdomain.com/admin` (you'll be asked to
sign in — only staff and admin accounts can see it).

---

## The golden rule

Nobody should need to DM you for basic information. The site answers the common
questions for you. Your job in admin is: **handle orders, keep stock and prices
right, and read what customers are asking for.**

---

## 1. Add a product

1. Go to **Admin → Products → New product**.
2. **Basics:** name, category, a short description and the full description.
3. **Pricing:** the wholesale (pack) price, how many units are in a pack, and the
   MOQ (smallest order). The **cost per unit** is worked out for you as you type.
   You can add a suggested retail price — it always shows as an *example*, never a
   promise.
4. **Inventory:** enter your stock and a "low stock" number (when to warn).
5. **Variants** (optional): add colours, each with its own stock.
6. **Media:** drag in at least 3 real photos. Every photo needs alt text
   (a short description) — this is required.
7. Set status to **Active** to make it live, or **Draft** to hide it while you
   finish. Products with no confirmed price stay as **Draft** automatically.
8. Save. The shop updates within a few minutes.

> **Trademark warning:** if a product name matches a watched brand (e.g. Stanley,
> Coach, Dior), admin shows a red ⚠ flag and the product is **not published by
> default**. Publishing brand-referenced items is a legal decision for you.

## 2. Fulfil an order

1. **Admin → Orders**, open the order.
2. Check the items and the shipping address (there's a copy button).
3. When you post it, enter the **tracking number and carrier** and save — this
   automatically emails the customer their tracking.
4. Need to refund? Use the refund control. Tick "restock" if the items are coming
   back into stock — that puts them back automatically.

## 3. Edit a policy page (Shipping, Returns, Terms, etc.)

1. **Admin → Content → Policy pages**.
2. Edit the text and save. It updates a "Last reviewed" date so customers see it's
   current. No developer needed.

## 4. Change the announcement bar (the strip at the very top)

1. **Admin → Settings** (or the Marketing area).
2. Edit the announcement text and link. Save. It appears immediately.

## 5. Read what customers want (this drives restocking)

1. **Admin → Requests** — the demand board. Requests are grouped and sorted by
   how many people asked. Move each through: new → reviewing → sourcing → stocked.
2. When you mark something **stocked**, you can email everyone who requested it.
3. Also check **zero-result searches** in Analytics — those are things people
   looked for and couldn't find.

## 6. The Wholesale Hub

By default, **any paid order** unlocks the Hub for that customer and marks them a
verified buyer — automatically. You can change this in **Settings** (e.g. require
a minimum spend), or grant/revoke access manually on a customer's page.

---

## Things only you can decide (marked "PENDING")

The site launches without waiting for you, because every business fact is an
editable setting. Open **Admin → Settings** and you'll see items flagged red
**PENDING** — these still need your confirmed answer:

- WhatsApp number, support email, support hours, response promise
- Delivery/processing times and the returns & clearance wording (drafts are in place)
- Free-shipping threshold, Hub unlock rules
- SYPB link, Wholesale Hub link, personal shopper link, social links
- Academy price, duration, curriculum (shown as "waitlist" until you set them)
- The exact wording of the retail-price disclaimer

Fill each one in and the red flag turns green. Until then the site shows a clear
placeholder — it never invents an answer (especially never a price).

---

## When something breaks

- **A page won't load / checkout errors:** check the Vercel dashboard for the
  latest deployment status, and Stripe's dashboard for payment issues.
- **Emails not arriving:** check the Resend dashboard.
- **Data question:** the Supabase dashboard shows every order and customer.
- **Anything code-related:** contact your developer with the page URL and, if
  shown, the "reference id" from the error message — that pinpoints the problem.

Keep your `.env` values and Supabase login safe. Never share the service role
key or Stripe secret key with anyone.
