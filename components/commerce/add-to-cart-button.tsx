"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";
import type { Product, ProductVariant } from "@/types/domain";

/**
 * Add to Cart. Below-MOQ is impossible here (quantity starts at MOQ). Sold-out
 * products convert to a "Notify me" capture (Part 11.2 / acceptance #9).
 */
export function AddToCartButton({
  product,
  variant,
  quantity,
  compact = false,
  buyNow = false,
}: {
  product: Product;
  variant?: ProductVariant | null;
  quantity?: number;
  compact?: boolean;
  buyNow?: boolean;
}) {
  const addLine = useCart((s) => s.addLine);
  const [notified, setNotified] = useState(false);

  const soldOut =
    product.stock_status === "sold_out" || (variant ? variant.stock_quantity <= 0 : false);

  if (soldOut) {
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "md"}
        className="w-full"
        onClick={() => setNotified(true)}
        aria-live="polite"
      >
        {notified ? "We'll let you know" : "Notify me"}
      </Button>
    );
  }

  const moq = variant?.moq_override ?? product.moq;
  const qty = Math.max(moq, quantity ?? moq);
  const unitPrice = product.wholesale_price_pence + (variant?.price_delta_pence ?? 0);
  const primary = product.images.find((i) => i.is_primary) ?? product.images[0];

  function add() {
    addLine({
      productSlug: product.slug,
      productName: product.name,
      sku: variant?.sku ?? product.sku,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? null,
      imageUrl: primary?.storage_path ?? "",
      unitPricePence: unitPrice,
      packQuantity: product.pack_quantity,
      moq,
      quantity: qty,
    });
    if (buyNow) window.location.href = "/cart";
  }

  return (
    <Button variant={buyNow ? "outline" : compact ? "primary" : "gold"} size={compact ? "sm" : "md"} className="w-full" onClick={add}>
      {compact ? "Quick add" : buyNow ? "Buy Now" : "Add to Cart"}
    </Button>
  );
}
