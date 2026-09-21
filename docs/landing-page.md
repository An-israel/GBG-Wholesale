# The reseller landing page

A page with one job: take somebody from an ad to a completed questionnaire and
into the free community. It lives on the shop but shares none of its
furniture.

| | |
| --- | --- |
| The page | `gbgwholesalehub.com/pages/start` |
| The thank-you page | `gbgwholesalehub.com/pages/thank-you` |
| Where answers go | Omnisend |
| Editable in the theme editor | Yes, like any other page |

## Why it is not on a subdomain

Shopify cannot serve different content on a subdomain. A subdomain added to
the store redirects to the primary domain: it cannot be pointed at a page.

**A subdomain connected in Shopify lands on the home page, not on a page you
choose.** Shopify redirects every non-primary domain to the root of the
primary one, and its URL redirects only fire on broken URLs within the primary
domain, so they cannot be keyed to a subdomain either. Connecting
`start.gbgwholesalehub.com` in Settings > Domains therefore sends people to
the shop, not to the questionnaire.

Three ways to get a short link that actually reaches the page:

1. **Forward the subdomain at the registrar instead of connecting it to
   Shopify.** Most registrars offer URL forwarding to a full path, and
   Cloudflare does it with a redirect rule. Point it at
   `gbgwholesalehub.com/pages/start`. The subdomain must be removed from
   Shopify first, or Shopify's DNS wins.
2. **A link shortener.** Points anywhere, and gives click counts the ad
   platforms do not.
3. **Use the long URL.** It works, and nobody types a link out of an advert
   anyway.

A genuine subdomain serving its own content would mean hosting the page
somewhere else entirely: a second deploy, a second pixel install, and a form
with nowhere to post. Not worth it for one page.

## No way off the page

Any template ending in `.landing` or `.thanks` renders without the menu, the
footer, the cart, search, the SYPB popup and the floating WhatsApp button.
Every one of those is a way of leaving a page whose only job is the form.

The single link above the fold is the button.

## The questionnaire

Eleven questions, one at a time, with a progress bar. A long form shown all at
once is a wall people close, and this one is long.

**Name, email and number are sent the moment they are given**, tagged
`lead-partial`. Somebody who answers three questions and wanders off is still
a lead worth following up. On completion the same contact is updated with
everything and tagged `lead-complete`.

With JavaScript off it degrades to one long form with a working submit button,
rather than a blank panel.

## What lands in Omnisend

Tags, for building segments without digging:

```
lead-form          everyone from this page
lead-partial       gave contact details, did not finish
lead-complete      finished
stage: ...         their answer to question 5
budget: ...        question 8
timeline: ...      question 10
```

Custom properties, for the detail:

```
leadStage  leadPlatforms  leadCategories  leadBudget
leadNeed   leadTimeline   leadChallenge
leadFormStarted  leadFormCompleted
```

So "everyone ready to start now with £500 to £1,000 who wants help choosing
products" is a segment, not a spreadsheet exercise.

## The sign-off band

The landing templates strip the real footer, which also strips the privacy
policy link. A page collecting a name, an email, a phone number and a budget
needs one within reach, and the ad platforms check for it before they will run
traffic to a lead form.

So both pages end with a sign-off carrying the brand, the tagline and links to
the privacy policy, the terms and the full shop. The policy link is fixed
rather than a setting: a page that collects personal data and does not say how
that data is handled should not be running ads, and a link somebody can switch
off is one that ends up off.

## Two things to set before running traffic

**1. Omnisend has to be switched on.** Theme settings > App embeds > Omnisend.
Its script is what receives the answers. If it is off, the form appears to
work and nothing is recorded.

**2. The community link has to be set.** Theme settings > Reseller community
link. Paste the WhatsApp invite for the new free group, the one that is
neither SYPB nor the Wholesale Hub.

Until it is set, the thank-you page shows no button, and every lead stops
there. In the theme editor it says so; on the live site it just quietly has no
button.

## Deploying it

Two commands, and the second one matters.

```
node push.mjs gbg-wholesale-ufn6121g.myshopify.com
node push.mjs gbg-wholesale-ufn6121g.myshopify.com --only templates/page.landing.json templates/page.thanks.json
```

The first sends the code: the sections, the script, the styles. It cannot
touch a template, an image or an app block, which is the point of it.

That protection applies to a brand new template just as thoroughly, so the
second command is what actually puts the two landing templates on the store.
It sends those two files and nothing else. Every other template, including the
home page, is untouched.

Do not use `--with-content` for this. It pushes every template at once,
including the home page, and that is how the images were lost.

Then create the pages themselves:

```
node setup-store.mjs gbg-wholesale-ufn6121g.myshopify.com shpat_xxx
```

Without that, both URLs are 404s: the theme has the layouts, but Shopify still
needs a Page record before /pages/start resolves.

## Checking it works

Fill the form in yourself and watch the contact appear in Omnisend under
Audience, with the tags above. Do it once before spending anything on ads.

## Tracking

Both pages carry the shop's existing pixels, so GA4, TikTok and Meta all see
them with nothing extra to install. The thank-you page is a separate URL
rather than a message swapped in on the form page, because an ad platform
counts a conversion by someone reaching a page. Use `/pages/thank-you` as the
conversion event.
