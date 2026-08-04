import * as React from "react";
import { cn } from "@/lib/utils/cn";

const base =
  "w-full rounded-[var(--radius-input)] border border-line bg-surface px-3 py-2.5 text-ink placeholder:text-ink-50 focus-visible:border-gold min-h-[44px]";

export function Label({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
  // Labels are always visible, never placeholder-only (Part 19 accessibility).
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-sm font-medium text-ink", className)}>
      {children}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(base, className)} {...props} />
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(base, "min-h-[120px] py-2", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(base, className)} {...props}>
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  // Errors described in text, not by colour alone (Part 19).
  return (
    <p className="mt-1 text-sm text-danger" role="alert">
      <span aria-hidden>⚠ </span>
      {message}
    </p>
  );
}

/** Hidden honeypot + render-timestamp fields for anti-spam. */
export function AntiSpamFields() {
  return (
    <>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <input type="hidden" name="_ts" defaultValue={Date.now()} />
    </>
  );
}
