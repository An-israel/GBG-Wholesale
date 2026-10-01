# The landing page video

Two minutes, on `/pages/start`, between the hero and the five service cards.

Once the still images exist, the prompts to paste into Veo 3 are in
[veo3-prompts.md](veo3-prompts.md) — fifteen blocks in shot order, nothing else.
This file is the reasoning behind them.

## The method: images first, then image to video

Veo 3 for the whole thing, talking parts included. The risk is consistency:
fifteen independent text-to-video generations will not produce the same face,
clothes or light twice, and end to end that reads as fifteen near-misses
rather than one woman in one room.

So do not generate the talking clips from text. Do this instead:

1. **Generate four still images first**, one per camera setup, from the same
   character description. Regenerate until all four look like the same person
   on the same day.
2. **Feed each image into Veo as the first frame** and let it animate from
   there, with the spoken line in the prompt.
3. Every talking clip then starts from a face you have already approved,
   rather than from Veo's imagination.

That is the difference between a usable video and a wasted afternoon.

### Five rules that hold it together

**Paste the character block verbatim.** Identical wording in every prompt.
One changed adjective is a different person.

**Fix the wardrobe and the room once**, in the character block, and never vary
them. Not per shot. Not slightly.

**Same seed where the tool offers one.** If yours does, use one number for the
whole set.

**Generate three takes of every clip and keep the one that matches**, not the
one that is best on its own. A brilliant clip that does not match is a clip
you cannot use.

**Grade at the end.** Put all fifteen through the same colour adjustment in
the edit. It hides a surprising amount of drift.

### What will still go wrong

Hands, teeth and earrings are where these models fail. Keep her hands out of
frame in the character block, keep the framing no tighter than chest up, and
avoid detailed jewellery.

Lip sync on longer lines can slip. If a clip looks off, cut to a B-roll shot
over that line rather than fighting it. That is what the six cutaways are for,
and it is also why they are hands only: nothing there has to match her.

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

## Step one: the character block

Paste this into every prompt **exactly as written, every time**. One changed
adjective is a different woman.

> **[LAMI]** = a Black woman in her late thirties, deep rich brown skin, an
> oval face with high cheekbones, full lips, strong well-defined eyebrows and
> warm dark brown eyes. Shoulder-length dark brown hair, side parted, in soft
> loose waves falling past her collarbone. Polished natural makeup: soft
> bronze smoky eye, defined brows, a warm berry lip. Small round gold stud
> earrings and a fine gold chain necklace, no other jewellery. Wearing a
> tailored ivory cream blazer with a subtle woven texture over a matching
> cream top, shoulders squared. Calm, composed, quietly confident.

> **[ROOM]** = a bright modern workspace. Pale wooden desk in the foreground.
> Shelving of neatly boxed and bagged wholesale stock softly out of focus
> behind her, deep navy and warm amber accents in the room. Warm daylight from
> a large window camera left, soft shadow on the right of her face. Clean,
> uncluttered, real.

### Why ivory and not the pink gele

Her pink gele look is the more striking of the two photographs, and on a still
image I would use it.

For fifteen AI generations it is the wrong choice. A gele is layered fabric
with sequins, and sequins and complex folds are precisely what these models
reinvent on every run. It would be a visibly different headwrap in every clip.
The hair-down ivory look has far fewer moving parts and will hold.

If she wants the gele, use it for the poster frame only, and keep the video in
the ivory blazer.

### Two things to keep out

**Her hands.** Both photographs have her arms folded, which is her natural
pose, but hands are where these models fail hardest and folded arms read as
closed in a video meant to feel warm. Frame chest up, hands below frame.

**Detailed jewellery.** Plain gold studs and the fine chain only. Anything
patterned will drift.

## Step two: four still images

Generate these four first. Do not move on until all four look like the same
woman photographed on the same afternoon. Expect to regenerate, and judge them
side by side rather than one at a time.

**Image A, medium, straight on** (shots 1, 2, 10, 15)
> Photorealistic editorial portrait of [LAMI], seated at the desk in [ROOM].
> Framed from mid-chest up, centred, shoulders square to camera, looking
> directly into the lens. Hands below the frame, not visible. Neutral composed
> expression, lips closed. Shot on 85mm at f/2, shallow depth of field,
> natural colour. Landscape 16:9.

**Image B, closer, angled left** (shots 4, 8)
> Photorealistic editorial portrait of [LAMI], seated at the desk in [ROOM].
> Tighter framing from the shoulders up, camera positioned 30 degrees to her
> left, her head turned back to look directly into the lens. Hands below the
> frame, not visible. Shot on 85mm at f/2, shallow depth of field, natural
> colour. Landscape 16:9.

