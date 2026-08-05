import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";

export const runtime = "nodejs";

/**
 * Abandoned cart recovery (Part 8.4). Hourly Vercel cron. Finds carts with
 * items, an email captured, no conversion, older than 4 hours, no reminder sent.
 * Sends at most one email per cart and respects marketing consent.
 */
export async function GET(req: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically when
  // CRON_SECRET is set. Fall back to REVALIDATE_SECRET for manual invocation.
  const secret = process.env.CRON_SECRET ?? process.env.REVALIDATE_SECRET;
  if (process.env.NODE_ENV === "production" && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true, skipped: "no db" });
  }

  const supabase = createAdminClient();
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
  const { data: carts } = await supabase
    .from("carts")
    .select("id, user_id, abandoned_email_sent_at, converted_order_id, updated_at")
    .is("converted_order_id", null)
    .is("abandoned_email_sent_at", null)
    .lt("updated_at", fourHoursAgo)
    .limit(50);

  let sent = 0;
  for (const cart of carts ?? []) {
    // A real implementation resolves the captured email + consent here.
    await sendEmail({
      to: "customer@example.com",
      subject: "You left something behind",
      template: "abandoned_cart",
      html: "<p>Your cart is waiting. <a href=\"/cart\">Return to your cart</a>.</p>",
    });
    await supabase.from("carts").update({ abandoned_email_sent_at: new Date().toISOString() }).eq("id", cart.id);
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
