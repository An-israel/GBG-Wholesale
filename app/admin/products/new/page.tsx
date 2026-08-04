import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { categories as seedCategories } from "@/lib/data/catalog";
import { ProductEditor } from "@/components/admin/product-editor";

export default async function NewProductPage() {
  let categories = seedCategories.map((c) => ({ id: c.id, name: c.name }));
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.from("categories").select("id,name").order("sort_order");
    if (data && data.length) categories = data;
  }
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-h1">New product</h1>
      <p className="mt-1 text-sm text-ink-70">Products without a confirmed price stay as Draft.</p>
      <div className="mt-6">
        <ProductEditor categories={categories} />
      </div>
    </div>
  );
}
