"use client";

import { useRef, useState } from "react";
import { submitStory } from "@/lib/actions/public";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "./fields";

export function StoryForm() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ts = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrors({});
    const form = new FormData(e.currentTarget);
    const res = await submitStory({
      name: form.get("name"),
      email: form.get("email"),
      story: form.get("story"),
      consent: form.get("consent") === "on",
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
        <p className="font-medium text-navy">Thank you for sharing.</p>
        <p className="mt-1 text-sm text-ink-70">We review every story before it&apos;s published.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="s-name">Your name</Label>
          <Input id="s-name" name="name" autoComplete="name" required />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="s-email">Email</Label>
          <Input id="s-email" name="email" type="email" inputMode="email" autoComplete="email" required />
          <FieldError message={errors.email} />
        </div>
      </div>
      <div>
        <Label htmlFor="s-story">Your story</Label>
        <Textarea id="s-story" name="story" required placeholder="Where did you start, what did you do, and what happened?" />
        <FieldError message={errors.story} />
      </div>
      <label className="flex items-start gap-3 text-sm text-ink-70">
        <input type="checkbox" name="consent" className="mt-1 h-5 w-5 accent-[var(--color-gold)]" required />
        <span>I consent to GBG sharing my story (with my name anonymised if I ask).</span>
      </label>
      <FieldError message={errors.consent} />
      {errors._form && <FieldError message={errors._form} />}
      <Button type="submit" variant="primary" disabled={state === "loading"}>
        {state === "loading" ? "Submitting…" : "Share my story"}
      </Button>
    </form>
  );
}
