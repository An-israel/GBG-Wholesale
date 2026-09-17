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

If a short link matters for advertising, add `start.gbgwholesalehub.com` in
Settings > Domains and set it to redirect to `/pages/start`. People get the
short link, and the address bar shows the full one after the redirect.

A genuine subdomain would mean hosting the page somewhere else entirely, and
that means a second deploy, a second pixel install and a form with nowhere to
post. Not worth it for one page.

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

## Checking it works

Fill the form in yourself and watch the contact appear in Omnisend under
Audience, with the tags above. Do it once before spending anything on ads.

## Tracking

Both pages carry the shop's existing pixels, so GA4, TikTok and Meta all see
them with nothing extra to install. The thank-you page is a separate URL
rather than a message swapped in on the form page, because an ad platform
counts a conversion by someone reaching a page. Use `/pages/thank-you` as the
conversion event.
