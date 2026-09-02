# Pushing without losing images

## What went wrong, twice

A Shopify theme holds two kinds of file, owned by two different people.

| | Files | Written by |
| --- | --- | --- |
| **Code** | `.liquid`, `.js`, `.css`, `locales/`, `settings_schema.json` | Here, in git |
| **Content** | `templates/*.json`, `sections/*-group.json`, `settings_data.json` | Whoever uses the theme editor |

Every uploaded image, every app block, every section reordering lives in the
**content** files. A plain `shopify theme push` sends both kinds, so it
replaces an afternoon of someone's work with whatever this repo last held.

That is how the home page images were lost. Twice.

## The command to use from now on

```
node push.mjs gbg-wholesale-ufn6121g.myshopify.com
```

Pushes code. Leaves every image, app block and section setting exactly as it
is. There is no flag to remember and nothing to get wrong.

`.shopifyignore` lists the content files too, so even a bare
`shopify theme push` typed by hand cannot wipe them any more. Two layers,
because one clearly was not enough.

## When a template genuinely has to change

Adding a new section to a page, or reordering one, does mean changing a
template. That is a deliberate act, in two steps.

**First, bring the store's version into git.** This saves the images and app
blocks someone added, so they are not lost in the next step.

```
node push.mjs gbg-wholesale-ufn6121g.myshopify.com --pull
git diff --stat
git add templates sections config
git commit -m "Save the content added in the theme editor"
```

**Then, once the change is merged on top of that:**

```
node push.mjs gbg-wholesale-ufn6121g.myshopify.com --with-content
```

Both of those lift the ignore rules for the length of one command and put them
straight back afterwards, including if the command fails.

## If images are lost again

Shopify keeps a version history of the theme. Nothing is gone.

**Online Store > Themes > ... > Version history**, find the version from
before the push, and click to restore it. The image files themselves live in
**Content > Files** and are never touched by a theme push at all, so the worst
case is placing them again rather than re-uploading them.

## Making apps work

Apps arrive in two shapes and only one needs anything from the theme.

**App embeds** load themselves. Judge.me's script, most analytics and most
popup apps work this way. They need `{{ content_for_header }}` in the layout,
which is there, and switching on under **Theme settings > App embeds**. If an
app is installed and doing nothing, check there first.

**App blocks** have to be placed. These are the visible pieces: a reviews
widget, an email signup form. Add them in the theme editor with **Add block**.

Places ready to take an app block:

| Section | Use it for |
| --- | --- |
| **App section** | Anything, on any page. Add the section, then add the block. |
| Footer | An email signup app. Its block replaces the built-in form, so addresses collect into one list rather than two. |
| Review carousel | Judge.me Reviews Carousel |
| All reviews | Judge.me All Reviews |
| Product page | Judge.me review widget (already placed) |

An app that offers no block in the list is an embed. Look under App embeds
rather than hunting for a block that does not exist.
