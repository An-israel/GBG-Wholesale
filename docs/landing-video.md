# The landing page video

Two minutes, on `/pages/start`, between the hero and the five service cards.

## Before generating anything: the tool is wrong for the talking parts

The plan was fifteen 8-second Veo 3 clips of Lami, cut together. That will not
work, for two reasons.

**Veo 3 will not reliably produce a specific real person.** Feeding it a photo
of Lami and asking for Lami is not what it is for, and generating an
identifiable real person is restricted on most video models.

**Fifteen independent generations will not match.** Her face, her clothes, the
light and the voice all drift between clips. Watched end to end it does not
read as one person in one room, it reads as fifteen near-misses. This is the
single most common way an AI talking-head video gets thrown away.

### What to use instead

| Part of the video | Tool | Why |
| --- | --- | --- |
| Lami speaking | HeyGen, Synthesia or Argil | Built for exactly this: consent footage once, then any script, one consistent face and voice |
| Or better, Lami speaking | A phone on a tripod | Free, takes twenty minutes, and looks like a person rather than an avatar |
| The cutaway shots | Veo 3 | Genuinely good at this, and nobody's face has to match |

The avatar tools need Lami to record a short consent clip. That is deliberate
on their part, and it is the thing that makes an AI video of a real person
legitimate rather than a deepfake.

**Recommendation: film her on a phone.** Two minutes of a real person outsells
a good avatar, this script is written to be spoken rather than performed, and
the whole thing is one take plus retries rather than a pipeline.

Either way, Veo 3 does the cutaways.

## Format

**Landscape, 16 by 9.** It sits in a page, not a feed. The section is built
for that ratio.

A vertical cut for ads is a separate export from the same footage, not a
separate shoot.

## The script

About 300 words, which is two minutes at a natural speaking pace. Fifteen
shots of eight seconds.

Written to the same rules as the rest of the site: no profit promises, no
suggestion that Lami answers everyone personally.

| # | Time | Shot | Words |
| --- | --- | --- | --- |
| 1 | 0:00 | Lami, medium, straight to camera | Most people who want to start reselling get stuck in the same place. Not on effort. On what to actually buy. |
| 2 | 0:08 | Same setup, hold | I am Lami. I run GBG Wholesale Hub. We help people in the UK find stock they can genuinely sell. |
| 3 | 0:16 | **B-roll:** packed shelves, boxes being lifted | Not a thousand units of something you are guessing about. Quantities small enough to test. |
| 4 | 0:24 | Lami, closer, slight angle | Because the problem was never wanting it enough. It is that nobody tells you what is worth buying. |
| 5 | 0:32 | **B-roll:** a phone showing a marketplace listing | You watch people selling on Vinted, on TikTok Shop, on eBay, and from outside it looks obvious. |
| 6 | 0:40 | Lami, medium wide, other side | Then you try it. And you are sat on stock nobody wants, working out what you got wrong. |
| 7 | 0:48 | **B-roll:** hands sorting jewellery into packs | So here is what we do. We hold stock here in the UK, in quantities you can start small with. |
| 8 | 0:56 | Lami, close | Jewellery, bags, clothing, beauty, electronics, homeware, kids, drinkware. Starter boxes if choosing it all feels like too much. |
| 9 | 1:04 | **B-roll:** phone photographing a product on a plain background | And the part most suppliers skip. How to price it, photograph it, and put it where people are already buying. |
| 10 | 1:12 | Lami, medium, direct | I am not going to promise you profit. Nobody honest can. What you make depends on what you pay and how you sell it. |
| 11 | 1:20 | **B-roll:** a phone with a busy group chat | What I can give you is real stock, straight answers, and people doing the same thing to ask. |
| 12 | 1:28 | Lami, three-quarter, warmer | So before I send you anything, I would rather know where you actually are. |
| 13 | 1:36 | **B-roll:** hands taping a parcel, label going on | There is a short questionnaire below. Eleven questions. About two minutes. |
| 14 | 1:44 | Lami, close | Your budget, what you are drawn to, how soon you want to start. No pressure, and nothing to buy. |
| 15 | 1:52 | Lami, medium, settles and holds | Fill it in and I will point you at what actually fits. And you are in the free community either way. |

