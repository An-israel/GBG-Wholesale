"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "./fields";

/** Email + password sign-up with a strength hint (min 10 chars — Part 6.1). */
export function SignupForm() {
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string>();
  const [pw, setPw] = useState("");

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-surface-alt p-6 text-sm text-ink-70">
        Sign-up isn&apos;t connected in this environment. Add your Supabase keys to enable accounts.
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: { first_name: String(form.get("first_name") ?? "") },
      },
    });
    if (error) {
      setState("idle");
      setError("We couldn't create your account. Please try again.");
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return <p className="rounded-[var(--radius-card)] border border-gold bg-gold-pale p-4 text-sm">Check your email to confirm your account.</p>;
  }

  const strength = pw.length >= 14 ? "Strong" : pw.length >= 10 ? "Good" : "Too short";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="su-name">First name</Label>
        <Input id="su-name" name="first_name" autoComplete="given-name" />
      </div>
      <div>
        <Label htmlFor="su-email">Email</Label>
        <Input id="su-email" name="email" type="email" inputMode="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="su-pass">Password</Label>
        <Input id="su-pass" name="password" type="password" autoComplete="new-password" minLength={10} required value={pw} onChange={(e) => setPw(e.target.value)} />
        <p className="mt-1 text-xs text-ink-50">Strength: {strength} (minimum 10 characters)</p>
      </div>
      <FieldError message={error} />
      <Button type="submit" variant="primary" size="full" disabled={state === "loading"}>
        {state === "loading" ? "…" : "Create account"}
      </Button>
      <p className="text-sm text-ink-50">
        Already have an account? <Link href="/login" className="text-navy underline">Sign in</Link>
      </p>
    </form>
  );
}
