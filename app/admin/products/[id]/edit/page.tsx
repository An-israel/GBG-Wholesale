import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { categories as seedCategories, products as seedProducts } from "@/lib/data/catalog";
import { ProductEditor } from "@/components/admin/product-editor";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let categories = seedCategories.map((c) => ({ id: c.id, name: c.name }));
  let initial: Record<string, unknown> | null = null;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const [{ data: cats }, { data: product }] = await Promise.all([
      supabase.from("categories").select("id,name").order("sort_order"),
      supabase.from("products").select("*").eq("id", id).single(),
    ]);
    if (cats && cats.length) categories = cats;
    initial = product;
  } else {
    // Fallback: allow editing a seed product by matching its synthetic id.
    const p = seedProducts.find((x) => x.id === id);
    if (p) initial = { name: p.name, sku: p.sku, status: p.status, short_description: p.short_description, wholesale_price_pence: p.wholesale_price_pence, pack_quantity: p.pack_quantity, moq: p.moq, low_stock_threshold: p.low_stock_threshold, suitability: p.suitability };
  }

  if (!initial) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-h1">Edit product</h1>
      <div className="mt-6">
        <ProductEditor categories={categories} initial={{ id: isSupabaseConfigured ? id : undefined, ...initial }} />
      </div>
    </div>
  );
}
