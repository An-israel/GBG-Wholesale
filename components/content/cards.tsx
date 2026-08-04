import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { Article, SuccessStory } from "@/types/domain";

/** Journey card — routes each audience to a different destination (Part 11.1). */
export function JourneyCard({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-shadow hover:shadow-[var(--shadow-card)]"
    >
      <h3 className="text-h3 font-display">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-ink-70">{body}</p>
      <span className="mt-4 text-sm font-medium text-gold group-hover:text-gold-hover">
        {cta} →
      </span>
    </Link>
  );
}

export function CategoryTile({
  name,
  href,
  image,
  alt,
}: {
  name: string;
  href: string;
  image: string;
  alt: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-surface-alt">
        <Image src={image} alt={alt} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-200 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
        <span className="absolute bottom-3 left-3 font-display text-lg font-semibold text-cream">{name}</span>
      </div>
    </Link>
  );
}

export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  return (
    <Link
      href={`/learn/${article.pillar_slug}/${article.slug}`}
      className={cn("group flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-shadow hover:shadow-[var(--shadow-card)]", className)}
    >
      <p className="text-micro text-gold">{article.reading_minutes} min read</p>
      <h3 className="mt-2 text-h3 font-display leading-snug">{article.title}</h3>
      <p className="mt-2 flex-1 text-sm text-ink-70">{article.excerpt}</p>
      <span className="mt-4 text-sm font-medium text-navy group-hover:text-gold">Read guide →</span>
    </Link>
  );
}

export function StoryCard({ story }: { story: SuccessStory }) {
  return (
    <div className="flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <p className="text-micro text-gold">{story.platform}</p>
      <h3 className="mt-2 text-h3 font-display leading-snug">{story.headline}</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="font-medium text-ink">Started</dt>
          <dd className="text-ink-70">{story.starting_point}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Did</dt>
          <dd className="text-ink-70">{story.action_taken}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Result</dt>
          <dd className="text-ink-70">{story.result}</dd>
        </div>
      </dl>
      <p className="mt-3 border-l-2 border-gold pl-3 text-sm italic text-ink-70">{story.lesson}</p>
    </div>
  );
}
