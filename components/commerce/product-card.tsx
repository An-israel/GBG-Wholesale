import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/primitives";
import { costPerUnitPence, formatPence } from "@/lib/utils/format";
import type { Product } from "@/types/domain";
import { AddToCartButton } from "./add-to-cart-button";

/**
 * Product card (Part 11.2). Image with a second image on hover, badges, name,
 * pack price, cost per unit in mono, MOQ chip and quick add. Portrait 4:5 frame.
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const primary = product.images.find((i) => i.is_primary) ?? product.images[0];
  const hover = product.images[1] ?? primary;
  const unit = costPerUnitPence(product.wholesale_price_pence, product.pack_quantity);
  const soldOut = product.stock_status === "sold_out";

  return (
    <div className="group flex flex-col">
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden rounded-[var(--radius-card)] bg-surface-alt">
        <div className="relative aspect-[4/5] w-full">
          {primary && (
            <Image
              src={primary.storage_path}
              alt={primary.alt_text}
              fill
              priority={priority}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-opacity duration-200 group-hover:opacity-0"
            />
          )}
          {hover && (
            <Image
              src={hover.storage_path}
              alt={hover.alt_text}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
          )}
        </div>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.suitability.includes("new_arrival") && <Badge tone="new">New</Badge>}
          {product.suitability.includes("best_seller") && <Badge tone="best">Best Seller</Badge>}
          {product.stock_status === "low_stock" && <Badge tone="low">Low Stock</Badge>}
          {soldOut && <Badge tone="sold">Sold Out</Badge>}
          {product.suitability.includes("beginner_friendly") && <Badge tone="beginner">Beginner</Badge>}
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-lg leading-snug text-ink hover:text-navy">{product.name}</h3>
        </Link>
        <div className="mt-1">
          <p className="font-medium text-ink">
            {formatPence(product.wholesale_price_pence)}
            {product.pack_quantity > 1 && <span className="text-sm text-ink-50"> / pack</span>}
          </p>
          {product.pack_quantity > 1 && (
            <p className="font-mono text-xs text-ink-50">{formatPence(unit)} per unit</p>
          )}
        </div>
        <p className="mt-1 font-mono text-xs text-ink-50">
          MOQ {product.moq} {product.moq === 1 ? "unit" : "units"}
        </p>
        <div className="mt-3">
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </div>
  );
}
