import { Container } from "@/components/ui/primitives";

/**
 * Trust strip — appears directly under the hero on Home, Shop, Collection and
 * Product (Part 10). Claims are sourced from site_settings so they are editable
 * and never become a lie.
 */
export function TrustStrip({ claims }: { claims: string[] }) {
  return (
    <div className="border-y border-line bg-gold-pale">
      <Container>
        <ul className="grid grid-cols-2 gap-3 py-4 text-center text-sm md:grid-cols-4">
          {claims.map((claim) => (
            <li key={claim} className="flex items-center justify-center gap-2 text-ink-70">
              <span className="text-gold" aria-hidden>
                ✓
              </span>
              <span>{claim}</span>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
