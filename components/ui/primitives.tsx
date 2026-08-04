import * as React from "react";
import { cn } from "@/lib/utils/cn";

/** Max-width container, 1280px, responsive gutters (Part 3.3). */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1280px] px-5 md:px-8", className)}>{children}</div>;
}

export function Section({
  className,
  children,
  alt = false,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  alt?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-12 md:py-16", alt && "bg-surface-alt", className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  // Default dark-gold passes contrast on light; navy-section usages override with text-gold.
  return <p className={cn("text-micro text-gold-ink mb-3", className)}>{children}</p>;
}

const badgeStyles: Record<string, string> = {
  new: "bg-navy text-cream",
  best: "bg-gold text-navy",
  low: "bg-danger text-white",
  sold: "bg-ink-25 text-ink-70",
  beginner: "bg-gold-pale text-navy border border-gold",
  neutral: "bg-surface-alt text-ink-70 border border-line",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof badgeStyles;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-micro leading-none",
        badgeStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** MOQ / SKU style chip in mono. */
export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border border-line bg-surface-alt px-2 py-1 font-mono text-xs text-ink-70",
        className
      )}
    >
      {children}
    </span>
  );
}