**Image C, medium wide, angled right** (shot 6)
> Photorealistic editorial portrait of [LAMI], seated at the desk in [ROOM].
> Wider framing with clear space around her and the shelving of stock more
> visible behind, camera positioned 30 degrees to her right, her head turned
> back to look directly into the lens. Hands below the frame, not visible.
> Shot on 50mm at f/2.8, natural colour. Landscape 16:9.

**Image D, three-quarter, warmer** (shots 12, 14)
> Photorealistic editorial portrait of [LAMI], seated at the desk in [ROOM].
> Framed from mid-chest up, her body turned three-quarters away and her head
> turned back to the lens, a warmer and more open expression, the faintest
> smile. Slightly softer light. Hands below the frame, not visible. Shot on
> 85mm at f/1.8, shallow depth of field, natural colour. Landscape 16:9.

Add to all four:
> No text, no logos, no watermarks. Skin texture natural and unretouched, not
> plastic or airbrushed.

## Step three: the nine talking clips

Each one takes its **image as the first frame**, then this prompt. Eight
seconds, 16:9.

Prefix every one of them with:
> Animate from the provided image. The subject and setting must remain exactly
> as in the image.

And end every one of them with:
> Natural ambient room tone. No music, no text overlays, no logos, no
> on-screen graphics. Photorealistic, subtle natural movement, the camera
> almost still.

| Shot | Image | Prompt |
| --- | --- | --- |
| 1 | A | She speaks directly to camera, calm and level, small natural head movement, one unhurried blink. She says: "Most people who want to start reselling get stuck in the same place. Not on effort. On what to actually buy." |
| 2 | A | She continues speaking to camera, slightly warmer, a small nod on her own name. She says: "I am Lami. I run GBG Wholesale Hub. We help people in the UK find stock they can genuinely sell." |
| 4 | B | She speaks to camera, more direct, a slight lean in on the second sentence. She says: "Because the problem was never wanting it enough. It is that nobody tells you what is worth buying." |
| 6 | C | She speaks to camera, a small rueful shake of the head on the last phrase. She says: "Then you try it. And you are sat on stock nobody wants, working out what you got wrong." |
| 8 | B | She speaks to camera, brisker, listing. She says: "Jewellery, bags, clothing, beauty, electronics, homeware, kids, drinkware. Starter boxes if choosing it all feels like too much." |
| 10 | A | She speaks to camera, serious, no smile, holds the look after the first sentence. She says: "I am not going to promise you profit. Nobody honest can. What you make depends on what you pay and how you sell it." |
| 12 | D | She speaks to camera, warmer, head tilting slightly. She says: "So before I send you anything, I would rather know where you actually are." |
| 14 | D | She speaks to camera, light and easy, a small open gesture suggested by the shoulders only. She says: "Your budget, what you are drawn to, how soon you want to start. No pressure, and nothing to buy." |
| 15 | A | She speaks to camera, settles, finishes with a small closed-lip smile and holds it as the clip ends. She says: "Fill it in and I will point you at what actually fits. And you are in the free community either way." |

Shot 10 is the one to regenerate until it is right. No smile, no apology. It
is the line that separates this from every get-rich advert the viewer has
already scrolled past.

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

## The poster frame

The still that sits on the video before anyone presses play. Worth generating
even though the section does not require one, because a good first frame is
most of whether someone bothers.

This is the one place the gele earns its keep:

> Editorial portrait of a Black woman in her late thirties, deep rich brown
> skin, oval face with high cheekbones, full lips, strong defined eyebrows,
> warm dark brown eyes. Wearing a dusty rose pink sequinned gele headwrap and
> a matching dusty rose textured blazer, small gold stud earrings, fine gold
> chain. Polished natural makeup with a pink lip. Arms folded, composed, a
> direct and confident look into the lens, the faintest smile. Standing in a
> bright modern workspace, shelving of neatly boxed wholesale stock softly out
> of focus behind her, navy and amber accents. Warm daylight from camera left.
> Shot on 85mm at f/2, shallow depth of field, natural colour, photorealistic,
> editorial quality. Landscape 16:9.

## Assembling it

Fifteen clips, in script order, cut hard with no transitions. Total 2:00.

Three things to do in the edit:

**One colour grade over everything.** Same adjustment on all fifteen. This is
what makes generations from different runs read as one shoot.

**Cut to B-roll over any line where the lip sync slips.** The audio keeps
running underneath. Nobody notices a cutaway; everybody notices bad sync.

**Keep the last frame on her face for a beat** after she stops talking, then
cut. Ending on a cut mid-breath feels abrupt.

If any talking clip refuses to match no matter how many takes, drop it and
extend the B-roll either side over the audio. Losing one of nine angles costs
nothing. One face that does not match costs the whole video.

## Where it goes

Theme editor > the Start page > **Landing video** > upload the file.

Upload rather than YouTube. A YouTube embed brings its branding, its suggested
videos at the end and its cookie banner onto a page whose only job is the
form.
