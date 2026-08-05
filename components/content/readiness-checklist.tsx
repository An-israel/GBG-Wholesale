"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";

/** Interactive readiness checklist; state client-side, routes on completion (Part 11.3). */
const items = [
  "I understand this is buying stock to resell (or to keep)",
  "I know my rough budget for a first order",
  "I have somewhere to sell (Vinted, eBay, TikTok Shop or in person)",
  "I can take a few clear photos on my phone",
  "I'm ready to start small and learn as I go",
];

export function ReadinessChecklist() {
  const [checked, setChecked] = useState<boolean[]>(items.map(() => false));
  const count = checked.filter(Boolean).length;
  const done = count === items.length;
  const ready = count >= 3;

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                className="mt-1 h-5 w-5 accent-[var(--color-gold)]"
              />
              <span className={checked[i] ? "text-ink-50 line-through" : "text-ink"}>{item}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-[var(--radius-card)] bg-surface-alt p-4" aria-live="polite">
        {done ? (
          <>
            <p className="font-medium text-profit">You&apos;re ready — let&apos;s find your first products.</p>
            <ButtonLink href="/collections/beginner-bundles" variant="gold" className="mt-3">
              See beginner-friendly stock
            </ButtonLink>
          </>
        ) : ready ? (
          <>
            <p className="font-medium text-ink">You&apos;re nearly there.</p>
            <p className="text-sm text-ink-70">A couple of quick guides will get you the rest of the way.</p>
            <ButtonLink href="/learn" variant="primary" className="mt-3">
              Read the starter guides
            </ButtonLink>
          </>
        ) : (
          <>
            <p className="font-medium text-ink">No rush — let&apos;s build your confidence first.</p>
            <p className="text-sm text-ink-70">Start with the basics, then come back to this.</p>
            <ButtonLink href="/learn/understanding-product-business" variant="primary" className="mt-3">
              Learn the basics
            </ButtonLink>
          </>
        )}
      </div>
    </div>
  );
}
