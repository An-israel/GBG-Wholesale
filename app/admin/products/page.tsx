import Link from "next/link";
import { products as seedProducts, categories } from "@/lib/data/catalog";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { costPerUnitPence, formatPence } from "@/lib/utils/format";

export default function AdminProducts() {
  const watchlist = DEFAULT_SETTINGS["legal.trademark_watchlist"].map((w) => w.toLowerCase());
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h1">Products</h1>
        <Link href="/admin/products/new" className="rounded-[var(--radius-input)] bg-navy px-4 py-2 text-sm text-cream">+ New product</Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-line text-left text-ink-50">
            <tr>
              <th className="p-3">Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Unit</th><th>Stock</th><th>MOQ</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {seedProducts.map((p) => {
              const flagged = watchlist.some((w) => p.name.toLowerCase().includes(w));
              return (
                <tr key={p.slug} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <span className="font-medium">{p.name}</span>
                    {flagged && (
                      <span className="ml-2 rounded bg-danger/10 px-1.5 py-0.5 text-xs text-danger" title="Matches trademark watchlist — do not publish by default">
                        ⚠ trademark
                      </span>
                    )}
                  </td>
                  <td className="font-mono text-xs">{p.sku}</td>
                  <td>{catName(p.category_slug)}</td>
                  <td>{p.wholesale_price_pence > 0 ? formatPence(p.wholesale_price_pence) : <span className="text-danger">TBC</span>}</td>
                  <td className="font-mono text-xs">{p.pack_quantity > 1 ? formatPence(costPerUnitPence(p.wholesale_price_pence, p.pack_quantity)) : "—"}</td>
                  <td>{p.stock_quantity}</td>
                  <td>{p.moq}</td>
                  <td>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "active" ? "bg-profit/10 text-profit" : "bg-ink-25/30 text-ink-70"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td><Link href={`/admin/products/${p.id}/edit`} className="text-navy underline">Edit</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-ink-50">
        Products whose name matches the trademark watchlist are flagged and are not published by
        default (Part 24 legal flag). Manage the watchlist in Settings.
      </p>
    </div>
  );
}
