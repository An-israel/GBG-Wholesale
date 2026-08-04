import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

// Route protection is enforced in middleware.ts (staff-only, 404 otherwise) and
// re-checked in every admin action server-side (Part 6.3).
const nav = [
  { label: "Overview", href: "/admin", icon: "▦" },
  { label: "Orders", href: "/admin/orders", icon: "▤" },
  { label: "Products", href: "/admin/products", icon: "◫" },
  { label: "Requests", href: "/admin/product-requests", icon: "✦" },
  { label: "Customers", href: "/admin/customers", icon: "◑" },
  { label: "Content", href: "/admin/content", icon: "❏" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-alt md:grid md:grid-cols-[220px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-line bg-navy p-4 text-cream md:block">
        <Link href="/admin" className="font-display text-xl font-bold">GBG Admin</Link>
        <nav className="mt-6 space-y-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-[var(--radius-input)] px-3 py-2 text-sm text-cream/80 hover:bg-cream/10 hover:text-cream">
              <span aria-hidden>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="mt-8 block text-xs text-cream/50 hover:text-cream">← Back to site</Link>
      </aside>

      <div className="pb-20 md:pb-0">
        <div className="p-5 md:p-8">{children}</div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-line bg-navy py-2 text-cream md:hidden">
        {nav.slice(0, 5).map((n) => (
          <Link key={n.href} href={n.href} className="flex flex-col items-center gap-0.5 px-2 text-[11px] text-cream/80">
            <span aria-hidden className="text-base">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
