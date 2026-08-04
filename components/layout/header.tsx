"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useCartCount } from "@/lib/cart/store";
import type { Category } from "@/types/domain";

const primaryNav = [
  { label: "Shop", href: "/shop", hasMega: true },
  { label: "Start Here", href: "/start-here" },
  { label: "Learn", href: "/learn" },
  { label: "Academy", href: "/academy" },
  { label: "About", href: "/about" },
];

export function Header({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const cartCount = useCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-surface transition-shadow duration-150",
        scrolled && "shadow-[0_1px_0_rgba(230,227,218,1),0_4px_16px_rgba(13,27,42,0.06)]"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-5 md:px-8">
        {/* Mobile: hamburger left */}
        <button
          className="grid h-11 w-11 place-items-center md:hidden"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <span className="space-y-[5px]">
            <span className="block h-[2px] w-6 bg-navy" />
            <span className="block h-[2px] w-6 bg-navy" />
            <span className="block h-[2px] w-6 bg-navy" />
          </span>
        </button>

        {/* Logo — centred on mobile, left on desktop */}
        <Link
          href="/"
          className="flex-1 text-center font-display text-2xl font-bold tracking-tight text-navy md:flex-none md:text-left"
        >
          GBG
          <span className="ml-1 hidden align-middle text-micro text-gold-ink sm:inline">Wholesale</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {primaryNav.map((item) => (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => item.hasMega && setShopOpen(true)}
              onMouseLeave={() => item.hasMega && setShopOpen(false)}
            >
              <Link
                href={item.href}
                className="py-2 text-[15px] font-medium text-ink hover:text-gold"
              >
                {item.label}
              </Link>
              {item.hasMega && shopOpen && (
                <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 rounded-[var(--radius-modal)] border border-line bg-surface p-3 shadow-[var(--shadow-overlay)]">
                  <p className="px-2 pb-1 text-micro text-ink-50">Categories</p>
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/collections/${c.slug === "accessories" ? "beginner-bundles" : c.slug}`}
                      className="block rounded-[4px] px-2 py-1.5 text-sm text-ink hover:bg-gold-pale"
                    >
                      {c.name}
                    </Link>
                  ))}
                  <div className="my-2 border-t border-line" />
                  <Link href="/collections/new-arrivals" className="block rounded-[4px] px-2 py-1.5 text-sm font-medium text-navy hover:bg-gold-pale">
                    New Arrivals
                  </Link>
                  <Link href="/collections/best-sellers" className="block rounded-[4px] px-2 py-1.5 text-sm font-medium text-navy hover:bg-gold-pale">
                    Best Sellers
                  </Link>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <Link href="/search" aria-label="Search" className="grid h-11 w-11 place-items-center text-navy hover:text-gold">
            <SearchIcon />
          </Link>
          <Link href="/account" aria-label="Account" className="hidden h-11 w-11 place-items-center text-navy hover:text-gold sm:grid">
            <UserIcon />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative grid h-11 w-11 place-items-center text-navy hover:text-gold">
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-surface p-5 shadow-[var(--shadow-overlay)]">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-xl font-bold text-navy">GBG Wholesale</span>
              <button aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="grid h-11 w-11 place-items-center text-navy">
                ✕
              </button>
            </div>
            <nav className="flex flex-col" aria-label="Mobile">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="border-b border-line py-3 text-lg font-medium text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <details className="mt-4">
              <summary className="cursor-pointer py-2 text-micro text-ink-50">Categories</summary>
              <div className="flex flex-col pl-2">
                {categories.map((c) => (
                  <Link key={c.slug} href={`/collections/${c.slug === "accessories" ? "beginner-bundles" : c.slug}`} onClick={() => setDrawerOpen(false)} className="py-2 text-ink">
                    {c.name}
                  </Link>
                ))}
              </div>
            </details>
            <div className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
              <Link href="/account" onClick={() => setDrawerOpen(false)} className="block py-1 text-ink-70">My account</Link>
              <Link href="/faq" onClick={() => setDrawerOpen(false)} className="block py-1 text-ink-70">Help & FAQ</Link>
              <Link href="/contact" onClick={() => setDrawerOpen(false)} className="block py-1 text-ink-70">Contact</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 8H6" />
      <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
    </svg>
  );
}
