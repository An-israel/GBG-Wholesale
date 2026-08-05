import Link from "next/link";
import Image from "next/image";
import {
  getBeginnerArticles,
  getCategories,
  getFeaturedProducts,
  getSettings,
} from "@/lib/data";
import { Section, Eyebrow, Container } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { TrustStrip } from "@/components/layout/trust-strip";
import { ForwardBlock } from "@/components/layout/forward-block";
import { ProductCard } from "@/components/commerce/product-card";
import { JourneyCard, CategoryTile, ArticleCard, StoryCard } from "@/components/content/cards";
import { CommunityComparison } from "@/components/content/comparison-table";
import { FaqAccordion } from "@/components/content/faq-accordion";
import { getFaqs } from "@/lib/data";
import { PENDING } from "@/lib/settings";

export const revalidate = 3600;

const categoryImages: Record<string, string> = {
  accessories: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=70",
  jewellery: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=800&q=70",
  beauty: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=70",
  "home-living": "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=70",
  "bags-purses": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=70",
  "seasonal-gifting": "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=70",
};

export default async function HomePage() {
  const [settings, categories, featured, beginnerArticles, faqs] = await Promise.all([
    getSettings(),
    getCategories(),
    getFeaturedProducts(),
    getBeginnerArticles(),
    getFaqs(),
  ]);
  const personalShopper = settings["links.personal_shopper"];
  const personalHref = personalShopper.includes(PENDING) ? "/contact?reason=wholesale_enquiry" : personalShopper;

  return (
    <>
      {/* 1 · Hero — image, headline and both CTAs visible without scrolling at 375×667 */}
      <section className="relative overflow-hidden bg-navy text-cream">
        <Container>
          <div className="grid items-center gap-6 py-10 md:grid-cols-2 md:py-20">
            <div className="order-2 md:order-1">
              <Eyebrow className="text-gold">Global Biz Gateway</Eyebrow>
              <h1 className="text-h1 font-display text-cream md:text-display">
                Real wholesale, low minimums, and the guidance to actually sell.
              </h1>
              <p className="mt-3 max-w-md text-cream/80">
                UK ready-stock with honest photos and clear unit prices — whether you&apos;re
                reselling or buying for yourself.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/shop" variant="gold" size="lg">
                  Shop Now
                </ButtonLink>
                <ButtonLink
                  href="/start-here"
                  variant="outline"
                  size="lg"
                  className="border-cream text-cream hover:bg-cream hover:text-navy"
                >
                  Start Here
                </ButtonLink>
              </div>
              <Link href={personalHref} className="mt-3 inline-block text-sm text-cream/70 underline underline-offset-2 hover:text-cream">
                Prefer a personal shopper?
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-modal)]">
                <Image
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=70"
                  alt="A tidy display of accessories and jewellery ready to resell"
                  fill
                  priority
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2 · Trust strip */}
      <TrustStrip claims={settings["trust.claims"]} />

      {/* 3 · Choose your journey */}
      <Section>
        <Eyebrow>Where are you starting?</Eyebrow>
        <h2 className="text-h2 font-display">Choose your journey</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <JourneyCard title="I want to start a business" body="New to all this? Start calm, with no jargon." href="/start-here" cta="Start here" />
          <JourneyCard title="I already sell & need stock" body="Skip the pitch. Real prices, fast checkout." href="/shop" cta="Shop the catalogue" />
          <JourneyCard title="I'm buying for myself" body="Honest prices, clear photos, no business talk." href="/collections/best-sellers" cta="Browse best sellers" />
          <JourneyCard title="I finished the Academy" body="Ready for your first order? Go straight to stock." href="/shop" cta="Place your order" />
        </div>
      </Section>

      {/* 4 · Shop by category */}
      <Section alt>
        <div className="flex items-end justify-between">
          <div>
            <Eyebrow>Browse</Eyebrow>
            <h2 className="text-h2 font-display">Shop by category</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium text-navy hover:text-gold">
            All products →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <CategoryTile
              key={c.slug}
              name={c.name}
              href={`/shop?category=${c.slug}`}
              image={categoryImages[c.slug] ?? categoryImages.accessories}
              alt={`${c.name} — ${c.description}`}
            />
          ))}
        </div>
      </Section>

      {/* 5 · How it works */}
      <Section>
        <Eyebrow>Simple</Eyebrow>
        <h2 className="text-h2 font-display">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Choose your products", "Browse honest photos and clear unit prices."],
            ["Order at low MOQ", "Start small — no huge minimums to commit to."],
            ["We dispatch fast", "UK-based dispatch, tracked to your door."],
            ["You sell & restock", "List, sell, then reorder what works."],
          ].map(([title, body], i) => (
            <li key={title} className="rounded-[var(--radius-card)] border border-line p-5">
              <span className="font-display text-3xl text-gold">{i + 1}</span>
              <h3 className="mt-2 font-display text-lg">{title}</h3>
              <p className="mt-1 text-sm text-ink-70">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 6 · Featured products */}
      <Section alt>
        <div className="flex items-end justify-between">
          <div>
            <Eyebrow>Popular now</Eyebrow>
            <h2 className="text-h2 font-display">Featured products</h2>
          </div>
          <Link href="/collections/best-sellers" className="text-sm font-medium text-navy hover:text-gold">
            See best sellers →
          </Link>
        </div>
        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="mt-6 flex snap-x gap-4 overflow-x-auto scrollbar-none md:grid md:grid-cols-4 md:overflow-visible">
          {featured.map((p) => (
            <div key={p.slug} className="w-[45%] flex-shrink-0 snap-start md:w-auto">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </Section>

      {/* 7 · Why GBG is different */}
      <Section>
        <Eyebrow>The difference</Eyebrow>
        <h2 className="text-h2 font-display">Why GBG is different</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-line bg-surface-alt p-6">
            <p className="text-micro text-ink-50">The usual way</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-70">
              <li>Unknown suppliers you have to DM to get a price</li>
              <li>High minimums that lock up your cash</li>
              <li>No help once the box arrives</li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-card)] border border-gold bg-gold-pale p-6">
            <p className="text-micro text-gold-ink">With GBG</p>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              <li>Prices and stock shown openly — no DM required</li>
              <li>Low minimums so you can test without risk</li>
              <li>Education and community to help you sell</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 8 · Success proof */}
      <Section alt>
        <Eyebrow>Proof</Eyebrow>
        <h2 className="text-h2 font-display">Sellers who started here</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {sampleStories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
        <Link href="/success-stories" className="mt-4 inline-block text-sm font-medium text-navy hover:text-gold">
          More success stories →
        </Link>
      </Section>

      {/* 9 · Learn before you buy */}
      <Section>
        <Eyebrow>No pressure</Eyebrow>
        <h2 className="text-h2 font-display">Learn before you buy</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {beginnerArticles.slice(0, 3).map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </Section>

      {/* 10 · Community */}
      <Section alt id="community">
        <Eyebrow>Community</Eyebrow>
        <h2 className="text-h2 font-display">Two communities, one journey</h2>
        <p className="mt-2 max-w-2xl text-ink-70">
          SYPB is open to everyone before you buy. The Wholesale Hub unlocks the moment you place your first order.
        </p>
        <div className="mt-6">
          <CommunityComparison />
        </div>
      </Section>

      {/* 11 · Academy preview */}
      <Section>
        <div className="rounded-[var(--radius-modal)] bg-navy p-8 text-cream md:p-12">
          <Eyebrow className="text-gold">The Academy</Eyebrow>
          <h2 className="text-h2 font-display text-cream">Go from curious to confident seller</h2>
          <p className="mt-2 max-w-xl text-cream/80">
            A guided path for people who want more than a shop — they want to learn the whole craft.
          </p>
          <ButtonLink href="/academy" variant="gold" className="mt-5">
            Explore the Academy
          </ButtonLink>
        </div>
      </Section>

      {/* 12 · Meet Lami */}
      <Section alt>
        <div className="grid items-center gap-6 md:grid-cols-[200px_1fr]">
          <div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-full bg-ink-25 md:w-full">
            {/* PENDING_LAMI — replace with a professional photo of Lami via Admin → Content */}
            <div className="grid h-full w-full place-items-center bg-gold-pale text-center text-micro text-ink-50">
              Founder photo
              <br />
              PENDING_LAMI
            </div>
          </div>
          <div>
            <Eyebrow>Meet Lami</Eyebrow>
            <h2 className="text-h2 font-display">From bridal to a business gateway</h2>
            <p className="mt-2 max-w-xl text-ink-70">
              Lami built GBG to be the supplier she wished she&apos;d had — one that shows real prices,
              teaches openly, and treats beginners with respect.
            </p>
            <Link href="/about" className="mt-3 inline-block text-sm font-medium text-navy hover:text-gold">
              Read the story →
            </Link>
          </div>
        </div>
      </Section>

      {/* 13 · FAQ */}
      <Section>
        <Eyebrow>Good to know</Eyebrow>
        <h2 className="text-h2 font-display">Common questions</h2>
        <div className="mt-6 max-w-3xl">
          <FaqAccordion faqs={faqs.slice(0, 6)} />
          <Link href="/faq" className="mt-4 inline-block text-sm font-medium text-navy hover:text-gold">
            See all FAQs →
          </Link>
        </div>
      </Section>

      {/* 14 · Final CTA (mirrors the hero) */}
      <ForwardBlock
        eyebrow="Ready when you are"
        heading="Start selling, or start learning"
        body="Two clear routes — pick the one that fits where you are today."
        primary={{ label: "Shop the catalogue", href: "/shop" }}
        secondary={{ label: "Start here", href: "/start-here" }}
      />
    </>
  );
}

// Lightweight sample stories for the homepage proof section (real stories ship
// unpublished until enough exist — Part 20). These illustrate the fixed
// start → action → result → lesson structure without claiming to be customers.
const sampleStories = [
  { id: "h1", customer_name: "A reseller", headline: "A first clip order became steady income", starting_point: "Never sold online before.", action_taken: "Started with one low-MOQ accessories order.", result: "Now reorders monthly.", lesson: "Start small, prove it, reinvest.", platform: "Vinted", is_published: true, is_featured: false },
  { id: "h2", customer_name: "A seller", headline: "A hero bag lifted the whole store", starting_point: "Thin margins on cheap items.", action_taken: "Added a structured mini tote.", result: "Higher basket value.", lesson: "One hero product changes perception.", platform: "TikTok Shop", is_published: true, is_featured: false },
  { id: "h3", customer_name: "A shopper", headline: "Seasonal stock, planned ahead", starting_point: "Flat year-round sales.", action_taken: "Bought seasonal gifting early.", result: "A strong peak-week spike.", lesson: "Let the calendar sell for you.", platform: "eBay", is_published: true, is_featured: false },
];
