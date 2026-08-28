# Keeping images the shop has uploaded

## Why this is needed

Two places can edit the same files.

- **Theme settings** (logo, favicon, colours, links) live in
  `config/settings_data.json`. That file is already in `.shopifyignore`, so a
  push never touches it. Nothing uploaded there can be lost.
- **Section content** (an image dropped into a hero, a card, an FAQ answer)
  lives in `templates/*.json`. Those files carry the page structure too, so
  they cannot be ignored: that is where new sections and reordering come from.

So a push overwrites section images. This is the procedure that stops that
happening, and it is one command.

## Before every push, if anything has been edited in the theme editor

```bash
mkdir -p live-snapshot
shopify theme pull --theme 155380023490 --path ./live-snapshot --only templates
git add live-snapshot
git commit -m "Snapshot live theme content before push"
git push
```

That copies the live theme's templates into `live-snapshot/` without touching
the working templates. The snapshot is committed so the images can be merged
into the real templates, and it is in `.shopifyignore`, so it is never pushed
back up to the shop.

Then say the snapshot is there. The merge happens on the development side and
comes back in the next `git pull`.

## Why not just pull straight over the templates

`shopify theme pull --only templates` without `--path` overwrites the working
files. Any new section, reorder or copy change that has not reached the shop
yet is lost, silently. The snapshot directory keeps both versions so they can
be compared rather than one replacing the other.

## The rule, in one line

Images uploaded in **Theme settings** are always safe. Images uploaded into a
**section** need a snapshot first.

## What is worth uploading where

| Image | Where | Survives a push |
| --- | --- | --- |
| Logo, white logo, favicon, share image | Theme settings > Logo and favicon | Always |
| Founder photo | Theme settings > Founder | Always |
| Hero slider backgrounds | Home page > Hero slider > each slide | Needs a snapshot |
| Page hero images | Any page > Hero > Image | Needs a snapshot |
| Section images, card images, FAQ images | The section itself | Needs a snapshot |
| Product photos | Shopify admin > Products | Always, they are not theme files |
| Category images | Shopify admin > Collections | Always |
