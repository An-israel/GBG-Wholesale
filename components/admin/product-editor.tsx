"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertProduct } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FieldError } from "@/components/forms/fields";
import { costPerUnitPence, formatPence } from "@/lib/utils/format";

type Category = { id: string; name: string };
type Initial = {
  id?: string;
  name?: string; sku?: string; category_id?: string | null; status?: string;
  short_description?: string; description_html?: string;
  what_you_receive?: string; who_it_suits?: string; why_buy?: string;
  wholesale_price_pence?: number; compare_at_price_pence?: number | null; suggested_retail_price_pence?: number | null;
  moq?: number; pack_quantity?: number; mix_and_match_allowed?: boolean; low_stock_threshold?: number;
  suitability?: string[]; seo_title?: string; seo_description?: string;
};

const tabs = ["Basics", "Pricing", "Inventory", "Content", "Suitability", "SEO"] as const;
const suitabilityOptions = ["beginner_friendly", "reseller", "personal_use", "clearance", "new_arrival", "best_seller"];

export function ProductEditor({ categories, initial = {} }: { categories: Category[]; initial?: Initial }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Basics");
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [price, setPrice] = useState(initial.wholesale_price_pence ?? 0);
  const [pack, setPack] = useState(initial.pack_quantity ?? 1);
  const [suitability, setSuitability] = useState<string[]>(initial.suitability ?? []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrors({});
    const f = new FormData(e.currentTarget);
    const res = await upsertProduct({
      id: initial.id,
      name: f.get("name"),
      sku: f.get("sku"),
      category_id: f.get("category_id") || null,
      status: f.get("status"),
      short_description: f.get("short_description"),
      description_html: f.get("description_html"),
      what_you_receive: f.get("what_you_receive"),
      who_it_suits: f.get("who_it_suits"),
      why_buy: f.get("why_buy"),
      wholesale_price_pence: f.get("wholesale_price_pence"),
      compare_at_price_pence: f.get("compare_at_price_pence") || null,
      suggested_retail_price_pence: f.get("suggested_retail_price_pence") || null,
      moq: f.get("moq"),
      pack_quantity: f.get("pack_quantity"),
      mix_and_match_allowed: f.get("mix_and_match_allowed") === "on",
      low_stock_threshold: f.get("low_stock_threshold"),
      suitability,
      seo_title: f.get("seo_title"),
      seo_description: f.get("seo_description"),
    });
    setState("idle");
    if (res.ok) router.push("/admin/products");
    else setErrors(res.error.fields ?? { _form: res.error.message });
  }

  const unit = pack > 1 ? formatPence(costPerUnitPence(price, pack)) : "—";

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-wrap gap-2 border-b border-line">
        {tabs.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`px-3 py-2 text-sm ${tab === t ? "border-b-2 border-gold font-medium text-navy" : "text-ink-50"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {tab === "Basics" && (
          <>
            <Field label="Name" error={errors.name}><Input name="name" defaultValue={initial.name} required /></Field>
            <Field label="SKU" error={errors.sku}><Input name="sku" defaultValue={initial.sku} placeholder="GBG-EL-001" required /></Field>
            <Field label="Category">
              <Select name="category_id" defaultValue={initial.category_id ?? ""}>
                <option value="">— none —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue={initial.status ?? "draft"}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
            <Field label="Short description"><Textarea name="short_description" defaultValue={initial.short_description} /></Field>
          </>
        )}

        {tab === "Pricing" && (
          <>
            <Field label="Wholesale (pack) price — pence" error={errors.wholesale_price_pence}>
              <Input name="wholesale_price_pence" type="number" min={0} defaultValue={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </Field>
            <Field label="Pack quantity">
              <Input name="pack_quantity" type="number" min={1} defaultValue={pack} onChange={(e) => setPack(Number(e.target.value))} required />
            </Field>
            <p className="text-sm text-ink-70">Cost per unit: <strong>{unit}</strong></p>
            <Field label="Compare-at price — pence"><Input name="compare_at_price_pence" type="number" min={0} defaultValue={initial.compare_at_price_pence ?? ""} /></Field>
            <Field label="Suggested retail — pence (shown as an example)"><Input name="suggested_retail_price_pence" type="number" min={0} defaultValue={initial.suggested_retail_price_pence ?? ""} /></Field>
            <Field label="MOQ"><Input name="moq" type="number" min={1} defaultValue={initial.moq ?? 1} required /></Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="mix_and_match_allowed" defaultChecked={initial.mix_and_match_allowed} className="h-4 w-4 accent-[var(--color-gold)]" /> Mix &amp; match across variants
            </label>
          </>
        )}

        {tab === "Inventory" && (
          <>
            <Field label="Low-stock threshold"><Input name="low_stock_threshold" type="number" min={0} defaultValue={initial.low_stock_threshold ?? 5} required /></Field>
            <p className="text-sm text-ink-50">Stock is adjusted through the inventory ledger (restock/correction), not typed here directly.</p>
          </>
        )}

        {tab === "Content" && (
          <>
            <Field label="Full description (HTML — sanitised on save)"><Textarea name="description_html" defaultValue={initial.description_html} className="min-h-[160px]" /></Field>
            <Field label="What you receive"><Textarea name="what_you_receive" defaultValue={initial.what_you_receive} /></Field>
            <Field label="Who it suits"><Textarea name="who_it_suits" defaultValue={initial.who_it_suits} /></Field>
            <Field label="Why buy"><Textarea name="why_buy" defaultValue={initial.why_buy} /></Field>
          </>
        )}

        {tab === "Suitability" && (
          <div className="flex flex-wrap gap-2">
            {suitabilityOptions.map((s) => (
              <button key={s} type="button" onClick={() => setSuitability((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s])}
                className={`rounded-full border px-3 py-1.5 text-sm ${suitability.includes(s) ? "border-gold bg-gold-pale" : "border-line"}`}>
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        )}

        {tab === "SEO" && (
          <>
            <Field label="SEO title"><Input name="seo_title" defaultValue={initial.seo_title} /></Field>
            <Field label="SEO description"><Textarea name="seo_description" defaultValue={initial.seo_description} /></Field>
          </>
        )}
      </div>

      {errors._form && <FieldError message={errors._form} />}
      <div className="mt-6 flex gap-3">
        <Button type="submit" variant="primary" disabled={state === "loading"}>{state === "loading" ? "Saving…" : "Save product"}</Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>Cancel</Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
