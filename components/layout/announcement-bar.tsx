"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "gbg-announcement-dismissed";

export function AnnouncementBar({ text, link }: { text: string; link: string | null }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const until = Number(raw);
      if (Date.now() < until) return; // still within the 7-day window
    }
    setDismissed(false);
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setDismissed(true);
  };

  return (
    <div className="bg-navy text-cream">
      <div className="relative mx-auto flex max-w-[1280px] items-center justify-center gap-3 px-5 py-2 text-center text-sm md:px-8">
        {link ? (
          <Link href={link} className="underline-offset-2 hover:underline">
            {text}
          </Link>
        ) : (
          <span>{text}</span>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-4 text-cream/70 hover:text-cream"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
