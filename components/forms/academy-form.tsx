"use client";

import { useRef, useState } from "react";
import { applyToAcademy } from "@/lib/actions/public";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FieldError } from "./fields";

export function AcademyForm() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ts = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrors({});
    const form = new FormData(e.currentTarget);
    const res = await applyToAcademy({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      current_situation: form.get("current_situation"),
      experience_level: form.get("experience_level"),
      goals: form.get("goals"),
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
        <p className="font-medium text-navy">You&apos;re on the list.</p>
        <p className="mt-1 text-sm text-ink-70">We&apos;ll be in touch when the doors open.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="a-name">Your name</Label>
          <Input id="a-name" name="name" autoComplete="name" required />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="a-email">Email</Label>
          <Input id="a-email" name="email" type="email" inputMode="email" autoComplete="email" required />
          <FieldError message={errors.email} />
        </div>
      </div>
      <div>
        <Label htmlFor="a-situation">Where are you starting from?</Label>
        <Textarea id="a-situation" name="current_situation" required />
        <FieldError message={errors.current_situation} />
      </div>
      <div>
        <Label htmlFor="a-exp">Experience level</Label>
        <Select id="a-exp" name="experience_level" defaultValue="none">
          <option value="none">Complete beginner</option>
          <option value="some">Sold a little</option>
          <option value="experienced">Experienced seller</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="a-goals">What do you want to achieve?</Label>
        <Textarea id="a-goals" name="goals" required />
        <FieldError message={errors.goals} />
      </div>
      {errors._form && <FieldError message={errors._form} />}
      <Button type="submit" variant="gold" disabled={state === "loading"}>
        {state === "loading" ? "Submitting…" : "Join the waitlist"}
      </Button>
    </form>
  );
}
