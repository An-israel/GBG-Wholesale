"use client";

import { useRef, useState } from "react";
import { submitProductRequest } from "@/lib/actions/public";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "./fields";

export function ProductRequestForm({ sourcePage }: { sourcePage: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ts = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrors({});
    const form = new FormData(e.currentTarget);
    const res = await submitProductRequest({
      name: form.get("name"),
      email: form.get("email"),
      product_description: form.get("product_description"),
      category_hint: form.get("category_hint"),
      quantity_interest: form.get("quantity_interest"),
      source_page: sourcePage,
      website: form.get("website"),
      _ts: ts.current,
    });
    if (res.ok) setState("done");
    else {
      setState("idle");
      setErrors(res.error.fields ?? { _form: res.error.message });
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-[var(--radius-card)] border border-gold bg-gold-pale p-6 text-center">
        <p className="font-medium text-navy">Thank you — your request is logged.</p>
        <p className="mt-1 text-sm text-ink-70">We review every request when planning restocks.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pr-name">Your name</Label>
          <Input id="pr-name" name="name" autoComplete="name" required />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="pr-email">Email</Label>
          <Input id="pr-email" name="email" type="email" inputMode="email" autoComplete="email" required />
          <FieldError message={errors.email} />
        </div>
      </div>
      <div>
        <Label htmlFor="pr-desc">What would you like us to stock?</Label>
        <Textarea id="pr-desc" name="product_description" required placeholder="Describe the product — style, colour, use…" />
        <FieldError message={errors.product_description} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pr-cat">Category (optional)</Label>
          <Input id="pr-cat" name="category_hint" />
        </div>
        <div>
          <Label htmlFor="pr-qty">How many might you buy? (optional)</Label>
          <Input id="pr-qty" name="quantity_interest" inputMode="numeric" />
        </div>
      </div>
      {errors._form && <FieldError message={errors._form} />}
      <Button type="submit" variant="primary" disabled={state === "loading"}>
        {state === "loading" ? "Sending…" : "Submit request"}
      </Button>
    </form>
  );
}
