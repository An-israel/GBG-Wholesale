# "You don't have access to this dev store"

```
error
  Looks like you don't have access to this dev store: (gbg-wholesale-hub)
  If you're not the owner, create a dev store staff account for yourself
```

Nothing is wrong with the command, the repo or the theme. The Shopify CLI
signs in as whoever owns the Partner account on this machine. When the store
was transferred to Lami it stopped belonging to that Partner account, so every
`shopify theme` command now fails before it reaches the theme.

There are two fixes. Do the first one today; the second is the one to keep.

## Today: a Theme Access password

A password that belongs to the store rather than to anyone's Partner account.
It grants exactly one thing, `write_themes`, so it can push the theme and can
do nothing else to the shop.

### What Lami does, once

1. Shopify admin > **Apps** > search the App Store for **Theme Access**
   (made by Shopify, free) > **Install**
2. Open it > **Add user**
3. Name, and the email `creatorisrael931@gmail.com`
4. **Send password**

Shopify emails a link. The password is shown once, so copy it then. It starts
with `shptka_`.

### What you do, each time you open a terminal

PowerShell:

```powershell
$env:SHOPIFY_CLI_THEME_TOKEN = "shptka_paste_it_here"
```

Mac or Linux:

```bash
export SHOPIFY_CLI_THEME_TOKEN=shptka_paste_it_here
```

Then push exactly as before:

```
node push.mjs gbg-wholesale-hub.myshopify.com
node push.mjs gbg-wholesale-hub.myshopify.com --only templates/page.landing.json
```

`push.mjs` prints a line confirming it picked the password up. The variable
only lasts as long as that window, so set it again next time. If a push ever
fails with the access error again, that is the first thing to check.

### What it cannot do

Only themes. `setup-store.mjs` talks to the Admin API — products, collections,
pages, menus, metafields — and a Theme Access password has no rights there.
That script already refuses an `shptka_` token rather than failing halfway
through. For that work you still need a custom app's Admin API token, created
by whoever owns the store.

## Properly: collaborator access

A Theme Access password is a key under the mat. Collaborator access puts you
on the store as yourself, with the Shopify admin, the theme editor and the CLI
all working from your own login, and Lami able to revoke it in one click.

1. Your Partner dashboard > **Stores** > **Add store** > **Request access**
2. Enter `gbg-wholesale-hub.myshopify.com`
3. Tick the permissions you need. **Themes** at minimum; **Products** and
   **Online Store** if you are to keep running the setup script
4. Lami approves it in her admin under **Settings > Users > Collaborators**

A collaborator does not count against her staff limit and costs nothing.

One catch worth knowing: a brand new collaborator account sometimes has to log
in to the store admin in a browser once before the CLI will accept it. If the
CLI still refuses straight after approval, open the admin, then try again.

## Which theme am I pushing to?

With a Theme Access password the CLI can see every theme in the store, and it
asks which one. In a hurry that is a question you do not want to get wrong, so
name it instead:

```
node push.mjs gbg-wholesale-hub.myshopify.com --theme 123456789
```

The id is in the theme editor's address bar, after `/themes/`.
