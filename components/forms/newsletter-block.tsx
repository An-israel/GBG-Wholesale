"use client";

import { useState, useRef } from "react";
import { subscribeNewsletter } from "@/lib/actions/public";
import { Button } from "@/components/ui/button";
import { Input, FieldError } from "./fields";
import { cn } from "@/lib/utils/cn";

export function NewsletterBlock({ variant = "block", source }: { variant?: "block" | "footer"; source?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string>();
  const ts = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const res = await subscribeNewsletter({
      email: form.get("email"),
      source: source ?? variant,
      website: form.get("website"),
      _ts: ts.current,
    });
    if (res.ok) setState("done");
    else {
      setState("error");
      setError(res.error.message);
    }
  }

  if (state === "done") {
    return (
      <p className={cn("mt-4 text-sm", variant === "footer" ? "text-cream/80" : "text-profit")}>
        Thank you — please check your inbox to confirm.
      </p>
    );
  }

  const dark = variant === "footer";

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <label htmlFor={`nl-${variant}`} className={cn("mb-1.5 block text-sm font-medium", dark ? "text-cream/80" : "text-ink")}>
        Get restock alerts and beginner guides
      </label>
      <div className="flex gap-2">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <Input
          id={`nl-${variant}`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@email.com"
          className={dark ? "border-cream/20 bg-cream/10 text-cream placeholder:text-cream/50" : ""}
        />
        <Button type="submit" variant={dark ? "gold" : "primary"} disabled={state === "loading"}>
          {state === "loading" ? "…" : "Join"}
        </Button>
      </div>
      <FieldError message={error} />
    </form>
  );
}
