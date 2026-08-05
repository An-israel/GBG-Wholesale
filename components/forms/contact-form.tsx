"use client";

import { useRef, useState } from "react";
import { submitContact } from "@/lib/actions/public";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FieldError } from "./fields";
import { whatsappLink, pageEnquiry } from "@/lib/utils/whatsapp";

const reasons = [
  { value: "order_issue", label: "A problem with my order" },
  { value: "product_question", label: "A question about a product" },
  { value: "wholesale_enquiry", label: "Wholesale / volume enquiry" },
  { value: "academy", label: "The Academy" },
  { value: "community_access", label: "Community / Hub access" },
  { value: "returns", label: "Returns" },
  { value: "press", label: "Press" },
  { value: "other", label: "Something else" },
] as const;

// High-intent reasons get the WhatsApp escalation (Part 11.10).
const highIntent = new Set(["wholesale_enquiry", "academy", "order_issue"]);

export function ContactForm({ whatsappNumber, defaultReason }: { whatsappNumber: string; defaultReason?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [reason, setReason] = useState(defaultReason ?? "product_question");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ts = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrors({});
    const form = new FormData(e.currentTarget);
    const res = await submitContact({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      reason,
      order_number: form.get("order_number"),
      message: form.get("message"),
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
        <p className="font-medium text-navy">Thanks — your message is with us.</p>
        <p className="mt-1 text-sm text-ink-70">We&apos;ll reply by email as soon as we can.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div>
        <Label htmlFor="c-reason">What&apos;s it about?</Label>
        <Select id="c-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
          {reasons.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-name">Your name</Label>
          <Input id="c-name" name="name" autoComplete="name" required />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" name="email" type="email" inputMode="email" autoComplete="email" required />
          <FieldError message={errors.email} />
        </div>
      </div>

      {/* Fields that change by reason */}
      {reason === "order_issue" && (
        <div>
          <Label htmlFor="c-order">Order number</Label>
          <Input id="c-order" name="order_number" placeholder="GBG-123456" />
        </div>
      )}
      {reason === "wholesale_enquiry" && (
        <div>
          <Label htmlFor="c-phone">Phone (optional)</Label>
          <Input id="c-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" />
        </div>
      )}
      {reason === "community_access" && (
        <p className="rounded-[var(--radius-card)] bg-surface-alt p-3 text-sm text-ink-70">
          Tip: the Hub unlocks automatically after your first order. Include the email you ordered with.
        </p>
      )}

      <div>
        <Label htmlFor="c-message">How can we help?</Label>
        <Textarea id="c-message" name="message" required />
        <FieldError message={errors.message} />
      </div>

      {errors._form && <FieldError message={errors._form} />}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={state === "loading"}>
          {state === "loading" ? "Sending…" : "Send message"}
        </Button>
        {highIntent.has(reason) && (
          <ButtonLink href={whatsappLink(whatsappNumber, pageEnquiry("Contact"))} variant="outline" data-analytics="whatsapp_click">
            Or message on WhatsApp
          </ButtonLink>
        )}
      </div>
    </form>
  );
}
