"use client";

import { useState } from "react";
import Link from "next/link";
import type { Faq } from "@/types/domain";
import { Input } from "@/components/forms/fields";

/**
 * FAQ accordion with a live client-side filter over server-rendered content, so
 * it still works without JavaScript (Part 11.9). Uses native <details> so every
 * answer is expandable and keyboard-operable with no JS.
 */
export function FaqAccordion({ faqs, searchable = false }: { faqs: Faq[]; searchable?: boolean }) {
  const [q, setQ] = useState("");
  const filtered = q
    ? faqs.filter((f) => (f.question + f.answer_html).toLowerCase().includes(q.toLowerCase()))
    : faqs;

  return (
    <div>
      {searchable && (
        <div className="mb-5">
          <label htmlFor="faq-search" className="sr-only">
            Search FAQs
          </label>
          <Input
            id="faq-search"
            type="search"
            placeholder="Search questions…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      )}
      <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
        {filtered.length === 0 && <p className="p-4 text-sm text-ink-50">No matching questions. Try a different search.</p>}
        {filtered.map((f) => (
          <details key={f.id} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
              {f.question}
              <span className="text-gold transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <div className="mt-2 text-sm text-ink-70" dangerouslySetInnerHTML={{ __html: f.answer_html }} />
            {f.next_link_href && f.next_link_label && (
              <Link href={f.next_link_href} className="mt-2 inline-block text-sm font-medium text-navy hover:text-gold">
                {f.next_link_label} →
              </Link>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
