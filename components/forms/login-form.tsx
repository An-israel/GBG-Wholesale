"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "./fields";

/**
 * Email + password sign-in with a magic-link fallback. Auth errors are always
 * generic — we never reveal whether an email exists (Part 6.1).
 */
export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string>();

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-surface-alt p-6 text-sm text-ink-70">
        Authentication isn&apos;t connected in this environment. Add your Supabase keys to enable
        sign-in.
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const supabase = createClient();

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}${next}` } });
      if (error) setError("We couldn't send the link. Please try again.");
      else setState("sent");
      return;
    }

    const password = String(form.get("password"));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState("idle");
      setError("Those details don't match. Please try again."); // generic
    } else {
      window.location.href = next;
    }
  }

  if (state === "sent") {
    return <p className="rounded-[var(--radius-card)] border border-gold bg-gold-pale p-4 text-sm">Check your email for a sign-in link.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="l-email">Email</Label>
        <Input id="l-email" name="email" type="email" inputMode="email" autoComplete="email" required />
      </div>
      {mode === "password" && (
        <div>
          <Label htmlFor="l-pass">Password</Label>
          <Input id="l-pass" name="password" type="password" autoComplete="current-password" minLength={10} required />
        </div>
      )}
      <FieldError message={error} />
      <Button type="submit" variant="primary" size="full" disabled={state === "loading"}>
        {state === "loading" ? "…" : mode === "password" ? "Sign in" : "Send magic link"}
      </Button>
      <div className="flex justify-between text-sm">
        <button type="button" className="text-navy underline" onClick={() => setMode(mode === "password" ? "magic" : "password")}>
          {mode === "password" ? "Use a magic link" : "Use a password"}
        </button>
        <Link href="/signup" className="text-navy underline">Create an account</Link>
      </div>
    </form>
  );
}
