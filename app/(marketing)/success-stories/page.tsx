import type { Metadata } from "next";
import { getPublishedStories, getPublishedTestimonials } from "@/lib/data";
import { Section, Eyebrow } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ForwardBlock } from "@/components/layout/forward-block";
import { StoryCard } from "@/components/content/cards";
import { StoryForm } from "@/components/forms/story-form";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Success Stories — sellers who started here",
  description: "Real journeys from first order to steady sales. Read the wins, then share your own.",
};

export default async function SuccessStoriesPage() {
  const [stories, testimonials] = await Promise.all([getPublishedStories(), getPublishedTestimonials()]);
  const hasStories = stories.length > 0;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Success Stories" }]} />
      <Section className="pb-6">
        <Eyebrow>Proof</Eyebrow>
        <h1 className="text-h1 font-display">Sellers who started here</h1>
        <p className="mt-2 max-w-2xl text-ink-70">
          Every story follows the same honest shape: where they started, what they did, the result,
          and the lesson.
        </p>
      </Section>

      <Section className="pt-0">
        {hasStories ? (
          <div className="grid gap-4 md:grid-cols-3">
            {stories.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        ) : (
          // Intentional empty state — what ships on day one (Part 11.8)
          <div className="rounded-[var(--radius-modal)] border border-gold bg-gold-pale p-8 text-center md:p-12">
            <Eyebrow>Just getting started</Eyebrow>
            <h2 className="text-h2 font-display">The first stories are being collected right now</h2>
            <p className="mx-auto mt-2 max-w-xl text-ink-70">
              We&apos;d rather show real journeys than invented ones. If you&apos;ve bought from GBG and
              started selling, we&apos;d love to feature you.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/shop" variant="gold">Start your journey</ButtonLink>
              <ButtonLink href="#share" variant="outline">Share your story</ButtonLink>
            </div>
          </div>
        )}
      </Section>

      {testimonials.length > 0 && (
        <Section alt>
          <h2 className="text-h2 font-display">What sellers say</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
                <p className="text-ink">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-3 text-sm text-ink-50">— {t.author_name}, {t.platform}</footer>
              </blockquote>
            ))}
          </div>
        </Section>
      )}

      {/* Submit your story */}
      <Section id="share">
        <div className="mx-auto max-w-xl">
          <Eyebrow>Your turn</Eyebrow>
          <h2 className="text-h2 font-display">Share your story</h2>
          <p className="mt-2 text-ink-70">Tell us what happened. With your consent, we may feature it.</p>
          <div className="mt-6">
            <StoryForm />
          </div>
        </div>
      </Section>

      <ForwardBlock
        heading="Write your own next chapter"
        body="Every story here started with one small order."
        primary={{ label: "Browse the shop", href: "/shop" }}
        secondary={{ label: "Start here", href: "/start-here" }}
      />
    </>
  );
}
