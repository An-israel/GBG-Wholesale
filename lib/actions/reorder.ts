"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/data";
import { fail, ok, type ActionResult } from "./result";
import type { CartLineData } from "@/lib/cart/types";

/**
 * Reorder: rebuilds cart lines from a past order (acceptance #12). Reads the
 * order through RLS (own orders only), then re-resolves each product's current
 * price and image so the reorder reflects live data, not stale snapshots.
 */
export async function getReorderLines(orderNumber: string): Promise<ActionResult<CartLineData[]>> {
  if (!isSupabaseConfigured) return fail("no_db", "Reorder needs a connected account.");
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_items(product_id, variant_id, quantity, sku_snapshot)")
    .eq("order_number", orderNumber)
    .single();
  if (!order) return fail("not_found", "We couldn't find that order.");

  const lines: CartLineData[] = [];
  for (const item of (order.order_items ?? []) as { product_id: string | null; variant_id: string | null; quantity: number }[]) {
    if (!item.product_id) continue;
    const { data: prod } = await supabase.from("products").select("slug").eq("id", item.product_id).single();
    if (!prod?.slug) continue;
    const product = await getProductBySlug(prod.slug);
    if (!product) continue;
    const variant = item.variant_id ? product.variants.find((v) => v.id === item.variant_id) ?? null : null;
    const primary = product.images.find((i) => i.is_primary) ?? product.images[0];
    lines.push({
      productSlug: product.slug,
      productName: product.name,
      sku: variant?.sku ?? product.sku,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? null,
      imageUrl: primary?.storage_path ?? "",
      unitPricePence: product.wholesale_price_pence + (variant?.price_delta_pence ?? 0),
      packQuantity: product.pack_quantity,
      moq: variant?.moq_override ?? product.moq,
      quantity: Math.max(item.quantity, variant?.moq_override ?? product.moq),
    });
  }
  if (lines.length === 0) return fail("empty", "None of those products are available to reorder.");
  return ok(lines);
}