### Direction

Conversational, not presented. She is answering a question from someone she
likes, not reading. Slightly too fast is better than slightly too slow.

The line that matters most is shot 10. It is the one that separates this from
every get-rich advert the viewer has already scrolled past, so it should be
said plainly, without apology and without a smile.

## Shooting it on a phone

Four setups cover all nine of her shots.

| Setup | Used for | How |
| --- | --- | --- |
| A. Medium, straight on | 1, 2, 10, 15 | Phone at chest height, her framed from the waist up, a third of the frame as headroom |
| B. Closer, angled left | 4, 8 | Step in, turn the phone about 30 degrees off her eyeline |
| C. Medium wide, angled right | 6 | Back off, other side, more room around her |
| D. Three-quarter, warm | 12, 14 | Turned slightly away, looking back to camera |

Shoot the whole script four times, once per setup, then cut between them. That
is how one person in one room becomes a video with pace.

Practical notes: a window in front of her and nothing bright behind her. Phone
on anything steady. Record in the quietest room in the building, because bad
sound reads as amateur far faster than bad picture does.

## Veo 3 prompts for the six cutaways

Landscape, 16 by 9, eight seconds each. No people's faces: hands only, so
nothing has to match Lami.

**Shot 3, the stock**
> Slow dolly past metal shelving in a small UK warehouse, stacked with plain
> brown cardboard boxes and clear poly bags of folded clothing and boxed
> accessories. Soft daylight from a high window, cool neutral grading, shallow
> depth of field. Documentary, handheld, no people visible. 16:9.

**Shot 5, the marketplace**
> Close on a hand holding a smartphone, scrolling a generic online marketplace
> of second-hand fashion listings, thumb moving. Over the shoulder, the phone
> screen sharp and the background soft. Warm indoor light, a kitchen table just
> out of focus. No faces. 16:9.

**Shot 7, packing the stock**
> Overhead shot, two hands sorting costume jewellery into small clear bags on a
> pale wooden table. Gold and silver pieces catching the light. Soft daylight
> from the left, shallow depth of field, gentle real-time movement. No faces.
> 16:9.

**Shot 9, the product photo**
> A hand positioning a small handbag on a white sweep, a second hand raising a
> phone to photograph it. A softbox just in frame. Clean, bright, slightly
> desaturated. Slow push in. No faces. 16:9.

**Shot 11, the community**
> Close on a smartphone held in one hand, a busy group chat scrolling, message
> bubbles rising. Screen sharp, room soft and warm behind. Evening lamplight.
> No readable text, no faces. 16:9.

**Shot 13, the parcel**
> Close on hands taping a brown cardboard parcel shut and smoothing a shipping
> label onto it. Pale wooden table, soft daylight, shallow focus. Real-time,
> unhurried. No faces. 16:9.

Add to every one of them, as Veo tends to score otherwise:
> No text overlays. No logos. No on-screen graphics. Natural ambient sound only,
> no music.

## Still image of Lami, for an avatar tool or a poster frame

This needs her actual appearance, which is not something to invent. Fill the
brackets in from a photo before using it:

> Professional editorial portrait of a [AGE] year old [DESCRIPTION: build,
> hair, complexion, any glasses] Black British woman, wearing [OUTFIT: for
> example a well-cut navy blazer over a cream top]. Seated at a light wooden
> desk in a bright modern workspace, shelves of neatly boxed stock softly out
> of focus behind her. Warm daylight from a large window camera left, soft
> shadow. Direct eye contact, composed, approachable, a slight smile. Shot on
> 85mm, f/2, shallow depth of field, natural colour, editorial quality.
> Landscape 16:9.

Two things to get right, because they are what make it look like a real
business rather than a stock photo: **navy and amber somewhere in frame**, and
**real stock visible behind her**, blurred. Not a plain grey studio wall.

## Where it goes

Theme editor > the Start page > **Landing video** > upload the file.

Upload rather than YouTube. A YouTube embed brings its branding, its suggested
videos at the end and its cookie banner onto a page whose only job is the
form.
