"use server";

import { headers } from "next/headers";
import { trackOrderSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/rate-limit";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "./result";

export type TrackedOrder = {
  order_number: string;
  status: string;
  fulfilment_status: string;
  total_pence: number;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  created_at: string;
};

/**
 * Guest order lookup (Part 5). Requires order number + matching email, resolved
 * by the `lookup_order` security-definer function, and rate limited to 5
 * attempts per IP per 10 minutes. No anonymous orders select policy exists.
 */
export async function trackOrder(input: unknown): Promise<ActionResult<TrackedOrder>> {
  const parsed = trackOrderSchema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Enter your order number and the email on the order.");

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const { ok: allowed } = await rateLimit(`track:${ip}`, 5, 60 * 10);
  if (!allowed) return fail("rate_limited", "Too many attempts. Please wait a few minutes and try again.");

  if (!isSupabaseConfigured) {
    return fail("not_found", "We couldn't find that order. Check the number and email, or contact support.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lookup_order", {
    p_order_number: parsed.data.order_number.trim(),
    p_email: parsed.data.email.trim(),
  });
  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    // Generic message — never reveal whether the order or email exists.
    return fail("not_found", "We couldn't find that order. Check the number and email, or contact support.");
  }
  const row = (Array.isArray(data) ? data[0] : data) as TrackedOrder;
  return ok(row);
}
