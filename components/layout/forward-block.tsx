import { Container } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";

/**
 * Forward block — every page template ends with a "next step" (Part 3.4 #6).
 * This is a required prop, not optional, so a page cannot ship as a dead end.
 */
export type ForwardAction = { label: string; href: string; variant?: "primary" | "gold" | "outline" };

export function ForwardBlock({
  eyebrow = "Your next step",
  heading,
  body,
  primary,
  secondary,
}: {
  eyebrow?: string;
  heading: string;
  body?: string;
  primary: ForwardAction;
  secondary?: ForwardAction;
}) {
  return (
    <div className="bg-navy text-cream">
      <Container>
        <div className="flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-micro text-gold">{eyebrow}</p>
            <h2 className="mt-2 text-h2 font-display text-cream">{heading}</h2>
            {body && <p className="mt-3 text-cream/75">{body}</p>}
          </div>
          <div className="flex flex-shrink-0 flex-wrap gap-3">
            <ButtonLink href={primary.href} variant={primary.variant ?? "gold"}>
              {primary.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink
                href={secondary.href}
                variant={secondary.variant ?? "outline"}
                className="border-cream text-cream hover:bg-cream hover:text-navy"
              >
                {secondary.label}
              </ButtonLink>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
