# Moving to a store that can take payments

> **Done, on 1 September 2026.** The store is now
> `gbg-wholesale-ufn6121g.myshopify.com`, a client transfer store, owned by
> Lami. Kept as a record of why the first store had to be abandoned. Nothing
> below needs doing again.

The current store is a **Dev store**. Shopify's own rule: a Dev store supports
feature previews and test data and **cannot be transferred to a client**. That
is why Settings > Plan has no upgrade button and why the dev dashboard has no
Transfer ownership action. It is not a permissions problem and not a bug.

A **Client transfer store** is the type built to be handed over. Same features,
but it can be transferred, and the client picks a plan when they accept it.

## What Lami does

1. Go to the dev dashboard > **Stores** > **Create store**
2. Choose **Client transfer**, not Dev
3. Name it GBG Wholesale Hub

## What I do

Push the theme, then run the setup script against the new store. Between them
those two commands rebuild almost everything:

```
shopify theme push --store <new-store>.myshopify.com
node setup-store.mjs <new-store>.myshopify.com shpat_xxx
```

That creates 14 pages, 68 collections, 4 navigation menus and the demo
products, all with the handles the theme links to.

## What still needs a person

Six things, and only six. None of them can be written by a script.

| Thing | Where | Why not scriptable |
| --- | --- | --- |
| Plan and billing | Lami accepts the transfer | Shopify requires the owner |
| Currency to GBP | Settings > Store details | Changing it after orders exist is messy, so it is deliberately manual |
| Logo and favicon | Theme editor | Image uploads are theme settings, not code |
| Section images | Theme editor | Same |
| App installs | Judge.me, Search & Discovery | Apps install per store |
| Header menu setting | Theme editor > Header | A theme setting, not a menu |

Real product photos and stock also come across by CSV export and import from
Products, which is a Shopify feature rather than anything in this repo.

## The order that avoids rework

1. Lami creates the Client transfer store
2. She adds me as staff, or I get a collaborator code
3. I push the theme
4. I run the setup script
5. She installs Judge.me and Search & Discovery
6. She uploads the logo, favicon and section images
7. She sets the currency to GBP
8. She transfers the store to herself and picks a plan
9. Domain gets connected and the password page comes off

Steps 3 and 4 are mine. The rest are hers.

## What carries over from the current store

Everything in this repo: the theme, every template, all the copy, the FAQ bank,
the collection structure. It is all in git, so nothing is lost.

What does **not** carry over automatically: the images Lami has uploaded, the
Judge.me install, and any theme settings she has changed in the editor. Those
are per-store and have to be redone. Worth pulling a snapshot of the current
theme settings before we stop using the dev store:

```
shopify theme pull --theme 155380023490 --path live-snapshot
```

That grabs config/settings_data.json, which lists every image she has placed
and where. It makes redoing them a checklist rather than a memory test.
