"use client";

import { whatsappLink, pageEnquiry } from "@/lib/utils/whatsapp";

/**
 * Floating WhatsApp button. Sits bottom-right, above the sticky buy bar so it
 * never overlaps it (Part 10). Message is prefilled and context-aware.
 */
export function WhatsAppFloat({ number, context }: { number: string; context?: string }) {
  const href = whatsappLink(number, pageEnquiry(context ?? "GBG Wholesale"));
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-analytics="whatsapp_click"
      className="fixed bottom-[calc(1rem+var(--safe-bottom))] right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-profit text-white shadow-[var(--shadow-overlay)] transition-transform hover:scale-105 md:bottom-6"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.5-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.3.1.9-.1 1.5Z" />
      </svg>
    </a>
  );
}
