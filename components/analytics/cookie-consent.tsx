"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Cookie consent banner with granular toggles (Part 16.4). No non-essential
 * script loads before consent. UK PECR + UK GDPR are treated as binding. Choice
 * is persisted with a timestamp.
 */
const KEY = "gbg-consent-v1";
type Consent = { necessary: true; analytics: boolean; marketing: boolean; ts: number };

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  function save(consent: Omit<Consent, "necessary" | "ts">) {
    const value: Consent = { necessary: true, ...consent, ts: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(value));
    setOpen(false);
    // Consent-gated loader reads this value; a real deploy dispatches an event here.
    window.dispatchEvent(new CustomEvent("gbg-consent", { detail: value }));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface p-4 shadow-[var(--shadow-overlay)]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-ink-70">
          <p className="font-medium text-ink">We use cookies</p>
          <p>
            Necessary cookies keep the site working. With your consent we also use analytics and
            marketing cookies.{" "}
            <Link href="/cookies" className="underline">
              Learn more
            </Link>
            .
          </p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked disabled /> Necessary
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analytics
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Marketing
            </label>
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => save({ analytics: false, marketing: false })}>
            Reject non-essential
          </Button>
          <Button variant="primary" size="sm" onClick={() => save({ analytics, marketing })}>
            Save choices
          </Button>
        </div>
      </div>
    </div>
  );
}
