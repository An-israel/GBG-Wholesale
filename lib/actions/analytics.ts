"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * First-party event tracking (Part 16). Writes to `analytics_events` via the
 * insert-only RLS policy. TikTok attribution (ttclid + UTM) is captured on first
 * touch in a signed cookie and written onto orders at purchase — so the founder
 * can answer "how much revenue came from TikTok" from admin alone.
 */
export type TrackedEvent =
  | "page_view" | "product_view" | "add_to_cart" | "remove_from_cart" | "checkout_started"
  | "purchase" | "search" | "search_zero_results" | "filter_applied" | "journey_card_click"
  | "start_here_entry" | "article_read" | "article_cta_click" | "whatsapp_click"
  | "product_request_submitted" | "newsletter_signup" | "faq_helpful";

export async function trackEvent(
  eventName: TrackedEvent,
  properties: Record<string, unknown> = {},
  meta: { path?: string; sessionId?: string; ttclid?: string } = {}
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = await createClient();
    await supabase.from("analytics_events").insert({
      event_name: eventName,
      properties,
      path: meta.path,
      session_id: meta.sessionId,
      ttclid: meta.ttclid,
    });
  } catch {
    // Analytics must never break a user flow.
  }
}
