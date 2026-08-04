import { getFeaturedProducts, getSettings } from "@/lib/data";
import { Section } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { TrustStrip } from "@/components/layout/trust-strip";
import { ProductCard } from "@/components/commerce/product-card";

export const revalidate = 3600;

export default async function HomePage() {
  const [settings, featured] = await Promise.all([getSettings(), getFeaturedProducts()]);
  return (
    <>
      <Section>
        <h1 className="text-display font-display">GBG Wholesale</h1>
        <p className="mt-3 max-w-xl text-body-lg text-ink-70">Placeholder hero — full homepage next.</p>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="/shop" variant="primary">Shop Now</ButtonLink>
          <ButtonLink href="/start-here" variant="outline">Start Here</ButtonLink>
        </div>
      </Section>
      <TrustStrip claims={settings["trust.claims"]} />
      <Section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </Section>
    </>
  );
}
